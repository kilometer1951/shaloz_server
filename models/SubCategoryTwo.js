const mongoose = require("mongoose");
const { Schema } = mongoose;

var subCategoryTwoSchema = new Schema({
  name: String,
  subCategoryOne: { type: Schema.Types.ObjectId, ref: "subCategoriesOne" },
});

mongoose.model("subCategoriesTwo", subCategoryTwoSchema);
