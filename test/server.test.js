import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { request as httpRequest } from 'node:http';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from '../src/server.js';

const clock = () => Date.parse('2027-06-15T18:00:00Z');

function services(overrides = {}) {
  return {
    catalogService: {
      loadCatalog: async () => ({ products: [{ id: 'real-tour', name: 'Source observation' }], isDemo: false }),
      refreshCatalog: async () => ({ products: [{ id: 'real-tour', name: 'Refreshed observation' }], isDemo: false }),
      getOperator: id => id === 'real-tour' ? { id } : undefined,
      ...overrides.catalogService,
    },
    calendarService: {
      loadCalendarObservations: async () => ({ 'real-tour': { status: 'unknown', seatsRemaining: null } }),
      checkCalendar: async () => ({ status: 'unknown', seatsRemaining: null }),
      ...overrides.calendarService,
    },
  };
}

const postJson = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

function rawStatus(url, options = {}) {
  return new Promise((resolve, reject) => {
    const request = httpRequest(url, options, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    });
    request.on('error', reject);
    request.end(options.body);
  });
}

async function serve(t, options = {}) {
  const server = createServer({ clock, ...options });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    const closed = new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    server.closeAllConnections();
    await closed;
  });
  return `http://127.0.0.1:${server.address().port}`;
}

test('HTTP API advertises demo mode and serves normalized synthetic inventory', async t => {
  const base = await serve(t);
  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).isDemo, true);
  const products = await (await fetch(`${base}/api/products`)).json();
  assert.equal(products.products.length, 3);
  const response = await fetch(`${base}/api/availability?date=2027-06-15&partySize=2`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.equal(body.partySize, 2);
  assert.equal(body.timeZone, 'America/Anchorage');
  assert.equal(body.departures[0].seatsRemaining, 6);
});

test('HTTP validation returns explicit errors without turning malformed queries into valid requests', async t => {
  const base = await serve(t);
  for (const query of [
    '', '?date=2027-02-29', '?date=2027-06-15&partySize=2x',
    '?date=2027-06-15&partySize=0', '?date=2027-06-15&partySize=101',
    '?date=2027-06-15&partySize=1&partySize=2',
    '?date=2027-06-15&date=2027-06-16', '?date=2027-06-15&currency=USD',
  ]) {
    const response = await fetch(`${base}/api/availability${query}`);
    assert.equal(response.status, 400, query);
    assert.equal((await response.json()).error.code, 'invalid_request');
  }
  assert.equal((await fetch(`${base}/api/availability?date=2027-06-15`, { method: 'POST' })).status, 405);
  assert.equal((await fetch(`${base}/missing`)).status, 404);
});

test('manual feed errors are unavailable, not empty successful inventory', async t => {
  const base = await serve(t, { mode: 'manual', feedPath: join(tmpdir(), 'nonexistent-seward-feed.json') });
  const response = await fetch(`${base}/api/availability?date=2027-06-15`);
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, 'feed_unavailable');
});

test('manual feed is re-read, validated, and becomes stale on expiry', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'seward-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const feedPath = join(directory, 'feed.json');
  const feed = {
    products: [{ id: 'operator-tour', name: 'Local feed test' }],
    availability: [{
      id: 'operator-slot', productId: 'operator-tour', startAt: '2027-06-15T20:00:00Z',
      seatsRemaining: null, bookable: true, checkedPartySize: 2,
      observedAt: '2027-06-15T17:59:00Z', expiresAt: '2027-06-15T18:01:00Z',
      sourceKind: 'operator_manual', evidenceUrl: null, bookingUrl: null,
    }],
  };
  await writeFile(feedPath, JSON.stringify(feed));
  const base = await serve(t, { mode: 'manual', feedPath });
  const path = `${base}/api/availability?date=2027-06-15&partySize=2`;
  const first = await (await fetch(path)).json();
  assert.equal(first.isDemo, false);
  assert.equal(first.departures[0].status, 'available');
  assert.equal(first.departures[0].seatsRemaining, null);
  feed.availability[0].expiresAt = '2027-06-15T18:00:00Z';
  await writeFile(feedPath, JSON.stringify(feed));
  const second = await (await fetch(path)).json();
  assert.equal(second.departures[0].status, 'stale');
  assert.equal(second.departures[0].bookable, null);
});

test('dashboard assets and observed catalog are routed without network access', async t => {
  const base = await serve(t, services());
  for (const [path, type] of [['/', 'text/html'], ['/app.js', 'text/javascript'], ['/style.css', 'text/css'], ['/images/seward-hero.jpg', 'image/jpeg']]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200, path);
    assert.ok(response.headers.get('content-type').startsWith(type));
    assert.ok((await response.text()).length > 0);
  }
  const response = await fetch(`${base}/api/catalog`);
  const catalog = await response.json();
  assert.equal(response.status, 200);
  assert.equal(catalog.isDemo, false);
  assert.deepEqual(catalog.products[0].availability, { status: 'unknown', seatsRemaining: null });
  assert.equal((await fetch(`${base}/api/catalog?url=https://example.com`)).status, 400);
  assert.equal((await fetch(`${base}/api/catalog/refresh`)).status, 405);
  assert.equal((await fetch(`${base}/api/calendar/check`)).status, 405);
  assert.equal((await fetch(`${base}/src/server.js`)).status, 404);
});

