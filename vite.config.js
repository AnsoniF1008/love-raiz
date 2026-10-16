import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => {
  const demo = mode === 'demo'
  return {
    base: process.env.VITE_BASE || '/',
    plugins: [react(), ...(demo ? [viteSingleFile()] : [])],
    define: demo ? { 'import.meta.env.VITE_DEMO': '"1"' } : {},
    build: {
      target: 'es2020',
      // The demo ships as a single file opened straight from disk, so the
      // vendored fonts have to be inlined rather than emitted alongside it.
      assetsInlineLimit: demo ? 100_000 : 4096,
    },
    // Prebuilt single-file demo artifacts also live in the project root; without
    // this the dep scanner crawls them as extra entries and fails to resolve.
    optimizeDeps: { entries: ['index.html'] },
    // The Census geocoder sends no CORS headers; in `npm run dev` this lets the
    // demo checkout price delivery from real distances (see functions/delivery.js).
    server: {
      proxy: {
        '/census-geocoder': {
          target: 'https://geocoding.geo.census.gov',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/census-geocoder/, '/geocoder'),
        },
      },
    },
  }
})
