import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { ProductModel } from "@/lib/models"; import { sessionShop } from "@/lib/session";
export async function DELETE(_, { params }) {
  const shop = await sessionShop(); if (!shop) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  await db(); await ProductModel.deleteOne({ _id: params.id, shopSlug: shop.slug }); return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic"; // never cache at build time
