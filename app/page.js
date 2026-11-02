"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import Promo from "./Promo"; import AdSlot from "./AdSlot";
const CATS = ["Fashion", "Electronics", "Home", "Food", "Handmade", "Beauty"];
const rupee = p => "₹" + (p / 100).toLocaleString("en-IN");
export default function Home() {
  const [q, setQ] = useState(""), [loc, setLoc] = useState(""), [cat, setCat] = useState(""), [items, setItems] = useState(null), [locs, setLocs] = useState([]);
  const [lang, setLang] = useState("en-IN"), [err, setErr] = useState(""), [shown, setShown] = useState({}), [ai, setAi] = useState(null), run = useRef(0);
  useEffect(() => { fetch("/api/locations").then(r => r.json()).then(setLocs); load("", "", ""); }, []);

  async function load(query, category, location) {
    const id = ++run.current, p = new URLSearchParams(); if (query) p.set("q", query); if (category) p.set("category", category); if (location) p.set("location", location);
    setShown({ query, category, location }); setAi(null);
    const rows = await (await fetch("/api/products?" + p)).json(); if (id !== run.current) return; setItems(rows); // 1) our database
    if (!query) return; setAi({ loading: true });                                                                 // 2) then Meta AI web search
    const r = await fetch("/api/ask-ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: query, location }) });
    const d = await r.json(); if (id === run.current) setAi(r.ok ? d : { error: d.error });
  }
  function voice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return setErr("Voice search isn't supported in this browser. Try Chrome.");
    const r = new SR(); r.lang = lang; r.onresult = e => { const t = e.results[0][0].transcript; setQ(t); load(t, cat, loc); }; r.start();
  }
  const where = shown.location ? ` in ${shown.location}` : "";
  return (<main>
    <Promo />
    <section className="hero"><h1>Find it. Shop it.<br />Near you.</h1><p>We check local shops first, then look further for you.</p>
      <form className="searchbar" style={{ flexWrap: "wrap", borderRadius: 28 }} onSubmit={e => { e.preventDefault(); load(q, cat, loc); }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search a product, e.g. watch" aria-label="Search products" style={{ border: 0, padding: "10px 0", background: "none", minWidth: 150 }} />
        <select aria-label="Location" value={loc} onChange={e => setLoc(e.target.value)} style={{ width: "auto", border: 0, background: "var(--paper)", borderRadius: 999 }}>
          <option value="">📍 All locations</option>{locs.map(c => <option key={c} value={c}>{c}</option>)}</select>
        <select aria-label="Voice language" value={lang} onChange={e => setLang(e.target.value)} style={{ width: "auto", border: 0, background: "var(--paper)", borderRadius: 999 }}>
          <option value="en-IN">EN</option><option value="te-IN">తె</option><option value="hi-IN">हिं</option></select>
        <button type="button" className="icon" onClick={voice} aria-label="Search by voice">🎤</button><button>Search</button></form>
      <div className="chips">{CATS.map(c => <button key={c} className="chip" style={cat === c ? { background: "var(--ink)", color: "#fff" } : {}} onClick={() => { const n = cat === c ? "" : c; setCat(n); load(q, n, loc); }}>{c}</button>)}</div></section>
    {err && <p style={{ color: "var(--coral)" }}>{err}</p>}
    <AdSlot slot="homeTop" />
    <div className="sec"><h2>{shown.query ? `In our shops: “${shown.query}”${where}` : shown.location ? `Fresh in ${shown.location}` : "Fresh from our shops"}</h2></div>
    <div className="grid">{items?.map((p, n) => <Fragment key={p._id}>
      {n === 4 && <AdSlot slot="grid" className="card" />}
      <a className="card" href={`/p/${p.slug}`}>{p.images?.[0] && <img src={p.images[0]} alt="" loading="lazy" />}
        <div className="b"><div className="t">{p.title}</div><div className="price">{rupee(p.price)}</div><small className="muted">{p.sellerName}, {p.city}</small></div></a></Fragment>)}</div>
    {items && !items.length && <div className="empty">{shown.query ? `None of our shops${where} have “${shown.query}” yet.` : "No products found."}</div>}

    {shown.query && <section className="panel" style={{ marginTop: 24 }}>
      <h3>Where else to find “{shown.query}”{where || " in India"}</h3>
      {ai?.loading && <p className="muted" role="status"><span className="spinner" />Searching nearby shops with Meta AI… this can take several seconds.</p>}
      {ai?.error && <p style={{ color: "var(--coral)" }}>Meta AI couldn't answer: {ai.error}</p>}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))" }}>{ai?.places?.map((p, i) => <div key={i} className="card" style={{ padding: 14, gap: 4 }}>
        <div className="t">{p.name}</div>{p.area && <small className="muted">{p.area}</small>}<div>{p.why}</div>{p.url && <a href={p.url} target="_blank" rel="noreferrer">Website ↗</a>}</div>)}</div>
      {ai && !ai.loading && !ai.error && !ai.places?.length && <p className="muted">No specific places found.</p>}
      {ai?.note && <p className="muted">{ai.note}</p>}
      {ai?.sources?.length > 0 && <p><small className="muted">Sources: {ai.sources.map((s, i) => <span key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title.slice(0, 40)}</a>{i < ai.sources.length - 1 ? " · " : ""}</span>)}</small></p>}
      <small className="muted">These suggestions come from the web, not from shops on our platform. Check stock and opening hours before you go.</small></section>}
  </main>);
}
