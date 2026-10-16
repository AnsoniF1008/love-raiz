// One-time seed: GOOGLE_APPLICATION_CREDENTIALS=./functions/serviceAccount.json node seed.js
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { MOCK_PRODUCTS, MOCK_BOXES } from './src/lib/mockData.js'
initializeApp({ credential: applicationDefault() })
const db = getFirestore()
const batch = db.batch()
MOCK_PRODUCTS.forEach(({ id, ...p }) => batch.set(db.collection('products').doc(id), { ...p, created_at: FieldValue.serverTimestamp() }))
MOCK_BOXES.forEach(({ id, ...b }) => batch.set(db.collection('boxes').doc(id), b))
await batch.commit()
console.log('seeded', MOCK_PRODUCTS.length, 'products and', MOCK_BOXES.length, 'boxes')
