// ===== Meta Model API building blocks: text + image understanding, voice transcription, global search =====
import { chat, BASE, authHeaders } from "./ai";
const parseJSON = t => JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));

/* 1) IMAGE -> product intent (Llama vision). Works for photo of a product, screenshot, etc. */
export async function understandImage(buffer, mime, userHint = "") {
  const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
  const out = await chat([
    { type: "image_url", image_url: { url: dataUrl } },
    { type: "text", text: `Identify the product in this image for a shopping search. Hint from user: "${userHint}".
Reply ONLY JSON: {"query":"short search phrase with brand/model if visible","category":"","color":"","keywords":["related product words"]}` }]);
  return parseJSON(out);
}

/* 2) TEXT (any language, messy) -> clean search query (Llama text) */
export async function understandText(text) {
  const out = await chat(
    `User shopping request (may be Telugu/Hindi/English/mixed): "${text}".
Reply ONLY JSON: {"query":"concise English product search phrase","keywords":["synonyms and related product words in English"],"maxPrice":null,"category":""}`);
console.log(out);
  return parseJSON(out);
}

/* 3) VOICE -> text with Muse Voice Transcribe: POST {base}/asr/transcribe (multipart upload, Bearer auth).
   Model id: muse-voice-transcribe-1.0. I could not open Meta's reference page, so the form field names ("file", "model")
   and the response field ("text") are ASSUMED — check dev.meta.ai/docs/speech-to-text and adjust if the call returns 400.
   The home page currently uses the browser's free Web Speech API; to use this instead, record with MediaRecorder
   and send the blob as the "audio" field to /api/search. */
export async function transcribeWithMeta(audioFile) {
  const fd = new FormData(); fd.append("file", audioFile); fd.append("model", "muse-voice-transcribe-1.0");
  const r = await fetch(`${BASE}/asr/transcribe`, { method: "POST", headers: authHeaders(false), body: fd });
  const j = await r.json(); if (!r.ok) throw new Error(j.error?.message || `Transcribe error ${r.status}`);
  return j.text || j.transcript || "";
}

/* 4) GLOBAL SEARCH. Meta models do NOT contain live product listings, so you need a shopping/search API
   for the actual data; Llama then cleans and ranks it. SerpAPI Google Shopping shown (paid).
   Alternatives: Google Programmable Search, Amazon PA-API / Flipkart affiliate API (best for India, also earn commission). */
export async function globalSearch(query) {
  if (!process.env.SERPAPI_KEY) throw new Error("SERPAPI_KEY is not set");
  const u = new URL("https://serpapi.com/search.json");
  u.search = new URLSearchParams({ engine: "google_shopping", q: query, gl: "in", hl: "en", api_key: process.env.SERPAPI_KEY });
  const j = await (await fetch(u)).json();
  const items = (j.shopping_results || []).slice(0, 12).map((p, i) => ({
    id: i, title: p.title, price: p.price, link: p.product_link || p.link, image: p.thumbnail, source: p.source }));
  return items.length ? rerank(query, items) : [];
}

/* 5) Llama re-ranks / filters external results against the user's intent */
async function rerank(query, items) {
  try {
    const out = await chat(
      `User wants: "${query}". Candidates: ${JSON.stringify(items.map(({ id, title, price, source }) => ({ id, title, price, source })))}.
Drop irrelevant items (accessories, wrong product). Reply ONLY JSON: {"ids":[best-first ids]}`);
    const { ids } = parseJSON(out); const map = new Map(items.map(i => [i.id, i]));
    const ranked = ids.map(id => map.get(id)).filter(Boolean); return ranked.length ? ranked : items;
  } catch { return items; }
}

/* 6) Muse picks the matching products from your catalog (no embeddings needed; fine for a few hundred items).
   Returns indexes into `products`, best first. An empty list means "nothing matches" -> the UI offers global search. */
export async function rankProducts(query, products) {
  const list = products.map((p, i) => ({ i, title: p.title, category: p.category, tags: p.tags, about: (p.description || "").slice(0, 80), priceINR: Math.round(p.price / 100) }));
  const out = await chat(`A shopper is searching for: "${query}".
Catalog: ${JSON.stringify(list)}
Return ONLY JSON: {"ids":[catalog indexes of products that genuinely match, best first, at most 20]}. If nothing matches, return {"ids":[]}. Do not include loosely related items.`);
  const { ids } = parseJSON(out);
  return [...new Set((ids || []).filter(n => Number.isInteger(n) && products[n]))];
}
