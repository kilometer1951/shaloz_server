const mongoose = require("mongoose");
const { Schema } = mongoose;

const mainCategorySchema = new Schema({
  name: String,
});

mongoose.model("mainCategories", mainCategorySchema);
