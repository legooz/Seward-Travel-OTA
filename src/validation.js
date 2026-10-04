export const TIME_ZONE = 'America/Anchorage';
export const MAX_PARTY_SIZE = 100;

export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputError';
  }
}

export function parseDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new InputError('date must be a real calendar date in YYYY-MM-DD format');
  }
  const parsed = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new InputError('date must be a real calendar date in YYYY-MM-DD format');
  }
  return value;
}

export function parsePositiveInteger(value, label = 'partySize', maximum = MAX_PARTY_SIZE) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new InputError(`${label} must be an integer from 1 to ${maximum}`);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number > maximum) {
    throw new InputError(`${label} must be an integer from 1 to ${maximum}`);
  }
  return number;
}

export function parseTimestamp(value, label) {
  const match = typeof value === 'string' && /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) throw new InputError(`${label} must be an ISO timestamp with an explicit timezone`);
  parseDate(match[1]);
  const [, , hour, minute, second, offset] = match;
  if (+hour > 23 || +minute > 59 || +second > 59) throw new InputError(`${label} has an invalid time`);
  if (offset !== 'Z' && (+offset.slice(1, 3) > 14 || +offset.slice(4) > 59 || (+offset.slice(1, 3) === 14 && +offset.slice(4) !== 0))) {
    throw new InputError(`${label} has an invalid timezone offset`);
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) throw new InputError(`${label} is invalid`);
  return parsed;
}

export function dateInSeward(value) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value));
  const part = name => parts.find(item => item.type === name).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function tomorrowInSeward(now = Date.now()) {
  const today = dateInSeward(now);
  return new Date(Date.parse(`${today}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
}

export function nullableHttpsUrl(value, label) {
  if (value === null) return null;
  if (typeof value !== 'string') throw new InputError(`${label} must be an HTTPS URL or null`);
  let url;
  try { url = new URL(value); } catch { throw new InputError(`${label} must be an HTTPS URL or null`); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new InputError(`${label} must be an HTTPS URL without credentials`);
  return url.href;
}
