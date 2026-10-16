import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, signInGoogle, signOut } = useAuth()
  const nav = useNavigate()
  return (
    <div className="mx-auto max-w-md px-5 pt-24 pb-16 text-center">
      <h1 className="font-display font-extrabold tracking-tight text-4xl">{user && !user.isAnonymous ? `Hi, ${user.name?.split(' ')[0] || 'there'}` : 'Sign in'}</h1>
      <p className="mt-2 text-cocoa2">See all your orders in one place and follow each one live, from the oven to your door.</p>
      {user && !user.isAnonymous ? (
        <div className="mt-6 flex flex-col gap-3">
          <button onClick={() => nav('/orders')} className="btn-primary">My orders</button>
          {user.isAdmin && <button onClick={() => nav('/admin')} className="btn-dark">Open the kitchen dashboard</button>}
          <button onClick={signOut} className="btn-ghost">Sign out</button>
        </div>
      ) : (
        <button onClick={async () => { await signInGoogle(); nav('/orders') }} className="btn-dark mt-6 w-full">Continue with Google</button>
      )}
    </div>
  )
}
