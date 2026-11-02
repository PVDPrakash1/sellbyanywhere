import { NextResponse } from "next/server";
import { db } from "@/lib/db"; import { ProductModel } from "@/lib/models"; import { SHARERS, shareLinks } from "@/lib/meta";

export async function POST(req, { params }) { // one click -> all selected Meta platforms
  await db(); const p = await ProductModel.findById(params.id); if (!p) return NextResponse.json({}, { status: 404 });
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/p/${p.slug}`;
  const { platforms = ["facebook", "instagram", "threads"] } = await req.json().catch(() => ({}));
  const results = await Promise.all(platforms.filter(x => SHARERS[x]).map(async x => {
    try { await SHARERS[x](p, url); return [x, "posted"]; } catch (e) { return [x, "failed: " + e.message]; } }));
  return NextResponse.json({ results: Object.fromEntries(results), links: shareLinks(p, url) });
}
