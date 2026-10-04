# Framer directory component

`SewardTours.tsx` is a self-contained React 18-compatible Framer code component with one full-width listing per row. The directory includes 12 listings: six tours, three lodging properties, and three transportation services. It provides listing-type filters, search, tour activity filters, appropriate duration sorting, advertised prices or rate guidance, and official provider links. The native page hero stays in Framer. The component's root anchor remains `seward-tours`.

## Current data connection

By default, the component fetches the [public saved catalog JSON](https://raw.githubusercontent.com/legooz/Seward-Travel-OTA/main/data/catalog.json). Loading the file does not scrape an operator or refresh inventory. The visitor-facing directory keeps technical data-source information out of the primary listing flow.

The same 12 real listings are embedded as a fallback while the request loads or if it fails. Errors are displayed, and previous observations remain visible. Each record retains its own source observation or review date; `refreshedAt` identifies the last tour-source refresh and does not mean every provider was just checked.

| Listing type | Current providers |
| --- | --- |
| Tours & activities | Miller’s Landing, Seward Ocean Excursions, Kayak Adventures Worldwide, Seward Helicopter Tours, Sunny Cove Kayaking, Adventure Sixty North |
| Lodging | Harbor 360 Hotel, Hotel Seward, Seward Windsong Lodge |
| Transportation | Alaska Railroad Coastal Classic, Park Connection Seward Express, PJS Taxi & Tours |

This default mode has no public live scraper or live inventory. It ignores availability values in saved JSON. Visitors confirm current dates, rates, schedules, and availability on the official provider website. Advertised prices are not checkout quotes. The three hotels have no verified nightly quote; their rows show **Check your stay dates**. The taxi service has no published fare in the reviewed source and shows **Ask for a quote**.

## Listing fields and updates

`data/operators.json` defines the six allowlisted tour source pages and their reviewed descriptions/duration evidence. `data/vendors.json` contains the six manually reviewed lodging and transportation records. The catalog service merges both groups into `data/catalog.json`; the Framer component fetches only that assembled JSON, not `vendors.json` separately.

| Fields | Purpose |
| --- | --- |
| `listingType`, `category`, `subcategory` | Distinguish `tour`, `lodging`, and `transportation`, then identify the activity, property, or service type. Older records without a listing type are treated as tours. |
| `serviceLabel`, `locationText`, `serviceNotes` | Describe a property or transportation service, its real location/route, and verified seasons or caveats. |
| `description`, `serviceEvidence`, `sourceReferences` | Supply concise descriptions, supporting details, and labeled official source URLs. |
| `sourceUrl`, `bookingUrl`, `bookingAction` | Link to the official provider/details or booking page. Actions are `dates` (Check dates), `rates` (Check rates), `schedule` (View schedule), or `contact` (Contact provider). |
| `priceText`, `priceCaveat` | Preserve advertised price basis and limitations; use null when no price is verified. |
| `durationLabel`, `durationMinutesMin`, `durationMinutesMax`, `durationBasis`, `durationEvidence` | Preserve published wording and distinguish stated durations from calculations using published schedules. Lodging has no trip-duration values. |
| `sourceMode`, `checkedAt`, `detailsCheckedAt`, `lastAttemptAt`, `fetchStatus` | Distinguish a manual website review from a tour page fetch, retain original review dates, and report failed refresh attempts. |
| `calendarSupported`, `inventoryUnit` | Restrict optional calendar support. Lodging and transportation currently have no supported inventory checks. |

Refreshing the catalog fetches only the supported tour pages. It does not query hotel rates, transportation inventory, or re-review the six vendor records. Manually verify their official sources before changing `vendors.json` or its review timestamps. Tour detail-review dates also stay unchanged during a price fetch. Regenerate the assembled catalog and update the component's embedded `SAVED_CATALOG` when changing the saved fallback; editing source records alone does not update the copy already pasted into Framer.

## Filtering and sorting

The top controls select **All listings**, **Tours & activities**, **Lodging**, or **Transportation**. Search covers names, providers, categories, service labels, locations/routes, and descriptions. The tour view adds an activity filter. Changing listing type resets activity, duration, and sort selections.

The default sort groups listings by category and orders timed trips within their group. Shortest/longest sorting combines tours and transportation in duration order and keeps lodging in a separate alphabetical section. The lodging view hides trip-duration controls and uses **Name A–Z**. A duration filter in the all-listings view excludes lodging. Stay length is never inferred from check-in/check-out times.

## Website-informed durations

The six tour descriptions and duration fields were reviewed against each record's official `sourceUrl`; evidence and a separate `detailsCheckedAt` are retained in `data/operators.json` and exposed in the listing's operator details.

- Seward Helicopter Tours: approximately 90 minutes; early arrival is additional.
- Seward Ocean Excursions: 3.5 hours, explicitly published for the half-day tour.
- Adventure Sixty North: 3–4 hours door to door; the shorter paddling estimate is not total trip time.
- Kayak Adventures Worldwide: 4 hours calculated from its three published start/end windows, displayed as **scheduled**. Its 2–2.5-hour paddling estimate is not the whole tour.
- Sunny Cove: **Half day**. Published tour windows and the detailed check-in-to-return itinerary differ, so no numeric duration is asserted.
- Miller's Landing: **Full day**. Departure timing changes seasonally, so no single numeric duration is asserted.

Numeric duration filters and sorting use explicit published hours or clearly labeled schedule calculations. Day labels remain available as filters without converting them into invented hour counts. Numeric ranges must fit inside the selected hour band; unknown numeric durations sort after known values. Transportation durations apply to the documented route and direction: the train and coach show ranges calculated from their published timetables, while taxi duration depends on the requested route. A published schedule does not establish bookable inventory.

## Add or update in Framer

Use the Home page of the [Seward Travel OTA Framer project](https://framer.com/projects/Seward-Travel-OTA--A33lhKdvf8vZbhWz3M9d-1b3iI). The directory belongs below the native Seward hero, whose NPS glacier photo is credited in `public/images/CREDITS.md`. Generic template sections and shared navigation/footer were hidden, not deleted; other template pages have not been rewritten. Updating this repository does not publish a Framer site.

The mixed directory was checked in Framer preview at wide and 390-pixel widths: all 12 listings loaded, the type filters returned 6/3/3 records, Kayaking returned three tours, and PJS search returned its contact-only listing. The 2–4-hour transport filter returned the coach; switching to Lodging reset duration and displayed all three properties alphabetically. Longest transport ordering placed train, coach, then the taxi with unknown duration. Official action links, the hero anchor, and mobile overflow were checked. TSX transpilation, focused filter/link/snapshot checks, and 46 backend tests passed. These are saved catalog checks, not provider inventory verification.

1. Open **Assets → Code → Create Code File**, or open the existing component code file.
2. Paste the complete contents of `SewardTours.tsx` and save.
3. Insert the component below the native hero. Use full/fill width and content/auto height; the component adapts to its container.
4. Link the hero’s directory button to `/#seward-tours`, then preview desktop and mobile.

| Property control | Current default |
| --- | --- |
| **Catalog URL** (`sourceURL`) | Public GitHub JSON linked above. Must be a public HTTPS URL. |
| **API Base** (`apiBase`) | Blank. Keep blank for the saved catalog demo. |

Editing this repository file does not automatically update the copy pasted into Framer. Publish through Framer when the page is ready; this file alone does not publish a site.

## Future live backend

The optional API mode shows a tour-calendar date selector in the all-listings and tour views, and the selected date on each supported tour's calendar panel. Lodging and transportation cannot trigger these calendar requests. API mode expects a separately hosted public HTTPS backend exposing `GET /api/catalog`, `POST /api/catalog/refresh` with `{}`, and `POST /api/calendar/check` with `{productId,date}`. Its refresh button fetches supported tour pages while preserving manual vendor review dates.

The current repository server intentionally accepts only local Host/Origin values. Public deployment needs deliberate Host/Origin rules, CORS for the editor and published site, preflight handling, and request/scrape limits. No guard bypass or public deployment is supplied by this component.

Requests omit browser credentials. Do not put provider keys or other secrets in Framer properties or component code. The component rejects localhost, IP-literal URLs, and common local-only hostnames; these URL checks do not replace backend security.

Exact counts require real operator inventory evidence returned by the backend: an observed result for the selected date, a nonnegative integer count explicitly measured in people, and valid, current observation/expiry timestamps. Missing, ambiguous, expired, or unsupported counts remain unknown. Boat capacities do not establish remaining seats, and a count does not guarantee availability for a particular party.

Official references: [code components](https://www.framer.com/developers/components-introduction), [property controls](https://www.framer.com/developers/property-controls), and [backend CORS and secret handling](https://www.framer.com/developers/fetch-examples).
