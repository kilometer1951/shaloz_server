const mongoose = require("mongoose");
const { Schema } = mongoose;

const mainCategorySchema = new Schema({
  name: String,
  image:{type:String, default:""},
  slogan: {type:String, default:""}
});

mongoose.model("mainCategories", mainCategorySchema);
