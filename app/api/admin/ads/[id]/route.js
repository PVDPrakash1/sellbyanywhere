import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { AdModel } from "@/lib/models"; import { isAdmin } from "@/lib/session";
export async function PATCH(req, { params }) { // pause / resume an ad
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db(); const b = await req.json();
  if (typeof b.active !== "boolean") return NextResponse.json({ error: "Bad request" }, { status: 400 }); await AdModel.updateOne({ _id: params.id }, { active: b.active }); return NextResponse.json({ ok: true });
}
export async function DELETE(_, { params }) { if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db(); await AdModel.deleteOne({ _id: params.id }); return NextResponse.json({ ok: true }); }

export const dynamic = "force-dynamic"; // never cache at build time
