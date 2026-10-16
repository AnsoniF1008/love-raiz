/**
 * Firebase SDK init.
 *
 * Nothing from the `firebase/*` packages is imported at module scope on purpose:
 * a static import here would pull the whole SDK into the main chunk and defeat
 * the dynamic imports in store.js. Everything loads inside ensureFirebase(),
 * which store.js awaits before touching any of the instances below.
 */
const env = import.meta.env

/** Demo mode: no Firebase credentials configured, or built as the standalone preview bundle. */
export const DEMO = env.VITE_DEMO === '1' || !env.VITE_FIREBASE_API_KEY

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Reassigned by ensureFirebase(); importers see the live values.
export let app = null
export let db = null
export let auth = null
export let storage = null
export let functions = null

let pending = null

/** Initialises the SDK once. Resolves immediately (and does nothing) in demo mode. */
export function ensureFirebase() {
  if (DEMO) return Promise.resolve()
  if (pending) return pending
  pending = (async () => {
    const [
      { initializeApp, getApps },
      { getFirestore },
      { getAuth },
      { getStorage },
      { getFunctions },
    ] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore'),
      import('firebase/auth'),
      import('firebase/storage'),
      import('firebase/functions'),
    ])

    app = getApps()[0] || initializeApp(config)
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
    functions = getFunctions(app, env.VITE_FUNCTIONS_REGION || 'us-central1')

    if (typeof window !== 'undefined') {
      // App Check protects the callables from being invoked outside the app.
      // Only enabled once a reCAPTCHA v3 site key is configured.
      if (env.VITE_RECAPTCHA_SITE_KEY) {
        import('firebase/app-check')
          .then(({ initializeAppCheck, ReCaptchaV3Provider }) =>
            initializeAppCheck(app, {
              provider: new ReCaptchaV3Provider(env.VITE_RECAPTCHA_SITE_KEY),
              isTokenAutoRefreshEnabled: true,
            })
          )
          .catch((e) => console.error('App Check init failed', e))
      }
      import('firebase/analytics')
        .then(({ getAnalytics, isSupported }) => isSupported().then((ok) => ok && getAnalytics(app)))
        .catch(() => {})
      import('firebase/performance')
        .then(({ getPerformance }) => getPerformance(app))
        .catch(() => {})
    }
  })()
  return pending
}
