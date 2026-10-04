# Vercel static deployment

This repository is ready to build a public directory site from `public/` and the committed `data/catalog.json`. The build does not run the local server, request provider websites, or expose the scraping/calendar endpoints. No deployment or Vercel project has been created by this setup.

## Import settings

Import the GitHub repository `legooz/Seward-Travel-OTA` into Vercel. Its Root Directory is the repository root (`.`), **not** the local workspace path or `public/`.

The committed `vercel.json` provides these settings:

| Setting | Value |
| --- | --- |
| Framework preset | Other |
| Install command | `npm ci --ignore-scripts --include=dev --include=optional` |
| Build command | `node scripts/build-vercel.mjs` |
| Output directory | `dist` |
| Node | Use a supported Node version satisfying `package.json` (`>=22`) |

Vercel documents [framework, install, build, output, and rewrite configuration](https://vercel.com/docs/project-configuration/vercel-json) and [the project Root Directory setting](https://vercel.com/docs/builds/configure-a-build#root-directory).

## What the public site serves

- `/`: the responsive directory, images, search, category filters, maps, and provider links.
- `/data/catalog.json`: a generated copy of the saved catalog.
- `/api/catalog`: a same-origin rewrite to that same JSON, matching the frontend's catalog request.

The generated catalog has `mode: "snapshot"` and `capabilities: { refresh: false, calendar: false }`. Every listing has `calendarSupported: false`, and any saved `availability` observation is removed. The frontend uses these capabilities to hide live controls. Original source/review timestamps remain unchanged; deployment time is not a new verification date.

`POST /api/catalog/refresh` and `POST /api/calendar/check` have no public implementation. Booking and contact links lead to the providers. Rates, seasonal schedules, and exact seat counts still require provider confirmation.

## Build and update

From the repository root:

```sh
npm ci --ignore-scripts --include=dev --include=optional
node scripts/build-vercel.mjs
```

The script regenerates only `dist/`, copies `public/`, writes the snapshot JSON, and bundles the browser analytics entry with esbuild. The locked install includes esbuild's platform binary but skips package lifecycle scripts, including browser downloads. Do not commit generated `dist/` or `.vercel/` account settings. Update/review the catalog locally, commit the source changes, and rebuild or redeploy to publish a newer saved snapshot. No API secrets or provider credentials are needed.

After choosing to deploy, check `/`, `/api/catalog`, category navigation, images, provider links, and that source-refresh/calendar buttons are absent. Live collection remains available through `npm start` on localhost. A future public inventory service needs a separate deployment with deliberate authentication, allowed origins, rate limits, and provider access; this static setup does not enable it.

## Optional production analytics

Enable **Web Analytics** in the Vercel project and set the environment variable `SEWARD_ANALYTICS_ENABLED=true` for the **Production** environment. Redeploy production to apply it. The build enables the SDK only when that exact value and Vercel's `VERCEL_ENV=production` are both present; preview, development, and ordinary local builds keep analytics disabled.

The build bundles `public/analytics.js` and `@vercel/analytics` into an IIFE at `dist/analytics.js`, defines `__SEWARD_ANALYTICS_ENABLED__`, and inserts its deferred script after `app.js` in generated HTML. Source HTML stays unchanged, and the local app does not load the analytics entry. The bundle remains available in disabled builds, with collection guarded off.

The build also passes Vercel's public `VERCEL_OBSERVABILITY_CLIENT_CONFIG` string to the SDK's `inject` function for its version 2 dynamic collection paths. Without that configuration, the SDK uses its default `/_vercel/insights/script.js` path. No other environment variables or secrets are bundled. See [dynamic configuration](https://vercel.com/docs/analytics/package#dynamic-configuration).

Vercel explains [enabling Web Analytics and adding its SDK](https://vercel.com/docs/analytics/quickstart) and [custom-event tracking](https://vercel.com/docs/analytics/custom-events). Custom-event access depends on the project's Vercel plan; verify it before relying on click-event reports. Page and event data will appear only after an enabled production deployment receives visits.
