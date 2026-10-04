import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

// Paste this entire file into Assets > Code > Create Code File in Framer.
// The default mode reads a PUBLIC SAVED SNAPSHOT. It does not run a scraper.
// Only configure API Base after separately deploying and securing the backend.
// Never place API keys, cookies, provider credentials, or secrets in this file.

const DEFAULT_SOURCE = "https://raw.githubusercontent.com/legooz/Seward-Travel-OTA/main/data/catalog.json"
type Departure = { id: string; time: string; label: string; remaining: number | null; unit: string; evidenceText: string }
type Availability = { status: string; date: string; checkedAt?: string; expiresAt?: string; lastAttemptAt?: string; message?: string; departures: Departure[] }
type Product = { id: string; operator: string; name: string; category: string; platform: string; sourceUrl: string; bookingUrl: string; priceText: string | null; durationText: string | null; durationMinutesMin?: number | null; durationMinutesMax?: number | null; durationLabel?: string; durationBasis?: string; durationEvidence?: string; description?: string; detailsCheckedAt?: string; priceCaveat?: string; checkedAt?: string | null; lastAttemptAt?: string | null; fetchStatus: string; error?: string; calendarSupported?: boolean; availability?: Availability; inventoryUnit?: string }
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
      "calendarSupported": true,
      "durationLabel": "Full day",
      "durationMinutesMin": null,
      "durationMinutesMax": null,
      "durationBasis": "published",
      "durationEvidence": "The operator labels this Full Day. The usual departure is 6 AM with a 5–6 PM return; departure changes to 7 AM beginning August 20. No single hourly duration is stated.",
      "description": "Fish the Gulf of Alaska for halibut and other seasonal species, with a captain and deckhand aboard.",
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z"
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
      "calendarSupported": true,
      "durationLabel": "3.5 hours",
      "durationMinutesMin": 210,
      "durationMinutesMax": 210,
      "durationBasis": "published",
      "durationEvidence": "The half-day tour section states a trip length of 3.5 hours, with morning and afternoon departures. The private evening charter is a separate option.",
      "description": "Explore Resurrection Bay and Kenai Fjords National Park by small boat, looking for whales, seabirds, and other wildlife along a flexible route.",
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z"
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
      "calendarSupported": true,
      "durationLabel": "4 hours (scheduled)",
      "durationMinutesMin": 240,
      "durationMinutesMax": 240,
      "durationBasis": "schedule",
      "durationEvidence": "Calculated from the published 8 AM–noon, 11:30 AM–3:30 PM, and 6–10 PM trip windows. The separate 2–2.5-hour figure refers to paddling time, not the whole tour.",
      "description": "Paddle Resurrection Bay’s western shoreline from Lowell Point with a guide, stopping ashore for snacks, hot drinks, and exploration.",
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z"
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
      "calendarSupported": false,
      "durationLabel": "About 90 minutes",
      "durationMinutesMin": 90,
      "durationMinutesMax": 90,
      "durationBasis": "published",
      "durationEvidence": "The operator describes the excursion as approximately 90 minutes. Arrive 15 minutes early; it recommends allowing about two hours overall.",
      "description": "Fly to Godwin Glacier by helicopter, ride a dog sled with a musher, and meet the huskies at the glacier camp.",
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z"
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
      "calendarSupported": false,
      "durationLabel": "Half day",
      "durationMinutesMin": null,
      "durationMinutesMax": null,
      "durationBasis": "published",
      "durationEvidence": "The operator labels this Half-Day. Listed trip windows are 7:30–11:15 AM and 11:30 AM–3:15 PM, while the detailed check-in-to-return itinerary spans four hours. Confirm timing with the operator.",
      "description": "Take a guided shoreline paddle in Resurrection Bay after a narrated drive through Seward and an introduction to kayaking.",
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z"
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
      "calendarSupported": true,
      "durationLabel": "3–4 hours",
      "durationMinutesMin": 180,
      "durationMinutesMax": 240,
      "durationBasis": "published",
      "durationEvidence": "The operator gives a 3–4-hour door-to-door duration and a separate 1.5–2-hour paddling estimate. Morning and afternoon departures are listed.",
      "description": "Paddle from Lowell Point toward Tonsina Point in a tandem kayak, exploring Resurrection Bay’s coastline with a guide.",
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z"
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
type DurationFilter = "all" | "up-to-2" | "2-to-4" | "over-4" | "half-day" | "full-day" | "unknown"
type SortOrder = "activity" | "shortest" | "longest"

