const mongoose = require("mongoose");
const { Schema } = mongoose;

const approveProductSchema = new Schema({
  seller: { type: Schema.Types.ObjectId, ref: "users" },
  approve: [
    {
      status: { type: Boolean, default: false },
      product: { type: Schema.Types.ObjectId, ref: "products" },
      approvedBy: { type: String, default: "admin" },
    },
  ], //for product details
});
mongoose.model("approveProducts", approveProductSchema);
