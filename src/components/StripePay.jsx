import { useState } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function Form({ orderId }) {
  const stripe = useStripe(), elements = useElements()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pay = async (e) => {
    e.preventDefault(); if (!stripe || !elements) return
    setBusy(true); setError('')
    const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: `${window.location.origin}/order/${orderId}` } })
    if (error) { setError(error.message); setBusy(false) }
    else sessionStorage.removeItem(`lr-cs-${orderId}`)
  }
  return (
    <form onSubmit={pay} className="tile p-6 mt-8">
      <h2 className="font-display text-xl font-bold">Payment</h2>
      <div className="mt-4"><PaymentElement options={{ layout: 'tabs' }} /></div>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-raspberry2">{error}</p>}
      <button disabled={!stripe || busy} className="btn-primary w-full mt-4">{busy ? 'Processing…' : 'Pay now'}</button>
    </form>
  )
}

export default function StripePay({ orderId, clientSecret }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat', variables: { colorPrimary: '#E3405E', colorText: '#2B1911', borderRadius: '14px', fontFamily: 'Manrope, system-ui, sans-serif' } } }}>
      <Form orderId={orderId} />
    </Elements>
  )
}
