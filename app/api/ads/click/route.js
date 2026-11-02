import { NextResponse } from "next/server"; import { db } from "@/lib/db"; import { AdModel } from "@/lib/models";
export async function GET(req) { // counts the click, then sends the visitor to the advertiser (http/https only)
  await db(); const id = new URL(req.url).searchParams.get("id"); let ad = null; try { ad = await AdModel.findByIdAndUpdate(id, { $inc: { clicks: 1 } }); } catch {}
  try { const u = new URL(ad?.href || ""); if (/^https?:$/.test(u.protocol)) return NextResponse.redirect(u.href); } catch {}
  return NextResponse.redirect(new URL("/", req.url));
}

export const dynamic = "force-dynamic"; // never cache at build time
