import * as React from "react"
import { motion } from "framer-motion"
import { addPropertyControls, ControlType, Link } from "framer"

// Paste this entire file into Assets > Code > Create Code File in Framer.
// The default mode reads a PUBLIC SAVED SNAPSHOT. It does not run a scraper.
// Only configure API Base after separately deploying and securing the backend.
// Never place API keys, cookies, provider credentials, or secrets in this file.

const DEFAULT_SOURCE = "https://raw.githubusercontent.com/legooz/Seward-Travel-OTA/main/data/catalog.json"
const HERO_IMAGE = "https://raw.githubusercontent.com/legooz/Seward-Travel-OTA/main/public/images/seward-hero.jpg"
const INTEREST_URL = "https://forms.zohopublic.com/vcprovenzagm1/form/SewardOneStop/formperma/8Q_3lbfTA-WTfM0g8tOUpenqwokVZkm9vclwHw3Vxyg"
const WELCOME_PAGE = { webPageId: "augiA20Il" }
const BOOKING_PAGE = { webPageId: "TPt6fFlZ6" }
const DEMO_VIDEO = "https://raw.githubusercontent.com/legooz/Seward-Travel-OTA/main/public/videos/seward-onestop-demo.mp4"
const DEMO_POSTER = "https://raw.githubusercontent.com/legooz/Seward-Travel-OTA/main/public/videos/seward-onestop-demo-poster.png"
type Departure = { id: string; time: string; label: string; remaining: number | null; unit: string; evidenceText: string }
type Availability = { status: string; date: string; checkedAt?: string; expiresAt?: string; lastAttemptAt?: string; message?: string; departures: Departure[] }
type ListingType = "tour" | "lodging" | "transportation"
type BookingAction = "rates" | "schedule" | "contact" | "dates"
type Product = { id: string; operator: string; name: string; category: string; listingType?: ListingType; subcategory?: string; serviceLabel?: string; serviceEvidence?: string; serviceNotes?: string; locationText?: string; locationLabel?: string; mapQuery?: string; locationEvidence?: string; locationEvidenceUrl?: string; imageUrl?: string | null; imageAlt?: string | null; imageSourceUrl?: string | null; imageCredit?: string | null; mediaReviewedAt?: string; imageEvidence?: string; bookingAction?: BookingAction; sourceReferences?: { label: string; url: string }[]; sourceMode?: string; platform: string; sourceUrl: string; bookingUrl: string; priceText: string | null; durationText: string | null; durationMinutesMin?: number | null; durationMinutesMax?: number | null; durationLabel?: string; durationBasis?: string; durationEvidence?: string; description?: string; detailsCheckedAt?: string; priceCaveat?: string; checkedAt?: string | null; lastAttemptAt?: string | null; fetchStatus: string; error?: string; calendarSupported?: boolean; availability?: Availability; inventoryUnit?: string | null }
type Catalog = { products: Product[]; refreshedAt: string | null; notice: string }
type Props = { page?: "welcome" | "booking"; sourceURL?: string; apiBase?: string; showHero?: boolean; style?: React.CSSProperties }

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
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z",
      "listingType": "tour",
      "locationLabel": "Miller's Landing · beach boarding",
      "locationText": "13880 Beach Drive, Seward, AK 99664. Boats load directly from the beach in front of Miller's Landing.",
      "mapQuery": "Miller's Landing, 13880 Beach Drive, Seward, AK 99664",
      "imageUrl": "https://www.millerslandingak.com/wp-content/uploads/sites/3698/2025/10/IMG-20250821-WA0002-e1761189896143.jpg?resize=360%2C240&zoom=2",
      "imageAlt": "Anglers display their catch at Miller's Landing, with water and mountains behind them.",
      "imageSourceUrl": "https://www.millerslandingak.com/seward-alaska-fishing/full-day-halibut-species-in-season-charter/",
      "imageCredit": "Photo source: Miller's Landing official tour page",
      "locationEvidenceUrl": "https://www.millerslandingak.com/seward-alaska-fishing/full-day-halibut-species-in-season-charter/",
      "locationEvidence": "The charter page says its landing craft load directly off the beach in front of Miller's Landing. Its footer lists 13880 Beach Dr, Seward, AK 99664.",
      "imageEvidence": "First visible photo in this charter page's image gallery; exact observed img src. The source alt describes anglers and their catch at Miller's Landing.",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
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
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z",
      "listingType": "tour",
      "locationLabel": "Seward Boat Harbor · M dock",
      "locationText": "Meet at slips M1, M3, M5 or M7 on the south side of Seward Boat Harbor, near the Seward Mariner's Memorial.",
      "mapQuery": "Seward Ocean Excursions, Seward Boat Harbor, Seward, Alaska",
      "imageUrl": "https://sewardoceanexcursions.com/wp-content/uploads/2019/10/LSH1987-1024x683.jpg",
      "imageAlt": "Guests aboard Lost Lynx watch a humpback whale dive.",
      "imageSourceUrl": "https://sewardoceanexcursions.com/tourssightseeing/",
      "imageCredit": "Photo source: Seward Ocean Excursions official tour page",
      "locationEvidenceUrl": "https://sewardoceanexcursions.com/location/",
      "locationEvidence": "The official Location page explicitly identifies the meeting location as Seward Boat Harbor slips M1, M3, M5 and M7 in the south uplands area, with access by the Mariner's Memorial.",
      "imageEvidence": "Observed image within the half-day tour section. Its figure caption identifies guests on Lost Lynx watching a humpback dive, before the separate seven-hour tour section begins.",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
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
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z",
      "listingType": "tour",
      "locationLabel": "Downtown Seward · office meeting point",
      "locationText": "Meet at the downtown office at 328 3rd Avenue, Seward, AK 99664; the operator then drives guests to the launch beach at Lowell Point.",
      "mapQuery": "Kayak Adventures Worldwide, 328 3rd Avenue, Seward, AK 99664",
      "imageUrl": "https://www.kayakak.com/wp-content/uploads/2025/09/resurrection-bay-seward-alaska-sea-kayaking-tours-4-1600x1067.jpg",
      "imageAlt": "Resurrection Bay sea kayaking tour photo from Kayak Adventures Worldwide.",
      "imageSourceUrl": "https://www.kayakak.com/kayaking-trips/half-day-resurrection-bay-trip/",
      "imageCredit": "Photo source: Kayak Adventures Worldwide official tour page",
      "locationEvidenceUrl": "https://www.kayakak.com/kayaking-trips/half-day-resurrection-bay-trip/",
      "locationEvidence": "The itinerary directs guests to meet at the downtown office 15 minutes before the tour and describes a drive to Lowell Point for launching. The page's address link lists 328 3rd Avenue, Seward, AK 99664.",
      "imageEvidence": "Exact og:image URL observed in the official Resurrection Bay Half Day Kayak Tour page HTML; neutral alternative text describes the image's published tour context.",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
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
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z",
      "listingType": "tour",
      "locationLabel": "Airport Road · Seward office",
      "locationText": "Seward Helicopter Tours, 2210 Airport Road, Seward, AK 99664. The tour visits Godwin Glacier.",
      "mapQuery": "Seward Helicopter Tours, 2210 Airport Road, Seward, AK 99664",
      "imageUrl": "https://media.sewardhelicopters.com/sewardhelicopters/2022/05/05050642/dog-sledding-with0turning-heads-kennel-on-godwin-glacier-1024x682.jpg",
      "imageAlt": "Dog sledding on Godwin Glacier during a Seward Helicopter Tours excursion.",
      "imageSourceUrl": "https://sewardhelicopters.com/seward-dog-sled-tours/",
      "imageCredit": "Photo source: Seward Helicopter Tours official Glacier Dog Sledding page",
      "locationEvidenceUrl": "https://sewardhelicopters.com/seward-dog-sled-tours/",
      "locationEvidence": "The tour describes a visit to Godwin Glacier, parking at the operator's building, and early arrival. The official page's contact section lists 2210 Airport Road, Seward, AK 99664. The map points to the office, not to the glacier.",
      "imageEvidence": "Exact og:image URL in the official tour HTML. The matching full-size hero image's source alt identifies glacier dog sledding on Godwin Glacier with Seward Helicopters.",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
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
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z",
      "listingType": "tour",
      "locationLabel": "Seward harbor · office meeting point",
      "locationText": "Meet at Sunny Cove's downtown harbor office, 1304 B 4th Avenue, Seward, Alaska 99664, before the narrated drive to the kayak launch.",
      "mapQuery": "Sunny Cove Kayaking, 1304 B 4th Avenue, Seward, Alaska 99664",
      "imageUrl": "https://images.squarespace-cdn.com/content/v1/6564fe0bc1440f3f56d8c17f/f6356110-d43d-40f2-a9ff-828771e93a26/_O3A0997.jpg",
      "imageAlt": "Sunny Cove Kayaking's Resurrection Bay tour photo.",
      "imageSourceUrl": "https://www.sunnycove.com/resurrection-bay-tour",
      "imageCredit": "Photo source: Sunny Cove Kayaking official Resurrection Bay tour page",
      "locationEvidenceUrl": "https://www.sunnycove.com/resurrection-bay-tour",
      "locationEvidence": "The tour introduction says guests meet at the downtown harbor office, followed by a narrated drive to the launch site. The page footer gives 1304 B 4th Avenue, Seward, Alaska 99664.",
      "imageEvidence": "Exact observed hero-photo img src immediately before the Resurrection Bay tour title. The source has no descriptive alt or photographer credit on this image; the supplied alt stays neutral.",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
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
      "detailsCheckedAt": "2026-10-04T03:50:18.000Z",
      "listingType": "tour",
      "locationLabel": "Seward · shop meeting point",
      "locationText": "Meet at Adventure Sixty North, 31872 Herman Leirer Road, Seward, AK 99664; the operator drives guests to Lowell Point Beach to launch.",
      "mapQuery": "Adventure Sixty North, 31872 Herman Leirer Road, Seward, AK 99664",
      "imageUrl": "https://adventure60.com/wp-content/uploads/sites/6285/2023/02/20250414_150927.jpg?resize=360%2C240&zoom=2",
      "imageAlt": "Kayakers paddle toward snow-covered mountains on the Tonsina Point tour.",
      "imageSourceUrl": "https://adventure60.com/kayaking/tonsina-point-resurrection-bay-kayaking-adventure/",
      "imageCredit": "Photo source: Adventure Sixty North official Tonsina Point tour page",
      "locationEvidenceUrl": "https://adventure60.com/kayaking/tonsina-point-resurrection-bay-kayaking-adventure/",
      "locationEvidence": "The itinerary starts with meeting the guide at the shop, then a van ride to Lowell Point Beach. The official page's address link is 31872 Herman Leirer Rd, Seward, AK 99664.",
      "imageEvidence": "Exact observed src of the first product-gallery photo. The source alt describes two people kayaking toward snowy mountains on a clear day.",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
    },
    {
      "id": "harbor-360-hotel",
      "operator": "Harbor 360 Hotel",
      "name": "Harbor 360 Hotel",
      "listingType": "lodging",
      "category": "Lodging",
      "subcategory": "Hotel",
      "serviceLabel": "Hotel in Seward",
      "locationText": "1412 4th Avenue, Seward, AK 99664; beside the Seward Small Boat Harbor",
      "description": "Stay beside Seward's small boat harbor in a locally owned hotel with harbor or mountain views, complimentary breakfast, a swimming pool, and a hot tub.",
      "sourceUrl": "https://harbor360hotel.com/",
      "bookingUrl": "https://us01.iqwebbook.com/H360HAK651/",
      "bookingAction": "rates",
      "platform": "direct",
      "sourceMode": "website-review",
      "priceText": null,
      "priceCaveat": "Check the official booking page for rates for your dates and room choice. No nightly quote was retrieved.",
      "durationText": null,
      "durationLabel": "Stay dates",
      "durationMinutesMin": null,
      "durationMinutesMax": null,
      "serviceEvidence": "Check-in 4:00 PM; checkout 11:00 AM. The official homepage and rooms page link Book Now to this IQWebBook property URL. Its JavaScript booking page provides no static inventory or rate evidence.",
      "serviceNotes": "Open year-round. The rooms page separately lists an annual pool closure October 18–25.",
      "sourceReferences": [
        {
          "label": "Property website",
          "url": "https://harbor360hotel.com/"
        },
        {
          "label": "Rooms and policies",
          "url": "https://harbor360hotel.com/rooms/"
        }
      ],
      "checkedAt": "2026-10-04T04:14:34.000Z",
      "detailsCheckedAt": "2026-10-04T04:14:34.000Z",
      "lastAttemptAt": "2026-10-04T04:14:34.000Z",
      "fetchStatus": "ok",
      "calendarSupported": false,
      "inventoryUnit": null,
      "locationLabel": "Seward Small Boat Harbor",
      "mapQuery": "Harbor 360 Hotel, 1412 4th Avenue, Seward, AK 99664",
      "imageUrl": "https://harbor360hotel.com/wp-content/uploads/elementor/thumbs/jodyo.photos-19F0603_001-008Pano-2-1800x1200-min-p3h5e4mp4oa0zlyeq4in4v4ok72es8gflpgvg8bee8.jpg",
      "imageAlt": "Double queen standard guest room at Harbor 360 Hotel",
      "imageSourceUrl": "https://harbor360hotel.com/rooms/",
      "imageCredit": "Source: Harbor 360 Hotel official website",
      "imageEvidence": "Observed img src on the official rooms page; its alt text is Double Queen Standard Room. HTTP 200 image/jpeg verified. Room photo, not an exterior view.",
      "locationEvidenceUrl": "https://harbor360hotel.com/",
      "locationEvidence": "1412 4th Avenue, Seward, AK 99664; beside the Seward Small Boat Harbor",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
    },
    {
      "id": "hotel-seward",
      "operator": "Hotel Seward",
      "name": "Hotel Seward",
      "listingType": "lodging",
      "category": "Lodging",
      "subcategory": "Hotel",
      "serviceLabel": "Hotel in downtown Seward",
      "locationText": "221 Fifth Avenue, Seward, AK 99664; historic downtown Seward",
      "description": "Stay in historic downtown Seward at a hotel established in 1905, near the Alaska SeaLife Center, the Seward museum, restaurants, and shops.",
      "sourceUrl": "https://hotelsewardalaska.com/",
      "bookingUrl": "https://res.windsurfercrs.com/ibe/index.aspx?lang=en-us&nono=1&propertyID=17694",
      "bookingAction": "rates",
      "platform": "direct",
      "sourceMode": "website-review",
      "priceText": null,
      "priceCaveat": "Check the official booking page for rates for your dates, occupancy, and room choice. No nightly quote was retrieved.",
      "durationText": null,
      "durationLabel": "Stay dates",
      "durationMinutesMin": null,
      "durationMinutesMax": null,
      "serviceEvidence": "Check-in 4:00 PM; checkout 11:00 AM. The main official Book Now navigation points to this Windsurfer page, which identifies Hotel Seward and its Fifth Avenue address. A separate footer booking link uses another provider; use the verified main navigation target.",
      "serviceNotes": "Confirm operating dates and stay policies with the hotel.",
      "sourceReferences": [
        {
          "label": "Property website",
          "url": "https://hotelsewardalaska.com/"
        },
        {
          "label": "Rooms and policies",
          "url": "https://hotelsewardalaska.com/accommodations"
        },
        {
          "label": "Official booking page",
          "url": "https://res.windsurfercrs.com/ibe/index.aspx?lang=en-us&nono=1&propertyID=17694"
        }
      ],
      "checkedAt": "2026-10-04T04:14:34.000Z",
      "detailsCheckedAt": "2026-10-04T04:14:34.000Z",
      "lastAttemptAt": "2026-10-04T04:14:34.000Z",
      "fetchStatus": "ok",
      "calendarSupported": false,
      "inventoryUnit": null,
      "locationLabel": "Historic downtown Seward",
      "mapQuery": "Hotel Seward, 221 Fifth Avenue, Seward, AK 99664",
      "imageUrl": "https://hotelsewardalaska.com/hs-fs/hubfs/Compressed%20Photos/Hotel%20Seward%20Lobby%201.jpg?width=1000&height=667&name=Hotel%20Seward%20Lobby%201.jpg",
      "imageAlt": "Lobby at Hotel Seward",
      "imageSourceUrl": "https://hotelsewardalaska.com/",
      "imageCredit": "Source: Hotel Seward official website",
      "imageEvidence": "Observed 1000w srcset URL on the official homepage; its image alt is Hotel Seward Lobby 1. HTTP 200 image/jpeg verified.",
      "locationEvidenceUrl": "https://hotelsewardalaska.com/",
      "locationEvidence": "221 Fifth Avenue, Seward, AK 99664; historic downtown Seward",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
    },
    {
      "id": "seward-windsong-lodge",
      "operator": "Seward Windsong Lodge",
      "name": "Seward Windsong Lodge",
      "listingType": "lodging",
      "category": "Lodging",
      "subcategory": "Lodge",
      "serviceLabel": "Lodge near Seward",
      "locationText": "31772 Herman Leirer Road, Seward, AK 99664; Exit Glacier Valley, three miles from downtown Seward",
      "description": "Stay beside Resurrection River in Exit Glacier Valley, with lodge accommodations, on-site dining, and a setting near Seward and Kenai Fjords National Park.",
      "sourceUrl": "https://www.alaskacollection.com/lodging/seward-windsong-lodge/",
      "bookingUrl": "https://www.alaskacollection.com/lodging/seward-windsong-lodge/",
      "bookingAction": "rates",
      "platform": "direct",
      "sourceMode": "website-review",
      "priceText": null,
      "priceCaveat": "Check the official Rates & Availability control for your stay dates and room choice. No nightly quote was retrieved.",
      "durationText": null,
      "durationLabel": "Stay dates",
      "durationMinutesMin": null,
      "durationMinutesMax": null,
      "serviceEvidence": "Check-in 4:00 PM; checkout 11:00 AM. Use the official lodge details page and its Rates & Availability control. The control resolved to this same page in the public document; no unverified booking-engine URL is supplied.",
      "serviceNotes": "2026 season: May 14–September 15. 2027 season: May 13–September 14.",
      "sourceReferences": [
        {
          "label": "Property website",
          "url": "https://www.alaskacollection.com/lodging/seward-windsong-lodge/"
        },
        {
          "label": "Location and directions",
          "url": "https://www.alaskacollection.com/lodging/seward-windsong-lodge/getting-here/"
        },
        {
          "label": "Lodge FAQs",
          "url": "https://www.alaskacollection.com/lodging/seward-windsong-lodge/faqs/"
        }
      ],
      "checkedAt": "2026-10-04T04:14:34.000Z",
      "detailsCheckedAt": "2026-10-04T04:14:34.000Z",
      "lastAttemptAt": "2026-10-04T04:14:34.000Z",
      "fetchStatus": "ok",
      "calendarSupported": false,
      "inventoryUnit": null,
      "locationLabel": "Exit Glacier Valley · near Seward",
      "mapQuery": "Seward Windsong Lodge, 31772 Herman Leirer Road, Seward, AK 99664",
      "imageUrl": "https://www.alaskacollection.com/getmedia/3297b14d-c3f3-4905-b540-4f8d47555dc4/PR-Exterior-of-Seward-Windsong-Lodge.jpg?width=547&height=357&ext=.jpg",
      "imageAlt": "Exterior of Seward Windsong Lodge",
      "imageSourceUrl": "https://www.alaskacollection.com/lodging/seward-windsong-lodge/",
      "imageCredit": "Source: Alaska Collection / Seward Windsong Lodge official website",
      "imageEvidence": "Observed relative img src on the official lodge page, resolved against its origin; its alt identifies the lodge exterior. HTTP 200 image/jpeg verified.",
      "locationEvidenceUrl": "https://www.alaskacollection.com/lodging/seward-windsong-lodge/faqs/",
      "locationEvidence": "31772 Herman Leirer Road, Seward, AK 99664; Exit Glacier Valley, three miles from downtown Seward",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
    },
    {
      "id": "alaska-railroad-coastal-classic",
      "operator": "Alaska Railroad",
      "name": "Coastal Classic Train",
      "listingType": "transportation",
      "category": "Transportation",
      "subcategory": "Train",
      "serviceLabel": "Seasonal scheduled train",
      "locationText": "Coastal Classic train route between Anchorage and Seward, with a Girdwood stop",
      "description": "Travel between Anchorage and Seward via Girdwood, following Turnagain Arm and mountain backcountry, with Adventure Class or GoldStar service and onboard dining available.",
      "sourceUrl": "https://alaskarailroad.com/ride-a-train/our-trains/coastal-classic",
      "bookingUrl": "https://alaskarailroad.com/ride-a-train/schedules",
      "bookingAction": "schedule",
      "platform": "direct",
      "sourceMode": "website-review",
      "priceText": "$133 per adult, one-way Adventure Class, Anchorage–Seward, 2027 season",
      "priceCaveat": "Published 2027 adult one-way Adventure Class fare for Anchorage to Seward or Seward to Anchorage; child ages 2–11 is $67. GoldStar is a separate fare. Not a checkout quote.",
      "durationText": "Anchorage to Seward: 4 hr 35 min; Seward to Anchorage: 4 hr 15 min (calculated from the published 2027 timetable)",
      "durationLabel": "4 hr 15–35 min (scheduled)",
      "durationMinutesMin": 255,
      "durationMinutesMax": 275,
      "durationBasis": "schedule",
      "durationEvidence": "Anchorage departs 6:45 AM; Seward arrives 11:20 AM. Seward departs 6:00 PM; Anchorage arrives 10:15 PM. These calculations apply to the full Anchorage–Seward route, not the shorter Girdwood legs.",
      "serviceEvidence": "Daily seasonal service May 14–September 12, 2027, according to the official Coastal Classic schedule. Travel times and fares shown apply to the full Anchorage–Seward route.",
      "serviceNotes": "Daily seasonal service May 14–September 12, 2027, according to the official Coastal Classic schedule.",
      "sourceReferences": [
        {
          "label": "Service details",
          "url": "https://alaskarailroad.com/ride-a-train/our-trains/coastal-classic"
        },
        {
          "label": "2027 timetable",
          "url": "https://alaskarailroad.com/ride-a-train/schedules"
        },
        {
          "label": "2027 fares",
          "url": "https://alaskarailroad.com/ride-a-train/fares"
        },
        {
          "label": "Official booking page",
          "url": "https://alaskarailroad.com/ride-a-train/buy-tickets/coastal-classic"
        }
      ],
      "checkedAt": "2026-10-04T04:14:34.000Z",
      "detailsCheckedAt": "2026-10-04T04:14:34.000Z",
      "lastAttemptAt": "2026-10-04T04:14:34.000Z",
      "fetchStatus": "ok",
      "calendarSupported": false,
      "inventoryUnit": null,
      "locationLabel": "Anchorage – Girdwood – Seward",
      "mapQuery": "Anchorage to Seward via Girdwood, Alaska",
      "imageUrl": "https://www.alaskarailroad.com/sites/default/files/uploads/alaska_railroad_coastal_classic_train.jpg",
      "imageAlt": "Alaska Railroad Coastal Classic train",
      "imageSourceUrl": "https://alaskarailroad.com/ride-a-train/our-trains/coastal-classic",
      "imageCredit": "Glenn Aronwits / Alaska Railroad",
      "imageEvidence": "Observed header background-image URL in the official Coastal Classic page. The page explicitly credits its header photograph to Glenn Aronwits. HTTP 200 image/jpeg verified.",
      "mapNote": "Route search, not a claimed station address or exact boarding point.",
      "locationEvidenceUrl": "https://alaskarailroad.com/ride-a-train/our-trains/coastal-classic",
      "locationEvidence": "Coastal Classic train route between Anchorage and Seward, with a Girdwood stop. Route search, not a claimed station address or exact boarding point.",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
    },
    {
      "id": "park-connection-seward-express",
      "operator": "Park Connection Motorcoach",
      "name": "Seward Express",
      "listingType": "transportation",
      "category": "Transportation",
      "subcategory": "Coach",
      "serviceLabel": "Seasonal scheduled motorcoach",
      "locationText": "Seward Express motorcoach route between Anchorage and Seward",
      "description": "Ride a scheduled motorcoach between Anchorage and Seward, with one daily trip in each direction during summer and pickups and drop-offs in both destinations.",
      "sourceUrl": "https://www.alaskacoach.com/routes/seward-express/",
      "bookingUrl": "https://www.alaskacoach.com/schedules/",
      "bookingAction": "schedule",
      "platform": "direct",
      "sourceMode": "website-review",
      "priceText": "$80 per adult, one-way Anchorage–Seward, 2027 season",
      "priceCaveat": "Official 2027 one-way route rate in either direction: adult age 12+ $80; child age 0–11 $40. Not a checkout quote.",
      "durationText": "Anchorage to Seward: 2 hr 45 min; Seward to Anchorage: 3 hr (calculated from the published 2027 timetable)",
      "durationLabel": "2 hr 45 min–3 hr (scheduled)",
      "durationMinutesMin": 165,
      "durationMinutesMax": 180,
      "durationBasis": "schedule",
      "durationEvidence": "Seward Express timetable: Anchorage to Seward 7:00 AM–9:45 AM; Seward to Anchorage 6:30 PM–9:30 PM. These times appear in the official schedule and route-page tables.",
      "serviceEvidence": "Seward Express operates daily May 12–September 13, 2027. Other Park Connection routes and designated cruise transfers have different schedules. Travel times and fares shown apply to the full Anchorage–Seward route.",
      "serviceNotes": "Seward Express operates daily May 12–September 13, 2027. Other Park Connection routes and designated cruise transfers have different schedules. The route description and timetable disagree on the Seward departure time; confirm your departure with the provider.",
      "sourceReferences": [
        {
          "label": "Service details",
          "url": "https://www.alaskacoach.com/routes/seward-express/"
        },
        {
          "label": "2027 timetable",
          "url": "https://www.alaskacoach.com/schedules/"
        },
        {
          "label": "2027 fares",
          "url": "https://www.alaskacoach.com/rates/"
        },
        {
          "label": "Official booking page",
          "url": "https://www.alaskacoach.com/book/"
        }
      ],
      "checkedAt": "2026-10-04T04:14:34.000Z",
      "detailsCheckedAt": "2026-10-04T04:14:34.000Z",
      "lastAttemptAt": "2026-10-04T04:14:34.000Z",
      "fetchStatus": "ok",
      "calendarSupported": false,
      "inventoryUnit": null,
      "locationLabel": "Anchorage – Seward",
      "mapQuery": "Anchorage to Seward, Alaska",
      "imageUrl": "https://akcoach.b-cdn.net/wp-content/uploads/park-connection-windsong-1024x683.jpg",
      "imageAlt": "Park Connection motorcoach bus",
      "imageSourceUrl": "https://www.alaskacoach.com/routes/seward-express/",
      "imageCredit": "Source: Park Connection Motorcoach official website",
      "imageEvidence": "Observed img src on the official Seward Express page; its alt identifies the Park Connection motorcoach bus. This is a representative operator vehicle, not a promise of a particular vehicle for a departure.",
      "mapNote": "Route search, not a claimed pickup street address.",
      "locationEvidenceUrl": "https://www.alaskacoach.com/routes/seward-express/",
      "locationEvidence": "Seward Express motorcoach route between Anchorage and Seward. Route search, not a claimed pickup street address.",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
    },
    {
      "id": "pjs-taxi-seward",
      "operator": "PJS Taxi & Tours",
      "name": "Seward Taxi & Private Transportation",
      "listingType": "transportation",
      "category": "Transportation",
      "subcategory": "Taxi",
      "serviceLabel": "Private transportation by inquiry",
      "locationText": "Custom pickups and drop-offs in Seward and surrounding communities; arrange the pickup directly with PJS Taxi & Tours",
      "description": "Arrange private transportation around Seward and to surrounding communities, with advertised pickups and drop-offs at hotels, the train depot, airport, cruise ships and Exit Glacier.",
      "sourceUrl": "https://www.pjstaxi.net/",
      "bookingUrl": "https://www.pjstaxi.net/",
      "bookingAction": "contact",
      "platform": "direct",
      "sourceMode": "website-review",
      "priceText": null,
      "priceCaveat": "No fare is published on the reviewed official page; obtain a route-specific quote from the provider.",
      "durationText": null,
      "durationLabel": "Depends on route",
      "durationMinutesMin": null,
      "durationMinutesMax": null,
      "durationBasis": "not-published",
      "durationEvidence": "Trip length depends on the requested pickup and destination. No fixed duration is published.",
      "serviceEvidence": "The official website offers private transfers by inquiry. No fare, dated operating schedule, or online inventory was observed.",
      "serviceNotes": "Contact the provider for a route-specific quote and pickup arrangement.",
      "sourceReferences": [
        {
          "label": "Service details",
          "url": "https://www.pjstaxi.net/"
        }
      ],
      "checkedAt": "2026-10-04T04:14:34.000Z",
      "detailsCheckedAt": "2026-10-04T04:14:34.000Z",
      "lastAttemptAt": "2026-10-04T04:14:34.000Z",
      "fetchStatus": "ok",
      "calendarSupported": false,
      "inventoryUnit": null,
      "locationLabel": "Seward & surrounding communities",
      "mapQuery": "Seward, Alaska",
      "imageUrl": null,
      "imageAlt": null,
      "imageSourceUrl": "https://www.pjstaxi.net/",
      "imageCredit": null,
      "imageEvidence": "The official website has uncaptioned gallery and og:image assets. No particular vehicle photo was verified, so use the neutral taxi fallback rather than a guessed image. The explicitly captioned Exit Glacier image depicts a destination, not a taxi.",
      "mapNote": "Service-area search only. The source publishes a postal box, not a verified taxi office or boarding address.",
      "locationEvidenceUrl": "https://www.pjstaxi.net/",
      "locationEvidence": "Custom pickups and drop-offs in Seward and surrounding communities; arrange the pickup directly with PJS Taxi & Tours. Service-area search only. The source publishes a postal box, not a verified taxi office or boarding address.",
      "mediaReviewedAt": "2026-10-04T04:38:48.673Z"
    }
  ],
  "refreshedAt": "2026-10-04T03:05:58.667Z",
  "notice": "Published provider information, not live quotes or inventory. Confirm dates, final prices, room availability, transfers, and booking terms directly with each provider."
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
type SortOrder = "shortest" | "name"

