const mongoose = require("mongoose");
const User = mongoose.model("users");
const Variant = mongoose.model("variants");
const Product = mongoose.model("products");
const ShoppingCart = mongoose.model("shoppingcarts");
const config = require("../config/secret");
const stripe = require("stripe")(config.stripeSK);
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
  app.get("/api/view/cart/:user_id", async (req, res) => {
    try {
      let per_page = 5;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };
      const cartData = await ShoppingCart.find({
        user: req.params.user_id,
        has_checkedout: false,
      })
        .populate("items.product")
        .populate("seller")
        .limit(pagination.limit)
        .skip(pagination.skip);

      const cart_count = await ShoppingCart.find({
        user: req.params.user_id,
        has_checkedout: false,
      }).countDocuments();

      const cartPageCount = Math.ceil(cart_count / per_page);

      return httpRespond.severResponse(res, {
        status: true,
        cartData,
        endOfFile: cartData.length === 0 ? true : false,
        cart_count,
        cartPageCount,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post("/api/add/to_cart", async (req, res) => {
    try {
      const {
        product,
        seller,
        user,
        price,
        qty,
        discount,
        selected_variant_value,
        product_personalization_note,
      } = req.body.data;

      const shoppingCart = await ShoppingCart.findOne({
        user: ObjectId(user),
        seller: ObjectId(seller),
        has_checkedout: false,
      });

      const items = {
        product: product,
        qty: qty,
        price: parseFloat(price).toFixed(2),
        discount: discount,
        selected_variant_value: selected_variant_value,
        product_personalization_note: product_personalization_note,
      };
      const newShoppingCart = {
        user: user,
        seller: seller,
        items: items,
      };

      if (shoppingCart) {
        //update cart

        await ShoppingCart.updateOne(
          { _id: shoppingCart._id },
          { $push: { items: items } }
        );
      } else {
        await new ShoppingCart(newShoppingCart).save();
      }

      //new cart array
      const cart_count = await ShoppingCart.find({
        user: user,
        has_checkedout: "false",
      }).countDocuments();

      const cartData = await ShoppingCart.find({
        user: user,
        has_checkedout: false,
      })
        .populate("items.product")
        .populate("seller");

      return httpRespond.severResponse(res, {
        status: true,
        cartData,
        cart_count,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: true,
        message: e,
      });
    }
  });
};
