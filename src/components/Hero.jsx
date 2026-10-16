import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Cookie from './Cookie'
import { money } from '../lib/format'
import { MOCK_PRODUCTS } from '../lib/mockData'
import { useCart } from '../context/CartContext'

const STAGE = {
  raspberry: { bg: '#F3C4C0', bloom: '#E3405E', ink: '#2B1911' },
  caramel: { bg: '#F0D4A4', bloom: '#C27A2C', ink: '#2B1911' },
  pistachio: { bg: '#D5DBA4', bloom: '#7A8240', ink: '#2B1911' },
  cocoa: { bg: '#3A2418', bloom: '#8A5A3C', ink: '#FFFCF7' },
  oat: { bg: '#E8D3AE', bloom: '#B8925A', ink: '#2B1911' },
}

const ease = [0.16, 1, 0.3, 1]
const swipe = 72

function flavorTitle(name) {
  const cleaned = name.replace(/\s*Stuffed\s*$/i, '')
  const [lead, rest] = cleaned.split(/\s*&\s*/)
  return { lead, rest: rest || '' }
}

function slidesFrom(products) {
  const src = (products?.length ? products : MOCK_PRODUCTS).filter((p) => p.is_active && p.stock > 0)
  const stuffed = src.filter((p) => p.filling && p.filling !== 'none')
  const rest = src.filter((p) => !p.filling || p.filling === 'none')
  return [...stuffed, ...rest].slice(0, 6)
}

const cookieEnter = (dir, reduced) => reduced
  ? { opacity: 0, scale: 0.96 }
  : { x: dir * 340, rotate: dir * 26, scale: 0.72, opacity: 0, filter: 'blur(10px)' }

const cookieCenter = (reduced) => reduced
  ? { opacity: 1, scale: 1 }
  : { x: 0, rotate: 0, scale: 1, opacity: 1, filter: 'blur(0px)' }

const cookieExit = (dir, reduced) => reduced
  ? { opacity: 0, scale: 0.96 }
  : { x: dir * -340, rotate: dir * -22, scale: 0.78, opacity: 0, filter: 'blur(10px)' }

