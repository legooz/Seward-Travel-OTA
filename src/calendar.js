import { readFile, writeFile, rename } from 'node:fs/promises';
import { getOperator } from './catalog.js';
import { InputError, parseDate } from './validation.js';

const observationFile = new URL('../data/calendar-observations.json', import.meta.url);
const TTL = 5 * 60_000;
const attempts = new Map();
let queue = Promise.resolve();

export async function loadCalendarObservations() {
  try { return JSON.parse(await readFile(observationFile, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return {}; throw error; }
}

/** Only an explicit person-inventory phrase establishes a numeric count. */
export function interpretDeparture({ id, time, label, evidenceText }) {
  const lines = evidenceText.split(/\n/).map(line => line.trim()).filter(Boolean);
  const privateSale = /private|boat|buy all/i.test(label);
  const contradictory = /sold out|not available|unavailable|call to book|cancelled/i.test(evidenceText);
  const counts = lines.map(line => /^(?:Only\s+)?(\d+)\s+(?:seats?|spots?|spaces?|people|persons?)\s+(?:remaining|left|available)[!.]?$/i.exec(line))
    .filter(Boolean).map(match => Number(match[1]));
  const remaining = !privateSale && !contradictory && counts.length === 1 && Number.isSafeInteger(counts[0]) ? counts[0] : null;
  return {
    id, time, label, remaining, unit: remaining === null ? 'unknown' : 'people', evidenceText,
  };
}

export function calendarUrl(product) {
  if (product.platform !== 'fareharbor' || !/^[a-z0-9-]+$/i.test(product.providerCompany ?? '') || !/^\d+$/.test(product.providerItemId ?? '')) {
    throw new InputError('This product does not have a supported public calendar');
  }
  const url = new URL(product.bookingUrl);
  if (url.protocol !== 'https:' || url.hostname !== 'fareharbor.com' || url.username || url.password || url.port) throw new InputError('Unapproved booking URL');
  url.pathname = `/embeds/book/${product.providerCompany}/items/${product.providerItemId}/calendar/`;
  return url.href;
}

export function isCalendarNavigation(urlString, product) {
  const url = new URL(urlString);
  const path = `/embeds/book/${product.providerCompany}/items/${product.providerItemId}/calendar/`;
  return url.origin === 'https://fareharbor.com' && (url.pathname === path || new RegExp(`^${path}\\d{4}/\\d{2}/$`).test(url.pathname));
}

/** Isolated, read-only public browser: month/day controls only; never opens checkout. */
export async function collectCalendar(product, date) {
  parseDate(date);
  const sourceUrl = calendarUrl(product);
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  const stop = setTimeout(() => browser.close().catch(() => {}), 60_000);
  try {
    const context = await browser.newContext({ viewport: { width: 1100, height: 850 }, locale: 'en-US' });
    await context.route('**/*', route => {
      const request = route.request();
      if (request.method() !== 'GET' || ['image', 'media', 'font'].includes(request.resourceType())) return route.abort();
      if (request.isNavigationRequest() && !isCalendarNavigation(request.url(), product)) return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(18_000);
    await page.goto(sourceUrl, { waitUntil: 'domcontentloaded' });
    const day = new Date(`${date}T12:00:00Z`);
    const year = date.slice(0, 4);
    const month = day.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    const dateLabel = day.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const yearSelect = page.getByRole('combobox', { name: 'Year', exact: true });
    const monthSelect = page.getByRole('combobox', { name: 'Month', exact: true });
    await yearSelect.selectOption({ label: year });
    await monthSelect.selectOption({ label: month });

    // The two FareHarbor generations expose different rendered calendar controls.
    const modern = page.locator(`.fh-calendar-day-text[title="${dateLabel}"]`);
    const oldDay = page.getByRole('button', { name: new RegExp(`^${dateLabel}\\s*$`) });
    const gridDay = page.locator(`.td:not(.month-other) .calendar-day-inner[data-day="${day.getUTCDate()}"]`);
    await modern.or(oldDay).or(gridDay).first().waitFor({ state: 'visible' });
    let rows;
    if (await modern.count()) {
      await modern.click();
      await page.locator('.selected-date').filter({ hasText: dateLabel }).waitFor();
      rows = page.locator('.availability-cell');
    } else if (await oldDay.count()) {
      if (!(await oldDay.isEnabled())) throw new Error('This date is not offered online; exact capacity is unknown.');
      await oldDay.click();
      await page.getByRole('heading', { name: dateLabel, exact: true }).waitFor();
      rows = page.locator('a[data-test-id="availabilities"]');
    } else {
      // The wide older calendar renders departures inside each day cell.
      await page.waitForURL(url => url.pathname.endsWith(`/calendar/${year}/${date.slice(5, 7)}/`));
      rows = gridDay.locator('a[data-test-id="availabilities"]');
    }
    await rows.first().waitFor({ state: 'visible' });
    if (!isCalendarNavigation(page.url(), product)) throw new Error('Calendar navigated outside its approved product');
    const checkedAt = new Date().toISOString();
    const captured = await rows.evaluateAll(elements => elements.filter(e => e.getClientRects().length).slice(0, 100).map(e => ({
      id: e.getAttribute('data-test-id')?.startsWith('availability-') ? e.getAttribute('data-test-id') : (e.getAttribute('href')?.match(/\/availability\/(\d+)\//)?.[1] ?? ''),
      time: (e.querySelector('.cb-time, .availability-cell__heading')?.textContent ?? '').trim(),
      label: e.innerText.trim(),
      evidenceText: [e.innerText.trim(), ...Array.from(e.querySelectorAll('.sr-only')).map(s => s.textContent.trim()).filter(text => !e.innerText.includes(text))].filter(Boolean).join('\n'),
    })));
    if (captured.length === 0 || captured.some(row => !row.id || !row.time)) throw new Error('Departure layout changed; no verified inventory was captured');
    const departures = captured.map(interpretDeparture);
    const exact = departures.filter(row => row.remaining !== null).length;
    return {
      status: 'observed', date, checkedAt, expiresAt: new Date(Date.parse(checkedAt) + TTL).toISOString(), sourceUrl: page.url(), departures,
      message: exact ? `${exact} departure(s) publish an explicit remaining-person count. Reconfirm at checkout.` : 'Real departures read from the public calendar. The source does not publish an exact remaining-seat count for these departures.',
    };
  } finally { clearTimeout(stop); await browser.close(); }
}

export async function checkCalendar(productId, date) {
  const product = getOperator(productId);
  if (!product) throw new InputError('Unknown productId');
  parseDate(date);
  calendarUrl(product);
  const key = `${productId}:${date}`;
  const previous = attempts.get(key);
  if (previous && Date.now() - previous.at < 60_000) return previous.promise;
  const promise = queue.then(async () => {
    let observation;
    try { observation = await collectCalendar(product, date); }
    catch (error) {
      const reason = error.message.split('\n')[0].replace(/\u001b\[[0-9;]*m/g, '').slice(0, 180);
      observation = { status: 'error', date, checkedAt: null, lastAttemptAt: new Date().toISOString(), departures: [], message: `Calendar could not be verified: ${reason}. Open the operator booking page or try again.` };
    }
    const observations = await loadCalendarObservations();
    observations[productId] = observation;
    const temporary = new URL(`${observationFile.href}.tmp`);
    await writeFile(temporary, `${JSON.stringify(observations, null, 2)}\n`);
    await rename(temporary, observationFile);
    return observation;
  });
  queue = promise.catch(() => {});
  attempts.set(key, { at: Date.now(), promise });
  for (const [oldKey, entry] of attempts) if (Date.now() - entry.at > 60_000) attempts.delete(oldKey);
  return promise;
}
