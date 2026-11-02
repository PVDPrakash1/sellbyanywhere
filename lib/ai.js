// Meta Model API (OpenAI-compatible). Same call as your litellm sample:
//   model "openai/muse-spark-1.3" + api_base https://api.meta.ai/v1  ==  POST {base}/chat/completions with model "muse-spark-1.3"
// (the "openai/" prefix only tells litellm which protocol to use; it is not part of the model name).
export const BASE = process.env.MODEL_API_BASE || "https://api.meta.ai/v1";
export const MODEL = process.env.MODEL_NAME || "muse-spark-1.3";
export const authHeaders = (json = true) => ({ Authorization: `Bearer ${process.env.MODEL_API_KEY}`, ...(json ? { "Content-Type": "application/json" } : {}) });

export async function chat(content, { temperature = 0.2 } = {}) { // content: string OR OpenAI-style parts [{type:"text"},{type:"image_url"}]
  if (!process.env.MODEL_API_KEY) throw new Error("MODEL_API_KEY is not set in .env.local");
  const body = { model: MODEL, temperature, messages: [{ role: "user", content }] };
  if (process.env.REASONING_EFFORT) body.reasoning_effort = process.env.REASONING_EFFORT; // optional: minimal|low|medium|high
  const r = await fetch(`${BASE}/chat/completions`, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok || j.error) throw new Error(j.error?.message || `Meta API error ${r.status}`);
  return j.choices[0].message.content;
}

// Embeddings: I found no embeddings endpoint in Meta's Model API docs, so this uses an OPTIONAL separate
// OpenAI-compatible provider. Leave EMBED_* empty and search falls back to keyword matching (still works).
export async function embed(text) {
  if (!process.env.EMBED_API_KEY || !process.env.EMBED_API_BASE) return null;
  try { const r = await fetch(`${process.env.EMBED_API_BASE}/embeddings`, { method: "POST",
    headers: { Authorization: `Bearer ${process.env.EMBED_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.EMBED_MODEL, input: text }) });
    return (await r.json()).data?.[0]?.embedding ?? null; } catch { return null; }
}

export async function draftListing(imageUrl, hint = "") {
  const t = await chat([{ type: "image_url", image_url: { url: imageUrl } },
    { type: "text", text: `You write marketplace listings. Seller hint: "${hint}". Reply ONLY JSON: {"title":"","description":"","category":"","tags":[]}` }], { temperature: 0.3 });
  return JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
}

export const cosine = (a, b) => { let d = 0, x = 0, y = 0;
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; x += a[i] ** 2; y += b[i] ** 2; }
  return d / (Math.sqrt(x) * Math.sqrt(y) || 1); };
