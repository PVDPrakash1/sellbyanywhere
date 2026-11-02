// Asks the Meta Model API (Muse Spark) where a product can be bought in a location, using its built-in web search tool.
// Uses the Responses endpoint: POST {base}/responses with tools:[{type:"web_search"}]. Web search is billed per query (about $2.50 per 1,000 at last check).
const BASE = process.env.MODEL_API_BASE || "https://api.meta.ai/v1", cache = new Map(), TTL = 60 * 60 * 1000;
const safeUrl = u => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch { return ""; } };

export async function askWhereAvailable(query, location, knownShops = []) {
  if (!process.env.MODEL_API_KEY) throw new Error("MODEL_API_KEY is not set in .env.local");
  const key = `${query.toLowerCase()}|${(location || "").toLowerCase()}`, hit = cache.get(key); if (hit && Date.now() - hit.t < TTL) return hit.v;
  const where = location || "India";
  const input = `A shopper wants to buy: "${query}". Location: ${where}.
Use web search to find real shops, markets or stores in ${where} where this product is sold.
${knownShops.length ? `These shops on our platform already have it, so do NOT repeat them: ${knownShops.join(", ")}.` : ""}
Only list places you found evidence for. Do not invent shops or URLs. Reply with ONLY JSON:
{"places":[{"name":"","area":"neighbourhood or market","why":"one short line","url":"official page if you found one, else empty"}],"note":"one short line, e.g. if little was found"}
At most 6 places.`;
  const r = await fetch(`${BASE}/responses`, { method: "POST", headers: { Authorization: `Bearer ${process.env.MODEL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.MODEL_NAME || "muse-spark-1.3", input, tools: [{ type: "web_search" }] }) });
  const j = await r.json(); if (!r.ok || j.error) throw new Error(j.error?.message || `Meta API error ${r.status}`);
  // Response shape handled defensively (output_text shortcut, or output[].content[].text with url_citation annotations).
  const parts = (j.output || []).flatMap(o => o.content || []);
  const text = j.output_text || parts.map(c => c.text || "").join("");
  const sources = [...new Map(parts.flatMap(c => c.annotations || []).filter(a => a.url).map(a => [a.url, { title: a.title || a.url, url: safeUrl(a.url) }]).filter(([, v]) => v.url)).values()].slice(0, 5);
  let places = [], note = "";
  try { const o = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    places = (o.places || []).slice(0, 6).map(p => ({ name: String(p.name || "").slice(0, 80), area: String(p.area || "").slice(0, 80), why: String(p.why || "").slice(0, 160), url: safeUrl(p.url || "") })).filter(p => p.name);
    note = String(o.note || "").slice(0, 160); }
  catch { note = text.slice(0, 300); } // model answered in prose: show it as a note
  const v = { places, note, sources }; cache.set(key, { t: Date.now(), v }); return v;
}
