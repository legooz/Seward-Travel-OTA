# Framer directory component

`SewardTours.tsx` is a self-contained React 18-compatible Framer component with its own header, glacier hero, and three front-page choices: **Lodging**, **Activities**, and **Transport**. Lodging opens by default. The 12-listing directory contains three properties, six tours, and three transportation services, displayed one per photo row with a location, relevant facts, and an official provider action. Its root anchor remains `seward-tours`.

## Current data connection

By default, the component fetches the [public saved catalog JSON](https://raw.githubusercontent.com/legooz/Seward-Travel-OTA/main/data/catalog.json). Loading the file does not scrape an operator or refresh inventory. The visitor-facing directory keeps technical data-source information out of the primary listing flow.

The same 12 real listings are embedded as a fallback while the request loads or if it fails. Errors are displayed, and previous observations remain visible. Each record retains its own source observation or review date; `refreshedAt` identifies the last tour-source refresh and does not mean every provider was just checked.

| Listing type | Current providers |
| --- | --- |
| Tours & activities | Miller’s Landing, Seward Ocean Excursions, Kayak Adventures Worldwide, Seward Helicopter Tours, Sunny Cove Kayaking, Adventure Sixty North |
| Lodging | Harbor 360 Hotel, Hotel Seward, Seward Windsong Lodge |
| Transportation | Alaska Railroad Coastal Classic, Park Connection Seward Express, PJS Taxi & Tours |

This default mode ignores availability values in saved JSON. Visitors confirm current dates, rates, schedules, and availability on the official provider website. Advertised prices are not checkout quotes. The hotels have no verified nightly quote; their rows show **Choose your stay** and explain that rates vary by date and room. The taxi service shows **Ask for a quote**.

## Photos and locations

Eleven listings reference photographs observed on official provider pages. Images load from those remote URLs, with source links and credits in provider details; they are not bundled copies. PJS Taxi uses a neutral transport placeholder because no specific vehicle photograph was verified. Failed image loads also use a labeled placeholder. The separate NPS hero image and its credit are documented in `public/images/CREDITS.md`.

Each row shows a source-based location or route label and a **View map** link generated from `mapQuery`. Hotel queries use verified addresses. Tour locations distinguish an office, meeting point, or beach boarding area where the source does; transport queries describe a route or service area. Map search results do not establish an exact boarding point. Ratings, distances from the visitor, and nightly room prices are not invented.

## Listing fields and updates

`data/operators.json` defines the six allowlisted tour pages; its `reviewedDetails` objects hold descriptions, duration evidence, photos, and locations. `data/vendors.json` holds the six manually reviewed lodging/transportation records. The catalog service merges them into `data/catalog.json`, which Framer fetches as one saved document.

| Fields | Purpose |
| --- | --- |
| `listingType`, `category`, `subcategory` | Distinguish `tour`, `lodging`, and `transportation`, then identify the activity, property, or service type. Older records without a listing type are treated as tours. |
| `serviceLabel`, `serviceNotes` | Describe a property/service and verified seasons or caveats. |
| `locationLabel`, `locationText`, `mapQuery`, `locationEvidence`, `locationEvidenceUrl` | Supply the short row label, address/route, map-search query, and official location evidence. |
| `imageUrl`, `imageAlt`, `imageSourceUrl`, `imageCredit`, `imageEvidence`, `mediaReviewedAt` | Preserve an observed remote photo URL, accessible description, source/credit, and media-review provenance. |
| `description`, `serviceEvidence`, `sourceReferences` | Supply concise descriptions, supporting details, and labeled official source URLs. |
| `sourceUrl`, `bookingUrl`, `bookingAction` | Link to the official provider/details or booking page. Actions are `dates` (Check dates), `rates` (Check rates), `schedule` (View schedule), or `contact` (Contact provider). |
| `priceText`, `priceCaveat` | Preserve advertised price basis and limitations; use null when no price is verified. |
| `durationLabel`, `durationMinutesMin`, `durationMinutesMax`, `durationBasis`, `durationEvidence` | Preserve published wording and distinguish stated durations from calculations using published schedules. Lodging has no trip-duration values. |
| `sourceMode`, `checkedAt`, `detailsCheckedAt`, `lastAttemptAt`, `fetchStatus` | Distinguish a manual website review from a tour page fetch, retain original review dates, and report failed refresh attempts. |
| `calendarSupported`, `inventoryUnit` | Restrict optional calendar support. Lodging and transportation currently have no supported inventory checks. |

Refresh fetches only supported tour pages. It preserves reviewed photo/location metadata, `detailsCheckedAt`, and `mediaReviewedAt`; the six vendor records also retain their facts and review dates. A price fetch does not re-review descriptions, photos, locations, hotel rates, or transport inventory. Verify the official source before changing reviewed fields or dates. Regenerate `data/catalog.json` and the component's embedded `SAVED_CATALOG` after such edits, then update the code pasted into Framer.

## Filtering and sorting

The front-page choices select **Lodging**, **Activities**, or **Transport** and lead into the matching list. The directory also offers **All listings**. Search covers names, providers, categories, service labels, locations/routes, and descriptions. Activities adds an activity filter. Changing listing type resets activity, duration, and sort selections.

The initial lodging view hides trip-duration controls and uses **Name A–Z**. Activities and transport offer category/duration sorting. Shortest/longest sorting in All listings combines timed trips and keeps lodging in a separate alphabetical section; duration filters exclude lodging. Stay length is never inferred from check-in/check-out times.

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

Use the Home page of the [Seward OneStop Framer project](https://framer.com/projects/Seward-Travel-OTA--A33lhKdvf8vZbhWz3M9d-1b3iI). The component supplies the complete hero and directory; hide the older native hero to avoid duplication. Existing hidden template sections can remain hidden. Updating repository files does not update Framer or publish the site.

1. Open **Assets → Code → Create Code File**, or open the existing component code file.
2. Paste the complete contents of `SewardTours.tsx` and save.
3. Place the component at the top of the Home page with **Show Hero** enabled, full/fill width, and content/auto height. Hide the older native hero at every breakpoint.
4. Preview desktop and phone layouts. Check all three front-page choices, photo loading/fallbacks, location/map links, provider actions, and the 3/6/3 listing counts. Check search and duration filters as well.

| Property control | Current default |
| --- | --- |
| **Show Hero** (`showHero`) | On. Includes the header, hero, and three front-page choices. Turn off only when intentionally embedding the directory under another hero. |
| **Catalog URL** (`sourceURL`) | Public GitHub JSON linked above. Must be a public HTTPS URL. |
| **API Base** (`apiBase`) | Blank. Keep blank for the saved catalog demo. |

Verified in the saved Framer draft at 1196px and 390px: all three front-page choices select the correct 3/6/3 listings and scroll to the results heading after Framer resizes the content. Category changes clear search and duration filters. The 11 official photos loaded in browser checks; PJS shows the neutral fallback. Location labels, encoded map links, provider actions, and the mobile list were checked, with no horizontal page overflow. The older native hero is hidden and only one homepage headline appears. TSX compilation, focused snapshot/filter/link checks, and all 46 backend tests pass. The local dashboard's expanded listing details also survive rerenders.

## Future live backend

The optional API mode shows a tour-calendar date selector in the all-listings and tour views, and the selected date on each supported tour's calendar panel. Lodging and transportation cannot trigger these calendar requests. API mode expects a separately hosted public HTTPS backend exposing `GET /api/catalog`, `POST /api/catalog/refresh` with `{}`, and `POST /api/calendar/check` with `{productId,date}`. Its refresh button fetches supported tour pages while preserving manual vendor review dates.

The current repository server intentionally accepts only local Host/Origin values. Public deployment needs deliberate Host/Origin rules, CORS for the editor and published site, preflight handling, and request/scrape limits. No guard bypass or public deployment is supplied by this component.

Requests omit browser credentials. Do not put provider keys or other secrets in Framer properties or component code. The component rejects localhost, IP-literal URLs, and common local-only hostnames; these URL checks do not replace backend security.

Exact counts require real operator inventory evidence returned by the backend: an observed result for the selected date, a nonnegative integer count explicitly measured in people, and valid, current observation/expiry timestamps. Missing, ambiguous, expired, or unsupported counts remain unknown. Boat capacities do not establish remaining seats, and a count does not guarantee availability for a particular party.

Official references: [code components](https://www.framer.com/developers/components-introduction), [property controls](https://www.framer.com/developers/property-controls), and [backend CORS and secret handling](https://www.framer.com/developers/fetch-examples).
