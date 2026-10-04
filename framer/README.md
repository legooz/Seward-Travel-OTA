# Framer catalog component

`SewardTours.tsx` is a self-contained React 18-compatible Framer code component with Seward Travel OTA branding, search, activity/platform filters, advertised prices and caveats, source timestamps, and operator booking links. It includes a compact header and footer; the main page hero stays in Framer. Its root anchor is `seward-tours`.

## Current data connection

By default, the component fetches the [public saved catalog JSON](https://raw.githubusercontent.com/legooz/Seward-Travel-OTA/main/data/catalog.json). **Reload saved catalog** downloads that file again; it does not scrape an operator or refresh inventory.

Six real operator records are embedded as a fallback while the request loads or if it fails: Miller’s Landing, Seward Ocean Excursions, Kayak Adventures Worldwide, Seward Helicopter Tours, Sunny Cove Kayaking, and Adventure Sixty North. The embedded snapshot retains its original October 3, 2026 Alaska-time observations. Errors are displayed, and previous observations remain visible.

This default mode has no public live scraper or live seat inventory. It does not use availability values from the saved JSON, and it hides calendar dates because no live date check is connected. Advertised prices are not checkout quotes; visitors finish booking on the operator’s website.

## Add or update in Framer

The component is installed on the Home page of the [Seward Travel OTA Framer project](https://framer.com/projects/Seward-Travel-OTA--A33lhKdvf8vZbhWz3M9d-1b3iI). The saved draft includes Seward hero copy, the NPS glacier photo credited in `public/images/CREDITS.md`, updated homepage metadata, and the catalog below the hero. Generic template sections and shared navigation/footer are hidden, not deleted. Other template pages have not been rewritten. No public Framer publish was performed.

Verified in Framer preview: the public JSON loaded six experiences; Kayaking filtered to three; Kayaking plus Resmark filtered to one; a Miller search returned Miller’s Landing; the hero anchor reached the catalog; and the catalog fit a 390-pixel phone preview without horizontal overflow. TSX transpilation also passed.

1. Open **Assets → Code → Create Code File**, or open the existing component code file.
2. Paste the complete contents of `SewardTours.tsx` and save.
3. Insert the component below the native hero. Use full/fill width and content/auto height; the component adapts to its container.
4. Link the hero’s tour button to `/#seward-tours`, then preview desktop and mobile.

| Property control | Current default |
| --- | --- |
| **Catalog URL** (`sourceURL`) | Public GitHub JSON linked above. Must be a public HTTPS URL. |
| **API Base** (`apiBase`) | Blank. Keep blank for the saved catalog demo. |

Editing this repository file does not automatically update the copy pasted into Framer. Publish through Framer when the page is ready; this file alone does not publish a site.

## Future live backend

The optional API mode shows the date selector and selected date on each calendar panel. It expects a separately hosted public HTTPS backend exposing `GET /api/catalog`, `POST /api/catalog/refresh` with `{}`, and `POST /api/calendar/check` with `{productId,date}`. The current repository server intentionally accepts only local Host/Origin values. Public deployment needs deliberate Host/Origin rules, CORS for the editor and published site, preflight handling, and request/scrape limits. No guard bypass or public deployment is supplied by this component.

Requests omit browser credentials. Do not put provider keys or other secrets in Framer properties or component code. The component rejects localhost, IP-literal URLs, and common local-only hostnames; these URL checks do not replace backend security.

Exact counts require real operator inventory evidence returned by the backend: an observed result for the selected date, a nonnegative integer count explicitly measured in people, and valid, current observation/expiry timestamps. Missing, ambiguous, expired, or unsupported counts remain unknown. Boat capacities do not establish remaining seats, and a count does not guarantee availability for a particular party.

Official references: [code components](https://www.framer.com/developers/components-introduction), [property controls](https://www.framer.com/developers/property-controls), and [backend CORS and secret handling](https://www.framer.com/developers/fetch-examples).
