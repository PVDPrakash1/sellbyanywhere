"use client";
import { useState } from "react";
export default function ImageUpload({ label, value, onChange, hint, wide }) {
  const [busy, setBusy] = useState(false), [err, setErr] = useState("");
  async function pick(e) { const file = e.target.files[0]; if (!file) return; setErr(""); setBusy(true);
    const fd = new FormData(); fd.append("file", file); const r = await fetch("/api/upload", { method: "POST", body: fd }), d = await r.json(); setBusy(false); e.target.value = "";
    if (!r.ok) return setErr(d.error); onChange(d.url); }
  const cls = wide ? "upl-wide" : "upl-sq";
  return (<div style={{ margin: "12px 0" }}><small>{label}</small><div className="upl">
    {value ? <img src={value} alt="" className={cls} /> : <div className={`upl-empty ${cls}`}>No image</div>}
    <div><label className="btnlike">{busy ? "Uploading…" : value ? "Change" : "Upload image"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={pick} disabled={busy} /></label>
      {value && <button type="button" className="ghost" style={{ marginLeft: 8 }} onClick={() => onChange("")}>Remove</button>}
      <div><small className="muted">{hint}</small>{err && <small style={{ color: "var(--coral)" }}> {err}</small>}</div></div></div></div>);
}
