const mongoose = require("mongoose");
const { Schema } = mongoose;

var subCategoryOneSchema = new Schema({
  name: String,
  mainCategory: { type: Schema.Types.ObjectId, ref: "mainCategories" },
});

mongoose.model("subCategoriesOne", subCategoryOneSchema);
