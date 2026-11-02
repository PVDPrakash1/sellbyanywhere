"use client";
import { useState } from "react";
const CATS = ["Fashion", "Electronics", "Home", "Food", "Handmade", "Beauty", "Other"];
export default function Sell() {
  const [f, setF] = useState({ title: "", description: "", category: "Fashion", tags: "", price: "", stock: 1, image: "" }), [err, setErr] = useState("");
  const set = k => e => setF({ ...f, [k]: e.target.value }); const i = { display: "block", margin: "6px 0" };
  async function save(e) { e.preventDefault(); setErr("");
    const r = await fetch("/api/products", { method: "POST", body: JSON.stringify({ ...f, images: [f.image], tags: f.tags.split(",").map(t => t.trim()).filter(Boolean) }) });
    if (r.status === 401) return (location.href = "/login"); const d = await r.json(); if (d.error) return setErr(d.error); location.href = "/dashboard"; }
  return (<form onSubmit={save} style={{ maxWidth: 520 }}><h2>Add a product</h2>
    <input style={i} placeholder="Product title *" value={f.title} onChange={set("title")} required />
    <textarea style={i} rows={3} placeholder="Description" value={f.description} onChange={set("description")} />
    <select style={i} value={f.category} onChange={set("category")}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
    <input style={i} placeholder="Tags (comma separated)" value={f.tags} onChange={set("tags")} />
    <input style={i} type="number" min="1" placeholder="Price in ₹ *" value={f.price} onChange={set("price")} required />
    <input style={i} type="number" min="1" placeholder="Stock" value={f.stock} onChange={set("stock")} />
    <input style={i} placeholder="Image URL (public link)" value={f.image} onChange={set("image")} />
    <button>Save product</button><p style={{ color: "var(--coral)" }}>{err}</p></form>);
}
