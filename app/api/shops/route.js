import { NextResponse } from "next/server"; import crypto from "crypto"; import Razorpay from "razorpay";
import { db } from "@/lib/db"; import { ShopModel } from "@/lib/models"; import { getPlan, isPlan } from "@/lib/plans";
export async function GET() { await db(); return NextResponse.json(await ShopModel.find({ status: "active" }).select("-razorpayOrderId -razorpayPaymentId -pendingUpgrade").sort("-createdAt").limit(60)); }

// Step 1 of signup: save the shop as "pending" and create a Razorpay order for the chosen plan (price comes from lib/plans.js).
export async function POST(req) {
  await db(); const b = await req.json(); const email = (b.email || "").toLowerCase().trim();
  if (!isPlan(b.plan)) return NextResponse.json({ error: "Please choose a plan." }, { status: 400 }); const plan = getPlan(b.plan);
  if (!b.name || !b.ownerName || !b.phone || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Shop name, your name, phone and a valid email are required." }, { status: 400 });
  if (await ShopModel.findOne({ email, status: "active" })) return NextResponse.json({ error: "A shop with this email already exists. Please log in." }, { status: 409 });
  const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + "-" + crypto.randomBytes(2).toString("hex");
  const rz = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  const o = await rz.orders.create({ amount: plan.price * 100, currency: "INR", receipt: `shop_${Date.now()}`, notes: { type: "shop_signup", shop: slug, plan: plan.id } });
  const { name, ownerName, phone, whatsapp, address, city, category, description, logo, banner } = b;
  await ShopModel.create({ name, ownerName, phone, whatsapp, address, city, category, description, logo, banner, email, slug, plan: plan.id, status: "pending", razorpayOrderId: o.id });
  return NextResponse.json({ orderId: o.id, amount: o.amount, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, slug });
}

export const dynamic = "force-dynamic"; // never cache at build time
