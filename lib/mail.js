import nodemailer from "nodemailer";
export async function sendLoginEmail(shop, password) {
  const app = process.env.NEXT_PUBLIC_APP_NAME || "SellBuyAnywhere", url = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;
  const text = `Hi ${shop.ownerName || "there"},\n\nYour shop "${shop.name}" is live on ${app}.\n\nLogin page: ${url}\nEmail: ${shop.email}\nPassword: ${password}\n\nLog in to add your products. Keep this password private.\n`;
  if (!process.env.SMTP_HOST) { console.log(`\n[SMTP not configured] Email to ${shop.email}:\n${text}`); return false; } // dev fallback
  const port = Number(process.env.SMTP_PORT || 587);
  const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
  await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: shop.email, subject: `Your ${shop.name} shop is live: login details`, text });
  return true;
}
