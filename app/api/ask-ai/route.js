import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { searchProducts } from "@/lib/search"; import { askWhereAvailable } from "@/lib/metaAsk";
const hits = new Map(); // tiny per-IP rate limit: 10 asks / minute (use a real limiter in production)
export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for") || "local", now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 60000);
  if (recent.length >= 10) return NextResponse.json({ error: "Too many searches. Try again in a minute." }, { status: 429 }); hits.set(ip, [...recent, now]);
  const b = await req.json().catch(() => ({})), q = String(b.q || "").trim().slice(0, 80), location = String(b.location || "").trim().slice(0, 40);
  if (q.length < 2) return NextResponse.json({ error: "Type a product to search." }, { status: 400 });
  try { await db(); const ours = await searchProducts({ q, location }); // step 1 already done in our DB; tell the model what we already have
    return NextResponse.json(await askWhereAvailable(q, location, [...new Set(ours.map(p => p.sellerName))].slice(0, 10)));
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export const dynamic = "force-dynamic"; // never cache at build time
