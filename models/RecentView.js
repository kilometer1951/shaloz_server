const mongoose = require("mongoose");
const { Schema } = mongoose;

const recentViewSchema = new Schema({
  dateViewed: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  seller: { type: Schema.Types.ObjectId, ref: "users" },
  product: { type: Schema.Types.ObjectId, ref: "products" },
  number_of_times_viewed: { type: Number, default: 0 },
});
mongoose.model("recentViews", recentViewSchema);
