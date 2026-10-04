import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

// Paste this entire file into Assets > Code > Create Code File in Framer.
// The default mode reads a PUBLIC SAVED SNAPSHOT. It does not run a scraper.
// Only configure API Base after separately deploying and securing the backend.
// Never place API keys, cookies, provider credentials, or secrets in this file.

const DEFAULT_SOURCE = "https://raw.githubusercontent.com/legooz/Seward-Travel-OTA/main/data/catalog.json"
type Departure = { id: string; time: string; label: string; remaining: number | null; unit: string; evidenceText: string }
type Availability = { status: string; date: string; checkedAt?: string; expiresAt?: string; lastAttemptAt?: string; message?: string; departures: Departure[] }
type Product = { id: string; operator: string; name: string; category: string; platform: string; sourceUrl: string; bookingUrl: string; priceText: string | null; durationText: string | null; priceCaveat?: string; checkedAt?: string | null; lastAttemptAt?: string | null; fetchStatus: string; error?: string; calendarSupported?: boolean; availability?: Availability; inventoryUnit?: string }
type Catalog = { products: Product[]; refreshedAt: string | null; notice: string }
type Props = { sourceURL?: string; apiBase?: string; style?: React.CSSProperties }

// Exact saved operator observations copied from data/catalog.json, not sample inventory.
const SAVED_CATALOG: Catalog = {
  "products": [
    {
      "id": "millers-landing-halibut",
      "operator": "Miller's Landing",
      "name": "Full-Day Halibut & Species in Season Charter",
      "category": "Fishing",
      "platform": "fareharbor",
      "sourceUrl": "https://www.millerslandingak.com/seward-alaska-fishing/full-day-halibut-species-in-season-charter/",
      "bookingUrl": "https://fareharbor.com/embeds/book/millerslandingak/items/84318/?full-items=yes&ref=https%3A%2F%2Fwww.millerslandingak.com",
      "priceText": "$ 465 — Person",
      "durationText": "Trips & Duration: Full Day",
      "priceCaveat": "Advertised person rate; separate whole-boat options and fuel surcharges are listed. This is not a checkout quote.",
      "inventoryUnit": "people",
      "checkedAt": "2026-10-04T03:05:56.061Z",
      "lastAttemptAt": "2026-10-04T03:05:56.061Z",
      "fetchStatus": "ok",
      "calendarSupported": true
    },
    {
      "id": "seward-ocean-excursions-half-day",
      "operator": "Seward Ocean Excursions",
      "name": "Kenai Fjords and Resurrection Bay Half Day Tour",
      "category": "Wildlife cruises",
      "platform": "fareharbor",
      "sourceUrl": "https://sewardoceanexcursions.com/tourssightseeing/",
      "bookingUrl": "https://fareharbor.com/embeds/book/sewardoceanexcursions/items/192210/?full-items=yes&flow=291643",
      "priceText": "Cost: $199/person",
      "durationText": "Trip Length: 3.5 hours",
      "priceCaveat": "Advertised per-person rate; the private evening charter is a separate sale option. Confirm final charges with the operator.",
      "inventoryUnit": "people",
      "checkedAt": "2026-10-04T03:05:56.076Z",
      "lastAttemptAt": "2026-10-04T03:05:56.076Z",
      "fetchStatus": "ok",
      "calendarSupported": true
    },
    {
      "id": "kayak-adventures-resurrection-bay",
      "operator": "Kayak Adventures Worldwide",
      "name": "Resurrection Bay Half Day Kayak Tour",
      "category": "Kayaking",
      "platform": "fareharbor",
      "sourceUrl": "https://www.kayakak.com/kayaking-trips/half-day-resurrection-bay-trip/",
      "bookingUrl": "https://fareharbor.com/embeds/book/kayakak/items/122343/?full-items=yes&flow=112838",
      "priceText": "$149 per person",
      "durationText": "Half Day",
      "priceCaveat": "Advertised per-person rate, not a checkout total. Adult and Family Tour options have different group rules.",
      "inventoryUnit": "people",
      "checkedAt": "2026-10-04T03:05:56.838Z",
      "lastAttemptAt": "2026-10-04T03:05:56.838Z",
      "fetchStatus": "ok",
      "calendarSupported": true
    },
    {
      "id": "seward-helicopters-glacier-dog-sledding",
      "operator": "Seward Helicopter Tours",
      "name": "Glacier Dog Sledding",
      "category": "Helicopter and dog sledding",
      "platform": "rezdy",
      "sourceUrl": "https://sewardhelicopters.com/seward-dog-sled-tours/",
      "bookingUrl": "https://sewardadventurecenter.rezdy.com/39253/helicopter-glacier-dog-sledding",
      "priceText": "$599 per adult, $610.50 with tax and land use fees",
      "durationText": "This excursion lasts approximately 90 minutes.",
      "priceCaveat": "Adult pricing; child and comfort-seat prices differ. Online booking fees are additional to the displayed tax/land-use amount.",
      "inventoryUnit": "people",
      "checkedAt": "2026-10-04T03:05:57.106Z",
      "lastAttemptAt": "2026-10-04T03:05:57.106Z",
      "fetchStatus": "ok",
      "calendarSupported": false
    },
    {
      "id": "sunny-cove-resurrection-bay",
      "operator": "Sunny Cove Kayaking",
      "name": "Resurrection Bay Tour: Half-Day Kayaking, Two Trips Daily",
      "category": "Kayaking",
      "platform": "resmark",
      "sourceUrl": "https://www.sunnycove.com/resurrection-bay-tour",
      "bookingUrl": "https://sunnycove.app.resmarksystems.com/public/product/610c0584d7d1c900190955dd/QzBd0U",
      "priceText": "from $129 per person + tax/fee",
      "durationText": "Half-Day",
      "priceCaveat": "Advertised from-price plus tax/fee, not a live checkout total.",
      "inventoryUnit": "people",
      "checkedAt": "2026-10-04T03:05:57.522Z",
      "lastAttemptAt": "2026-10-04T03:05:57.522Z",
      "fetchStatus": "ok",
      "calendarSupported": false
    },
    {
      "id": "adventure-sixty-north-tonsina-point",
      "operator": "Adventure Sixty North",
      "name": "Tonsina Point Kayak",
      "category": "Kayaking",
      "platform": "fareharbor",
      "sourceUrl": "https://adventure60.com/kayaking/tonsina-point-resurrection-bay-kayaking-adventure/",
      "bookingUrl": "https://fareharbor.com/embeds/book/adventure60/items/335727/calendar/?ref=https%3A%2F%2Fadventure60.com&branding=yes",
      "priceText": "$ 130 — Adult Ages 18+",
      "durationText": "Duration: 3 to 4 Hours, Half Day",
      "priceCaveat": "Advertised adult price. The page lists a separate $6 park fee per person added during booking.",
      "inventoryUnit": "people",
      "checkedAt": "2026-10-04T03:05:57.608Z",
      "lastAttemptAt": "2026-10-04T03:05:57.608Z",
      "fetchStatus": "ok",
      "calendarSupported": true
    }
  ],
  "refreshedAt": "2026-10-04T03:05:58.667Z",
  "notice": "Public operator product pages were read for catalog facts only. Prices are advertised wording, not live quotes; schedules and capacity descriptions are not remaining inventory. Check each source and its fees before booking."
}

