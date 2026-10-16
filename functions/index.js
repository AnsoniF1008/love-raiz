/**
 * Love Raíz — Cloud Functions (Node 20, ESM, Firebase Functions v2)
 *
 *  quoteDeliveryFee         callable  → delivery fee for an address, by distance (see delivery.js)
 *  createOrderAndPayment    callable  → validates the order, computes total server-side,
 *                                       creates Stripe PaymentIntent, writes order (pending)
 *  stripeWebhook            https     → marks order paid/failed,
 *                                       sends email + builds WhatsApp link
 *  onOrderStatusChange      trigger   → emails the customer on each status change
 *  releaseAbandonedOrders   schedule  → closes checkouts that were never paid
 *                                       (no webhook fires for those)
 *
 * Everything is baked to order, so there is no stock to check or reserve.
 */
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https'
import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { setGlobalOptions } from 'firebase-functions/v2/options'
import { defineSecret, defineString } from 'firebase-functions/params'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'
import { quoteDelivery, deliveryMessage, DELIVERY_SLOTS, ORDERING, earliestDeliveryDate, latestDeliveryDate, cutoffLabel } from './delivery.js'

initializeApp()
const db = getFirestore()

// A bakery does not need to scale to hundreds of containers. This is the ceiling
// that keeps a traffic spike or a runaway loop from turning into a large bill.
setGlobalOptions({ region: 'us-central1', maxInstances: 10, memory: '256MiB' })

const STRIPE_SECRET = defineSecret('STRIPE_SECRET_KEY')
const STRIPE_WEBHOOK = defineSecret('STRIPE_WEBHOOK_SECRET')
const SMTP_URL = defineSecret('SMTP_URL') // e.g. smtps://user:pass@smtp.resend.com:465
const FROM_EMAIL = defineString('FROM_EMAIL', { default: 'Love Raíz <orders@loveraiz.com>' })
// Where a customer's reply to an order email lands.
const REPLY_TO = defineString('REPLY_TO', { default: 'joseline03garcia@gmail.com' })
const WHATSAPP_NUMBER = defineString('WHATSAPP_NUMBER', { default: '13468339153' })

const money = (n) => `$${n.toFixed(2)}`
const cents = (n) => Math.round(n * 100)
const stripeClient = () => new Stripe(STRIPE_SECRET.value(), { apiVersion: '2024-09-30.acacia' })

// Set ENFORCE_APP_CHECK=1 in functions/.env once VITE_RECAPTCHA_SITE_KEY is
// configured on the client, otherwise every call would be rejected.
const ENFORCE_APP_CHECK = process.env.ENFORCE_APP_CHECK === '1'

/** How long a checkout may stay unpaid before it is closed. */
const UNPAID_MINUTES = 30

// ---------------------------------------------------------------- delivery fee
async function deliveryQuote(address) {
  try { return await quoteDelivery(address) }
  catch (err) {
    console.error('geocoder failed', err)
    throw new HttpsError('unavailable', "We couldn't check the delivery distance right now. Try again in a moment, or choose pickup.")
  }
}

// Called by the checkout while the customer types, so the fee is visible before paying.
export const quoteDeliveryFee = onCall({ region: 'us-central1', cors: true, enforceAppCheck: ENFORCE_APP_CHECK }, async (req) => {
  const address = String(req.data?.address || '').trim().slice(0, 200)
  if (address.length < 6) throw new HttpsError('invalid-argument', 'Add a street address.')
  const q = await deliveryQuote(address)
  return q.ok ? q : { ...q, message: deliveryMessage(q) }
})

