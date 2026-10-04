import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoInventory, normalizeDeparture, queryAvailability, validateFeed } from '../src/inventory.js';
import { dateInSeward, parseDate, parsePositiveInteger, parseTimestamp, tomorrowInSeward } from '../src/validation.js';

const now = Date.parse('2027-06-15T18:00:00Z');
const departure = {
  id: 'departure-1', productId: 'product-1', startAt: '2027-06-15T12:00:00-08:00',
  seatsRemaining: 6, bookable: true, checkedPartySize: null,
  observedAt: '2027-06-15T17:59:00Z', expiresAt: '2027-06-15T18:04:00Z',
  sourceKind: 'operator_feed', evidenceUrl: 'https://example.com/evidence', bookingUrl: 'https://example.com/book',
};
const feed = (changes = {}) => ({
  products: [{ id: 'product-1', name: 'Operator-provided test product' }],
  availability: [{ ...departure, ...changes }],
});

test('calendar validation rejects normalized impossible dates and malformed inputs', () => {
  assert.equal(parseDate('2028-02-29'), '2028-02-29');
  for (const date of ['2027-02-29', '2027-04-31', '2027-13-01', '2027-1-01', '', null]) {
    assert.throws(() => parseDate(date));
  }
});

test('party sizes reject coercion, signs, fractions, whitespace, and out of range values', () => {
  assert.equal(parsePositiveInteger('100'), 100);
  for (const value of ['0', '-1', '1.2', '2x', ' 2', '02', '+2', '1e2', '101', '', null, 2]) {
    assert.throws(() => parsePositiveInteger(value));
  }
});

test('timestamps require explicit timezone and reject calendar/time rollovers', () => {
  assert.equal(parseTimestamp('2027-06-15T12:00:00-08:00', 'time'), Date.parse('2027-06-15T20:00:00Z'));
  for (const value of ['2027-06-15T12:00:00', '2027-06-15', '2027-02-29T00:00:00Z', '2027-06-15T24:00:00Z', '2027-06-15T12:60:00Z', '2027-06-15T12:00:00+15:00']) {
    assert.throws(() => parseTimestamp(value, 'time'));
  }
});

test('Seward day uses Alaska summer and winter offsets, including UTC day boundary', () => {
  assert.equal(dateInSeward('2027-06-16T07:30:00Z'), '2027-06-15');
  assert.equal(dateInSeward('2027-06-16T08:00:00Z'), '2027-06-16');
  assert.equal(dateInSeward('2027-01-16T08:30:00Z'), '2027-01-15');
  assert.equal(dateInSeward('2027-01-16T09:00:00Z'), '2027-01-16');
  assert.equal(tomorrowInSeward(Date.parse('2027-01-01T02:00:00Z')), '2027-01-01');
});

test('feed validation rejects malformed, future, contradictory and unsafe evidence', () => {
  for (const change of [
    { observedAt: '2027-06-15T18:00:01Z' },
    { expiresAt: departure.observedAt },
    { seatsRemaining: -1 }, { seatsRemaining: '6' }, { seatsRemaining: 1.5 },
    { seatsRemaining: 0, bookable: true },
    { seatsRemaining: 2, checkedPartySize: 3, bookable: true },
    { productId: 'missing' }, { sourceKind: 'unverified_api' },
    { evidenceUrl: 'http://example.com' }, { bookingUrl: 'javascript:alert(1)' },
    { evidenceUrl: 'https://user:password@example.com' },
    { checkedPartySize: 0 }, { checkedPartySize: undefined },
    { bookable: undefined }, { seatsRemaining: undefined },
  ]) assert.throws(() => validateFeed(feed(change), now));
  assert.equal(validateFeed(feed(), now).isDemo, false);
});

test('duplicate IDs cannot silently replace inventory', () => {
  const duplicateProducts = feed();
  duplicateProducts.products.push(duplicateProducts.products[0]);
  assert.throws(() => validateFeed(duplicateProducts, now), /duplicate product/);
  const duplicateDepartures = feed();
  duplicateDepartures.availability.push(duplicateDepartures.availability[0]);
  assert.throws(() => validateFeed(duplicateDepartures, now), /duplicate departure/);
});