function publicURL(value: unknown): string | null {
    if (typeof value !== "string" || value.length > 4000) return null
    try {
        const url = new URL(value)
        const host = url.hostname.toLowerCase().replace(/\.$/, "")
        if (url.protocol !== "https:" || url.username || url.password || !host.includes(".") || /[\[\]:]/.test(host) || /^\d+(?:\.\d+)*$/.test(host)) return null
        if (/(?:^|\.)(?:localhost|local|internal|test|invalid)$/.test(host) || host.endsWith(".home.arpa")) return null
        return url.href
    } catch { return null }
}

function backendBase(value: string): string | null {
    const valid = publicURL(value.trim())
    if (!valid) return null
    const url = new URL(valid)
    return url.search || url.hash ? null : valid.replace(/\/$/, "")
}

function isDate(value: string): boolean {
    const parsed = Date.parse(`${value}T12:00:00Z`)
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value
}

function timestamp(value?: string | null): number {
    const match = typeof value === "string" && /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value)
    if (!match || !isDate(match[1]) || +match[2] > 23 || +match[3] > 59 || +match[4] > 59) return NaN
    const offset = match[5]
    if (offset !== "Z" && (+offset.slice(1, 3) > 14 || +offset.slice(4) > 59 || (+offset.slice(1, 3) === 14 && +offset.slice(4) !== 0))) return NaN
    return Date.parse(value as string)
}