function durationRange(product: Product): [number, number] | null {
    const min = product.durationMinutesMin
    const max = product.durationMinutesMax
    return typeof min === "number" && typeof max === "number" && Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min ? [min, max] : null
}

function isFullDay(product: Product): boolean {
    // A published day label is a category, never an inferred number of hours.
    return /\bfull[\s-]+day\b/i.test(product.durationText || "")
}

function matchesDuration(product: Product, filter: DurationFilter): boolean {
    if (filter === "all") return true
    const fullDay = isFullDay(product)
    if (filter === "full-day") return fullDay
    if (filter === "half-day") return /\bhalf[\s-]*day\b/i.test(`${product.durationText || ""} ${product.name}`)
    const range = durationRange(product)
    if (filter === "unknown") return range === null
    if (fullDay) return false
    if (!range) return false
    const [min, max] = range
    // A range must fit the whole band. Exact 2h belongs to the first band.
    if (filter === "up-to-2") return max <= 120
    if (filter === "2-to-4") return min >= 120 && max > 120 && max <= 240
    return min > 240
}

function compareDuration(a: Product, b: Product, order: SortOrder): number {
    const first = durationRange(a)
    const second = durationRange(b)
    if (!first || !second) {
        if (first) return -1
        if (second) return 1
    } else {
        const comparison = order === "longest" ? second[1] - first[1] || second[0] - first[0] : first[0] - second[0] || first[1] - second[1]
        if (comparison) return comparison
    }
    return a.operator.localeCompare(b.operator) || a.name.localeCompare(b.name)
}

function durationLabel(product: Product): string {
    // Preserve the operator's wording, including approximate and half-day labels.
    if (product.durationLabel) return product.durationLabel
    if (product.durationText) return product.durationText.replace(/^(?:Trip Length|Trips? & Duration|Duration):\s*/i, "")
    const range = durationRange(product)
    if (!range) return "Not specified"
    const minutes = (value: number) => value % 60 === 0 ? `${value / 60} ${value === 60 ? "hour" : "hours"}` : `${value} minutes`
    return range[0] === range[1] ? minutes(range[0]) : `${range[0]}–${range[1]} minutes`
}

