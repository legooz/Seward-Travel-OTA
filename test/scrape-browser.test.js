import test from 'node:test';
import assert from 'node:assert/strict';
import { collectPage, validateConfig } from '../src/scrape/browser.js';

const config = {
  pageUrl: 'https://fareharbor.com/test-fixture-only/',
  product: { id: 'fixture', name: 'Simulated browser fixture', bookingUrl: null },
  ttlSeconds: 300,
  selectors: { ready: '.ready', departure: '.departure', time: 'time', evidence: '.evidence', price: '.price' },
};

// Small page double: these tests do not launch a browser or contact FareHarbor.
function elements(items) {
  return {
    count: async () => items.length,
    nth: index => elements([items[index]]),
    isVisible: async () => items[0]?.visible !== false,
    innerText: async () => items[0].text,
    getAttribute: async () => items[0].datetime,
    waitFor: async () => {},
    locator: selector => items[0].children[selector] ?? elements([]),
  };
}

function departure(text, hour = '12', visible = true) {
  return {
    visible,
    children: {
      time: elements([{ datetime: `2090-06-15T${hour}:00:00-08:00` }]),
      '.evidence': elements([{ text }]),
    },
  };
}

function page(rows, options = {}) {
  return {
    goto: async () => ({ ok: () => !options.failed, status: () => options.failed ? 429 : 200 }),
    url: () => options.redirect ?? config.pageUrl,
    locator: selector => ({
      body: elements([{ text: options.body ?? 'Fixture tour departures' }]),
      '.ready': elements([{}]),
      '.departure': elements(rows),
    })[selector],
  };
}

test('collector binds visible evidence to its own departure and ignores hidden rows', async () => {
  const result = await collectPage(page([
    departure('6 seats remaining', '09'), departure('Sold out', '12'), departure('99 seats remaining', '15', false),
  ]), config);
  assert.equal(result.feed.availability.length, 2);
  assert.equal(result.feed.availability[0].seatsRemaining, 6);
  assert.equal(result.feed.availability[0].bookable, null);
  assert.equal(result.feed.availability[1].seatsRemaining, null);
  assert.equal(result.feed.availability[1].bookable, false);
  assert.equal(result.evidence[0].priceText, undefined);
});

test('collector fails on access challenges, fetch errors and unexpected redirects', async () => {
  for (const options of [
    { body: 'Please verify you are human' }, { failed: true },
    { redirect: 'https://example.com/login' },
    { redirect: 'https://fareharbor.com/checkout/' },
    { redirect: 'https://fareharbor.com/different-tour/' },
    { redirect: `${config.pageUrl}?date=2090-06-16` },
  ]) await assert.rejects(collectPage(page([departure('6 seats remaining')], options), config));
});

test('slow collection preserves capture start instead of renewing early evidence', async () => {
  let time = Date.now() - 10_000;
  const startedAt = time;
  const row = departure('6 seats remaining');
  row.children['.evidence'].nth = () => ({
    isVisible: async () => true,
    innerText: async () => { time += 5000; return '6 seats remaining'; },
  });
  const result = await collectPage(page([row]), { ...config, ttlSeconds: 1 }, () => time);
  assert.equal(Date.parse(result.feed.availability[0].observedAt), startedAt);
  assert.equal(Date.parse(result.feed.availability[0].expiresAt), startedAt + 1000);
});

test('missing, hidden-only, ambiguous or undated departures cannot create successful inventory', async () => {
  await assert.rejects(collectPage(page([]), config), /Expected/);
  await assert.rejects(collectPage(page([departure('6 seats remaining', '12', false)]), config), /rows/);
  const ambiguous = departure('6 seats remaining');
  ambiguous.children['.evidence'] = elements([{ text: '6 seats remaining' }, { text: '2 seats remaining' }]);
  await assert.rejects(collectPage(page([ambiguous]), config), /exactly one/);
  const undated = departure('6 seats remaining');
  undated.children.time = elements([{ datetime: '12:00' }]);
  await assert.rejects(collectPage(page([undated]), config), /timestamp/);
});

test('unconfigured or out-of-scope URLs fail before browser navigation', () => {
  for (const change of [
    { pageUrl: null }, { pageUrl: 'http://fareharbor.com/' },
    { pageUrl: 'https://fareharbor.com.example.com/' },
    { pageUrl: 'https://user:password@fareharbor.com/' },
    { selectors: { ...config.selectors, ready: '' } }, { ttlSeconds: 0 },
  ]) assert.throws(() => validateConfig({ ...config, ...change }));
});
