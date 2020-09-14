const mongoose = require("mongoose");
const User = mongoose.model("users");
const Variant = mongoose.model("variants");
const Product = mongoose.model("products");
const ShoppingCart = mongoose.model("shoppingcarts");
const config = require("../config/secret");
const stripe = require("stripe")(config.stripeSK);
const ReviewShop = mongoose.model("reviewShops");
const MainCategory = mongoose.model("mainCategories");
const TrackStoreVisitor = mongoose.model("trackStoreVisitors");

let ObjectId = require("mongodb").ObjectID;
const Moment = require("moment");

let messageBody = "";
const smsFunctions = require("../functions/SMS");
const httpRespond = require("../functions/httpRespond");
//const cloudinary = require("cloudinary");

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
// cloudinary.config({
//   cloud_name: "ibc",
//   api_key: "887482388487867",
//   api_secret: "IDtj1fdfnQNJV-BTQ0mgfGOIIgU",
// });

const bucketName = "the-shop-123";
const path = require("path");
const serviceKey = path.join(__dirname, "../keys.json");
const { Storage } = require("@google-cloud/storage");
const storage_google = new Storage({
  keyFilename: serviceKey,
  projectId: "theshop-275817",
});

module.exports = (app) => {
  app.post("/api/update_shop_category/:shop_id", async (req, res) => {
    try {
      const updated = await User.updateOne(
        { _id: ObjectId(req.params.shop_id) },
        { $set: { store_categories: req.body.selectedCategories } }
      );
      console.log(updated);

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/user_info/:user_id", async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.user_id });
      return httpRespond.severResponse(res, {
        status: true,
        user,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.get("/api/view/variant_content/:variant_id", async (req, res) => {
    try {
      const data = await Variant.find({
        _id: req.params.variant_id,
      });
      return httpRespond.severResponse(res, {
        status: true,
        data: data.variantContent,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.get("/api/view/variant/:user_id", async (req, res) => {
    try {
      const data = await Variant.find({
        user: req.params.user_id,
      });
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

  app.post("/api/add/variant", async (req, res) => {
    try {
      let response;
      const data = await Variant.findOne({
        user: req.body.user_id,
        name: req.body.name,
      });
      if (!data) {
        const newData = {
          user: req.body.user_id,
          name: req.body.name,
        };
        response = await new Variant(newData).save();
        return httpRespond.severResponse(res, {
          status: true,
          variant_id: response._id,
        });
      } else {
        return httpRespond.severResponse(res, {
          status: true,
          variant_id: data._id,
        });
      }
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });
  app.post("/api/add/variant_content", async (req, res) => {
    try {
      let response;
      const variant = await Variant.findOne({
        _id: req.body.variant_id,
      });
      //check if option content exist before you push
      response = variant.variantContent.filter((value) => {
        return value.content === req.body.content;
      });

      if (response.length === 0) {
        const product_content = {
          content: req.body.content,
          price: req.body.content_price,
        };
        variant.variantContent.push(product_content);
        variant.save();
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

  app.post("/api/edit/variant", async (req, res) => {
    try {
      let response;
      const data = await Variant.findOne({
        _id: req.body.variant_id,
      });
      data.name = req.body.name;
      data.save();
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

  app.post("/api/edit/variant_content", async (req, res) => {
    try {
      let response;
      const data = await Variant.findOne({
        _id: req.body.variant_id,
      });

      for (let i = 0; i < data.variantContent.length; i++) {
        if (data.variantContent[i]._id.equals(req.body.variant_content_id)) {
          data.variantContent[i] = {
            content: req.body.content,
            price: req.body.content_price,
          };
        }
      }
      await data.save();
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

  app.post("/api/delete/variant", async (req, res) => {
    try {
      await Variant.deleteOne({ _id: req.body.variant_id });
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

  app.post("/api/delete/variant_content", async (req, res) => {
    try {
      const response = await Variant.findOne({ _id: req.body.variant_id });
      const foundData = response.variantContent.filter(
        (value) => value._id == req.body.variant_content_id
      );
      response.variantContent.pull(foundData[0]);
      response.save();
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

  app.post("/api/add/product_details", async (req, res) => {
    try {
      const {
        user_id,
        product_name,
        product_price,
        product_details,
        product_qty,
        main_category,
        sub_category1,
        sub_category2,
        selectedVariant,
        discount,
        discount_start_date,
        discount_end_date,
        allow_purchase_when_out_of_stock,
        productCanBeCustomized,
        product_weight,
        product_weight_unit,
        product_can_be_customized_is_optional,
        product_personilization_note,
      } = req.body._data;

      let newVariant = [];
      if (selectedVariant.length !== 0) {
        selectedVariant.map((value) => {
          newVariant.push(value._id);
        });
      }

      const product = await Product.findOne({ product_name: product_name });
      if (!product) {
        //add
        const newProduct = {
          product_name: product_name,
          product_price: product_price,
          product_details: product_details,
          product_qty: product_qty,
          main_category: main_category,
          sub_category1: sub_category1 === "Select" ? "" : sub_category1,
          sub_category2: sub_category2 === "Select" ? "" : sub_category2,
          variants: newVariant,
          user: user_id,
          discount: discount,
          allow_purchase_when_out_of_stock: allow_purchase_when_out_of_stock,
          discount_start_date:
            discount_start_date === "Select date" ? "" : discount_start_date,
          discount_end_date:
            discount_end_date === "Select date" ? "" : discount_end_date,
          product_can_be_customized: productCanBeCustomized,
          product_weight: product_weight,
          product_weight_unit: product_weight_unit,
          product_can_be_customized_is_optional: product_can_be_customized_is_optional,
          product_personilization_note: product_personilization_note,
          product_approval_status: false,
        };
        const createdProduct = await new Product(newProduct).save();
        return httpRespond.severResponse(res, {
          status: true,
          product_id: createdProduct._id,
        });
      } else {
        //edit
        product.product_name = product_name;
        product.product_price = product_price;
        product.product_details = product_details;
        product.product_qty = product_qty;
        product.main_category = main_category;
        product.sub_category1 = sub_category1 === "Select" ? "" : sub_category1;
        product.sub_category2 = sub_category2 === "Select" ? "" : sub_category2;
        product.variants = newVariant;
        product.user = user_id;
        product.discount = discount;
        product.allow_purchase_when_out_of_stock = allow_purchase_when_out_of_stock;
        product.discount_start_date =
          discount_start_date === "Select date" ? "" : discount_start_date;
        product.discount_end_date =
          discount_end_date === "Select date" ? "" : discount_end_date;
        product.product_can_be_customized = productCanBeCustomized;
        product.product_weight = product_weight;
        product.product_weight_unit = product_weight_unit;
        product.product_can_be_customized_is_optional = product_can_be_customized_is_optional;
        product.product_personilization_note = product_personilization_note;
        product.product_approval_status = false;
        product.save();
        return httpRespond.severResponse(res, {
          status: true,
          product_id: product._id,
        });
      }
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/edit/product_details", async (req, res) => {
    try {
      const {
        _id,
        product_name,
        product_price,
        product_details,
        product_qty,
        main_category,
        sub_category1,
        sub_category2,
        selectedVariant,
        discount,
        discount_start_date,
        discount_end_date,
        allow_purchase_when_out_of_stock,
        productCanBeCustomized,
        product_weight,
        product_weight_unit,
        product_can_be_customized_is_optional,
        product_personilization_note,
      } = req.body._data;

      let newVariant = [];
      if (selectedVariant.length !== 0) {
        selectedVariant.map((value) => {
          newVariant.push(value._id);
        });
      }

      const product = await Product.findOne({ _id: _id });
      product.product_name = product_name;
      product.product_price = product_price;
      product.product_details = product_details;
      product.product_qty = product_qty;
      product.main_category = main_category;
      product.sub_category1 = sub_category1 === "Select" ? "" : sub_category1;
      product.sub_category2 = sub_category2 === "Select" ? "" : sub_category2;
      product.variants = newVariant;
      product.discount = discount;
      product.allow_purchase_when_out_of_stock = allow_purchase_when_out_of_stock;
      product.discount_start_date =
        discount_start_date === "Select date" ? "" : discount_start_date;
      product.discount_end_date =
        discount_end_date === "Select date" ? "" : discount_end_date;
      product.product_can_be_customized = productCanBeCustomized;
      product.product_weight = product_weight;
      product.product_weight_unit = product_weight_unit;
      product.product_can_be_customized_is_optional = product_can_be_customized_is_optional;
      product.product_personilization_note = product_personilization_note;
      product.product_approval_status = false;
      if (parseInt(product_qty) > 0) {
        product.inStock = true;
      }

      product.save();

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

  app.post(
    "/api/add/product_main_image/:product_id/:user_id",
    upload.single("main_image_data"),
    async (req, res) => {
      try {
        const product = await Product.findOne({ _id: req.params.product_id });
        if (product.cloud_main_image_id === "") {
          //new upload
          const response = await storage_google
            .bucket(bucketName)
            .upload(req.file.path, {
              gzip: true,

              metadata: {
                cacheControl: "public, max-age=31536000",
              },
            });
          let uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;
          product.main_image = uri;
          product.cloud_main_image_id = response[0].metadata.name;
          product.save();
        } else {
          //delete old photo and upload new photo
          await storage_google
            .bucket(bucketName)
            .file(product.cloud_main_image_id)
            .delete();
          // //upload new photo
          const response = await storage_google
            .bucket(bucketName)
            .upload(req.file.path, {
              gzip: true,

              metadata: {
                cacheControl: "public, max-age=31536000",
              },
            });
          let uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;
          product.main_image = uri;
          product.cloud_main_image_id = response[0].metadata.name;
          product.save();
        }
        // const products = await Product.find({ user: req.params.user_id });

        return httpRespond.severResponse(res, {
          status: true,
          // products,
        });
      } catch (e) {
        console.log(e);
        return httpRespond.severResponse(res, {
          status: false,
          e: e,
        });
      }
    }
  );

  app.post(
    "/api/add/product_sub_image_one/:product_id",
    upload.single("sub_image_1_data"),
    async (req, res) => {
      try {
        const product = await Product.findOne({ _id: req.params.product_id });
        if (product.cloud_sub_image_1_id === "") {
          //new upload
          const response = await storage_google
            .bucket(bucketName)
            .upload(req.file.path, {
              gzip: true,

              metadata: {
                cacheControl: "public, max-age=31536000",
              },
            });
          let uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;
          product.sub_image_1 = uri;
          product.cloud_sub_image_1_id = response[0].metadata.name;
          product.save();
        } else {
          //delete old photo and upload new photo
          await storage_google
            .bucket(bucketName)
            .file(product.cloud_sub_image_1_id)
            .delete();
          // //upload new photo
          const response = await storage_google
            .bucket(bucketName)
            .upload(req.file.path, {
              gzip: true,
              metadata: {
                cacheControl: "public, max-age=31536000",
              },
            });
          let uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;
          product.sub_image_1 = uri;
          product.cloud_sub_image_1_id = response[0].metadata.name;
          product.save();
        }

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
    }
  );

  app.post(
    "/api/add/product_sub_image_two/:product_id",
    upload.single("sub_image_2_data"),
    async (req, res) => {
      try {
        const product = await Product.findOne({ _id: req.params.product_id });
        if (product.cloud_sub_image_2_id === "") {
          //new upload
          const response = await storage_google
            .bucket(bucketName)
            .upload(req.file.path, {
              gzip: true,

              metadata: {
                cacheControl: "public, max-age=31536000",
              },
            });
          let uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;
          product.sub_image_2 = uri;
          product.cloud_sub_image_2_id = response[0].metadata.name;
          product.save();
        } else {
          //delete old photo and upload new photo
          await storage_google
            .bucket(bucketName)
            .file(product.cloud_sub_image_2_id)
            .delete();
          // //upload new photo
          const response = await storage_google
            .bucket(bucketName)
            .upload(req.file.path, {
              gzip: true,
              metadata: {
                cacheControl: "public, max-age=31536000",
              },
            });
          let uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;
          product.sub_image_2 = uri;
          product.cloud_sub_image_2_id = response[0].metadata.name;
          product.save();
        }

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
    }
  );

  app.post(
    "/api/add/product_sub_image_three/:product_id",
    upload.single("sub_image_3_data"),
    async (req, res) => {
      try {
        const product = await Product.findOne({ _id: req.params.product_id });
        if (product.cloud_sub_image_3_id === "") {
          //new upload
          const response = await storage_google
            .bucket(bucketName)
            .upload(req.file.path, {
              gzip: true,
              metadata: {
                cacheControl: "public, max-age=31536000",
              },
            });
          let uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;
          product.sub_image_3 = uri;
          product.cloud_sub_image_3_id = response[0].metadata.name;
          product.save();
        } else {
          //delete old photo and upload new photo
          await storage_google
            .bucket(bucketName)
            .file(product.cloud_sub_image_3_id)
            .delete();
          // //upload new photo
          const response = await storage_google
            .bucket(bucketName)
            .upload(req.file.path, {
              gzip: true,
              metadata: {
                cacheControl: "public, max-age=31536000",
              },
            });
          let uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;
          product.sub_image_3 = uri;
          product.cloud_sub_image_3_id = response[0].metadata.name;
          product.save();
        }

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
    }
  );
  app.get("/api/view/my_shop_product/:user_id", async (req, res) => {
    try {
      let per_page = 10;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };
      const my_shop_product = await Product.find({
        user: req.params.user_id,
        deleted: false,
      })
        .populate("user")
        .populate("variants")
        .limit(pagination.limit)
        .skip(pagination.skip)
        .sort({ date: -1 });

      console.log(my_shop_product.length);

      return httpRespond.severResponse(res, {
        status: true,
        my_shop_product,
        endOfFile: my_shop_product.length === 0 ? true : false,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/search/my_shop_product/:user_id/:value", async (req, res) => {
    try {
      const my_shop_product = await Product.find({
        user: req.params.user_id,
        $or: [
          { product_name: { $regex: new RegExp(req.params.value, "i") } },
          { main_category: { $regex: new RegExp(req.params.value, "i") } },
          { sub_category1: { $regex: new RegExp(req.params.value, "i") } },
          { sub_category2: { $regex: new RegExp(req.params.value, "i") } },
        ],
      })
        .sort("-date")
        .limit(20)
        .populate("user")
        .populate("variants");

      console.log(my_shop_product);

      return httpRespond.severResponse(res, {
        status: true,
        my_shop_product,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/fetch_shop_data/:shop_id", async (req, res) => {
    try {
      //get sellers info
      const seller_info = await User.findOne({ _id: req.params.shop_id });

      //get shop reviews
      const shop_reviews = await ReviewShop.find({
        shop: req.params.shop_id,
      })
        .populate("shop")
        .populate("user")
        .sort("-dateReviewed")
        .limit(12);

      const shop_reviews_count = await ReviewShop.countDocuments({
        shop: req.params.shop_id,
      });

      const shopReviewPageCount = Math.ceil(shop_reviews_count / 12);

      //get products
      const products = await Product.aggregate([
        {
          $match: {
            user: { $eq: ObjectId(req.params.shop_id) },
            inStock: true,
            product_approval_status: true,
          },
        }, // filter the results
        { $limit: 20 },
        { $sample: { size: 20 } },
      ]);
      const count = await Product.aggregate([
        {
          $match: {
            user: { $eq: ObjectId(req.params.shop_id) },
            inStock: true,
            product_approval_status: true,
          },
        },
      ]);

      const productPageCount = Math.ceil(count.length / 20);

      //get header products
      const shop_header_products = await Product.aggregate([
        {
          $match: {
            user: { $eq: ObjectId(req.params.shop_id) },
            inStock: true,
            product_approval_status: true,
          },
        }, // filter the results
        { $limit: 12 },
        { $sample: { size: 12 } },
      ]);

      //get categories

      const categories = await Product.aggregate([
        {
          $match: {
            user: { $eq: ObjectId(req.params.shop_id) },
            inStock: true,
            product_approval_status: true,
          },
        },
        {
          $group: {
            _id: "$main_category",
            count: { $sum: 1 },
          },
        },
      ]);

      return httpRespond.severResponse(res, {
        status: true,
        shop_reviews,
        shopReviewPageCount,
        seller_info,
        products,
        productPageCount,
        shop_header_products,
        categories,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get(
    "/api/view/fetchSellerWeeklyGraphData/:seller_id/:start_of_week/:end_of_week",
    async (req, res) => {
      try {
        const orderCount = await ShoppingCart.find({
          seller: ObjectId(req.params.seller_id),
          order_shipped: false,
          has_checkedout: true,
          stripe_refund_id: { $eq: "" },
        }).count();

        const visitorsCount = await TrackStoreVisitor.findOne({
          seller: ObjectId(req.params.seller_id),
        }).count();

        const data = await ShoppingCart.aggregate([
          {
            $match: {
              seller: ObjectId(req.params.seller_id),
              order_shipped: true,
              has_checkedout: true,
              stripe_refund_id: { $eq: "" },
              date_paid: {
                $gte: new Date(req.params.start_of_week),
                $lte: new Date(req.params.end_of_week),
              },
            },
          },
          {
            $group: {
              _id: { day: { $dayOfYear: "$date_paid" } },
              pay: { $push: { seller_takes: "$seller_takes" } },
            },
          },
        ]);

        //(Moment().dayOfYear(data[0]._id.day))._d
        // ["day 1", "day 2", "day 3", "day 4", "day 5", "day 6", "day 7"];
        const newArr = [0, 0, 0, 0, 0, 0, 0];
        data.map((value, index) => {
          try {
            //add and push
            const d = Moment().dayOfYear(value._id.day);
            const dow = d.weekday();

            let count = 0;
            for (let i = 0; i <= value.pay.length; i++) {
              if (value.pay[i] !== undefined) {
                let price = parseFloat(value.pay[i].seller_takes);
                count += price;
              }
            }

            if (dow === 0) {
              newArr[6] = count;
            } else if (dow === 1) {
              newArr[1] = count;
            } else if (dow === 2) {
              newArr[2] = count;
            } else if (dow === 3) {
              newArr[3] = count;
            } else if (dow === 4) {
              newArr[4] = count;
            } else if (dow === 5) {
              newArr[5] = count;
            }
          } catch (e) {
            console.log(e);
          }
        });

        // console.log(newArr);

        return httpRespond.severResponse(res, {
          status: true,
          newArr,
          orderCount,
          visitorsCount,
        });
      } catch (e) {
        console.log(e);

        return httpRespond.severResponse(res, {
          status: false,
        });
      }
    }
  );

  app.get("/api/shop/fetch_shop_categories/:shop_id", async (req, res) => {
    try {
      const categories = await Product.aggregate([
        {
          $match: {
            user: { $eq: ObjectId(req.params.shop_id) },
            inStock: true,
            product_approval_status: true,
          },
        },
        {
          $group: {
            _id: "$main_category",
            count: { $sum: 1 },
          },
        },
      ]);
      console.log(categories);

      return httpRespond.severResponse(res, {
        status: true,
        categories,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get(
    "/api/view/apply_shop_filter/:shop_id/:main_cat",
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
              main_category: req.params.main_cat,
              inStock: true,
              product_approval_status: true,
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
    }
  );

  app.post("/api/update_user_last_activity", async (req, res) => {
    try {
      const resp = await User.updateOne({ _id: ObjectId(req.body.user_id) }, [
        { $set: { last_activity: new Date() } },
      ]);
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

  app.get("/api/check_shop_name/:shopName", async (req, res) => {
    try {
      const response = await User.findOne({ shop_name: req.params.shopName });
      console.log(response);

      return httpRespond.severResponse(res, {
        status: response ? true : false,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });
};
