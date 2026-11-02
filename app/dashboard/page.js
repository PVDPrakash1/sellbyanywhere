"use client";
import { useEffect, useState } from "react";
import { PLANS, getPlan } from "@/lib/plans";
export default function Dashboard() {
  const [shop, setShop] = useState(null), [items, setItems] = useState([]), [msg, setMsg] = useState("");
  async function load() { const r = await fetch("/api/auth/me"); if (!r.ok) return (location.href = "/login"); const s = await r.json(); setShop(s);
    setItems(await (await fetch(`/api/products?shop=${s.slug}`)).json()); }
  useEffect(() => { load(); }, []);
  async function del(id) { if (!confirm("Delete this product?")) return; await fetch(`/api/products/${id}`, { method: "DELETE" }); load(); }
  async function logout() { await fetch("/api/auth/logout", { method: "POST", body: "{}" }); location.href = "/"; }
  async function upgrade(id) { setMsg("");
    const o = await (await fetch("/api/plan", { method: "POST", body: JSON.stringify({ plan: id }) })).json(); if (o.error) return setMsg(o.error);
    if (!window.Razorpay) await new Promise(r => { const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = r; document.body.appendChild(s); });
    new window.Razorpay({ key: o.key, amount: o.amount, currency: "INR", order_id: o.orderId, name: `Upgrade to ${getPlan(id).name}`,
      handler: async r => { const v = await (await fetch("/api/plan", { method: "PUT", body: JSON.stringify(r) })).json(); setMsg(v.ok ? "Plan upgraded 🎉" : v.error); load(); } }).open(); }
  if (!shop) return <p>Loading…</p>; const plan = getPlan(shop.plan), higher = PLANS.filter(p => p.price > plan.price);
  return (<main><div className="sec"><h2>{shop.name}<span className="planbadge">{plan.name} plan</span></h2><span><a href={`/s/${shop.slug}`}>View my shop</a> · <a href="#" onClick={e => { e.preventDefault(); logout(); }}>Log out</a></span></div>
    <div className="panel"><b>Buyers see these contact details:</b><br />{shop.ownerName} · {shop.phone}{shop.whatsapp ? ` · WhatsApp ${shop.whatsapp}` : ""} · {shop.email}</div>
    {higher.length > 0 && <div className="panel" style={{ marginTop: 14 }}><b>Grow your shop</b> <small className="muted">(one-time payment)</small>
      <p style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{higher.map(p => <button key={p.id} className="ghost" onClick={() => upgrade(p.id)}>Upgrade to {p.name} · ₹{p.price}</button>)}</p>{msg && <small>{msg}</small>}</div>}
    <div className="sec"><h3>Your products ({items.length}{plan.maxProducts ? ` of ${plan.maxProducts}` : ""})</h3><a href="/sell"><button>+ Add product</button></a></div>
    <table><tbody><tr><th>Product</th><th>Price</th><th>Stock</th><th /></tr>
      {items.map(p => <tr key={p._id}><td><a href={`/p/${p.slug}`}>{p.title}</a></td><td>₹{(p.price / 100).toLocaleString("en-IN")}</td><td>{p.stock}</td><td><button className="ghost" onClick={() => del(p._id)}>Delete</button></td></tr>)}</tbody></table>
    {!items.length && <div className="empty">No products yet. Add your first one.</div>}</main>);
}
