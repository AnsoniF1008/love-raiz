/**
 * Data layer. One API, two backends:
 *  - Firebase (Firestore / Auth, plus Functions + Storage when online payments are on)
 *  - In-memory demo store when no credentials are configured
 *
 * Two ways to take an order, picked by PAY_ONLINE (see lib/business.js):
 *  - pay on delivery (default, free Firebase plan): the storefront writes the
 *    order straight to Firestore and firestore.rules validates it
 *  - Stripe: the `createOrderAndPayment` Cloud Function writes it
 */
import { DEMO, ensureFirebase, db, auth, storage, functions } from './firebase'
import { feeForMiles, quoteDelivery, quoteForPlace, deliveryMessage, DELIVERY_SLOTS, ORDERING, earliestDeliveryDate, latestDeliveryDate } from '../../functions/delivery.js'
import { MOCK_PRODUCTS, MOCK_BOXES, MOCK_ORDERS } from './mockData'
import { PAY_ONLINE, PAYMENT_METHODS } from './business'

// ---------- Demo backend ----------
const demo = {
  products: MOCK_PRODUCTS.map((p) => ({ ...p })),
  boxes: MOCK_BOXES.map((b) => ({ ...b })),
  orders: MOCK_ORDERS.map((o) => ({ ...o })),
  user: null,
  listeners: { products: new Set(), boxes: new Set(), orders: new Set(), auth: new Set() },
  seq: 1043,
}
const emit = (key) => demo.listeners[key].forEach((fn) => fn())
const sub = (key, fn) => { demo.listeners[key].add(fn); fn(); return () => demo.listeners[key].delete(fn) }

// ---------- Firebase helpers ----------
// Each one initialises the SDK before resolving, so `db`/`auth`/`storage`/
// `functions` are always populated by the time the caller uses them.
const fs = async () => { await ensureFirebase(); return import('firebase/firestore') }
const fa = async () => { await ensureFirebase(); return import('firebase/auth') }
const fst = async () => { await ensureFirebase(); return import('firebase/storage') }
const ffn = async () => { await ensureFirebase(); return import('firebase/functions') }

/**
 * Starts a Firestore listener once the SDK has loaded. `start(sdk, onError)`
 * returns the listener's unsubscribe. Unsubscribing before the SDK arrives is
 * safe, and a failed listener (rules, network) reports `fallback` instead of
 * leaving the screen on its loading state forever.
 */
function listen(start, cb, fallback) {
  let unsub = null
  let cancelled = false
  const fail = (err) => { console.error('Firestore listener failed', err); if (!cancelled) cb(fallback) }
  fs().then((sdk) => { if (!cancelled) unsub = start(sdk, fail) }).catch(fail)
  return () => { cancelled = true; unsub?.() }
}

const withId = (d) => ({ id: d.id, ...d.data() })
const invalid = (message) => Object.assign(new Error(message), { code: 'invalid-argument' })

// ===================== Products =====================
export function subscribeProducts(cb, { includeInactive = false } = {}) {
  if (DEMO) return sub('products', () => cb(demo.products.filter((p) => includeInactive || p.is_active)))
  return listen(({ collection, query, where, orderBy, onSnapshot }, fail) => {
    const q = includeInactive
      ? query(collection(db, 'products'), orderBy('created_at', 'desc'))
      : query(collection(db, 'products'), where('is_active', '==', true), orderBy('created_at', 'desc'))
    return onSnapshot(q, (snap) => cb(snap.docs.map(withId)), fail)
  }, cb, [])
}

export async function upsertProduct(product) {
  if (DEMO) {
    if (product.id) { demo.products = demo.products.map((p) => (p.id === product.id ? { ...p, ...product } : p)) }
    else demo.products.unshift({ ...product, id: 'p' + Date.now(), created_at: new Date() })
    emit('products'); return
  }
  const { doc, collection, setDoc, addDoc, serverTimestamp } = await fs()
  if (product.id) { const { id, ...data } = product; await setDoc(doc(db, 'products', id), data, { merge: true }) }
  else await addDoc(collection(db, 'products'), { ...product, created_at: serverTimestamp() })
}

