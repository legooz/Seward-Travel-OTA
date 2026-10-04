import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from '../src/server.js';

const clock = () => Date.parse('2027-06-15T18:00:00Z');

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
