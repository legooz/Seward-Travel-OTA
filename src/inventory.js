import { readFile } from 'node:fs/promises';
import { InputError, MAX_PARTY_SIZE, TIME_ZONE, dateInSeward, nullableHttpsUrl, parseDate, parseTimestamp } from './validation.js';

const SOURCE_KINDS = new Set(['operator_feed', 'operator_manual', 'public_page']);
const MAX_FEED_BYTES = 2 * 1024 * 1024;

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > 1000) {
    throw new InputError(`${label} must be a nonempty string up to 1000 characters`);
  }
  return value;
}

export function validateFeed(feed, now = Date.now()) {
  if (!feed || !Array.isArray(feed.products) || !Array.isArray(feed.availability)) {
    throw new InputError('feed must contain products and availability arrays');
  }
  const productIds = new Set();
  const products = feed.products.map((product, index) => {
    const label = `products[${index}]`;
    if (!product || typeof product !== 'object') throw new InputError(`${label} must be an object`);
    const id = requireText(product.id, `${label}.id`);
    if (productIds.has(id)) throw new InputError(`duplicate product id: ${id}`);
    productIds.add(id);
    return {
      id, name: requireText(product.name, `${label}.name`),
      description: product.description === undefined ? '' : requireText(product.description, `${label}.description`),
      bookingUrl: nullableHttpsUrl(product.bookingUrl ?? null, `${label}.bookingUrl`),
    };
  });
  const departureIds = new Set();
  const departures = feed.availability.map((departure, index) => {
    const label = `availability[${index}]`;
    if (!departure || typeof departure !== 'object') throw new InputError(`${label} must be an object`);
    const id = requireText(departure.id, `${label}.id`);
    if (departureIds.has(id)) throw new InputError(`duplicate departure id: ${id}`);
    departureIds.add(id);
    if (!productIds.has(departure.productId)) throw new InputError(`${label}.productId does not match a product`);
    parseTimestamp(departure.startAt, `${label}.startAt`);
    const observedAt = parseTimestamp(departure.observedAt, `${label}.observedAt`);
    const expiresAt = parseTimestamp(departure.expiresAt, `${label}.expiresAt`);
    if (observedAt > now) throw new InputError(`${label}.observedAt cannot be in the future`);
    if (expiresAt <= observedAt) throw new InputError(`${label}.expiresAt must be after observedAt`);
    if (departure.seatsRemaining !== null && (!Number.isSafeInteger(departure.seatsRemaining) || departure.seatsRemaining < 0)) {
      throw new InputError(`${label}.seatsRemaining must be a nonnegative integer or null`);
    }
    if (departure.bookable !== null && typeof departure.bookable !== 'boolean') throw new InputError(`${label}.bookable must be boolean or null`);
    if (departure.checkedPartySize !== null && (!Number.isSafeInteger(departure.checkedPartySize) || departure.checkedPartySize < 1 || departure.checkedPartySize > MAX_PARTY_SIZE)) {
      throw new InputError(`${label}.checkedPartySize must be an integer from 1 to ${MAX_PARTY_SIZE} or null`);
    }
    if (departure.bookable === true && departure.seatsRemaining !== null && departure.seatsRemaining < (departure.checkedPartySize ?? 1)) {
      throw new InputError(`${label} has contradictory bookability and seat count`);
    }
    if (!SOURCE_KINDS.has(departure.sourceKind)) throw new InputError(`${label}.sourceKind must be operator_feed, operator_manual, or public_page`);
    return {
      id, productId: departure.productId, startAt: departure.startAt,
      seatsRemaining: departure.seatsRemaining, bookable: departure.bookable,
      checkedPartySize: departure.checkedPartySize, observedAt: departure.observedAt,
      expiresAt: departure.expiresAt, sourceKind: departure.sourceKind,
      evidenceUrl: nullableHttpsUrl(departure.evidenceUrl, `${label}.evidenceUrl`),
      bookingUrl: nullableHttpsUrl(departure.bookingUrl, `${label}.bookingUrl`),
    };
  });
  return { products, departures, isDemo: false };
}

export async function readManualFeed(path, now = Date.now()) {
  if (!path) throw new InputError('manual mode requires INVENTORY_FILE pointing to a local JSON file');
  const file = await readFile(path);
  if (file.length > MAX_FEED_BYTES) throw new InputError('feed file must be no larger than 2 MiB');
  let parsed;
  try { parsed = JSON.parse(file.toString('utf8')); } catch { throw new InputError('feed file is not valid JSON'); }
  return validateFeed(parsed, now);
}

