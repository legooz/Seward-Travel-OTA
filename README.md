# Seward Travel OTA

A starter for a Seward, Alaska tour marketplace: find departures for a travel date and group size, preserve the source and age of availability, and hand booking off to the operator.

**Current status: working availability-service prototype with synthetic demo data and local JSON feed import.** No live supplier API is connected, no tour operators are represented by the demo, and no bookings or payments are processed. A customer-facing website is the next product layer.

## Recommended MVP

Start with three to five cooperating Seward operators, approved booking/referral links, and one authorized availability connection. Use operator checkout while validating demand. Exact remaining capacity is useful when the source supplies it; a truthful “Check availability” link is a valid starting point when it does not.

- [MVP scope, architecture, and pilot backlog](docs/mvp-plan.md)
- [FareHarbor access, capacity semantics, and website/agent options](docs/fareharbor.md)
- [Rezdy, Bókun, Viator, OCTO, and verified local operator leads](docs/integration-options.md)

Research checked October 3, 2026. Supplier access and commercial terms still need confirmation.

## Run locally

Requires Node.js 22 or later. No npm dependencies, account, or API key are required for the demo.

```sh
npm test
npm run demo -- --date 2027-06-15 --party-size 2
npm start
```

The server listens on `http://127.0.0.1:3000` by default. It serves JSON, not a website:

```text
GET /health
GET /api/products
GET /api/availability?date=2027-06-15&partySize=2
```

Dates are interpreted in `America/Anchorage`. Demo responses are marked as synthetic; generated numbers are not researched inventory. This is a local development server, not a production deployment.

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

## First live integration

1. Confirm one supplier's participation and permitted data/booking flow.
2. Obtain the platform's required credentials and approvals, or agree on a feed with the supplier.
3. Map documented provider fields into the normalized model, with honest quantity semantics and expiration.
4. Validate customer types, time zones, cutoffs, shared capacity, and error behavior against provider-approved examples.
5. Add the search page and approved booking URLs, then run a small measured pilot.

FareHarbor and Rezdy are strong candidates based on the local platforms found in the research. Browser agents can assist with permitted observations and catalog checks, but do not remove platform access requirements or make hidden inventory visible.

## Repository

The public project is [legooz/Seward-Travel-OTA](https://github.com/legooz/Seward-Travel-OTA). Clone it to keep the Git history and receive updates:

```sh
git clone https://github.com/legooz/Seward-Travel-OTA.git
cd Seward-Travel-OTA
```

No open-source license has been selected. Choose one before distributing this as an open-source project.
