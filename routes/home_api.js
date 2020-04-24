const mongoose = require("mongoose");
const User = mongoose.model("users");
const Variant = mongoose.model("variants");
const Product = mongoose.model("products");
const ShoppingCart = mongoose.model("shoppingcarts");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
var ObjectId = require("mongodb").ObjectID;

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
  app.get("/api/view/home_products/:user_id", async (req, res) => {
    try {
      // user: { $ne: req.params.user_id },

      const health_beauty = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            main_category: "Health & Beauty",
          },
        }, // filter the results
        { $sample: { size: 10 } },
      ]);

      const baby_kids_mat = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            main_category: "Baby, Kids & Maternity",
          },
        }, // filter the results
        { $sample: { size: 10 } },
      ]);

      const cell_phone_acc = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            main_category: "Cell Phones & Accessories",
          },
        }, // filter the results
        { $sample: { size: 4 } },
      ]);

      const hair_products = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            main_category: "Hair Products & Supplies",
          },
        }, // filter the results
        { $sample: { size: 10 } },
      ]);

      const jewelry = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            main_category: "Jewelry",
          },
        }, // filter the results
        { $sample: { size: 4 } },
      ]);

      const home_garden = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            main_category: "Home & Garden",
          },
        }, // filter the results
        { $sample: { size: 10 } },
      ]);

      const musical_instru = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            main_category: "Musical Instruments",
          },
        }, // filter the results
        { $sample: { size: 4 } },
      ]);

      const wedding_party = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            main_category: "Wedding, Party & Events",
          },
        }, // filter the results
        { $sample: { size: 10 } },
      ]);

      const work_out_suplement = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            main_category: "Workout Supplements",
          },
        }, // filter the results
        { $sample: { size: 4 } },
      ]);

      const barber_product = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            main_category: "Barber Products & Supplies",
          },
        }, // filter the results
        { $sample: { size: 10 } },
      ]);

      const all_cat = await Product.aggregate([{ $sample: { size: 4 } }]);

      console.log(all_cat);

      const data = {
        health_beauty,
        baby_kids_mat,
        cell_phone_acc,
        hair_products,
        jewelry,
        home_garden,
        musical_instru,
        wedding_party,
        work_out_suplement,
        barber_product,
        all_cat,
      };

      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/deals/:user_id", async (req, res) => {
    try {
      let per_page = 10;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };
      //
    //   {
    //     $match: {
    //       user: { $ne: ObjectId(req.params.user_id) },
    //       discount: { $ne: "" },
    //     },
    //   }, // filter the results
      const deals = await Product.aggregate([
       
        { $sample: { size: 10 } },
        { $limit: pagination.limit },
        { $skip: pagination.skip },
      ]);


      console.log(deals);
      
      return httpRespond.severResponse(res, {
        status: true,
        deals,
        endOfFile: deals.length === 0 ? true : false,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
};
