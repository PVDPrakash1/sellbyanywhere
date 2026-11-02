import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { ShopModel, ProductModel } from "@/lib/models"; import { isAdmin } from "@/lib/session"; import { isPlan } from "@/lib/plans";
export async function PATCH(req, { params }) { // suspend / re-activate a shop, or change its plan
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db(); const b = await req.json(), set = {};
  if (["active", "suspended"].includes(b.status)) set.status = b.status; if (isPlan(b.plan)) set.plan = b.plan;
  if (!Object.keys(set).length) return NextResponse.json({ error: "Nothing to change." }, { status: 400 });
  await ShopModel.updateOne({ _id: params.id }, set); return NextResponse.json({ ok: true });
}
export async function DELETE(_, { params }) { // removes the shop AND its products
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db(); const s = await ShopModel.findById(params.id); if (!s) return NextResponse.json({ ok: true });
  await ProductModel.deleteMany({ shopSlug: s.slug }); await ShopModel.deleteOne({ _id: s._id }); return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic"; // never cache at build time
