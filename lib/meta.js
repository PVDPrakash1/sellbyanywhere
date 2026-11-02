const G = "https://graph.facebook.com/v21.0", T = "https://graph.threads.net/v1.0";
const post = async (url, body) => { const r = await fetch(url, { method: "POST", body: new URLSearchParams(body) });
  const j = await r.json(); if (j.error) throw new Error(j.error.message); return j; };

export async function shareFacebook(p, url) {
  return post(`${G}/${process.env.FB_PAGE_ID}/photos`, { url: p.images[0], caption: `${p.title}\n${url}`, access_token: process.env.FB_PAGE_TOKEN });
}
export async function shareInstagram(p, url) { // needs Business/Creator account; image must be public
  const c = await post(`${G}/${process.env.IG_BUSINESS_ID}/media`, { image_url: p.images[0], caption: `${p.title}\n${url}`, access_token: process.env.IG_TOKEN });
  return post(`${G}/${process.env.IG_BUSINESS_ID}/media_publish`, { creation_id: c.id, access_token: process.env.IG_TOKEN });
}
export async function shareThreads(p, url) {
  const c = await post(`${T}/${process.env.THREADS_USER_ID}/threads`, { media_type: "IMAGE", image_url: p.images[0], text: `${p.title} ${url}`, access_token: process.env.THREADS_TOKEN });
  return post(`${T}/${process.env.THREADS_USER_ID}/threads_publish`, { creation_id: c.id, access_token: process.env.THREADS_TOKEN });
}
// Link fallbacks (WhatsApp has no auto-post API; personal profiles need the share dialog)
export const shareLinks = (p, url) => ({
  whatsapp: `https://wa.me/?text=${encodeURIComponent(p.title + " " + url)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
});
export const SHARERS = { facebook: shareFacebook, instagram: shareInstagram, threads: shareThreads };
