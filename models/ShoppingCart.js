const mongoose = require("mongoose");
const { Schema } = mongoose;
const shopingCartItemSchema = require("./ShopingCartItem");

var shoppingcartSchema = new Schema({
  date_added: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  seller: { type: Schema.Types.ObjectId, ref: "users" },
  items: [shopingCartItemSchema],
  has_checkedout: { type: Boolean, default: false },
  order_shipped: { type: Boolean, default: false },

  tracking_number: { type: String, default: "" },
  expected_arrival_date: { type: String, default: "" },

  shipping_carrier_rate_estimation: { type: String, default: "" },

  shipping_details: { type: String, default: "" },
  date_entered_tracking: { type: Date, default: Date.now },

  date_user_checked_out: { type: Date },

  stripe_refund_id: { type: String, default: "" },
  stripe_transfer_id: { type: String, default: "" },
  stripe_charge_id: { type: String, default: "" },
  date_refunded: { type: Date },
  refund_reason: { type: String, default: "" },
  amount_to_refund: { type: String, default: "" },

  seller_takes: { type: String, default: "0.00" },
  theshop_takes: { type: String, default: "" },
  date_paid: { type: Date },

  sub_total: { type: String, default: "" },
  tax: { type: String, default: "" },
  processing_fee: { type: String, default: "" },
  shippment_price: { type: String, default: "" },
  total: { type: String, default: "" },
  client_paid: { type: String, default: "" },
  discount_applied: { type: String, default: "" },

  shipping_status: { type: String, default: "ship" },

  buyer_hasRedeemedPoints: { type: Boolean, default: false },
  amount_in_points_redeemed: { type: Number, default: 0 },
  amount_in_cash_redeemed: { type: String, default: "" },

  store_promotion_discount: { type: String, default: "" },
  store_promotion_discount_is_applied: { type: Boolean, default: false },
  store_promotion_discount_percentage: { type: String, default: "" },
  country_code: { type: String, default: "US" },
  currency_sign: { type: String, default: "$" },

  seller_is_paid: { type: Boolean, default: false },
  account_deposite_fee: { type: String, default: "" },
  stripe_transfer_id_for_points: { type: String, default: "" },
});

mongoose.model("shoppingcarts", shoppingcartSchema);
