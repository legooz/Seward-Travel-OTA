import { readFileSync } from 'node:fs';
import { readFile, mkdir, writeFile, rename, unlink } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const TARGETS = JSON.parse(readFileSync(new URL('../data/operators.json', import.meta.url), 'utf8'));
const REVIEWED_VENDORS = JSON.parse(readFileSync(new URL('../data/vendors.json', import.meta.url), 'utf8'));
const CACHE_PATH = fileURLToPath(new URL('../data/catalog.json', import.meta.url));
const MAX_HTML_BYTES = 3 * 1024 * 1024;
const NOTICE = 'Published provider information, not live quotes or inventory. Confirm dates, final prices, room availability, transfers, and booking terms directly with each provider.';
let refreshInProgress;

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const short = value => { const text = clean(value); return text && text.length <= 450 ? text : null; };

export function getOperator(id) {
  const target = TARGETS.find(item => item.id === id) ?? REVIEWED_VENDORS.find(item => item.id === id);
  return target ? structuredClone(target) : undefined;
}

function withReviewedVendors(products) {
  // These directory entries were reviewed on their official websites. The tour
  // scraper does not query hotel rates or transportation inventory, and a tour
  // refresh must not renew these entries' source observation timestamps.
  const ids = new Set(REVIEWED_VENDORS.map(item => item.id));
  return [...products.filter(item => !ids.has(item.id)), ...structuredClone(REVIEWED_VENDORS)];
}

function platformFor(url) {
  if (url.protocol !== 'https:' || url.username || url.password) return null;
  if (url.hostname === 'fareharbor.com') return 'fareharbor';
  if (url.hostname.endsWith('.rezdy.com')) return 'rezdy';
  if (url.hostname.endsWith('.app.resmarksystems.com')) return 'resmark';
  if (url.hostname === 'checkout.xola.com' || url.hostname.endsWith('.xola.com')) return 'xola';
  return null;
}

function sameBookingProduct(actual, target) {
  const expected = new URL(target.bookingUrl);
  if (platformFor(actual) !== target.platform || actual.origin !== expected.origin) return false;
  if (target.platform === 'fareharbor') {
    const prefix = `/embeds/book/${target.providerCompany}/items/${target.providerItemId}/`;
    return actual.pathname === prefix || actual.pathname === `${prefix}calendar/`;
  }
  return actual.pathname.replace(/\/$/, '') === expected.pathname.replace(/\/$/, '');
}

function productBookingLink($, scope, target) {
  const matches = [];
  scope.find('a[href]').add(scope.filter('a[href]')).each((_, element) => {
    try {
      // Cheerio decodes both named and numeric HTML entities in attributes.
      const url = new URL($(element).attr('href'), target.sourceUrl);
      if (sameBookingProduct(url, target)) matches.push(url.href);
    } catch { /* An unrelated malformed link is not a product booking link. */ }
  });
  if (!matches.length) throw new Error('Expected product booking link was not found in the primary product section');
  return matches[0];
}

function primaryHeading($, target) {
  const heading = $('main h1').first().length ? $('main h1').first() : $('h1').first();
  if (!clean(heading.text()).includes(target.extraction.titleContains)) throw new Error('Primary product heading changed or does not match the configured product');
  return heading;
}

/** Pure extraction from one allowlisted product's public HTML; never infers seats. */
export function extractCatalogProduct(target, html, checkedAt) {
  const $ = load(html);
  $('script,style,noscript,template').remove();
  let scope; let name; let priceText = null; let durationText = null;
  const rule = target.extraction;
  if (rule.adapter === 'soe-section') {
    const headings = $('h3').filter((_, e) => clean($(e).text()) === rule.titleContains);
    if (headings.length !== 1) throw new Error('Expected a unique tour heading');
    name = clean(headings.text());
    scope = headings.nextUntil('h3').add(headings);
    const paragraphs = scope.filter('p').add(scope.find('p'));
    priceText = short(paragraphs.filter((_, e) => /^Cost:\s*\$/.test(clean($(e).text()))).first().text());
    durationText = short(paragraphs.filter((_, e) => /^Trip Length:/.test(clean($(e).text()))).first().text());
  } else {
    const heading = primaryHeading($, target);
    name = clean(heading.text());
    scope = $('main').first().length ? $('main').first() : $('body');
    if (rule.adapter === 'fareharbor-wordpress') {
      const priceRow = scope.find('.activity-customer-types-prices .customer-type').filter((_, e) => clean($(e).find('.customer-type-label h3').text()) === rule.priceLabel).first();
      const amount = short(priceRow.find('.customer-type-standard-price').text());
      const label = short(priceRow.find('.customer-type-label').text());
      priceText = amount ? `${amount}${label ? ` — ${label}` : ''}` : null;
      const detail = scope.find('.quick-details-content').filter((_, e) => clean($(e).find('.label').first().text()) === rule.durationLabel).first();
      durationText = short(detail.text());
    } else if (rule.adapter === 'kayak-book') {
      scope = $('#book-container');
      if (scope.length !== 1) throw new Error('Primary booking section is missing or ambiguous');
      const price = short(scope.find('.acf-text.price').first().text());
      const label = short(scope.find('.acf-text.price_label').first().text());
      priceText = price ? `${price}${label ? ` ${label}` : ''}` : null;
      durationText = name.match(/Half Day/i)?.[0] ?? null;
    } else if (rule.adapter === 'helicopter-details') {
      const paragraphs = scope.find('p.details-table-end');
      const adultPrice = clean(paragraphs.filter((_, e) => /^\$[\d,.]+ per adult/.test(clean($(e).text()))).first().text());
      priceText = short(adultPrice.split(/\$[\d,.]+ for an Adult/i)[0]);
      const duration = clean(paragraphs.filter((_, e) => /^This excursion lasts approximately/.test(clean($(e).text()))).first().text());
      durationText = short(duration.match(/^.*?minutes\./)?.[0]);
    } else if (rule.adapter === 'sunny-details') {
      const blocks = scope.find('p').filter((_, e) => /from \$[\d,.]+ per person/i.test(clean($(e).text())) && /20\d{2}/.test(clean($(e).text())));
      if (blocks.length > 1) throw new Error('Primary price/schedule block became ambiguous');
      const text = clean(blocks.first().text());
      priceText = short(text.match(/from \$[\d,.]+ per person[^$]*$/i)?.[0]);
      durationText = name.match(/Half-Day/i)?.[0] ?? null;
    } else throw new Error('Unknown catalog extraction adapter');
  }
  const bookingUrl = productBookingLink($, scope, target);
  return {
    // Editorial summaries and duration normalization have their own review date.
    // A price refresh must not claim these details were reviewed again.
    ...target.reviewedDetails,
    id: target.id, operator: target.operator, name, category: target.category, listingType: 'tour',
    platform: target.platform, sourceUrl: target.sourceUrl, bookingUrl,
    priceText, durationText, priceCaveat: target.priceCaveat,
    inventoryUnit: target.inventoryUnit ?? null,
    checkedAt, lastAttemptAt: checkedAt, fetchStatus: 'ok',
    calendarSupported: target.platform === 'fareharbor' && Boolean(target.providerCompany && target.providerItemId),
  };
}