function checkedTime(value?: string | null): string {
    const time = timestamp(value)
    return Number.isFinite(time) ? new Intl.DateTimeFormat("en-US", { timeZone: "America/Anchorage", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(time) + " AK" : "Not verified"
}

const text = (value: unknown, limit = 2000): string => typeof value === "string" ? value.slice(0, limit) : ""
const platformLabel = (value: string) => value === "fareharbor" ? "FareHarbor" : value ? value[0].toUpperCase() + value.slice(1) : "Operator website"

function readAvailability(value: any): Availability | undefined {
    if (!value || typeof value !== "object" || !["observed", "not_checked", "error", "unsupported"].includes(value.status) || !isDate(text(value.date))) return undefined
    return {
        status: value.status, date: value.date, checkedAt: text(value.checkedAt), expiresAt: text(value.expiresAt), lastAttemptAt: text(value.lastAttemptAt), message: text(value.message),
        departures: Array.isArray(value.departures) ? value.departures.slice(0, 100).map((row: any, index: number) => ({
            id: text(row?.id) || `observation-${index}`, time: text(row?.time), label: text(row?.label),
            remaining: Number.isSafeInteger(row?.remaining) && row.remaining >= 0 ? row.remaining : null,
            unit: row?.unit === "people" ? "people" : "unknown", evidenceText: text(row?.evidenceText, 5000),
        })) : [],
    }
}

function readCatalog(value: any, withAvailability: boolean): Catalog {
    if (!value || !Array.isArray(value.products) || value.products.length > 100) throw new Error("The source did not return a supported catalog.")
    const ids = new Set<string>()
    const products = value.products.map((row: any): Product => {
        if (!row || typeof row.id !== "string" || !row.id || typeof row.name !== "string" || !row.name || ids.has(row.id)) throw new Error("The catalog has missing or duplicate tour information.")
        ids.add(row.id)
        return {
            id: text(row.id), name: text(row.name), operator: text(row.operator), category: text(row.category) || "Experiences", platform: text(row.platform).toLowerCase(),
            sourceUrl: publicURL(row.sourceUrl) || "", bookingUrl: publicURL(row.bookingUrl) || "",
            priceText: text(row.priceText) || null, durationText: text(row.durationText) || null, priceCaveat: text(row.priceCaveat),
            checkedAt: text(row.checkedAt), lastAttemptAt: text(row.lastAttemptAt), fetchStatus: row.fetchStatus === "ok" ? "ok" : "error", error: text(row.error?.message || row.error),
            calendarSupported: row.calendarSupported === true, availability: withAvailability ? readAvailability(row.availability) : undefined,
        }
    })
    return { products, refreshedAt: text(value.refreshedAt) || null, notice: text(value.notice) }
}

async function getJSON(url: string, signal: AbortSignal, body?: object): Promise<any> {
    const response = await fetch(url, {
        method: body ? "POST" : "GET", mode: "cors", credentials: "omit", redirect: "error", cache: "no-store", signal,
        headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const raw = await response.text()
    if (raw.length > 2_000_000) throw new Error("The catalog response is too large.")
    let value: any
    try { value = JSON.parse(raw) } catch { throw new Error(`The source returned an unreadable response (HTTP ${response.status}).`) }
    if (!response.ok) throw new Error(text(value?.error?.message || value?.message) || `The request failed (HTTP ${response.status}).`)
    return value
}

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
    const safe = publicURL(href)
    return safe ? <a className={className} href={safe} target="_blank" rel="noopener noreferrer">{children}<span className="swt-sr"> (opens a new tab)</span></a> : <span className={className}>Link unavailable</span>
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1120
 * @framerIntrinsicHeight 1500
 */
export default function SewardTours({ sourceURL = DEFAULT_SOURCE, apiBase = "", style }: Props) {
    const [catalog, setCatalog] = React.useState<Catalog>(SAVED_CATALOG)
    const [mode, setMode] = React.useState<"embedded" | "snapshot" | "backend">("embedded")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState("")
    const [search, setSearch] = React.useState("")
    const [category, setCategory] = React.useState("all")
    const [platform, setPlatform] = React.useState("all")
    const [date, setDate] = React.useState("2027-07-15")
    const [checking, setChecking] = React.useState<string | null>(null)
    const [now, setNow] = React.useState(() => Date.now())
    const requestSequence = React.useRef(0)
    const active = React.useRef<AbortController | null>(null)
    const backend = React.useMemo(() => backendBase(apiBase), [apiBase])
    const source = React.useMemo(() => publicURL(sourceURL), [sourceURL])
    const categories = Array.from(new Set(catalog.products.map(product => product.category)))
    const platforms = Array.from(new Set(catalog.products.map(product => product.platform)))
    const filtered = catalog.products.filter(product => (category === "all" || product.category === category) && (platform === "all" || product.platform === platform) && `${product.name} ${product.operator} ${product.category}`.toLowerCase().includes(search.toLowerCase().trim()))
    const configuredError = apiBase.trim() && !backend ? "API Base must be a public HTTPS URL without credentials, a query, or a fragment. Local addresses are not supported." : !backend && !source ? "Catalog URL must be a public HTTPS URL. The embedded saved snapshot is shown." : ""

    const load = React.useCallback(async (refresh = false) => {
        active.current?.abort()
        const controller = new AbortController()
        active.current = controller
        const sequence = ++requestSequence.current
        const timeout = setTimeout(() => controller.abort(), refresh ? 120_000 : 25_000)
        setLoading(true)
        setError("")
        try {
            if (apiBase.trim() && !backend) throw new Error("Configure a public HTTPS backend to enable calendar checks.")
            const endpoint = backend ? `${backend}/api/catalog${refresh ? "/refresh" : ""}` : source
            if (!endpoint) throw new Error("The catalog source URL is invalid.")
            const value = await getJSON(endpoint, controller.signal, backend && refresh ? {} : undefined)
            const next = readCatalog(value, Boolean(backend))
            if (requestSequence.current !== sequence) return
            setCatalog(next)
            setMode(backend ? "backend" : "snapshot")
            setNow(Date.now())
        } catch (reason) {
            if (requestSequence.current !== sequence) return
            setError(reason instanceof Error && reason.name !== "AbortError" ? reason.message : "The request timed out. The previous saved observations remain visible.")
        } finally {
            clearTimeout(timeout)
            if (requestSequence.current === sequence) setLoading(false)
        }
    }, [backend, source, apiBase])

    React.useEffect(() => {
        // Switching data sources never carries over a previous backend's observations.
        setCatalog(SAVED_CATALOG)
        setMode("embedded")
        setChecking(null)
        load()
        return () => { requestSequence.current++; active.current?.abort() }
    }, [load])

    React.useEffect(() => {
        // Expired counts disappear even while the visitor leaves this page open.
        const timer = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(timer)
    }, [])

    async function checkCalendar(product: Product) {
        if (!backend || mode !== "backend" || checking || loading || !isDate(date)) return
        const requestedDate = date
        const controller = new AbortController()
        active.current = controller
        const sequence = ++requestSequence.current
        const timeout = setTimeout(() => controller.abort(), 90_000)
        setChecking(product.id)
        try {
            const result = await getJSON(`${backend}/api/calendar/check`, controller.signal, { productId: product.id, date: requestedDate })
            const observation = readAvailability(result?.availability)
            if (result?.productId !== product.id || !observation || observation.date !== requestedDate) throw new Error("The calendar did not return this tour and date.")
            if (requestSequence.current !== sequence) return
            setCatalog(previous => ({ ...previous, products: previous.products.map(item => item.id === product.id ? { ...item, availability: observation } : item) }))
            setNow(Date.now())
        } catch (reason) {
            if (requestSequence.current !== sequence) return
            const message = reason instanceof Error && reason.name !== "AbortError" ? reason.message : "The calendar request timed out."
            const observation: Availability = { status: "error", date: requestedDate, lastAttemptAt: new Date().toISOString(), message: `${message} Remaining capacity is unknown.`, departures: [] }
            setCatalog(previous => ({ ...previous, products: previous.products.map(item => item.id === product.id ? { ...item, availability: observation } : item) }))
        } finally {
            clearTimeout(timeout)
            if (requestSequence.current === sequence) setChecking(null)
        }
    }

    function calendar(product: Product) {
        const observation = mode === "backend" ? product.availability : undefined
        const sameDate = observation?.date === date
        const observed = timestamp(observation?.checkedAt)
        const expiry = timestamp(observation?.expiresAt)
        const fresh = Number.isFinite(observed) && Number.isFinite(expiry) && observed <= now && expiry > observed && expiry > now
        const isChecking = checking === product.id
        const supported = mode === "backend" && Boolean(backend) && product.platform === "fareharbor" && product.calendarSupported === true
        return <section className="swt-calendar" aria-label={`Calendar for ${product.name}`}>
            <div className="swt-calendar-heading"><strong>Remaining places</strong>{backend && <span>{isDate(date) ? date : "Choose a date"}</span>}</div>
            {isChecking ? <p role="status">Reading the operator’s public calendar…</p>
                : observation && sameDate && observation.status === "observed" ? <>
                    {!fresh && <p className="swt-muted">This observation is expired or its freshness cannot be verified. Check again for current counts.</p>}
                    {observation.departures.length ? <ul className="swt-departures">{observation.departures.map((departure, index) => {
                        const exact = fresh && departure.unit === "people" && Number.isSafeInteger(departure.remaining) && (departure.remaining as number) >= 0
                        const detail = departure.time && departure.label.startsWith(departure.time) ? departure.label.slice(departure.time.length).trim() : departure.label
                        return <li key={`${departure.id}-${index}`}><div><strong>{departure.time || "Departure"}</strong>{detail && <small>{detail}</small>}</div><span className={exact ? "swt-count" : "swt-unknown"}>{exact ? `${departure.remaining} ${departure.remaining === 1 ? "person" : "people"} remaining` : "Count unknown"}</span>{departure.evidenceText && <details><summary>Source wording</summary><p>{departure.evidenceText}</p></details>}</li>
                    })}</ul> : <p>No departure count was returned. Check with the operator.</p>}
                    <small>Calendar checked {checkedTime(observation.checkedAt)}</small>
                </> : observation && sameDate && observation.status === "error" ? <p className="swt-error">{observation.message || "The calendar could not be read. Remaining capacity is unknown."}</p>
                    : <p>{mode !== "backend" ? "Live seat counts are not connected. Check your date with the operator." : observation && !sameDate ? "This date has not been checked. Read the calendar for your selected date." : supported ? "Read this date’s calendar to see what the operator publishes." : "Calendar counts are not supported for this tour. Check with the operator."}</p>}
            {supported && <button className="swt-calendar-button" type="button" disabled={Boolean(checking) || loading || !isDate(date)} onClick={() => checkCalendar(product)}>{isChecking ? "Reading calendar…" : "Read booking calendar ↗"}</button>}
        </section>
    }

    return <div id="seward-tours" className="swt-root" style={{ width: "100%", ...style }}>
        <style>{CSS}</style>
        <header className="swt-header"><div className="swt-brand">SEWARD<span>TRAVEL OTA</span></div><span className="swt-status"><i />{mode === "backend" ? "Backend connected" : "Saved catalog demo"}</span></header>
        <section aria-label="Seward tour catalog" className="swt-content">
            <div className="swt-section-head"><div><p className="swt-eyebrow">MAKE A DAY OF IT</p><h2>Out here, there’s more.</h2></div><button className="swt-outline" type="button" disabled={loading || Boolean(checking)} onClick={() => load(Boolean(backend))}>{loading ? "Loading…" : backend ? "Refresh source pages ↻" : "Reload saved catalog ↻"}</button></div>
            <div className="swt-toolbar"><label><span>FIND AN EXPERIENCE</span><input type="search" placeholder="Cruises, kayaking, operators…" value={search} onChange={event => setSearch(event.target.value)} /></label><label><span>ACTIVITY</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">All activities</option>{categories.map(value => <option key={value} value={value}>{value}</option>)}</select></label><label><span>PLATFORM</span><select value={platform} onChange={event => setPlatform(event.target.value)}><option value="all">All platforms</option>{platforms.map(value => <option key={value} value={value}>{platformLabel(value)}</option>)}</select></label>{backend && <label><span>DATE · ALASKA TIME</span><input aria-invalid={!isDate(date)} type="date" value={date} onChange={event => setDate(event.target.value)} /></label>}</div>
            <div className="swt-meta"><span aria-live="polite">{filtered.length} {filtered.length === 1 ? "experience" : "experiences"} · {new Set(catalog.products.map(product => product.operator)).size} operators</span><span>Source snapshot: {checkedTime(catalog.refreshedAt)}</span></div>
            <p className="swt-notice">{mode === "backend" ? "Connected to the configured backend. Calendar results are timed observations, not reservations." : mode === "snapshot" ? "Saved catalog loaded from the public JSON source. Reloading downloads that file; it does not scrape operators or refresh inventory." : "Showing the embedded saved operator snapshot while the public catalog loads or is unavailable. No live inventory is connected."}</p>
            {(configuredError || error) && <p className="swt-error-banner" role="alert">{configuredError || error} {catalog.products.length ? "The saved observations remain visible." : ""}</p>}
            <div className="swt-grid" aria-busy={loading}>
                {filtered.map(product => <article className="swt-card" key={product.id}>
                    <div className="swt-card-top"><span>{product.category}</span><span>{platformLabel(product.platform)}</span></div>
                    <p className="swt-operator">{product.operator}</p><h3>{product.name}</h3>
                    <div className="swt-facts"><strong>{product.priceText || "Price on operator site"}</strong>{product.durationText && <span>{product.durationText}</span>}</div>
                    {product.priceCaveat && <details className="swt-price-details"><summary>Price details</summary><p>{product.priceCaveat}</p></details>}
                    <p className="swt-check">Source checked {checkedTime(product.checkedAt)}</p>
                    {product.fetchStatus === "error" && <p className="swt-error">Source read failed{product.lastAttemptAt ? ` ${checkedTime(product.lastAttemptAt)}` : ""}. {product.error || "Published details are unverified."}</p>}
                    {calendar(product)}
                    <div className="swt-card-footer"><ExternalLink href={product.sourceUrl}>View source ↗</ExternalLink><ExternalLink href={product.bookingUrl || product.sourceUrl} className="swt-book">Check with operator ↗</ExternalLink></div>
                </article>)}
                {!filtered.length && <div className="swt-empty"><h3>A different adventure, perhaps.</h3><p>Try another search, activity, or platform.</p><button className="swt-outline" type="button" onClick={() => { setSearch(""); setCategory("all"); setPlatform("all") }}>Clear filters</button></div>}
            </div>
            <p className="swt-bottom-note">{catalog.notice || "Advertised prices are not checkout quotes. Confirm availability, fees, and terms directly with the operator."}</p>
        </section>
        <footer className="swt-footer"><strong>SEWARD TRAVEL OTA</strong><span>Independent catalog demo · Reservations stay with the operator</span></footer>
    </div>
}

addPropertyControls(SewardTours, {
    sourceURL: { type: ControlType.String, title: "Catalog URL", defaultValue: DEFAULT_SOURCE, description: "Public HTTPS saved catalog JSON. Refreshing this file is not a live scrape." },
    apiBase: { type: ControlType.String, title: "API Base", defaultValue: "", description: "Optional deployed HTTPS backend origin/base path with CORS. Leave blank for the saved catalog demo. Never use localhost or put credentials here." },
})

const CSS = `
.swt-content{padding-top:30px}
.swt-root{--ink:#203b3a;--ocean:#164a50;--muted:#68766d;--paper:#f7f6f0;--line:#dcdfd4;--copper:#a65a38;box-sizing:border-box;background:var(--paper);color:var(--ink);font:14px/1.5 Inter,"Segoe UI",Arial,sans-serif;container-type:inline-size;overflow:hidden;border-radius:6px}
.swt-root *{box-sizing:border-box}.swt-root h1,.swt-root h2,.swt-root h3,.swt-root p{margin:0}.swt-root a{color:inherit}.swt-root button,.swt-root input,.swt-root select{font:inherit}.swt-root button,.swt-root summary{cursor:pointer}.swt-root button:disabled{cursor:wait;opacity:.55}.swt-root :focus-visible{outline:3px solid var(--copper);outline-offset:4px}.swt-header,.swt-hero,.swt-content,.swt-footer{width:calc(100% - 88px);max-width:1160px;margin-inline:auto}.swt-header{height:96px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line)}.swt-brand{font-size:24px;line-height:1;letter-spacing:3px;font-weight:750}.swt-brand span{display:block;font-size:9px;letter-spacing:3px;margin-top:8px}.swt-status{font-size:11px;border:1px solid #cbd3c7;border-radius:30px;padding:7px 12px;color:var(--muted);display:flex;align-items:center;gap:7px}.swt-status i{width:6px;height:6px;background:#78917b;border-radius:50%}.swt-hero{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;padding-block:46px 50px}.swt-eyebrow{font-size:10px!important;font-weight:750;letter-spacing:1.8px;color:var(--copper);margin-bottom:13px!important}.swt-root h1{font-family:Georgia,serif;font-size:clamp(43px,5.8cqw,72px);font-weight:400;line-height:1.06;letter-spacing:-2.6px;margin-bottom:22px}.swt-root h1 em{color:var(--copper)}.swt-intro{font-size:14px;line-height:1.8;color:var(--muted);max-width:390px}.swt-art{border-radius:140px 140px 4px 4px;overflow:hidden;position:relative;aspect-ratio:1.35}.swt-art svg{width:100%;height:100%;display:block;object-fit:cover}.swt-art>span{position:absolute;bottom:17px;left:22px;color:#faf2dd;font-size:10px;letter-spacing:.3px}.swt-section-head{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-bottom:22px}.swt-section-head .swt-eyebrow{margin-bottom:6px!important}.swt-root h2{font-family:Georgia,serif;font-weight:400;font-size:34px;line-height:1.2;letter-spacing:-.8px}.swt-outline{background:transparent;border:1px solid #b4c2b2;border-radius:4px;color:var(--ink);padding:11px 15px;min-height:43px;font-size:11px!important;font-weight:650!important}.swt-outline:hover:not(:disabled){background:#e9eee3}.swt-toolbar{display:flex;flex-wrap:wrap;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:5px;overflow:hidden}.swt-toolbar label{flex:1 1 145px;background:#fffefa;padding:15px 17px;min-width:0}.swt-toolbar label:first-child{flex:1.7 1 230px}.swt-toolbar label>span{display:block;font-size:8px;font-weight:700;letter-spacing:1px;color:var(--muted);margin-bottom:7px}.swt-toolbar input,.swt-toolbar select{width:100%;min-width:0;border:0;border-radius:2px;background:transparent;height:25px;color:var(--ink);font-size:12px}.swt-toolbar input::placeholder{color:#849180}.swt-meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:7px;font-size:10px;color:var(--muted);margin:15px 0 11px}.swt-notice{font-size:11px;line-height:1.75;color:var(--muted);padding-bottom:18px!important;margin-bottom:20px!important;border-bottom:1px solid var(--line)}.swt-error-banner{font-size:12px;background:#f8e8df;color:#853f2a;padding:13px 16px!important;border-radius:4px;margin-bottom:20px!important}.swt-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:21px}.swt-card{display:flex;flex-direction:column;background:#fffefa;border:1px solid var(--line);border-radius:5px;padding:23px}.swt-card-top{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:19px}.swt-card-top>span:first-child{font-size:9px;text-transform:uppercase;color:var(--copper);font-weight:700;letter-spacing:.8px}.swt-card-top>span:last-child{font-size:10px;background:#eff1e8;color:#617369;border-radius:3px;padding:4px 7px}.swt-operator{font-size:11px;color:var(--muted);margin-bottom:5px!important}.swt-root h3{font:400 26px/1.18 Georgia,serif;letter-spacing:-.5px;margin-bottom:15px}.swt-facts{display:flex;flex-wrap:wrap;gap:7px 14px;font-size:12px;margin-bottom:10px}.swt-facts strong{font-weight:600}.swt-facts>span{color:var(--muted)}.swt-price-details{font-size:10px;color:var(--muted);margin-bottom:12px}.swt-price-details summary{width:fit-content}.swt-price-details p{padding:8px 0!important;line-height:1.7}.swt-check{font-size:10px;color:#7c8676;margin-bottom:14px!important}.swt-error{font-size:11px;color:#943d31;margin-bottom:12px!important;overflow-wrap:anywhere}.swt-calendar{margin-top:auto;background:#f1f4e9;border:1px solid #e1e7d8;border-radius:4px;padding:14px;margin-bottom:18px}.swt-calendar-heading{display:flex;justify-content:space-between;gap:15px;margin-bottom:8px;font-size:10px}.swt-calendar-heading strong{font-weight:700}.swt-calendar-heading>span{color:var(--muted);font-size:9px}.swt-calendar>p{font-size:11px;line-height:1.7;color:var(--muted);margin-bottom:7px}.swt-calendar>small{display:block;font-size:9px;color:var(--muted);margin-top:10px}.swt-calendar-button{background:none;border:0;border-bottom:1px solid #a7bca5;padding:5px 0;margin-top:7px;color:var(--ocean);font-size:11px!important;font-weight:600!important}.swt-departures{margin:0;padding:0;list-style:none;max-height:300px;overflow-y:auto}.swt-departures li{border-top:1px solid #dce4d3;padding:10px 0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 10px;font-size:11px}.swt-departures strong{font-weight:600}.swt-departures small{display:block;color:var(--muted);font-size:10px;overflow-wrap:anywhere}.swt-count,.swt-unknown{align-self:start;padding:3px 6px;background:#dce9d4;color:#345939;border-radius:3px;font-size:9px;white-space:nowrap}.swt-unknown{background:#e4e8dc;color:#6b7561}.swt-departures details{grid-column:1/-1;font-size:9px;color:var(--muted)}.swt-departures details p{white-space:pre-wrap;overflow-wrap:anywhere;background:#fafbf6;padding:8px!important;margin-top:5px!important}.swt-card-footer{display:flex;justify-content:space-between;align-items:center;gap:12px}.swt-card-footer a{font-size:10px;text-decoration:none}.swt-card-footer a:hover{text-decoration:underline;text-underline-offset:3px}.swt-card-footer .swt-book{background:var(--ocean);color:#fffef6;border-radius:4px;padding:11px 13px;font-weight:600}.swt-bottom-note{font-size:10px;line-height:1.8;color:var(--muted);margin:20px 0 35px!important}.swt-footer{display:flex;justify-content:space-between;flex-wrap:wrap;gap:15px;padding-block:25px;border-top:1px solid var(--line);font-size:9px;color:var(--muted)}.swt-footer strong{color:var(--ink);font-size:9px;letter-spacing:1px}.swt-empty{grid-column:1/-1;text-align:center;border:1px dashed #bccab1;padding:40px 20px;border-radius:5px}.swt-empty p{color:var(--muted);font-size:12px;margin-bottom:20px}.swt-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@container(max-width:760px){.swt-header,.swt-hero,.swt-content,.swt-footer{width:calc(100% - 44px)}.swt-header{height:82px}.swt-brand{font-size:20px}.swt-status{font-size:9px}.swt-hero{gap:24px;padding-block:33px}.swt-root h1{font-size:48px}.swt-intro{font-size:12px}.swt-art{aspect-ratio:.95}.swt-art svg{width:140%;max-width:none;transform:translateX(-12%)}.swt-art>span{font-size:8px;left:13px;bottom:13px}.swt-root h2{font-size:29px}.swt-outline{font-size:10px!important;padding:9px 12px}.swt-card{padding:18px}.swt-root h3{font-size:23px}.swt-card-footer{flex-wrap:wrap}.swt-card-footer .swt-book{width:100%;text-align:center}.swt-departures li{grid-template-columns:1fr}.swt-count,.swt-unknown{justify-self:start}.swt-card-top>span:first-child{font-size:8px}.swt-calendar-heading{flex-wrap:wrap;gap:3px}}
@container(max-width:530px){.swt-header,.swt-hero,.swt-content,.swt-footer{width:calc(100% - 36px)}.swt-header{height:76px}.swt-hero{display:block;padding-block:32px}.swt-root h1{font-size:53px;margin-bottom:17px}.swt-intro{max-width:320px}.swt-art{margin-top:23px;height:190px;aspect-ratio:auto;border-radius:100px 100px 3px 3px}.swt-art svg{width:100%;height:100%;transform:none}.swt-art>span{left:17px;bottom:12px}.swt-section-head{align-items:flex-start;gap:14px}.swt-root h2{font-size:28px}.swt-section-head .swt-outline{max-width:125px;align-self:center;line-height:1.5}.swt-eyebrow{font-size:8px!important}.swt-toolbar label:first-child{flex-basis:100%}.swt-toolbar label{flex-basis:110px;padding:12px}.swt-toolbar label>span{font-size:7px}.swt-grid{grid-template-columns:1fr;gap:16px}.swt-card{padding:21px}.swt-root h3{font-size:27px}.swt-card-footer{flex-wrap:nowrap}.swt-card-footer .swt-book{width:auto}.swt-departures li{grid-template-columns:minmax(0,1fr) auto}.swt-calendar-heading{flex-wrap:nowrap}.swt-card-top>span:first-child{font-size:9px}.swt-meta{font-size:9px}.swt-footer{font-size:8px}.swt-brand{font-size:19px}.swt-status{font-size:8px;padding:6px 9px}}
`
