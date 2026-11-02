"use client";
import { useEffect, useState } from "react";
import { PLANS } from "@/lib/plans"; import { SLOTS, AD_SIZES } from "@/lib/adSlots"; import ImageUpload from "@/app/ImageUpload";
async function call(url, method = "GET", body) { const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (r.status === 401) { location.href = "/admin/login"; return null; } return r.json(); }
const rupee = p => "₹" + (p / 100).toLocaleString("en-IN"), day = d => (d ? new Date(d).toLocaleDateString("en-IN") : "—");
const blank = { slot: "homeTop", advertiser: "", image: "", href: "", alt: "", startsAt: "", endsAt: "" };
export default function Admin() {
  const [tab, setTab] = useState("shops"), [shops, setShops] = useState([]), [products, setProducts] = useState([]), [ads, setAds] = useState([]), [q, setQ] = useState(""), [msg, setMsg] = useState(""), [form, setForm] = useState(blank);
  const load = async () => { const [s, p, a] = await Promise.all([call("/api/admin/shops"), call("/api/admin/products"), call("/api/admin/ads")]); if (s) setShops(s); if (p) setProducts(p); if (a) setAds(a); };
  useEffect(() => { load(); }, []);
  const act = async (url, method, body, ask) => { if (ask && !confirm(ask)) return; const d = await call(url, method, body); setMsg(d?.error || ""); load(); };
  const has = (...t) => t.join(" ").toLowerCase().includes(q.toLowerCase());
  const logout = async () => { await call("/api/admin/auth", "DELETE"); location.href = "/admin/login"; };
  async function addAd(e) { e.preventDefault(); const d = await call("/api/admin/ads", "POST", form); if (d?.error) return setMsg(d.error); setMsg(""); setForm(blank); load(); }
  const set = k => e => setForm({ ...form, [k]: e.target.value });
  const st = (c, ok) => <span className={`tag ${ok ? "ok" : "bad"}`}>{c}</span>;
  return (<main><div className="sec"><h2>Admin panel</h2><a href="#" onClick={e => { e.preventDefault(); logout(); }}>Log out</a></div>
    <div className="stats">{[["Shops", shops.length], ["Active shops", shops.filter(s => s.status === "active").length], ["Awaiting payment", shops.filter(s => s.status === "pending").length], ["Products", products.length],
      ["Ad clicks", ads.reduce((n, a) => n + (a.clicks || 0), 0)]].map(([l, v]) => <div key={l} className="stat"><b>{v}</b><small className="muted">{l}</small></div>)}</div>
    <div className="tabs">{["shops", "products", "ads"].map(t => <button key={t} className={tab === t ? "on" : ""} onClick={() => { setTab(t); setQ(""); }}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
    {tab !== "ads" && <input placeholder={`Search ${tab}…`} value={q} onChange={e => setQ(e.target.value)} style={{ marginBottom: 12, maxWidth: 360 }} />}
    {msg && <p style={{ color: "var(--coral)" }}>{msg}</p>}

    {tab === "shops" && <div className="tablewrap"><table><tbody><tr><th>Shop</th><th>Owner</th><th>City</th><th>Plan</th><th>Products</th><th>Status</th><th>Joined</th><th /></tr>
      {shops.filter(s => has(s.name, s.email, s.ownerName, s.city)).map(s => <tr key={s._id}>
        <td><a href={`/s/${s.slug}`} target="_blank" rel="noreferrer">{s.name}</a></td><td>{s.ownerName}<br /><small className="muted">{s.email} · {s.phone}</small></td><td>{s.city}</td>
        <td><select value={s.plan} onChange={e => act(`/api/admin/shops/${s._id}`, "PATCH", { plan: e.target.value })}>{PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></td>
        <td>{s.products}</td><td>{st(s.status, s.status === "active")}</td><td>{day(s.createdAt)}</td>
        <td style={{ whiteSpace: "nowrap" }}>{s.status !== "pending" && <button className="ghost" onClick={() => act(`/api/admin/shops/${s._id}`, "PATCH", { status: s.status === "active" ? "suspended" : "active" })}>{s.status === "active" ? "Suspend" : "Activate"}</button>}{" "}
          <button className="ghost" onClick={() => act(`/api/admin/shops/${s._id}`, "DELETE", null, `Delete "${s.name}" and all its products? This cannot be undone.`)}>Delete</button></td></tr>)}</tbody></table></div>}

    {tab === "products" && <div className="tablewrap"><table><tbody><tr><th>Product</th><th>Shop</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr>
      {products.filter(p => has(p.title, p.sellerName, p.category)).map(p => <tr key={p._id}><td><a href={`/p/${p.slug}`} target="_blank" rel="noreferrer">{p.title}</a></td><td>{p.sellerName}</td><td>{rupee(p.price)}</td><td>{p.stock}</td>
        <td>{st(p.status, p.status === "active")}</td><td style={{ whiteSpace: "nowrap" }}><button className="ghost" onClick={() => act(`/api/admin/products/${p._id}`, "PATCH", { status: p.status === "active" ? "hidden" : "active" })}>{p.status === "active" ? "Hide" : "Show"}</button>{" "}
          <button className="ghost" onClick={() => act(`/api/admin/products/${p._id}`, "DELETE", null, `Delete "${p.title}"?`)}>Delete</button></td></tr>)}</tbody></table></div>}

    {tab === "ads" && <><form onSubmit={addAd} style={{ maxWidth: 560, marginBottom: 20 }}><h3>Add an ad</h3>
      <select value={form.slot} onChange={set("slot")} style={{ marginBottom: 8 }}>{SLOTS.map(s => <option key={s} value={s}>{s} ({AD_SIZES[s]})</option>)}</select>
      <input placeholder="Advertiser name" value={form.advertiser} onChange={set("advertiser")} style={{ marginBottom: 8 }} />
      <ImageUpload wide={form.slot === "homeTop"} label="Ad image" value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} hint={`Ideal size ${AD_SIZES[form.slot]}`} />
      <input placeholder="Link when clicked (https://…)" value={form.href} onChange={set("href")} required style={{ margin: "8px 0" }} />
      <input placeholder="Image description (for screen readers)" value={form.alt} onChange={set("alt")} />
      <p style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><label><small>Starts</small><br /><input type="date" value={form.startsAt} onChange={set("startsAt")} /></label><label><small>Ends</small><br /><input type="date" value={form.endsAt} onChange={set("endsAt")} /></label></p>
      <button>Add ad</button></form>
      <div className="tablewrap"><table><tbody><tr><th>Ad</th><th>Slot</th><th>Advertiser</th><th>Dates</th><th>Views</th><th>Clicks</th><th>Status</th><th /></tr>
        {ads.map(a => <tr key={a._id}><td><img src={a.image} alt="" style={{ width: 90, height: 40, objectFit: "cover", borderRadius: 6 }} /></td><td>{a.slot}</td><td>{a.advertiser}</td><td>{day(a.startsAt)} to {day(a.endsAt)}</td>
          <td>{a.impressions}</td><td>{a.clicks}</td><td>{st(a.active ? "running" : "paused", a.active)}</td><td style={{ whiteSpace: "nowrap" }}>
            <button className="ghost" onClick={() => act(`/api/admin/ads/${a._id}`, "PATCH", { active: !a.active })}>{a.active ? "Pause" : "Resume"}</button>{" "}
            <button className="ghost" onClick={() => act(`/api/admin/ads/${a._id}`, "DELETE", null, "Delete this ad?")}>Delete</button></td></tr>)}</tbody></table></div>
      {!ads.length && <div className="empty">No ads yet. Empty slots show "Advertise here" to visitors.</div>}</>}</main>);
}
