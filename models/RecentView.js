const mongoose = require("mongoose");
const { Schema } = mongoose;

const recentViewSchema = new Schema({
  dateViewed: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  product: { type: Schema.Types.ObjectId, ref: "products" },
 
});
mongoose.model("recentViews", recentViewSchema);
