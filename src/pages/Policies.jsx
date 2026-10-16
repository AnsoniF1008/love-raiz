import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { BUSINESS, whatsappUrl } from '../lib/business'
import { DELIVERY, ORDERING, maxDeliveryMiles, cutoffLabel } from '../../functions/delivery.js'
import { money } from '../lib/format'

// Standard terms for a small made-to-order bakery. Review them before launch;
// they are a common baseline, not legal advice.
const UPDATED = 'September 27, 2026'
const CANCEL_HOURS = 48

const SECTIONS = [
  { id: 'ordering', title: 'Ordering & delivery' },
  { id: 'cancellations', title: 'Cancellations & refunds' },
  { id: 'allergens', title: 'Allergens' },
  { id: 'privacy', title: 'Privacy' },
]

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-cocoa/10 pt-8">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 text-cocoa2 [&_strong]:text-cocoa [&_strong]:font-semibold">{children}</div>
    </section>
  )
}

export default function Policies() {
  const { hash } = useLocation()
  const minFee = Math.min(...DELIVERY.tiers.map((t) => t.fee))
  const contact = (
    <>
      <a href={whatsappUrl('Hi Love Raíz! About my order: ')} target="_blank" rel="noreferrer" className="font-semibold text-cocoa underline underline-offset-4 decoration-cocoa/30 hover:decoration-cocoa">WhatsApp</a>
      {BUSINESS.email && <> or <a href={`mailto:${BUSINESS.email}`} className="font-semibold text-cocoa underline underline-offset-4 decoration-cocoa/30 hover:decoration-cocoa">{BUSINESS.email}</a></>}
    </>
  )

  // Deep links like /policies#privacy land on the section.
  useEffect(() => {
    const id = hash.split('#').pop()
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [hash])

  return (
    <div className="mx-auto max-w-2xl px-5 pt-20 md:pt-14 pb-16">
      <h1 className="font-display font-extrabold tracking-tight text-4xl md:text-5xl">Policies</h1>
      <p className="mt-2 text-sm text-cocoa2">Last updated {UPDATED}</p>
      <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }) }}
            className="rounded-chip bg-oat px-4 py-2 text-sm font-semibold hover:bg-oatdeep">{s.title}</a>
        ))}
      </nav>

      <div className="mt-8 space-y-10 leading-relaxed">
        <Section id="ordering" title="Ordering & delivery">
          <p>Everything is <strong>baked to order</strong>. We bake your order the day before your delivery or pickup date. Order by <strong>{cutoffLabel()}</strong> (Virginia time) for next-day delivery, or choose any date up to {ORDERING.daysAhead} days ahead.</p>
          <p><strong>Delivery</strong> is available up to {maxDeliveryMiles()} miles from our kitchen, from {money(minFee)} depending on distance. The fee is shown at checkout before you pay. Please make sure someone can receive the order in the window you chose, or leave instructions in the notes.</p>
          <p><strong>Pickup</strong> is free at {BUSINESS.pickupAddress}. We'll message you when it's ready.</p>
          <p>If no one is available at delivery and there's no safe place to leave it, we'll contact you to arrange a second delivery, which is charged the delivery fee again. Pickup orders not collected on their pickup day can't be refunded, but we'll hold them until closing the next day.</p>
        </Section>

        <Section id="cancellations" title="Cancellations & refunds">
          <p><strong>Up to {CANCEL_HOURS} hours before</strong> your delivery or pickup date, you can cancel for a full refund or move your order to another date.</p>
          <p><strong>Less than {CANCEL_HOURS} hours before</strong>, we've already bought ingredients and scheduled your bake, so orders can't be refunded. We can usually move the date once if you tell us at least 24 hours ahead. If you placed your order less than {CANCEL_HOURS} hours ahead, you can still cancel within 1 hour of ordering.</p>
          <p><strong>Something wrong with your order?</strong> Contact us within 24 hours with your order number and a photo. If an item is damaged, missing or not what you ordered, we'll replace it or refund it.</p>
          <p>If we ever have to cancel or reschedule because of weather, illness or an emergency, we'll contact you right away and give you a full refund if the new date doesn't work for you.</p>
          <p>Refunds go back to the card you paid with and usually appear in 5–10 business days. To cancel or change an order, message us on {contact} with your order number.</p>
        </Section>

        <Section id="allergens" title="Allergens">
          {BUSINESS.allergens && <p><strong>{BUSINESS.allergens}</strong></p>}
          <p>Because everything is made in the same kitchen, we can't guarantee any item is free of these allergens, even when they aren't listed as an ingredient. If you have an allergy, message us before you order and we'll tell you exactly what's in each bake.</p>
        </Section>

        <Section id="privacy" title="Privacy">
          <p><strong>What we collect.</strong> When you order: your name, email, phone number, delivery address, delivery date and any notes. If you sign in with Google, your name and email from your Google account.</p>
          <p><strong>Why.</strong> Only to bake, deliver and update you about your order by email or WhatsApp, and to answer your questions. We don't sell or rent your information, and we don't send marketing emails unless you ask us to.</p>
          <p><strong>Payments.</strong> Cards are processed by Stripe. We never see or store your card number.</p>
          <p><strong>Services we use.</strong> Google Firebase (hosting, order database, sign-in, and anonymous usage and performance statistics), Stripe (payments), our email provider (order emails), and the US Census Bureau geocoder, which receives your delivery address to measure the delivery distance. The shop also shows posts from Instagram.</p>
          <p><strong>On your device.</strong> Your bag is saved in your browser so it isn't lost if you leave the page. Firebase may set cookies for sign-in and statistics.</p>
          <p><strong>How long we keep it.</strong> Order records are kept as long as we need them for our accounting and taxes. You can ask us to see or delete your information at any time on {contact}.</p>
          <p>This shop isn't directed at children under 13.</p>
        </Section>
      </div>
    </div>
  )
}
