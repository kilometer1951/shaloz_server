const mongoose = require("mongoose");
const User = mongoose.model("users");
const Variant = mongoose.model("variants");
const Product = mongoose.model("products");
const ShoppingCart = mongoose.model("shoppingcarts");
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
        };
        const createdProduct = await new Product(newProduct).save();
        return httpRespond.severResponse(res, {
          status: true,
          product_id: createdProduct._id,
        });
      } else {
        //edit
        (product.product_name = product_name),
          (product.product_price = product_price),
          (product.product_details = product_details),
          (product.product_qty = product_qty),
          (product.main_category = main_category),
          (product.sub_category1 =
            sub_category1 === "Select" ? "" : sub_category1),
          (product.sub_category2 =
            sub_category2 === "Select" ? "" : sub_category2),
          (product.variants = newVariant),
          (product.user = user_id),
          (product.discount = discount),
          (product.allow_purchase_when_out_of_stock = allow_purchase_when_out_of_stock),
          (product.discount_start_date =
            discount_start_date === "Select date" ? "" : discount_start_date),
          (product.discount_end_date =
            discount_end_date === "Select date" ? "" : discount_end_date),
          (product.product_can_be_customized = productCanBeCustomized);
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
      } = req.body._data;

      let newVariant = [];
      if (selectedVariant.length !== 0) {
        selectedVariant.map((value) => {
          newVariant.push(value._id);
        });
      }

      const product = await Product.findOne({ _id: _id });
      (product.product_name = product_name),
        (product.product_price = product_price),
        (product.product_details = product_details),
        (product.product_qty = product_qty),
        (product.main_category = main_category),
        (product.sub_category1 =
          sub_category1 === "Select" ? "" : sub_category1),
        (product.sub_category2 =
          sub_category2 === "Select" ? "" : sub_category2),
        (product.variants = newVariant),
        (product.discount = discount),
        (product.allow_purchase_when_out_of_stock = allow_purchase_when_out_of_stock),
        (product.discount_start_date =
          discount_start_date === "Select date" ? "" : discount_start_date),
        (product.discount_end_date =
          discount_end_date === "Select date" ? "" : discount_end_date),
        (product.product_can_be_customized = productCanBeCustomized);
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
        if (product.cloudinary_main_image_id === "") {
          //new upload
          const response = await cloudinary.uploader.upload(req.file.path);
          product.main_image = response.url;
          product.cloudinary_main_image_id = response.public_id;
          product.save();
        } else {
          //delete old photo and upload new photo
          await cloudinary.v2.uploader.destroy(
            product.cloudinary_main_image_id
          );
          // //upload new photo
          const response = await cloudinary.uploader.upload(req.file.path);
          product.main_image = response.url;
          product.cloudinary_main_image_id = response.public_id;
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
        if (product.cloudinary_sub_image_1_id === "") {
          //new upload
          const response = await cloudinary.uploader.upload(req.file.path);
          product.sub_image_1 = response.url;
          product.cloudinary_sub_image_1_id = response.public_id;
          product.save();
        } else {
          //delete old photo and upload new photo
          await cloudinary.v2.uploader.destroy(
            product.cloudinary_sub_image_1_id
          );
          // //upload new photo
          const response = await cloudinary.uploader.upload(req.file.path);
          product.sub_image_1 = response.url;
          product.cloudinary_sub_image_1_id = response.public_id;
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
        if (product.cloudinary_sub_image_2_id === "") {
          //new upload
          const response = await cloudinary.uploader.upload(req.file.path);
          product.sub_image_2 = response.url;
          product.cloudinary_sub_image_2_id = response.public_id;
          product.save();
        } else {
          //delete old photo and upload new photo
          await cloudinary.v2.uploader.destroy(
            product.cloudinary_sub_image_2_id
          );
          // //upload new photo
          const response = await cloudinary.uploader.upload(req.file.path);
          product.sub_image_2 = response.url;
          product.cloudinary_sub_image_2_id = response.public_id;
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
        if (product.cloudinary_sub_image_3_id === "") {
          //new upload
          const response = await cloudinary.uploader.upload(req.file.path);
          product.sub_image_3 = response.url;
          product.cloudinary_sub_image_3_id = response.public_id;
          product.save();
        } else {
          //delete old photo and upload new photo
          await cloudinary.v2.uploader.destroy(
            product.cloudinary_sub_image_3_id
          );
          // //upload new photo
          const response = await cloudinary.uploader.upload(req.file.path);
          product.sub_image_3 = response.url;
          product.cloudinary_sub_image_3_id = response.public_id;
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
      let per_page = 15;
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

      console.log(my_shop_product);

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



};
