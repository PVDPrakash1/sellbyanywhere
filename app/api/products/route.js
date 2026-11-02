import { NextResponse } from "next/server";
import { db } from "@/lib/db"; import { ProductModel, ShopModel } from "@/lib/models"; import { sessionShop } from "@/lib/session"; import { searchProducts } from "@/lib/search"; import { getPlan } from "@/lib/plans";
export async function GET(req) { // our database first; optional location filter
  await db(); const sp = new URL(req.url).searchParams;
  return NextResponse.json(await searchProducts({ q: sp.get("q")?.trim(), category: sp.get("category"), shop: sp.get("shop"), location: sp.get("location")?.trim() }));
}

export async function POST(req) { // logged-in shop owner adds a product to THEIR shop
  const shop = await sessionShop(); if (!shop) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const plan = getPlan(shop.plan), used = await ProductModel.countDocuments({ shopSlug: shop.slug });
  if (plan.maxProducts && used >= plan.maxProducts) return NextResponse.json({ error: `Your ${plan.name} plan allows ${plan.maxProducts} products. Upgrade from your dashboard to add more.` }, { status: 403 });
  const b = await req.json(); if (!b.title || !(Number(b.price) > 0)) return NextResponse.json({ error: "Title and a price are required." }, { status: 400 });
  const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50) + "-" + Date.now().toString(36);
  const p = await ProductModel.create({ title: b.title, description: b.description, category: b.category, tags: b.tags || [], price: Math.round(Number(b.price) * 100),
    stock: Number(b.stock) || 1, images: (b.images || []).filter(Boolean), city: shop.city, sellerName: shop.name, shopSlug: shop.slug, slug });
  return NextResponse.json({ slug: p.slug });
}

export const dynamic = "force-dynamic"; // never cache at build time
