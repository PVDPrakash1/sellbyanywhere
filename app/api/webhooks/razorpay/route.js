import { NextResponse } from "next/server"; import crypto from "crypto";
import { db } from "@/lib/db"; import { activateShop, applyUpgrade } from "@/lib/signup";
export async function POST(req) { // backup path: activates the shop even if the buyer closes the tab right after paying
  const raw = await req.text();
  const sig = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "").update(raw).digest("hex");
  if (sig !== req.headers.get("x-razorpay-signature")) return NextResponse.json({}, { status: 400 });
  const e = JSON.parse(raw), pay = e.payload?.payment?.entity;
  if (e.event === "payment.captured" && pay?.notes?.type === "shop_signup") { await db(); await activateShop(pay.order_id, pay.id); }
  if (e.event === "payment.captured" && pay?.notes?.type === "plan_upgrade") { await db(); await applyUpgrade(pay.order_id); }
  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic"; // never cache at build time
