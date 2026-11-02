import "./globals.css"; import { hasSession } from "@/lib/session";
const NAME = process.env.NEXT_PUBLIC_APP_NAME || "SellBuyAnywhere";
export const metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: { default: `${NAME}: find and sell anywhere`, template: `%s | ${NAME}` }, description: "Discover products from local shops. Open your own shop in minutes." };
const Logo = () => (<svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#3446e0" /><path d="M5 12 8 6h16l3 6z" fill="#ffb81c" />
  <path d="M11 6l-1.5 6M16 6v6M21 6l1.5 6" stroke="#3446e0" strokeWidth="1.6" /><rect x="7" y="14" width="18" height="12" rx="2" fill="#fff" /><rect x="13" y="18" width="6" height="8" rx="1.2" fill="#3446e0" /></svg>);
export default function Root({ children }) {
  const logged = hasSession(), i = NAME.indexOf("Anywhere"), [a, b] = i > 0 ? [NAME.slice(0, i), NAME.slice(i)] : [NAME, ""];
  return (<html lang="en"><body><div className="awning" /><div className="wrap">
    <nav className="nav"><a className="brand" href="/"><Logo />{a}<i>{b}</i></a>
      <span><a className="link" href="/shops">Shops</a><a className="link" href="/shops/new">Open a shop</a>
        <a className="link" href={logged ? "/dashboard" : "/login"}>{logged ? "My dashboard" : "Login"}</a></span></nav>
    {children}</div></body></html>);
}
