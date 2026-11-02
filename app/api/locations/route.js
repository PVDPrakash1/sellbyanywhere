import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { ShopModel } from "@/lib/models";
const DEFAULT = ["Hyderabad", "Bengaluru", "Mumbai", "Delhi", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Kochi", "Visakhapatnam", "Vijayawada"];
export async function GET() { await db(); const mine = (await ShopModel.distinct("city", { status: "active" })).filter(Boolean);
  const seen = new Set(); return NextResponse.json([...mine, ...DEFAULT].filter(c => { const k = c.toLowerCase().trim(); return !seen.has(k) && seen.add(k); }).sort()); }

export const dynamic = "force-dynamic"; // never cache at build time
