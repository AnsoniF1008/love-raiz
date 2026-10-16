import { createContext, useContext, useEffect, useState } from 'react'
import { onAuth, signInGoogle, signInGuest, signOutUser } from '../lib/store'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading
  useEffect(() => onAuth(setUser), [])
  return <AuthCtx.Provider value={{ user, loading: user === undefined, signInGoogle, signInGuest, signOut: signOutUser }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