test('calendar checks use only known product IDs and exact dates', async t => {
  const calls = [];
  const base = await serve(t, services({ calendarService: {
    checkCalendar: async (...args) => { calls.push(args); return { status: 'observed', seatsRemaining: 4 }; },
  } }));
  const response = await fetch(`${base}/api/calendar/check`, postJson({ productId: 'real-tour', date: '2027-06-15' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { productId: 'real-tour', availability: { status: 'observed', seatsRemaining: 4 } });
  assert.deepEqual(calls, [['real-tour', '2027-06-15']]);
  for (const body of [
    {}, null, [], { productId: 'missing', date: '2027-06-15' },
    { productId: 'https://example.com', date: '2027-06-15' },
    { productId: 'real-tour', date: '2027-02-29' },
    { productId: 'real-tour', date: '2027-6-15' },
    { productId: 'real-tour', date: '2027-06-15', url: 'https://example.com' },
  ]) {
    const invalid = await fetch(`${base}/api/calendar/check`, postJson(body));
    assert.equal(invalid.status, 400, JSON.stringify(body));
  }
  assert.equal(calls.length, 1);
});

test('POST requests require bounded UTF-8 JSON objects with known fields', async t => {
  const base = await serve(t, services());
  const endpoint = `${base}/api/catalog/refresh`;
  assert.equal((await fetch(endpoint, { method: 'POST' })).status, 415);
  assert.equal((await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{}' })).status, 415);
  assert.equal((await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' })).status, 400);
  assert.equal((await fetch(endpoint, postJson({ unknown: true }))).status, 400);
  assert.equal((await fetch(endpoint, postJson('x'.repeat(8192)))).status, 413);
  assert.equal((await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' }, body: '{}' })).status, 415);
  const response = await fetch(endpoint, postJson({}));
  assert.equal(response.status, 200);
});

test('foreign origins and nonlocal Host headers cannot trigger source work', async t => {
  let calls = 0;
  const base = await serve(t, services({ catalogService: {
    refreshCatalog: async () => { calls++; return { products: [] }; },
  } }));
  for (const headers of [
    { Origin: 'https://example.com' }, { Origin: 'null' },
    { Host: 'example.com' }, { Host: '127.0.0.1.example.com' },
    { Host: 'localhost:99999' }, { Host: 'localhost:1' },
  ]) {
    const options = postJson({});
    Object.assign(options.headers, headers);
    assert.equal(await rawStatus(`${base}/api/catalog/refresh`, options), 403, JSON.stringify(headers));
  }
  assert.equal(calls, 0);
  const options = postJson({});
  options.headers.Origin = base;
  assert.equal((await fetch(`${base}/api/catalog/refresh`, options)).status, 200);
  assert.equal(calls, 1);
  assert.equal(await rawStatus(`${base}/api/catalog`, { headers: { Host: 'attacker.example' } }), 403);
});

test('concurrent catalog refreshes share one operation and a sixty-second cache', async t => {
  let now = clock();
  let calls = 0;
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  const base = await serve(t, { ...services({ catalogService: {
    refreshCatalog: async () => { calls++; await pending; return { products: [] }; },
  } }), clock: () => now });
  const first = fetch(`${base}/api/catalog/refresh`, postJson({}));
  const second = fetch(`${base}/api/catalog/refresh`, postJson({}));
  await new Promise(resolve => setImmediate(resolve));
  release();
  assert.deepEqual((await Promise.all([first, second])).map(response => response.status), [200, 200]);
  assert.equal(calls, 1);
  assert.equal((await fetch(`${base}/api/catalog/refresh`, postJson({}))).status, 200);
  assert.equal(calls, 1);
  now += 60_000;
  assert.equal((await fetch(`${base}/api/catalog/refresh`, postJson({}))).status, 200);
  assert.equal(calls, 2);
});

test('source failures return unavailable errors rather than invented inventory', async t => {
  const base = await serve(t, services({ catalogService: {
    loadCatalog: async () => { throw new Error('Offline test source'); },
    refreshCatalog: async () => { throw new Error('Offline test source'); },
  }, calendarService: {
    checkCalendar: async () => { throw new Error('Offline test calendar'); },
  } }));
  const catalog = await fetch(`${base}/api/catalog`);
  assert.equal(catalog.status, 503);
  assert.equal((await catalog.json()).error.code, 'catalog_unavailable');
  const refresh = await fetch(`${base}/api/catalog/refresh`, postJson({}));
  assert.equal(refresh.status, 503);
  assert.equal((await fetch(`${base}/api/catalog/refresh`, postJson({}))).status, 429);
  const calendar = await fetch(`${base}/api/calendar/check`, postJson({ productId: 'real-tour', date: '2027-06-15' }));
  assert.equal(calendar.status, 503);
  assert.equal((await calendar.json()).error.code, 'calendar_unavailable');
});