function listingType(product: Product): ListingType {
    return product.listingType === "lodging" || product.listingType === "transportation" ? product.listingType : "tour"
}

function matchesListingType(product: Product, selected: ListingType | "all"): boolean {
    return selected === "all" || listingType(product) === selected
}

function bookingAction(product: Product): BookingAction {
    return product.bookingAction && ["rates", "schedule", "contact", "dates"].includes(product.bookingAction) ? product.bookingAction
        : listingType(product) === "lodging" ? "rates" : listingType(product) === "transportation" ? "schedule" : "dates"
}

function bookingLabel(product: Product): string {
    return { rates: "Check rates", schedule: "View schedule", contact: "Contact provider", dates: "Check dates" }[bookingAction(product)]
}

function mapURL(product: Product): string | null {
    if (typeof product.mapQuery !== "string" || !product.mapQuery.trim()) return null
    const url = new URL("https://www.google.com/maps/search/")
    url.searchParams.set("api", "1")
    url.searchParams.set("query", product.mapQuery.trim())
    return url.href
}

function conciseServiceNotes(value?: string): string {
    if (!value || value.length <= 220) return value || ""
    const sentences = value.split(/(?<=[.!?])\s+/)
    const caution = sentences.slice(1).find(sentence => /disagree|closure|closed|confirm/i.test(sentence))
    return [sentences[0], caution].filter(Boolean).join(" ")
}

