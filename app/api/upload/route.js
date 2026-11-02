import { NextResponse } from "next/server"; import crypto from "crypto"; import fs from "fs/promises"; import path from "path"; import { isAdmin } from "@/lib/session";
const hits = new Map(); // 30 uploads per IP per hour for the public signup form (admins are exempt)
const kind = b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 ? "png" : b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff ? "jpg"
  : b.slice(0, 4).toString() === "GIF8" ? "gif" : b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP" ? "webp" : null; // checks the real file bytes, not the file name
export async function POST(req) {
  if (!isAdmin()) { const ip = req.headers.get("x-forwarded-for") || "local", now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 3600000);
    if (recent.length >= 30) return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 }); hits.set(ip, [...recent, now]); }
  const fd = await req.formData().catch(() => null), file = fd?.get("file"); if (!file?.size) return NextResponse.json({ error: "Choose an image." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 4 MB." }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer()), ext = kind(buf); if (!ext) return NextResponse.json({ error: "Use a PNG, JPG, WebP or GIF image." }, { status: 400 });
  const name = `${crypto.randomBytes(12).toString("hex")}.${ext}`, dir = path.resolve(process.env.UPLOAD_DIR || "uploads");
  await fs.mkdir(dir, { recursive: true }); await fs.writeFile(path.join(dir, name), buf); return NextResponse.json({ url: `/api/uploads/${name}` });
}

export const dynamic = "force-dynamic"; // never cache at build time
