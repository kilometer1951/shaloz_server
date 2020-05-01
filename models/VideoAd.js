const mongoose = require("mongoose");
const { Schema } = mongoose;

const videoAdSchema = new Schema({
  date_added: { type: Date, default: Date.now },
  seller: { type: Schema.Types.ObjectId, ref: "users" },
  video: { type: String, default: "" },
  cloud_id: { type: String, default: "" },
  video_ad_category:{ type: String, default: "" },
  active:{ type: Boolean, default: false },
});
mongoose.model("videoAds", videoAdSchema);
