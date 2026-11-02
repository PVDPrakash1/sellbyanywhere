import { NextResponse } from "next/server";
import { db } from "@/lib/db"; import { ProductModel } from "@/lib/models"; import { embed, cosine } from "@/lib/ai";
import { understandImage, understandText, transcribeWithMeta, globalSearch, rankProducts } from "@/lib/metaSearch";
const MIN_SCORE = 0.55; // semantic threshold (only used when EMBED_* is configured)
const STOP = new Set("the and for with from this that are you your near best cheap buy sale new want need any get one some under over".split(" "));
const clean = w => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

export async function POST(req) {
  try {
    // if ((req.headers.get("content-type") || "").includes("application/json")) { // "Search globally" step
    //   const { query, global } = await req.json(); if (!global) return NextResponse.json({ error: "bad request" }, { status: 400 });
    //   try { return NextResponse.json({ source: "global", query, items: await globalSearch(query) }); }
    //   catch (e) { return NextResponse.json({ error: /SERPAPI/.test(e.message) ? "Global search isn't set up yet. Add SERPAPI_KEY to .env.local and restart." : e.message }, { status: 500 }); }
    // }
    const fd = await req.formData(); let q = (fd.get("q") || "").toString().trim(), extra = [], ai = { ok: true };
    const audio = fd.get("audio"), image = fd.get("image");
    try { // Muse (Meta AI) understanding. If it fails we still search with the raw text and tell the UI why.
      //if (audio?.size) q = await transcribeWithMeta(audio);
      //if (image?.size) { const u = await understandImage(Buffer.from(await image.arrayBuffer()), image.type, q); q = u.query; extra = u.keywords || []; }
      if (q) { const u = await understandText(q); q = u.query || q; extra = u.keywords || []; }
    } catch (e) { ai = { ok: false, error: e.message }; }
    if (!q) return NextResponse.json({ items: [], query: "", ai });

    await db(); const qe = await embed(q); let items = [], engine = qe ? "embeddings" : "keyword";
    if (qe) { // semantic mode
      const all = await ProductModel.find({ status: "active" }).select("+embedding").limit(1000).lean();
      items = all.filter(p => p.embedding?.length).map(p => ({ ...p, embedding: undefined, score: cosine(qe, p.embedding) }))
        .filter(p => p.score >= MIN_SCORE).sort((a, b) => b.score - a.score).slice(0, 40);
    } else if (ai.ok) { // Meta Muse ranks the catalog itself
      try { const pool = await ProductModel.find({ status: "active" }).sort("-createdAt").limit(300).lean();
        items = (await rankProducts(q, pool)).map(n => pool[n]); engine = "muse";
      } catch (e) { ai = { ok: false, error: e.message }; }
    }
    if (!qe && engine !== "muse") { // keyword fallback: ignore filler words; need about half of the user's words to match
      const qw = [...new Set(q.split(/\s+/).map(clean).filter(w => w.length > 2 && !STOP.has(w)))];
      const xw = [...new Set(extra.flatMap(k => String(k).split(/\s+/)).map(clean).filter(w => w.length > 2 && !STOP.has(w)))];
      const all = [...new Set([...qw, ...xw])]; if (all.length) {
        const re = new RegExp(all.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "i");
        const cand = await ProductModel.find({ status: "active", $or: [{ title: re }, { description: re }, { tags: re }, { category: re }] }).limit(200).lean();
        const text = p => `${p.title} ${p.description} ${(p.tags || []).join(" ")} ${p.category}`.toLowerCase();
        const need = qw.length ? Math.ceil(qw.length / 2) : 2;
        items = cand.map(p => ({ ...p, score: (qw.length ? qw : xw).filter(w => text(p).includes(w)).length, bonus: all.filter(w => text(p).includes(w)).length }))
          .filter(p => p.score >= need).sort((a, b) => b.score - a.score || b.bonus - a.bonus).slice(0, 40);
      }
    }
    return NextResponse.json({ source: "db", query: q, items, canSearchGlobal: items.length === 0, ai, engine });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
