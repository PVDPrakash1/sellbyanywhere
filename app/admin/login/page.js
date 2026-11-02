"use client";
import { useState } from "react";
export default function AdminLogin() {
  const [email, setEmail] = useState(""), [password, setPassword] = useState(""), [err, setErr] = useState("");
  async function go(e) { e.preventDefault(); setErr(""); const r = await fetch("/api/admin/auth", { method: "POST", body: JSON.stringify({ email, password }) }), d = await r.json(); if (!r.ok) return setErr(d.error); location.href = "/admin"; }
  return (<form onSubmit={go} style={{ maxWidth: 380, margin: "30px auto" }}><h2>Admin login</h2>
    <input type="email" placeholder="Admin email" value={email} onChange={e => setEmail(e.target.value)} required style={{ marginBottom: 8 }} />
    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required /><p><button>Log in</button></p><p style={{ color: "var(--coral)" }}>{err}</p></form>);
}
