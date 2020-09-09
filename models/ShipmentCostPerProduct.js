const mongoose = require("mongoose");
const { Schema } = mongoose;

const shipmentCostPerProductSchema = new Schema({
  date: { type: Date, default: Date.now },
  buyer: { type: Schema.Types.ObjectId, ref: "users" },
  seller: { type: Schema.Types.ObjectId, ref: "users" },
  product: { type: String, default: "" },
  weight: { type: String, default: "" },
  qty: { type: String, default: "" },
  unit: { type: String, default: "" },
  cost: { type: String, default: "" },
  cart: { type: String, default: "" },
  shipping_to: {
    country: { type: String, default: "US" },
    address_line1: { type: String, default: "" },
    city_locality: { type: String, default: "" },
    state_province: { type: String, default: "" },
    postal_code: { type: String, default: "" },
  },
  shipping_from: {
    country: { type: String, default: "US" },
    address_line1: { type: String, default: "" },
    city_locality: { type: String, default: "" },
    state_province: { type: String, default: "" },
    postal_code: { type: String, default: "" },
  },
});
mongoose.model("shipmentCostPerProducts", shipmentCostPerProductSchema);
