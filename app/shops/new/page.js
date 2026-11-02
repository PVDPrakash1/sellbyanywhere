"use client";
import { useRef, useState } from "react";
import { PLANS, getPlan } from "@/lib/plans"; import ImageUpload from "@/app/ImageUpload";
export default function NewShop() {
  const [plan, setPlan] = useState("plus"), [f, setF] = useState({ name: "", ownerName: "", email: "", phone: "", whatsapp: "", address: "", city: "", category: "", description: "", logo: "", banner: "" });
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false), formRef = useRef(); const P = getPlan(plan), set = k => e => setF({ ...f, [k]: e.target.value });
  const choose = id => { setPlan(id); setErr(""); setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); };
  async function go(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    const o = await (await fetch("/api/shops", { method: "POST", body: JSON.stringify({ ...f, plan }) })).json(); if (o.error) { setBusy(false); return setErr(o.error); }
    if (!window.Razorpay) await new Promise(r => { const s = document.createElement("script"); s.src = "https://checkout.razorpay.com/v1/checkout.js"; s.onload = r; document.body.appendChild(s); });
    new window.Razorpay({ key: o.key, amount: o.amount, currency: "INR", order_id: o.orderId, name: `${P.name} plan`, description: f.name, prefill: { name: f.ownerName, email: f.email, contact: f.phone },
      modal: { ondismiss: () => { setBusy(false); setErr("Payment not completed. Press the button to try again."); } },
      handler: async r => { const v = await (await fetch("/api/shops/verify", { method: "POST", body: JSON.stringify(r) })).json();
        if (v.ok) location.href = `/shops/welcome?shop=${v.slug}`; else { setBusy(false); setErr(v.error || "Could not confirm payment. If money was deducted, contact support."); } } }).open();
  }
  const fields = [["name", "Shop name *"], ["ownerName", "Your name *"], ["email", "Email * (login details are sent here)"], ["phone", "Phone *"], ["whatsapp", "WhatsApp number (with country code, e.g. 919876543210)"], ["address", "Shop address"], ["city", "City"], ["category", "Category (Fashion, Electronics, Home, Food…)"]];
  return (<main>
    <div className="hero" style={{ paddingBottom: 0 }}><h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)" }}>Open your shop.<br />Pick a plan.</h1><p>Pick the plan that fits your shop. Prices are one-time.</p></div>
    <div className="plans">{PLANS.map(p => <div key={p.id} className={"plan" + (p.popular ? " featured" : "") + (plan === p.id ? " picked" : "")}>
      {p.popular && <span className="badge">Most popular</span>}<h3>{p.name}</h3>
      <div className="pprice">{p.price ? `₹${p.price}` : "Free"}{p.price > 0 && <small> one-time</small>}</div><p className="muted" style={{ margin: 0 }}>{p.tagline}</p>
      <ul>{p.features.map((x, i) => <li key={i}>{x.t}{x.soon && <em className="soon">soon</em>}</li>)}</ul>
      <button className={plan === p.id ? "" : "ghost"} onClick={() => choose(p.id)}>{plan === p.id ? "Selected ✓" : `Choose ${p.name}`}</button></div>)}</div>
    <form ref={formRef} onSubmit={go} style={{ maxWidth: 540, scrollMarginTop: 16 }}><h2>Your shop details <span className="planbadge">{P.name}{P.price ? ` · ₹${P.price}` : ""}</span></h2>
      <p className="muted">After payment we email your login so you can add products.</p>
      {fields.map(([k, label]) => <label key={k} style={{ display: "block", margin: "8px 0" }}><small>{label}</small><input value={f[k]} onChange={set(k)} type={k === "email" ? "email" : "text"} required={label.includes("*")} /></label>)}
      <ImageUpload label="Shop logo (square works best)" value={f.logo} onChange={v => setF(x => ({ ...x, logo: v }))} hint="PNG, JPG, WebP or GIF, up to 4 MB" />
      <ImageUpload wide label="Shop banner (wide image)" value={f.banner} onChange={v => setF(x => ({ ...x, banner: v }))} hint="Shown at the top of your shop page" />
      <label style={{ display: "block", margin: "8px 0" }}><small>About your shop</small><textarea rows={3} value={f.description} onChange={set("description")} /></label>
      <button disabled={busy}>{busy ? "Please wait…" : `Pay ₹${P.price} and open shop`}</button><p style={{ color: "var(--coral)" }}>{err}</p></form></main>);
}
