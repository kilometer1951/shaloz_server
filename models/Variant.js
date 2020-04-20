const mongoose = require("mongoose");
const { Schema } = mongoose;

const variantSchema = new Schema({
  dateAdded: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: "users" },
  name:{type: String, default:""},
  variantContent: [{
    content:{type: String, default:""},
    price:{type: String, default:""},
  }],
});

mongoose.model("variants", variantSchema);