function priceLabel(value: string | null): string {
    if (!value) return "See operator website"
    return value.replace(/^Cost:\s*/i, "").replace(/\$\s+(?=\d)/g, "$")
        .replace(/^(\$[\d,.]+)\s*[—-]\s*Person$/i, "$1 per person")
        .replace(/^(\$[\d,.]+)\s*[—-]\s*Adult Ages (\d+)\+$/i, "$1 per adult ($2+)")
        .replace(/^(\$[\d,.]+)\/person$/i, "$1 per person")
}

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
            durationMinutesMin: typeof row.durationMinutesMin === "number" && Number.isFinite(row.durationMinutesMin) ? row.durationMinutesMin : null,
            durationMinutesMax: typeof row.durationMinutesMax === "number" && Number.isFinite(row.durationMinutesMax) ? row.durationMinutesMax : null,
            durationLabel: text(row.durationLabel), durationBasis: text(row.durationBasis), durationEvidence: text(row.durationEvidence), description: text(row.description, 800), detailsCheckedAt: text(row.detailsCheckedAt),
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
    const [duration, setDuration] = React.useState<DurationFilter>("all")
    const [sort, setSort] = React.useState<SortOrder>("activity")
    const [date, setDate] = React.useState("2027-07-15")
    const [checking, setChecking] = React.useState<string | null>(null)
    const [now, setNow] = React.useState(() => Date.now())
    const requestSequence = React.useRef(0)
    const active = React.useRef<AbortController | null>(null)
    const backend = React.useMemo(() => backendBase(apiBase), [apiBase])
    const source = React.useMemo(() => publicURL(sourceURL), [sourceURL])
    const categories = Array.from(new Set(catalog.products.map(product => product.category))).sort((a, b) => a.localeCompare(b))
    const activeCategory = categories.includes(category) ? category : "all"
    const filtered = catalog.products.filter(product => (activeCategory === "all" || product.category === activeCategory) && matchesDuration(product, duration) && `${product.name} ${product.operator} ${product.category} ${product.description || ""}`.toLowerCase().includes(search.toLowerCase().trim()))
        .sort((a, b) => (sort === "activity" ? a.category.localeCompare(b.category) : 0) || compareDuration(a, b, sort))
    const groups = sort === "activity" ? categories.map(name => ({ name, products: filtered.filter(product => product.category === name) })).filter(group => group.products.length) : [{ name: "", products: filtered }]
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
        <section aria-label="Seward tour catalog" className="swt-content">
            <div className="swt-section-head"><h2>Explore Seward tours</h2><p>Compare activities, trip length, and published prices from local operators.</p></div>
            <div className="swt-categories" role="group" aria-label="Filter tours by activity">
                <button type="button" aria-pressed={activeCategory === "all"} onClick={() => setCategory("all")}>All activities</button>
                {categories.map(value => <button type="button" key={value} aria-pressed={activeCategory === value} onClick={() => setCategory(value)}>{value}</button>)}
            </div>
            <div className="swt-toolbar">
                <label className="swt-search"><span>Search tours or operators</span><input type="search" placeholder="Search Seward tours" value={search} onChange={event => setSearch(event.target.value)} /></label>
                <label><span>Duration</span><select value={duration} onChange={event => setDuration(event.target.value as DurationFilter)}><option value="all">All durations</option><option value="up-to-2">Up to 2 hours</option><option value="2-to-4">2–4 hours</option><option value="over-4">Over 4 hours</option><option value="half-day">Half day</option><option value="full-day">Full day</option><option value="unknown">Hours not specified</option></select></label>
                <label className="swt-sort"><span>Sort by</span><select value={sort} onChange={event => setSort(event.target.value as SortOrder)}><option value="activity">Activity, then duration</option><option value="shortest">Shortest duration first</option><option value="longest">Longest duration first</option></select></label>
                {backend && <label><span>Calendar date · Alaska time</span><input aria-invalid={!isDate(date)} type="date" value={date} onChange={event => setDate(event.target.value)} /></label>}
            </div>
            {duration !== "all" && <p className="swt-filter-help">Hour filters use the entire published range. Half-day and full-day labels are not converted into hours.</p>}
            <div className="swt-results"><span aria-live="polite">{filtered.length} {filtered.length === 1 ? "tour" : "tours"}</span><p>{mode === "backend" ? "Calendar counts are timed observations. Confirm your party’s availability with the operator." : "Use Check dates to confirm availability with the operator. Live seat counts are not connected."}</p></div>
            {(configuredError || error) && <div className="swt-error-banner" role="alert"><p>The latest tour information could not be loaded. Previously saved details are shown.</p><details><summary>Connection details</summary><p>{configuredError || error}</p></details></div>}
            <div className="swt-list" aria-busy={loading}>
                {groups.map(group => <section className="swt-group" key={group.name || "all-tours"} aria-label={group.name || "Tours ordered by duration"}>
                    {group.name && <div className="swt-group-heading"><h3>{group.name}</h3><span>{group.products.length} {group.products.length === 1 ? "tour" : "tours"}</span></div>}
                    {group.products.map(product => <article className="swt-row" key={product.id}>
                        <div className="swt-row-main">
                            <div className="swt-row-copy"><p className="swt-operator">{product.operator}</p>{group.name ? <h4>{product.name}</h4> : <h3>{product.name}</h3>}{product.description && <p className="swt-description">{product.description}</p>}</div>
                            <dl className="swt-duration"><dt>Duration</dt><dd>{durationLabel(product)}</dd></dl>
                            <dl className="swt-price"><dt>Advertised price</dt><dd>{priceLabel(product.priceText)}</dd></dl>
                            <div className="swt-action"><ExternalLink href={product.bookingUrl || product.sourceUrl} className="swt-book">Check dates <span aria-hidden="true">↗</span></ExternalLink><span>Book with the operator</span></div>
                        </div>
                        {product.fetchStatus === "error" && <p className="swt-source-warning">Latest source check failed. Confirm these details with the operator.</p>}
                        <details className="swt-operator-details"><summary>Operator details</summary><div className="swt-details-body">
                            <div><h5>Published duration</h5><p>{product.durationEvidence || product.durationText || "A duration has not been verified from the operator’s website."}</p>{product.durationBasis && <p className="swt-detail-note">{product.durationBasis === "schedule" ? "Based on the operator’s published start and end times." : product.durationBasis === "published" ? "Duration stated by the operator." : `Duration basis: ${product.durationBasis}`}</p>}</div>
                            <div><h5>Price and booking</h5><p>Published price: {product.priceText || "Not verified"}</p><p className="swt-detail-note">{product.priceCaveat || "Advertised pricing is not a checkout quote. Confirm final charges, group rules, and terms with the operator."}</p></div>
                            <div><h5>Source</h5><ExternalLink href={product.sourceUrl}>View operator page ↗</ExternalLink><p className="swt-detail-note">Catalog checked {checkedTime(product.checkedAt)}{product.detailsCheckedAt ? <><br />Tour details checked {checkedTime(product.detailsCheckedAt)}</> : null}</p>{product.fetchStatus === "error" && <p className="swt-error">{product.error || "Published details could not be refreshed."}{product.lastAttemptAt ? ` Last attempt: ${checkedTime(product.lastAttemptAt)}.` : ""}</p>}</div>
                        </div></details>
                        {mode === "backend" && (product.calendarSupported || product.availability) ? calendar(product) : null}
                    </article>)}
                </section>)}
                {!filtered.length && <div className="swt-empty"><h3>No tours match these filters</h3><p>Try another search, activity, or duration.</p><button className="swt-outline" type="button" onClick={() => { setSearch(""); setCategory("all"); setDuration("all") }}>Clear filters</button></div>}
            </div>
            <details className="swt-catalog-details"><summary>About this directory</summary><p>Tour information is saved from operator websites; prices and schedules can change. {sort === "longest" ? "Longest-first ordering uses the upper end of a published duration range." : "Duration ordering uses the lower end of a published range, then its upper end."} Tours without verified numeric durations appear last in their activity group, or last overall when sorting by duration.</p><p>Catalog observation: {checkedTime(catalog.refreshedAt)}. {mode === "backend" ? "The configured backend can refresh source pages and supported calendars." : "This page loads a saved catalog, not a live inventory feed."}</p><button className="swt-text-button" type="button" disabled={loading || Boolean(checking)} onClick={() => load(Boolean(backend))}>{loading ? "Loading…" : backend ? "Refresh source pages" : "Reload saved details"}</button></details>
        </section>
    </div>
}

