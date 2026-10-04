# Framer catalog component

`SewardTours.tsx` is a self-contained React 18-compatible Framer code component with one full-width tour listing per row, activity categories, duration filters, search, duration sorting, advertised prices, and operator booking links. The native page hero stays in Framer. Its root anchor is `seward-tours`.

## Current data connection

By default, the component fetches the [public saved catalog JSON](https://raw.githubusercontent.com/legooz/Seward-Travel-OTA/main/data/catalog.json). Loading the file does not scrape an operator or refresh inventory. The visitor-facing directory keeps technical data-source information out of the primary listing flow.

Six real operator records are embedded as a fallback while the request loads or if it fails: Miller’s Landing, Seward Ocean Excursions, Kayak Adventures Worldwide, Seward Helicopter Tours, Sunny Cove Kayaking, and Adventure Sixty North. The embedded snapshot retains its original October 3, 2026 Alaska-time observations. Errors are displayed, and previous observations remain visible.

This default mode has no public live scraper or live seat inventory. It does not use availability values from the saved JSON. A section-level note directs visitors to confirm availability with the operator. Advertised prices are not checkout quotes; visitors finish booking on the operator’s website.

## Website-informed durations

The six descriptions and duration fields were reviewed against each record's official `sourceUrl`; evidence and a separate `detailsCheckedAt` are retained in `data/operators.json` and exposed in the listing's operator details. Catalog refreshes preserve that review date rather than claiming summaries were newly reviewed with each price fetch.

- Seward Helicopter Tours: approximately 90 minutes; early arrival is additional.
- Seward Ocean Excursions: 3.5 hours, explicitly published for the half-day tour.
- Adventure Sixty North: 3–4 hours door to door; the shorter paddling estimate is not total trip time.
- Kayak Adventures Worldwide: 4 hours calculated from its three published start/end windows, displayed as **scheduled**. Its 2–2.5-hour paddling estimate is not the whole tour.
- Sunny Cove: **Half day**. Published tour windows and the detailed check-in-to-return itinerary differ, so no numeric duration is asserted.
- Miller's Landing: **Full day**. Departure timing changes seasonally, so no single numeric duration is asserted.

Numeric duration filters and sorting use explicit published hours or clearly labeled schedule calculations. Day labels remain available as filters without converting them into invented hour counts. Numeric ranges must fit inside the selected hour band; unknown numeric durations sort after known values.

## Add or update in Framer

The component is installed on the Home page of the [Seward Travel OTA Framer project](https://framer.com/projects/Seward-Travel-OTA--A33lhKdvf8vZbhWz3M9d-1b3iI). The saved draft includes Seward hero copy, the NPS glacier photo credited in `public/images/CREDITS.md`, updated homepage metadata, and the catalog below the hero. Generic template sections and shared navigation/footer are hidden, not deleted. Other template pages have not been rewritten. No public Framer publish was performed.

Validate each update in Framer preview: all six listings, category/search/duration controls, shortest and longest sort order, operator links, the hero anchor, and the 390-pixel phone layout. The component is also checked for TSX compilation and duration-filter behavior before delivery.

The current revision was checked in Framer: Kayaking returned three tours; Kayaking plus 2–4 hours returned two in the expected longest-first order; shortest-first ordered all four numeric durations before the two day-label records; search and unspecified-hours filtering worked; and the 390-pixel preview had no page or category-bar horizontal overflow. The 45 backend tests and focused component duration/sorting/price/snapshot checks passed.

1. Open **Assets → Code → Create Code File**, or open the existing component code file.
2. Paste the complete contents of `SewardTours.tsx` and save.
3. Insert the component below the native hero. Use full/fill width and content/auto height; the component adapts to its container.
4. Link the hero’s tour button to `/#seward-tours`, then preview desktop and mobile.

| Property control | Current default |
| --- | --- |
| **Catalog URL** (`sourceURL`) | Public GitHub JSON linked above. Must be a public HTTPS URL. |
| **API Base** (`apiBase`) | Blank. Keep blank for the saved catalog demo. |

Editing this repository file does not automatically update the copy pasted into Framer. Publish through Framer when the page is ready; this file alone does not publish a site.

## Future live backend

The optional API mode shows the date selector and selected date on each calendar panel. It expects a separately hosted public HTTPS backend exposing `GET /api/catalog`, `POST /api/catalog/refresh` with `{}`, and `POST /api/calendar/check` with `{productId,date}`. The current repository server intentionally accepts only local Host/Origin values. Public deployment needs deliberate Host/Origin rules, CORS for the editor and published site, preflight handling, and request/scrape limits. No guard bypass or public deployment is supplied by this component.

Requests omit browser credentials. Do not put provider keys or other secrets in Framer properties or component code. The component rejects localhost, IP-literal URLs, and common local-only hostnames; these URL checks do not replace backend security.

Exact counts require real operator inventory evidence returned by the backend: an observed result for the selected date, a nonnegative integer count explicitly measured in people, and valid, current observation/expiry timestamps. Missing, ambiguous, expired, or unsupported counts remain unknown. Boat capacities do not establish remaining seats, and a count does not guarantee availability for a particular party.

Official references: [code components](https://www.framer.com/developers/components-introduction), [property controls](https://www.framer.com/developers/property-controls), and [backend CORS and secret handling](https://www.framer.com/developers/fetch-examples).
