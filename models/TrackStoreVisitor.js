const mongoose = require("mongoose");
const { Schema } = mongoose;

const trackStoreVisitorSchema = new Schema({
  dateViewed: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  seller: { type: Schema.Types.ObjectId, ref: "users" },
  number_of_times_viewed:{ type: Number, default: 0 },

});
mongoose.model("trackStoreVisitors", trackStoreVisitorSchema);