addPropertyControls(SewardTours, {
    sourceURL: { type: ControlType.String, title: "Catalog URL", defaultValue: DEFAULT_SOURCE, description: "Public HTTPS saved catalog JSON. Refreshing this file is not a live scrape." },
    apiBase: { type: ControlType.String, title: "API Base", defaultValue: "", description: "Optional deployed HTTPS backend origin/base path with CORS. Leave blank for the saved catalog demo. Never use localhost or put credentials here." },
})

const CSS = `
.swt-root{--ink:#102f47;--muted:#63717c;--line:#dfe5e9;--subtle:#f6f8f9;box-sizing:border-box;background:#fff;color:var(--ink);font:15px/1.6 Inter,"Segoe UI",Arial,sans-serif;container-type:inline-size;overflow:hidden}
.swt-root *{box-sizing:border-box}.swt-root h2,.swt-root h3,.swt-root h4,.swt-root h5,.swt-root p,.swt-root dl,.swt-root dd{margin:0}.swt-root h2,.swt-root h3,.swt-root h4,.swt-root h5{font-family:inherit;color:var(--ink)}.swt-root a{color:var(--ink)}.swt-root button,.swt-root input,.swt-root select{font:inherit}.swt-root button,.swt-root summary{cursor:pointer}.swt-root button:disabled{cursor:wait;opacity:.55}.swt-root :focus-visible{outline:3px solid #2d658c;outline-offset:4px}.swt-content{width:calc(100% - 88px);max-width:1180px;margin:auto;padding:48px 0 40px}.swt-section-head{margin-bottom:23px}.swt-section-head h2{font-size:32px;font-weight:650;line-height:1.2;letter-spacing:-.8px}.swt-section-head>p{color:var(--muted);font-size:15px;line-height:1.7;margin-top:11px}.swt-categories{display:flex;gap:26px;overflow-x:auto;border-bottom:1px solid var(--line);margin-bottom:25px;scrollbar-width:thin}.swt-categories button{flex-shrink:0;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--muted);padding:13px 0;font-size:14px;line-height:1.4;white-space:nowrap}.swt-categories button:hover{color:var(--ink)}.swt-categories button[aria-pressed=true]{color:var(--ink);border-bottom-color:var(--ink);font-weight:650}.swt-toolbar{display:flex;flex-wrap:wrap;gap:18px}.swt-toolbar>label{flex:1 1 165px;min-width:0}.swt-toolbar>.swt-search{flex:1.9 1 240px}.swt-toolbar label>span{display:block;color:#465866;font-size:12px;font-weight:600;margin-bottom:7px}.swt-toolbar input,.swt-toolbar select{display:block;width:100%;height:46px;padding:10px 13px;border:1px solid #cbd5dc;border-radius:3px;background:#fff;color:var(--ink);font-size:14px}.swt-toolbar input::placeholder{color:#85929b}.swt-toolbar select{cursor:pointer}.swt-filter-help{font-size:12px;color:var(--muted);margin-top:11px!important}.swt-results{display:flex;justify-content:space-between;align-items:baseline;gap:24px;padding:21px 0 25px}.swt-results>span{font-size:13px;font-weight:600;white-space:nowrap}.swt-results>p{font-size:12px;color:var(--muted);text-align:right;max-width:650px}.swt-error-banner{background:#fbf5ef;color:#714c2e;border-left:3px solid #c19364;padding:13px 16px;font-size:13px;margin-bottom:22px}.swt-error-banner details{font-size:12px;margin-top:6px}.swt-error-banner details p{margin-top:6px;overflow-wrap:anywhere}.swt-list{width:100%}.swt-group+.swt-group{margin-top:30px}.swt-group-heading{display:flex;gap:14px;align-items:baseline;padding:0 0 14px;border-bottom:1px solid #aebdc8}.swt-group-heading h3{font-size:18px;line-height:1.4;font-weight:650;letter-spacing:-.2px}.swt-group-heading>span{color:#7c8992;font-size:12px}.swt-row{padding:27px 0 22px;border-bottom:1px solid var(--line)}.swt-row-main{display:grid;grid-template-columns:minmax(0,1fr) 135px 185px 157px;gap:26px;align-items:start}.swt-operator{color:#607789;font-size:12px;font-weight:550;margin-bottom:7px!important}.swt-row-copy h3,.swt-row-copy h4{font-size:21px;font-weight:650;line-height:1.35;letter-spacing:-.3px}.swt-description{font-size:14px;line-height:1.7;color:var(--muted);margin-top:11px!important;max-width:590px}.swt-row dl{padding-top:1px}.swt-row dt{font-size:11px;font-weight:600;letter-spacing:.2px;color:#73818b;margin-bottom:9px}.swt-row dd{font-size:14px;font-weight:550;line-height:1.6;color:var(--ink);overflow-wrap:anywhere}.swt-duration dd{font-size:15px}.swt-action{padding-top:2px;text-align:center}.swt-book{display:flex;align-items:center;justify-content:space-between;gap:17px;background:#12374f;color:#fff!important;min-height:44px;padding:11px 14px;border-radius:3px;text-decoration:none;font-size:13px;font-weight:600;white-space:nowrap}.swt-book:hover{background:#204e6b}.swt-action>span{display:block;color:#82909a;font-size:10px;margin-top:8px}.swt-operator-details{margin-top:17px}.swt-operator-details>summary{width:fit-content;color:#637988;font-size:12px;list-style:none;display:flex;align-items:center;gap:8px}.swt-operator-details>summary:before{content:'+';font-size:16px;font-weight:400;line-height:1}.swt-operator-details[open]>summary:before{content:'−'}.swt-operator-details>summary::-webkit-details-marker{display:none}.swt-operator-details>summary:hover{color:var(--ink)}.swt-details-body{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:28px;background:var(--subtle);padding:20px 22px;margin-top:13px;font-size:12px;line-height:1.8;color:var(--muted)}.swt-details-body h5{font-size:12px;font-weight:650;margin-bottom:7px}.swt-details-body a{text-underline-offset:3px}.swt-detail-note{margin-top:8px!important;font-size:11px;color:#788590}.swt-source-warning,.swt-error{color:#885832;font-size:12px;margin-top:12px!important;overflow-wrap:anywhere}.swt-catalog-details{margin-top:27px;font-size:12px;color:var(--muted)}.swt-catalog-details>summary{width:fit-content}.swt-catalog-details>p{line-height:1.8;margin-top:12px;max-width:830px}.swt-text-button{background:transparent;border:0;border-bottom:1px solid #a6b6c2;color:var(--ink);font-size:12px!important;margin-top:13px;padding:2px 0}.swt-outline{border:1px solid #b8c7d1;background:#fff;color:var(--ink);border-radius:3px;min-height:42px;padding:9px 15px;font-size:13px!important}.swt-outline:hover{background:var(--subtle)}.swt-empty{text-align:center;padding:48px 20px;border-block:1px solid var(--line)}.swt-empty h3{font-size:20px;font-weight:600}.swt-empty p{font-size:14px;color:var(--muted);margin:10px 0 20px}.swt-calendar{padding:17px 20px;background:var(--subtle);border:1px solid var(--line);margin-top:18px;font-size:12px;max-width:760px}.swt-calendar-heading{display:flex;justify-content:space-between;gap:16px;font-size:12px;margin-bottom:10px}.swt-calendar-heading>span,.swt-calendar>p,.swt-calendar>small{color:var(--muted)}.swt-calendar>small{display:block;font-size:11px;margin-top:9px}.swt-calendar-button{border:0;border-bottom:1px solid #9eb5c5;background:transparent;color:var(--ink);font-size:12px!important;padding:4px 0;margin-top:10px}.swt-departures{list-style:none;padding:0;margin:0;max-height:300px;overflow:auto}.swt-departures li{padding:11px 0;border-top:1px solid var(--line);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 15px;font-size:12px}.swt-departures small{display:block;color:var(--muted);font-size:11px;overflow-wrap:anywhere}.swt-count,.swt-unknown{font-size:11px;font-weight:600}.swt-unknown{color:var(--muted);font-weight:400}.swt-departures details{grid-column:1/-1;font-size:11px;color:var(--muted)}.swt-departures details p{padding:8px 10px;background:#fff;white-space:pre-wrap;overflow-wrap:anywhere;margin-top:5px}.swt-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@container(max-width:1000px){.swt-content{width:calc(100% - 64px)}.swt-row-main{grid-template-columns:minmax(0,1fr) 115px 145px 140px;gap:19px}.swt-row-copy h3,.swt-row-copy h4{font-size:20px}.swt-book{padding-inline:12px;font-size:12px;gap:12px}.swt-details-body{gap:20px;padding:18px}.swt-description{font-size:13px}.swt-row dd{font-size:13px}.swt-categories{gap:23px}}
@container(max-width:780px){.swt-content{width:calc(100% - 44px);padding-top:34px}.swt-section-head h2{font-size:29px}.swt-section-head>p{font-size:14px}.swt-row-main{grid-template-columns:minmax(0,1fr) 160px;gap:18px 25px}.swt-row-copy{grid-column:1;grid-row:1/span 2}.swt-duration{grid-column:2}.swt-price{grid-column:2}.swt-action{grid-column:1/-1;text-align:left;display:flex;align-items:center;gap:15px}.swt-action .swt-book{width:150px}.swt-action>span{margin:0;font-size:11px}.swt-row dt{margin-bottom:5px}.swt-row dd{font-size:14px}.swt-row-copy h3,.swt-row-copy h4{font-size:21px}.swt-description{font-size:14px}.swt-details-body{grid-template-columns:1fr 1fr}.swt-details-body>div:last-child{grid-column:1/-1}.swt-results{display:block}.swt-results>p{text-align:left;margin-top:7px}.swt-toolbar{gap:15px}.swt-toolbar>.swt-search{flex-basis:100%}.swt-operator-details{margin-top:14px}}
@container(max-width:530px){.swt-content{width:calc(100% - 36px);padding:28px 0 30px}.swt-section-head h2{font-size:27px;letter-spacing:-.6px}.swt-section-head>p{font-size:14px}.swt-categories{gap:22px;margin-bottom:20px}.swt-categories button{font-size:13px;padding:12px 0}.swt-toolbar{gap:14px 12px}.swt-toolbar>label{flex:1 1 130px}.swt-toolbar input,.swt-toolbar select{font-size:13px;padding-inline:10px}.swt-toolbar label>span{font-size:11px}.swt-results{padding-block:18px 23px}.swt-results>p{font-size:12px;line-height:1.7}.swt-group-heading{padding-bottom:12px}.swt-group-heading h3{font-size:17px}.swt-row{padding:23px 0 21px}.swt-row-main{display:flex;flex-wrap:wrap;gap:20px 26px}.swt-row-copy{width:100%}.swt-row-copy h3,.swt-row-copy h4{font-size:22px;line-height:1.3}.swt-operator{font-size:12px}.swt-description{font-size:14px;line-height:1.7;margin-top:9px!important}.swt-duration{flex:1 1 100px}.swt-price{flex:1.5 1 155px}.swt-row dt{font-size:11px}.swt-row dd{font-size:14px}.swt-action{width:100%;display:block}.swt-action .swt-book{width:100%;font-size:14px;min-height:46px}.swt-action>span{text-align:center;margin-top:7px;font-size:11px}.swt-details-body{grid-template-columns:1fr;padding:17px;gap:18px}.swt-details-body>div:last-child{grid-column:auto}.swt-group+.swt-group{margin-top:28px}.swt-catalog-details{font-size:11px}.swt-calendar{padding:14px}.swt-departures li{grid-template-columns:1fr}.swt-count,.swt-unknown{justify-self:start}}
@container(max-width:530px){.swt-categories{flex-wrap:wrap;gap:0 18px;overflow-x:visible}.swt-toolbar>.swt-sort{flex-basis:100%}}
`
