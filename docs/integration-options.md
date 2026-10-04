# Seward OneStop: integration options

Research checked October 3, 2026. These are documented integration paths, not evidence that this project has credentials, supplier agreements, or live inventory. All factual platform claims below use official documentation or operators' own booking links.

## Recommended first release

Build a Seward tour discovery and referral MVP: date, party composition, category, departure times, source, freshness, and a link to the operator's checkout. Start with a small curated catalog and one authorized live inventory connection. Treat party availability and remaining inventory as separate facts. Add direct checkout after the catalog and inventory connection work reliably.

The fastest path without a live partner connection is a useful operator directory with booking links and explicitly unknown availability. A manually maintained departure feed from a willing operator can also support the pilot. These are product recommendations, not claims of existing access.

## API choices

| Option | What access requires | What availability means | MVP use |
| --- | --- | --- | --- |
| Rezdy reseller API | API key plus products whose operators have agreed to distribution | Availability timeslots expose `quantityAvailable`, `totalCapacity`, and guest pricing | Strong direct candidate when a local Rezdy supplier agrees to participate. [Reseller API](https://developers.rezdy.com/rezdyapi/index-reseller.html) |
| Bókun REST API | Configured booking channel, API keys, and appropriate account permissions | `availabilityCount` is bookable seats for limited inventory; free sale must be treated separately | Use if an initial supplier is already on Bókun. [Authentication](https://bokun.dev/booking-api-rest/vU6sCfxwYdJWd1QAcLt12i/configuring-the-platform-for-api-usage-and-authentication/sFiGRpo4detkmrZPcWtQPj), [availability](https://bokun.dev/booking-api-rest/vU6sCfxwYdJWd1QAcLt12i/checking-availability-and-pricing/9x4PcziToX5g8WG4j5KMxt) |
| Bókun OCTO API | OCTO-enabled token; resale products depend on marketplace relationships | Standard product/option/departure objects, with implementation-specific limits | Consider instead of a custom Bókun adapter if it covers the pilot products. [Bókun OCTO guide](https://bokun.dev/octo-api/4k6pcPbAEZkaHwMbBN9m9C/getting-started-with-the-b%C3%B3kun-octo-api/4k6pcPbAEZ67nDa9QYpvSy) |
| Viator Affiliate Basic | Affiliate account; self-service Basic access | Product content and single-product availability schedules; **no real-time availability check** in the access matrix | Broader catalog and referral checkout; do not label schedule results live. [Access levels](https://partnerresources.viator.com/travel-commerce/levels-of-access/) |
| Viator Affiliate Full | Approval and certification | Adds real-time availability and bulk ingestion | Useful once approved; no basis here to promise total remaining physical seats. [Access levels](https://partnerresources.viator.com/travel-commerce/levels-of-access/) |

Viator Basic and Full send customers to Viator to complete the transaction. Keeping payment on this site's flow requires Full + Booking access and its approval process. [Affiliate options](https://partnerresources.viator.com/travel-commerce/affiliate/)

Rezdy's reseller API is a server-side integration: browser CORS is not supported and keys must remain confidential. Its current documentation lists payment processing, booking updates, and some product types as limitations, so verify the exact workflow before planning direct checkout. [Rezdy reseller API](https://developers.rezdy.com/rezdyapi/index-reseller.html)

Bókun inventory can have separate pickup capacity and minimum group requirements; a positive seat count alone does not prove that a requested party can book. Bókun v2's standard availability endpoint omits sold-out, closed, past, and out-of-resource slots; the richer statistics endpoint is supplier-only. Therefore, absence of a row should not automatically become “sold out.” [Availability rules](https://bokun.dev/booking-api-rest/vU6sCfxwYdJWd1QAcLt12i/checking-availability-and-pricing/9x4PcziToX5g8WG4j5KMxt), [v2 API](https://api-docs.bokun.dev/)

## OCTO as the internal model

OCTO is a free, open connectivity specification, not a credential or inventory marketplace. Model products, options, units, departures, and availability in a similar structure so additional adapters fit later. [Official OCTO developer hub](https://docs.octo.travel/)

Its calendar endpoint gives a day summary; its availability endpoint gives individual departures. `vacancies` may be null for free sale, and a calendar's vacancy value is the highest remaining count among that day's departures, not their sum. Use departure-level data for any displayed seat count. [OCTO availability specification](https://docs.octo.travel/octo-api-core/availability.md)

Bókun's implementation also has practical limits: unsuffixed tokens return only the first 100 records, while vendor-specific tokens scope access to products the account can resell. Date-only/pass products require opening hours to appear. Implement against the chosen provider's documentation as well as the OCTO schema. [Bókun OCTO guide](https://bokun.dev/octo-api/4k6pcPbAEZkaHwMbBN9m9C/getting-started-with-the-b%C3%B3kun-octo-api/4k6pcPbAEZ67nDa9QYpvSy)

## Verified local starting points

These operators are research leads, not signed suppliers. Their booking links establish platform use, not API access or current seats.

| Operator | Observed booking platform | Primary evidence |
| --- | --- | --- |
| Seward Ocean Excursions | FareHarbor | The operator homepage's “Book Now” link points to FareHarbor. [Operator website](https://sewardoceanexcursions.com/) |
| Kayak Adventures Worldwide | FareHarbor | The operator homepage's “Book Your Adventure” link points to FareHarbor. [Operator website](https://www.kayakak.com/) |
| Seward Helicopter Tours | Rezdy | Its glacier dog sledding, helicopter adventure, and scenic-flight booking links point to `sewardadventurecenter.rezdy.com`. [Operator website](https://sewardhelicopters.com/), [booking catalog](https://sewardadventurecenter.rezdy.com/index) |

## Implementation decisions

1. Store provider, operator/product/departure IDs, local time zone, requested party mix, source URL, checked time, and expiry time with every result.
2. Represent status, exact count, and party fit independently: `remainingSeats: null` means unknown, never zero. Label a count as “reported available through this source,” not total vessel occupancy.
3. Keep `live_api`, `operator_feed`, `web_observation`, and `demo` provenance distinct. A visible booking widget or accepted party size is not proof of the operator's full remaining inventory.
4. Refresh the selected departure for the actual adult/child mix before handoff. Explain that the operator checkout confirms availability; do not create speculative holds to measure capacity.
5. Use a provider-specific cache policy, bounded requests, backoff, and server-held credentials. Preserve errors as unknown/stale states instead of silently manufacturing sold-out results.
6. Pilot one direct supplier connection before building a general web agent. A supervised agent can help identify booking links and observe explicitly displayed availability on permitted pages; use reviewed observations as a fallback, with timestamps and source evidence. API access is the more stable path for structured availability; it does not reserve or guarantee inventory.

The immediate commercial dependency is a participating supplier or affiliate account. No API keys, account signups, outreach, reservations, or bookings were performed during this research.
