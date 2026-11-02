import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { AdModel } from "@/lib/models"; import { isAdmin } from "@/lib/session"; import { SLOTS } from "@/lib/adSlots";
const okUrl = u => { try { return /^https?:$/.test(new URL(u).protocol); } catch { return false; } };
const okImage = u => typeof u === "string" && (/^\/api\/uploads\/[a-f0-9]{24}\.(png|jpg|gif|webp)$/.test(u) || okUrl(u));
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db(); return NextResponse.json(await AdModel.find().sort("-createdAt").lean()); }
export async function POST(req) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db(); const b = await req.json();
  if (!SLOTS.includes(b.slot) || !okImage(b.image) || !okUrl(b.href)) return NextResponse.json({ error: "Choose a slot, upload an image and give a full link (https://…)." }, { status: 400 });
  const ad = await AdModel.create({ slot: b.slot, advertiser: b.advertiser, image: b.image, href: b.href, alt: b.alt, active: true, startsAt: b.startsAt || null, endsAt: b.endsAt || null });
  return NextResponse.json({ id: ad._id });
}

export const dynamic = "force-dynamic"; // never cache at build time
