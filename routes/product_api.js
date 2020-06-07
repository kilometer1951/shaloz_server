const mongoose = require("mongoose");
const User = mongoose.model("users");
const Variant = mongoose.model("variants");
const Product = mongoose.model("products");
const FavoriteProduct = mongoose.model("favoriteProducts");
const FavoriteShop = mongoose.model("favoriteShops");
const ReviewProduct = mongoose.model("reviewProducts");
const RecentView = mongoose.model("recentViews");
const MainCategory = mongoose.model("mainCategories");
const SubCategoryOne = mongoose.model("subCategoriesOne");
const SubCategoryTwo = mongoose.model("subCategoriesTwo");
const ShoppingCart = mongoose.model("shoppingcarts");
const ReviewShop = mongoose.model("reviewShops");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
let ObjectId = require("mongodb").ObjectID;

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

      let health_beauty;
      let baby_kids_mat;
      let cell_phone_acc;
      let hair_products;
      let jewelry;
      let home_garden;
      let musical_instru;
      let wedding_party;
      let work_out_suplement;
      let barber_product;
      let all_cat;
      let deals;

      if (req.params.user_id === "undefined") {
        deals = await Product.aggregate([
          {
            $match: {
              discount: { $ne: "" },
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        health_beauty = await Product.aggregate([
          {
            $match: {
              main_category: "Health & Beauty",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        baby_kids_mat = await Product.aggregate([
          {
            $match: {
              main_category: "Baby, Kids & Maternity",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        cell_phone_acc = await Product.aggregate([
          {
            $match: {
              main_category: "Cell Phones & Accessories",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 6 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        hair_products = await Product.aggregate([
          {
            $match: {
              main_category: "Hair Products & Supplies",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        jewelry = await Product.aggregate([
          {
            $match: {
              main_category: "Jewelry",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 6 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        home_garden = await Product.aggregate([
          {
            $match: {
              main_category: "Home & Garden",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        musical_instru = await Product.aggregate([
          {
            $match: {
              main_category: "Musical Instruments",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 6 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        wedding_party = await Product.aggregate([
          {
            $match: {
              main_category: "Wedding, Party & Events",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        work_out_suplement = await Product.aggregate([
          {
            $match: {
              main_category: "Workout Supplements",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 6 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        barber_product = await Product.aggregate([
          {
            $match: {
              main_category: "Barber Products & Supplies",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        all_cat = await Product.aggregate([{ $sample: { size: 4 } }]);
      } else {
        deals = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              discount: { $ne: "" },
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        health_beauty = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              main_category: "Health & Beauty",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        baby_kids_mat = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              main_category: "Baby, Kids & Maternity",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        cell_phone_acc = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              main_category: "Cell Phones & Accessories",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 6 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        hair_products = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              main_category: "Hair Products & Supplies",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        jewelry = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              main_category: "Jewelry",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 6 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        home_garden = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              main_category: "Home & Garden",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        musical_instru = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              main_category: "Musical Instruments",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 6 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        wedding_party = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              main_category: "Wedding, Party & Events",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        work_out_suplement = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              main_category: "Workout Supplements",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 6 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        barber_product = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              main_category: "Barber Products & Supplies",
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 10 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        all_cat = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              inStock: true,
            },
          }, // filter the results
          { $sample: { size: 6 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);
      }

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
        deals,
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

      const deals = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            discount: { $ne: "" },
            inStock: true,
          },
        }, // filter the results

        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
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

  app.get("/api/fetch_cats", async (req, res) => {
    try {
      const main_cat = await MainCategory.aggregate([
        { $sample: { size: 40 } },
      ]);

      const subcat_one_data = await SubCategoryOne.aggregate([
        { $sample: { size: 40 } },
      ]);
      const subcat_two_data = await SubCategoryTwo.aggregate([
        { $sample: { size: 40 } },
      ]);

      return httpRespond.severResponse(res, {
        status: true,
        main_cat,
        subcat_one_data,
        subcat_two_data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e,
      });
    }
  });

  app.get(
    "/api/view/fetch_single_product/:product_id/:user_id",
    async (req, res) => {
      try {
        const product = await Product.findOne({
          _id: req.params.product_id,
        })
          .populate("user")
          .populate("variants");

        //more items from shop
        const moreItemsFromShop = await Product.aggregate([
          {
            $match: {
              user: { $eq: ObjectId(product.user._id) },
              inStock: true,
            },
          }, // filter the results
          { $limit: 4 },
          { $sample: { size: 4 } },
        ]);

        //add recentyl viewed only if it does not exist
        const data = await RecentView.findOne({
          user: req.params.user_id,
          product: req.params.product_id,
        });

        //other products
        const otherProducts = await Product.aggregate([
          // filter the results
          { $limit: 4 },
          { $sample: { size: 4 } },
        ]);

        //other products website
        const otherProducts_website = await Product.aggregate([
          // filter the results
          { $limit: 12 },
          { $sample: { size: 12 } },
        ]);

        const moreItemsFromShop_website = await Product.aggregate([
          {
            $match: {
              user: { $eq: ObjectId(product.user._id) },
              inStock: true,
            },
          }, // filter the results
          { $limit: 12 },
          { $sample: { size: 12 } },
        ]);

        if (!data) {
          //add
          await new RecentView({
            user: req.params.user_id,
            product: req.params.product_id,
          }).save();
        }

        const recent_viewed = await RecentView.find({
          user: req.params.user_id,
        })
          .populate("product")
          .limit(12);

        const reviews = await ReviewProduct.find({
          product: req.params.product_id,
        })
          .populate("product")
          .populate("user")
          .limit(12);

        const reviews_count = await ReviewProduct.countDocuments({
          product: req.params.product_id,
        });

        const number_of_product_review_pages = Math.ceil(reviews_count / 12);

        const shop_reviews = await ReviewShop.find({
          shop: product.user._id,
        })
          .populate("user")
          .populate("shop")
          .limit(12);

        const shop_reviews_count = await ReviewShop.countDocuments({
          shop: product.user._id,
        });

        const number_of_shop_review_pages = Math.ceil(shop_reviews_count / 12);

        //fetch fav
        const fav_products = await FavoriteProduct.findOne({
          product: { $eq: ObjectId(req.params.product_id) },
          user: { $eq: ObjectId(req.params.user_id) },
        });

        const cart_data = await ShoppingCart.find({
          user: { $eq: ObjectId(req.params.user_id) },
          has_checkedout: false,
        });

        const main_cat = await MainCategory.find({});

        return httpRespond.severResponse(res, {
          status: true,
          product,
          reviews,
          recent_viewed,
          otherProducts,
          moreItemsFromShop,
          fav_products: fav_products ? true : false,

          reviews_count,

          number_of_product_review_pages,
          shop_reviews,
          shop_reviews_count,
          number_of_shop_review_pages,
          cart_data,
          otherProducts_website,
          moreItemsFromShop_website,
          main_cat,
        });
      } catch (e) {
        return httpRespond.severResponse(res, {
          status: false,
          e: e,
        });
      }
    }
  );

  app.get("/api/view/recently_viewed/:user_id", async (req, res) => {
    try {
      let per_page = 12;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await RecentView.find({
        user: { $eq: ObjectId(req.params.user_id) },
      })
        .populate("product")
        .limit(pagination.limit)
        .skip(pagination.skip);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        endOfFile: data.length === 0 ? true : false,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/product_all/:user_id", async (req, res) => {
    try {
      let per_page = 10;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            inStock: true,
          },
        }, // filter the results
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
      ]);

      console.log(data);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        endOfFile: data.length === 0 ? true : false,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/shops_product/:seller_id", async (req, res) => {
    try {
      let per_page = 10;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await Product.aggregate([
        {
          $match: {
            user: { $eq: ObjectId(req.params.seller_id) },
            inStock: true,
          },
        }, // filter the results
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
      ]);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        endOfFile: data.length === 0 ? true : false,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/shops_deals/:seller_id", async (req, res) => {
    try {
      let per_page = 10;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await Product.aggregate([
        {
          $match: {
            user: { $eq: ObjectId(req.params.seller_id) },
            discount: { $ne: "" },
            inStock: true,
          },
        }, // filter the results
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
      ]);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        endOfFile: data.length === 0 ? true : false,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post("/api/add/fav_product/", async (req, res) => {
    try {
      //add fav products
      const fetched = await FavoriteProduct.findOne({
        user: req.body.user_id,
        product: req.body.product_id,
      });

      if (!fetched) {
        //add
        await new FavoriteProduct({
          user: req.body.user_id,
          product: req.body.product_id,
        }).save();
      }

      const data = await FavoriteProduct.find({
        user: ObjectId(req.body.user_id),
      }).populate("product");

      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/remove/fav_product/", async (req, res) => {
    try {
      //remove fav products

      await FavoriteProduct.deleteOne({
        user: req.body.user_id,
        product: req.body.product_id,
      });

      const data = await FavoriteProduct.find({
        user: ObjectId(req.body.user_id),
      }).populate("product");

      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/add/fav_shop/", async (req, res) => {
    try {
      //add fav products
      const fetched = await FavoriteShop.findOne({
        user: req.body.user_id,
        seller: req.body.seller_id,
      });

      if (!fetched) {
        //add
        await new FavoriteShop({
          user: req.body.user_id,
          seller: req.body.seller_id,
        }).save();
      }

      const data = await FavoriteShop.find({
        user: ObjectId(req.body.user_id),
      }).populate("seller");

      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/remove/fav_shop/", async (req, res) => {
    try {
      //remove fav products

      await FavoriteShop.deleteOne({
        user: req.body.user_id,
        seller: req.body.seller_id,
      });

      const data = await FavoriteShop.find({
        user: ObjectId(req.body.user_id),
      }).populate("seller");

      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.get("/api/view/fav_products/:user_id", async (req, res) => {
    try {
      let per_page = 10;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await FavoriteProduct.find({
        user: { $eq: ObjectId(req.params.user_id) },
      })
        .populate("product")
        .limit(pagination.limit)
        .skip(pagination.skip);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        endOfFile: data.length === 0 ? true : false,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/fav_shop/:user_id", async (req, res) => {
    try {
      let per_page = 10;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await FavoriteShop.find({
        user: { $eq: ObjectId(req.params.user_id) },
      })
        .populate("seller")
        .limit(pagination.limit)
        .skip(pagination.skip);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        endOfFile: data.length === 0 ? true : false,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get(
    "/api/view/check_fav_shop_exist/:user_id/:seller_id",
    async (req, res) => {
      try {
        const fav_shop = await FavoriteShop.findOne({
          user: req.params.user_id,
          seller: req.params.seller_id,
        });

        const sellerDetails = await User.findOne({
          _id: ObjectId(req.params.seller_id),
        });

        return httpRespond.severResponse(res, {
          status: true,
          fav_shop: fav_shop ? true : false,
          sellerDetails,
        });
      } catch (e) {
        console.log(e);

        return httpRespond.severResponse(res, {
          status: false,
        });
      }
    }
  );

  app.get("/api/dynamic_search/product/:user_id/:value", async (req, res) => {
    try {
      //search products
      const products = await Product.find({
        user: { $ne: ObjectId(req.params.user_id) },
        inStock: true,
        $or: [
          { product_name: { $regex: new RegExp(req.params.value, "i") } },
          { main_category: { $regex: new RegExp(req.params.value, "i") } },
          { sub_category1: { $regex: new RegExp(req.params.value, "i") } },
          { sub_category2: { $regex: new RegExp(req.params.value, "i") } },
        ],
      })
        .sort("-date")
        .limit(5)
        .populate("user")
        .populate("variants");

      //search users
      const shops = await User.find({
        _id: { $ne: ObjectId(req.params.user_id) },
        shop_setup: "complete",
        $or: [
          { first_name: { $regex: new RegExp(req.params.value, "i") } },
          { last_name: { $regex: new RegExp(req.params.value, "i") } },
          { shop_name: { $regex: new RegExp(req.params.value, "i") } },
        ],
      }).limit(6);

      return httpRespond.severResponse(res, {
        status: true,
        products,
        shops,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/display_random_cat_shop/:user_id", async (req, res) => {
    try {
      const products = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.params.user_id) },
            inStock: true,
          },
        }, // filter the results
        { $limit: 5 },
        { $sample: { size: 5 } },
      ]);

      const shops = await User.aggregate([
        {
          $match: {
            shop_setup: "complete",
            _id: { $ne: ObjectId(req.params.user_id) },
          },
        }, // filter the results
        { $limit: 6 },
        { $sample: { size: 6 } },
      ]);

      //categories
      const main_cat = await MainCategory.find({});
      const sub_cat_1 = await SubCategoryOne.find({});
      const sub_cat_2 = await SubCategoryTwo.find({});

      return httpRespond.severResponse(res, {
        status: true,
        products,
        shops,
        main_cat,
        sub_cat_1,
        sub_cat_2,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get(
    "/api/view/web_site_query_products/:user_id/:main_cat",
    async (req, res) => {
      try {
        let per_page = 12;
        let page_no = parseInt(req.query.page);
        let pagination = {
          limit: per_page,
          skip: per_page * (page_no - 1),
        };

        let products;
        let count;
        let header_products;
        if (req.params.main_cat === "all") {
          products = await Product.aggregate([
            {
              $match: {
                user: { $ne: ObjectId(req.params.user_id) },
                inStock: true,
              },
            }, // filter the results

            { $skip: pagination.skip },
            { $limit: pagination.limit },
            { $sample: { size: pagination.limit } },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "seller",
              },
            },
          ]);

          header_products = await Product.aggregate([
            {
              $match: {
                user: { $ne: ObjectId(req.params.user_id) },
                inStock: true,
              },
            }, // filter the results

            { $limit: 6 },
            { $sample: { size: 6 } },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "seller",
              },
            },
          ]);

          count = await Product.find({
            user: { $ne: ObjectId(req.params.user_id) },
            inStock: true,
          }).countDocuments();
        } else {
          products = await Product.aggregate([
            {
              $match: {
                user: { $ne: ObjectId(req.params.user_id) },
                main_category: req.params.main_cat,
                inStock: true,
              },
            }, // filter the results

            { $skip: pagination.skip },
            { $limit: pagination.limit },
            { $sample: { size: pagination.limit } },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "seller",
              },
            },
          ]);

          header_products = await Product.aggregate([
            {
              $match: {
                user: { $ne: ObjectId(req.params.user_id) },
                main_category: req.params.main_cat,
                inStock: true,
              },
            }, // filter the results

            { $limit: 6 },
            { $sample: { size: 6 } },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "seller",
              },
            },
          ]);

          count = await Product.find({
            user: { $ne: ObjectId(req.params.user_id) },
            main_category: req.params.main_cat,
            inStock: true,
          }).countDocuments();
        }

        const pageCount = Math.ceil(count / per_page);

        let otherProducts = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.params.user_id) },
              inStock: true,
            },
          }, // filter the results
          { $limit: 12 },
          { $sample: { size: 12 } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);
        let shops = await User.aggregate([
          {
            $match: {
              _id: { $ne: ObjectId(req.params.user_id) },
              shop_setup: "complete",
            },
          }, // filter the results
          { $limit: 10 },
          { $sample: { size: 10 } },
        ]);

        return httpRespond.severResponse(res, {
          status: true,
          products,
          otherProducts,
          shops,
          endOfFile: products.length === 0 ? true : false,
          pageCount,
          header_products,
        });
      } catch (e) {
        console.log(e);

        return httpRespond.severResponse(res, {
          status: false,
        });
      }
    }
  );

  app.post("/api/view/query_all_products_not_on_sale", async (req, res) => {
    try {
      let per_page = 20;
      let page_no = parseInt(req.body.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.body.user_id) },
            inStock: true,
          },
        }, // filter the results
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "seller",
          },
        },
      ]);

      const count = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.body.user_id) },
            inStock: true,
          },
        },
      ]);

      const pageCount = Math.ceil(count.length / per_page);

      const otherProducts = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.body.user_id) },
            inStock: true,
          },
        }, // filter the results
        { $limit: 12 },
        { $sample: { size: 12 } },
      ]);
      const shops = await User.aggregate([
        {
          $match: {
            _id: { $ne: ObjectId(req.body.user_id) },
            shop_setup: "complete",
          },
        }, // filter the results
        { $limit: 12 },
        { $sample: { size: 12 } },
      ]);

      const recent_viewed = await RecentView.find({
        user: req.body.user_id,
      })
        .populate("product")
        .limit(12);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        otherProducts,
        shops,
        endOfFile: data.length === 0 ? true : false,
        pageCount,
        recent_viewed,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post("/api/view/query_all_products_on_sale", async (req, res) => {
    try {
      let per_page = 20;
      let page_no = parseInt(req.body.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.body.user_id) },
            discount: { $ne: "" },
            inStock: true,
          },
        }, // filter the results
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "seller",
          },
        },
      ]);

      const count = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.body.user_id) },
            discount: { $ne: "" },
            inStock: true,
          },
        },
      ]);

      const pageCount = Math.ceil(count.length / per_page);

      const otherProducts = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.body.user_id) },
            inStock: true,
          },
        }, // filter the results
        { $limit: 12 },
        { $sample: { size: 12 } },
      ]);
      const shops = await User.aggregate([
        {
          $match: {
            _id: { $ne: ObjectId(req.body.user_id) },
            shop_setup: "complete",
          },
        }, // filter the results
        { $limit: 12 },
        { $sample: { size: 12 } },
      ]);

      const recent_viewed = await RecentView.find({
        user: req.body.user_id,
      })
        .populate("product")
        .limit(12);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        otherProducts,
        shops,
        endOfFile: data.length === 0 ? true : false,
        pageCount,
        recent_viewed,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post("/api/view/query_products_by_category_on_sale", async (req, res) => {
    try {
      let per_page = 20;
      let page_no = parseInt(req.body.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.body.user_id) },
            discount: { $ne: "" },
            inStock: true,
            $or: [
              {
                main_category: {
                  $regex: new RegExp(req.body.main_cat, "i"),
                },
              },
              {
                sub_category1: {
                  $regex: new RegExp(req.body.sub_cat_one, "i"),
                },
              },
              {
                sub_category2: {
                  $regex: new RegExp(req.body.sub_cat_two, "i"),
                },
              },
            ],
          },
        }, // filter the results
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "seller",
          },
        },
      ]);

      const count = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.body.user_id) },
            discount: { $ne: "" },
            inStock: true,
            $or: [
              {
                main_category: {
                  $regex: new RegExp(req.body.main_cat, "i"),
                },
              },
              {
                sub_category1: {
                  $regex: new RegExp(req.body.sub_cat_one, "i"),
                },
              },
              {
                sub_category2: {
                  $regex: new RegExp(req.body.sub_cat_two, "i"),
                },
              },
            ],
          },
        },
      ]);

      const pageCount = Math.ceil(count.length / per_page);

      const otherProducts = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.body.user_id) },
            inStock: true,
          },
        }, // filter the results
        { $limit: 12 },
        { $sample: { size: 12 } },
      ]);
      const shops = await User.aggregate([
        {
          $match: {
            _id: { $ne: ObjectId(req.body.user_id) },
            shop_setup: "complete",
          },
        }, // filter the results
        { $limit: 12 },
        { $sample: { size: 12 } },
      ]);

      const recent_viewed = await RecentView.find({
        user: req.body.user_id,
      })
        .populate("product")
        .limit(12);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        otherProducts,
        shops,
        endOfFile: data.length === 0 ? true : false,
        pageCount,
        recent_viewed,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post(
    "/api/view/query_products_by_category_not_on_sale",
    async (req, res) => {
      try {
        let per_page = 20;
        let page_no = parseInt(req.body.page);
        let pagination = {
          limit: per_page,
          skip: per_page * (page_no - 1),
        };

        const data = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.body.user_id) },

              inStock: true,
              $or: [
                {
                  main_category: {
                    $regex: new RegExp(req.body.main_cat, "i"),
                  },
                },
                {
                  sub_category1: {
                    $regex: new RegExp(req.body.sub_cat_one, "i"),
                  },
                },
                {
                  sub_category2: {
                    $regex: new RegExp(req.body.sub_cat_two, "i"),
                  },
                },
              ],
            },
          }, // filter the results
          { $skip: pagination.skip },
          { $limit: pagination.limit },
          { $sample: { size: pagination.limit } },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "seller",
            },
          },
        ]);

        const count = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.body.user_id) },
              inStock: true,
              $or: [
                {
                  main_category: {
                    $regex: new RegExp(req.body.main_cat, "i"),
                  },
                },
                {
                  sub_category1: {
                    $regex: new RegExp(req.body.sub_cat_one, "i"),
                  },
                },
                {
                  sub_category2: {
                    $regex: new RegExp(req.body.sub_cat_two, "i"),
                  },
                },
              ],
            },
          },
        ]);

        const pageCount = Math.ceil(count.length / per_page);

        const otherProducts = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.body.user_id) },
              inStock: true,
            },
          }, // filter the results
          { $limit: 12 },
          { $sample: { size: 12 } },
        ]);

        const shops = await User.aggregate([
          {
            $match: {
              _id: { $ne: ObjectId(req.body.user_id) },
              shop_setup: "complete",
            },
          }, // filter the results
          { $limit: 6 },
          { $sample: { size: 6 } },
        ]);

        const recent_viewed = await RecentView.find({
          user: req.body.user_id,
        })
          .populate("product")
          .limit(12);

        return httpRespond.severResponse(res, {
          status: true,
          data,
          otherProducts,
          shops,
          endOfFile: data.length === 0 ? true : false,
          pageCount,
          recent_viewed,
        });
      } catch (e) {
        console.log(e);

        return httpRespond.severResponse(res, {
          status: false,
        });
      }
    }
  );

  app.post("/api/view/query_products_by_category", async (req, res) => {
    try {
      let per_page = 10;
      let page_no = parseInt(req.body.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      let otherProducts = [];
      let shops = [];

      const data = await Product.aggregate([
        {
          $match: {
            user: { $ne: ObjectId(req.body.user_id) },
            main_category: req.body.main_cat,
            inStock: true,
            $or: [
              {
                sub_category1: {
                  $regex: new RegExp(req.body.sub_cat_one, "i"),
                },
              },
              {
                sub_category2: {
                  $regex: new RegExp(req.body.sub_cat_two, "i"),
                },
              },
            ],
          },
        }, // filter the results
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
      ]);

      if (data.length === 0) {
        otherProducts = await Product.aggregate([
          {
            $match: {
              user: { $ne: ObjectId(req.body.user_id) },
              inStock: true,
            },
          }, // filter the results
          { $limit: 10 },
          { $sample: { size: 10 } },
        ]);
        shops = await User.aggregate([
          {
            $match: {
              _id: { $ne: ObjectId(req.body.user_id) },
              shop_setup: "complete",
            },
          }, // filter the results
          { $limit: 10 },
          { $sample: { size: 10 } },
        ]);
      }

      return httpRespond.severResponse(res, {
        status: true,
        data,
        otherProducts,
        shops,
        endOfFile: data.length === 0 ? true : false,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/cart_product_variant/:product_id", async (req, res) => {
    try {
      const data = await Product.findOne({
        _id: req.params.product_id,
      }).populate("variants");

      return httpRespond.severResponse(res, {
        status: true,
        data: data.variants,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/update/update_cart_qty", async (req, res) => {
    try {
      const updated = await ShoppingCart.updateOne(
        {
          _id: req.body.cart_id,
          user: req.body.user_id,
          items: {
            $elemMatch: { _id: req.body.item_id },
          },
        },
        {
          $set: { "items.$.qty": req.body.qty },
        }
      );

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/update/update_cart_variants", async (req, res) => {
    try {
      const updated = await ShoppingCart.updateOne(
        {
          _id: req.body.cart_id,
          user: req.body.user_id,
          items: {
            $elemMatch: { _id: req.body.item_id },
          },
        },
        {
          $set: { "items.$.selected_variant_value": req.body.newVariant },
        }
      );

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/update/update_cart_personilization_note", async (req, res) => {
    try {
      const updated = await ShoppingCart.updateOne(
        {
          _id: req.body.cart_id,
          user: req.body.user_id,
          items: {
            $elemMatch: { _id: req.body.item_id },
          },
        },
        {
          $set: {
            "items.$.product_personalization_note":
              req.body.product_personalization_note,
          },
        }
      );

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/delete/delete_cart_item", async (req, res) => {
    try {
      await ShoppingCart.updateOne(
        {
          _id: req.body.cart_id,
          user: req.body.user_id,
        },
        {
          $pull: {
            items: {
              _id: req.body.item_id,
            },
          },
        },
        {
          multi: true,
        }
      );

      const cart = await ShoppingCart.findOne({ _id: req.body.cart_id });
      if (cart.items.length === 0) {
        //remove the cart
        await ShoppingCart.deleteOne({
          _id: req.body.cart_id,
          user: req.body.user_id,
        });
      }

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/delete/delete_cart", async (req, res) => {
    try {
      await ShoppingCart.deleteOne({
        _id: req.body.cart_id,
        user: req.body.user_id,
      });

     

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/add/review_product/", async (req, res) => {
    try {
      //add fav products
      const saved = await new ReviewProduct({
        user: req.body.user_id,
        product: req.body.product_id,
        comment: req.body.comment,
        rateNumber: req.body.rateNumber,
      }).save();
      console.log(saved);

      return httpRespond.severResponse(res, {
        status: true,
        res: saved,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/add/review_shop/", async (req, res) => {
    try {
      //add fav products
      await new ReviewShop({
        user: req.body.user_id,
        shop: req.body.shop_id,
        comment: req.body.comment,
        rateNumber: req.body.rateNumber,
      }).save();

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.get("/api/view/fetch_product_review/:product_id", async (req, res) => {
    try {
      let per_page = 12;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };
      const data = await ReviewProduct.find({
        product: req.params.product_id,
      })
        .populate("product")
        .populate("user")
        .sort("-dateReviewed")
        .limit(pagination.limit)
        .skip(pagination.skip);

      const reviews_count = await ReviewProduct.countDocuments({
        product: req.params.product_id,
      });

      const number_of_product_review_pages = Math.ceil(
        reviews_count / per_page
      );

      //console.log(data);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        endOfFile: data.length === 0 ? true : false,
        number_of_product_review_pages,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/fetch_shop_review/:shop_id", async (req, res) => {
    try {
      let per_page = 12;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };
      console.log(req.params.shop_id);

      const data = await ReviewShop.find({
        shop: req.params.shop_id,
      })
        .populate("shop")
        .populate("user")
        .sort("-dateReviewed")
        .limit(pagination.limit)
        .skip(pagination.skip);

      const shop_reviews_count = await ReviewShop.countDocuments({
        shop: req.params.shop_id,
      });

      const number_of_shop_review_pages = Math.ceil(
        shop_reviews_count / per_page
      );

      //console.log(data);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        endOfFile: data.length === 0 ? true : false,
        number_of_shop_review_pages,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post("/api/edit/remove_from_stock", async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.body.product_id });
      product.inStock = false;
      product.save();

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post("/api/edit/add_to_stock_without_qty", async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.body.product_id });
      product.inStock = true;
      product.save();
      console.log(product);

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.post("/api/edit/add_to_stock_with_qty", async (req, res) => {
    try {
      const product = await Product.findOne({ _id: req.body.product_id });
      product.product_qty = req.body.product_qty;
      product.inStock = true;
      product.save();
      console.log(product);

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/fetch_more_shop_product/:shop_id", async (req, res) => {
    try {
      let per_page = 20;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };
      const data = await Product.aggregate([
        {
          $match: {
            user: { $eq: ObjectId(req.params.shop_id) },
            inStock: true,
          },
        }, // filter the results
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
      ]);

      const count = await Product.countDocuments({
        user: { $eq: ObjectId(req.params.shop_id) },
      });

      const productPageCount = Math.ceil(count / per_page);

      //console.log(data);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        endOfFile: data.length === 0 ? true : false,
        productPageCount,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get(
    "/api/view/fetch_more_shop_category_product/:shop_id/:selected",
    async (req, res) => {
      try {
        let per_page = 20;
        let page_no = parseInt(req.query.page);
        let pagination = {
          limit: per_page,
          skip: per_page * (page_no - 1),
        };
        const data = await Product.aggregate([
          {
            $match: {
              user: { $eq: ObjectId(req.params.shop_id) },
              main_category: req.params.selected,
              inStock: true,
            },
          }, // filter the results
          { $skip: pagination.skip },
          { $limit: pagination.limit },
          { $sample: { size: pagination.limit } },
        ]);

        const count = await Product.countDocuments({
          user: { $eq: ObjectId(req.params.shop_id) },
          main_category: req.params.selected,
        });

        const productPageCount = Math.ceil(count / per_page);

        //console.log(data);

        return httpRespond.severResponse(res, {
          status: true,
          data,
          endOfFile: data.length === 0 ? true : false,
          productPageCount,
        });
      } catch (e) {
        console.log(e);
        return httpRespond.severResponse(res, {
          status: false,
        });
      }
    }
  );
};
