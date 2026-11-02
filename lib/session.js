import crypto from "crypto"; import { cookies } from "next/headers";
import { db } from "./db"; import { ShopModel } from "./models";
const secret = () => process.env.AUTH_SECRET || "dev-secret-change-me"; // set AUTH_SECRET in production
export const newPassword = () => crypto.randomBytes(9).toString("base64url");
export function hashPassword(pw) { const salt = crypto.randomBytes(16).toString("hex"); return `${salt}:${crypto.scryptSync(pw, salt, 32).toString("hex")}`; }
export function checkPassword(pw, stored = "") {
  const [salt, h] = stored.split(":"); if (!salt || !h) return false;
  const a = crypto.scryptSync(pw, salt, 32), b = Buffer.from(h, "hex"); return a.length === b.length && crypto.timingSafeEqual(a, b);
}
const sig = p => crypto.createHmac("sha256", secret()).update(p).digest("hex");
export const makeToken = id => { const p = `${id}.${Date.now() + 7 * 864e5}`; return `${p}.${sig(p)}`; };
function idFromToken(t) {
  if (!t) return null; const i = t.lastIndexOf("."), p = t.slice(0, i), s = t.slice(i + 1), e = sig(p);
  if (s.length !== e.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(e))) return null;
  const [id, exp] = p.split("."); return Number(exp) > Date.now() ? id : null;
}
export const hasSession = () => !!idFromToken(cookies().get("sid")?.value);
export async function sessionShop() { const id = idFromToken(cookies().get("sid")?.value); if (!id) return null; await db(); return ShopModel.findOne({ _id: id, status: "active" }); }
// Admin panel session (separate cookie "aid"; token id is the literal "admin", which no shop id can equal)
export const adminToken = () => makeToken("admin");
export const isAdmin = () => idFromToken(cookies().get("aid")?.value) === "admin";
