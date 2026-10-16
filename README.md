# Love Raíz — Cookie E-commerce (React + Firebase)

Mobile-first storefront for **@love.raiz** with a Build-Your-Own-Box flow, guest checkout, Stripe payments processed in Cloud Functions, WhatsApp/email confirmations and a real-time kitchen dashboard.

## Stack
- React 18 + Vite + Tailwind CSS + Framer Motion
- Firebase Hosting · Firestore · Auth (Google + Anonymous) · Storage · Cloud Functions v2 (Node 20) · Analytics · Performance
- Stripe Payment Element (client) + PaymentIntents & webhooks (server)

## Run locally (demo mode, no Firebase needed)
```bash
npm install
npm run dev          # opens with in-memory demo data
```
Any build without `VITE_FIREBASE_API_KEY` runs in demo mode. Visit `/admin` and "Continue with Google" to see the dashboard with the demo admin.

`npm run build:demo` produces `demo-dist/index.html`, a single self-contained file you can email or open from disk: no Firebase, no Stripe and no font requests are in it.

Fonts are vendored, not fetched from Google. `npm run fonts` re-downloads Bricolage Grotesque and Manrope into `src/assets/fonts` and regenerates `src/fonts.css`; both are variable fonts, so one woff2 per family and subset covers every weight.

## Go live
1. `firebase login && firebase use --add` (pick your project)
2. Copy `.env.example` → `.env` and fill the Firebase web config + `VITE_STRIPE_PUBLISHABLE_KEY` + `VITE_WHATSAPP_NUMBER`.
3. Enable **Google** and **Anonymous** sign-in in Firebase Auth.
4. Secrets for functions:
   ```bash
   cd functions && npm install
   firebase functions:secrets:set STRIPE_SECRET_KEY
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET   # from the Stripe webhook you create in step 6
   firebase functions:secrets:set SMTP_URL                # e.g. smtps://resend:re_xxx@smtp.resend.com:465
   ```
5. Seed the catalog: `GOOGLE_APPLICATION_CREDENTIALS=./functions/serviceAccount.json node seed.js`
6. Deploy: `npm run deploy`. Then in Stripe → Webhooks add
   `https://us-central1-<project>.cloudfunctions.net/stripeWebhook` with events
   `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`.
7. Make yourself admin: `cd functions && node scripts/setAdmin.js you@gmail.com` (sign out/in afterwards).
8. Turn on App Check (optional but recommended). Register a reCAPTCHA v3 site key in
   Firebase Console → App Check, put it in `VITE_RECAPTCHA_SITE_KEY`, then set
   `ENFORCE_APP_CHECK=1` in `functions/.env` and redeploy. Do these in that order:
   enforcing before the client sends tokens rejects every checkout.

`npm run deploy` also creates the `releaseAbandonedOrders` schedule, which needs the
Cloud Scheduler API enabled on the project (Firebase prompts for it on first deploy).

## Made to order, no stock
Nothing is kept in stock: every order is baked the day before its delivery date.
The earliest date is tomorrow in Virginia time (until the 10 PM cutoff, then the day after) and customers can book up to 60 days
ahead. Those rules, the delivery windows and the delivery fee tiers all live in
`functions/delivery.js`, which both the storefront and the Cloud Functions import.
To take a flavor off the menu, switch it to "Paused" in the admin Inventory.

## Why the checkout can't be abused
`createOrderAndPayment` requires a signed-in caller — the storefront signs guests in
anonymously before checking out — so the callable can't be scripted from outside to
flood the kitchen with fake orders. With App Check on, calls from outside the app are rejected too.

The total, the box discount and the delivery fee are all recomputed on the server;
the delivery distance is measured there from the address (US Census geocoder).
`releaseAbandonedOrders` runs every 15 minutes, cancels PaymentIntents older than 30
minutes that never completed and marks their orders `payment_status: "expired"`, so
the kitchen board only counts orders that were paid.

## How money flows (no client trust)
`Checkout` → callable `createOrderAndPayment` → validates `is_active` and the delivery date, recomputes the total, box discount and delivery fee, creates the PaymentIntent, writes `orders/{id}` as `pending` → client confirms with the Payment Element on `/order/:id` → Stripe webhook flips the order to `paid` (or `failed`) and emails the customer. Every status change in the dashboard triggers another email; the order page and emails carry a prefilled WhatsApp link.

## Firestore
`products`, `boxes`, `orders` exactly as in the brief (plus `payment_intent_id`, `auth_uid`, `box_id`, `box_discount`, `updated_at`). Rules: catalog public-read, admin-write; orders created only by the function, readable by their owner or admins, admins can only change `order_status`.

## Project map
```
src/
  lib/store.js        one data API, Firebase or in-memory demo backend
  lib/firebase.js     SDK init (Analytics/Performance lazy)
  components/Cookie   procedural SVG cookie (opens to show the filling)
  pages/BuildBox      6/12 box builder with live progress
  pages/Checkout      guest/Google checkout → Cloud Function
  pages/OrderStatus   live order tracking + Stripe Payment Element + WhatsApp
  pages/Admin + components/admin/*   real-time orders board (chime on paid) + inventory CRUD + Storage upload
functions/index.js    createOrderAndPayment · stripeWebhook · onOrderStatusChange · releaseAbandonedOrders
firestore.rules · storage.rules · firestore.indexes.json · firebase.json
```
