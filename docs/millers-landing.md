# First target: Miller's Landing

Checked October 3, 2026 through public website and rendered-calendar inspection. The unattended scraper was not run. No customer information, booking form, cart, hold, or reservation was created. Platform automation permission has not been confirmed.

## Verified target

The operator's [Full-Day Halibut & Species in Season page](https://www.millerslandingak.com/seward-alaska-fishing/full-day-halibut-species-in-season-charter/) links to FareHarbor company `millerslandingak`, item `84318`. The page offers individual and whole-boat purchases. Its Islay M angler capacity conflicts between the rate card and vessel description, so do not hardcode that capacity or treat it as current inventory.

The [rendered FareHarbor calendar](https://fareharbor.com/embeds/book/millerslandingak/items/84318/calendar/?ref=https://www.millerslandingak.com&full-items=yes) exposed month/year controls and date selection. On both sample dates, April 9 and July 15, 2027, it displayed two 6 AM departures, with 10-passenger and 14-passenger boat labels, each marked **Call to book**. No numeric remaining inventory was displayed in those sample calendar results. These are limited observations, not a claim about every date, a price quote, or current bookability.

## Consequence for the MVP

Treat “Call to book” as contact required with unknown remaining inventory. The numbers inside boat names describe the boat; they do not report seats left. Preserve the distinction between individual places, exclusive charters, and participant types.

The current generic collector cannot be enabled by simply inserting this URL: it expects already-rendered departure rows and ISO `datetime` attributes, while this observed flow needs calendar selection and a verified interpretation of date/time labels. A dedicated adapter must be calibrated against rendered evidence before any unattended run. A normal calendar redirect also changes the URL, so configure the verified canonical calendar address rather than guessing redirect exceptions.

If numeric counts are the business requirement, first establish whether the operator or approved FareHarbor API can supply them. If only contact-required results are exposed, the honest MVP is a catalog listing with a booking/contact link. A browser agent cannot derive hidden remaining inventory from the displayed boat size.

The [operator profile](../examples/operators/millers-landing.json) saves verified identifiers for the next integration step. It is deliberately separate from scraper configuration and availability feeds. Before production use, confirm supplier participation and platform access, choose the exact product/customer types, validate representative dates, and agree on freshness and referral attribution.
