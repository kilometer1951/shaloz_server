const mongoose = require("mongoose");
const { Schema } = mongoose;

const loyaltyPointsSchema = new Schema({
  date: { type: Date, default: Date.now },
  buyer: { type: Schema.Types.ObjectId, ref: "users" },
  seller: { type: Schema.Types.ObjectId, ref: "users" },
  cart: { type: String, default: "" },
  amount_in_points_redeemed: { type: Number, default: 0 },
  amount_in_cash_redeemed: { type: String, default: "" },
  buyer_hasRedeemedPoints: { type: Boolean, default: false },
  buyer_hasUsedPoints: { type: Boolean, default: false },
});
mongoose.model("loyaltyPoints", loyaltyPointsSchema);
