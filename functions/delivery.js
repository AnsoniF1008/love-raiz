/**
 * Delivery pricing — edit the tiers here.
 *
 * The fee depends on how far the customer is from the kitchen. The server
 * geocodes the address (US Census geocoder: free, no API key, US addresses
 * only), measures the distance and picks the first tier that covers it.
 * Past the last tier we don't deliver and the customer is offered pickup.
 *
 * The storefront imports this file too, only to show the tiers and in demo
 * mode; the fee a customer pays is always the one the server computes.
 */
export const DELIVERY = {
  // 103 Smith Ln, Newport News, VA 23601
  origin: { lat: 37.055162, lng: -76.46809 },
  // Roads are longer than a straight line; this turns straight-line miles
  // into an estimate of driving miles. 1 = straight line.
  roadFactor: 1.25,
  tiers: [
    { upToMiles: 5, fee: 5 },
    { upToMiles: 10, fee: 8 },
    { upToMiles: 15, fee: 12 },
    { upToMiles: 20, fee: 15 },
  ],
}

export const maxDeliveryMiles = () => DELIVERY.tiers[DELIVERY.tiers.length - 1].upToMiles

/** Driving-mile estimate between two points. */
export function milesBetween(a, b) {
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  const straight = 3958.8 * 2 * Math.asin(Math.sqrt(h))
  return Math.round(straight * DELIVERY.roadFactor * 10) / 10
}

/** { miles, fee } for a distance, or null when it is past the last tier. */
export function feeForMiles(miles) {
  const tier = DELIVERY.tiers.find((t) => miles <= t.upToMiles)
  return tier ? { miles, fee: tier.fee } : null
}

const CENSUS = 'https://geocoding.geo.census.gov/geocoder'

/**
 * Looks up a US street address. Returns { lat, lng, matched } or null.
 * `base` lets the local dev server route the call through its proxy.
 */
export async function geocode(address, base = CENSUS) {
  const url = new URL(`${base}/locations/onelineaddress`, globalThis.location?.href)
  url.search = new URLSearchParams({ address, benchmark: 'Public_AR_Current', format: 'json' })
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Geocoder responded ${res.status}`)
  const match = (await res.json())?.result?.addressMatches?.[0]
  return match ? { lat: match.coordinates.y, lng: match.coordinates.x, matched: match.matchedAddress } : null
}

/**
 * Full quote for an address.
 * { ok: true, miles, fee, matched } | { ok: false, reason: 'not-found' | 'too-far', miles? }
 */
export async function quoteDelivery(address, base) {
  const place = await geocode(address, base)
  if (!place) return { ok: false, reason: 'not-found' }
  const miles = milesBetween(DELIVERY.origin, place)
  const quote = feeForMiles(miles)
  return quote ? { ok: true, ...quote, matched: place.matched } : { ok: false, reason: 'too-far', miles }
}

/** What to tell the customer when a quote fails. */
export const deliveryMessage = (q) => q.reason === 'too-far'
  ? `That address is about ${q.miles} miles away. We deliver up to ${maxDeliveryMiles()} miles; pickup is always available.`
  : "We couldn't find that address. Check the street, city and ZIP, or choose pickup."

/**
 * Delivery windows a customer can pick at checkout. The server rejects any
 * other value, so edit them here only. Keep the "HH:MM AM - HH:MM PM" shape:
 * existing orders store these exact strings.
 */
export const DELIVERY_SLOTS = ['10:00 AM - 02:00 PM', '02:00 PM - 06:00 PM', '06:00 PM - 08:30 PM']

/** '02:00 PM - 06:00 PM' → '2 – 6 PM', for tight spaces. */
export function slotLabel(slot) {
  const parts = slot.split(' - ').map((t) => {
    const [, h, m, ap] = t.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/) || []
    return h ? { time: `${Number(h)}${m === '00' ? '' : `:${m}`}`, ap } : { time: t, ap: '' }
  })
  if (parts.length !== 2) return slot
  const [a, b] = parts
  return a.ap === b.ap ? `${a.time} – ${b.time} ${b.ap}` : `${a.time} ${a.ap} – ${b.time} ${b.ap}`
}

/**
 * Everything is baked to order: there is no stock. An order is baked the day
 * before its delivery date, so the earliest date is tomorrow (shop time) when
 * ordered before `cutoffHour`, the day after otherwise. The customer can pick
 * any later day up to `daysAhead`.
 */
export const ORDERING = {
  timeZone: 'America/New_York',
  // Orders placed from this hour on (24h clock, shop time) can't be ready tomorrow.
  cutoffHour: 22,
  daysAhead: 60,
  // A sanity cap per flavor, not stock. Larger orders go through WhatsApp.
  maxPerItem: 48,
}

/** Today's date in the shop's time zone, as YYYY-MM-DD. */
export const shopToday = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: ORDERING.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)

/** YYYY-MM-DD plus n calendar days. */
export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/** Current hour (0–23) in the shop's time zone. */
export const shopHour = (now = new Date()) =>
  Number(new Intl.DateTimeFormat('en-US', { timeZone: ORDERING.timeZone, hour: 'numeric', hourCycle: 'h23' }).format(now))

/** True once today's cutoff has passed and tomorrow is no longer bookable. */
export const pastCutoff = (now = new Date()) => shopHour(now) >= ORDERING.cutoffHour

/** '10 PM' for the cutoff, for customer-facing copy. */
export const cutoffLabel = () => {
  const h = ORDERING.cutoffHour
  return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`
}

export const earliestDeliveryDate = (now = new Date()) => addDays(shopToday(now), pastCutoff(now) ? 2 : 1)
export const latestDeliveryDate = () => addDays(shopToday(), ORDERING.daysAhead)