export async function deleteProduct(id) {
  if (DEMO) { demo.products = demo.products.filter((p) => p.id !== id); emit('products'); return }
  const { doc, deleteDoc } = await fs()
  await deleteDoc(doc(db, 'products', id))
}

/** Writes the starter menu and the two box sizes. Used once, from an empty Inventory. */
export async function seedStarterCatalog() {
  if (DEMO) return
  const { doc, writeBatch, Timestamp } = await fs()
  const batch = writeBatch(db)
  const now = Date.now()
  // One second apart so the menu keeps this order (it sorts by created_at).
  MOCK_PRODUCTS.forEach(({ id, ...p }, i) => batch.set(doc(db, 'products', id), { ...p, created_at: Timestamp.fromMillis(now - i * 1000) }))
  MOCK_BOXES.forEach(({ id, ...b }) => batch.set(doc(db, 'boxes', id), b))
  await batch.commit()
}

// Product photos. Cloud Storage needs the paid Firebase plan, so by default the
// photo is shrunk in the browser and saved inside the product itself. Set
// VITE_USE_STORAGE=1 (and deploy storage.rules) to upload full files instead.
const USE_STORAGE = import.meta.env.VITE_USE_STORAGE === '1'
const MAX_INLINE_IMAGE = 350_000 // characters of data URL; a product doc tops out at 1 MB

async function inlineImage(file) {
  const bmp = await createImageBitmap(file)
  const draw = (max, type, quality, matte) => {
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas')
    c.width = Math.max(1, Math.round(bmp.width * scale))
    c.height = Math.max(1, Math.round(bmp.height * scale))
    const ctx = c.getContext('2d')
    if (matte) { ctx.fillStyle = matte; ctx.fillRect(0, 0, c.width, c.height) }
    ctx.drawImage(bmp, 0, 0, c.width, c.height)
    return c.toDataURL(type, quality)
  }
  // WebP keeps a cut-out's transparency. Browsers that can't encode it hand
  // back a PNG, which is tried smaller before falling back to a JPEG on cream.
  for (const max of [720, 560, 420]) {
    const url = draw(max, 'image/webp', 0.82)
    if (url.length <= MAX_INLINE_IMAGE) return url
  }
  return draw(560, 'image/jpeg', 0.8, '#FFFCF7')
}

export async function uploadProductImage(file) {
  if (DEMO) return URL.createObjectURL(file)
  if (!USE_STORAGE) return inlineImage(file)
  const { ref, uploadBytes, getDownloadURL } = await fst()
  const r = ref(storage, `products/${Date.now()}-${file.name.replace(/\s+/g, '-')}`)
  await uploadBytes(r, file, { contentType: file.type })
  return getDownloadURL(r)
}

// ===================== Boxes =====================
export function subscribeBoxes(cb) {
  if (DEMO) return sub('boxes', () => cb(demo.boxes))
  return listen(({ collection, query, orderBy, onSnapshot }, fail) =>
    onSnapshot(query(collection(db, 'boxes'), orderBy('capacity')), (snap) => cb(snap.docs.map(withId)), fail), cb, [])
}

// ===================== Orders =====================
const withDate = (d) => ({ ...withId(d), created_at: d.data().created_at?.toDate?.() || new Date() })

export function subscribeAllOrders(cb) {
  if (DEMO) return sub('orders', () => cb([...demo.orders].sort((a, b) => b.created_at - a.created_at)))
  return listen(({ collection, query, orderBy, limit, onSnapshot }, fail) =>
    onSnapshot(query(collection(db, 'orders'), orderBy('created_at', 'desc'), limit(200)), (snap) => cb(snap.docs.map(withDate)), fail), cb, [])
}

export function subscribeOrder(orderId, cb) {
  if (DEMO) return sub('orders', () => cb(demo.orders.find((o) => o.id === orderId) || null))
  return listen(({ doc, onSnapshot }, fail) =>
    onSnapshot(doc(db, 'orders', orderId), (d) => cb(d.exists() ? withId(d) : null), fail), cb, null)
}