// ---------------------------------------------------------------- createOrderAndPayment
export const createOrderAndPayment = onCall({ secrets: [STRIPE_SECRET], region: 'us-central1', cors: true, enforceAppCheck: ENFORCE_APP_CHECK }, async (req) => {
  // Anonymous sign-in counts: the client signs in as a guest before checking out.
  // Without this, anyone could script the callable and flood the kitchen with fake orders.
  const uid = req.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'Please reload the page and try again.')
  const d = req.data || {}

  // ---- Input validation ----
  if (!Array.isArray(d.items) || d.items.length === 0) throw new HttpsError('invalid-argument', 'Your bag is empty.')
  if (d.items.length > 30) throw new HttpsError('invalid-argument', 'Too many line items.')
  if (!['Delivery', 'Pickup'].includes(d.delivery_type)) throw new HttpsError('invalid-argument', 'Choose delivery or pickup.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.delivery_date || '')) throw new HttpsError('invalid-argument', 'Pick a delivery date.')
  if (!DELIVERY_SLOTS.includes(d.delivery_slot)) throw new HttpsError('invalid-argument', 'Pick a delivery window.')
  const c = d.customer_info || {}
  if (!c.name?.trim() || !/^\S+@\S+\.\S+$/.test(c.email || '') || !c.phone?.trim()) throw new HttpsError('invalid-argument', 'Name, email and phone are required.')
  if (d.delivery_type === 'Delivery' && !c.address?.trim()) throw new HttpsError('invalid-argument', 'A delivery address is required.')
  // Baked the day before delivery: tomorrow (Virginia time) is the earliest date,
  // and only until the nightly cutoff.
  if (d.delivery_date < earliestDeliveryDate()) throw new HttpsError('invalid-argument', `Orders for tomorrow close at ${cutoffLabel()}. Pick a later date and we'll bake it the day before.`)
  if (d.delivery_date > latestDeliveryDate()) throw new HttpsError('invalid-argument', `Pick a date within the next ${ORDERING.daysAhead} days.`)

  // ---- Delivery fee, from the distance the server measures (never from the client) ----
  let delivery = { fee: 0, miles: null }
  if (d.delivery_type === 'Delivery') {
    const q = await deliveryQuote(c.address.trim().slice(0, 200))
    if (!q.ok) throw new HttpsError('failed-precondition', deliveryMessage(q))
    delivery = { fee: q.fee, miles: q.miles }
  }

  // ---- Server-side total from the live menu ----
  const orderRef = db.collection('orders').doc()
  const { total, items, discount } = await (async () => {
    const refs = d.items.map((i) => db.collection('products').doc(String(i.product_id)))
    const snaps = await db.getAll(...refs)
    let subtotal = 0
    const items = snaps.map((s, i) => {
      const qty = Number(d.items[i].quantity)
      if (!s.exists || !s.data().is_active) throw new HttpsError('failed-precondition', `"${d.items[i].name || 'An item'}" is no longer on the menu.`)
      if (!Number.isInteger(qty) || qty < 1) throw new HttpsError('invalid-argument', 'Invalid quantity.')
      if (qty > ORDERING.maxPerItem) throw new HttpsError('invalid-argument', `For more than ${ORDERING.maxPerItem} of one flavor, message us on WhatsApp.`)
      const p = s.data()
      subtotal += p.price * qty
      return { product_id: s.id, name: p.name, quantity: qty, unit_price: p.price }
    })
    // Box discount is looked up server-side, never trusted from the client.
    let discount = 0
    if (d.box_id) {
      const box = await db.collection('boxes').doc(String(d.box_id)).get()
      const count = items.reduce((a, i) => a + i.quantity, 0)
      if (box.exists && count === box.data().capacity) discount = Number(box.data().base_price) || 0
    }
    const total = Math.max(0, Math.round((subtotal + discount + delivery.fee) * 100) / 100)
    return { total, items, discount }
  })()

  // ---- Stripe PaymentIntent ----
  const intent = await stripeClient().paymentIntents.create({
    amount: cents(total), currency: 'usd', receipt_email: c.email,
    automatic_payment_methods: { enabled: true },
    metadata: { orderId: orderRef.id },
    description: `Love Raíz order ${orderRef.id}`,
  })

  await orderRef.set({
    user_id: uid && !req.auth?.token?.firebase?.sign_in_provider?.includes('anonymous') ? uid : null,
    auth_uid: uid,
    items, box_id: d.box_id || null, box_discount: discount,
    delivery_fee: delivery.fee, delivery_miles: delivery.miles,
    delivery_type: d.delivery_type, delivery_date: d.delivery_date, delivery_slot: d.delivery_slot,
    total_amount: total,
    payment_status: 'pending', order_status: 'received',
    payment_intent_id: intent.id,
    customer_info: { name: c.name.trim(), email: c.email.trim().toLowerCase(), phone: c.phone.trim(), address: (c.address || '').trim(), notes: (c.notes || '').slice(0, 500) },
    created_at: FieldValue.serverTimestamp(), updated_at: FieldValue.serverTimestamp(),
  })

  return { orderId: orderRef.id, clientSecret: intent.client_secret, total }
})

