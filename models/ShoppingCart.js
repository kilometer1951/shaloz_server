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
  expected_arrival_date:{ type: String, default: "" },

  shipping_carrier_rate_estimation:{ type: String, default: "" },

  shipping_details:{ type: String, default: "" },
  date_entered_tracking :{ type: String, default: "" },
  date_user_checked_out:{ type: String, default: "" },


  stripe_refund_id: { type: String, default: "" },
  stripe_transfer_id: { type: String, default: "" },
  stripe_charge_id: { type: String, default: "" },

  seller_takes: { type: String, default: "0.00" },
  theshop_takes: { type: String, default: "" },
  date_paid: { type: String, default: "" },

  sub_total: { type: String, default: "" },
  tax: { type: String, default: "" },
  processing_fee: { type: String, default: "" },
  shippment_price: { type: String, default: "" },
  total: { type: String, default: "" },
});

mongoose.model("shoppingcarts", shoppingcartSchema);
