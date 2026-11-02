import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { AdModel } from "@/lib/models"; import { SLOTS } from "@/lib/adSlots";
export async function GET(req) { // public: one active ad for a slot (random among active, within its dates)
  const slot = new URL(req.url).searchParams.get("slot"); if (!SLOTS.includes(slot)) return NextResponse.json({ ad: null });
  await db(); const now = new Date();
  const ads = await AdModel.find({ slot, active: true, $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: now } }] }, { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }] }).lean();
  if (!ads.length) return NextResponse.json({ ad: null }); const a = ads[Math.floor(Math.random() * ads.length)];
  await AdModel.updateOne({ _id: a._id }, { $inc: { impressions: 1 } }); return NextResponse.json({ ad: { id: String(a._id), image: a.image, alt: a.alt } });
}

export const dynamic = "force-dynamic"; // never cache at build time
