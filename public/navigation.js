import { venueFromURL } from './venue-tracking.js';

// Carry only an approved sign-placement code between our two public pages.
// Search terms, form data, and other URL parameters never travel with it.
const venue = venueFromURL(window.location.href);
if (venue) {
  for (const link of document.querySelectorAll('a[data-site-page]')) {
    const destination = new URL(link.getAttribute('href'), window.location.href);
    if (destination.origin !== window.location.origin || !['/', '/booking'].includes(destination.pathname)) continue;
    destination.search = new URLSearchParams({ venue }).toString();
    link.href = destination.pathname + destination.search;
  }
}
