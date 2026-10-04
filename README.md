# Seward Travel OTA

**A working local tour dashboard with real catalog data from six Seward operators.** Search and filter products, refresh their public pages, inspect the source and capture time, and open the operator's booking page. Four FareHarbor products have a browser-based check for a selected calendar date; Rezdy and Resmark products link to their booking providers.

The catalog has been refreshed successfully from all six real public sources. The app does not process bookings or payments, and no supplier API is connected. Exact remaining seats have not yet been verified: a visible departure or an “Available” label is not a numeric seat count or confirmation that a particular party can book.

## Run the dashboard

Requires Node.js 22 or later:

```sh
npm ci
npx playwright install chromium
npm test
npm start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The server binds to the local computer only. Search or filter the catalog, refresh source data, then choose a date and check a supported calendar. **July 15, 2027** is the future-season demonstration date; it is a date to inspect, not a promise that inventory exists.

The initial catalog is a saved real scrape. Refreshing makes new public-page requests and updates each successful product's capture time. A failed catalog fetch retains the previous values and timestamp while reporting the error. Advertised prices can change and may exclude fees; they are not checkout quotes.

## Guides and integration research

- [Working dashboard, live collectors, sources, and API examples](docs/working-mvp.md)
- [Miller's Landing pilot brief, data requirements, and outreach draft](docs/operator-pilot.md)
- [MVP scope, architecture, and pilot backlog](docs/mvp-plan.md)
- [FareHarbor access, capacity semantics, and website/agent options](docs/fareharbor.md)
- [Rezdy, Bókun, Viator, OCTO, and verified local operator leads](docs/integration-options.md)
- [FareHarbor scraper prototype: offline demo, configuration, and limits](docs/scraper.md)
- [First verified target: Miller's Landing and its visible availability limits](docs/millers-landing.md)

Research checked October 3, 2026. The earlier planning and generic scraper guides provide background; the working-dashboard guide describes the current app. Supplier access and commercial terms still need confirmation.

## Dashboard API

POST requests require `Content-Type: application/json`:

```text
GET  /api/catalog
POST /api/catalog/refresh  {}
POST /api/calendar/check   {"productId":"seward-ocean-excursions-half-day","date":"2027-07-15"}
```

Catalog refreshes are limited to two concurrent source fetches, with a 15-second timeout per source and no automatic retries. Server refresh requests are coalesced and throttled. Calendar checks use a separate browser collector with bounded runs. Results record observation times and limitations; an error or missing departure does not mean sold out.

## Separate synthetic/manual API demonstration

The original API demonstration remains available for developing the normalization contract. **The dashboard does not use these endpoints or their synthetic inventory.** `INVENTORY_MODE` and the `mode`/`isDemo` values on `/health` describe this older pipeline, not the real catalog.

```sh
npm run demo -- --date 2027-06-15 --party-size 2
```

```text
GET /health
GET /api/products
GET /api/availability?date=2027-06-15&partySize=2
```

Dates are interpreted in `America/Anchorage`. Synthetic responses are labeled; their invented numbers are unrelated to the dashboard's operator records. This is a local MVP, not a production OTA deployment.

## Try an operator feed

Use [the example normalized feed](examples/operator-feed.json) as the format reference. The file is illustrative, not live data. Its timestamps are fixed so old evidence expires instead of silently becoming current.

PowerShell:

```powershell
$env:INVENTORY_MODE = 'manual'
$env:INVENTORY_FILE = (Resolve-Path './examples/operator-feed.json').Path
npm start
```

To return to synthetic demo mode in that terminal:

```powershell
Remove-Item Env:INVENTORY_MODE -ErrorAction SilentlyContinue
Remove-Item Env:INVENTORY_FILE -ErrorAction SilentlyContinue
```

Only load operator-provided data or observations you are authorized to use. Import does not independently verify the source. Store real local feeds in the ignored `private-feeds/` directory. Keep supplier API keys on the server; do not put them in a feed or commit them to Git.

Each departure includes `id`, `productId`, `startAt`, `seatsRemaining`, `bookable`, `checkedPartySize`, `observedAt`, `expiresAt`, `sourceKind`, `evidenceUrl`, and `bookingUrl`. Timestamps require an explicit timezone. Counts, party checks, and URLs may be null where the example allows it; non-null URLs must use HTTPS. Supported imported source kinds are `operator_feed`, `operator_manual`, and `public_page`. These labels record the importer's assertion, not independently verified provenance. The [validator](src/inventory.js) defines the current contract.

Use a matching `checkedPartySize` when recording a positive party check. Set expiration from the supplier's agreed freshness policy. The server re-reads the local feed for each data request; invalid or unreadable feeds return a 503 error rather than simulated inventory.

## Inventory rules

- Unknown quantity is `null`; zero is an explicit zero.
- A positive capacity alone does not prove that a party can book.
- A successful check for two travelers does not prove that four can book, or that exactly two seats remain.
- Expired evidence cannot be displayed as a current seat count or current booking confirmation.
- A provider failure or omitted departure must not become “sold out.”
- A fresh observation is still a snapshot. Operator checkout confirms the actual booking.

The starter models total group size. A live connector must also support the provider's customer types, resource rules, and minimum/maximum party constraints. The design notes describe these next steps.

## How collection works

Cheerio applies source-specific extraction rules to public product HTML. Playwright reads rendered FareHarbor calendar controls and departure labels. These are deterministic collectors: AI helped discover sources, inspect layouts, and review the code; it does not guess missing prices or seats during refresh.

The [working guide](docs/working-mvp.md) lists Miller's Landing and the five additional operators, their source pages, and the limits of the collected data.

## Next: dependable inventory access

1. Confirm one supplier's participation and permitted data/booking flow.
2. Obtain the platform's required credentials and approvals, or agree on a feed with the supplier.
3. Map documented provider fields into the normalized model, with honest quantity semantics and expiration.
4. Validate customer types, time zones, cutoffs, shared capacity, and error behavior against provider-approved examples.
5. Connect verified inventory to the dashboard, then run a small measured pilot.

FareHarbor and Rezdy are strong candidates based on the local platforms found in the research. Browser agents can assist with permitted observations and catalog checks, but do not remove platform access requirements or make hidden inventory visible.

## Repository

The public project is [legooz/Seward-Travel-OTA](https://github.com/legooz/Seward-Travel-OTA). Clone it to keep the Git history and receive updates:

```sh
git clone https://github.com/legooz/Seward-Travel-OTA.git
cd Seward-Travel-OTA
```

No open-source license has been selected. Choose one before distributing this as an open-source project.
