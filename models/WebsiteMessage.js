const mongoose = require("mongoose");
const { Schema } = mongoose;

const websiteMessageSchema = new Schema({
  email: { type: String, default: "" },
  message: { type: String, default: "" },
});
mongoose.model("websiteMessages", websiteMessageSchema);
