import { validateFeed } from '../inventory.js';
import { InputError, nullableHttpsUrl, parseTimestamp } from '../validation.js';

function boundedText(value, label, maximum) {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum) {
    throw new InputError(`${label} must be a nonempty string up to ${maximum} characters`);
  }
  return value;
}

function interpretEvidence(rawText) {
  const text = rawText.trim();
  if (/^(?:Sold out|Not available)$/i.test(text)) {
    return { seatsRemaining: null, bookable: false, recognized: true };
  }
  const match = /^(?:([0-9]+) seats? remaining|Only ([0-9]+) seats? left|([0-9]+) spots? available)$/i.exec(text);
  if (match) {
    const seatsRemaining = Number(match[1] ?? match[2] ?? match[3]);
    if (Number.isSafeInteger(seatsRemaining)) {
      return { seatsRemaining, bookable: seatsRemaining === 0 ? false : null, recognized: true };
    }
  }
  return { seatsRemaining: null, bookable: null, recognized: false };
}

/** Convert captured visible evidence, without fetching a page or renewing its timestamp. */
export function buildObservation({ product, sourceUrl, observedAt, ttlSeconds, rows } = {}) {
  const now = Date.now();
  if (!product || typeof product !== 'object' || Array.isArray(product)) throw new InputError('product must be an object');
  if (typeof sourceUrl !== 'string') throw new InputError('sourceUrl must be an HTTPS URL');
  const evidenceUrl = nullableHttpsUrl(sourceUrl, 'sourceUrl');
  const capturedAt = parseTimestamp(observedAt, 'observedAt');
  if (capturedAt > now) throw new InputError('observedAt cannot be in the future');
  if (!Number.isSafeInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > 900) {
    throw new InputError('ttlSeconds must be an integer from 1 to 900');
  }
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 100) {
    throw new InputError('rows must contain between 1 and 100 captured departures');
  }
  const expiresAt = new Date(capturedAt + ttlSeconds * 1000).toISOString();
  const bookingUrl = nullableHttpsUrl(product.bookingUrl ?? null, 'product.bookingUrl');
  const evidence = [];
  const warnings = [];
  if (Date.parse(expiresAt) <= now) warnings.push('Capture has expired; its original observation and expiry times are preserved.');
  const availability = rows.map((row, index) => {
    const label = `rows[${index}]`;
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new InputError(`${label} must be an object`);
    boundedText(row.id, `${label}.id`, 1000);
    parseTimestamp(row.startAt, `${label}.startAt`);
    boundedText(row.evidenceText, `${label}.evidenceText`, 2000);
    if (row.priceText !== undefined) boundedText(row.priceText, `${label}.priceText`, 500);
    const parsed = interpretEvidence(row.evidenceText);
    if (!parsed.recognized) warnings.push(`Departure ${row.id}: evidence does not match an exact supported availability phrase; capacity remains unknown.`);
    evidence.push({
      id: row.id, productId: product.id, startAt: row.startAt,
      sourceUrl: evidenceUrl, observedAt, evidenceText: row.evidenceText,
      ...(row.priceText === undefined ? {} : { priceText: row.priceText }),
    });
    return {
      id: row.id, productId: product.id, startAt: row.startAt,
      seatsRemaining: parsed.seatsRemaining, bookable: parsed.bookable, checkedPartySize: null,
      observedAt, expiresAt, sourceKind: 'public_page', evidenceUrl, bookingUrl,
    };
  });
  const feed = { products: [{ id: product.id, name: product.name, bookingUrl }], availability };
  validateFeed(feed, now);
  return { feed, evidence, warnings };
}
