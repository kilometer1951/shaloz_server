const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  content: { type: String, default: "" },
  user: { type: Schema.Types.ObjectId, ref: "users" },
});
mongoose.model("feedbacks", feedbackSchema);
