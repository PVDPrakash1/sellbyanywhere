// Only for GoDaddy cPanel "Setup Node.js App" (set this as the Application startup file). Not needed on a VPS.
const { createServer } = require("http"); const next = require("next");
const app = next({ dev: false }); const handle = app.getRequestHandler();
app.prepare().then(() => createServer((req, res) => handle(req, res)).listen(process.env.PORT || 3000));
