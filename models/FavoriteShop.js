const mongoose = require("mongoose");
const { Schema } = mongoose;

const favoriteShopSchema = new Schema({
  date: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  seller: { type: Schema.Types.ObjectId, ref: "users" },
});
mongoose.model("favoriteShops", favoriteShopSchema);
