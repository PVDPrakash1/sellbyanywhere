// Finds shops in a location using the Meta Model API (Muse) with its web_search tool, then enriches each one from its own website:
// phone number (tel: link) and shop photo (og:image), and downloads the photo.
// Usage:  npm run discover -- --location "Hyderabad" [--category "watches"] [--limit 10] [--no-photos]
// Output: table + discovered/<location>-<category>.json/.csv + discovered/photos/*
// These are LEADS from the public web and can be wrong or out of date. Photos belong to the shops: get their permission before using them on your site.
import fs from "fs";
const arg = n => { const i = process.argv.indexOf("--" + n); return i > -1 ? process.argv[i + 1] : undefined; };
const location = arg("location"), category = arg("category") || "", limit = Math.min(Math.max(Number(arg("limit")) || 10, 1), 20), photos = !process.argv.includes("--no-photos");
if (!location) { console.error('Missing --location. Example: npm run discover -- --location "Hyderabad" --category "watches"'); process.exit(1); }
if (!process.env.MODEL_API_KEY) { console.error("MODEL_API_KEY is not set (add it to .env.local)."); process.exit(1); }
const BASE = process.env.MODEL_API_BASE || "https://api.meta.ai/v1", UA = "Mozilla/5.0 (compatible; SellBuyAnywhereBot/1.0)";
const safeUrl = u => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch { return ""; } };
const cleanPhone = p => { const t = String(p || "").trim(), n = t.replace(/\D/g, ""); return n.length >= 8 && n.length <= 15 ? t : ""; };
const get = (u, ms = 8000) => fetch(u, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(ms), redirect: "follow" });

async function pageInfo(site) { // read the shop's own homepage for a photo and phone number
  try { const r = await get(site); if (!r.ok) return {}; const html = (await r.text()).slice(0, 400000);
    const og = html.match(/<meta[^>]+(?:property|name)=["']og:image["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']og:image["']/i);
    const tel = html.match(/href=["']tel:([^"']+)["']/i); let photo = "";
    if (og) { try { photo = safeUrl(new URL(og[1].replace(/&amp;/g, "&"), r.url).href); } catch {} }
    return { photo, phone: tel ? cleanPhone(decodeURIComponent(tel[1])) : "" };
  } catch { return {}; }
}
async function download(url, base) { // only saves real images under 5 MB
  try { const r = await get(url, 12000), type = (r.headers.get("content-type") || "").split(";")[0], ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[type];
    if (!r.ok || !ext) return ""; const buf = Buffer.from(await r.arrayBuffer()); if (buf.length > 5 * 1024 * 1024) return "";
    fs.mkdirSync("discovered/photos", { recursive: true }); const f = `discovered/photos/${base}.${ext}`; fs.writeFileSync(f, buf); return f; } catch { return ""; }
}

const input = `Use web search to find up to ${limit} real ${category ? category + " " : ""}shops or local businesses in ${location}.
Only include places you found evidence for. Do not invent names, phone numbers or URLs; leave a field empty if you did not find it.
Reply with ONLY JSON: {"shops":[{"name":"","category":"","area":"neighbourhood","address":"","phone":"","website":"official site if any","photo":"direct image URL of the shop or its storefront, only if you saw one","source":"page where you found it"}]}`;
console.log(`Asking Meta AI for ${category || "all kinds of"} shops in ${location}…`);
const r = await fetch(`${BASE}/responses`, { method: "POST", headers: { Authorization: `Bearer ${process.env.MODEL_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: process.env.MODEL_NAME || "muse-spark-1.3", input, tools: [{ type: "web_search" }] }) });
const j = await r.json(); if (!r.ok || j.error) { console.error("Meta API error:", j.error?.message || r.status); process.exit(1); }
const text = j.output_text || (j.output || []).flatMap(o => o.content || []).map(c => c.text || "").join("");
let list; try { list = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)).shops || []; } catch { console.error("Could not read the answer as JSON. Raw reply:\n" + text); process.exit(1); }
const seen = new Set(), shops = list.map(s => ({ name: String(s.name || "").trim(), category: String(s.category || category || "").trim(), area: String(s.area || "").trim(), address: String(s.address || "").trim(),
  phone: cleanPhone(s.phone), phoneFrom: cleanPhone(s.phone) ? "search" : "", website: safeUrl(s.website || ""), photo: safeUrl(s.photo || ""), photoFile: "", source: safeUrl(s.source || "") }))
  .filter(s => s.name && !seen.has(s.name.toLowerCase()) && seen.add(s.name.toLowerCase())).slice(0, limit);
if (!shops.length) { console.log("No shops found. Try a broader category or a bigger city."); process.exit(0); }

for (const [i, s] of shops.entries()) { // enrich from each shop's own website
  process.stdout.write(`(${i + 1}/${shops.length}) ${s.name}: `);
  if (s.website) { const info = await pageInfo(s.website); if (!s.phone && info.phone) { s.phone = info.phone; s.phoneFrom = "website"; } if (info.photo) s.photo = info.photo; }
  if (photos && s.photo) s.photoFile = await download(s.photo, `${i + 1}-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`);
  console.log([s.phone ? "phone ✓" : "no phone", s.photoFile ? "photo ✓" : s.photo ? "photo link only" : "no photo"].join(", "));
}
console.table(shops.map(({ name, area, phone, website, photoFile }) => ({ name, area, phone, website, photo: photoFile ? "saved" : "" })));
fs.mkdirSync("discovered", { recursive: true });
const file = `discovered/${[location, category].filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
const csv = [Object.keys(shops[0]).join(","), ...shops.map(s => Object.values(s).map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
fs.writeFileSync(file + ".json", JSON.stringify({ location, category, fetchedAt: new Date().toISOString(), shops }, null, 2)); fs.writeFileSync(file + ".csv", csv);
console.log(`\nSaved ${shops.length} shops to ${file}.json and ${file}.csv${photos ? " (photos in discovered/photos)" : ""}.\nVerify phone numbers and ask permission before using photos.`);
