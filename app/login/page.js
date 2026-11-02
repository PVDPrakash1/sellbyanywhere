"use client";
import { useState } from "react";
export default function Login() {
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [msg, setMsg] = useState(""), [err, setErr] = useState("");
  async function login(e) { e.preventDefault(); setErr(""); const r = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); const d = await r.json();
    if (!r.ok) return setErr(d.error); location.href = "/dashboard"; }
  async function forgot() { if (!email) return setErr("Enter your email first."); setErr(""); await fetch("/api/auth/forgot", { method: "POST", body: JSON.stringify({ email }) }); setMsg("If that email has a shop, a new password is on its way."); }
  return (<form onSubmit={login} style={{ maxWidth: 400, margin: "30px auto" }}><h2>Shop owner login</h2>
    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ marginBottom: 8 }} />
    <input type="password" placeholder="Password from your email" value={password} onChange={e => setPassword(e.target.value)} required />
    <p><button>Log in</button> <button type="button" className="ghost" onClick={forgot}>Email me a new password</button></p>
    <p style={{ color: "var(--coral)" }}>{err}</p><p className="muted">{msg}</p><p>No shop yet? <a href="/shops/new">Open one</a>.</p></form>);
}
