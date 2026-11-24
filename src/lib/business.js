import { DELIVERY_SLOTS } from './mockData'

/**
 * Shop facts shown in the footer. Leave a field empty and its line is hidden,
 * so nothing unconfirmed reaches customers.
 */
export const BUSINESS = {
  city: 'Newport News, VA',
  deliveryArea: 'Newport News & the Peninsula',
  slots: DELIVERY_SLOTS,
  pickupAddress: '103 Smith Ln, Newport News, VA 23601',
  hours: 'Every day, 9:30 AM – 8:30 PM',
  allergens: 'Everything is made in a kitchen that handles wheat, eggs, milk and tree nuts.',
  email: 'joseline03garcia@gmail.com',
}

/**
 * How customers pay. With a Stripe publishable key configured the shop takes
 * cards online (needs the Cloud Functions, so the paid Firebase plan). Without
 * one, orders go straight to the kitchen and are paid on delivery or pickup.
 */
export const PAY_ONLINE = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

/** Pay-on-delivery options. The keys are checked by firestore.rules: change them in both places. */
export const PAYMENT_METHODS = [
  { key: 'cash', label: 'Cash', hint: 'When you get your cookies' },
  { key: 'zelle', label: 'Zelle', hint: "We'll send the details on WhatsApp" },
]
export const paymentMethodLabel = (key) => PAYMENT_METHODS.find((m) => m.key === key)?.label || 'Card'

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '13468339153'
export const whatsappUrl = (text = '') => `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`
