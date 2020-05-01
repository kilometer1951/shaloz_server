const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewShopSchema = new Schema({
  dateReviewed: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  shop: { type: Schema.Types.ObjectId, ref: "users" },
  comment: { type: String, default: "" },
  rateNumber: { type: Number, default: 0 }
});
mongoose.model("reviewShops", reviewShopSchema);
