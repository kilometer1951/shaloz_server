const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewProductSchema = new Schema({
  dateReviewed: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  product: { type: Schema.Types.ObjectId, ref: "products" },
  shopBelongsTo: { type: Schema.Types.ObjectId, ref: "users" },
  comment: { type: String, default: "" },
  images: { type: Array, default: [] },
  rateNumber: { type: Number, default: 0 },
});
mongoose.model("reviewProducts", reviewProductSchema);
