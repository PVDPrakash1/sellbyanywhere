import { NextResponse } from "next/server";
import { db } from "@/lib/db"; import { ShopModel, ProductModel } from "@/lib/models";
export async function GET(_, { params }) {
  await db(); const shop = await ShopModel.findOne({ slug: params.slug }).lean(); if (!shop) return NextResponse.json({}, { status: 404 });
  const products = await ProductModel.find({ shopSlug: params.slug, status: "active" }).sort("-createdAt").lean();
  return NextResponse.json({ shop, products });
}
