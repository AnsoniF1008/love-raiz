import { addDays, shopToday } from '../../functions/delivery.js'

export const MOCK_PRODUCTS = [
  { id: 'monster-midnight', name: 'Midnight Monster', description: 'Black cocoa dough, dark chocolate chips and a fistful of Halloween sprinkles.', price: 5.5, category: 'Seasonal', is_active: true, image_url: import.meta.env.BASE_URL + 'cookies/monster-midnight.webp', tone: 'cocoa', filling: 'none' },
  { id: 'monster-slime', name: 'Slime Monster', description: 'Buttery green dough, milk chocolate chips, candy eyes looking right back at you.', price: 5.5, category: 'Seasonal', is_active: true, image_url: import.meta.env.BASE_URL + 'cookies/monster-slime.webp', tone: 'pistachio', filling: 'none' },
  { id: 'concha-galaxia', name: 'Concha Galaxia', description: 'A marbled teal and magenta sugar shell, scored like a classic concha.', price: 4.5, category: 'Conchas', is_active: true, image_url: import.meta.env.BASE_URL + 'cookies/concha-galaxia.webp', tone: 'oat', filling: 'none' },
  { id: 'concha-botones', name: 'Concha Botones', description: 'Vanilla shell, button eyes, a stitched chocolate smile and a violet flower.', price: 4.5, category: 'Seasonal', is_active: true, image_url: import.meta.env.BASE_URL + 'cookies/concha-botones.webp', tone: 'oat', filling: 'none' },
  { id: 'chocolate-chip', name: 'Classic Chocolate Chip', description: 'Brown butter, crackly edges, soft middle. The one everybody asks for.', price: 4.5, category: 'Cookies', is_active: true, image_url: import.meta.env.BASE_URL + 'cookies/chocolate-chip.webp', tone: 'caramel', filling: 'none' },
  { id: 'concha-rosa', name: 'Concha Rosa', description: 'Pillowy sweet bread under a strawberry-pink sugar shell, scored by hand.', price: 4.0, category: 'Conchas', is_active: true, image_url: import.meta.env.BASE_URL + 'cookies/concha-rosa.webp', tone: 'raspberry', filling: 'none' },
  { id: 'concha-talavera', name: 'Concha Talavera', description: 'Vanilla shell hand-painted in cobalt, after the tiles of Puebla.', price: 4.5, category: 'Conchas', is_active: true, image_url: import.meta.env.BASE_URL + 'cookies/concha-talavera.webp', tone: 'oat', filling: 'none' },
  { id: 'concha-estrella', name: 'Concha Estrella', description: 'Bright red shell, one big golden star. Made to be the centre of the box.', price: 4.5, category: 'Conchas', is_active: true, image_url: import.meta.env.BASE_URL + 'cookies/concha-estrella.webp', tone: 'caramel', filling: 'none' },
  { id: 'concha-azul', name: 'Concha Azul', description: 'A classic sugar shell in sky blue, the everyday concha.', price: 4.0, category: 'Conchas', is_active: true, image_url: import.meta.env.BASE_URL + 'cookies/concha-azul.webp', tone: 'oat', filling: 'none' },
]

export const MOCK_BOXES = [
  { id: 'b6', title: 'Love Pack', capacity: 6, base_price: -1, blurb: 'Six cookies, $1 off. A small ritual.' },
  { id: 'b12', title: 'Share Box', capacity: 12, base_price: -3, blurb: 'Twelve cookies, $3 off. For the table.' },
]

// Demo orders sit around today so the kitchen board has something to show.
const inDays = (n) => addDays(shopToday(), n)
const daysAgo = (n, h = 10) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(h, 0, 0, 0); return d }

export const MOCK_ORDERS = [
  { id: 'LR-1042', user_id: null, items: [{ product_id: 'monster-midnight', name: 'Midnight Monster', quantity: 4, unit_price: 5.5 }, { product_id: 'concha-rosa', name: 'Concha Rosa', quantity: 2, unit_price: 4.0 }], delivery_type: 'Delivery', delivery_date: inDays(1), delivery_slot: '10:00 AM - 02:00 PM', total_amount: 30.0, payment_status: 'paid', order_status: 'received', customer_info: { name: 'Marisol Vega', email: 'marisol@example.com', phone: '757-555-0142', address: '412 Warwick Blvd, Newport News, VA', notes: 'Leave at the front desk, please.' }, created_at: daysAgo(0, 9) },
  { id: 'LR-1041', user_id: 'u2', items: [{ product_id: 'chocolate-chip', name: 'Classic Chocolate Chip', quantity: 6, unit_price: 4.5 }], delivery_type: 'Pickup', delivery_date: inDays(0), delivery_slot: '02:00 PM - 06:00 PM', total_amount: 27.0, payment_status: 'paid', order_status: 'baking', customer_info: { name: 'Devon Ali', email: 'devon@example.com', phone: '757-555-0199', address: '', notes: '' }, created_at: daysAgo(0, 8) },
  { id: 'LR-1040', user_id: null, items: [{ product_id: 'concha-talavera', name: 'Concha Talavera', quantity: 12, unit_price: 4.5 }], delivery_type: 'Delivery', delivery_date: inDays(0), delivery_slot: '10:00 AM - 02:00 PM', total_amount: 51.0, payment_status: 'paid', order_status: 'shipped', customer_info: { name: 'Priya Natarajan', email: 'priya@example.com', phone: '757-555-0111', address: '88 Jefferson Ave, Newport News, VA', notes: 'Birthday box!' }, created_at: daysAgo(1, 16) },
  { id: 'LR-1039', user_id: 'u4', items: [{ product_id: 'monster-slime', name: 'Slime Monster', quantity: 3, unit_price: 5.5 }, { product_id: 'concha-estrella', name: 'Concha Estrella', quantity: 3, unit_price: 4.5 }], delivery_type: 'Pickup', delivery_date: inDays(-1), delivery_slot: '02:00 PM - 06:00 PM', total_amount: 30.0, payment_status: 'paid', order_status: 'delivered', customer_info: { name: 'Tomas Reyes', email: 'tomas@example.com', phone: '757-555-0170', address: '', notes: '' }, created_at: daysAgo(2, 11) },
  { id: 'LR-1038', user_id: null, items: [{ product_id: 'concha-azul', name: 'Concha Azul', quantity: 6, unit_price: 4.0 }], delivery_type: 'Delivery', delivery_date: inDays(1), delivery_slot: '10:00 AM - 02:00 PM', total_amount: 24.0, payment_status: 'pending', order_status: 'received', customer_info: { name: 'Hannah Cole', email: 'hannah@example.com', phone: '757-555-0128', address: '15 Oyster Point Rd, Newport News, VA', notes: '' }, created_at: daysAgo(0, 7) },
]

// Edited in functions/delivery.js, shared with the server's validation.
export { DELIVERY_SLOTS } from '../../functions/delivery.js'
export const ORDER_FLOW = [
  { key: 'received', label: 'Received' },
  { key: 'baking', label: 'Baking' },
  { key: 'shipped', label: 'Out for delivery' },
  { key: 'delivered', label: 'Completed' },
]
export const statusLabel = (order) => {
  if (order.order_status === 'shipped') return order.delivery_type === 'Pickup' ? 'Ready for pickup' : 'Out for delivery'
  return ORDER_FLOW.find((s) => s.key === order.order_status)?.label || order.order_status
}
