/**
 * Data layer. One API, two backends:
 *  - Firebase (Firestore / Auth / Storage / Functions) in production
 *  - In-memory demo store when no credentials are configured
 */
import { DEMO, ensureFirebase, db, auth, storage, functions } from './firebase'
import { feeForMiles, maxDeliveryMiles, quoteDelivery, deliveryMessage } from '../../functions/delivery.js'
import { MOCK_PRODUCTS, MOCK_BOXES, MOCK_ORDERS } from './mockData'

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

// ===================== Products =====================
export function subscribeProducts(cb, { includeInactive = false } = {}) {
  if (DEMO) return sub('products', () => cb(demo.products.filter((p) => includeInactive || p.is_active)))
  let unsub = () => {}
  fs().then(({ collection, query, where, orderBy, onSnapshot }) => {
    const q = includeInactive
      ? query(collection(db, 'products'), orderBy('created_at', 'desc'))
      : query(collection(db, 'products'), where('is_active', '==', true), orderBy('created_at', 'desc'))
    unsub = onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
  })
  return () => unsub()
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

export async function uploadProductImage(file) {
  if (DEMO) return URL.createObjectURL(file)
  const { ref, uploadBytes, getDownloadURL } = await fst()
  const r = ref(storage, `products/${Date.now()}-${file.name.replace(/\s+/g, '-')}`)
  await uploadBytes(r, file, { contentType: file.type })
  return getDownloadURL(r)
}

// ===================== Boxes =====================
export function subscribeBoxes(cb) {
  if (DEMO) return sub('boxes', () => cb(demo.boxes))
  let unsub = () => {}
  fs().then(({ collection, query, orderBy, onSnapshot }) => {
    unsub = onSnapshot(query(collection(db, 'boxes'), orderBy('capacity')), (snap) =>
      cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )
  })
  return () => unsub()
}

// ===================== Orders =====================
export function subscribeAllOrders(cb) {
  if (DEMO) return sub('orders', () => cb([...demo.orders].sort((a, b) => b.created_at - a.created_at)))
  let unsub = () => {}
  fs().then(({ collection, query, orderBy, limit, onSnapshot }) => {
    unsub = onSnapshot(query(collection(db, 'orders'), orderBy('created_at', 'desc'), limit(200)), (snap) =>
      cb(snap.docs.map((d) => ({ id: d.id, ...d.data(), created_at: d.data().created_at?.toDate?.() || new Date() })))
    )
  })
  return () => unsub()
}

export function subscribeOrder(orderId, cb) {
  if (DEMO) return sub('orders', () => cb(demo.orders.find((o) => o.id === orderId) || null))
  let unsub = () => {}
  fs().then(({ doc, onSnapshot }) => {
    unsub = onSnapshot(doc(db, 'orders', orderId), (d) => cb(d.exists() ? { id: d.id, ...d.data() } : null))
  })
  return () => unsub()
}

export function subscribeMyOrders(uid, cb) {
  if (DEMO) return sub('orders', () => cb(demo.orders.filter((o) => o.user_id === uid)))
  let unsub = () => {}
  fs().then(({ collection, query, where, orderBy, onSnapshot }) => {
    unsub = onSnapshot(query(collection(db, 'orders'), where('user_id', '==', uid), orderBy('created_at', 'desc')), (snap) =>
      cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    )
  })
  return () => unsub()
}

export async function updateOrderStatus(orderId, order_status) {
  if (DEMO) { demo.orders = demo.orders.map((o) => (o.id === orderId ? { ...o, order_status } : o)); emit('orders'); return }
  const { doc, updateDoc, serverTimestamp } = await fs()
  await updateDoc(doc(db, 'orders', orderId), { order_status, updated_at: serverTimestamp() })
}

/**
 * Delivery fee for an address, from the `quoteDeliveryFee` Cloud Function.
 * Returns { ok: true, miles, fee, matched } or { ok: false, reason, message }.
 */
export async function quoteDeliveryFee(address) {
  if (DEMO) {
    // No Cloud Functions in the demo. Under `npm run dev` the Vite proxy reaches
    // the real geocoder; the single-file demo opened from disk has no proxy, so
    // it falls back to a stable made-up distance per address.
    if (import.meta.env.DEV) {
      const q = await quoteDelivery(address, '/census-geocoder')
      return q.ok ? q : { ...q, message: deliveryMessage(q) }
    }
    await new Promise((r) => setTimeout(r, 500))
    if (address.trim().length < 10) return { ok: false, reason: 'not-found', message: deliveryMessage({ reason: 'not-found' }) }
    const miles = Math.round((([...address].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % 240) / 10 + 1) * 10) / 10
    const q = feeForMiles(miles)
    return q ? { ok: true, ...q, matched: address.toUpperCase() } : { ok: false, reason: 'too-far', miles, message: deliveryMessage({ reason: 'too-far', miles }) }
  }
  const { httpsCallable } = await ffn()
  const res = await httpsCallable(functions, 'quoteDeliveryFee')({ address })
  return res.data
}

/**
 * Calls the `createOrderAndPayment` Cloud Function.
 * Server validates the order, recomputes the total, creates the Stripe PaymentIntent
 * and writes the order with payment_status "pending".
 * Returns { orderId, clientSecret, total }.
 */
export async function createOrderAndPayment(payload) {
  if (DEMO) {
    await new Promise((r) => setTimeout(r, 900))
    const total = payload.items.reduce((s, i) => s + i.quantity * i.unit_price, 0) + (payload.box_discount || 0) + (payload.delivery_fee || 0)
    const id = 'LR-' + demo.seq++
    demo.orders.unshift({ id, ...payload, total_amount: Math.round(total * 100) / 100, payment_status: 'pending', order_status: 'received', created_at: new Date() })
    emit('orders')
    // Simulate the Stripe webhook flipping the order to paid.
    setTimeout(() => { demo.orders = demo.orders.map((o) => (o.id === id ? { ...o, payment_status: 'paid' } : o)); emit('orders') }, 2500)
    return { orderId: id, clientSecret: 'demo', total }
  }
  const { httpsCallable } = await ffn()
  const res = await httpsCallable(functions, 'createOrderAndPayment')(payload)
  return res.data
}

// ===================== Auth =====================
export function onAuth(cb) {
  if (DEMO) return sub('auth', () => cb(demo.user))
  let unsub = () => {}
  fa().then(({ onAuthStateChanged }) => {
    unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return cb(null)
      const token = await u.getIdTokenResult()
      cb({ uid: u.uid, isAnonymous: u.isAnonymous, name: u.displayName, email: u.email, photo: u.photoURL, isAdmin: !!token.claims.admin })
    })
  })
  return () => unsub()
}

export async function signInGoogle() {
  if (DEMO) { demo.user = { uid: 'u2', name: 'Devon Ali', email: 'devon@example.com', isAnonymous: false, isAdmin: true }; emit('auth'); return }
  const { GoogleAuthProvider, signInWithPopup } = await fa()
  await signInWithPopup(auth, new GoogleAuthProvider())
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
