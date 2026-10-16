import { money } from '../lib/format'

// Box discount and delivery lines between an order's items and its total.
// Older orders were saved before delivery_fee existed; they show no line.
export default function OrderAdjustments({ order, className = '' }) {
  const discount = order.box_discount || 0
  const hasFee = typeof order.delivery_fee === 'number'
  if (!discount && !hasFee && order.delivery_type !== 'Pickup') return null

  return (
    <div className={`space-y-1 text-sm ${className}`}>
      {discount < 0 && (
        <div className="flex justify-between text-raspberry2"><span>Box discount</span><span>{money(discount)}</span></div>
      )}
      {order.delivery_type === 'Pickup' ? (
        <div className="flex justify-between"><span>Pickup</span><span className="font-semibold">Free</span></div>
      ) : hasFee && (
        <div className="flex justify-between">
          <span>Delivery{order.delivery_miles ? <span className="text-cocoa2"> · {order.delivery_miles} mi</span> : null}</span>
          <span className="font-semibold">{money(order.delivery_fee)}</span>
        </div>
      )}
    </div>
  )
}
