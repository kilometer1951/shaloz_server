const mongoose = require("mongoose");
const { Schema } = mongoose;

const shopingCartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "products" },
  qty: { type: Number, default: 0 },
  price: { type: String, default: "" },
  added: { type: Boolean, default: true },
  discountIsApplied: { type: Boolean, default: false },
  selected_variant_value: [],
  discount: { type: String, default: "" },
  product_personalization_note:{ type: String, default: "" },
});

module.exports = shopingCartItemSchema;
