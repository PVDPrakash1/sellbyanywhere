import { NextResponse } from "next/server"; import { draftListing } from "@/lib/ai";
export async function POST(req) { const { imageUrl, hint } = await req.json();
  try { return NextResponse.json(await draftListing(imageUrl, hint)); }
  catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); } }