// Every order carries the uid that placed it (guest or Google), so a guest who
// later links a Google account keeps their history.
export function subscribeMyOrders(uid, cb) {
  if (DEMO) return sub('orders', () => cb(demo.orders.filter((o) => o.user_id === uid || o.auth_uid === uid)))
  return listen(({ collection, query, where, orderBy, onSnapshot }, fail) =>
    onSnapshot(query(collection(db, 'orders'), where('auth_uid', '==', uid), orderBy('created_at', 'desc')), (snap) => cb(snap.docs.map(withId)), fail), cb, [])
}

async function patchOrder(orderId, patch) {
  if (DEMO) { demo.orders = demo.orders.map((o) => (o.id === orderId ? { ...o, ...patch } : o)); emit('orders'); return }
  const { doc, updateDoc, serverTimestamp } = await fs()
  await updateDoc(doc(db, 'orders', orderId), { ...patch, updated_at: serverTimestamp() })
}

export const updateOrderStatus = (orderId, order_status) => patchOrder(orderId, { order_status })
export const cancelOrder = (orderId) => patchOrder(orderId, { order_status: 'cancelled' })
/** Pay-on-delivery orders: the kitchen records the cash or Zelle payment by hand. */
export const setOrderPaid = (orderId, paid) => patchOrder(orderId, { payment_status: paid ? 'paid' : 'unpaid' })

