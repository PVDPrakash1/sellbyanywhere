import { NextResponse } from "next/server";
import { db } from "@/lib/db"; import { ShopModel } from "@/lib/models"; import { sendLoginEmail } from "@/lib/mail";
import { checkPassword, hashPassword, makeToken, newPassword, sessionShop } from "@/lib/session";

export async function GET(_, { params }) { // /api/auth/me
  if (params.action !== "me") return NextResponse.json({}, { status: 404 });
  const s = await sessionShop(); if (!s) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  return NextResponse.json({ name: s.name, slug: s.slug, ownerName: s.ownerName, email: s.email, phone: s.phone, whatsapp: s.whatsapp, city: s.city, plan: s.plan });
}

export async function POST(req, { params }) {
  await db(); const b = await req.json().catch(() => ({})); const email = (b.email || "").toLowerCase().trim(); const res = NextResponse.json({ ok: true });
  if (params.action === "login") {
    const s = await ShopModel.findOne({ email, status: "active" }).select("+passwordHash");
    if (!s || !checkPassword(b.password || "", s.passwordHash)) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    res.cookies.set("sid", makeToken(String(s._id)), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 }); return res;
  }
  if (params.action === "logout") { res.cookies.set("sid", "", { path: "/", maxAge: 0 }); return res; }
  if (params.action === "forgot") { // emails a NEW password to the registered address (also the way to resend if the first email was lost)
    const s = await ShopModel.findOne({ email, status: "active" });
    if (s) { const pw = newPassword(); await ShopModel.updateOne({ _id: s._id }, { passwordHash: hashPassword(pw) }); try { await sendLoginEmail(s, pw); } catch (e) { console.error(e.message); } }
    return res; // same answer either way, so emails can't be probed
  }
  return NextResponse.json({}, { status: 404 });
}

export const dynamic = "force-dynamic"; // never cache at build time
