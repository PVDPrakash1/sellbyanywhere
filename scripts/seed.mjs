// Usage: npm run seed  (Node 20+). Wipes + reseeds demo shops and products. Demo login: jaipur@example.com / demo1234
import mongoose from "mongoose"; import crypto from "crypto";
await mongoose.connect(process.env.MONGODB_URI); const d = mongoose.connection, now = new Date();
const hash = pw => { const salt = crypto.randomBytes(16).toString("hex"); return `${salt}:${crypto.scryptSync(pw, salt, 32).toString("hex")}`; };
const img = s => `https://picsum.photos/seed/${s}/640/480`;
const shops = [
  ["jaipur-weaves", "Jaipur Weaves", "Fashion", "Jaipur", "jaipur@example.com", "Asha Rao", "Hand-block printed cottons and silks from family looms."],
  ["byte-bazaar", "Byte Bazaar", "Electronics", "Hyderabad", "byte@example.com", "Ravi Kumar", "Refurbished laptops, audio gear and smart accessories."],
  ["green-hearth", "Green Hearth", "Home", "Bengaluru", "green@example.com", "Meera Nair", "Planters, lamps and slow-made home decor."],
  ["spice-route-kitchen", "Spice Route Kitchen", "Food", "Kochi", "spice@example.com", "Joseph Mathew", "Small-batch spices, pickles and filter coffee."],
].map(([slug, name, category, city, email, ownerName, description], i) => ({ slug, name, category, city, email, ownerName, description, phone: `+91 99000 0000${i + 1}`, whatsapp: `9199000000${i + 1}`,
  address: `${12 + i}, Market Road`, logo: img(slug + "-logo"), banner: `https://picsum.photos/seed/${slug}-b/1200/300`, plan: ["pro", "plus", "basic", "basic"][i], status: "active", passwordHash: hash("demo1234"), welcomeEmailSent: true, createdAt: now, updatedAt: now }));
const P = [
  ["jaipur-weaves", "Block-print cotton kurta", "Fashion", 1499, "Breathable indigo kurta, hand-block printed.", ["kurta", "cotton"]],
  ["jaipur-weaves", "Red leather handbag", "Fashion", 3299, "Structured red handbag with brass fittings.", ["handbag", "leather"]],
  ["jaipur-weaves", "Silk dupatta", "Fashion", 1899, "Pure silk dupatta in saffron and plum.", ["dupatta", "silk"]],
  ["jaipur-weaves", "Kolhapuri leather sandals", "Fashion", 999, "Hand-stitched tan sandals.", ["sandals", "leather"]],
  ["byte-bazaar", "Refurbished ThinkPad T14", "Electronics", 38999, "16GB RAM, 512GB SSD, 6-month warranty.", ["laptop"]],
  ["byte-bazaar", "Wireless noise-cancelling headphones", "Electronics", 4999, "40-hour battery, foldable.", ["headphones"]],
  ["byte-bazaar", "Mechanical keyboard, hot-swap", "Electronics", 3799, "75% layout with tactile switches.", ["keyboard"]],
  ["byte-bazaar", "Smart LED desk lamp", "Electronics", 1799, "App-controlled warm and cool light.", ["lamp"]],
  ["green-hearth", "Terracotta planter set of 3", "Home", 899, "Glazed planters with drainage trays.", ["planter"]],
  ["green-hearth", "Handwoven jute rug", "Home", 2499, "Natural jute, 4x6 ft.", ["rug"]],
  ["green-hearth", "Brass diya lamp pair", "Home", 749, "Polished brass lamps for festivals.", ["diya", "brass"]],
  ["green-hearth", "Walnut wood serving tray", "Home", 1299, "Hand-finished walnut with brass handles.", ["tray"]],
  ["spice-route-kitchen", "Malabar pepper and cardamom box", "Food", 649, "Whole spices, single-estate.", ["spices"]],
  ["spice-route-kitchen", "Mango pickle, 500g", "Food", 349, "Sun-cured, no preservatives.", ["pickle"]],
  ["spice-route-kitchen", "Filter coffee powder, 1kg", "Food", 799, "80/20 coffee-chicory blend.", ["coffee"]],
  ["spice-route-kitchen", "Cold-pressed coconut oil, 1L", "Food", 549, "Wooden-press, unrefined.", ["oil", "coconut"]],
];
const by = Object.fromEntries(shops.map(s => [s.slug, s]));
const products = P.map(([shop, title, category, rs, description, tags]) => { const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).slice(2, 6);
  return { title, category, description, tags, price: rs * 100, stock: 10, images: [img(slug)], city: by[shop].city, sellerName: by[shop].name, shopSlug: shop, status: "active", slug, createdAt: now, updatedAt: now }; });
for (const c of ["shops", "products", "campaigns"]) await d.collection(c).deleteMany({});
await d.collection("shops").insertMany(shops); await d.collection("products").insertMany(products);
console.log(`Seeded ${shops.length} shops and ${products.length} products.\nDemo shop login: jaipur@example.com / demo1234  (all demo shops use password demo1234)`);
await mongoose.disconnect();
