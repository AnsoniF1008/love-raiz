import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { subscribeProducts, upsertProduct, uploadProductImage, deleteProduct, seedStarterCatalog } from '../../lib/store'
import Cookie from '../Cookie'
import { money } from '../../lib/format'

const EMPTY = { name: '', description: '', price: 5, category: 'Cookies', is_active: true, image_url: '', instagram_url: '', tone: 'caramel', filling: 'none' }
const CATS = ['Cookies', 'Conchas', 'Seasonal']

export default function Inventory() {
  const [products, setProducts] = useState(null) // null = loading
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => subscribeProducts(setProducts, { includeInactive: true }), [])

  // Every write reports a failure (offline, signed out) instead of looking saved.
  const attempt = async (action) => {
    setBusy(true); setError('')
    try { await action(); return true }
    catch (e) { console.error(e); setError("That didn't save. Check your connection and try again."); return false }
    finally { setBusy(false) }
  }
  const save = async (e) => {
    e.preventDefault()
    if (await attempt(() => upsertProduct({ ...editing, price: Number(editing.price) }))) setEditing(null)
  }
  const remove = async () => {
    if (!window.confirm(`Delete "${editing.name}" for good? To hide it for now, pause it instead.`)) return
    if (await attempt(() => deleteProduct(editing.id))) setEditing(null)
  }
  const quick = (p, patch) => attempt(() => upsertProduct({ id: p.id, ...patch }))
  const set = (k) => (e) => setEditing((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const onFile = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    await attempt(async () => { const url = await uploadProductImage(f); setEditing((s) => ({ ...s, image_url: url })) })
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Inventory</h1>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary text-sm">Add a cookie</button>
      </div>

      {error && !editing && <p role="alert" className="mt-4 rounded-tile bg-raspberry/10 px-4 py-3 text-sm font-semibold text-raspberry2">{error}</p>}

      {products?.length === 0 && (
        <div className="mt-5 tile p-8 text-center">
          <p className="font-display text-2xl font-bold">The menu is empty</p>
          <p className="mt-2 text-cocoa2">Start with the Love Raíz menu (9 cookies and conchas, plus the 6 and 12 boxes) and edit from there, or add your cookies one by one.</p>
          <button onClick={() => attempt(seedStarterCatalog)} disabled={busy} className="btn-primary mt-5">{busy ? 'Loading the menu…' : 'Load the starter menu'}</button>
        </div>
      )}

      <ul className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(products || []).map((p) => (
          <li key={p.id} className={`tile p-4 flex gap-3 ${p.is_active ? '' : 'opacity-60'}`}>
            <div className="w-16 h-16 grid place-items-center shrink-0">
              {p.image_url ? <img src={p.image_url} alt="" className="max-h-full max-w-full object-contain" /> : <Cookie tone={p.tone} filling={p.filling} size={52} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold leading-tight">{p.name}</p>
                <button onClick={() => setEditing({ ...p })} className="text-xs font-semibold underline shrink-0">Edit</button>
              </div>
              <p className="text-xs text-cocoa2">{p.category} · {money(p.price)}</p>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => quick(p, { is_active: !p.is_active })} className={`text-xs font-semibold px-2.5 py-1.5 rounded-chip ${p.is_active ? 'bg-cocoa text-milk' : 'bg-oat'}`}>{p.is_active ? 'On the menu' : 'Paused'}</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {editing && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditing(null)} className="fixed inset-0 z-40 bg-cocoa/40 backdrop-blur-sm" />
            <motion.form onSubmit={save} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="fixed z-50 inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[520px] glass rounded-t-hero md:rounded-hero p-6 space-y-3 max-h-[92vh] overflow-y-auto">
              <h2 className="font-display text-2xl font-extrabold">{editing.id ? 'Edit cookie' : 'New cookie'}</h2>
              <input required className="input" placeholder="Name" value={editing.name} onChange={set('name')} />
              <textarea className="input" rows={2} placeholder="Description" value={editing.description} onChange={set('description')} />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.25" min="0" className="input" placeholder="Price" value={editing.price} onChange={set('price')} />
                <select className="input" value={editing.category} onChange={set('category')}>{CATS.map((c) => <option key={c}>{c}</option>)}</select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Illustration tone<select className="input mt-1" value={editing.tone} onChange={set('tone')}>{['caramel', 'raspberry', 'cocoa', 'pistachio', 'oat'].map((t) => <option key={t}>{t}</option>)}</select></label>
                <label className="text-sm">Filling<select className="input mt-1" value={editing.filling} onChange={set('filling')}>{['none', 'nutella', 'dulce', 'guava', 'biscoff'].map((t) => <option key={t}>{t}</option>)}</select></label>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-tile bg-oat overflow-hidden grid place-items-center">{editing.image_url ? <img src={editing.image_url} alt="" className="w-full h-full object-cover" /> : <Cookie tone={editing.tone} filling={editing.filling} size={52} />}</div>
                <label className="btn-ghost text-sm cursor-pointer">Upload photo<input type="file" accept="image/*" className="sr-only" onChange={onFile} /></label>
                <p className="text-xs text-cocoa2">Square photos work best. A cut-out PNG keeps its transparent background.</p>
              </div>
              <label className="text-sm">Instagram post
                <input className="input mt-1" placeholder="https://www.instagram.com/p/…" value={editing.instagram_url || ''} onChange={set('instagram_url')} />
              </label>
              <p className="text-xs text-cocoa2 -mt-2">Optional. Instagram → Share → Copy link. That bake then embeds on the shop.</p>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={editing.is_active} onChange={set('is_active')} className="w-4 h-4 accent-raspberry" />Show on the menu</label>
              {error && <p role="alert" className="rounded-tile bg-raspberry/10 px-4 py-3 text-sm font-semibold text-raspberry2">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={busy} className="btn-primary flex-1">{busy ? 'Saving…' : 'Save cookie'}</button>
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
              </div>
              {editing.id && <button type="button" onClick={remove} disabled={busy} className="text-sm font-semibold text-raspberry2 underline underline-offset-4">Delete this cookie</button>}
            </motion.form>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
