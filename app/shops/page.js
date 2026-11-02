"use client";
import { useEffect, useState } from "react";
export default function Shops() {
  const [s, setS] = useState([]); useEffect(() => { fetch("/api/shops").then(r => r.json()).then(setS); }, []);
  return (<main><div className="sec"><h2>Shops</h2><a href="/shops/new">Open your shop</a></div>
    <div className="grid" style={{ marginTop: 16 }}>{s.map(x => <a key={x.slug} className="card shopcard" href={`/s/${x.slug}`}>{x.logo && <img className="logo" src={x.logo} alt="" />}
      <div className="t">{x.name}</div><small className="muted">{x.category}, {x.city}</small><small>{x.description?.slice(0, 70)}</small></a>)}</div>
    {!s.length && <div className="empty">No shops yet. Be the first to open one.</div>}</main>);
}
