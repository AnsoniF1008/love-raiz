import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { money } from '../lib/format'

// Confirms an add without covering the page, so browsing isn't interrupted.
export default function BagNotice() {
  const { notice, count, dispatch } = useCart()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => dispatch({ type: 'dismiss', id: notice.id }), notice.lostBox ? 7000 : 3500)
    return () => clearTimeout(t)
  }, [notice, dispatch])

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex justify-center md:inset-x-auto md:bottom-auto md:right-6 md:top-20">
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="pointer-events-auto w-full max-w-sm rounded-tile bg-cocoa text-milk shadow-lift"
          >
            <div className="flex items-center gap-3 p-3">
              {notice.image_url && (
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-tile bg-milk/10">
                  <img src={notice.image_url} alt="" className="h-[86%] w-[86%] object-contain" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Added {notice.name}</p>
                <p className="text-xs text-milk/70">{count} {count === 1 ? 'cookie' : 'cookies'} in your bag</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'open', open: true })}
                className="btn shrink-0 bg-milk px-4 py-2 text-sm text-cocoa hover:bg-oat"
              >
                View bag
              </button>
            </div>
            {notice.lostBox && (
              <p className="border-t border-milk/15 px-4 py-2.5 text-xs text-milk/80">
                Your {notice.lostBox.title} is now a mixed bag, so its {money(-notice.lostBox.base_price)} box discount no longer applies.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
