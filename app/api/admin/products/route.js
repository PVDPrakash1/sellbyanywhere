import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { ProductModel } from "@/lib/models"; import { isAdmin } from "@/lib/session";
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); await db(); return NextResponse.json(await ProductModel.find().sort("-createdAt").limit(500).lean()); }

export const dynamic = "force-dynamic"; // never cache at build time
