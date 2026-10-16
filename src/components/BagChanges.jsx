import { useCart } from '../context/CartContext'

// Lists what the live menu changed in a saved bag (sold out, fewer left, new price).
export default function BagChanges({ className = '' }) {
  const { changes, dispatch } = useCart()
  if (!changes.length) return null
  return (
    <div role="status" className={`rounded-tile bg-caramel/25 px-4 py-3 text-sm ${className}`}>
      <p className="font-semibold">Your bag was updated with today's menu</p>
      <ul className="mt-1 space-y-0.5 text-cocoa2">
        {changes.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
      <button type="button" onClick={() => dispatch({ type: 'ackChanges' })} className="mt-2 text-xs font-semibold underline underline-offset-4 decoration-cocoa/30 hover:decoration-cocoa">Got it</button>
    </div>
  )
}
