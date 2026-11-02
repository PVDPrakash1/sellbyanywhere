// Single source of truth for plans. Prices are charged from HERE on the server (never trusted from the browser).
// `soon: true` marks features that are listed on the plan but not built yet. Remove the flag when you ship each one.
export const PLANS = [
  { id: "basic", name: "Basic", price: 100, maxProducts: 25, tagline: "A proper shop page for your business.",
    features: [{ t: "Your own shop page (mini website)" }, { t: "Up to 25 products" }, { t: "Contact details on every product" }, { t: "Call and WhatsApp buttons" }, { t: "Logo, banner and share links" }] },
  { id: "plus", name: "Plus", price: 499, maxProducts: 100, popular: true, tagline: "Shop with an AI assistant and recommendations.",
    features: [{ t: "Everything in Basic" }, { t: "Up to 100 products" }, { t: "AI chat assistant for your customers", soon: true }, { t: "Smart product recommendations", soon: true }] },
  { id: "pro", name: "Pro", price: 999, maxProducts: null, tagline: "Full e-commerce, powered by AI.",
    features: [{ t: "Everything in Plus" }, { t: "Unlimited products" }, { t: "Cart and online checkout (Razorpay)", soon: true }, { t: "AI sales insights and order tools", soon: true }] },
];
export const isPlan = id => PLANS.some(p => p.id === id);
export const getPlan = id => PLANS.find(p => p.id === id) || PLANS[0]; // any old "free" shop falls back to Basic
