import { ShopModel } from "./models"; import { hashPassword, newPassword } from "./session"; import { sendLoginEmail } from "./mail";
// Called by BOTH the browser verify step and the Razorpay webhook. The atomic pending->active update means only one caller wins, so the email goes out once.
export async function activateShop(orderId, paymentId) {
  const password = newPassword();
  const shop = await ShopModel.findOneAndUpdate({ razorpayOrderId: orderId, status: "pending" },
    { status: "active", razorpayPaymentId: paymentId, passwordHash: hashPassword(password) }, { new: true });
  if (!shop) return ShopModel.findOne({ razorpayOrderId: orderId, status: "active" }); // already activated by the other path
  try { const sent = await sendLoginEmail(shop, password); await ShopModel.updateOne({ _id: shop._id }, { welcomeEmailSent: sent }); }
  catch (e) { console.error("Welcome email failed:", e.message); } // owner can use "Forgot password" on /login to get a fresh one
  return shop;
}

// Applies a paid plan upgrade (called by the verify step and by the webhook; safe to call twice).
export async function applyUpgrade(orderId) {
  const s = await ShopModel.findOne({ "pendingUpgrade.orderId": orderId }); if (!s) return null;
  await ShopModel.updateOne({ _id: s._id, "pendingUpgrade.orderId": orderId }, { plan: s.pendingUpgrade.plan, $unset: { pendingUpgrade: "" } });
  return s.pendingUpgrade.plan;
}
