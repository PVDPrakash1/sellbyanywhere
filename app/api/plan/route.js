import { NextResponse } from "next/server"; import crypto from "crypto"; import Razorpay from "razorpay";
import { db } from "@/lib/db"; import { ShopModel } from "@/lib/models"; import { sessionShop } from "@/lib/session"; import { getPlan } from "@/lib/plans"; import { applyUpgrade } from "@/lib/signup";
export async function POST(req) { // owner starts an upgrade: server picks the price from lib/plans.js
  const shop = await sessionShop(); if (!shop) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { plan: id } = await req.json(), plan = getPlan(id);
  if (plan.id !== id || plan.price <= getPlan(shop.plan).price) return NextResponse.json({ error: "Choose a higher plan." }, { status: 400 });
  const rz = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  const o = await rz.orders.create({ amount: plan.price * 100, currency: "INR", receipt: `up_${Date.now()}`, notes: { type: "plan_upgrade", shop: shop.slug, plan: plan.id } });
  await db(); await ShopModel.updateOne({ _id: shop._id }, { pendingUpgrade: { orderId: o.id, plan: plan.id } });
  return NextResponse.json({ orderId: o.id, amount: o.amount, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID });
}
export async function PUT(req) { // browser reports payment; a valid signature proves it (the webhook is the backup)
  const shop = await sessionShop(); if (!shop) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = await req.json();
  const exp = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${oid}|${pid}`).digest("hex");
  if (exp !== sig) return NextResponse.json({ ok: false, error: "Payment verification failed" }, { status: 400 });
  await db(); await applyUpgrade(oid); return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic"; // never cache at build time
