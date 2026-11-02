import { db } from "@/lib/db"; import { ShopModel, ProductModel } from "@/lib/models"; import { notFound } from "next/navigation";
const get = async slug => { await db(); return ShopModel.findOne({ slug, status: "active" }).lean(); };
export async function generateMetadata({ params }) { const s = await get(params.slug); if (!s) return {};
  return { title: s.name, description: s.description, openGraph: { title: s.name, description: s.description, images: [s.banner || s.logo].filter(Boolean) } }; }
export default async function Storefront({ params }) {
  const s = await get(params.slug); if (!s) notFound();
  const products = await ProductModel.find({ shopSlug: s.slug, status: "active" }).sort("-createdAt").lean();
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/s/${s.slug}`;
  return (<main><div className="shophead">{s.banner && <img className="banner" src={s.banner} alt="" />}
    <div className="row">{s.logo && <img className="logo" src={s.logo} alt="" />}<div style={{ flex: 1 }}><h2 style={{ margin: 0 }}>{s.name}</h2><span className="muted">{s.category}, {s.city}</span></div>
      {s.whatsapp && <a href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Hi " + s.name)}`}><button>WhatsApp</button></a>}
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer"><button className="ghost">Share</button></a></div>
    <p style={{ padding: "0 20px", margin: 0 }}>{s.description}</p>
    <p className="muted" style={{ padding: "8px 20px 16px", margin: 0 }}>{s.address} {s.city} · 📞 <a href={`tel:${s.phone}`}>{s.phone}</a> · ✉️ <a href={`mailto:${s.email}`}>{s.email}</a></p></div>
    <div className="sec"><h2>Products</h2><small>{products.length} items</small></div>
    <div className="grid">{products.map(p => <a key={p._id} className="card" href={`/p/${p.slug}`}>{p.images?.[0] && <img src={p.images[0]} alt="" loading="lazy" />}
      <div className="b"><div className="t">{p.title}</div><div className="price">₹{(p.price / 100).toLocaleString("en-IN")}</div></div></a>)}</div>
    {!products.length && <div className="empty">This shop hasn't listed anything yet.</div>}</main>);
}
