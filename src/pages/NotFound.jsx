import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 pt-24 pb-16 text-center">
      <h1 className="font-display font-extrabold tracking-tight text-4xl">This page crumbled</h1>
      <p className="mt-2 text-cocoa2">The link may be old or mistyped. The cookies are still here.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">See the menu</Link>
        <Link to="/build-a-box" className="btn-ghost">Build a box</Link>
      </div>
    </div>
  )
}