function compareName(a: Product, b: Product): number {
    return a.name.localeCompare(b.name) || a.operator.localeCompare(b.operator)
}

function durationRange(product: Product): [number, number] | null {
    if (listingType(product) === "lodging") return null
    const min = product.durationMinutesMin
    const max = product.durationMinutesMax
    return typeof min === "number" && typeof max === "number" && Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min ? [min, max] : null
}

function compareDuration(a: Product, b: Product, order: SortOrder): number {
    if (order === "name") return compareName(a, b)
    if (listingType(a) === "lodging" || listingType(b) === "lodging") {
        if (listingType(a) !== "lodging") return -1
        if (listingType(b) !== "lodging") return 1
        return compareName(a, b)
    }
    const first = durationRange(a)
    const second = durationRange(b)
    if (!first || !second) {
        if (first) return -1
        if (second) return 1
    } else {
        const comparison = first[0] - second[0] || first[1] - second[1]
        if (comparison) return comparison
    }
    return a.operator.localeCompare(b.operator) || a.name.localeCompare(b.name)
}

function groupListings(products: Product[], order: SortOrder): { name: string; products: Product[] }[] {
    return [{ name: "", products: [...products].sort((a, b) => compareDuration(a, b, order)) }]
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
        if (!row || typeof row.id !== "string" || !row.id || typeof row.name !== "string" || !row.name || ids.has(row.id)) throw new Error("The catalog has missing or duplicate listing information.")
        ids.add(row.id)
        return {
            id: text(row.id), name: text(row.name), operator: text(row.operator), category: text(row.category) || "Experiences", platform: text(row.platform).toLowerCase(),
            listingType: row.listingType === "lodging" || row.listingType === "transportation" ? row.listingType : "tour",
            subcategory: text(row.subcategory), serviceLabel: text(row.serviceLabel), locationText: text(row.locationText),
            locationLabel: text(row.locationLabel), mapQuery: text(row.mapQuery, 500), locationEvidence: text(row.locationEvidence), locationEvidenceUrl: publicURL(row.locationEvidenceUrl) || "",
            imageUrl: publicURL(row.imageUrl) || "", imageAlt: text(row.imageAlt, 500), imageSourceUrl: publicURL(row.imageSourceUrl) || "", imageCredit: text(row.imageCredit, 500), mediaReviewedAt: text(row.mediaReviewedAt), imageEvidence: text(row.imageEvidence),
            serviceEvidence: text(row.serviceEvidence), serviceNotes: text(row.serviceNotes), sourceMode: text(row.sourceMode),
            bookingAction: ["rates", "schedule", "contact", "dates"].includes(row.bookingAction) ? row.bookingAction : undefined,
            sourceReferences: Array.isArray(row.sourceReferences) ? row.sourceReferences.slice(0, 20).filter((reference: any) => text(reference?.label) && publicURL(reference?.url)).map((reference: any) => ({ label: text(reference.label, 200), url: publicURL(reference.url)! })) : [],
            sourceUrl: publicURL(row.sourceUrl) || "", bookingUrl: publicURL(row.bookingUrl) || "",
            priceText: text(row.priceText) || null, durationText: text(row.durationText) || null, priceCaveat: text(row.priceCaveat),
            durationMinutesMin: typeof row.durationMinutesMin === "number" && Number.isFinite(row.durationMinutesMin) ? row.durationMinutesMin : null,
            durationMinutesMax: typeof row.durationMinutesMax === "number" && Number.isFinite(row.durationMinutesMax) ? row.durationMinutesMax : null,
            durationLabel: text(row.durationLabel), durationBasis: text(row.durationBasis), durationEvidence: text(row.durationEvidence), description: text(row.description, 800), detailsCheckedAt: text(row.detailsCheckedAt),
            checkedAt: text(row.checkedAt), lastAttemptAt: text(row.lastAttemptAt), fetchStatus: row.fetchStatus === "ok" ? "ok" : "error", error: text(row.error?.message || row.error),
            calendarSupported: row.listingType !== "lodging" && row.listingType !== "transportation" && row.calendarSupported === true,
            availability: withAvailability && row.listingType !== "lodging" && row.listingType !== "transportation" ? readAvailability(row.availability) : undefined,
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

function TypeIcon({ type }: { type: ListingType }) {
    return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {type === "lodging" ? <><path d="M4 25V13m24 12V13M4 20h24M4 16h24v4H4zM7 16v-5h18v5M9 13h5m4 0h5M4 23h24" /></> : type === "transportation" ? <><rect x="7" y="4" width="18" height="22" rx="4" /><path d="M7 17h18M11 8h10M11 22h1m8 0h1M11 26v3m10-3v3" /></> : <><path d="m3 25 10-18 7 12 4-7 6 13H3zM10 12l3 3 3-3M20 19l3 3 3-3" /></>}
    </svg>
}

function ListingImage({ product }: { product: Product }) {
    const source = publicURL(product.imageUrl)
    const [failed, setFailed] = React.useState(false)
    React.useEffect(() => setFailed(false), [source])
    return <div className="swt-listing-image">{source && !failed ? <img src={source} alt={product.imageAlt || product.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : <div className="swt-image-fallback"><TypeIcon type={listingType(product)} /><span>{listingType(product) === "lodging" ? "Lodging" : listingType(product) === "tour" ? "Activity" : "Transport"}</span><small>Photo unavailable</small></div>}</div>
}

function LandingVideo() {
    const player = React.useRef<HTMLVideoElement | null>(null)
    const [autoplay, setAutoplay] = React.useState(false)
    const [failed, setFailed] = React.useState(false)
    React.useEffect(() => {
        const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
        const update = () => setAutoplay(!preference.matches)
        update()
        preference.addEventListener("change", update)
        return () => preference.removeEventListener("change", update)
    }, [])
    React.useEffect(() => {
        if (autoplay) player.current?.play().catch(() => { /* Native controls remain available when autoplay is blocked. */ })
        else player.current?.pause()
    }, [autoplay])
    return <section className="swt-video-landing" aria-labelledby="swt-hero-title">
        <h1 id="swt-hero-title" className="swt-sr">Seward OneStop: last-minute openings, local deals, easy booking.</h1>
        <figure className="swt-video-stage">
            <video ref={player} className="swt-demo-video" src={DEMO_VIDEO} poster={DEMO_POSTER} controls muted loop playsInline autoPlay={autoplay} preload="metadata" aria-label="Seward OneStop 30-second iPhone demo" aria-describedby="swt-video-description" onError={() => setFailed(true)}>
                Your browser does not support this video. <a href={DEMO_VIDEO}>Watch the Seward OneStop demo</a>.
            </video>
            <figcaption>Concept demo · Illustrative bookings and prices</figcaption>
            {failed && <p className="swt-video-error">The video could not load. <a href={DEMO_VIDEO} target="_blank" rel="noopener noreferrer">Open the demo video ↗</a></p>}
        </figure>
        <p id="swt-video-description" className="swt-sr">A vendor publishes two canceled kayak seats, discounted from $150 to $120 per person. A traveler gets an opening notification and books both for $240, saving $60. The vendor fills the two seats. This is an illustrative concept, not live inventory. Audio contains music and notification sounds, with no speech.</p>
        <PageLink pageId={BOOKING_PAGE.webPageId} className="swt-video-explore">Browse bookings <span aria-hidden="true">→</span></PageLink>
    </section>
}

function PageLink({ pageId, children, ...props }: { pageId: string; children: React.ReactNode; className?: string; "aria-label"?: string; "aria-current"?: "page" }) {
    return <Link href={{ webPageId: pageId }} motionChild><motion.a {...props}>{children}</motion.a></Link>
}

function SiteHeader({ active }: { active: "welcome" | "booking" }) {
    return <header className="swt-home-header">
        <PageLink pageId={WELCOME_PAGE.webPageId} className="swt-wordmark" aria-label="Seward OneStop home">Seward<span>OneStop</span></PageLink>
        <nav aria-label="Main navigation">
            <PageLink pageId={WELCOME_PAGE.webPageId} aria-current={active === "welcome" ? "page" : undefined}>Welcome</PageLink>
            <PageLink pageId={BOOKING_PAGE.webPageId} aria-current={active === "booking" ? "page" : undefined}>Booking</PageLink>
            <a href={INTEREST_URL} target="_blank" rel="noopener noreferrer" aria-label="Interest (opens in a new tab)">Interest <span aria-hidden="true">↗</span></a>
        </nav>
    </header>
}

function BookingDirectory({ sourceURL = DEFAULT_SOURCE, apiBase = "", showHero = true, style }: Props) {
    const [catalog, setCatalog] = React.useState<Catalog>(SAVED_CATALOG)
    const [mode, setMode] = React.useState<"embedded" | "snapshot" | "backend">("embedded")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState("")
    const [search, setSearch] = React.useState("")
    const [selectedType, setSelectedType] = React.useState<ListingType | "all">("lodging")
    const [date, setDate] = React.useState("2027-07-15")
    const [checking, setChecking] = React.useState<string | null>(null)
    const [now, setNow] = React.useState(() => Date.now())
    const requestSequence = React.useRef(0)
    const active = React.useRef<AbortController | null>(null)
    const resultsRef = React.useRef<HTMLElement | null>(null)
    const scrollTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
    React.useEffect(() => () => { if (scrollTimer.current) clearTimeout(scrollTimer.current) }, [])
    const backend = React.useMemo(() => backendBase(apiBase), [apiBase])
    const source = React.useMemo(() => publicURL(sourceURL), [sourceURL])
    const lodgingView = selectedType === "lodging"
    const filtered = catalog.products.filter(product => matchesListingType(product, selectedType) && `${product.name} ${product.operator} ${product.category} ${product.subcategory || ""} ${product.serviceLabel || ""} ${product.locationText || ""} ${product.description || ""}`.toLowerCase().includes(search.toLowerCase().trim()))
    const groups = groupListings(filtered, selectedType === "tour" ? "shortest" : "name")
    function selectType(value: ListingType | "all", scrollToResults = false) {
        setSelectedType(value)
        setSearch("")
        if (scrollTimer.current) clearTimeout(scrollTimer.current)
        if (scrollToResults && typeof window !== "undefined") {
            // Framer resizes the component after a category changes. Scroll once
            // that layout is applied, so the destination stays at the results.
            scrollTimer.current = setTimeout(() => window.requestAnimationFrame(() => {
                resultsRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })
            }), 180)
        }
    }
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
        if (listingType(product) !== "tour" || !backend || mode !== "backend" || checking || loading || !isDate(date)) return
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
        const supported = listingType(product) === "tour" && mode === "backend" && Boolean(backend) && product.platform === "fareharbor" && product.calendarSupported === true
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
        <SiteHeader active="booking" />
        {showHero && <>
            <section className="swt-home-hero" aria-labelledby="swt-hero-title"><img className="swt-hero-photo" src={HERO_IMAGE} alt="A glacier and mountain-lined fjord in Kenai Fjords National Park" referrerPolicy="no-referrer" /><div className="swt-hero-shade" /><div className="swt-hero-copy"><p>SEWARD, ALASKA</p><h1 id="swt-hero-title">Make Seward<br />your next stop.</h1><span>Find a place to stay, a day to remember,<br className="swt-desktop-break" /> and your way around.</span></div><span className="swt-hero-credit">Photo: National Park Service</span></section>
            <div className="swt-entry-buttons" role="group" aria-label="Start exploring Seward">{([['lodging', 'Lodging', 'Hotels & lodges'], ['tour', 'Activities', 'Tours & outdoor adventures'], ['transportation', 'Transport', 'Rail, coach & local rides']] as const).map(([value, label, detail]) => <button type="button" key={value} aria-pressed={selectedType === value} onClick={() => selectType(value, true)}><TypeIcon type={value} /><span><strong>{label}</strong><small>{detail}</small></span><span className="swt-entry-arrow" aria-hidden="true">↗</span></button>)}</div>
        </>}
        <section id="seward-listings" ref={resultsRef} aria-label="Seward vendor directory" className="swt-content">
            <div className="swt-section-head"><div><p className="swt-directory-eyebrow">THE SEWARD DIRECTORY</p><h2>{selectedType === "lodging" ? "Find your stay" : selectedType === "tour" ? "Find your next adventure" : selectedType === "transportation" ? "Find your way here" : "Explore Seward"}</h2></div><span>{filtered.length} {filtered.length === 1 ? "listing" : "listings"}</span></div>
            <div className="swt-categories" role="group" aria-label="Filter by listing type">
                {([['lodging', 'Lodging'], ['tour', 'Activities'], ['transportation', 'Transport'], ['all', 'All listings']] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={selectedType === value} onClick={() => selectType(value)}>{label}</button>)}
            </div>
            <div className="swt-toolbar">
                <label className="swt-search"><span>Search listings or providers</span><input type="search" placeholder="Tour, hotel, route, or provider" value={search} onChange={event => setSearch(event.target.value)} /></label>
                {backend && (selectedType === "all" || selectedType === "tour") && <label><span>Tour calendar date · Alaska time</span><input aria-invalid={!isDate(date)} type="date" value={date} onChange={event => setDate(event.target.value)} /></label>}
            </div>
            <div className="swt-results"><span aria-live="polite">{filtered.length} {filtered.length === 1 ? "listing" : "listings"}</span><p>{lodgingView ? "Rates depend on your stay dates. Confirm rates and availability with each property." : "Confirm current dates, rates, schedules, and availability directly with each provider."}</p></div>
            {(configuredError || error) && <div className="swt-error-banner" role="alert"><p>The latest listing information could not be loaded. Previously saved details are shown.</p><details><summary>Connection details</summary><p>{configuredError || error}</p></details></div>}
            <div className="swt-list" aria-busy={loading}>
                {groups.map(group => <section className="swt-group" key={group.name || "all-listings"} aria-label={group.name || "Vendor listings"}>
                    {group.name && <div className="swt-group-heading"><h3>{group.name}</h3><span>{group.products.length} {group.products.length === 1 ? "listing" : "listings"}</span></div>}
                    {group.products.map(product => <article className="swt-row" key={product.id}>
                        <div className="swt-row-main">
                            <ListingImage product={product} />
                            <div className="swt-row-copy"><p className="swt-operator">{product.operator === product.name ? product.subcategory || (listingType(product) === "lodging" ? "Stay in Seward" : "Local provider") : product.operator}</p>{group.name ? <h4>{product.name}</h4> : <h3>{product.name}</h3>}{(product.locationLabel || product.locationText || mapURL(product)) && <div className="swt-location"><span>{product.locationLabel || product.locationText}</span>{mapURL(product) && <ExternalLink href={mapURL(product)!} className="swt-map-link">View map ↗</ExternalLink>}</div>}{product.description && <p className="swt-description">{product.description}</p>}<p className="swt-inline-facts">{listingType(product) === "lodging" ? product.serviceLabel || product.subcategory || "Lodging" : listingType(product) === "transportation" ? <>{product.serviceLabel || product.subcategory || "Transportation"}{durationLabel(product) !== "Not specified" && <> · {durationLabel(product)}</>}</> : <><strong>Duration</strong> {durationLabel(product)}</>}</p>{product.serviceNotes && <p className="swt-service-note">{conciseServiceNotes(product.serviceNotes)}</p>}</div>
                            <div className="swt-row-booking"><dl className="swt-price"><dt>{listingType(product) === "lodging" ? "Rates for your dates" : listingType(product) === "transportation" ? "Advertised fare" : "Advertised price"}</dt><dd>{product.priceText ? priceLabel(product.priceText) : listingType(product) === "lodging" ? "Choose your stay" : listingType(product) === "transportation" ? "Ask for a quote" : "See operator website"}</dd>{listingType(product) === "lodging" && <dd className="swt-fact-note">Rates vary by date and room</dd>}</dl><div className="swt-action"><ExternalLink href={product.bookingUrl || product.sourceUrl} className="swt-book">{bookingLabel(product)} <span aria-hidden="true">↗</span></ExternalLink><span>{bookingAction(product) === "contact" ? "Arrange directly with provider" : "Continue on provider website"}</span></div></div>
                        </div>
                        {product.fetchStatus === "error" && <p className="swt-source-warning">Latest source check failed. Confirm these details with the provider.</p>}
                        <details className="swt-operator-details"><summary>{listingType(product) === "tour" ? "Operator details" : "Provider details"}</summary><div className="swt-details-body">
                            <div><h5>{listingType(product) === "lodging" ? "Property and stay information" : listingType(product) === "transportation" ? "Published service and duration" : "Published duration"}</h5>{listingType(product) !== "lodging" && <p>{product.durationEvidence || product.durationText || "A fixed travel duration has not been verified from the provider’s website."}</p>}{product.serviceEvidence && <p className="swt-detail-note">{product.serviceEvidence}</p>}{product.serviceNotes && <p className="swt-detail-note">{product.serviceNotes}</p>}{listingType(product) !== "lodging" && product.durationBasis && <p className="swt-detail-note">{product.durationBasis === "schedule" ? "Based on the provider’s published start and end times." : product.durationBasis === "published" ? "Duration stated by the provider." : product.durationBasis === "not-published" ? "A fixed duration is not published." : `Duration basis: ${product.durationBasis}`}</p>}</div>
                            <div><h5>Price and booking</h5><p>Published price: {product.priceText || "No verified quote"}</p><p className="swt-detail-note">{product.priceCaveat || "Advertised pricing is not a checkout quote. Confirm final charges and terms with the provider."}</p></div>
                            <div><h5>Source</h5><ExternalLink href={product.sourceUrl}>View provider page ↗</ExternalLink>{Boolean(product.sourceReferences?.length) && <ul className="swt-source-links">{product.sourceReferences?.map((reference, index) => <li key={`${reference.url}-${index}`}><ExternalLink href={reference.url}>{reference.label} ↗</ExternalLink></li>)}</ul>}<p className="swt-detail-note">{product.sourceMode === "website-review" ? "Website reviewed" : "Catalog checked"} {checkedTime(product.checkedAt)}{product.detailsCheckedAt && product.detailsCheckedAt !== product.checkedAt ? <><br />Listing details reviewed {checkedTime(product.detailsCheckedAt)}</> : null}</p>{product.fetchStatus === "error" && <p className="swt-error">{product.error || "Published details could not be refreshed."}{product.lastAttemptAt ? ` Last attempt: ${checkedTime(product.lastAttemptAt)}.` : ""}</p>}</div>
                            {(product.locationEvidence || product.imageSourceUrl || product.imageCredit) && <div className="swt-media-details"><h5>Location & photography</h5>{product.locationEvidence && <p>{product.locationEvidence}</p>}{product.locationEvidenceUrl && <ExternalLink href={product.locationEvidenceUrl}>Location source ↗</ExternalLink>}{product.imageCredit && <p className="swt-detail-note">{product.imageCredit}</p>}{product.imageSourceUrl && <ExternalLink href={product.imageSourceUrl}>Photo source ↗</ExternalLink>}{product.imageEvidence && <p className="swt-detail-note">{product.imageEvidence}</p>}{product.mediaReviewedAt && <p className="swt-detail-note">Location and photo reviewed {checkedTime(product.mediaReviewedAt)}.</p>}</div>}
                        </div></details>
                        {listingType(product) === "tour" && mode === "backend" && (product.calendarSupported || product.availability) ? calendar(product) : null}
                    </article>)}
                </section>)}
                {!filtered.length && <div className="swt-empty"><h3>No listings match these filters</h3><p>Try another search or listing type.</p><button className="swt-outline" type="button" onClick={() => { setSearch(""); selectType("all") }}>Clear filters</button></div>}
            </div>
            <details className="swt-catalog-details"><summary>About this directory</summary><p>Listings are saved from official provider websites; rates, seasons, and schedules can change. {selectedType === "tour" ? "Activities are ordered by published duration, shortest first; trips with unknown duration follow timed trips." : "Listings are ordered by name."} Published durations remain visible on each activity listing.</p><p>Tour source refresh: {checkedTime(catalog.refreshedAt)}. Each listing retains its own source-review date. {mode === "backend" ? "The configured backend can refresh supported tour source pages and calendars; reviewed lodging and transportation records keep their original review dates." : "This page loads saved provider information, not a live inventory feed."}</p><button className="swt-text-button" type="button" disabled={loading || Boolean(checking)} onClick={() => load(Boolean(backend))}>{loading ? "Loading…" : backend ? "Refresh supported tour pages" : "Reload saved details"}</button></details>
        </section>
    </div>
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 1120
 * @framerIntrinsicHeight 1500
 */
export default function SewardTours({ page = "welcome", ...props }: Props) {
    if (page === "booking") return <BookingDirectory {...props} />
    return <div id="seward-welcome" className="swt-root" style={{ width: "100%", ...props.style }}>
        <style>{CSS}</style>
        <SiteHeader active="welcome" />
        <LandingVideo />
    </div>
}

addPropertyControls(SewardTours, {
    page: { type: ControlType.Enum, title: "Page", options: ["welcome", "booking"], optionTitles: ["Welcome", "Booking"], defaultValue: "welcome" },
    showHero: { type: ControlType.Boolean, title: "Show Hero", defaultValue: true },
    sourceURL: { type: ControlType.String, title: "Catalog URL", defaultValue: DEFAULT_SOURCE, description: "Public HTTPS saved catalog JSON. Refreshing this file is not a live scrape." },
    apiBase: { type: ControlType.String, title: "API Base", defaultValue: "", description: "Optional deployed HTTPS backend origin/base path with CORS. Leave blank for the saved catalog demo. Never use localhost or put credentials here." },
})

const CSS = `
.swt-root{--ink:#102f47;--muted:#677783;--line:#e0e6ea;--subtle:#f6f8f9;box-sizing:border-box;background:#fff;color:var(--ink);font:15px/1.6 Inter,"Segoe UI",Arial,sans-serif;container-type:inline-size;overflow:hidden;overflow-anchor:none}.swt-root *{box-sizing:border-box}.swt-root h1,.swt-root h2,.swt-root h3,.swt-root h4,.swt-root h5,.swt-root p,.swt-root dl,.swt-root dd{margin:0}.swt-root h1,.swt-root h2,.swt-root h3,.swt-root h4,.swt-root h5{font-family:inherit}.swt-root a{color:var(--ink)}.swt-root button,.swt-root input,.swt-root select{font:inherit}.swt-root button,.swt-root summary{cursor:pointer}.swt-root button:disabled{cursor:wait;opacity:.55}.swt-root :focus-visible{outline:3px solid #3d749b;outline-offset:4px}.swt-home-header,.swt-entry-buttons,.swt-content{width:calc(100% - 88px);max-width:1180px;margin-inline:auto}.swt-home-header{height:82px;display:flex;align-items:center;justify-content:space-between;gap:25px}.swt-wordmark{display:inline-flex;align-items:baseline;gap:.22em;font-family:inherit;font-weight:700;letter-spacing:-.8px;font-size:26px;line-height:1.1;text-decoration:none;white-space:nowrap;flex-shrink:0}.swt-wordmark span{font:inherit;font-weight:500;letter-spacing:inherit}.swt-home-header nav{display:flex;gap:28px;align-items:center}.swt-home-header nav button{background:none;border:0;padding:10px 0;color:#415b6d;font-size:12px;font-weight:600}.swt-home-header nav button:hover{color:#0d2b42;text-decoration:underline;text-underline-offset:5px}.swt-home-hero{position:relative;isolation:isolate;min-height:308px;background:#1b3c50;max-width:1280px;width:calc(100% - 36px);margin:0 auto;border-radius:5px;overflow:hidden;display:flex;align-items:center}.swt-hero-photo,.swt-hero-shade{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 43%;z-index:-2}.swt-hero-shade{z-index:-1;background:linear-gradient(90deg,rgba(9,31,49,.79),rgba(12,37,54,.23) 65%,rgba(13,35,46,.13))}.swt-hero-copy{padding:33px 48px 52px;max-width:710px;color:#fff}.swt-hero-copy>p{font-size:10px;letter-spacing:2.2px;font-weight:600;margin-bottom:15px;color:#e3ecf0}.swt-hero-copy h1{font-size:47px;line-height:1.08;font-weight:650;letter-spacing:-1.6px;margin-bottom:15px}.swt-hero-copy>span{display:block;font-size:14px;line-height:1.8;color:#ecf2f5}.swt-hero-credit{position:absolute;right:17px;bottom:35px;font-size:8px;color:#eff4f6;text-shadow:0 1px 3px #102f47}.swt-entry-buttons{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px;position:relative;z-index:1;margin-top:-23px;max-width:1085px}.swt-entry-buttons>button{display:flex;align-items:center;gap:18px;min-height:88px;padding:19px 22px;background:#fff;color:var(--ink);border:1px solid #d8e1e7;border-radius:4px;box-shadow:0 4px 15px #102f4710;text-align:left}.swt-entry-buttons>button:hover,.swt-entry-buttons>button[aria-pressed=true]{border-color:#738d9e;background:#f9fbfc}.swt-entry-buttons svg{width:31px;height:31px;flex-shrink:0;color:#345b73}.swt-entry-buttons strong{display:block;font-size:18px;font-weight:650;line-height:1.3;letter-spacing:-.2px}.swt-entry-buttons small{display:block;font-size:11px;color:#7b8a94;margin-top:4px;line-height:1.5}.swt-entry-arrow{margin-left:auto;color:#59778c;font-size:21px}.swt-content{padding:44px 0 35px;scroll-margin-top:18px}.swt-section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:19px}.swt-directory-eyebrow{font-size:9px;font-weight:700;letter-spacing:1.8px;color:#738b9b;margin-bottom:8px!important}.swt-section-head h2{font-size:29px;line-height:1.2;font-weight:650;letter-spacing:-.6px}.swt-section-head>span{font-size:12px;color:#80909a;padding-bottom:3px}.swt-categories{display:flex;flex-wrap:wrap;align-items:center;gap:6px 24px;min-height:46px;border-bottom:1px solid var(--line);margin:0 0 22px;padding:0}.swt-categories button{flex-shrink:0;border:0;border-bottom:2px solid transparent;background:none;color:#788894;padding:11px 0;font-size:13px;line-height:1.4;white-space:nowrap}.swt-categories button[aria-pressed=true]{color:var(--ink);font-weight:650;border-bottom-color:var(--ink)}.swt-categories button:hover{color:var(--ink)}.swt-toolbar{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;position:relative;clear:both}.swt-toolbar>label{display:block;min-width:0;margin:0}.swt-toolbar>.swt-search{width:100%}.swt-toolbar label>span{display:block;color:#71828f;font-size:10px;font-weight:600;margin-bottom:6px}.swt-toolbar input,.swt-toolbar select{display:block;width:100%;height:44px;padding:9px 12px;border:1px solid #d2dce3;border-radius:3px;background:#fff;color:var(--ink);font-size:12px}.swt-toolbar input::placeholder{color:#8897a1}.swt-toolbar select{cursor:pointer}.swt-filter-help{font-size:11px;color:var(--muted);margin-top:10px!important}.swt-results{display:flex;justify-content:space-between;align-items:baseline;gap:24px;padding:18px 0 20px}.swt-results>span{font-size:11px;font-weight:600;white-space:nowrap}.swt-results>p{font-size:11px;color:var(--muted);text-align:right;max-width:670px}.swt-error-banner{background:#fbf5ef;color:#714c2e;border-left:3px solid #c19364;padding:12px 15px;font-size:12px;margin-bottom:19px}.swt-error-banner details{font-size:11px;margin-top:5px}.swt-error-banner details p{margin-top:6px;overflow-wrap:anywhere}.swt-list{width:100%}.swt-group+.swt-group{margin-top:25px}.swt-group-heading{display:flex;gap:12px;align-items:baseline;padding:0 0 12px;border-bottom:1px solid #c4d1da}.swt-group-heading h3{font-size:17px;line-height:1.4;font-weight:650;letter-spacing:-.2px}.swt-group-heading>span{color:#81909a;font-size:11px}.swt-row{padding:23px 0 20px;border-bottom:1px solid var(--line)}.swt-row-main{display:grid;grid-template-columns:220px minmax(0,1fr) 185px;gap:25px;align-items:start}.swt-listing-image{height:166px;width:100%;overflow:hidden;border-radius:4px;background:#edf1f3}.swt-listing-image>img{width:100%;height:100%;object-fit:cover;display:block}.swt-image-fallback{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#8ba0ae;background:linear-gradient(135deg,#f0f4f6,#e7edf0)}.swt-image-fallback svg{width:36px;height:36px;margin-bottom:9px}.swt-image-fallback>span{font-size:12px}.swt-image-fallback>small{font-size:9px;color:#9baab4;margin-top:3px}.swt-operator{font-size:10px;color:#7d929f;font-weight:550;margin:0 0 5px!important}.swt-row-copy h3,.swt-row-copy h4{font-size:22px;font-weight:650;line-height:1.25;letter-spacing:-.45px;color:var(--ink)}.swt-location{display:flex;flex-wrap:wrap;gap:2px 11px;align-items:baseline;margin-top:8px;font-size:11px;color:#778996;line-height:1.5}.swt-map-link{font-size:10px;color:#527b96!important;text-decoration:none;white-space:nowrap}.swt-map-link:hover{text-decoration:underline;text-underline-offset:3px}.swt-description{font-size:13px;line-height:1.65;color:#667a88;margin-top:10px!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.swt-inline-facts{font-size:11px;line-height:1.65;color:#4c6576;margin-top:10px!important}.swt-inline-facts strong{font-size:10px;font-weight:600;color:#82929e;margin-right:6px}.swt-service-note{font-size:10px;color:#7d8d96;line-height:1.6;margin-top:8px!important}.swt-row-booking{padding-top:4px;text-align:right}.swt-price dt{font-size:9px;color:#8a98a3;line-height:1.5;margin-bottom:8px}.swt-price dd{font-size:16px;font-weight:600;line-height:1.55;letter-spacing:-.1px;color:var(--ink);overflow-wrap:anywhere}.swt-row .swt-fact-note{display:block;font-size:10px;font-weight:400;line-height:1.6;color:#8495a1;margin-top:7px!important}.swt-action{margin-top:15px}.swt-book{display:flex;align-items:center;justify-content:space-between;gap:14px;background:#12374f;color:#fff!important;min-height:42px;padding:10px 13px;border-radius:3px;text-decoration:none;font-size:12px;font-weight:600;white-space:nowrap}.swt-book:hover{background:#254f6b}.swt-action>span{display:block;color:#98a4ac;font-size:9px;text-align:center;margin-top:7px}.swt-operator-details{margin:14px 0 0 245px}.swt-operator-details>summary{width:fit-content;color:#8495a1;font-size:10px;list-style:none;display:flex;align-items:center;gap:7px}.swt-operator-details>summary:before{content:'+';font-size:14px;line-height:1}.swt-operator-details[open]>summary:before{content:'−'}.swt-operator-details>summary::-webkit-details-marker{display:none}.swt-operator-details>summary:hover{color:var(--ink)}.swt-operator-details[open]{margin-left:0}.swt-details-body{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;background:var(--subtle);padding:20px;margin-top:11px;font-size:11px;line-height:1.8;color:var(--muted)}.swt-details-body h5{font-size:11px;font-weight:650;margin-bottom:7px}.swt-details-body a{text-underline-offset:3px}.swt-detail-note{margin-top:8px!important;font-size:10px;color:#7e8e99}.swt-media-details{grid-column:1/-1;padding-top:14px;border-top:1px solid #dfe6ea}.swt-media-details>a{display:inline-block;margin:7px 15px 0 0;font-size:10px}.swt-source-links{list-style:none;padding:0;margin:8px 0}.swt-source-links li{margin-top:4px}.swt-source-warning,.swt-error{color:#885832;font-size:11px;margin-top:11px!important;overflow-wrap:anywhere}.swt-catalog-details{margin-top:25px;font-size:11px;color:var(--muted)}.swt-catalog-details>summary{width:fit-content}.swt-catalog-details>p{line-height:1.8;margin-top:11px;max-width:860px}.swt-text-button{background:transparent;border:0;border-bottom:1px solid #a6b6c2;color:var(--ink);font-size:11px!important;margin-top:12px;padding:2px 0}.swt-outline{border:1px solid #b8c7d1;background:#fff;color:var(--ink);border-radius:3px;min-height:40px;padding:9px 15px;font-size:12px!important}.swt-outline:hover{background:var(--subtle)}.swt-empty{text-align:center;padding:38px 20px;border-block:1px solid var(--line)}.swt-empty h3{font-size:19px;font-weight:600}.swt-empty p{font-size:13px;color:var(--muted);margin:9px 0 18px}.swt-calendar{padding:16px 18px;background:var(--subtle);border:1px solid var(--line);margin-top:18px;font-size:12px;max-width:760px}.swt-calendar-heading{display:flex;justify-content:space-between;gap:16px;font-size:12px;margin-bottom:10px}.swt-calendar-heading>span,.swt-calendar>p,.swt-calendar>small{color:var(--muted)}.swt-calendar>small{display:block;font-size:11px;margin-top:9px}.swt-calendar-button{border:0;border-bottom:1px solid #9eb5c5;background:transparent;color:var(--ink);font-size:12px!important;padding:4px 0;margin-top:10px}.swt-departures{list-style:none;padding:0;margin:0;max-height:300px;overflow:auto}.swt-departures li{padding:11px 0;border-top:1px solid var(--line);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 15px;font-size:12px}.swt-departures small{display:block;color:var(--muted);font-size:11px;overflow-wrap:anywhere}.swt-count,.swt-unknown{font-size:11px;font-weight:600}.swt-unknown{color:var(--muted);font-weight:400}.swt-departures details{grid-column:1/-1;font-size:11px;color:var(--muted)}.swt-departures details p{padding:8px 10px;background:#fff;white-space:pre-wrap;overflow-wrap:anywhere;margin-top:5px}.swt-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@container(max-width:1000px){.swt-home-header,.swt-entry-buttons,.swt-content{width:calc(100% - 60px)}.swt-row-main{grid-template-columns:190px minmax(0,1fr) 163px;gap:20px}.swt-listing-image{height:158px}.swt-operator-details{margin-left:210px}.swt-row-copy h3,.swt-row-copy h4{font-size:20px}.swt-entry-buttons>button{padding:17px;gap:13px}.swt-entry-buttons strong{font-size:17px}.swt-entry-buttons small{font-size:10px}.swt-entry-arrow{font-size:18px}.swt-entry-buttons svg{width:28px;height:28px}.swt-price dd{font-size:14px}.swt-details-body{gap:18px;padding:18px}}
@container(max-width:780px){.swt-home-header,.swt-entry-buttons,.swt-content{width:calc(100% - 44px)}.swt-home-header{height:75px}.swt-home-hero{min-height:282px;width:calc(100% - 24px)}.swt-hero-copy{padding:29px 30px 48px}.swt-hero-copy h1{font-size:43px}.swt-entry-buttons{gap:10px}.swt-entry-buttons>button{padding:15px 13px;min-height:85px;gap:10px}.swt-entry-buttons svg{width:24px;height:24px}.swt-entry-buttons strong{font-size:16px}.swt-entry-buttons small{font-size:9px}.swt-entry-arrow{display:none}.swt-content{padding-top:35px}.swt-section-head h2{font-size:27px}.swt-row-main{grid-template-columns:150px minmax(0,1fr) 150px;gap:17px}.swt-listing-image{height:154px}.swt-row-copy h3,.swt-row-copy h4{font-size:18px}.swt-description{font-size:12px}.swt-price dd{font-size:13px}.swt-book{font-size:11px;padding-inline:10px;gap:8px}.swt-operator-details{margin-left:167px}.swt-details-body{grid-template-columns:1fr 1fr}.swt-details-body>div:nth-child(3){grid-column:1/-1}.swt-results{display:block;padding:15px 0 18px}.swt-results>p{text-align:left;margin-top:6px}.swt-toolbar{gap:13px}.swt-toolbar>.swt-search{flex-basis:100%}.swt-home-header nav{gap:21px}.swt-home-header nav button{font-size:11px}.swt-wordmark{font-size:24px}}
@container(max-width:640px){.swt-row-main{grid-template-columns:125px minmax(0,1fr);gap:14px 18px}.swt-listing-image{height:143px}.swt-row-copy h3,.swt-row-copy h4{font-size:21px}.swt-row-booking{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;gap:20px;text-align:left;border-top:1px solid #edf1f3;padding-top:13px}.swt-row-booking>.swt-price{flex:1;max-width:360px}.swt-row-booking>.swt-action{width:160px;flex-shrink:0;margin-top:0}.swt-price dt{margin-bottom:4px}.swt-price dd{font-size:14px}.swt-price .swt-fact-note{margin-top:3px!important}.swt-operator-details{margin-left:0;margin-top:12px}.swt-book{font-size:12px;padding-inline:12px}.swt-action>span{font-size:8px}.swt-description{font-size:12px}.swt-location{font-size:10px}.swt-inline-facts{font-size:10px}.swt-service-note{font-size:10px}.swt-row{padding:20px 0 17px}.swt-details-body{grid-template-columns:1fr;gap:18px}.swt-details-body>div:nth-child(3){grid-column:auto}}
@container(max-width:440px){.swt-home-header,.swt-entry-buttons,.swt-content{width:calc(100% - 34px)}.swt-home-header{height:auto;min-height:88px;flex-wrap:wrap;justify-content:center;gap:13px;padding:16px 0}.swt-wordmark{font-size:22px;letter-spacing:-.65px}.swt-home-header nav{width:100%;justify-content:center;gap:28px}.swt-home-header nav button{font-size:10px}.swt-home-hero{width:calc(100% - 18px);min-height:268px}.swt-hero-copy{padding:25px 22px 51px}.swt-hero-copy h1{font-size:38px;letter-spacing:-1.4px}.swt-hero-copy>p{font-size:8px;letter-spacing:1.8px;margin-bottom:14px}.swt-hero-copy>span{font-size:12px}.swt-hero-credit{font-size:6px;right:11px;bottom:28px}.swt-entry-buttons{gap:7px;margin-top:-22px}.swt-entry-buttons>button{display:flex;flex-direction:column;gap:8px;padding:12px 7px;min-height:105px;text-align:center}.swt-entry-buttons svg{width:25px;height:25px}.swt-entry-buttons strong{font-size:15px}.swt-entry-buttons small{font-size:8px;line-height:1.4;margin-top:3px}.swt-content{padding:31px 0 28px}.swt-section-head{margin-bottom:15px;align-items:flex-end}.swt-section-head h2{font-size:25px}.swt-section-head>span{font-size:10px}.swt-directory-eyebrow{font-size:8px;letter-spacing:1.4px}.swt-categories{gap:4px 18px;margin-bottom:20px}.swt-categories button{font-size:12px;padding:10px 0}.swt-toolbar{gap:12px}.swt-toolbar>label{flex:1 1 125px}.swt-toolbar input,.swt-toolbar select{font-size:12px}.swt-results>p{font-size:10px;line-height:1.7}.swt-row-main{grid-template-columns:106px minmax(0,1fr);gap:13px 14px}.swt-listing-image{height:130px}.swt-row-copy h3,.swt-row-copy h4{font-size:18px;line-height:1.26}.swt-operator{font-size:9px;margin-bottom:4px!important}.swt-description{font-size:11px;line-height:1.6;margin-top:8px!important}.swt-location{margin-top:6px;gap:3px 8px}.swt-map-link{font-size:9px}.swt-inline-facts{font-size:10px;margin-top:8px!important}.swt-service-note{font-size:9px;line-height:1.55;margin-top:7px!important}.swt-row-booking{gap:15px}.swt-row-booking>.swt-action{width:140px}.swt-price dd{font-size:13px}.swt-price dt{font-size:8px}.swt-row .swt-fact-note{font-size:9px}.swt-book{font-size:11px;min-height:41px}.swt-action>span{font-size:7px}.swt-group+.swt-group{margin-top:23px}.swt-group-heading h3{font-size:16px}.swt-catalog-details{font-size:10px}.swt-calendar{padding:13px}.swt-departures li{grid-template-columns:1fr}.swt-count,.swt-unknown{justify-self:start}}
.swt-video-landing{width:calc(100% - 48px);max-width:1360px;margin:0 auto;text-align:center}.swt-video-stage{margin:0;border-radius:10px;background:#10383d;padding:20px 24px 14px;display:flex;flex-direction:column;align-items:center;gap:12px;overflow:hidden}.swt-demo-video{display:block;height:min(72svh,680px);max-width:100%;width:auto;aspect-ratio:9/16;object-fit:contain;background:#061b1e;border-radius:5px}.swt-video-stage figcaption{font-size:10px;line-height:1.5;color:#cbdedc;letter-spacing:.15px}.swt-video-error{font-size:12px;color:#fff}.swt-video-error a{color:inherit;text-decoration:underline}.swt-video-explore{display:inline-flex;gap:16px;align-items:center;justify-content:center;border:1px solid #bed0cf;border-radius:5px;background:white;color:var(--ink);min-height:44px;padding:12px 22px;margin:18px auto 4px;font:600 13px Inter,"Segoe UI",Arial,sans-serif;cursor:pointer}.swt-video-explore:hover{background:#eef5f4}.swt-video-explore:focus-visible{outline:3px solid #28686b;outline-offset:3px}@container(max-width:640px){.swt-video-landing{width:calc(100% - 24px)}.swt-video-stage{padding:12px 12px 10px;gap:10px}.swt-demo-video{height:auto;width:min(100%,calc(70svh * 9 / 16));max-height:680px}.swt-video-stage figcaption{font-size:9px}.swt-video-explore{margin-top:14px}}
.swt-home-header nav a{display:inline-flex;align-items:center;gap:5px;padding:10px 0;color:#415b6d;font-size:12px;font-weight:600;text-decoration:none;white-space:nowrap}.swt-home-header nav a[aria-current=page]{color:#102f47;text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:2px}.swt-home-header nav a:hover{color:#0d2b42;text-decoration:underline;text-underline-offset:6px}.swt-video-explore{text-decoration:none}@container(max-width:440px){.swt-home-header nav a{font-size:11px}.swt-home-header nav{gap:27px}}
@media(prefers-reduced-motion:reduce){.swt-root *{scroll-behavior:auto!important}}
`
