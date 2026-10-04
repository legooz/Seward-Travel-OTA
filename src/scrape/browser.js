import { InputError, nullableHttpsUrl } from '../validation.js';
import { buildObservation } from './evidence.js';

export function validateConfig(config) {
  if (!config || typeof config !== 'object') throw new InputError('A scraper configuration is required');
  const pageUrl = nullableHttpsUrl(config.pageUrl, 'pageUrl');
  if (!pageUrl) throw new InputError('Set pageUrl to the approved FareHarbor booking page');
  const host = new URL(pageUrl).hostname;
  if (host !== 'fareharbor.com' && !host.endsWith('.fareharbor.com')) {
    throw new InputError('The live collector only accepts FareHarbor HTTPS pages');
  }
  if (!config.product?.id || !config.product?.name) throw new InputError('Configure product.id and product.name');
  const selectors = config.selectors;
  for (const key of ['ready', 'departure', 'time', 'evidence']) {
    if (typeof selectors?.[key] !== 'string' || !selectors[key].trim()) throw new InputError(`Configure selectors.${key}`);
  }
  if (selectors.price !== undefined && (typeof selectors.price !== 'string' || !selectors.price.trim())) throw new InputError('selectors.price must be a nonempty selector');
  if (config.frameSelector !== undefined && (typeof config.frameSelector !== 'string' || !config.frameSelector.trim())) throw new InputError('frameSelector must be a nonempty selector');
  if (!Number.isInteger(config.ttlSeconds) || config.ttlSeconds < 1 || config.ttlSeconds > 900) throw new InputError('ttlSeconds must be an integer from 1 to 900');
  return { ...config, pageUrl };
}

async function oneVisibleText(container, selector, label, required) {
  const elements = container.locator(selector);
  const count = await elements.count();
  const visible = [];
  for (let index = 0; index < count; index++) {
    const element = elements.nth(index);
    if (await element.isVisible()) visible.push(element);
  }
  if (visible.length > 1 || (required && visible.length !== 1)) {
    throw new Error(`${label} selector must identify exactly one visible element per departure`);
  }
  return visible.length ? (await visible[0].innerText()).trim() : '';
}

// No navigation clicks, form entry, quantity probing, or checkout actions.
// Selectors are operator/page-specific and must be verified before use.
export async function collectPage(page, input, now = () => Date.now()) {
  const config = validateConfig(input);
  const response = await page.goto(config.pageUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  if (!response || !response.ok()) throw new Error(`Page fetch failed (${response?.status() ?? 'no response'})`);
  const finalUrl = new URL(page.url());
  const expectedUrl = new URL(config.pageUrl);
  if (finalUrl.origin !== expectedUrl.origin || finalUrl.pathname !== expectedUrl.pathname || finalUrl.search !== expectedUrl.search || /\/(login|signin|checkout)(\/|$)/i.test(finalUrl.pathname)) {
    throw new Error('Unexpected redirect; review the target URL before retrying');
  }
  const bodyText = await page.locator('body').innerText({ timeout: 10_000 });
  if (/verify you are human|access denied|too many requests|captcha|checking your browser/i.test(bodyText)) {
    throw new Error('Access challenge or rate limit detected; collector stopped');
  }
  const scope = config.frameSelector ? page.frameLocator(config.frameSelector) : page;
  await scope.locator(config.selectors.ready).waitFor({ state: 'visible', timeout: 15_000 });
  // Use the start of the batch, so slow extraction cannot renew early evidence.
  const observedAt = new Date(now()).toISOString();
  const containers = scope.locator(config.selectors.departure);
  const count = await containers.count();
  if (count === 0 || count > 100) throw new Error('Expected 1–100 departure rows; missing rows are not sold-out inventory');
  const rows = [];
  for (let index = 0; index < count; index++) {
    const container = containers.nth(index);
    if (!(await container.isVisible())) continue;
    const times = container.locator(config.selectors.time);
    if (await times.count() !== 1 || !(await times.isVisible())) throw new Error('Each visible departure needs one visible timestamp element');
    const startAt = await times.getAttribute('datetime');
    const evidenceText = await oneVisibleText(container, config.selectors.evidence, 'Evidence', true);
    const priceText = config.selectors.price ? (await oneVisibleText(container, config.selectors.price, 'Price', false) || undefined) : undefined;
    if (await times.getAttribute('datetime') !== startAt) throw new Error('Departure changed while reading; discard this observation');
    rows.push({ id: `${config.product.id}:${startAt}`, startAt, evidenceText, ...(priceText === undefined ? {} : { priceText }) });
  }
  if (await containers.count() !== count) throw new Error('Departure list changed while reading; discard this observation');
  return buildObservation({
    product: config.product, sourceUrl: finalUrl.href,
    observedAt, ttlSeconds: config.ttlSeconds, rows,
  });
}

export async function scrapeFareHarbor(input) {
  const config = validateConfig(input);
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch { throw new Error('Install the optional collector dependencies with npm ci, then run npx playwright install chromium'); }
  const browser = await chromium.launch({ headless: true });
  const deadline = setTimeout(() => { void browser.close().catch(() => {}); }, 60_000);
  deadline.unref();
  try {
    const context = await browser.newContext({ serviceWorkers: 'block', acceptDownloads: false });
    // Block write methods and unnecessary media. Some pages may consequently
    // fail to render; report failure rather than loosening this automatically.
    await context.route('**/*', async route => {
      const request = route.request();
      if (!['GET', 'HEAD'].includes(request.method()) || ['image', 'media', 'font'].includes(request.resourceType())) return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    return await collectPage(page, config);
  } finally {
    clearTimeout(deadline);
    await browser.close();
  }
}
