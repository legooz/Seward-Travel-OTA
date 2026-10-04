# FareHarbor browser collector

This is a configurable scraper foundation, with offline evidence conversion tested locally. **It has not been calibrated or tested against a live FareHarbor operator page.** The example configuration deliberately has no URL or selectors. A page-specific adapter is still needed before it can collect real departures.

The first identified operator is [Miller's Landing](millers-landing.md). Limited public-calendar inspection confirmed FareHarbor use and contact-required departures, but did not establish numeric remaining seats or validate the unattended collector.

## What it does

- Opens one configured FareHarbor HTTPS page using Playwright.
- Waits for a configured ready element, then reads visible departure rows.
- Requires a full ISO departure timestamp with timezone in each row's `datetime` attribute.
- Reads a dedicated availability label and optionally preserves price wording.
- Converts explicit English labels into the project's normalized feed and saves the original text beside it.
- Stops on unexpected redirects, access challenges, missing rows, ambiguous selectors, or errors. A failed run does not overwrite a previous capture.

This first version does not select calendar dates, change party quantities, enter forms, click booking buttons, create holds, or make reservations. It does not infer inventory from dropdown limits. It does not query private endpoints, reuse login sessions, solve access challenges, or rotate proxies. Pages requiring a read request using POST will fail with the current read-only network policy; that policy must not be silently relaxed.

## Offline demonstration

No browser, account, API key, or network access is used by this command:

```sh
npm run scrape -- --fixture examples/scraper-observation.json --out private-feeds/fixture-observation.json
```

Output is an observation bundle with `mode`, `feed`, `evidence`, and `warnings`. It never overwrites an existing output file: choose a new filename for a new capture. The fixture is synthetic and deliberately expired. Importing it must not present it as current availability.

Examples of conversion:

| Exact visible label | Recorded result |
| --- | --- |
| `Only 6 seats left` | Reported count 6; party bookability unknown |
| `0 seats remaining` | Explicit zero |
| `Sold out` | Unavailable; exact numeric count remains unknown |
| `Up to 6 guests` | Unknown |
| `6 seats remaining / 2 seats remaining` | Unknown with warning |

Price is stored as raw evidence text, not a checkout quote. Positive party checks are not implemented because the current feed does not represent adult/child composition and resource constraints.

## Configure a live page

FareHarbor's terms, section 5.1, require express written permission for commercial automated access. Confirm applicable permission before operating this collector. An operator's participation should not be assumed to grant platform-wide access. [FareHarbor customer terms](https://fareharbor.com/legal/tos-customers/)

Install the optional browser dependency and Chromium:

```sh
npm ci
npx playwright install chromium
```

Copy `examples/scraper-config.json` to the ignored `private-feeds/` directory. Set:

- `pageUrl`: the exact approved booking URL showing the intended product/date.
- `product`: the verified tour identifier, name, and approved booking URL.
- `selectors.ready`: a marker confirming that the intended departure list is loaded.
- `selectors.departure`: the container for each departure of this one product.
- `selectors.time`: a visible descendant with a complete ISO `datetime` attribute.
- `selectors.evidence`: one visible descendant containing only the availability label.
- Optional `selectors.price` and `frameSelector` if needed.
- `ttlSeconds`: the agreed freshness window, from 1 to 900 seconds.

These are configuration fields, not known FareHarbor selectors. Inspect the actual rendered page before supplying them. If the page provides only an ambiguous time, needs calendar interaction, or has no timestamp attribute, implement and test an operator-specific adapter. Do not invent a date, timezone, or remaining count to make the sample fit.

Then run one capture:

```sh
npm run scrape -- --config private-feeds/operator-config.json --out private-feeds/operator-observation-001.json
```

Review the evidence bundle before using its `feed` object. In PowerShell, extract that object into a separate local feed:

```powershell
$observation = Get-Content './private-feeds/operator-observation-001.json' -Raw | ConvertFrom-Json
$observation.feed | ConvertTo-Json -Depth 12 | Set-Content './private-feeds/operator-feed-001.json' -Encoding utf8
$env:INVENTORY_MODE = 'manual'
$env:INVENTORY_FILE = (Resolve-Path './private-feeds/operator-feed-001.json').Path
npm start
```

The observation timestamp is the capture time; conversion never renews it. Consumers must still apply expiry and party-size rules. Each run uses a fresh browser context, no stored login, a 60-second browser deadline, and no automatic retries or scheduled polling. Collection is incomplete coverage: missing departures are not evidence of zero inventory.

## Validation and remaining work

Unit tests cover evidence interpretation, source timestamps, feed validation, and collector control flow with a simulated page. They do not establish compatibility with a real FareHarbor widget. The remaining work is choosing the first operator, verifying permission and the booking flow, recording representative rendered-page fixtures, adding its selectors or adapter, and checking the observations against the operator's own availability.

For dependable production inventory, the [approved FareHarbor API](https://developer.fareharbor.com/api/external/v1/) remains preferable when access is available. The browser collector is an alternative for permitted visible evidence, not access to undisclosed capacity.
