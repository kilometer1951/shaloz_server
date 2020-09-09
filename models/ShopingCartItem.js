const mongoose = require("mongoose");
const { Schema } = mongoose;

const shopingCartItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "products" }, //for product details
  qty: { type: String, default: "" },
  price: { type: String, default: "" },
  discount: { type: String, default: "" },
  selected_variant_value: [],
  product_personalization_note: { type: String, default: "" },
  shipment_price: { type: String, default: "0.00" },
});

module.exports = shopingCartItemSchema;
