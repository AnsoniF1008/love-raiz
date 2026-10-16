// Usage: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/setAdmin.js owner@gmail.com
import { initializeApp, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
initializeApp({ credential: applicationDefault() })
const email = process.argv[2]
if (!email) { console.error('Pass an email'); process.exit(1) }
const user = await getAuth().getUserByEmail(email)
await getAuth().setCustomUserClaims(user.uid, { admin: true })
console.log(`admin claim set for ${email} (${user.uid}). User must sign out and back in.`)
