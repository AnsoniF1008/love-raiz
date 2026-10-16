import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { INSTAGRAM_URL } from '../lib/instagram'
import { IconInstagram } from './InstagramFeed'
import logo from '../assets/brand/logo.png'

const IconBag = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>)
const IconHome = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/></svg>)
const IconBox = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l9-4 9 4-9 4-9-4Z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/></svg>)
const IconUser = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>)

export default function Nav() {
  const { count, dispatch } = useCart()
  const { user } = useAuth()
  const { pathname } = useLocation()
  if (pathname.startsWith('/admin')) return null

  const items = [
    { to: '/', label: 'Shop', icon: <IconHome />, end: true },
    { to: '/build-a-box', label: 'Build a box', icon: <IconBox /> },
    { to: user && !user.isAnonymous ? '/orders' : '/login', label: user && !user.isAnonymous ? 'Orders' : 'Sign in', icon: <IconUser /> },
  ]

  const CartButton = ({ mobile }) => (
    <button onClick={() => dispatch({ type: 'open', open: true })} className={`relative flex ${mobile ? 'flex-col items-center gap-0.5 px-3 py-1' : 'items-center gap-2 rounded-chip bg-cocoa text-milk px-4 py-2'}`} aria-label={`Open bag, ${count} items`}>
      <IconBag />
      <span className="text-[11px] md:text-sm font-semibold">{mobile ? 'Bag' : 'Bag'}</span>
      {count > 0 && (
        <motion.span key={count} initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className={`absolute ${mobile ? '-top-1 right-1' : '-top-2 -right-2'} min-w-[20px] h-5 px-1.5 rounded-chip bg-raspberry text-milk text-[11px] font-bold grid place-items-center`}>{count}</motion.span>
      )}
    </button>
  )

  return (
    <>
      {/* Desktop: top glass bar */}
      <header className="hidden md:block sticky top-0 z-40">
        <div className="glass">
          <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
            <Link to="/" aria-label="Love Raíz, home"><img src={logo} alt="Love Raíz" className="h-10 w-auto" /></Link>
            <nav className="flex items-center gap-1">
              {items.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `px-4 py-2 rounded-chip text-sm font-semibold transition-colors ${isActive ? 'bg-oat' : 'hover:bg-oat/60'}`}>{it.label}</NavLink>
              ))}
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Love Raíz on Instagram" className="ml-1 grid h-10 w-10 place-items-center rounded-chip text-cocoa hover:bg-oat/60">
                <IconInstagram size={20} />
              </a>
              <div className="ml-2"><CartButton /></div>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile: mark floats over the flavor stage so it shares the slide color */}
      <div className="md:hidden fixed top-4 left-5 z-50 rounded-chip bg-milk/85 px-2.5 py-1.5 backdrop-blur-sm">
        <Link to="/" aria-label="Love Raíz, home"><img src={logo} alt="Love Raíz" className="h-9 w-auto" /></Link>
      </div>

      {/* Mobile: floating glass pill at the bottom, thumb reach */}
      <nav className="md:hidden fixed bottom-4 inset-x-4 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="glass rounded-chip shadow-glass flex items-center justify-around py-2">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `flex flex-col items-center gap-0.5 px-3 py-1 rounded-tile ${isActive ? 'text-raspberry' : 'text-cocoa/70'}`}>
              {it.icon}<span className="text-[11px] font-semibold">{it.label}</span>
            </NavLink>
          ))}
          <CartButton mobile />
        </div>
      </nav>
    </>
  )
}
