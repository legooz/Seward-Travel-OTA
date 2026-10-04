# FareHarbor integration decision

Initial API research checked October 3, 2026 (America/Anchorage). Primary sources only. That initial research did not query live operator inventory, submit an affiliate application, or make a reservation. See [Miller's Landing](millers-landing.md) for subsequent limited public-calendar observations.

## Recommended MVP route

Start with a curated Seward activity catalog and approved supplier/FHDN booking links. Add an API connector once access and the local supplier coverage are confirmed. Until then, use “Check availability” and clearly identified demonstration data; do not manufacture remaining-seat counts.

FHDN supports referral links, booking overlays, calendars, and an API partnership. The referral route pays commission on eligible bookings without building payment collection. US affiliates need a US bank account and payout verification. Not every FareHarbor operator participates, so Seward coverage must be checked in the Marketplace. Preserve generated referral URLs; use FareHarbor's customization tools when needed. API participation has qualification requirements and is positioned for affiliates collecting payment as merchant of record. [FHDN affiliate guide](https://help.fareharbor.com/hc/en-us/articles/42957556694811-FareHarbor-Distribution-Network-FHDN-for-affiliates)

## What the External API provides

Access is reviewed, production credentials require certification, and supplier enablement controls the available companies. Requests require private `X-FareHarbor-API-App` and `X-FareHarbor-API-User` headers; user keys may differ by currency. Ask through the [partnership application](https://fareharbor.com/about/partners/) or support@fareharbor.com.

Useful documented GET paths under `https://fareharbor.com/api/external/v1`:

```text
/companies/
/companies/<shortname>/items/<item.pk>/minimal/availabilities/date/<date>/
/companies/<shortname>/availabilities/<availability.pk>/
```

`availability.capacity` is the current maximum number of bookable customers, not a vessel's physical capacity. Customer-type capacities, party-size limits, exclusivity, and booking status also constrain sales. Never sum customer-type capacities. Rates belong to an availability. Keep credentials server-side. Published limits are 30 requests/second and 3,000/5 minutes per IP. Use the demo environment for certification. Direct booking requires validation and support for relevant pricing/custom fields and booking webhooks. Hosted booking links are also documented. [FareHarbor Integration Center](https://developer.fareharbor.com/api/external/v1/)

## What a website or agent observation can establish

FareHarbor distinguishes per-booking customer limits, blocked seats, automatic cutoffs, affiliate rules, and shared resources. These settings mean that a visible booking option does not identify all unsold physical seats. [FareHarbor glossary](https://help.fareharbor.com/hc/en-us/articles/42957683138459-FareHarbor-Glossary)

Our interpretation: a page allowing a party of four is evidence about that party and time, not proof that exactly four places remain. A maximum dropdown quantity could be a booking limit. A missing departure can reflect a cutoff, channel rule, or a closed sale. Do not translate any of these into “sold out” without an explicit source statement.

FareHarbor's Customer Terms section 5.1 requires express written permission for commercial automated access; section 6 also restricts extraction. A browser agent is still automation. Obtain applicable platform permission before operating a monitor; permission from a tour operator alone should not be assumed to cover the platform. [Customer terms](https://fareharbor.com/legal/tos-customers/)

If permission is obtained, an observer should record the actual visible statement, product, departure, customer mix, source URL, and observation time. It should stop before any action that creates a hold, cart, reservation, or payment. It should not bypass authentication or access controls. Use it for a small verification queue, with review when page structure changes.

## Proposed data contract and implementation behavior

This is an application design recommendation, not a FareHarbor schema:

```text
source: demo | supplier_api | supplier_feed | manual | permitted_observation
observedAt: timestamp
departureAt: timestamp with timezone
remaining: nonnegative integer | null
countMeaning: bookable_customers | explicitly_reported_seats | unknown
requestedParty: adult/child/etc. quantities
partyBookable: true | false | null
status: available | unavailable | call | unknown
evidenceUrl: canonical source URL
bookingUrl: approved referral or supplier URL
```

- Preserve unknown values. A fetch failure must not become zero inventory.
- Label the source and freshness. Expired data becomes “Check current availability.”
- Interpret Alaska departures in `America/Anchorage`; retain provider offsets.
- Refresh on relevant user searches within agreed API limits. Recheck before booking handoff; snapshots never reserve inventory.
- Reuse one connector interface for approved APIs, supplier feeds, and manual imports. Avoid coupling the search screen to a website scraper.
- Add server-side timeouts, backoff, a shared request budget, and minimal logs without credentials or customer details.

## Questions to resolve with FareHarbor before live activation

1. Can an early-stage Seward OTA obtain availability access with hosted checkout, and what approval/certification applies to that flow?
2. Which target Seward suppliers and products can this account access? Which need individual enablement?
3. May this product display numeric bookable capacity, and what wording and caching interval are approved?
4. What affiliate attribution and approved booking URL should each listing use?
5. What are the current commercial terms, permitted content uses, and technical support contacts?

No production access, Seward inventory coverage, commission entitlement, or exact-seat feed is established by this research alone.
