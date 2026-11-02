"use client";
import { useEffect, useState } from "react";
import { AD_SIZES } from "@/lib/adSlots";
// Shows an active ad for this slot (managed in /admin), or an "Advertise here" placeholder.
export default function AdSlot({ slot, className = "" }) {
  const [ad, setAd] = useState(undefined), kind = slot === "homeTop" ? "wide" : "box";
  useEffect(() => { fetch(`/api/ads?slot=${slot}`).then(r => r.json()).then(d => setAd(d.ad || null)).catch(() => setAd(null)); }, [slot]);
  if (ad === undefined) return <div className={`ad ad-${kind} ${className}`} aria-hidden="true" />; // reserves space
  if (ad) return (<a className={`ad ad-${kind} ${className}`} href={`/api/ads/click?id=${ad.id}`} target="_blank" rel="sponsored noopener noreferrer"><span className="adtag">Ad</span><img src={ad.image} alt={ad.alt || "Advertisement"} /></a>);
  const mail = process.env.NEXT_PUBLIC_AD_CONTACT || "ads@yourdomain.com";
  return (<a className={`ad ad-${kind} adempty ${className}`} href={`mailto:${mail}?subject=${encodeURIComponent("Advertising enquiry: " + slot)}`}>
    <span className="adtag">Ad space</span><b>Advertise here</b><small>Reach local buyers · {AD_SIZES[slot]}</small></a>);
}
