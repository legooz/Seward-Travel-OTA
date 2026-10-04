# Working Seward Travel OTA MVP

The saved directory contains six tours, three lodging properties, and three transportation services, linked to official sources. The Framer front page opens with **Lodging**, **Activities**, and **Transport** choices and defaults to Lodging. Its self-contained component includes the hero and displays one photo listing per row with a location or route and an official provider action. The older native hero should be hidden.

This is a discovery and referral MVP. Framer loads saved catalog facts; the local dashboard separately exercises the public tour collector and supported FareHarbor calendar reader. No exact remaining-seat count has been verified. Rezdy and Resmark calendar extraction is not implemented. Checkout, payment processing, confirmed reservations, and a supplier API connection are outside the current implementation.

## Front-page photos and locations

Eleven listing photos reference observed image URLs from official provider websites, with source links and credits in provider details. PJS Taxi uses a neutral transport placeholder; a failed image also falls back to a labeled placeholder. These provider photos are remotely referenced, not copied into the repository. The repository's NPS hero photograph has a separate credit in `public/images/CREDITS.md`.

Location labels distinguish hotel addresses, tour offices/meeting points, and transportation routes or service areas. **View map** opens a Google Maps search from a source-based query; it does not promise an exact boarding point. The directory adds no fabricated ratings, distance measurements, or hotel room rates.

For Framer controls, installation, source fields, and deployment requirements, see the [component guide](../framer/README.md). Browser verification of the new photo-list revision must follow the updated Framer preview; source and image-URL checks do not establish layout correctness.

## Run and try it

From the repository directory, with Node.js 22 or later:

```sh
npm ci
npx playwright install chromium
npm start
```

