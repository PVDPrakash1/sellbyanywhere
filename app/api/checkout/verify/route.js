import { NextResponse } from "next/server"; import crypto from "crypto";
import { db } from "@/lib/db"; import { OrderModel } from "@/lib/models";
export async function POST(req) {
  await db(); const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = await req.json();
  const exp = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${oid}|${pid}`).digest("hex");
  if (exp !== sig) return NextResponse.json({ ok: false }, { status: 400 });
  await OrderModel.updateOne({ razorpayOrderId: oid, status: "created" }, { status: "paid", razorpayPaymentId: pid });
  return NextResponse.json({ ok: true });
}