export function createDemoInventory(date, now = Date.now(), partySize = 1) {
  parseDate(date);
  // 20:00 UTC is always on the requested Seward day (11:00 or 12:00 local).
  // All names and values are invented; never presented as operator inventory.
  const products = [
    { id: 'demo-bay', name: 'DEMO — Fictional Bay Cruise', description: 'Synthetic sample; no real operator, price, or seats.', bookingUrl: null },
    { id: 'demo-kayak', name: 'DEMO — Fictional Kayak Trip', description: 'Synthetic sample; no real operator, price, or seats.', bookingUrl: null },
    { id: 'demo-walk', name: 'DEMO — Fictional Harbor Walk', description: 'Synthetic sample; no real operator, price, or seats.', bookingUrl: null },
  ];
  const common = {
    startAt: `${date}T20:00:00Z`, checkedPartySize: null,
    observedAt: new Date(now).toISOString(), expiresAt: new Date(now + 5 * 60_000).toISOString(),
    sourceKind: 'demo', evidenceUrl: null, bookingUrl: null,
  };
  return {
    products, isDemo: true,
    departures: [
      { ...common, id: `demo-bay-${date}`, productId: 'demo-bay', seatsRemaining: 6, bookable: partySize <= 6, checkedPartySize: partySize },
      { ...common, id: `demo-kayak-${date}`, productId: 'demo-kayak', seatsRemaining: 0, bookable: false },
      { ...common, id: `demo-walk-${date}`, productId: 'demo-walk', seatsRemaining: null, bookable: null },
    ],
  };
}

export function normalizeDeparture(departure, partySize, now = Date.now()) {
  let seatsRemaining = departure.seatsRemaining;
  let bookable = departure.bookable;
  let status;
  let reason;
  if (Date.parse(departure.startAt) <= now) {
    status = 'departed'; reason = 'departure_time_passed'; seatsRemaining = null; bookable = null;
  } else if (Date.parse(departure.expiresAt) <= now) {
    status = 'stale'; reason = 'observation_expired'; seatsRemaining = null; bookable = null;
  } else if (departure.checkedPartySize !== null && departure.checkedPartySize !== partySize) {
    status = 'unknown'; reason = 'different_party_size'; seatsRemaining = null; bookable = null;
  } else if (seatsRemaining === 0) {
    status = 'sold_out'; reason = 'observed_zero_seats'; bookable = false;
  } else if (seatsRemaining !== null && seatsRemaining < partySize) {
    status = 'insufficient_capacity'; reason = 'party_exceeds_observed_seats'; bookable = false;
  } else if (bookable === false) {
    status = 'unavailable'; reason = 'source_reports_not_bookable';
  } else if (bookable === true && departure.checkedPartySize === partySize) {
    status = 'available'; reason = 'party_size_check';
  } else {
    status = 'unknown';
    reason = seatsRemaining !== null ? 'capacity_without_party_check'
      : bookable === true ? 'unscoped_bookability' : 'no_capacity_evidence';
    bookable = null;
  }
  return {
    id: departure.id, productId: departure.productId, startAt: departure.startAt,
    status, reason, seatsRemaining, bookable, bookingUrl: departure.bookingUrl,
    source: {
      kind: departure.sourceKind, evidenceUrl: departure.evidenceUrl,
      observedAt: departure.observedAt, expiresAt: departure.expiresAt,
      checkedPartySize: departure.checkedPartySize,
    },
  };
}

export function queryAvailability(inventory, date, partySize, now = Date.now()) {
  parseDate(date);
  if (!Number.isSafeInteger(partySize) || partySize < 1 || partySize > MAX_PARTY_SIZE) throw new InputError('invalid partySize');
  const departures = inventory.departures
    .filter(departure => dateInSeward(departure.startAt) === date)
    .sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
    .map(departure => normalizeDeparture(departure, partySize, now));
  return {
    date, partySize, timeZone: TIME_ZONE, isDemo: inventory.isDemo,
    generatedAt: new Date(now).toISOString(),
    coverage: departures.length ? 'observed_departures_only' : 'no_observations',
    notice: inventory.isDemo
      ? 'SYNTHETIC DEMO: invented tours and inventory. No operator systems are connected.'
      : 'Snapshot observations only; missing departures do not mean sold out. Confirm current availability with the operator before booking.',
    departures,
  };
}
