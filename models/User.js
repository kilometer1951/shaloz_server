const mongoose = require("mongoose");

const { Schema } = mongoose;

let userSchema = new Schema({
  date_joined: { type: Date, default: Date.now },
  first_name: String,
  last_name: String,
  phone: String,
  email: String,
  password: String,
  shop_logo: {
    type: String,
    default: "https://oarnation.com/content/no-picture.jpg",
  },
  shop_slogan: { type: String, default: "" },
  deviceToken: { type: String, default: "" },
  shop_name: { type: String, default: "" },
  ssn_number: { type: String, default: "" },
  stripe_seller_account_id: { type: String, default: "" },
  cloud_id: { type: String, default: "" },
  stripe_payment_id: { type: String, default: "" },
  shop_address: { type: String, default: "" },
  shop_location_city: { type: String, default: "" },
  shop_location_state: { type: String, default: "" },
  shop_postal_code: { type: String, default: "" },
  country: { type: String, default: "US" },
  country_code: { type: String, default: "+1" },
  date_created_seller_account: { type: Date, default: Date.now },
  shop_setup: { type: String, default: "not_complete" },
  about: { type: String, default: "" },

  offers_discount_on_price_threshold: { type: Boolean, default: false },
  max_items_to_get_discount: { type: String, default: "" },
  discount_amount_for_threshold: { type: String, default: "" },

  offers_free_shipping: { type: Boolean, default: false },
  price_threshold: { type: String, default: "" },

  auto_discount_amount: { type: String, default: "" },
  deactivate_user: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },

  loyalty_points: { type: Number, default: 0 },

  sales_tax: { type: String, default: "" },
  last_activity: { type: Date, default: Date.now },
  store_categories: { type: Array, default: [] },
  default_currency_sign: { type: String, default: "$" },
  default_currency: { type: String, default: "USD" },
  language: { type: String, default: "english" },
  shop_isApproved: { type: Boolean, default: false },

  can_redeem_points: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
});

mongoose.model("users", userSchema);