test('unknown seats stay unknown and zero is explicit sold out', () => {
  const unknown = normalizeDeparture({ ...departure, seatsRemaining: null, bookable: null }, 2, now);
  assert.equal(unknown.status, 'unknown');
  assert.equal(unknown.seatsRemaining, null);
  const soldOut = normalizeDeparture({ ...departure, seatsRemaining: 0, bookable: false }, 2, now);
  assert.equal(soldOut.status, 'sold_out');
  assert.equal(soldOut.seatsRemaining, 0);
});

test('expiry boundary suppresses exact seats and positive bookability', () => {
  const stale = normalizeDeparture(departure, 2, Date.parse(departure.expiresAt));
  assert.equal(stale.status, 'stale');
  assert.equal(stale.seatsRemaining, null);
  assert.equal(stale.bookable, null);
  assert.equal(stale.source.observedAt, departure.observedAt);
});

test('a party-size observation is usable only for the checked party size', () => {
  const scoped = { ...departure, seatsRemaining: null, bookable: true, checkedPartySize: 2 };
  assert.equal(normalizeDeparture(scoped, 2, now).status, 'available');
  const other = normalizeDeparture(scoped, 3, now);
  assert.equal(other.status, 'unknown');
  assert.equal(other.bookable, null);
  const apparentCount = normalizeDeparture({ ...scoped, seatsRemaining: 6 }, 3, now);
  assert.equal(apparentCount.seatsRemaining, null);
});

test('unscoped bookability does not prove a requested party fits', () => {
  const result = normalizeDeparture({ ...departure, seatsRemaining: null, bookable: true }, 2, now);
  assert.equal(result.status, 'unknown');
  assert.equal(result.bookable, null);
  assert.equal(result.reason, 'unscoped_bookability');
});

test('positive seat count does not assert bookability without a positive matching party check', () => {
  for (const evidence of [
    { bookable: null, checkedPartySize: null },
    { bookable: true, checkedPartySize: null },
    { bookable: null, checkedPartySize: 2 },
  ]) {
    const result = normalizeDeparture({ ...departure, ...evidence }, 2, now);
    assert.equal(result.status, 'unknown');
    assert.equal(result.reason, 'capacity_without_party_check');
    assert.equal(result.seatsRemaining, 6);
    assert.equal(result.bookable, null);
  }
  const checked = normalizeDeparture({ ...departure, checkedPartySize: 2 }, 2, now);
  assert.equal(checked.status, 'available');
  assert.equal(checked.bookable, true);
});

test('insufficient capacity and closed bookings are distinct from sold out', () => {
  assert.equal(normalizeDeparture(departure, 7, now).status, 'insufficient_capacity');
  assert.equal(normalizeDeparture(departure, 7, now).bookable, false);
  assert.equal(normalizeDeparture({ ...departure, bookable: false }, 2, now).status, 'unavailable');
});

test('past departures suppress availability even with fresh observations', () => {
  const result = normalizeDeparture({ ...departure, startAt: '2027-06-15T18:00:00Z' }, 2, now);
  assert.equal(result.status, 'departed');
  assert.equal(result.bookable, null);
  assert.equal(result.seatsRemaining, null);
});

test('filtering respects Seward date and missing inventory is not sold out', () => {
  const inventory = validateFeed(feed({ startAt: '2027-06-16T07:30:00Z' }), now);
  assert.equal(queryAvailability(inventory, '2027-06-15', 2, now).departures.length, 1);
  const missing = queryAvailability(inventory, '2027-06-16', 2, now);
  assert.equal(missing.coverage, 'no_observations');
  assert.deepEqual(missing.departures, []);
});

test('demo data has prominent synthetic labels and no real booking links', () => {
  const inventory = createDemoInventory('2027-06-15', now, 2);
  const result = queryAvailability(inventory, '2027-06-15', 2, now);
  assert.equal(result.isDemo, true);
  assert.match(result.notice, /SYNTHETIC DEMO/);
  assert.deepEqual(result.departures.map(item => item.status), ['available', 'sold_out', 'unknown']);
  assert.ok(inventory.products.every(item => item.name.startsWith('DEMO') && item.bookingUrl === null));
});
