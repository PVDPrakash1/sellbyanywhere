import { NextResponse } from "next/server"; import Razorpay from "razorpay";
import { db } from "@/lib/db"; import { authShop } from "@/lib/shopAuth";
export async function POST(req) { // buy ad credit via Razorpay; the webhook credits the shop
  await db(); const { slug, amountRupees } = await req.json();
  if (!(await authShop(slug, req.headers.get("x-shop-token")))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const amount = Math.round(Number(amountRupees) * 100); if (!(amount >= 10000)) return NextResponse.json({ error: "Minimum ₹100" }, { status: 400 });
  const rz = new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  const o = await rz.orders.create({ amount, currency: "INR", receipt: `ad_${Date.now()}`, notes: { type: "adcredit", shop: slug } });
  return NextResponse.json({ orderId: o.id, amount, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID });
}
