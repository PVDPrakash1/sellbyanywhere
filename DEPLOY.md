# Deploying to GoDaddy

## 0. Which GoDaddy product do you have?
- **VPS (Ubuntu/Linux)**: best option, follow Part A.
- **Web Hosting with cPanel that shows "Setup Node.js App"**: possible, follow Part B. If you do NOT see that menu in cPanel, the plan can't run this app (it needs a running Node server). Upgrade to a VPS, or host the app elsewhere (e.g. Vercel) and keep only the domain at GoDaddy.
- Database: GoDaddy does not give you MongoDB. Use **MongoDB Atlas** (free tier works): create a cluster, add a database user, and under Network Access allow your server's IP. Copy the connection string into MONGODB_URI (add the database name, e.g. `/shopanywhere`).

## Part A: VPS (Ubuntu)
1. **DNS.** GoDaddy > Domains > DNS: set an `A` record for `@` and `www` to your VPS IP.
2. **Server basics** (SSH in as root, then):
   adduser deploy && usermod -aG sudo deploy
   ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
   Then log in as `deploy` from now on.
3. **Install:**
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs nginx unzip
   sudo npm i -g pm2
4. **Upload the project:** from your computer `scp shopanywhere.zip deploy@SERVER_IP:~/`, then on the server `unzip shopanywhere.zip && cd shopanywhere`.
5. **Environment.** `cp .env.example .env.local` and fill in (see Part C). IMPORTANT: every `NEXT_PUBLIC_*` value is baked in at build time, so set them BEFORE building.
6. **Build and run:**
   npm install
   npm run build
   pm2 start ecosystem.config.cjs
   pm2 save && pm2 startup     (run the command it prints)
7. **Nginx:** `sudo cp deploy/nginx.conf /etc/nginx/sites-available/shopsite`, edit the domain, then
   sudo ln -s /etc/nginx/sites-available/shopsite /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
8. **HTTPS (required: login cookies are only set over HTTPS in production):**
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

## Part B: GoDaddy cPanel with Node.js
1. cPanel > Setup Node.js App > Create Application: Node 20, mode Production, application root `shopanywhere`, application URL = your domain, startup file `server.js`.
2. Upload and unzip the project into that folder (File Manager or SFTP).
3. Create `.env.production` in the app root with the values from Part C (the NEXT_PUBLIC_ ones must exist at build time). Also add them in the Node.js App "Environment variables" box.
4. Open the Terminal / SSH, run the "enter virtual environment" command shown at the top of the Node.js App page, then `npm install && npm run build`.
5. Click Restart in Setup Node.js App. Turn on the free SSL certificate for the domain in cPanel.

## Part C: Production values
NEXT_PUBLIC_BASE_URL=https://yourdomain.com   (no trailing slash)
NEXT_PUBLIC_APP_NAME=your brand
MONGODB_URI=Atlas connection string
AUTH_SECRET=output of `openssl rand -hex 32`  (never keep the default)
Razorpay: LIVE key id (NEXT_PUBLIC_RAZORPAY_KEY_ID) and secret. Your Razorpay account must be activated for live payments. Test everything with test keys first.
RAZORPAY_WEBHOOK_SECRET: in the Razorpay dashboard add a webhook to https://yourdomain.com/api/webhooks/razorpay for event `payment.captured` and paste the same secret.
SMTP_*: use a mail provider you trust (your GoDaddy email or a transactional provider). Check the host and port in its settings. If mail fails, hosts often block some ports; try 587 or 465.
MODEL_API_KEY / MODEL_API_BASE / MODEL_NAME: only for the Meta "where else to find it" panel.

## Part D: Before you announce
- Do NOT run `npm run seed` on production: it deletes all shops and products. It is for local demos only.
- Place one test order on every paid plan, and check the login email arrives, then refund your test payments in Razorpay.
- Turn on Atlas backups. Keep `.env.local` out of Git.

## Updating later
Upload the new files, then `npm install && npm run build && pm2 restart shopsite` (cPanel: build, then Restart).

## Troubleshooting
- 502 Bad Gateway: app not running. `pm2 logs shopsite`.
- Can't log in: you are on http, or AUTH_SECRET changed. Use https.
- Razorpay button does nothing: NEXT_PUBLIC_RAZORPAY_KEY_ID was missing when you built. Rebuild.
- Database errors: Atlas Network Access doesn't include the server IP.

## Added later: admin, uploads
- Set ADMIN_EMAIL and ADMIN_PASSWORD (a long password), then open https://yourdomain.com/admin/login.
- Uploaded logos, banners and ad images are saved in UPLOAD_DIR. Use a folder OUTSIDE the project (for example /var/www/shop-uploads, owned by the app user) so redeploying never deletes them, and include it in your backups.
- NEXT_PUBLIC_SITE_DOMAIN (shown in the home page animation) is baked in at build time.
