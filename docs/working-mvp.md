# Working Seward Travel OTA dashboard

The app now displays a real catalog from six Seward operators. Its catalog collector has successfully fetched all six public product pages and saved the extracted facts. A live check of all four configured FareHarbor products returned 13 departure entries for July 15, 2027. None published an explicit remaining-seat count. Rezdy and Resmark calendar extraction is not implemented.

This is a discovery and referral MVP. It has no checkout, payment processing, confirmed reservations, supplier API connection, or production hosting.

## Run and try it

From the repository directory, with Node.js 22 or later:

```sh
npm ci
npx playwright install chromium
npm start
```

Open [the local dashboard](http://127.0.0.1:3000). Search or filter the real products and use the refresh control to collect their current public descriptions. Choose a date, such as **July 15, 2027**, then use a supported product's calendar check. Follow its booking link to confirm current options with the operator. Dates and observations are not reservations.

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

## Deterministic collection

The running app uses **Cheerio and Playwright, without an LLM extraction call**:

1. `src/catalog.js` fetches only the public product URLs configured in `data/operators.json`. Source-specific rules isolate the selected product, read short factual fields, and validate its booking link. Related products and private variants must not supply the primary price.
2. A refresh runs at most two HTML requests concurrently, each bounded to 15 seconds and 3 MiB. Redirects are refused. It does not fetch a booking provider API or retry indefinitely.
3. `data/catalog.json` stores short product records. `checkedAt` records the successful capture; a failure preserves earlier good values and that timestamp, adds `lastAttemptAt`, and sets `fetchStatus` to `error`.
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

No exact remaining-seat count was verified during the initial catalog demonstration. A successful page scrape proves the catalog fields were retrieved, not that a tour has a particular number of seats.

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
