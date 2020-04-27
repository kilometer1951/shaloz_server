const mongoose = require("mongoose");
const { Schema } = mongoose;

const favoriteProductSchema = new Schema({
  date: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  product: { type: Schema.Types.ObjectId, ref: "products" },
 
});
mongoose.model("favoriteProducts", favoriteProductSchema);
