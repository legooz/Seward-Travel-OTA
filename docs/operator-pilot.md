# One-operator pilot: Miller's Landing

Prepared October 3, 2026. Proposal only: no outreach has been sent, no operator agreement exists, and no API access has been obtained.

## Scope and starting evidence

Use [Full-Day Halibut & Species in Season Charter](https://www.millerslandingak.com/seward-alaska-fishing/full-day-halibut-species-in-season-charter/), FareHarbor company `millerslandingak`, item `84318`, local ID `millers-landing-halibut`. Start with two or three operator-selected dates and per-person departures. Keep checkout with the operator.

The saved [calendar observation](../data/calendar-observations.json) for July 15, 2027 shows two 6:00 AM variants: 10-passenger and 14-passenger boats, both “Call to book.” Boat size does not establish remaining seats. The public collector has verified neither exact inventory nor sold-out status.

## Two workable data paths

| Path | What is needed | Pilot behavior |
| --- | --- | --- |
| Approved FareHarbor API | Platform approval/credentials, supplier enablement, applicable certification and display/handoff permission | Read authorized capacity and constraints. Confirm availability-only access with FareHarbor. |
| Operator-maintained feed | Display permission, named owner, repeatable export/manual update, agreed expiry | Load normalized JSON through the existing manual inventory API while API access is unresolved. |

See [FareHarbor access requirements](fareharbor.md) and the [feed format](../examples/operator-feed.json). Credentials belong in a server-side secret store or environment configuration, never email, exported feeds, or Git.

## Required departure information

| Field | Required meaning |
| --- | --- |
| Product, variant, departure IDs | Stable identifiers; keep boats and sale options separate. |
| `startAt` | Actual departure timestamp with offset, interpreted in `America/Anchorage`; do not hard-code one offset year-round. |
| Inventory unit and scope | Person, whole boat, or channel allotment. Identify what is for sale, not maximum vessel capacity. |
| Available quantity | Operator-verified currently bookable units; unknown is `null`, confirmed zero is `0`. Maximum capacity is separate. |
| Party bookability | True/false/unknown for a specified party/customer mix, independent of quantity. Include minimums, cutoffs, and private-charter rules. |
| `bookingUrl` | Approved HTTPS checkout/referral URL for this sale option; confirm attribution. |
| `observedAt`, `expiresAt` | When the source was checked and when that evidence stops being current; agree on update cadence. |
| Closure/cancellation state | Closure, weather cancellation, call-only status, reopening, and shareable reason. Missing rows or failed requests never mean zero. |

The existing JSON feed requires `products` and `availability` arrays. Each departure needs `id`, `productId`, `startAt`, `seatsRemaining`, `bookable`, `checkedPartySize`, `observedAt`, `expiresAt`, `sourceKind`, `evidenceUrl`, and `bookingUrl`; use `operator_manual` or `operator_feed` provenance. URLs may be `null` when unknown.

The schema assumes people: never put boats into `seatsRemaining`. Inventory-unit, customer-mix, and closure-reason fields need a model extension; retain them in onboarding notes meanwhile. Initially map confirmed per-person counts only, leaving unverified bookability unknown.

Manual mode serves `/api/availability?date=YYYY-MM-DD&partySize=2` using `INVENTORY_MODE=manual` and `INVENTORY_FILE`. It does not automatically replace the dashboard's calendar observations; connecting that feed to the dashboard is pilot implementation work.

## Acceptance check and proposed week

Days 1–2: agree permissions, fields, owner, and dates. Days 3–4: connect one source and review results. Day 5: run acceptance checks. This proposed engineering week starts after cooperation/access is available; API approval may take longer.

- Compare departures against contemporaneous operator-verified truth: variant, count/unit, time, party rules, booking link.
- Observe one real change or operator-provided test fixture; verify the update without speculative bookings/holds.
- Expire an observation: quantity and bookability become unknown. Source failures never manufacture zero.
- Test a fitting party and a known rule violation. Capacity alone must not confirm bookability.
- Test closure/cancellation separately from sold out; operator checkout confirms bookings.

## Outreach draft — not sent

**Subject:** Small availability pilot for one Miller's Landing halibut tour

Hello Miller's Landing team,

We're building Seward OneStop to help visitors find local tours and book directly with the operator. We'd like to test your Full-Day Halibut & Species in Season Charter, FareHarbor item 84318, on two or three dates you choose.

Could we work with one team member to confirm departure variants, the available per-person quantity, party restrictions, approved booking links, and how quickly observations expire? We can use a small operator-maintained feed, or pursue an approved FareHarbor connection with your participation. Please don't send credentials by email.

We would keep checkout with you, compare results against your verified inventory, and review one inventory change before expanding. The public calendar currently gives us call-to-book information, not a verified remaining-seat count. Is this pilot of interest, and who would be the right contact?

Thank you,

[Your name / business contact]
