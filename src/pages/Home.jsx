import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroSlider, { DEFAULT_PRODUCTS } from '../components/HeroSlider'
import BentoCatalog from '../components/BentoCatalog'
import InstagramFeed from '../components/InstagramFeed'
import { DELIVERY, maxDeliveryMiles, cutoffLabel } from '../../functions/delivery.js'
import { money } from '../lib/format'
import { subscribeProducts } from '../lib/store'
import { useSubscription } from '../hooks/useCollection'
import { useCart } from '../context/CartContext'

const THEMES = {
  cocoa: { bg: '#E7DDF4', blob: '#C9B4EA' },
  pistachio: { bg: '#DCEEC8', blob: '#B5DA8E' },
  caramel: { bg: '#F6E4C6', blob: '#EBC88F' },
  raspberry: { bg: '#F6C6C6', blob: '#F2A1A8' },
  oat: { bg: '#F3E6D4', blob: '#D9C4A8' },
}

const extras = Object.fromEntries(DEFAULT_PRODUCTS.map((p) => [p.id, p]))

function toHeroProduct(p) {
  if (!p.image_url) return null
  const known = extras[p.id]
  const parts = (p.name || '').trim().split(/\s+/)
  return {
    id: p.id,
    title: known?.title || parts[0] || p.name,
    titleAccent: known?.titleAccent || parts.slice(1).join(' ') || undefined,
    description: p.description,
    price: p.price,
    image: p.image_url,
    thumb: known?.thumb || p.image_url,
    theme: known?.theme || THEMES[p.tone] || THEMES.caramel,
    bits: known?.bits,
  }
}

export default function Home() {
  const { data: products, loading } = useSubscription(subscribeProducts)
  const cart = useCart()
  const nav = useNavigate()
  const heroProducts = useMemo(() => products.map(toHeroProduct).filter(Boolean), [products])

  const addFromSlider = (p) => {
    const fromStore = products.find((x) => x.id === p.id)
    cart.dispatch({
      type: 'add',
      product: fromStore || {
        id: p.id,
        name: [p.title, p.titleAccent].filter(Boolean).join(' '),
        price: p.price,
        tone: 'caramel',
        filling: 'none',
        image_url: p.image,
      },
    })
  }

  return (
    <>
      <HeroSlider
        products={heroProducts.length ? heroProducts : undefined}
        onAddToBag={addFromSlider}
        onBuildBox={() => nav('/build-a-box')}
      />
      <BentoCatalog products={products} loading={loading} />
      <section className="mx-auto max-w-6xl px-5 md:px-6 pb-8">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="tile p-6"><p className="font-display text-xl font-bold">Baked to order</p><p className="mt-1 text-sm text-cocoa2">Nothing waits on a shelf. We bake your order the day before it's delivered: order by {cutoffLabel()} for tomorrow, or pick any day.</p></div>
          <div className="tile p-6"><p className="font-display text-xl font-bold">Three windows a day</p><p className="mt-1 text-sm text-cocoa2">Morning, afternoon or evening delivery, or pick up warm in Newport News.</p></div>
          <div className="tile p-6"><p className="font-display text-xl font-bold">Delivery by distance</p><p className="mt-1 text-sm text-cocoa2">From {money(Math.min(...DELIVERY.tiers.map((t) => t.fee)))} within {maxDeliveryMiles()} miles of our kitchen. Pickup is always free.</p></div>
        </div>
      </section>
      <InstagramFeed products={products} />
    </>
  )
}
