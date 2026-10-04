# Seward OneStop venue QR tracking

Each printed QR should link to the final production homepage with a placement code, for example `https://YOUR-PRODUCTION-DOMAIN/?venue=venue-01`. Use a different code for each venue or sign location. The domain above is a placeholder: do not print it. Edit the allowlist in `public/venue-tracking.js` to match agreed placements before deploying. `venue-01`, `venue-02`, and `demo-venue` are examples, not claimed venue partnerships.

## What the MVP records

| Event | Properties | Meaning |
| --- | --- | --- |
| `qr_landing` | `venue` | Page loaded with a recognized placement code |
| `category_select` | `venue`, `category` | Visitor chose Lodging, Activities, Transport, or All |
| `provider_click` | `venue`, `listingId` | Visitor followed the main provider/booking link |
| `map_click` | `venue`, `listingId` | Visitor opened a listing's map |

Each event has at most two properties, compatible with standard Vercel Pro custom events. Direct visitors use `unattributed` for click events. No persistent visitor IDs or browser storage are added. Attribution remains on the current page while people filter and browse; it does not follow someone across devices, visits, or provider websites. Query strings, hashes, and arbitrary paths are removed from the URL sent to analytics; only a recognized `venue` code survives. Searches, names, emails, travel dates, and outbound URLs are not event properties. Unknown placement codes are ignored.

`qr_landing` is a page-load count, not a verified camera-scan count: refreshes and shared QR links can create additional landings. A tagged visit does not prove physical presence. Clicks do not prove completed bookings. Ad blockers and privacy settings can reduce counts. Vercel's unique-visitor count uses an anonymous hash that resets daily, not an identified person.

## Enable after deployment

1. Follow [the Vercel setup](vercel.md) and connect the production domain.
2. Enable Web Analytics for the Vercel project and use a plan with custom events. Standard Pro is sufficient for the events above; this implementation does not depend on paid UTM reporting.
3. Set `SEWARD_ANALYTICS_ENABLED=true` for the **Production** environment and redeploy. Both this flag and `VERCEL_ENV=production` are required. Local and Preview builds stay disabled. The frontend also skips analytics if Do Not Track or Global Privacy Control is enabled.
4. Open the final domain with `?venue=demo-venue`, select a category, and follow a provider link. In Vercel Analytics, verify the page view and the three event types with that venue before printing real signs. An actual dashboard receipt has not yet been verified because the site has not been deployed.
5. Create each QR from its final placement URL, test it on a phone using mobile data, and label the physical sign and your placement register with the same code.

In Vercel Analytics, use the Events view to inspect `qr_landing`, `category_select`, and `provider_click` by their `venue` property. This is the MVP reporting view; no separate staff dashboard or export service has been built. Track the trend from landings to provider clicks as a directional metric, not a per-person conversion funnel.

## If you need to know who visited

Add a voluntary email signup, saved itinerary, or account flow with a clear explanation of how it will be used. Store that information in a separate customer database with appropriate access controls. A visitor would choose to identify themselves; a QR code alone cannot supply their name or email. Keep contact data out of QR URLs and Vercel analytics. Verified bookings would require provider referral/affiliate reporting or a booking API/webhook relationship.

## Official references

- [Vercel Analytics quickstart](https://vercel.com/docs/analytics/quickstart)
- [Custom events](https://vercel.com/docs/analytics/custom-events)
- [Analytics privacy](https://vercel.com/docs/analytics/privacy-policy)
- [Analytics pricing and plan limits](https://vercel.com/docs/analytics/limits-and-pricing)

Checked October 3, 2026 (Alaska time). Commercial use requires an appropriate Vercel plan; Hobby is designated for personal, noncommercial use. Recheck current pricing before enabling paid features.