// ---------------------------------------------------------------- stripeWebhook
export const stripeWebhook = onRequest({ secrets: [STRIPE_SECRET, STRIPE_WEBHOOK, SMTP_URL], region: 'us-central1' }, async (req, res) => {
  let event
  try { event = stripeClient().webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], STRIPE_WEBHOOK.value()) }
  catch (err) { return res.status(400).send(`Webhook signature failed: ${err.message}`) }

  const pi = event.data.object
  const orderId = pi.metadata?.orderId
  if (!orderId) return res.status(200).send('ignored')
  const ref = db.collection('orders').doc(orderId)

  if (event.type === 'payment_intent.succeeded') {
    // Transactional so a retried webhook (Stripe delivers at least once) sends
    // one confirmation, and so it cannot race releaseAbandonedOrders.
    const outcome = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref)
      if (!snap.exists) return 'missing'
      const order = snap.data()
      if (order.payment_status === 'paid') return 'duplicate'
      if (pi.amount !== cents(order.total_amount)) return 'amount mismatch'
      tx.update(ref, { payment_status: 'paid', paid_at: FieldValue.serverTimestamp(), updated_at: FieldValue.serverTimestamp() })
      return 'paid'
    })
    if (outcome === 'paid') {
      const snap = await ref.get()
      await sendEmail({ id: orderId, ...snap.data() }, 'confirmed').catch((e) => console.error('email failed', e))
    } else if (outcome !== 'duplicate') {
      console.error('webhook could not mark order paid:', outcome, orderId)
    }
  }

  if (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
    await closeUnpaid(ref, 'failed')
  }
  res.status(200).send('ok')
})

// ---------------------------------------------------------------- releaseAbandonedOrders
/**
 * Stripe never sends an event for a checkout the customer simply walked away
 * from. This cancels the PaymentIntent and marks the order expired, so the
 * kitchen board only shows orders that were actually paid for.
 */
// maxInstances 1 keeps two sweeps from overlapping; the timeout covers up to 100
// Stripe round trips in one pass.
export const releaseAbandonedOrders = onSchedule({ schedule: 'every 15 minutes', secrets: [STRIPE_SECRET], maxInstances: 1, timeoutSeconds: 300 }, async () => {
  const cutoff = new Date(Date.now() - UNPAID_MINUTES * 60_000)
  const stale = await db.collection('orders')
    .where('payment_status', '==', 'pending')
    .where('created_at', '<', cutoff)
    .limit(100)
    .get()
  if (stale.empty) return

  const stripe = stripeClient()
  for (const doc of stale.docs) {
    try {
      const { payment_intent_id } = doc.data()
      if (payment_intent_id) {
        const pi = await stripe.paymentIntents.retrieve(payment_intent_id)
        // Money is in flight or already taken; leave it for the webhook.
        if (['succeeded', 'processing', 'requires_capture'].includes(pi.status)) continue
        if (pi.status !== 'canceled') await stripe.paymentIntents.cancel(payment_intent_id, { cancellation_reason: 'abandoned' })
      }
      if (await closeUnpaid(doc.ref, 'expired')) console.log('closed abandoned order', doc.id)
    } catch (err) {
      console.error('sweep failed for', doc.id, err)
    }
  }
})

