import { inject, track } from '@vercel/analytics';
import { venueFromURL, analyticsURL, eventProperties } from './venue-tracking.js';

// Replaced by the Vercel build. Local and preview builds never send events.
const enabled = __SEWARD_ANALYTICS_ENABLED__ && navigator.doNotTrack !== '1' && navigator.globalPrivacyControl !== true;
if (enabled) {
  const venue = venueFromURL(window.location.href);
  const send = (name, value) => {
    const properties = eventProperties(name, value, venue);
    if (properties) {
      try { track(name, properties); } catch { /* Analytics must never block browsing. */ }
    }
  };
  try {
    inject({ mode: 'production', beforeSend: event => {
      try { return { ...event, url: analyticsURL(event.url) }; } catch { return null; }
    } }, process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG);
    window.SewardAnalytics = { send };
    if (venue) send('qr_landing');
  } catch { /* The directory remains usable if analytics is unavailable. */ }
}
