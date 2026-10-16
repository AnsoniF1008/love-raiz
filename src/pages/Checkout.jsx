import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrderAndPayment, quoteDeliveryFee } from '../lib/store'
import { DELIVERY, maxDeliveryMiles, slotLabel, earliestDeliveryDate, latestDeliveryDate, addDays, shopToday, pastCutoff, cutoffLabel } from '../../functions/delivery.js'
import { DEMO } from '../lib/firebase'
import { DELIVERY_SLOTS } from '../lib/mockData'
import { BUSINESS } from '../lib/business'
import BagChanges from '../components/BagChanges'
import { money, dateLabel, nextDays } from '../lib/format'

// Our Cloud Functions send customer-ready messages for problems the customer can
// fix (sold out, bad address). Anything else is ours or the network's: say so
// plainly instead of showing "internal" or a stack-trace-looking code.
function friendlyError(err) {
  const code = String(err?.code || '').replace(/^functions\//, '')
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return "You're offline. Reconnect and tap Pay again; your bag is saved."
  if (['invalid-argument', 'failed-precondition', 'unauthenticated', 'unavailable'].includes(code) && err.message) return err.message
  return "We couldn't place the order. Nothing was charged. Try again, or message us on WhatsApp."
}

const minFee = Math.min(...DELIVERY.tiers.map((t) => t.fee))

// Prices delivery as the customer types, once they pause, and drops answers
// for an address they have already changed.
function useDeliveryQuote(address, enabled) {
  const [quote, setQuote] = useState({ status: 'idle' })
  useEffect(() => {
    const value = address.trim()
    if (!enabled || value.length < 6) { setQuote({ status: 'idle' }); return }
    let stale = false
    setQuote({ status: 'loading' })
    const t = setTimeout(async () => {
      try {
        const q = await quoteDeliveryFee(value)
        if (!stale) setQuote(q.ok ? { status: 'ok', ...q } : { status: 'error', message: q.message })
      } catch (err) {
        if (!stale) setQuote({ status: 'error', message: err?.message || "We couldn't check the delivery distance. Try again, or choose pickup." })
      }
    }, 700)
    return () => { stale = true; clearTimeout(t) }
  }, [address, enabled])
  return quote
}

export default function Checkout() {
  const cart = useCart()
  const { user, signInGoogle, signInGuest } = useAuth()
  const nav = useNavigate()
  const days = nextDays(7)
  const [form, setForm] = useState({ delivery_type: 'Delivery', delivery_date: days[0], delivery_slot: DELIVERY_SLOTS[0], name: user?.name || '', email: user?.email || '', phone: '', address: '', notes: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const delivering = form.delivery_type === 'Delivery'
  const quote = useDeliveryQuote(form.address, delivering)
  const deliveryFee = delivering && quote.status === 'ok' ? quote.fee : 0
  const deliveryReady = !delivering || quote.status === 'ok'
  const total = cart.total + deliveryFee

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-24 pb-16 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Nothing to check out yet</h1>
        <p className="mt-2 text-cocoa2">Your bag is empty. Add a few cookies first.</p>
        <Link to="/" className="btn-primary mt-6">Back to the menu</Link>
      </div>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (delivering && !form.address.trim()) return setError('Add a delivery address, or switch to pickup.')
    if (!deliveryReady) return setError(quote.message || 'Wait a moment while we price delivery to your address.')
    setBusy(true)
    try {
      let u = user
      if (!u) u = await signInGuest()
      const payload = {
        user_id: u?.isAnonymous ? null : u?.uid || null,
        items: cart.items.map(({ product_id, name, quantity, unit_price }) => ({ product_id, name, quantity, unit_price })),
        box_id: cart.box?.id || null,
        box_discount: cart.discount,
        delivery_fee: deliveryFee, // shown to the customer; the server measures and charges its own
        delivery_type: form.delivery_type,
        delivery_date: form.delivery_date,
        delivery_slot: form.delivery_slot,
        customer_info: { name: form.name, email: form.email, phone: form.phone, address: form.delivery_type === 'Delivery' ? form.address : '', notes: form.notes },
      }
      const { orderId, clientSecret } = await createOrderAndPayment(payload)
      if (!DEMO) {
        // Stripe Payment Element confirmation happens on the order page (see OrderStatus + functions/README).
        sessionStorage.setItem(`lr-cs-${orderId}`, clientSecret)
      }
      cart.dispatch({ type: 'clear' })
      nav(`/order/${orderId}`)
    } catch (err) {
      setError(friendlyError(err))
    } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-6 pt-20 md:pt-14 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <form onSubmit={submit} className="lg:col-span-7 space-y-8">
        <div>
          <h1 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl">Checkout</h1>
          <BagChanges className="mt-4" />
          {!user && (
            <div className="mt-4 tile p-4 flex flex-wrap items-center gap-3">
              <p className="text-sm text-cocoa2 flex-1 min-w-[12rem]">Checking out as a guest. Sign in with Google to keep all your orders in one place.</p>
              <button type="button" onClick={signInGoogle} className="btn-ghost text-sm">Sign in with Google</button>
            </div>
          )}
        </div>

        <fieldset className="min-w-0">
          <legend className="font-display text-2xl font-bold">How do you want it?</legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {['Delivery', 'Pickup'].map((t) => (
              <button type="button" key={t} onClick={() => setForm((f) => ({ ...f, delivery_type: t }))}
                className={`rounded-tile p-4 text-left border-2 transition-colors ${form.delivery_type === t ? 'border-raspberry bg-white' : 'border-transparent bg-oat'}`}>
                <p className="font-bold">{t}</p>
                <p className="text-xs text-cocoa2 mt-0.5">{t === 'Delivery' ? `From ${money(minFee)} · up to ${maxDeliveryMiles()} miles` : 'Free · warm, from our kitchen'}</p>
              </button>
            ))}
          </div>
          {form.delivery_type === 'Pickup' && BUSINESS.pickupAddress && (
            <p className="mt-3 text-sm text-cocoa2">Pick up at <span className="font-semibold text-cocoa">{BUSINESS.pickupAddress}</span>{BUSINESS.hours ? ` · ${BUSINESS.hours}` : ''}</p>
          )}
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="font-display text-2xl font-bold">When?</legend>
          <p className="mt-1 text-sm text-cocoa2">
            {pastCutoff()
              ? `Orders for tomorrow closed at ${cutoffLabel()}, so the earliest is ${dateLabel(days[0])}.`
              : `Order by ${cutoffLabel()} for delivery tomorrow; we bake every order the day before.`} Planning ahead? Pick any date.
          </p>
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
            {days.map((d) => (
              <button type="button" key={d} onClick={() => setForm((f) => ({ ...f, delivery_date: d }))} aria-pressed={form.delivery_date === d}
                className={`shrink-0 rounded-tile px-4 py-3 text-sm font-semibold transition-colors ${form.delivery_date === d ? 'bg-cocoa text-milk' : 'bg-oat hover:bg-oatdeep'}`}>{d === addDays(shopToday(), 1) ? `Tomorrow · ${dateLabel(d).split(', ')[1]}` : dateLabel(d)}</button>
            ))}
            <label className={`relative shrink-0 cursor-pointer rounded-tile px-4 py-3 text-sm font-semibold transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-raspberry ${days.includes(form.delivery_date) ? 'bg-oat hover:bg-oatdeep' : 'bg-cocoa text-milk'}`}>
              {days.includes(form.delivery_date) ? 'Another date' : dateLabel(form.delivery_date)}
              <input type="date" aria-label="Pick another date" min={earliestDeliveryDate()} max={latestDeliveryDate()} value={form.delivery_date}
                onChange={(e) => {
                  const { value } = e.target
                  if (!value) return
                  setForm((f) => ({ ...f, delivery_date: value }))
                  // The chip sits at the end of a scrolling row; bring the chosen date into view.
                  e.target.closest('label')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
                }}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
            </label>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            {DELIVERY_SLOTS.map((s) => (
              <button type="button" key={s} onClick={() => setForm((f) => ({ ...f, delivery_slot: s }))} aria-pressed={form.delivery_slot === s}
                className={`rounded-tile px-2 py-3 text-sm font-semibold transition-colors ${form.delivery_slot === s ? 'bg-cocoa text-milk' : 'bg-oat hover:bg-oatdeep'}`}>{slotLabel(s)}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className="min-w-0 space-y-3">
          <legend className="font-display text-2xl font-bold mb-3">Your details</legend>
          <Field label="Full name">
            <input required className="input" autoComplete="name" value={form.name} onChange={set('name')} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Email" hint="Your receipt and order updates">
              <input required type="email" className="input" autoComplete="email" value={form.email} onChange={set('email')} />
            </Field>
            <Field label="Phone" hint="For WhatsApp updates">
              <input required type="tel" className="input" autoComplete="tel" value={form.phone} onChange={set('phone')} />
            </Field>
          </div>
          {form.delivery_type === 'Delivery' && (
            <Field label="Delivery address" hint={`Up to ${maxDeliveryMiles()} miles from our kitchen`}>
              <input required className="input" autoComplete="street-address" placeholder="Street, city, ZIP" value={form.address} onChange={set('address')} />
              <span aria-live="polite" className="mt-1.5 block min-h-[1.25rem] text-xs">
                {quote.status === 'loading' && <span className="text-cocoa2">Checking the distance…</span>}
                {quote.status === 'ok' && <span className="font-semibold text-cocoa">{quote.miles} miles away · {money(quote.fee)} delivery</span>}
                {quote.status === 'error' && <span className="font-semibold text-raspberry2">{quote.message}</span>}
              </span>
            </Field>
          )}
          <Field label="Notes for the baker" optional>
            <textarea className="input" rows={2} placeholder="Allergies, gift message, gate code" value={form.notes} onChange={set('notes')} />
          </Field>
        </fieldset>

        {error && <p role="alert" className="rounded-tile bg-raspberry/10 text-raspberry2 px-4 py-3 text-sm font-semibold">{error}</p>}

        <button type="submit" disabled={busy || (delivering && quote.status === 'loading')} className="btn-primary w-full sm:w-auto">
          {busy ? 'Saving your order…' : delivering && quote.status === 'error' ? 'Choose pickup or another address' : delivering && !deliveryReady ? 'Add your address to see the total' : `Continue to payment · ${money(total)}`}
        </button>
        <p className="text-xs text-cocoa/60">You'll enter your card on the next screen. Cards are processed by Stripe; we never see your card number. By continuing you agree to our <Link to="/policies" className="font-semibold underline underline-offset-2">cancellation, refund and privacy policies</Link>.</p>
      </form>

      <aside className="lg:col-span-5">
        <div className="tile p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-2xl font-bold">Order summary</h2>
          <ul className="mt-4 divide-y divide-cocoa/10">
            {cart.items.map((i) => (
              <li key={i.product_id} className="py-3 flex justify-between gap-3 text-sm"><span>{i.quantity} × {i.name}</span><span className="font-semibold">{money(i.quantity * i.unit_price)}</span></li>
            ))}
          </ul>
          {cart.discount < 0 && <div className="flex justify-between text-sm text-raspberry2 mt-2"><span>{cart.box?.title} discount</span><span>{money(cart.discount)}</span></div>}
          <div className="flex justify-between text-sm mt-2">
            <span>{delivering ? 'Delivery' : 'Pickup'}</span>
            <span className="font-semibold">
              {!delivering ? 'Free' : quote.status === 'ok' ? money(quote.fee) : quote.status === 'loading' ? 'Checking…' : <span className="font-normal text-cocoa2">Add your address</span>}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-cocoa/10 flex justify-between font-display text-2xl font-extrabold"><span>Total</span><motion.span key={total}>{money(total)}</motion.span></div>
        </div>
      </aside>
    </div>
  )
}

function Field({ label, hint, optional, children }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{label}{optional && <span className="font-normal text-cocoa2"> (optional)</span>}</span>
        {hint && <span className="text-xs text-cocoa2">{hint}</span>}
      </span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  )
}
