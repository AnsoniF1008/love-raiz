import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { money } from '../lib/format'
import Cookie from './Cookie'
import BagChanges from './BagChanges'
import { ORDERING } from '../../functions/delivery.js'

export default function CartDrawer() {
  const cart = useCart()
  const nav = useNavigate()
  const close = () => cart.dispatch({ type: 'open', open: false })

  return (
    <AnimatePresence>
      {cart.open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 z-50 bg-cocoa/40 backdrop-blur-sm" />
          <motion.aside role="dialog" aria-label="Your bag"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-50 bottom-0 inset-x-0 md:inset-y-0 md:left-auto md:right-0 md:w-[420px] md:bottom-auto max-h-[88vh] md:max-h-none md:h-full glass rounded-t-hero md:rounded-none flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="font-display text-2xl font-extrabold tracking-tight">Your bag</h2>
              <button onClick={close} className="rounded-chip bg-oat px-4 py-2 text-sm font-semibold">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-4">
              <BagChanges className="mb-4" />
              {cart.items.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-display text-xl font-bold">Your bag is empty</p>
                  <p className="mt-1 text-cocoa2 text-sm">Add cookies from the menu or build a box.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {cart.box && (
                    <li className="rounded-tile bg-oat px-4 py-3">
                      <p className="text-sm font-semibold">{cart.box.title} · {cart.box.capacity} cookies{cart.discount < 0 ? ` · ${money(-cart.discount)} off` : ''}</p>
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => { close(); nav('/build-a-box') }} className="btn bg-cocoa px-4 py-1.5 text-xs text-milk hover:bg-cocoa2">Edit box</button>
                        <button type="button" onClick={() => cart.dispatch({ type: 'clear' })} className="btn bg-milk px-4 py-1.5 text-xs text-cocoa hover:bg-white">Remove box</button>
                      </div>
                    </li>
                  )}
                  {cart.items.map((i) => (
                    <motion.li layout key={i.product_id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-tile bg-oat grid place-items-center shrink-0 overflow-hidden">
                        {i.image_url
                          ? <img src={i.image_url} alt="" className="h-[86%] w-[86%] object-contain" />
                          : <Cookie tone={i.tone} filling={i.filling} size={40} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{i.name}</p>
                        <p className="text-sm text-cocoa2">{money(i.unit_price)} each</p>
                      </div>
                      {cart.box ? (
                        <span className="text-sm font-bold">× {i.quantity}</span>
                      ) : (
                        <div className="inline-flex items-center rounded-chip bg-white border border-cocoa/10">
                          <button onClick={() => cart.dispatch({ type: 'qty', id: i.product_id, quantity: i.quantity - 1 })} className="px-3 py-1.5" aria-label={`Remove one ${i.name}`}>−</button>
                          <span className="min-w-[1.25rem] text-center font-bold text-sm">{i.quantity}</span>
                          <button onClick={() => cart.dispatch({ type: 'qty', id: i.product_id, quantity: i.quantity + 1 })} disabled={i.quantity >= ORDERING.maxPerItem} className="px-3 py-1.5 disabled:opacity-40" aria-label={`Add one ${i.name}`}>+</button>
                        </div>
                      )}
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
            {cart.items.length > 0 && (
              <div className="px-6 pb-6 pt-3 border-t border-cocoa/10" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
                <div className="flex justify-between text-sm text-cocoa2"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
                {cart.discount < 0 && <div className="flex justify-between text-sm text-raspberry"><span>Box discount</span><span>{money(cart.discount)}</span></div>}
                <div className="mt-1 flex justify-between font-display text-xl font-extrabold"><span>Total</span><span>{money(cart.total)}</span></div>
                <button onClick={() => { close(); nav('/checkout') }} className="btn-primary w-full mt-4">Checkout</button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
