import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { subscribeAllOrders, updateOrderStatus } from '../../lib/store'
import { ORDER_FLOW, statusLabel } from '../../lib/mockData'
import { money, dateLabel, timeAgo } from '../../lib/format'
import OrderAdjustments from '../OrderAdjustments'
import { shopToday, addDays } from '../../../functions/delivery.js'

const PAYMENT_BADGE = {
  paid: ['Paid', 'bg-cocoa text-milk'],
  failed: ['Payment failed', 'bg-raspberry text-milk'],
  expired: ['Expired, never paid', 'bg-oatdeep text-cocoa2'],
}
const paymentBadge = (status) => PAYMENT_BADGE[status] || ['Awaiting payment', 'bg-oat']

/** Two-tone chime, generated with the Web Audio API so there is no asset to load. */
function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[[880, 0], [1174.66, 0.18]].forEach(([freq, t]) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.type = 'sine'; o.frequency.value = freq
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t)
      g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.5)
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.6)
    })
  } catch {}
}

export default function OrdersBoard() {
  const [orders, setOrders] = useState([])
  const [sound, setSound] = useState(true)
  const [filter, setFilter] = useState('active')
  const [selected, setSelected] = useState(null)
  const paidIds = useRef(null)

  useEffect(() => subscribeAllOrders(setOrders), [])

  // Alert once for every order that flips to "paid" after the first snapshot.
  useEffect(() => {
    const paid = new Set(orders.filter((o) => o.payment_status === 'paid').map((o) => o.id))
    if (paidIds.current === null) { paidIds.current = paid; return }
    const fresh = [...paid].some((id) => !paidIds.current.has(id))
    paidIds.current = paid
    if (fresh && sound) chime()
  }, [orders, sound])

  const visible = useMemo(() => orders.filter((o) => {
    if (filter === 'active') return o.order_status !== 'delivered'
    if (filter === 'unpaid') return o.payment_status !== 'paid'
    return true
  }), [orders, filter])

  // Made to order: today the kitchen bakes what is delivered tomorrow.
  const today = shopToday()
  const tomorrow = addDays(today, 1)
  const paid = orders.filter((o) => o.payment_status === 'paid')
  const bakeList = Object.entries(
    paid.filter((o) => o.delivery_date === tomorrow)
      .flatMap((o) => o.items)
      .reduce((acc, i) => ({ ...acc, [i.name]: (acc[i.name] || 0) + i.quantity }), {})
  ).sort((a, b) => b[1] - a[1])
  const stats = {
    today: paid.filter((o) => o.delivery_date === today).length,
    revenue: paid.filter((o) => o.created_at >= new Date(new Date().setHours(0, 0, 0, 0))).reduce((s, o) => s + o.total_amount, 0),
    cookies: bakeList.reduce((s, [, n]) => s + n, 0),
  }

  const advance = (o) => { const i = ORDER_FLOW.findIndex((s) => s.key === o.order_status); if (i < ORDER_FLOW.length - 1) updateOrderStatus(o.id, ORDER_FLOW[i + 1].key) }
  const current = selected ? orders.find((o) => o.id === selected) : null

  return (
    <div className="grid lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8">
        <div className="grid grid-cols-3 gap-3">
          <div className="tile p-4"><p className="text-sm text-cocoa2">Deliver today</p><p className="font-display text-3xl font-extrabold">{stats.today}</p></div>
          <div className="tile p-4"><p className="text-sm text-cocoa2">Revenue today</p><p className="font-display text-3xl font-extrabold">{money(stats.revenue)}</p></div>
          <div className="tile p-4"><p className="text-sm text-cocoa2">Bake today</p><p className="font-display text-3xl font-extrabold">{stats.cookies}</p></div>
        </div>

        <div className="mt-3 tile p-4">
          <p className="text-sm font-semibold">Bake list for {dateLabel(tomorrow)}</p>
          {bakeList.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {bakeList.map(([name, n]) => <li key={name} className="rounded-chip bg-oat px-3 py-1 text-sm"><span className="font-bold">{n}</span> {name}</li>)}
            </ul>
          ) : <p className="mt-1 text-sm text-cocoa2">No paid orders for tomorrow yet.</p>}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1">
            {[['active', 'Active'], ['unpaid', 'Awaiting payment'], ['all', 'All']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-chip text-sm font-semibold ${filter === k ? 'bg-cocoa text-milk' : 'bg-white hover:bg-oat'}`}>{l}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <span>New-order chime</span>
            <button role="switch" aria-checked={sound} onClick={() => { setSound((s) => !s); if (!sound) chime() }} className={`w-11 h-6 rounded-chip relative transition-colors ${sound ? 'bg-raspberry' : 'bg-oatdeep'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-chip bg-milk transition-transform ${sound ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </label>
        </div>

        <ul className="mt-4 space-y-2">
          <AnimatePresence initial={false}>
            {visible.map((o) => (
              <motion.li key={o.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div onClick={() => setSelected(o.id)} className={`tile p-4 flex items-center gap-4 cursor-pointer transition-colors ${selected === o.id ? 'border-raspberry bg-white' : 'hover:bg-white'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold">{o.id}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-chip ${paymentBadge(o.payment_status)[1]}`}>{paymentBadge(o.payment_status)[0]}</span>
                      <span className="text-xs text-cocoa/50">{timeAgo(o.created_at)}</span>
                    </div>
                    <p className="text-sm mt-0.5 truncate">{o.customer_info.name} · {o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}</p>
                    <p className="text-xs text-cocoa2 mt-0.5">{o.delivery_type} · {dateLabel(o.delivery_date)} · {o.delivery_slot}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-extrabold text-lg">{money(o.total_amount)}</p>
                    <p className="text-xs font-semibold text-raspberry">{statusLabel(o)}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {visible.length === 0 && <li className="tile p-8 text-center text-cocoa2">No orders here. Quiet kitchen.</li>}
        </ul>
      </div>

      <aside className="lg:col-span-4">
        <div className="tile p-5 lg:sticky lg:top-20">
          {!current ? (
            <p className="text-cocoa2 text-sm">Select an order to see details and move it along.</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs text-cocoa/50">Order</p><h2 className="font-display text-2xl font-extrabold">{current.id}</h2></div>
                <p className="font-display text-2xl font-extrabold">{money(current.total_amount)}</p>
              </div>
              <ol className="mt-4 space-y-1">
                {ORDER_FLOW.map((s, i) => {
                  const idx = ORDER_FLOW.findIndex((x) => x.key === current.order_status)
                  const state = i < idx ? 'done' : i === idx ? 'now' : 'todo'
                  const label = s.key === 'shipped' ? (current.delivery_type === 'Pickup' ? 'Ready for pickup' : 'Out for delivery') : s.key === 'baking' ? 'Baking / preparing' : s.label
                  return (
                    <li key={s.key} className={`flex items-center gap-3 rounded-tile px-3 py-2 text-sm ${state === 'now' ? 'bg-cocoa text-milk font-bold' : state === 'done' ? 'text-cocoa/50 line-through' : 'text-cocoa2'}`}>
                      <span className={`w-2.5 h-2.5 rounded-chip ${state === 'now' ? 'bg-raspberry' : state === 'done' ? 'bg-cocoa/30' : 'bg-oatdeep'}`} />{label}
                    </li>
                  )
                })}
              </ol>
              {current.order_status !== 'delivered' && (
                <button onClick={() => advance(current)} disabled={current.payment_status !== 'paid'} className="btn-primary w-full mt-4 text-sm">
                  {current.payment_status !== 'paid' ? 'Waiting for payment' : `Move to: ${ORDER_FLOW[ORDER_FLOW.findIndex((s) => s.key === current.order_status) + 1]?.label}`}
                </button>
              )}
              <div className="mt-5 text-sm space-y-1">
                <p className="font-bold">{current.customer_info.name}</p>
                <p><a className="underline" href={`tel:${current.customer_info.phone}`}>{current.customer_info.phone}</a> · <a className="underline" href={`mailto:${current.customer_info.email}`}>{current.customer_info.email}</a></p>
                {current.customer_info.address && <p>{current.customer_info.address}</p>}
                {current.customer_info.notes && <p className="rounded-tile bg-caramel/20 px-3 py-2 mt-2">"{current.customer_info.notes}"</p>}
              </div>
              <ul className="mt-4 divide-y divide-cocoa/10 text-sm">
                {current.items.map((i) => <li key={i.product_id} className="py-2 flex justify-between"><span>{i.quantity} × {i.name}</span><span className="font-semibold">{money(i.quantity * i.unit_price)}</span></li>)}
              </ul>
              <OrderAdjustments order={current} className="pt-2 border-t border-cocoa/10" />
            </>
          )}
        </div>
      </aside>
    </div>
  )
}
