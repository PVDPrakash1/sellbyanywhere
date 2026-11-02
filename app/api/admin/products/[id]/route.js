import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { ProductModel } from "@/lib/models"; import { isAdmin } from "@/lib/session";
export async function PATCH(req, { params }) { // hide / show a product in search and shop pages
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db(); const b = await req.json();
  if (!["active", "hidden"].includes(b.status)) return NextResponse.json({ error: "Bad status" }, { status: 400 }); await ProductModel.updateOne({ _id: params.id }, { status: b.status }); return NextResponse.json({ ok: true });
}
export async function DELETE(_, { params }) { if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db(); await ProductModel.deleteOne({ _id: params.id }); return NextResponse.json({ ok: true }); }

export const dynamic = "force-dynamic"; // never cache at build time
