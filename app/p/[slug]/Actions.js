"use client";
import { useState } from "react";
export default function Actions({ id, title }) {
  const [buyer, setBuyer] = useState({ name: "", phone: "", address: "", city: "", pincode: "" }), [msg, setMsg] = useState("");
  async function share() { setMsg("Sharing…"); const d = await (await fetch(`/api/products/${id}/share`, { method: "POST", body: "{}" })).json();
    setMsg(Object.entries(d.results).map(([k, v]) => `${k}: ${v}`).join(" | ") + " — or "); window._links = d.links; setMsg(m => m); 
    const w = d.links.whatsapp; setMsg(Object.entries(d.results).map(([k, v]) => `${k}: ${v}`).join(" | ")); window.open(w, "_blank"); }
  async function buy() {
    if (!buyer.name || !buyer.address) return setMsg("Fill delivery details");
    if (!window.Razorpay) await new Promise(r => { const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = r; document.body.appendChild(s); });
    const o = await (await fetch("/api/checkout/create-order", { method: "POST", body: JSON.stringify({ productId: id, buyer }) })).json();
    if (o.error) return setMsg(o.error);
    new window.Razorpay({ key: o.key, amount: o.amount, currency: "INR", name: "ShopAnywhere", description: title, order_id: o.orderId,
      prefill: { name: buyer.name, contact: buyer.phone },
      handler: async r => { const v = await fetch("/api/checkout/verify", { method: "POST", body: JSON.stringify(r) }); setMsg(v.ok ? "✅ Payment successful! Order placed." : "Verification failed"); } }).open(); }
  const i = { display: "block", width: "100%", padding: 6, margin: "4px 0" };
  return (<div style={{ marginTop: 16 }}>
    {["name", "phone", "address", "city", "pincode"].map(k => <input key={k} style={i} placeholder={k} value={buyer[k]} onChange={e => setBuyer({ ...buyer, [k]: e.target.value })} />)}
    <button onClick={buy}>Buy now (Razorpay)</button> <button onClick={share}>Share to Meta (1 click)</button><p>{msg}</p></div>);
}
