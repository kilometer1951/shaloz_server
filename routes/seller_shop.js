const mongoose = require("mongoose");
const User = mongoose.model("users");
const Variant = mongoose.model("variants");
const Product = mongoose.model("products");
const ShoppingCart = mongoose.model("shoppingcarts");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
var ObjectId = require("mongodb").ObjectID;
var request = require("request");

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
  app.get(
    "/api/search/dynamic_search_seller_shop/:seller_id/:value",
    async (req, res) => {
      try {
        //search products
        const products = await Product.find({
          user: { $eq: ObjectId(req.params.seller_id) },
          $or: [
            { product_name: { $regex: new RegExp(req.params.value, "i") } },
            { main_category: { $regex: new RegExp(req.params.value, "i") } },
            { sub_category1: { $regex: new RegExp(req.params.value, "i") } },
            { sub_category2: { $regex: new RegExp(req.params.value, "i") } },
          ],
        })
          .sort("-date")
          .limit(6)
          .populate("user")
          .populate("variants");

        return httpRespond.severResponse(res, {
          status: true,
          products,
        });
      } catch (e) {
        console.log(e);

        return httpRespond.severResponse(res, {
          status: false,
        });
      }
    }
  );

  app.get(
    "/api/view/display_random_cat_seller_shop/:seller_id",
    async (req, res) => {
      try {
        const products = await Product.aggregate([
          {
            $match: {
              user: { $eq: ObjectId(req.params.seller_id) },
            },
          }, // filter the results
          { $limit: 6 },
          { $sample: { size: 6 } },
        ]);

        return httpRespond.severResponse(res, {
          status: true,
          products,
        });
      } catch (e) {
        console.log(e);
        return httpRespond.severResponse(res, {
          status: false,
        });
      }
    }
  );

  app.get("/api/view/orders/:seller_id", async (req, res) => {
    try {
      let per_page = 10;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };
      const orders = await ShoppingCart.find({
        seller: req.params.seller_id,
        has_checkedout: true,
        order_shipped: false,
      })
        .populate("items.product")
        .populate("seller")
        .populate("user")
        .limit(pagination.limit)
        .skip(pagination.skip);

      console.log(orders);

      return httpRespond.severResponse(res, {
        status: true,
        orders,
        endOfFile: orders.length === 0 ? true : false,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post("/api/add/update_tracking_number_pay_seller", async (req, res) => {
    try {
      //get the cart
      const shoppingCart = await ShoppingCart.findOne({
        _id: req.body.cart_id,
        has_checkedout: true,
        order_shipped: false,
      })
        .populate("user")
        .populate("seller");

      if (shoppingCart) {
        //get shipping
        var options = {
          method: "GET",
          url:
            "https://api.shipengine.com/v1/tracking?carrier_code=stamps_com&tracking_number=" +
            req.body.tracking_number,
          headers: {
            Host: "api.shipengine.com",
            "API-Key": "TEST_4fXNkXGqxlhbxfcSEnGdfDZXpAK0bpSl84HUKvoZjcs",
          },
        };
        request(options, async function (error, response) {
          if (error) {
            return httpRespond.severResponse(res, {
              status: false,
              event_not_found: false,
            });
          }
          const data = JSON.parse(response.body);

          console.log(data);

          if (parseFloat(shoppingCart.total) < 300) {
            console.log("charge 4% + 1");
            const cart_total = parseFloat(shoppingCart.total).toFixed(2);
            const processing_fee = parseFloat(
              shoppingCart.processing_fee
            ).toFixed(2);

            const newTotal = (
              parseFloat(cart_total) - parseFloat(processing_fee)
            ).toFixed(2);

            const theshop_takes = (parseFloat(newTotal) * 0.04 + 1).toFixed(2);
            const seller_takes = (
              parseFloat(newTotal) - parseFloat(theshop_takes)
            ).toFixed(2);

            const amount_to_transfer = Math.round(
              parseFloat(seller_takes) * 100
            );

            const transfer = await stripe.transfers.create({
              amount: amount_to_transfer,
              currency: "usd",
              source_transaction: shoppingCart.stripe_charge_id,
              destination: shoppingCart.seller.stripe_seller_account_id,
            });
          } else {
            console.log("charge 6% + 2.50");
            const cart_total = parseFloat(shoppingCart.total).toFixed(2);
            const processing_fee = parseFloat(
              shoppingCart.processing_fee
            ).toFixed(2);

            const newTotal = (
              parseFloat(cart_total) - parseFloat(processing_fee)
            ).toFixed(2);

            const theshop_takes = (parseFloat(newTotal) * 0.06 + 2.5).toFixed(
              2
            );
            const seller_takes = (
              parseFloat(newTotal) - parseFloat(theshop_takes)
            ).toFixed(2);

            const amount_to_transfer = Math.round(
              parseFloat(seller_takes) * 100
            );

            const transfer = await stripe.transfers.create({
              amount: amount_to_transfer,
              currency: "usd",
              source_transaction: shoppingCart.stripe_charge_id,
              destination: shoppingCart.seller.stripe_seller_account_id,
            });
          }
          return httpRespond.severResponse(res, {
            status: false,
            event_not_found: true,
          });
        });
      }
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
};