// ===================== Delivery fee =====================
/** US Census geocoder over JSONP: it sends no CORS headers, so fetch() can't read it from a browser. */
function geocodeJsonp(address) {
  return new Promise((resolve, reject) => {
    const name = `lrGeo${Date.now()}${Math.round(Math.random() * 1e6)}`
    const script = document.createElement('script')
    const done = (fn, value) => { clearTimeout(timer); delete window[name]; script.remove(); fn(value) }
    const timer = setTimeout(() => done(reject, new Error('Geocoder timed out')), 10_000)
    window[name] = (data) => {
      const match = data?.result?.addressMatches?.[0]
      done(resolve, match ? { lat: match.coordinates.y, lng: match.coordinates.x, matched: match.matchedAddress } : null)
    }
    script.onerror = () => done(reject, new Error('Geocoder unreachable'))
    script.src = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?${new URLSearchParams({ address, benchmark: 'Public_AR_Current', format: 'jsonp', callback: name })}`
    document.head.appendChild(script)
  })
}

/**
 * Delivery fee for an address.
 * Returns { ok: true, miles, fee, matched } or { ok: false, reason, message }.
 */
export async function quoteDeliveryFee(address) {
  const explain = (q) => (q.ok ? q : { ...q, message: deliveryMessage(q) })
  if (DEMO) {
    // Under `npm run dev` the Vite proxy reaches the real geocoder; the
    // single-file demo opened from disk has no proxy, so it falls back to a
    // stable made-up distance per address.
    if (import.meta.env.DEV) return explain(await quoteDelivery(address, '/census-geocoder'))
    await new Promise((r) => setTimeout(r, 500))
    if (address.trim().length < 10) return explain({ ok: false, reason: 'not-found' })
    const miles = Math.round((([...address].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % 240) / 10 + 1) * 10) / 10
    const q = feeForMiles(miles)
    return explain(q ? { ok: true, ...q, matched: address.toUpperCase() } : { ok: false, reason: 'too-far', miles })
  }
  if (PAY_ONLINE) {
    const { httpsCallable } = await ffn()
    const res = await httpsCallable(functions, 'quoteDeliveryFee')({ address })
    return res.data
  }
  return explain(quoteForPlace(await geocodeJsonp(address)))
}

// ===================== Placing an order =====================
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // no 0/O, 1/I/L
const orderCode = () => 'LR-' + Array.from(crypto.getRandomValues(new Uint8Array(6)), (n) => CODE_ALPHABET[n % CODE_ALPHABET.length]).join('')
const round2 = (n) => Math.round(n * 100) / 100

/** Pay on delivery: validates the order and writes it to Firestore. firestore.rules checks it again. */
async function placeOrderDirect(p) {
  const { doc, setDoc, serverTimestamp } = await fs()
  const user = auth.currentUser
  if (!user) throw Object.assign(new Error('Please reload the page and try again.'), { code: 'unauthenticated' })

  const c = p.customer_info || {}
  const name = (c.name || '').trim(), email = (c.email || '').trim().toLowerCase(), phone = (c.phone || '').trim()
  const address = p.delivery_type === 'Delivery' ? (c.address || '').trim().slice(0, 200) : ''
  if (!Array.isArray(p.items) || p.items.length === 0) throw invalid('Your bag is empty.')
  if (p.items.length > 30) throw invalid('That is a lot of different flavors. Message us on WhatsApp for an order this size.')
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || phone.replace(/\D/g, '').length < 7) throw invalid('Add your name, a valid email and a phone number.')
  if (!['Delivery', 'Pickup'].includes(p.delivery_type)) throw invalid('Choose delivery or pickup.')
  if (p.delivery_type === 'Delivery' && address.length < 6) throw invalid('Add a delivery address, or switch to pickup.')
  if (!DELIVERY_SLOTS.includes(p.delivery_slot)) throw invalid('Pick a delivery window.')
  if (!(p.delivery_date >= earliestDeliveryDate())) throw invalid("That date just closed. Pick a later date and we'll bake it the day before.")
  if (p.delivery_date > latestDeliveryDate()) throw invalid(`Pick a date within the next ${ORDERING.daysAhead} days.`)
  if (!PAYMENT_METHODS.some((m) => m.key === p.payment_method)) throw invalid('Choose how you want to pay.')

  const items = p.items.map((i) => ({ product_id: String(i.product_id), name: String(i.name), quantity: Number(i.quantity), unit_price: Number(i.unit_price) }))
  if (items.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > ORDERING.maxPerItem || !(i.unit_price >= 0))) throw invalid('Something in your bag looks off. Remove it and add it again.')
  const box_discount = Math.min(0, Number(p.box_discount) || 0)
  const delivery_fee = p.delivery_type === 'Delivery' ? Number(p.delivery_fee) || 0 : 0
  if (p.delivery_type === 'Delivery' && delivery_fee <= 0) throw invalid('Wait a moment while we price delivery to your address.')
  const total = round2(Math.max(0, items.reduce((s, i) => s + i.quantity * i.unit_price, 0) + box_discount) + delivery_fee)
  if (total <= 0) throw invalid('Your bag is empty.')

  const order = {
    auth_uid: user.uid,
    user_id: user.isAnonymous ? null : user.uid,
    items, box_id: p.box_id || null, box_discount,
    delivery_fee, delivery_miles: p.delivery_type === 'Delivery' && typeof p.delivery_miles === 'number' ? p.delivery_miles : null,
    delivery_type: p.delivery_type, delivery_date: p.delivery_date, delivery_slot: p.delivery_slot,
    total_amount: total,
    payment_method: p.payment_method, payment_status: 'unpaid', order_status: 'received',
    customer_info: { name: name.slice(0, 120), email: email.slice(0, 200), phone: phone.slice(0, 40), address, notes: (c.notes || '').trim().slice(0, 500) },
    created_at: serverTimestamp(), updated_at: serverTimestamp(),
  }
  // The code is the document id. Rules refuse to overwrite an existing order, so
  // the rare collision comes back as permission-denied: try a fresh code.
  for (let attempt = 0; ; attempt++) {
    const id = orderCode()
    try { await setDoc(doc(db, 'orders', id), order); return { orderId: id, total } }
    catch (err) { if (attempt >= 2 || err?.code !== 'permission-denied') throw err }
  }
}

/**
 * Places the order. Returns { orderId, total } and, with Stripe on,
 * { clientSecret } for the Payment Element on the order page.
 */
export async function placeOrder(payload) {
  if (DEMO) {
    await new Promise((r) => setTimeout(r, 900))
    const total = payload.items.reduce((s, i) => s + i.quantity * i.unit_price, 0) + (payload.box_discount || 0) + (payload.delivery_fee || 0)
    const id = 'LR-' + demo.seq++
    demo.orders.unshift({ id, ...payload, total_amount: round2(total), payment_status: PAY_ONLINE ? 'pending' : 'unpaid', order_status: 'received', created_at: new Date() })
    emit('orders')
    // Simulate the Stripe webhook flipping the order to paid.
    if (PAY_ONLINE) setTimeout(() => { demo.orders = demo.orders.map((o) => (o.id === id ? { ...o, payment_status: 'paid' } : o)); emit('orders') }, 2500)
    return { orderId: id, clientSecret: PAY_ONLINE ? 'demo' : null, total }
  }
  if (!PAY_ONLINE) return placeOrderDirect(payload)
  const { httpsCallable } = await ffn()
  const res = await httpsCallable(functions, 'createOrderAndPayment')(payload)
  return res.data
}

// ===================== Auth =====================
// Admins are decided by firestore.rules (a custom claim, or a verified email on
// its list). Only an admin may read admin/access, so trying it is the check;
// the list of admin emails never ships to the browser.
async function canReadAdmin() {
  try {
    const { doc, getDoc } = await fs()
    await getDoc(doc(db, 'admin', 'access'))
    return true
  } catch { return false }
}

export function onAuth(cb) {
  if (DEMO) return sub('auth', () => cb(demo.user))
  let unsub = null
  let cancelled = false
  let seq = 0
  // Fires on sign-in, sign-out and when a guest links a Google account.
  fa().then(({ onIdTokenChanged }) => {
    if (cancelled) return
    unsub = onIdTokenChanged(auth, async (u) => {
      const mine = ++seq
      if (!u) return cb(null)
      let isAdmin = false
      if (!u.isAnonymous) {
        try { isAdmin = !!(await u.getIdTokenResult()).claims.admin || await canReadAdmin() } catch { /* stays false */ }
      }
      if (cancelled || mine !== seq) return
      const google = u.providerData?.[0]
      cb({ uid: u.uid, isAnonymous: u.isAnonymous, name: u.displayName || google?.displayName || null, email: u.email || google?.email || null, photo: u.photoURL || google?.photoURL || null, isAdmin })
    })
  }).catch((err) => { console.error('Auth failed to load', err); if (!cancelled) cb(null) })
  return () => { cancelled = true; unsub?.() }
}

export async function signInGoogle() {
  if (DEMO) { demo.user = { uid: 'u2', name: 'Devon Ali', email: 'devon@example.com', isAnonymous: false, isAdmin: true }; emit('auth'); return }
  const { GoogleAuthProvider, signInWithPopup, linkWithPopup, signInWithCredential } = await fa()
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  const guest = auth.currentUser?.isAnonymous ? auth.currentUser : null
  if (!guest) { await signInWithPopup(auth, provider); return }
  // A guest who signs in keeps the same account, so the order they just placed stays theirs.
  try {
    await linkWithPopup(guest, provider)
    await guest.getIdToken(true)
  } catch (err) {
    // That Google account already exists here: switch to it.
    const credential = err?.code === 'auth/credential-already-in-use' ? GoogleAuthProvider.credentialFromError(err) : null
    if (!credential) throw err
    await signInWithCredential(auth, credential)
  }
}

export async function signInGuest() {
  if (DEMO) { demo.user = { uid: 'guest-' + Date.now(), isAnonymous: true, isAdmin: false }; emit('auth'); return demo.user }
  const { signInAnonymously } = await fa()
  const cred = await signInAnonymously(auth)
  return cred.user
}

export async function signOutUser() {
  if (DEMO) { demo.user = null; emit('auth'); return }
  const { signOut } = await fa()
  await signOut(auth)
}
