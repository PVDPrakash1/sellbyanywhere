import { ShopModel } from "./models";
export async function authShop(slug, token) { // returns shop or null
  const s = await ShopModel.findOne({ slug }).select("+ownerToken");
  return s && token && s.ownerToken === token ? s : null;
}
