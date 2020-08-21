const mongoose = require("mongoose");
const { Schema } = mongoose;

var subscriberSchema = new Schema({
  email: String,
});

mongoose.model("subscribers", subscriberSchema);