// ---------------------------------------------------------------- onOrderStatusChange
export const onOrderStatusChange = onDocumentUpdated({ document: 'orders/{orderId}', secrets: [SMTP_URL], region: 'us-central1' }, async (event) => {
  const before = event.data.before.data(), after = event.data.after.data()
  if (before.order_status === after.order_status || after.payment_status !== 'paid') return
  await sendEmail({ id: event.params.orderId, ...after }, 'status').catch((e) => console.error('email failed', e))
})

// ---------------------------------------------------------------- helpers
/**
 * Moves an unpaid order out of `pending`. Transactional and idempotent, so the
 * webhook and the sweeper can both call it. Returns whether this call did it.
 */
async function closeUnpaid(ref, payment_status) {
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists || snap.data().payment_status !== 'pending') return false
    tx.update(ref, { payment_status, updated_at: FieldValue.serverTimestamp() })
    return true
  })
}

function whatsappLink(order) {
  const summary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')
  const text = `Hi Love Raíz! This is ${order.customer_info.name}. Order ${order.id}: ${summary}. ${order.delivery_type} on ${order.delivery_date}, ${order.delivery_slot}. Total ${money(order.total_amount)}.`
  return `https://wa.me/${WHATSAPP_NUMBER.value()}?text=${encodeURIComponent(text)}`
}

const STATUS_COPY = {
  received: ['We received your order', 'Your cookies are in the queue. We bake to order, so they will go in the oven on the morning of your delivery.'],
  baking: ['Your cookies are in the oven', 'They are baking right now. Next stop: your door.'],
  shipped: ['On the way', 'Your order is out for delivery or ready for pickup.'],
  delivered: ['Delivered. Enjoy!', 'Thank you for ordering from Love Raíz. Tag us @love.raiz.'],
}

async function sendEmail(order, kind) {
  if (!SMTP_URL.value()) return
  const transport = nodemailer.createTransport(SMTP_URL.value())
  const [title, body] = kind === 'confirmed' ? ['Order confirmed', 'Your payment went through and your cookies are scheduled.'] : STATUS_COPY[order.order_status]
  const row = (label, amount) => `<tr><td style="padding:6px 0">${label}</td><td align="right">${amount}</td></tr>`
  const rows = [
    ...order.items.map((i) => row(`${i.quantity} × ${i.name}`, money(i.quantity * i.unit_price))),
    order.box_discount < 0 ? row('Box discount', `-${money(-order.box_discount)}`) : '',
    order.delivery_type === 'Pickup' ? row('Pickup', 'Free')
      : typeof order.delivery_fee === 'number' ? row(`Delivery${order.delivery_miles ? ` · ${order.delivery_miles} mi` : ''}`, money(order.delivery_fee)) : '',
  ].join('')
  const html = `
  <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#2B1911">
    <h1 style="font-size:28px;margin:24px 0 8px">${title}</h1>
    <p style="color:#5A3E30">${body}</p>
    <p style="font-size:14px">Order <b>${order.id}</b> · ${order.delivery_type} on ${order.delivery_date}, ${order.delivery_slot}</p>
    <table style="width:100%;border-top:1px solid #E4D3BC;margin-top:12px;font-size:14px">${rows}
      <tr><td style="padding-top:10px;font-weight:bold">Total</td><td align="right" style="padding-top:10px;font-weight:bold">${money(order.total_amount)}</td></tr></table>
    <p style="margin-top:20px"><a href="${whatsappLink(order)}" style="background:#E3405E;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Chat with us on WhatsApp</a></p>
    <p style="font-size:12px;color:#8a7a70">Love Raíz · Newport News, VA · @love.raiz</p>
  </div>`
  await transport.sendMail({ from: FROM_EMAIL.value(), replyTo: REPLY_TO.value(), to: order.customer_info.email, subject: `${title} — Love Raíz ${order.id}`, html })
}
