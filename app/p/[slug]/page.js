import { db } from "@/lib/db"; import { ProductModel, ShopModel } from "@/lib/models"; import { notFound } from "next/navigation"; import AdSlot from "@/app/AdSlot";
const get = async slug => { await db(); return ProductModel.findOne({ slug }).lean(); };
export async function generateMetadata({ params }) { const p = await get(params.slug); if (!p) return {};
  return { title: p.title, description: p.description, openGraph: { title: p.title, description: p.description, images: p.images } }; }
export default async function Page({ params }) {
  const p = await get(params.slug); if (!p) notFound();
  const s = await ShopModel.findOne({ slug: p.shopSlug, status: "active" }).lean(); if (!s) notFound();
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/p/${p.slug}`, msg = encodeURIComponent(`Hi, I'm interested in "${p.title}" (₹${p.price / 100}) on ${process.env.NEXT_PUBLIC_APP_NAME || "SellBuyAnywhere"}: ${url}`);
  return (<main className="pdp">{p.images?.[0] && <img src={p.images[0]} alt={p.title} />}
    <div><span className="badge">{p.category}</span><h1 style={{ fontSize: "2.2rem" }}>{p.title}</h1>
      <div className="price" style={{ fontSize: "1.8rem" }}>₹{(p.price / 100).toLocaleString("en-IN")}</div><p>{p.description}</p><p className="muted">{p.stock} in stock</p>
      <div className="panel"><h3>Contact the seller</h3><b>{s.name}</b><p style={{ margin: "4px 0" }}>{s.ownerName}<br />{s.address} {s.city}</p>
        <p style={{ margin: "4px 0" }}>📞 <a href={`tel:${s.phone}`}>{s.phone}</a><br />✉️ <a href={`mailto:${s.email}?subject=${encodeURIComponent(p.title)}`}>{s.email}</a></p>
        <p style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><a href={`tel:${s.phone}`}><button>Call</button></a>
          {s.whatsapp && <a href={`https://wa.me/${s.whatsapp}?text=${msg}`} target="_blank" rel="noreferrer"><button className="ghost">WhatsApp</button></a>}
          <a href={`/s/${s.slug}`}><button className="ghost">Visit shop</button></a></p></div>
      <div style={{ margin: "16px 0" }}><AdSlot slot="product" /></div>
      <p><small className="muted">Share: <a href={`https://wa.me/?text=${msg}`} target="_blank" rel="noreferrer">WhatsApp</a> · <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer">Facebook</a></small></p></div></main>);
}
