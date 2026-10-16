import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ProductCard from './ProductCard'
import { cutoffLabel } from '../../functions/delivery.js'

const CATS = ['All', 'Cookies', 'Conchas', 'Seasonal']

export default function BentoCatalog({ products, loading }) {
  const [cat, setCat] = useState('All')
  const list = useMemo(() => products.filter((p) => cat === 'All' || p.category === cat), [products, cat])
  const [featured, ...rest] = list

  return (
    <section id="menu" className="mx-auto max-w-6xl px-5 md:px-6 py-8 md:py-12 scroll-mt-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold tracking-tight text-3xl md:text-5xl">The menu</h2>
          <p className="mt-2 max-w-md text-sm text-cocoa2 md:text-base">Every cookie is baked to order. Order by {cutoffLabel()} and we deliver tomorrow, or on the day you choose.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-chip px-4 py-2 text-sm font-semibold transition-colors ${cat === c ? 'bg-cocoa text-milk' : 'bg-oat hover:bg-oatdeep'}`}>{c}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className={`tile animate-pulse h-40 ${i === 0 ? 'lg:col-span-2 lg:row-span-2 h-full' : ''}`} />)}
        </div>
      ) : list.length === 0 ? (
        <div className="mt-6 tile p-10 text-center">
          <p className="font-display text-2xl font-bold">Nothing in this category yet</p>
          <p className="mt-2 text-cocoa2">Try another category, or message us on WhatsApp for a custom order.</p>
        </div>
      ) : (
        <motion.div layout className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {featured && (
              <motion.div key={featured.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-2">
                <ProductCard product={featured} featured />
              </motion.div>
            )}
            {rest.map((p) => (
              <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
            <motion.div key="cta" layout className="col-span-2 lg:col-span-1 rounded-tile bg-raspberry text-milk p-5 sm:p-6 flex flex-col justify-between min-h-[8rem] sm:min-h-[10rem]">
              <p className="font-display text-2xl font-bold leading-tight">Can't decide? Mix a box.</p>
              <Link to="/build-a-box" className="mt-4 self-start btn bg-milk text-raspberry2 px-5 py-2 text-sm">Build a box</Link>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}
