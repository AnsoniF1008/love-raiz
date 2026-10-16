import { addDays, earliestDeliveryDate } from '../../functions/delivery.js'

export const money = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0)
export const dateLabel = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
export const timeAgo = (d) => {
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} h ago`
  return `${Math.round(h / 24)} d ago`
}
// Delivery dates in the shop's time zone (Virginia), starting tomorrow, the
// same rule the server enforces. See functions/delivery.js.
export const nextDays = (n = 7) => Array.from({ length: n }, (_, i) => addDays(earliestDeliveryDate(), i))
