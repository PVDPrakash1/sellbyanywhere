import { ProductModel, ShopModel } from "./models";
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), clean = w => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const STOP = new Set("the and for with from this that are you your near best cheap buy sale new want need any get one some under over".split(" "));
// Our own database search: text + optional category / shop / location (city).
export async function searchProducts({ q, category, shop, location }) {
  const f = { status: "active" };
  if (shop) f.shopSlug = shop; else f.shopSlug = { $in: (await ShopModel.find({ status: "active" }).select("slug").lean()).map(s => s.slug) };
  if (category) f.category = new RegExp(`^${esc(category)}$`, "i");
  if (location) f.city = new RegExp(esc(location), "i");
  const words = q ? [...new Set(q.split(/\s+/).map(clean).filter(w => w.length > 1 && !STOP.has(w)))] : [];
  if (words.length) { const re = new RegExp(words.map(esc).join("|"), "i"); f.$or = ["title", "description", "tags", "category", "sellerName"].map(k => ({ [k]: re })); }
  const rows = await ProductModel.find(f).sort("-createdAt").limit(200).lean(); if (!words.length) return rows.slice(0, 40);
  const text = p => `${p.title} ${p.description} ${(p.tags || []).join(" ")} ${p.category} ${p.sellerName}`.toLowerCase(), need = Math.ceil(words.length / 2);
  return rows.map(p => ({ p, n: words.filter(w => text(p).includes(w)).length })).filter(x => x.n >= need).sort((a, b) => b.n - a.n).slice(0, 40).map(x => x.p);
}
