import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { subscribeOrder } from '../lib/store'
import { ORDER_FLOW, statusLabel } from '../lib/mockData'
import { money, dateLabel } from '../lib/format'
import { DEMO } from '../lib/firebase'
import { whatsappUrl } from '../lib/business'
import OrderAdjustments from '../components/OrderAdjustments'

const StripePay = DEMO ? null : lazy(() => import('../components/StripePay'))

export default function OrderStatus() {
  const { id } = useParams()
  const [order, setOrder] = useState(undefined)
  useEffect(() => subscribeOrder(id, setOrder), [id])

  if (order === undefined) return <div className="mx-auto max-w-xl px-5 pt-16"><div className="tile h-40 animate-pulse" /></div>
  if (!order) return <div className="mx-auto max-w-xl px-5 pt-16 text-center"><h1 className="font-display text-3xl font-extrabold">We can't find that order</h1><Link to="/" className="btn-ghost mt-6">Back to the menu</Link></div>

  const paid = order.payment_status === 'paid'
  // Failed or abandoned (closed after 30 minutes unpaid): nothing will be baked.
  const closed = order.payment_status === 'failed' || order.payment_status === 'expired'
  const clientSecret = !DEMO && !paid ? sessionStorage.getItem(`lr-cs-${order.id}`) : null
  const stepIdx = ORDER_FLOW.findIndex((s) => s.key === order.order_status)
  const summary = order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')
  const waText = (`Hi Love Raíz! This is ${order.customer_info.name}. Order ${order.id}: ${summary}. ${order.delivery_type} on ${dateLabel(order.delivery_date)}, ${order.delivery_slot}. Total ${money(order.total_amount)}.`)

  return (
    <div className="mx-auto max-w-2xl px-5 pt-20 md:pt-16 pb-16">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }} className={`rounded-hero p-7 sm:p-10 ${paid ? 'bg-cocoa text-milk' : 'bg-oat'}`}>
        <p className="text-sm font-semibold opacity-70">Order {order.id}</p>
        <h1 className="mt-2 font-display font-extrabold tracking-tight text-4xl sm:text-5xl leading-none">
          {paid ? 'Paid. We\'re on it.' : closed ? 'This order wasn\'t paid' : clientSecret ? 'One last step: payment' : 'Confirming your payment…'}
        </h1>
        <p className="mt-3 opacity-80">
          {closed
            ? "The payment didn't go through, so we won't bake this one and nothing was charged. Add your cookies again to place a new order."
            : `${order.delivery_type} on ${dateLabel(order.delivery_date)}, ${order.delivery_slot}. We'll message you at each step.`}
        </p>
        {!paid && !closed && !clientSecret && <div className="mt-4 h-1.5 rounded-chip bg-cocoa/10 overflow-hidden"><motion.div className="h-full bg-raspberry" animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }} /></div>}
      </motion.div>

      {clientSecret && StripePay && <Suspense fallback={<div className="tile h-40 mt-8 animate-pulse" />}><StripePay orderId={order.id} clientSecret={clientSecret} /></Suspense>}

      <ol className="mt-8 grid grid-cols-4 gap-2">
        {ORDER_FLOW.map((s, i) => {
          const done = paid && i <= stepIdx
          return (
            <li key={s.key} className="text-center">
              <div className={`h-2 rounded-chip ${done ? 'bg-raspberry' : 'bg-oatdeep'}`} />
              <p className={`mt-2 text-xs font-semibold ${done ? 'text-cocoa' : 'text-cocoa/40'}`}>{i === stepIdx ? statusLabel(order) : s.label}</p>
            </li>
          )
        })}
      </ol>

      <div className="mt-8 tile p-6">
        <h2 className="font-display text-xl font-bold">What's in the box</h2>
        <ul className="mt-3 divide-y divide-cocoa/10">
          {order.items.map((i) => <li key={i.product_id} className="py-2 flex justify-between text-sm"><span>{i.quantity} × {i.name}</span><span className="font-semibold">{money(i.quantity * i.unit_price)}</span></li>)}
        </ul>
        <OrderAdjustments order={order} className="mt-2 pt-2 border-t border-cocoa/10" />
        <div className="mt-3 pt-3 border-t border-cocoa/10 flex justify-between font-display text-xl font-extrabold"><span>Total</span><span>{money(order.total_amount)}</span></div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href={whatsappUrl(waText)} target="_blank" rel="noreferrer" className="btn-primary">Send to WhatsApp</a>
        <Link to="/" className="btn-ghost">Back to the menu</Link>
      </div>
      {paid && <p className="mt-4 text-xs text-cocoa/60">A receipt is on its way to {order.customer_info.email}.</p>}
    </div>
  )
}
