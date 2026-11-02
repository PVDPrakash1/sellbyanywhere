# Shop marketplace (SellBuyAnywhere)
1. `cp .env.example .env.local` and fill values   2. `npm install`   3. `npm run seed` (optional demo data)   4. `npm run dev`
Flow: /shops/new (choose Basic, Plus or Pro and pay via Razorpay) -> shop activated -> login email sent -> owner logs in at /login -> adds products at /dashboard.
Buyers search on the home page and see the shop's contact details on every product page.
Razorpay webhook (backup, recommended in production): https://YOURDOMAIN/api/webhooks/razorpay, event payment.captured.
Demo logins after seeding: jaipur@example.com / demo1234

## Search flow
1. Our DB (text + category + location/city).  2. Meta Model API (/responses with the web_search tool) answers "where is it sold in <location>".
Needs MODEL_API_KEY. Web search is billed per query; results are cached 1 hour per product+location and rate-limited per IP.

## Ads
Edit lib/adSlots.js to put a real ad in a slot (homeTop, grid, product). Empty slots show an "Advertise here" placeholder linking to NEXT_PUBLIC_AD_CONTACT.
## Find shops by location (Meta AI)
`npm run discover -- --location "Hyderabad" --category "watches" --limit 10` -> saves discovered/*.json and *.csv. Results are leads: verify before use.
