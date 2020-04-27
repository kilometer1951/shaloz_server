const mongoose = require("mongoose");
const { Schema } = mongoose;

var productSchema = new Schema({
  date: { type: Date, default: Date.now },
  product_name: { type: String, default: "" },
  main_image: { type: String, default: "" },
  cloudinary_main_image_id: { type: String, default: "" },
  sub_image_1: { type: String, default: "" },
  cloudinary_sub_image_1_id: { type: String, default: "" },
  sub_image_2: { type: String, default: "" },
  cloudinary_sub_image_2_id: { type: String, default: "" },
  sub_image_3: { type: String, default: "" },
  cloudinary_sub_image_3_id: { type: String, default: "" },
  product_price: { type: String, default: "" },
  product_details: { type: String, default: "" },
  main_category: { type: String, default: "" },
  sub_category1: { type: String, default: "" },
  sub_category2: { type: String, default: "" },
  product_qty: { type: String, default: "1" },
  variants: [{ type: Schema.Types.ObjectId, ref: "variants" }],
  user: { type: Schema.Types.ObjectId, ref: "users" },
  discount: { type: String, default: "" },
  //inStock: { type: Boolean, default: true },
  discount_start_date: { type: String, default: "" },
  discount_end_date: { type: String, default: "" },
  allow_purchase_when_out_of_stock: { type: Boolean, default: false },
  product_can_be_customized: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  product_offers_free_shipping:{ type: Boolean, default: false },
  max_price_for_free_shipping:{ type: String, default: "" },
});

mongoose.model("products", productSchema);
