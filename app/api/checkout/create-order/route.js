import { NextResponse } from "next/server"; import Razorpay from "razorpay";
import { db } from "@/lib/db"; import { ProductModel, OrderModel } from "@/lib/models";
const rz = () => new Razorpay({ key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

export async function POST(req) {
  await db(); const { productId, quantity = 1, buyer } = await req.json();
  const p = await ProductModel.findById(productId);
  if (!p || p.status !== "active" || p.stock < quantity) return NextResponse.json({ error: "Unavailable" }, { status: 400 });
  const amount = p.price * quantity, fee = Math.round(amount * (Number(process.env.PLATFORM_FEE_PERCENT) || 10) / 100);
  const body = { amount, currency: "INR", receipt: `r_${Date.now()}` };
  if (p.sellerAccountId) body.transfers = [{ account: p.sellerAccountId, amount: amount - fee, currency: "INR", on_hold: 0 }]; // Razorpay Route split
  const ro = await rz().orders.create(body);
  const o = await OrderModel.create({ productId, quantity, amount, platformFee: fee, buyer, razorpayOrderId: ro.id });
  return NextResponse.json({ orderId: ro.id, amount, key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, title: p.title, dbOrderId: o._id });
}
