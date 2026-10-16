import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Cookie from '../components/Cookie'
import { subscribeProducts, subscribeBoxes } from '../lib/store'
import { useSubscription } from '../hooks/useCollection'
import { useCart } from '../context/CartContext'
import { money } from '../lib/format'

export default function BuildBox() {
  const { data: products } = useSubscription(subscribeProducts)
  const { data: boxes } = useSubscription(subscribeBoxes)
  const cart = useCart()
  // Resume the box already in the bag, so "Edit box" picks up where it left off.
  const [box, setBox] = useState(() => cart.box)
  const [picks, setPicks] = useState(() => (cart.box ? Object.fromEntries(cart.items.map((i) => [i.product_id, i.quantity])) : {})) // product_id -> qty
  const nav = useNavigate()

  const filled = Object.values(picks).reduce((s, n) => s + n, 0)
  const capacity = box?.capacity || 0
  const full = box && filled >= capacity
  const subtotal = useMemo(() => Object.entries(picks).reduce((s, [id, q]) => s + q * (products.find((p) => p.id === id)?.price || 0), 0), [picks, products])
  const total = Math.max(0, subtotal + (box?.base_price || 0))

  // What a full box can cost with today's menu, so the size choice isn't blind.
  const priceRange = (b) => {
    const prices = products.filter((p) => p.is_active !== false).map((p) => p.price)
    if (!prices.length) return ''
    const lo = Math.max(0, Math.min(...prices) * b.capacity + (b.base_price || 0))
    const hi = Math.max(0, Math.max(...prices) * b.capacity + (b.base_price || 0))
    return lo === hi ? money(lo) : `${money(lo)} – ${money(hi)}`
  }

  const add = (p) => { if (full) return; setPicks((s) => ({ ...s, [p.id]: (s[p.id] || 0) + 1 })) }
  const remove = (id) => setPicks((s) => { const n = (s[id] || 0) - 1; const c = { ...s }; if (n <= 0) delete c[id]; else c[id] = n; return c })

  const slots = useMemo(() => {
    const arr = []
    products.forEach((p) => { for (let i = 0; i < (picks[p.id] || 0); i++) arr.push({ key: `${p.id}-${i}`, id: p.id, tone: p.tone, filling: p.filling, image_url: p.image_url }) })
    return arr
  }, [picks, products])

  const addToBag = () => {
    const items = products.filter((p) => picks[p.id]).map((p) => ({ product_id: p.id, name: p.name, unit_price: p.price, quantity: picks[p.id], tone: p.tone, filling: p.filling, image_url: p.image_url }))
    cart.dispatch({ type: 'setBox', items, box })
    nav('/checkout')
  }

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-6 pt-20 md:pt-14 pb-16">
      <h1 className="font-display font-extrabold tracking-tight text-4xl md:text-6xl">Build your box</h1>
      <p className="mt-2 text-cocoa2 max-w-md">Pick a size, then tap cookies to fill it. Repeat a favorite as many times as you like.</p>

      {/* Step 1: size */}
      <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-2xl">
        {boxes.map((b) => (
          <motion.button key={b.id} whileTap={{ scale: 0.97 }} onClick={() => { setBox(b); setPicks({}) }}
            className={`text-left rounded-tile p-5 border-2 transition-colors ${box?.id === b.id ? 'border-raspberry bg-white' : 'border-transparent bg-oat hover:bg-oatdeep'}`}>
            <p className="font-display text-2xl font-extrabold">{b.title}</p>
            <p className="text-sm text-cocoa2 mt-1">{b.blurb || `${b.capacity} cookies`}</p>
            <p className="mt-3 text-sm font-semibold">{b.capacity} cookies{b.base_price < 0 ? ` · ${money(-b.base_price)} off` : b.base_price > 0 ? ` · +${money(b.base_price)} box` : ''}</p>
            {priceRange(b) && <p className="mt-1 text-sm text-cocoa2">{priceRange(b)}, depending on your mix</p>}
          </motion.button>
        ))}
      </div>

      {/* Step 2: the box itself */}
      <AnimatePresence>
        {box && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-8">
            <div className="rounded-hero bg-cocoa text-milk p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <p className="font-display text-xl sm:text-2xl font-bold">{filled} of {capacity} in the box</p>
                <p className="font-semibold">{money(total)}</p>
              </div>
              <div className="mt-3 h-2 rounded-chip bg-milk/15 overflow-hidden">
                <motion.div className="h-full bg-raspberry" initial={false} animate={{ width: `${(filled / capacity) * 100}%` }} transition={{ type: 'spring', stiffness: 160, damping: 22 }} />
              </div>
              <div className={`mt-5 grid gap-2 ${capacity > 6 ? 'grid-cols-6' : 'grid-cols-6 sm:grid-cols-6'}`}>
                {Array.from({ length: capacity }).map((_, i) => {
                  const s = slots[i]
                  return (
                    <div key={i} className="aspect-square rounded-tile bg-milk/10 grid place-items-center overflow-hidden">
                      <AnimatePresence mode="popLayout">
                        {s && (
                          <motion.button key={s.key} onClick={() => remove(s.id)} aria-label="Remove cookie"
                            initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 20 }}>
                            {s.image_url
                              ? <img src={s.image_url} alt="" className="w-[80%] h-[80%] object-contain" />
                              : <Cookie tone={s.tone} filling={s.filling} size={44} className="w-[80%] h-[80%]" />}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
              <p className="mt-3 text-xs text-milk/60">Tap a cookie in the box to take it out.</p>
            </div>

            {/* Step 3: cookies */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => {
                const n = picks[p.id] || 0
                const disabled = full
                return (
                  <motion.button key={p.id} whileTap={{ scale: disabled ? 1 : 0.95 }} onClick={() => add(p)} disabled={disabled && n === 0}
                    className={`relative text-left tile p-4 transition-colors ${n > 0 ? 'border-raspberry' : ''} ${disabled && n === 0 ? 'opacity-50' : 'hover:bg-white'}`}>
                    <div className="w-full aspect-square grid place-items-center">
                      {p.image_url ? <img src={p.image_url} alt="" className="max-h-full max-w-full object-contain" /> : <Cookie tone={p.tone} filling={p.filling} size={80} className="w-[65%] h-[65%]" />}
                    </div>
                    <p className="mt-3 font-semibold leading-tight text-sm sm:text-base">{p.name}</p>
                    <p className="text-xs text-cocoa2 mt-0.5">{money(p.price)}</p>
                    {n > 0 && <span className="absolute top-3 right-3 h-7 min-w-[1.75rem] px-2 rounded-chip bg-raspberry text-milk text-sm font-bold grid place-items-center">{n}</span>}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky action */}
      <AnimatePresence>
        {box && filled > 0 && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-24 md:bottom-6 inset-x-4 md:inset-x-auto md:right-6 z-30">
            <div className="glass-dark text-milk rounded-chip shadow-glass px-5 py-3 flex items-center gap-4 md:w-96">
              <div className="flex-1"><p className="text-sm font-semibold">{full ? 'Box is full' : `${capacity - filled} more to fill`}</p><p className="text-xs text-milk/70">{money(total)}</p></div>
              <button onClick={addToBag} disabled={!full} className="btn bg-raspberry text-milk px-5 py-2 text-sm">{full ? 'Checkout' : 'Keep filling'}</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
