import { BrowserRouter, HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { CartProvider } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DEMO } from './lib/firebase'
import Nav from './components/Nav'
import CartDrawer from './components/CartDrawer'
import BagNotice from './components/BagNotice'
import Footer from './components/Footer'
import Home from './pages/Home'
import BuildBox from './pages/BuildBox'
import Checkout from './pages/Checkout'
import OrderStatus from './pages/OrderStatus'
import Login from './pages/Login'
import MyOrders from './pages/MyOrders'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import Policies from './pages/Policies'

// The braces matter: a concise arrow body would return scrollTo's value, which
// React then treats as the effect's cleanup function and throws on.
function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0) }, [pathname]); return null }

const Router = DEMO ? HashRouter : BrowserRouter

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/build-a-box" element={<BuildBox />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderStatus />} />
            <Route path="/login" element={<Login />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          <BagNotice />
          <CartDrawer />
          {DEMO && <DemoBadge />}
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

function DemoBadge() {
  const { pathname } = useLocation()
  const { signInGoogle } = useAuth()
  const nav = useNavigate()
  if (pathname.startsWith('/admin')) {
    return (
      <a href="#/" className="fixed top-3 right-3 z-50 rounded-chip bg-caramel text-cocoa text-xs font-bold px-3 py-1.5 shadow-lift">
        Back to shop
      </a>
    )
  }
  return (
    <button
      type="button"
      onClick={async () => { await signInGoogle(); nav('/admin') }}
      className="fixed top-3 md:top-20 right-3 z-50 rounded-chip bg-caramel text-cocoa text-xs font-bold px-3 py-1.5 shadow-lift"
    >
      Demo · open admin
    </button>
  )
}
