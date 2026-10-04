# Seward OneStop: MVP plan

Decision draft, October 3, 2026. OTA means online travel agency. This repository starts the availability service; it is not a launched marketplace.

## First customer promise

“Find a Seward tour for your date and group, then book with the operator.” Start with wildlife cruises, kayaking, and flightseeing. Focus on three to five cooperating operators and a small catalog. Keep payment, cancellation, and booking confirmation in the operator's existing checkout for the first release.

The test is whether travelers use the site to find a suitable departure and whether operators can attribute resulting bookings. An initial pilot target of 20 user sessions and five attributed bookings is a proposed learning goal, not a forecast.

## Choose the smallest workable inventory route

| Route | What it can support | Dependency | MVP decision |
| --- | --- | --- | --- |
| Approved referral links / booking widgets | Browse activities and check availability in hosted checkout | Operator or affiliate agreement and approved links | Launch path if data access is slow |
| Operator-provided feed or manual updates | Timestamped departure availability; counts only if explicitly supplied | Operator cooperation, defined update cadence | First data integration; prototype supports a normalized JSON file |
| FareHarbor External API | Bookable capacity and richer availability, subject to source rules | Platform approval, credentials, supplier enablement, applicable certification | Best targeted route for participating FareHarbor suppliers |
| Rezdy reseller API | Session availability including quantities where authorized | Reseller credentials and supplier distribution agreements | Useful second connector for participating suppliers |
| Viator affiliate API | Catalog / schedule content and referral checkout; real-time checks depend on access level | Affiliate registration; approval for higher access | Broader catalog fallback; do not call Basic access live seat inventory |
| Permitted page observation | An explicit visible count, or an answer for a particular party size | Applicable platform/operator permission and ongoing verification | Secondary verification tool; do not make it the core data source |

The linked research provides the evidence and access conditions: [FareHarbor](fareharbor.md) and [other integrations and local supplier leads](integration-options.md). OCTO can standardize a connector contract, but does not itself grant access to inventory.

## What the prototype proves

The service accepts a Seward travel date and party size. It returns normalized availability with a source, observation time, expiration time, and a booking URL when configured. Demo mode uses synthetic activities and inventory. Manual mode loads a local JSON file supplied by an operator or prepared from authorized observations.

The prototype distinguishes zero, an unknown quantity, evidence about a particular group size, and expired evidence. It does not automatically collect third-party data. It does not create reservations or verify that a supplier will accept a booking.

## Product flow to build next

1. Traveler chooses a local Alaska date, party size, and activity category.
2. Search displays tours, departure times, source freshness, and either verified availability or “Check with operator.”
3. Opening a tour refreshes authorized availability, within the provider's agreed request budget.
4. “Book with operator” opens the approved checkout URL with supported referral attribution.
5. Track an outbound click; reconcile an actual booking only through an approved affiliate report or booking notification. A click is not a confirmed sale.

The total headcount in this starter is deliberately limited. Before connecting real suppliers, model adult/child/infant quantities, ages where required, shared resources, private tours, minimum group sizes, accessibility constraints, and booking cutoffs. A four-person availability check is insufficient if the provider requires customer-type quantities.

## Proposed architecture

```text
Traveler search
  -> availability API
    -> normalized evidence + freshness rules
      -> approved supplier API connector
      -> supplier-provided feed
      -> permitted observation review queue
  -> operator / affiliate checkout
```

Use a small server-side service for supplier credentials and rate limits. Node.js is sufficient for the current prototype. Add a database when several suppliers or workers need shared inventory history; a relational store can hold products, departures, source permissions, and observations. A frontend can be selected after the feed contract and booking flow are validated. There is no need to choose a large marketplace stack before proving supplier access.

A production adapter should have a bounded timeout, agreed caching window, retry with backoff for transient errors, shared rate limiting, and explicit errors. Store original provider identifiers. Preserve provenance and the last successful observation without relabeling it as current. Recheck at handoff when supported; even fresh availability is not a reservation.

## Useful roles for agents

- **Supplier research:** identify public operator booking links and draft a human-reviewed outreach list.
- **Catalog maintenance:** propose descriptions, durations, meeting points, and policies from permitted sources, with citations for review.
- **Availability verification:** after applicable permission is established, read specific departures and record the exact visible evidence, date, customer mix, and timestamp.
- **Quality checks:** detect changed page layouts, conflicting evidence, missing dates, and stale feeds; send uncertain records for review.

Use deterministic API/HTML parsers for recurring structured data when feasible. Agents are useful when interpretation or exception handling is needed. Neither an agent nor a party-size selector establishes exact remaining inventory unless the source explicitly does. Do not create test carts or holds to probe capacity, and do not treat a fetch error or omitted departure as sold out.

## Two-week pilot backlog

Access approvals may take longer than this proposed engineering schedule.

| Order | Work | Done when |
| --- | --- | --- |
| 1 | Confirm 3–5 operator partners | Each supplier's permitted content, booking link, platform, inventory access, attribution, and update expectations are recorded |
| 2 | Pick referral-only or availability pilot | At least one supplier provides an approved API or repeatable feed; otherwise launch with hosted availability checks |
| 3 | Build a small catalog and search page | Date and group filters work on mobile; demo data cannot appear as live inventory |
| 4 | Add one real connector | Provider-approved test cases cover customer types, cutoffs, unknowns, stale data, errors, and capacity semantics |
| 5 | Add booking handoff and measurement | Approved attribution survives redirect; clicks and confirmed bookings are reported separately |
| 6 | Pilot with travelers and operators | Review failed searches, incorrect matches, availability age, and actual bookings; decide whether to add a second platform |

Exclude account creation, a unified payment cart, cross-operator packages, automated cancellation handling, and a broad scraping fleet from this pilot. Add these only when the operating model and integration agreements support them.

## Operator discovery checklist

Prepare these questions for partner conversations; no messages have been sent:

- Which booking system and product IDs cover the tours we can distribute?
- Is there an affiliate program or approved referral URL? How are bookings attributed?
- Can we receive API access, a scheduled export, or manual updates? May we display numeric availability?
- Does the quantity mean bookable people, an allocated channel allotment, a private charter, or something else?
- What customer types, minimums, cutoff times, and shared resources affect bookability?
- Which media and descriptions may we reuse, and what update cadence is practical?
- Who handles cancellations, weather changes, guest support, and reconciliation?

## Launch gate

Do not present the demo as a functioning booking marketplace. A live pilot needs a cooperating supplier, authorized inventory or an honest hosted-checkout fallback, verified outbound links, a reviewed customer-facing flow, and operations ownership. Exact numeric inventory is optional for a useful MVP; reliable party-size availability and a clear booking handoff may be enough.
