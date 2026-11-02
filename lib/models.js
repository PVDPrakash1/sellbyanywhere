import mongoose from "mongoose";
const { Schema, models, model } = mongoose;
const Shop = new Schema({
  name: { type: String, required: true }, slug: { type: String, unique: true }, description: String, category: String,
  ownerName: String, email: { type: String, lowercase: true, trim: true, index: true }, phone: String, whatsapp: String, address: String, city: String,
  logo: String, banner: String,
  status: { type: String, default: "pending", index: true }, // pending (awaiting payment) | active | suspended
  plan: { type: String, default: "basic" }, pendingUpgrade: { orderId: String, plan: String },
  passwordHash: { type: String, select: false },
  razorpayOrderId: { type: String, index: true }, razorpayPaymentId: String, welcomeEmailSent: { type: Boolean, default: false },
}, { timestamps: true });
const Product = new Schema({
  title: { type: String, required: true }, description: String, category: String, tags: [String],
  price: { type: Number, required: true }, stock: { type: Number, default: 1 }, images: [String], city: String,
  sellerName: String, shopSlug: { type: String, index: true }, status: { type: String, default: "active" }, slug: { type: String, unique: true },
}, { timestamps: true });
export const ShopModel = models.Shop || model("Shop", Shop);
export const ProductModel = models.Product || model("Product", Product);

const Ad = new Schema({
  slot: { type: String, index: true }, advertiser: String, image: String, href: String, alt: String,
  active: { type: Boolean, default: true }, startsAt: Date, endsAt: Date,
  impressions: { type: Number, default: 0 }, clicks: { type: Number, default: 0 },
}, { timestamps: true });
export const AdModel = models.Ad || model("Ad", Ad);
