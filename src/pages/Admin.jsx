import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DEMO } from '../lib/firebase'
import OrdersBoard from '../components/admin/OrdersBoard'
import Inventory from '../components/admin/Inventory'

export default function Admin() {
  const { user, loading, signInGoogle, signOut } = useAuth()
  const [tab, setTab] = useState('orders')
  if (loading) return null
  if (!user || user.isAnonymous) {
    return (
      <div className="mx-auto max-w-md px-5 pt-20 text-center">
        <h1 className="font-display text-3xl font-extrabold">Kitchen dashboard</h1>
        <p className="mt-2 text-cocoa2">Sign in with an admin account.</p>
        <button onClick={signInGoogle} className="btn-dark mt-6 w-full">{DEMO ? 'Enter as kitchen (demo)' : 'Continue with Google'}</button>
      </div>
    )
  }
  if (!user.isAdmin) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen bg-oat/40">
      <header className="glass sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display font-extrabold text-xl tracking-tight">Love Raíz<span className="text-raspberry">.</span> <span className="text-cocoa/50 font-body font-semibold text-sm">Kitchen</span></Link>
            <nav className="flex gap-1">
              {[['orders', 'Orders'], ['inventory', 'Inventory']].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`px-3 py-1.5 rounded-chip text-sm font-semibold ${tab === k ? 'bg-cocoa text-milk' : 'hover:bg-oat'}`}>{l}</button>
              ))}
            </nav>
          </div>
          <button onClick={signOut} className="text-sm font-semibold text-cocoa/60 hover:text-cocoa">Sign out</button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 md:px-6 py-6">
        {tab === 'orders' ? <OrdersBoard /> : <Inventory />}
      </main>
    </div>
  )
}
