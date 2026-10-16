import { useEffect, useState } from 'react'

/** Subscribe to a store listener that takes (cb) and returns an unsubscribe. */
export function useSubscription(subscribe, deps = []) {
  const [data, setData] = useState(null)
  useEffect(() => { setData(null); return subscribe(setData) }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  return { data: data ?? [], loading: data === null }
}