function emptyProduct(target) {
  return {
    ...target.reviewedDetails,
    id: target.id, operator: target.operator, name: target.name, category: target.category, listingType: 'tour',
    platform: target.platform, sourceUrl: target.sourceUrl, bookingUrl: target.bookingUrl,
    priceText: null, durationText: null, priceCaveat: target.priceCaveat,
    inventoryUnit: target.inventoryUnit ?? null, checkedAt: null, lastAttemptAt: null,
    fetchStatus: 'error', error: 'This public page has not been successfully refreshed yet',
    calendarSupported: false,
  };
}

export async function loadCatalog({ cachePath = CACHE_PATH } = {}) {
  try {
    const value = JSON.parse(await readFile(cachePath, 'utf8'));
    if (!Array.isArray(value.products)) throw new Error('Catalog cache has no products array');
    return { ...value, products: withReviewedVendors(value.products) };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { products: withReviewedVendors(TARGETS.map(emptyProduct)), refreshedAt: null, notice: NOTICE };
  }
}

async function fetchPublicHtml(target, fetchImpl) {
  // Only static, checked-in source URLs may be requested. Redirects are refused.
  if (!TARGETS.some(item => item.id === target.id && item.sourceUrl === target.sourceUrl)) throw new Error('Source URL is not allowlisted');
  const response = await fetchImpl(target.sourceUrl, {
    method: 'GET', redirect: 'error', signal: AbortSignal.timeout(15_000),
    headers: { 'Accept': 'text/html', 'User-Agent': 'SewardTravelOTA-CatalogDemo/0.1' },
  });
  if (!response.ok) throw new Error(`Public page returned HTTP ${response.status}`);
  if (!/text\/html|application\/xhtml\+xml/i.test(response.headers.get('content-type') ?? '')) throw new Error('Public page did not return HTML');
  const reader = response.body?.getReader();
  if (!reader) throw new Error('Public page has no readable body');
  let bytes = 0; const chunks = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_HTML_BYTES) { await reader.cancel(); throw new Error('Public HTML exceeds the 3 MiB limit'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString('utf8');
}

async function performRefresh({ fetchImpl = fetch, clock = Date.now, cachePath = CACHE_PATH } = {}) {
  const previous = await loadCatalog({ cachePath });
  const products = new Array(TARGETS.length);
  let next = 0;
  async function worker() {
    while (next < TARGETS.length) {
      const index = next++; const target = TARGETS[index];
      // Use request start as a conservative observation time, not refresh completion.
      const checkedAt = new Date(clock()).toISOString();
      try {
        const html = await fetchPublicHtml(target, fetchImpl);
        products[index] = extractCatalogProduct(target, html, checkedAt);
      } catch (error) {
        const old = previous.products.find(item => item.id === target.id) ?? emptyProduct(target);
        products[index] = { ...old, fetchStatus: 'error', lastAttemptAt: checkedAt, error: String(error.message).slice(0,300) };
      }
    }
  }
  await Promise.all([worker(), worker()]);
  const catalog = { products: withReviewedVendors(products), refreshedAt: new Date(clock()).toISOString(), notice: NOTICE };
  await mkdir(dirname(cachePath), { recursive: true });
  const temporary = `${cachePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(catalog, null, 2)}\n`, { flag: 'wx' });
    await rename(temporary, cachePath);
  } catch (error) { await unlink(temporary).catch(() => {}); throw error; }
  return catalog;
}

export async function refreshCatalog(options) {
  // Default callers share one refresh; repeated UI requests do not fan out fetches.
  if (options) return performRefresh(options);
  if (!refreshInProgress) refreshInProgress = performRefresh().finally(() => { refreshInProgress = undefined; });
  return refreshInProgress;
}
