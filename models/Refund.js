const mongoose = require("mongoose");
const { Schema } = mongoose;

const refundSchema = new Schema({
  date_added: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  seller: { type: Schema.Types.ObjectId, ref: "users" },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: "products" }, //for product details
      qty: { type: String, default: "" },
      price: { type: String, default: "" },
      discount: { type: String, default: "" },
      selected_variant_value: [],
      product_personalization_note: { type: String, default: "" },
      stripe_refund_id: { type: String, default: "" },
      date_refunded: { type: Date },
      refund_reason: { type: String, default: "" },
      amount_to_refund: { type: String, default: "" },
      shippment_price: { type: String, default: "" },
    },
  ],

  cart_id: { type: String, default: "" },

  stripe_charge_id: { type: String, default: "" },

  tax: { type: String, default: "" },
  processing_fee: { type: String, default: "" },

  buyer_hasRedeemedPoints: { type: Boolean, default: false },
  amount_in_points_redeemed: { type: Number, default: 0 },
  amount_in_cash_redeemed: { type: String, default: "" },
  refund_issued_by: { type: String, default: "" },
});
mongoose.model("refunds", refundSchema);
