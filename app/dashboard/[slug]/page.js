"use client";
import { useEffect, useState } from "react";
export default function Dashboard({ params }) {
  const slug = params.slug, [data, setData] = useState(null), [camps, setCamps] = useState([]), [msg, setMsg] = useState("");
  const [topup, setTopup] = useState(500), [pid, setPid] = useState(""), [bid, setBid] = useState(2), [token, setToken] = useState("");
  const H = t => ({ "x-shop-token": t || token, "Content-Type": "application/json" });
  async function load(t) { setData(await (await fetch(`/api/shops/${slug}`)).json());
    const r = await fetch(`/api/ads?shop=${slug}`, { headers: H(t) }); if (r.ok) setCamps(await r.json()); }
  useEffect(() => { const k = new URLSearchParams(location.search).get("key"); if (k) localStorage.setItem(`shop:${slug}`, k); const t = localStorage.getItem(`shop:${slug}`) || ""; setToken(t); load(t); }, []);
  async function pay() {
    const o = await (await fetch("/api/ads/topup", { method: "POST", headers: H(), body: JSON.stringify({ slug, amountRupees: topup }) })).json(); if (o.error) return setMsg(o.error);
    if (!window.Razorpay) await new Promise(r => { const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = r; document.body.appendChild(s); });
    new window.Razorpay({ key: o.key, amount: o.amount, currency: "INR", order_id: o.orderId, name: "Ad credit", handler: () => { setMsg("Payment received — credit updates in a few seconds."); setTimeout(() => load(), 4000); } }).open(); }
  async function promote() { const r = await (await fetch("/api/ads", { method: "POST", headers: H(), body: JSON.stringify({ shopSlug: slug, productId: pid, bidRupees: bid }) })).json(); setMsg(r.error || "Campaign started"); load(); }
  if (!data?.shop) return <p>Loading…</p>; const { shop, products } = data;
  return (<main><h2>{shop.name} — dashboard</h2>
    <p><a href={`/s/${slug}`}>View storefront</a> · <a href={`/sell?shop=${slug}`}>+ Add product</a></p>
    <h3>Ad credit: ₹{((shop.adCredit || 0) / 100).toFixed(2)}</h3>
    <input type="number" value={topup} onChange={e => setTopup(e.target.value)} /> <button onClick={pay}>Add credit (Razorpay)</button>
    <h3>Promote a product</h3>
    <select value={pid} onChange={e => setPid(e.target.value)}><option value="">Select product</option>{products.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}</select>{" "}
    ₹<input type="number" value={bid} onChange={e => setBid(e.target.value)} style={{ width: 60 }} /> per click <button onClick={promote} disabled={!pid}>Start</button>
    <p>{msg}</p><h3>Campaigns</h3>
    <table cellPadding={6}><tbody><tr><th>Product</th><th>Bid</th><th>Impr.</th><th>Clicks</th><th>Spent</th><th>Status</th></tr>
      {camps.map(c => <tr key={c._id}><td>{c.productId?.title}</td><td>₹{c.bid / 100}</td><td>{c.impressions}</td><td>{c.clicks}</td><td>₹{(c.spent / 100).toFixed(2)}</td><td>{c.status}</td></tr>)}</tbody></table></main>);
}
