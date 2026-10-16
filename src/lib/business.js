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

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '13468339153'
export const whatsappUrl = (text = '') => `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`
