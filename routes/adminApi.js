const mongoose = require("mongoose");
const User = mongoose.model("users");
const MainCategory = mongoose.model("mainCategories");
const SubCategoryOne = mongoose.model("subCategoriesOne");
const SubCategoryTwo = mongoose.model("subCategoriesTwo");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");

let messageBody = "";
const smsFunctions = require("../functions/SMS");
const httpRespond = require("../functions/httpRespond");
const cloudinary = require("cloudinary");

const multer = require("multer");
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 },
});
cloudinary.config({
  cloud_name: "ibc",
  api_key: "887482388487867",
  api_secret: "IDtj1fdfnQNJV-BTQ0mgfGOIIgU",
});

module.exports = (app) => {
  app.post("/api/admin/add/main_category", async (req, res) => {
    try {
      const newData = {
        name: req.body.name,
      };
      const data = await new MainCategory(newData).save();
      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.post("/api/admin/add/sub_category_one", async (req, res) => {
    try {
      const newData = {
        mainCategory: req.body.mainCategory,
        name: req.body.name,
      };
      const data = await new SubCategoryOne(newData).save();
      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.post("/api/admin/add/sub_category_two", async (req, res) => {
    try {
      const newData = {
        subCategoryOne: req.body.subCategoryOne,
        name: req.body.name,
      };
      const data = await new SubCategoryTwo(newData).save();
      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/admin/view/main_category", async (req, res) => {
    try {
      const data = await MainCategory.find({});
      
      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.get("/api/admin/view/main_category/:main_category_name/:sub_category1", async (req, res) => {
    try {
      const main_data = await MainCategory.findOne({name:req.params.main_category_name});
      const sub_data = await SubCategoryOne.findOne({mainCategory:main_data._id});
      console.log(sub_data);
      console.log(main_data);
      
      return httpRespond.severResponse(res, {
        status: true,
        main_data,
        sub_data
      });
    } catch (e) {
      console.log(e);
      
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.get("/api/admin/view/sub_category_one/:mainCategory_id", async (req, res) => {
    try {
      const data = await SubCategoryOne.find({
        mainCategory: req.params.mainCategory_id,
      });
      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.get("/api/admin/view/sub_category_two/:sub_category1_id", async (req, res) => {
    try {
      const data = await SubCategoryTwo.find({
        subCategoryOne: req.params.sub_category1_id,
      });
      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
};
