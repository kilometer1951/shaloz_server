const mongoose = require("mongoose");
const { Schema } = mongoose;

const shopingCartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "products" },//for product details
  qty: { type: String, default: "" },
  price: { type: String, default: "" },
  discount: { type: String, default: "" },
  selected_variant_value: [],
  discount: { type: String, default: "" },
  product_personalization_note:{ type: String, default: "" },
});

module.exports = shopingCartItemSchema;
