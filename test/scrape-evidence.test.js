import test from 'node:test';
import assert from 'node:assert/strict';
import { buildObservation } from '../src/scrape/evidence.js';
import { normalizeDeparture, validateFeed } from '../src/inventory.js';

function capture(texts = ['6 seats remaining'], changes = {}) {
  return {
    product: { id: 'fixture-tour', name: 'Synthetic evidence fixture', bookingUrl: 'https://example.com/book' },
    sourceUrl: 'https://example.com/availability',
    observedAt: new Date(Date.now() - 5000).toISOString(), ttlSeconds: 300,
    rows: texts.map((evidenceText, index) => ({ id: `fixture-${index}`, startAt: '2090-06-15T12:00:00-08:00', evidenceText })),
    ...changes,
  };
}

test('exact count fixtures support singular/plural and preserve count without asserting party availability', () => {
  const input = capture(['6 seats remaining', 'Only 6 seats left', '6 spots available', '1 seat remaining', 'Only 1 seat left', '1 spot available']);
  const { feed, warnings } = buildObservation(input);
  assert.deepEqual(feed.availability.map(row => row.seatsRemaining), [6, 6, 6, 1, 1, 1]);
  assert.ok(feed.availability.every(row => row.bookable === null && row.checkedPartySize === null && row.sourceKind === 'public_page'));
  assert.equal(normalizeDeparture(feed.availability[0], 2).status, 'unknown');
  assert.deepEqual(warnings, []);
  assert.doesNotThrow(() => validateFeed(feed));
});

test('sold-out wording does not invent a zero count; only explicit zero becomes zero', () => {
  const { feed } = buildObservation(capture(['Sold out', 'Not available', '0 seats remaining', 'Only 0 seats left', '0 spots available']));
  assert.deepEqual(feed.availability.map(row => row.seatsRemaining), [null, null, 0, 0, 0]);
  assert.ok(feed.availability.every(row => row.bookable === false));
  assert.equal(normalizeDeparture(feed.availability[0], 1).status, 'unavailable');
  assert.equal(normalizeDeparture(feed.availability[2], 1).status, 'sold_out');
});

test('ambiguous, combined, price, dropdown and oversized count fixtures remain unknown', () => {
  const fixtures = [
    'Up to 6 seats remaining', '6 seats remaining / 2 seats remaining',
    'Sold out\n6 seats remaining', '6 seats remaining for adults only',
    'Guests: 1 2 3 4 5 6', '$6 per seat', '6 seats remaining, $50',
    'Book now', 'Maximum capacity 6', '9007199254740992 spots available',
    'Call to book', 'Combo Charter - 10 passenger boat', 'Combo Charter - 14 passenger boat Call to book',
    '6.5 spots available', '-1 seats remaining', '3 seats remaining\nNot available',
  ];
  const { feed, warnings } = buildObservation(capture(fixtures));
  assert.ok(feed.availability.every(row => row.seatsRemaining === null && row.bookable === null));
  assert.equal(warnings.length, fixtures.length);
});

test('raw evidence and price live only in the sidecar and capture timestamps are not renewed', () => {
  const observedAt = '2020-01-01T00:00:00-09:00';
  const input = capture(['  Only 6 seats left  '], { observedAt, ttlSeconds: 60 });
  input.rows[0].priceText = '$123.45 per adult — taxes excluded';
  const { feed, evidence, warnings } = buildObservation(input);
  assert.equal(feed.availability[0].observedAt, observedAt);
  assert.equal(feed.availability[0].expiresAt, '2020-01-01T09:01:00.000Z');
  assert.equal(evidence[0].observedAt, observedAt);
  assert.equal(evidence[0].evidenceText, input.rows[0].evidenceText);
  assert.equal(evidence[0].priceText, input.rows[0].priceText);
  assert.equal(feed.availability[0].priceText, undefined);
  assert.equal(feed.availability[0].evidenceText, undefined);
  assert.equal(normalizeDeparture(feed.availability[0], 2).status, 'stale');
  assert.match(warnings[0], /expired/);
});

test('bad dates, future observations, missing timezones and unsafe URLs fail validation', () => {
  for (const change of [
    { observedAt: new Date(Date.now() + 3600_000).toISOString() },
    { observedAt: '2020-02-30T00:00:00Z' }, { observedAt: '2020-01-01T00:00:00' },
    { sourceUrl: 'http://example.com' }, { sourceUrl: 'javascript:alert(1)' },
    { sourceUrl: 'https://user:secret@example.com' }, { sourceUrl: null },
    { product: { id: 'p', name: 'Fixture', bookingUrl: 'file:///tmp/book' } },
  ]) assert.throws(() => buildObservation(capture(undefined, change)));
  for (const startAt of ['2090-02-30T12:00:00Z', '2090-06-15T12:00:00', '2090-06-15']) {
    const input = capture();
    input.rows[0].startAt = startAt;
    assert.throws(() => buildObservation(input));
  }
});

test('missing rows, duplicates, invalid TTL and oversized evidence fail rather than imply sold out', () => {
  for (const rows of [undefined, null, [], Array.from({ length: 101 }, () => ({})), [null]]) {
    assert.throws(() => buildObservation(capture(undefined, { rows })));
  }
  const duplicate = capture(['6 seats remaining', 'Sold out']);
  duplicate.rows[1].id = duplicate.rows[0].id;
  assert.throws(() => buildObservation(duplicate), /duplicate departure/);
  for (const ttlSeconds of [0, -1, 901, 1.5, '60', null]) assert.throws(() => buildObservation(capture(undefined, { ttlSeconds })));
  for (const evidenceText of ['', null, 'x'.repeat(2001)]) assert.throws(() => buildObservation(capture([evidenceText])));
  const oversizedPrice = capture();
  oversizedPrice.rows[0].priceText = 'x'.repeat(501);
  assert.throws(() => buildObservation(oversizedPrice));
});
