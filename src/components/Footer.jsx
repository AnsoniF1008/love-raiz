import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BUSINESS, whatsappUrl } from '../lib/business'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/instagram'
import { IconInstagram } from './InstagramFeed'
import logo from '../assets/brand/logo.png'
import { DELIVERY, slotLabel, cutoffLabel } from '../../functions/delivery.js'
import { money } from '../lib/format'

const IconWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8L4 20Z" />
    <path d="M9.2 8.6c.2-.5.6-.5.9-.5h.4c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .5-.1.6l-.5.6c.5 1 1.3 1.8 2.3 2.3l.6-.5c.2-.1.4-.2.6-.1l1.4.6c.3.1.4.3.4.5v.4c0 .3 0 .7-.5.9-.6.3-1.6.4-3-.3a8.3 8.3 0 0 1-3.3-3.3c-.7-1.4-.6-2.4-.3-3Z" fill="currentColor" stroke="none" />
  </svg>
)

function Fact({ term, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-cocoa2">{term}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-cocoa">{children}</dd>
    </div>
  )
}

export default function Footer() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  if (pathname.startsWith('/admin')) return null
  const signedIn = user && !user.isAnonymous

  return (
    <footer className="bg-oat text-cocoa">
      <div className="mx-auto max-w-6xl px-5 pb-32 pt-12 md:px-6 md:pb-12 md:pt-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <img src={logo} alt="Love Raíz" className="h-12 w-auto" />
            <p className="mt-4 max-w-xs text-sm text-cocoa2">Cookies and conchas baked to order in {BUSINESS.city}. We bake the day before your delivery: order by {cutoffLabel()} for next-day delivery.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={whatsappUrl('Hi Love Raíz! I have a question about an order.')} target="_blank" rel="noreferrer" className="btn-dark px-5 py-2.5 text-sm">
                <IconWhatsApp /> Message us
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="btn bg-milk px-5 py-2.5 text-sm text-cocoa hover:bg-white">
                <IconInstagram size={18} /> @{INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>

          <div className="md:col-span-4">
            <h2 className="font-display text-lg font-bold">Pickup &amp; delivery</h2>
            <dl className="mt-4 space-y-3">
              <Fact term="Delivery area">{BUSINESS.deliveryArea}</Fact>
              <Fact term="Delivery fee">{DELIVERY.tiers.map((t) => `${money(t.fee)} up to ${t.upToMiles} mi`).join(' · ')}</Fact>
              <Fact term="Pickup">{BUSINESS.pickupAddress || BUSINESS.city}</Fact>
              <Fact term="Windows">{BUSINESS.slots.map(slotLabel).join(' · ')}</Fact>
              {BUSINESS.hours && <Fact term="Hours">{BUSINESS.hours}</Fact>}
            </dl>
          </div>

          <div className="md:col-span-3">
            <h2 className="font-display text-lg font-bold">Allergies &amp; questions</h2>
            {BUSINESS.allergens && <p className="mt-4 text-sm text-cocoa2">{BUSINESS.allergens}</p>}
            <p className="mt-4 text-sm text-cocoa2">
              Have an allergy or a special request? <a href={whatsappUrl('Hi Love Raíz! I have an allergy question.')} target="_blank" rel="noreferrer" className="font-semibold text-cocoa underline underline-offset-4 decoration-cocoa/30 hover:decoration-cocoa">Ask us on WhatsApp</a> before you order.
            </p>
            {BUSINESS.email && (
              <p className="mt-2 text-sm"><a href={`mailto:${BUSINESS.email}`} className="font-semibold underline underline-offset-4 decoration-cocoa/30 hover:decoration-cocoa">{BUSINESS.email}</a></p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-cocoa/10 pt-6 text-xs text-cocoa2">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 font-semibold">
            <Link to="/" className="hover:text-cocoa">Shop</Link>
            <Link to="/build-a-box" className="hover:text-cocoa">Build a box</Link>
            <Link to={signedIn ? '/orders' : '/login'} className="hover:text-cocoa">{signedIn ? 'My orders' : 'Sign in'}</Link>
            <Link to="/policies" className="hover:text-cocoa">Cancellations, refunds &amp; privacy</Link>
          </nav>
          <p>© {new Date().getFullYear()} Love Raíz</p>
        </div>
      </div>
    </footer>
  )
}
