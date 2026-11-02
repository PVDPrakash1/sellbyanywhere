import mongoose from "mongoose";
export async function db() {
  if (!global._mongo) global._mongo = mongoose.connect(process.env.MONGODB_URI);
  await global._mongo;
}
