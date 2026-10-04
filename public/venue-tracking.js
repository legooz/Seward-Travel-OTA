// Placement codes identify signs, never individual visitors. Replace these examples
// with agreed venue placements before printing QR codes.
export const VENUES = Object.freeze({
  'venue-01': 'Venue 01 · entrance',
  'venue-02': 'Venue 02 · front desk',
  'demo-venue': 'Demo QR',
});

export function venueFromURL(value) {
  try {
    const code = new URL(value).searchParams.get('venue');
    return Object.hasOwn(VENUES, code) ? code : null;
  } catch { return null; }
}

export function analyticsURL(value) {
  const original = new URL(value);
  const clean = new URL('/', original.origin);
  const venue = venueFromURL(value);
  if (venue) clean.searchParams.set('venue', venue);
  return clean.href;
}

export function eventProperties(name, value, venue = null) {
  const placement = Object.hasOwn(VENUES, venue) ? venue : 'unattributed';
  if (name === 'qr_landing') return placement !== 'unattributed' ? { venue: placement } : null;
  if (name === 'category_select' && ['lodging', 'tour', 'transportation', 'all'].includes(value)) return { venue: placement, category: value };
  if (['provider_click', 'map_click'].includes(name) && typeof value === 'string' && /^[a-z0-9][a-z0-9-]{0,100}$/.test(value)) return { venue: placement, listingId: value };
  return null;
}
