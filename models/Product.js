const mongoose = require("mongoose");
const { Schema } = mongoose;

var productSchema = new Schema({
  date: { type: Date, default: Date.now },
  name: { type: String, default: "" },
  image: { type: String, default: "" },
  sub_images: [
    {
      content: { type: String, default: "" },
      price: { type: String, default: "" },
    },
  ],
  price: { type: String, default: "" },
  description: { type: String, default: "" },
  main_category: { type: String, default: "" },
  sub_category1: { type: String, default: "" },
  sub_category2: { type: String, default: "" },
  qty: { type: String, default: "" },
  variants: [{ type: Schema.Types.ObjectId, ref: "variants" }],
  user: { type: Schema.Types.ObjectId, ref: "users" },
  discount: { type: String, default: "" },
  discount_is_applied: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  discount_start_date: { type: Date, default: Date.now },
  discount_end_date: { type: Date, default: Date.now },
  product_can_be_customized: { type: Boolean, default: false },
  product_cutomize_note: { type: String, default: "" },
  allow_purchase_when_out_of_stock: { type: Boolean, default: false },
});

mongoose.model("products", productSchema);