export default function Hero({ products = [] }) {
  const slides = useMemo(() => slidesFrom(products), [products])
  const cart = useCart()
  const reduce = useReducedMotion()
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState(1)
  const [split, setSplit] = useState(false)
  const [paused, setPaused] = useState(false)
  const [offscreen, setOffscreen] = useState(false)
  const stage = useRef(null)
  const wrap = (n) => ((n % slides.length) + slides.length) % slides.length

  const go = (next) => {
    if (!slides.length || next === page) return
    setDir(next > page || (page === slides.length - 1 && next === 0) ? 1 : -1)
    if (page === 0 && next === slides.length - 1) setDir(-1)
    setSplit(false)
    setPage(wrap(next))
  }
  const paginate = (step) => go(wrap(page + step))

  const flavor = slides[page] || MOCK_PRODUCTS[0]
  const stageTone = STAGE[flavor?.tone] || STAGE.caramel
  const { lead, rest } = flavorTitle(flavor?.name || '')
  const inBag = cart.items.find((i) => i.product_id === flavor?.id)?.quantity || 0

  useEffect(() => {
    const t = setTimeout(() => setSplit(true), reduce ? 0 : 420)
    return () => clearTimeout(t)
  }, [page, reduce])

  useEffect(() => {
    if (paused || offscreen || reduce || slides.length < 2) return
    const t = setInterval(() => paginate(1), 4800)
    return () => clearInterval(t)
  }, [page, paused, offscreen, reduce, slides.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = stage.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') paginate(1)
      if (e.key === 'ArrowLeft') paginate(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [page, slides.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const onDragEnd = (_, info) => {
    if (info.offset.x < -swipe || info.velocity.x < -500) paginate(1)
    else if (info.offset.x > swipe || info.velocity.x > 500) paginate(-1)
  }

  if (!flavor) return null

  const dark = stageTone.ink === '#FFFCF7'

  return (
    <section
      ref={stage}
      aria-roledescription="carousel"
      aria-label="Cookie flavors"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative isolate overflow-hidden min-h-[100svh] md:min-h-[calc(100svh-4rem)]"
    >
      <motion.div
        className="absolute inset-0 -z-20"
        initial={false}
        animate={{ backgroundColor: stageTone.bg }}
        transition={{ duration: reduce ? 0.01 : 0.7, ease }}
      />
      <motion.div
        key={`bloom-${flavor.id}`}
        className="pointer-events-none absolute left-1/2 top-[38%] md:left-[62%] md:top-1/2 -z-10 h-[70vw] max-h-[34rem] w-[70vw] max-w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: stageTone.bloom }}
        initial={reduce ? { opacity: 0.22, scale: 1 } : { opacity: 0, scale: 0.35 }}
        animate={{ opacity: 0.28, scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 70, damping: 16 }}
      />

      <div className="relative mx-auto grid max-w-6xl min-h-[100svh] md:min-h-[calc(100svh-4rem)] grid-cols-1 md:grid-cols-12 items-end md:items-center gap-2 px-5 md:px-6 pt-16 pb-32 md:py-10">
        <div className="md:col-span-6 relative z-10 pb-2 md:pb-0">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={flavor.id}
              custom={dir}
              initial={reduce ? { opacity: 0 } : { y: 36, opacity: 0, filter: 'blur(8px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={reduce ? { opacity: 0 } : { y: -28, opacity: 0, filter: 'blur(8px)' }}
              transition={{ duration: reduce ? 0.15 : 0.55, ease }}
            >
              <h1 className="font-display font-extrabold leading-[0.9] tracking-tight text-[14vw] sm:text-6xl md:text-7xl lg:text-[5.35rem]" style={{ color: stageTone.ink }}>
                {lead}{rest ? <><br /><span className="opacity-80">& {rest}</span></> : null}
              </h1>
              <p className="mt-4 max-w-md text-base md:text-lg" style={{ color: stageTone.ink, opacity: 0.72 }}>{flavor.description}</p>
              <p className="mt-5 font-display font-extrabold text-3xl md:text-4xl" style={{ color: stageTone.ink }}>{money(flavor.price)}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {inBag > 0 ? (
                  <div className={`inline-flex items-center rounded-chip ${dark ? 'bg-milk text-cocoa' : 'bg-cocoa text-milk'}`}>
                    <button type="button" onClick={() => cart.dispatch({ type: 'qty', id: flavor.id, quantity: inBag - 1 })} className="px-4 py-3 text-lg leading-none" aria-label="Remove one">−</button>
                    <span className="min-w-[1.5rem] text-center font-bold">{inBag}</span>
                    <button type="button" onClick={() => cart.dispatch({ type: 'add', product: flavor })} className="px-4 py-3 text-lg leading-none" aria-label="Add one">+</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => cart.dispatch({ type: 'add', product: flavor })} className={dark ? 'btn bg-milk text-cocoa hover:bg-oat px-6 py-3' : 'btn-dark'}>
                    Add to bag
                  </button>
                )}
                <Link to="/build-a-box" className={dark ? 'btn border border-milk/40 text-milk px-6 py-3' : 'btn-ghost'}>Build a box</Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="md:col-span-6 relative flex items-center justify-center min-h-[52vw] md:min-h-[28rem] order-first md:order-none">
          <AnimatePresence custom={dir} initial={false}>
            <motion.div
              key={flavor.id}
              custom={dir}
              initial={cookieEnter(dir, reduce)}
              animate={cookieCenter(reduce)}
              exit={cookieExit(dir, reduce)}
              transition={{ type: 'spring', stiffness: 70, damping: 14, mass: 1.05 }}
              drag={reduce ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragStart={() => setPaused(true)}
              onDragEnd={onDragEnd}
              onClick={() => setSplit((s) => !s)}
              className="absolute inset-0 cursor-grab active:cursor-grabbing touch-pan-y grid place-items-center"
              aria-label={`${flavor.name}. Swipe to change flavor, tap to open.`}
              role="img"
            >
              <Cookie tone={flavor.tone || 'caramel'} filling={flavor.filling || 'none'} size={420} split={split} className="w-[78%] max-w-[28rem] h-auto pointer-events-none" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="md:col-span-12 flex items-center justify-between gap-3 pt-2 md:pt-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1" role="tablist" aria-label="Flavors">
            {slides.map((p, i) => {
              const on = i === page
              const tone = STAGE[p.tone] || STAGE.caramel
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-label={p.name}
                  onClick={() => go(i)}
                  className="relative shrink-0 grid place-items-center rounded-full transition-transform active:scale-95"
                  style={{ width: on ? 64 : 52, height: on ? 64 : 52 }}
                >
                  {on && (
                    <motion.span
                      layoutId="flavor-ring"
                      className="absolute inset-0 rounded-full border-2"
                      style={{ borderColor: tone.bloom }}
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    />
                  )}
                  <span className="grid place-items-center rounded-full bg-white/50" style={{ width: on ? 54 : 44, height: on ? 54 : 44 }}>
                    <Cookie tone={p.tone || 'caramel'} filling={p.filling || 'none'} size={40} className="w-[78%] h-[78%]" />
                  </span>
                </button>
              )
            })}
          </div>
          <div className="hidden sm:flex gap-2">
            <button type="button" onClick={() => paginate(-1)} className="grid h-11 w-11 place-items-center rounded-full border" style={{ borderColor: `${stageTone.ink}33`, color: stageTone.ink }} aria-label="Previous flavor">
              <Arrow dir="left" />
            </button>
            <button type="button" onClick={() => paginate(1)} className="grid h-11 w-11 place-items-center rounded-full border" style={{ borderColor: `${stageTone.ink}33`, color: stageTone.ink }} aria-label="Next flavor">
              <Arrow dir="right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Arrow({ dir }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'left' ? <path d="M15 6 9 12l6 6" /> : <path d="M9 6l6 6-6 6" />}
    </svg>
  )
}
