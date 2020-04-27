const mongoose = require("mongoose");

const { Schema } = mongoose;

let userSchema = new Schema({
  date_joined: { type: Date, default: Date.now },
  first_name: String,
  last_name: String,
  phone: String,
  email: String,
  shop_logo: {
    type: String,
    default: "https://oarnation.com/content/no-picture.jpg",
  },
  deviceToken: { type: String, default: "" },
  shop_name: { type: String, default: "" },
  ssn_number: { type: String, default: "" },
  stripe_seller_account_id: { type: String, default: "" },
  cloudinary_image_id: { type: String, default: "" },
  stripe_payment_id: { type: String, default: "" },
  shop_address: { type: String, default: "" },
  shop_location_city: { type: String, default: "" },
  shop_location_state: { type: String, default: "" },
  shop_postal_code: { type: String, default: "" },
  country: { type: String, default: "" },
  country_code: { type: String, default: "+1" },
  date_created_seller_account: { type: Date, default: Date.now },
  shop_setup:{ type: String, default: "not_complete" },
  about:{ type: String, default: "" },
  
});

mongoose.model("users", userSchema);
