import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { subscribeMyOrders } from '../lib/store'
import { statusLabel } from '../lib/mockData'
import { money, dateLabel } from '../lib/format'

export default function MyOrders() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState([])
  useEffect(() => { if (user && !user.isAnonymous) return subscribeMyOrders(user.uid, setOrders) }, [user])
  if (loading) return null
  if (!user || user.isAnonymous) return <Navigate to="/login" replace />
  return (
    <div className="mx-auto max-w-2xl px-5 pt-20 md:pt-14 pb-16">
      <h1 className="font-display font-extrabold tracking-tight text-4xl">Your orders</h1>
      {orders.length === 0 ? (
        <div className="mt-6 tile p-8 text-center"><p className="font-display text-xl font-bold">No orders yet</p><Link to="/build-a-box" className="btn-primary mt-4">Build your first box</Link></div>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.id}><Link to={`/order/${o.id}`} className="tile p-5 flex items-center justify-between gap-4 hover:bg-white transition-colors">
              <div><p className="font-semibold">{o.id} · {statusLabel(o)}</p><p className="text-sm text-cocoa2">{dateLabel(o.delivery_date)} · {o.delivery_slot} · {o.delivery_type}</p></div>
              <span className="font-display font-extrabold text-xl">{money(o.total_amount)}</span>
            </Link></li>
          ))}
        </ul>
      )}
    </div>
  )
}
