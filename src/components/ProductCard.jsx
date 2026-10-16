import { motion } from 'framer-motion'
import Cookie from './Cookie'
import { money } from '../lib/format'
import { useCart } from '../context/CartContext'
import { ORDERING } from '../../functions/delivery.js'

export default function ProductCard({ product, featured = false }) {
  const { dispatch, items } = useCart()
  const inBag = items.find((i) => i.product_id === product.id)?.quantity || 0

  return (
    <motion.article layout className={`tile flex h-full flex-col ${featured ? 'p-4 sm:p-6' : 'p-3 sm:p-4'}`}>
      <div className={`grid place-items-center w-full shrink-0 ${featured ? 'aspect-[5/4] sm:aspect-[5/4]' : 'aspect-square'}`}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} loading="lazy" className="max-h-full max-w-full object-contain" />
          : <Cookie tone={product.tone || 'caramel'} filling={product.filling || 'none'} size={featured ? 180 : 96} className="h-[80%] w-auto" />}
      </div>
      <div className="mt-3 min-w-0 flex-1">
        {/* Half-width cards on phones stack name over price so neither gets squeezed. */}
        <div className={`flex gap-x-3 gap-y-0.5 ${featured ? 'items-start justify-between' : 'flex-col sm:flex-row sm:items-start sm:justify-between'}`}>
          <h3 className={`font-display font-bold tracking-tight leading-tight ${featured ? 'text-2xl sm:text-3xl' : 'text-base sm:text-lg'}`}>{product.name}</h3>
          <span className={`shrink-0 font-semibold ${featured ? '' : 'text-sm sm:text-base'}`}>{money(product.price)}</span>
        </div>
        <p className={`mt-1 text-cocoa2 ${featured ? 'text-base' : 'hidden sm:block text-sm'}`}>{product.description}</p>
      </div>
      <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3">
        <span className="hidden sm:inline text-xs font-semibold text-cocoa/50">{product.category}</span>
        {inBag > 0 ? (
          <div className={`inline-flex items-center justify-between rounded-chip bg-cocoa text-milk ${featured ? '' : 'w-full sm:w-auto'}`}>
            <button onClick={() => dispatch({ type: 'qty', id: product.id, quantity: inBag - 1 })} className="px-3 py-2 text-lg leading-none" aria-label={`Remove one ${product.name}`}>−</button>
            <motion.span key={inBag} initial={{ y: 4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="min-w-[1.5rem] text-center font-bold">{inBag}</motion.span>
            <button onClick={() => dispatch({ type: 'add', product })} disabled={inBag >= ORDERING.maxPerItem} className="px-3 py-2 text-lg leading-none disabled:opacity-40" aria-label={`Add one ${product.name}`}>+</button>
          </div>
        ) : (
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => dispatch({ type: 'add', product })} className={`btn-dark px-5 py-2 text-sm whitespace-nowrap ${featured ? '' : 'w-full sm:w-auto'}`}>Add to bag</motion.button>
        )}
      </div>
    </motion.article>
  )
}
