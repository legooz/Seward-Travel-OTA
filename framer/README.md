# Framer Welcome and Booking pages

`SewardTours.tsx` supplies two layouts selected through the **Page** property. Both show **Welcome | Booking | Interest** navigation. Interest opens the [Seward OneStop interest form](https://forms.zohopublic.com/vcprovenzagm1/form/SewardOneStop/formperma/8Q_3lbfTA-WTfM0g8tOUpenqwokVZkm9vclwHw3Vxyg) in a new tab.

| Page | Path | Framer page ID | Content |
| --- | --- | --- | --- |
| Welcome (default) | `/` | `augiA20Il` | Video-only concept preview with native controls and **Browse bookings**. No catalog request. |
| Booking | `/booking` | `TPt6fFlZ6` | Restored photo hero, three hero choices, and the provider directory. |

The video shows simulated bookings and prices, starts muted only when reduced motion is not requested, and provides a playback fallback. It does not represent live inventory.

## Saved directory

Booking fetches the [public saved catalog](https://raw.githubusercontent.com/legooz/Seward-Travel-OTA/main/data/catalog.json), with the same 12 records embedded as fallback: three lodging properties, six tours, and three transportation services. Loading JSON does not scrape providers or refresh availability. Records retain their source/review dates.

Lodging is selected initially. The directory has keyword search and four filters: **Lodging**, **Activities**, **Transport**, and **All listings**. Changing type clears search. There are no subcategory, duration, or sort controls. Published durations remain listing facts, with evidence in expandable provider details.

Rows show photos, locations/maps, descriptions, advertised price context, and official provider actions. Eleven photos reference official provider URLs; PJS Taxi and failed images use neutral placeholders. Source links, photo credits, location evidence, and review dates remain in provider details. The NPS hero credit is documented in `public/images/CREDITS.md`.

Saved JSON availability is ignored. Visitors confirm current rates, dates, schedules, and inventory with providers. Hotel rates are not verified nightly quotes. Published tour capacity does not establish remaining seats.

## Configure the Framer draft

Use the [Seward OneStop Framer project](https://framer.com/projects/Seward-Travel-OTA--A33lhKdvf8vZbhWz3M9d-1b3iI). Repository edits do not update the code editor or publish Framer.

1. Paste the complete `SewardTours.tsx` into the existing code file and save.
2. Set the existing Home/Welcome instance to **Page: Welcome**.
3. Set the Booking instance to **Page: Booking**, with **Show Hero** enabled.
4. Use fill width and content/auto height. Keep duplicate native template heroes and sections hidden at every breakpoint.

| Property | Behavior |
| --- | --- |
| **Page** (`page`) | Welcome by default; select Booking on `/booking`. |
| **Show Hero** (`showHero`) | On by default. Controls only Booking's photo hero and three category choices. The header always remains visible. |
| **Catalog URL** (`sourceURL`) | Public HTTPS saved JSON used by Booking. |
| **API Base** (`apiBase`) | Blank by default. Keep blank for the saved-catalog demo. |

Internal links use Framer's standard `Link`, the page IDs above, and `motionChild` with `motion.a`. Each page was individually reviewed in desktop and mobile editor preview. **Cross-page links did not switch pages in editor preview; navigation requires validation on a published Framer site.** Separate page previews are not an end-to-end routing check. The Interest destination was opened successfully and displayed the Seward OneStop form.

The public website build and current 20 analytics/server tests pass. These checks do not establish published Framer navigation behavior.

## Data updates and optional live backend

Reviewed tour metadata lives in `data/operators.json`; lodging/transportation snapshots live in `data/vendors.json`. After source review, regenerate `data/catalog.json`, synchronize embedded `SAVED_CATALOG`, and repaste the component. Preserve timestamps unless the underlying source was actually rechecked.

Optional API mode requires a separately deployed HTTPS backend exposing `GET /api/catalog`, `POST /api/catalog/refresh` with `{}`, and `POST /api/calendar/check` with `{productId,date}`. The current server accepts local Host/Origin values only. Public hosting needs deliberate authentication/origin rules, CORS/preflight support, limits, and authorized provider access. Requests omit browser credentials. Never put secrets in component properties or source.

Exact counts require current operator evidence for the selected date, valid observation/expiry timestamps, and an integer count explicitly measured in people. Missing, stale, ambiguous, or unsupported counts remain unknown. Lodging and transportation do not trigger tour-calendar checks; counts alone do not guarantee a particular party can book.

Official references: [code components](https://www.framer.com/developers/components-introduction), [property controls](https://www.framer.com/developers/property-controls), and [CORS and secret handling](https://www.framer.com/developers/fetch-examples).
