import { NextResponse } from "next/server"; import crypto from "crypto"; import { adminToken, isAdmin } from "@/lib/session";
const same = (a, b) => crypto.timingSafeEqual(crypto.createHash("sha256").update(a).digest(), crypto.createHash("sha256").update(b).digest());
const tries = new Map(); // 10 attempts per IP per 15 minutes
export async function GET() { return isAdmin() ? NextResponse.json({ ok: true }) : NextResponse.json({}, { status: 401 }); }
export async function POST(req) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD." }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for") || "local", now = Date.now(), recent = (tries.get(ip) || []).filter(t => now - t < 900000);
  if (recent.length >= 10) return NextResponse.json({ error: "Too many attempts. Wait 15 minutes." }, { status: 429 }); tries.set(ip, [...recent, now]);
  const b = await req.json().catch(() => ({}));
  if (!same(String(b.email || "").toLowerCase(), process.env.ADMIN_EMAIL.toLowerCase()) || !same(String(b.password || ""), process.env.ADMIN_PASSWORD)) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  const res = NextResponse.json({ ok: true }); res.cookies.set("aid", adminToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 28800 }); return res;
}
export async function DELETE() { const res = NextResponse.json({ ok: true }); res.cookies.set("aid", "", { path: "/", maxAge: 0 }); return res; }

export const dynamic = "force-dynamic"; // never cache at build time
