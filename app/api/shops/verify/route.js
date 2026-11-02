import { NextResponse } from "next/server"; import crypto from "crypto";
import { db } from "@/lib/db"; import { activateShop } from "@/lib/signup";
export async function POST(req) { // Step 2: browser reports the payment result; we verify the signature, activate the shop and email the login.
  await db(); const { razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = await req.json();
  const exp = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${oid}|${pid}`).digest("hex");
  if (exp !== sig) return NextResponse.json({ ok: false, error: "Payment verification failed" }, { status: 400 });
  const shop = await activateShop(oid, pid); return NextResponse.json({ ok: !!shop, slug: shop?.slug });
}

export const dynamic = "force-dynamic"; // never cache at build time
