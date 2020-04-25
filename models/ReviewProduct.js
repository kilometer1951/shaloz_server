const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewProductSchema = new Schema({
  dateReviewed: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  product: { type: Schema.Types.ObjectId, ref: "products" },
  comment: { type: String, default: "" },
  rateNumber: { type: Number, default: 0 }
});
mongoose.model("reviewProducts", reviewProductSchema);
