"use client";
import { useEffect, useState } from "react"; import { PLANS } from "@/lib/plans";
const LINES = ["Add your shop", "Get your own website", "Reach local buyers", "Start selling today"];
const STEPS = [["Add your shop", "Takes two minutes"], ["Get your website", "Your own page, ready to share"], ["Customers contact you", "Calls and WhatsApp, straight to you"]];
export default function Promo() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(n => (n + 1) % LINES.length), 2600); return () => clearInterval(t); }, []);
  const url = `${process.env.NEXT_PUBLIC_SITE_DOMAIN || "sellbuyanywhere.com"}/s/your-shop`;
  return (<section className="promo"><div>
      <span className="badge">For shop owners · plans from ₹{Math.min(...PLANS.map(p => p.price))}</span>
      <h2 className="rot" aria-live="polite"><span key={i} className="rise">{LINES[i]}.</span></h2>
      <ol className="steps">{STEPS.map(([t, s], n) => <li key={t} style={{ animationDelay: `${n * 0.25}s` }}><b>{n + 1}</b><div>{t}<small>{s}</small></div></li>)}</ol>
      <a href="/shops/new"><button className="pulse">Open your shop →</button></a></div>
    <div className="browser" aria-hidden="true"><div className="bar"><i /><i /><i /><span className="typing" style={{ "--n": url.length }}>{url}</span></div>
      <div className="mock">{[0, 1, 2, 3].map(n => <div key={n} className="mcard" style={{ animationDelay: `${0.5 + n * 0.25}s` }}><div className="mimg" /><div className="mline" /><div className="mline s" /></div>)}</div></div></section>);
}
