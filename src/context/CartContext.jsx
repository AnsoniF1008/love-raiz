import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { subscribeProducts } from '../lib/store'
import { useSubscription } from '../hooks/useCollection'
import { money } from '../lib/format'
import { ORDERING } from '../../functions/delivery.js'

const CartCtx = createContext(null)
const STORAGE_KEY = 'lr-cart-v1'
// Everything is baked to order, so the only limit is a per-flavor sanity cap.
const MAX = ORDERING.maxPerItem
const EMPTY = { items: [], box: null, open: false, notice: null, changes: [] }

// The bag survives a reload or a round trip to Instagram. Storage can throw
// (private mode, blocked site data), so every access falls back to an empty bag.
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && Array.isArray(saved.items)) return { ...EMPTY, items: saved.items, box: saved.box || null }
  } catch { /* fall through */ }
  return EMPTY
}

// Adding a loose cookie or changing a quantity turns a box back into a plain
// bag, and the server only honours the box price for an exact box. Say so
// instead of letting the discount vanish.
const lostBox = (state) => (state.box && state.box.base_price < 0 ? state.box : null)

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { product, qty = 1 } = action
      const existing = state.items.find((i) => i.product_id === product.id)
      const items = existing
        ? state.items.map((i) => (i.product_id === product.id ? { ...i, quantity: Math.min(i.quantity + qty, MAX) } : i))
        : [...state.items, { product_id: product.id, name: product.name, unit_price: product.price, quantity: Math.min(qty, MAX), tone: product.tone, filling: product.filling, image_url: product.image_url }]
      return { ...state, items, box: null, notice: { id: Date.now(), kind: 'added', name: product.name, image_url: product.image_url, lostBox: lostBox(state) } }
    }
    case 'setBox': return { ...state, items: action.items, box: action.box, open: false, notice: null }
    case 'qty': return { ...state, items: state.items.map((i) => (i.product_id === action.id ? { ...i, quantity: Math.max(0, Math.min(action.quantity, MAX)) } : i)).filter((i) => i.quantity > 0), box: null }
    case 'remove': return { ...state, items: state.items.filter((i) => i.product_id !== action.id), box: null }
    case 'clear': return EMPTY
    case 'open': return { ...state, open: action.open, notice: action.open ? null : state.notice }
    // A saved bag can outlive a menu change. Bring it in line with the live menu
    // (removed flavors, new prices) and say what changed before payment.
    case 'sync': {
      const byId = Object.fromEntries(action.products.map((p) => [p.id, p]))
      const changes = []
      const items = state.items.flatMap((i) => {
        const p = byId[i.product_id]
        if (!p || p.is_active === false) { changes.push(`${i.name} is no longer on the menu and was removed.`); return [] }
        if (p.price !== i.unit_price) changes.push(`${p.name} is now ${money(p.price)} (was ${money(i.unit_price)}).`)
        const { stock, ...rest } = i // bags saved before made-to-order carried a stock cap
        return [{ ...rest, name: p.name, unit_price: p.price }]
      })
      if (!changes.length) return state
      const countChanged = items.reduce((a, i) => a + i.quantity, 0) !== state.items.reduce((a, i) => a + i.quantity, 0)
      return { ...state, items, box: countChanged ? null : state.box, changes: [...state.changes, ...changes] }
    }
    case 'ackChanges': return { ...state, changes: [] }
    case 'dismiss': return state.notice?.id === action.id ? { ...state, notice: null } : state
    default: return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const { data: products, loading } = useSubscription(subscribeProducts)

  useEffect(() => {
    if (!loading && products.length) dispatch({ type: 'sync', products })
  }, [products, loading])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items, box: state.box })) } catch { /* storage unavailable */ }
  }, [state.items, state.box])

  const value = useMemo(() => {
    const count = state.items.reduce((s, i) => s + i.quantity, 0)
    const subtotal = state.items.reduce((s, i) => s + i.quantity * i.unit_price, 0)
    const discount = state.box?.base_price || 0
    return { ...state, dispatch, count, subtotal, discount, total: Math.max(0, subtotal + discount) }
  }, [state])
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export const useCart = () => useContext(CartCtx)
