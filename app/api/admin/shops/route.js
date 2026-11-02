import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { ShopModel, ProductModel } from "@/lib/models"; import { isAdmin } from "@/lib/session";
export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db();
  const shops = await ShopModel.find().select("-razorpayOrderId -pendingUpgrade").sort("-createdAt").limit(500).lean();
  const counts = Object.fromEntries((await ProductModel.aggregate([{ $group: { _id: "$shopSlug", n: { $sum: 1 } } }])).map(c => [c._id, c.n]));
  return NextResponse.json(shops.map(s => ({ ...s, products: counts[s.slug] || 0 })));
}

export const dynamic = "force-dynamic"; // never cache at build time
