import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractCatalogProduct, getOperator, loadCatalog, refreshCatalog } from '../src/catalog.js';

const captured = '2026-10-03T20:00:00Z';

test('SOE extraction stays within its product section and ignores neighboring prices', () => {
  const target = getOperator('seward-ocean-excursions-half-day');
  const html = `<h3>Other tour</h3><p>Cost: $999/person</p><h3>${target.name}</h3><a href="${target.bookingUrl.replace('&', '&amp;')}">Book</a><p>Cost: $199/person</p><p>Trip Length: 3.5 hours</p><h3>Another tour</h3><p>Cost: $399/person</p>`;
  const product = extractCatalogProduct(target, html, captured);
  assert.equal(product.priceText, 'Cost: $199/person');
  assert.equal(product.durationText, 'Trip Length: 3.5 hours');
  assert.equal(product.bookingUrl, target.bookingUrl);
  assert.equal(product.checkedAt, captured);
  assert.equal(product.calendarSupported, true);
  assert.equal('seatsRemaining' in product, false);
});

test('primary kayak booking section excludes related product cards', () => {
  const target = getOperator('kayak-adventures-resurrection-bay');
  const html = `<main><h1>${target.name}</h1><div class="related"><div class="acf-text price">$999</div></div><div id="book-container"><div class="acf-text price">$149</div><div class="acf-text price_label">per person</div><a href="${target.bookingUrl}">Book</a></div></main>`;
  assert.equal(extractCatalogProduct(target, html, captured).priceText, '$149 per person');
  assert.throws(() => extractCatalogProduct(target, html.replace(target.name, 'Different tour'), captured), /heading/);
  assert.throws(() => extractCatalogProduct(target, html.replace('122343', '999999'), captured), /booking link/);
});

test('missing price stays unknown, and scripts cannot supply booking evidence', () => {
  const target = getOperator('kayak-adventures-resurrection-bay');
  const html = `<main><h1>${target.name}</h1><div id="book-container"><a href="${target.bookingUrl}">Book</a></div></main>`;
  assert.equal(extractCatalogProduct(target, html, captured).priceText, null);
  assert.throws(() => extractCatalogProduct(target, html.replace('<a ', '<script><a ').replace('</a>', '</a></script>'), captured), /booking link/);
});

test('a catalog read preserves the separate duration review and its schedule basis', () => {
  const target = getOperator('kayak-adventures-resurrection-bay');
  const html = `<main><h1>${target.name}</h1><div id="book-container"><div class="acf-text price">$149</div><a href="${target.bookingUrl}">Book</a></div></main>`;
  const product = extractCatalogProduct(target, html, captured);
  assert.equal(product.durationText, 'Half Day');
  assert.equal(product.durationLabel, '4 hours (scheduled)');
  assert.equal(product.durationMinutesMin, 240);
  assert.equal(product.durationMinutesMax, 240);
  assert.equal(product.durationBasis, 'schedule');
  assert.equal(product.detailsCheckedAt, target.reviewedDetails.detailsCheckedAt);
  assert.notEqual(product.detailsCheckedAt, product.checkedAt);
  assert.match(product.durationEvidence, /paddling time, not the whole tour/);
});

test('day labels and conflicting schedules do not create numeric durations', () => {
  for (const id of ['millers-landing-halibut', 'sunny-cove-resurrection-bay']) {
    const details = getOperator(id).reviewedDetails;
    assert.equal(details.durationMinutesMin, null);
    assert.equal(details.durationMinutesMax, null);
    assert.match(details.durationLabel, /day/i);
  }
});

test('a failed refresh preserves successful data and checkedAt, reports attempt separately, and bounds concurrency', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'seward-catalog-'));
  const cachePath = join(directory, 'catalog.json');
  const old = { id: 'seward-ocean-excursions-half-day', name: 'Previously verified', priceText: '$199', durationText: '3.5 hours', checkedAt: captured, fetchStatus: 'ok', calendarSupported: true };
  await writeFile(cachePath, JSON.stringify({ products: [old], refreshedAt: captured, notice: 'test' }));
  let active = 0; let maximum = 0; let attempts = 0;
  const fetchImpl = async (url, options) => {
    attempts++; active++; maximum = Math.max(maximum, active);
    assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'error');
    assert.equal(new URL(url).hostname === 'fareharbor.com', false);
    await new Promise(resolve => setTimeout(resolve, 5));
    active--;
    return new Response('unavailable', { status: 503 });
  };
  try {
    const result = await refreshCatalog({ fetchImpl, clock: () => Date.parse('2026-10-04T20:00:00Z'), cachePath });
    assert.equal(attempts, 6); assert.equal(maximum, 2);
    const failed = result.products.find(item => item.id === old.id);
    assert.equal(failed.priceText, old.priceText); assert.equal(failed.checkedAt, captured);
    assert.equal(failed.lastAttemptAt, '2026-10-04T20:00:00.000Z');
    assert.equal(failed.fetchStatus, 'error'); assert.match(failed.error, /503/);
    assert.deepEqual(JSON.parse(await readFile(cachePath, 'utf8')), result);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('missing cache is unverified metadata with null scraped values', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'seward-catalog-empty-'));
  try {
    const result = await loadCatalog({ cachePath: join(directory, 'missing.json') });
    assert.equal(result.refreshedAt, null);
    assert.ok(result.products.filter(item => item.listingType === 'tour').every(item => item.checkedAt === null && item.priceText === null && item.fetchStatus === 'error'));
    const reviewed = result.products.filter(item => item.sourceMode === 'website-review');
    assert.equal(reviewed.length, 6);
    assert.ok(reviewed.every(item => item.checkedAt && item.calendarSupported === false));
    const target = getOperator('millers-landing-halibut'); target.sourceUrl = 'https://example.com/changed';
    assert.notEqual(getOperator('millers-landing-halibut').sourceUrl, target.sourceUrl);
    assert.equal(getOperator('not-a-target'), undefined);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('lodging and transportation stay source-reviewed without fresh inventory claims', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'seward-vendors-'));
  const cachePath = join(directory, 'catalog.json');
  try {
    const before = await loadCatalog({ cachePath });
    const vendors = before.products.filter(item => item.sourceMode === 'website-review');
    const lodging = vendors.filter(item => item.listingType === 'lodging');
    assert.equal(lodging.length, 3);
    assert.ok(lodging.every(item => item.priceText === null && item.durationMinutesMin === null && item.bookingAction === 'rates'));
    const taxi = getOperator('pjs-taxi-seward');
    assert.equal(taxi.priceText, null);
    assert.equal(taxi.durationMinutesMin, null);
    assert.equal(taxi.bookingAction, 'contact');
    let requests = 0;
    const after = await refreshCatalog({ cachePath, clock: () => Date.parse('2026-10-05T20:00:00Z'), fetchImpl: async url => {
      requests++;
      assert.ok(!vendors.some(item => item.sourceUrl === url));
      return new Response('offline', { status: 503 });
    } });
    assert.equal(requests, 6);
    assert.equal(after.products.length, 12);
    assert.equal(new Set(after.products.map(item => item.id)).size, 12);
    assert.deepEqual(after.products.filter(item => item.sourceMode === 'website-review'), vendors);
    assert.ok(vendors.every(item => item.inventoryUnit === null && item.calendarSupported === false && !item.availability));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