Open [the local dashboard](http://127.0.0.1:3000). Search or filter the records and refresh supported public tour pages. Choose a date, such as **July 15, 2027**, then run a supported tour's calendar check. Confirm current options through its operator link. This local test dashboard is separate from the Framer front page; dates and observations are not reservations.

Run the verification suite separately with `npm test`.

## Real sources

The initial target is [Miller's Landing — Full-Day Halibut & Species in Season Charter](https://www.millerslandingak.com/seward-alaska-fishing/full-day-halibut-species-in-season-charter/), whose product page links to FareHarbor. Its catalog record uses the advertised person rate; whole-boat variants must remain separate.

Five additional operators are included:

| Operator and public product source | Booking platform | Catalog capture and calendar support |
| --- | --- | --- |
| [Seward Ocean Excursions — Kenai Fjords and Resurrection Bay Half Day Tour](https://sewardoceanexcursions.com/tourssightseeing/) | FareHarbor | Product section, advertised price/duration, booking link; browser date check supported. |
| [Kayak Adventures Worldwide — Resurrection Bay Half Day Kayak Tour](https://www.kayakak.com/kayaking-trips/half-day-resurrection-bay-trip/) | FareHarbor | Primary booking section, advertised price/half-day label, booking link; browser date check supported. |
| [Seward Helicopter Tours — Glacier Dog Sledding](https://sewardhelicopters.com/seward-dog-sled-tours/) | Rezdy | Adult price wording, approximate duration, booking link; open provider for availability. |
| [Sunny Cove Kayaking — Resurrection Bay Tour](https://www.sunnycove.com/resurrection-bay-tour) | Resmark | Advertised from-price and half-day label, booking link; open provider for availability. |
| [Adventure Sixty North — Tonsina Point Kayak](https://adventure60.com/kayaking/tonsina-point-resurrection-bay-kayaking-adventure/) | FareHarbor | Adult rate, duration, booking link; browser date check supported. |

Platform labels come from product-specific booking links in the operator HTML. Prices are raw advertised wording, with a separate `priceCaveat` where relevant. They may exclude fees, vary by participant type, or change before checkout. These catalog facts do not establish live remaining capacity.

## Lodging and transportation

Six manually reviewed directory records are maintained in `data/vendors.json`. They are merged into the saved catalog and API response; tour refreshes preserve their facts, media/location metadata, and review dates without fetching these providers or checking their inventory.

| Provider | Directory details |
| --- | --- |
| [Harbor 360 Hotel](https://harbor360hotel.com/) | Waterfront hotel beside Seward's Small Boat Harbor; official room and reservation links. |
| [Hotel Seward](https://hotelsewardalaska.com/) | Downtown hotel; official accommodation and reservation links. |
| [Seward Windsong Lodge](https://www.alaskacollection.com/lodging/seward-windsong-lodge/) | Seasonal lodge near Seward in the Exit Glacier Valley; published 2027 season May 13–September 14. |
| [Alaska Railroad Coastal Classic](https://alaskarailroad.com/ride-a-train/our-trains/coastal-classic) | Anchorage–Girdwood–Seward train; published 2027 fare, season, and timetable. Direction-dependent travel time is calculated from the timetable. |
| [Park Connection Seward Express](https://www.alaskacoach.com/routes/seward-express/) | Anchorage–Seward coach; published 2027 fare and timetable. Its prose and timetable disagree on the northbound departure, so visitors are directed to confirm it. |
| [PJS Taxi & Tours](https://www.pjstaxi.net/) | Local/private transportation; contact the provider for a route, quote, and pickup time. No price or travel duration is invented. |

Lodging is listed alphabetically without trip-duration filters. Room rates remain unknown until the visitor selects stay dates and room type with the property. Train and coach actions open schedules; taxi is contact-only. None of these records claims live rooms, seats, or a supplier partnership.

## Canonical reviewed metadata

Tour `reviewedDetails` in `data/operators.json` and the records in `data/vendors.json` hold descriptions, locations, and photo provenance. `locationLabel`/`locationText` describe the place or route; `mapQuery` builds the map link; `locationEvidence`/`locationEvidenceUrl` retain support. `imageUrl`, `imageAlt`, `imageSourceUrl`, `imageCredit`, and `imageEvidence` identify the photograph and source.

`detailsCheckedAt` and `mediaReviewedAt` retain their actual review dates. A tour refresh must preserve those fields and reviewed photo/location metadata. Update them only after checking the corresponding official sources. Rebuild `data/catalog.json`, synchronize Framer's embedded `SAVED_CATALOG`, and replace the pasted component when changing the saved fallback.

## Deterministic collection

The running app uses **Cheerio and Playwright, without an LLM extraction call**:

1. `src/catalog.js` fetches only the public product URLs configured in `data/operators.json`. Source-specific rules isolate the selected product, read short factual fields, and validate its booking link. Related products and private variants must not supply the primary price.
2. A refresh runs at most two HTML requests concurrently, each bounded to 15 seconds and 3 MiB. Redirects are refused. It does not fetch a booking provider API or retry indefinitely.
3. `data/catalog.json` stores the assembled directory. A tour's `checkedAt` records its successful page capture; failure preserves earlier good values and that timestamp, adds `lastAttemptAt`, and sets `fetchStatus` to `error`. The overall tour-refresh timestamp does not renew manual detail or media reviews.
4. `src/calendar.js` opens the configured public FareHarbor calendar, selects the requested year/month/day, and reads rendered departures. It does not select a party quantity, open checkout, create a hold, or make a booking.

AI was useful for discovering operators, examining page structure, choosing extraction rules, and reviewing results. Live refresh uses the code and source evidence; missing facts remain unknown.

## Reading availability honestly

- A departure's visible wording is an observation, not a booking guarantee.
- “Available” does not establish a remaining-seat number or that a requested party fits.
- A numeric count is only meaningful when the departure explicitly reports remaining person inventory. Capacity descriptions, dropdown limits, private-charter units, and whole-boat quantities are not individual seats.
- Private or whole-boat departure variants retain unknown numeric seats.
- Missing dates, empty results, network failures, and changed layouts are not proof of sold-out inventory.
- Calendar observations expire after five minutes. Recheck the source and confirm at operator checkout; do not represent expired evidence as current.
- Adult/child composition, activity restrictions, resources, and minimum groups are not validated by this browser read.

No exact remaining-seat count has been verified. A successful page scrape proves the catalog fields were retrieved, not that a tour has a particular number of seats.

## Local API examples

The dashboard uses these routes:

| Route | Request | Purpose |
| --- | --- | --- |
| `GET /api/catalog` | No body | Load the saved real catalog, with any saved calendar observations. |
| `POST /api/catalog/refresh` | `{}` | Fetch the six public product pages and update the catalog. |
| `POST /api/calendar/check` | `{"productId":"seward-ocean-excursions-half-day","date":"2027-07-15"}` | Check the selected configured FareHarbor calendar. |

For example, in PowerShell:

```powershell
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/catalog/refresh' -Method Post -ContentType 'application/json' -Body '{}'
Invoke-RestMethod -Uri 'http://127.0.0.1:3000/api/calendar/check' -Method Post -ContentType 'application/json' -Body '{"productId":"seward-ocean-excursions-half-day","date":"2027-07-15"}'
```

Catalog refresh calls are coalesced/throttled, and repeated calendar requests are bounded. A source failure is reported explicitly. The service binds to `127.0.0.1`; this configuration is for local use.

The earlier `GET /api/products` and `GET /api/availability?date=...&partySize=...` routes remain a **separate synthetic/manual demonstration**. They are unused by the dashboard. `INVENTORY_MODE=manual` selects a local normalized feed for those older routes only. See the [README](../README.md) for that feed contract and the [generic scraper guide](scraper.md) for offline evidence fixtures.

## What comes next

Keep using operator checkout while testing demand. The [Miller's Landing pilot brief](operator-pilot.md) includes a proposed scope, data requirements, acceptance checks, and an unsent outreach draft. For dependable exact inventory, establish the operator relationship and applicable platform access, then connect an approved API or an operator-provided feed. Verify departure IDs, customer types, shared resources, cutoffs, and quantity semantics against provider-approved examples. Existing [FareHarbor research](fareharbor.md) and [alternative integration options](integration-options.md) describe those paths.

Before a production launch, the project still needs deployment, authentication where appropriate, operational monitoring, validated supplier agreements, and a booking/customer-service model. None of those are implied by a successful local scrape.
