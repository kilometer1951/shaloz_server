const mongoose = require("mongoose");
const User = mongoose.model("users");
const Variant = mongoose.model("variants");
const Product = mongoose.model("products");
const ShoppingCart = mongoose.model("shoppingcarts");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
var ObjectId = require("mongodb").ObjectID;
var request = require("request");
const Moment = require("moment");

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
          inStock: true,
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
              inStock: true,
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
        stripe_refund_id: { $eq: "" },
      })
        .populate("items.product")
        .populate("seller")
        .populate("user")
        .limit(pagination.limit)
        .skip(pagination.skip);

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

  app.post("/api/add/update_tracking_number", async (req, res) => {
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
          try {
            if (error) {
              console.log(error);

              return httpRespond.severResponse(res, {
                status: false,
                event_not_found: false,
              });
            }
            const data = JSON.parse(response.body);

            if (data.events.length === 0) {
              console.log("event not found erorr");
              return httpRespond.severResponse(res, {
                status: false,
                event_not_found: false,
              });
            } else {
              if (parseFloat(shoppingCart.total) < 300.00) {
                console.log("charge 4% + 1");
               
                // update shopping cart
                shoppingCart.expected_arrival_date = data.actual_delivery_date;
                shoppingCart.tracking_number = req.body.tracking_number;
                //shoppingCart.seller_takes = seller_takes;
                //shoppingCart.theshop_takes = theshop_takes;
                //  shoppingCart.stripe_transfer_id = transfer.id;
                shoppingCart.order_shipped = true;
                shoppingCart.date_entered_tracking = new Date();
                shoppingCart.save();
              } else {
                console.log("charge 6% + 2.50");
                // update shopping car
                shoppingCart.expected_arrival_date = data.actual_delivery_date;
                shoppingCart.tracking_number = req.body.tracking_number;
                // shoppingCart.seller_takes = seller_takes;
                //shoppingCart.theshop_takes = theshop_takes;
                //shoppingCart.stripe_transfer_id = transfer.id;
                shoppingCart.order_shipped = true;
                shoppingCart.date_entered_tracking = new Date();
                shoppingCart.save();
              }

              messageBody =
                "Hi " +
                shoppingCart.user.first_name +
                ", your order has been shipped by " +
                shoppingCart.seller.shop_name +
                ". Your order should arrive by " +
                Moment(new Date(data.actual_delivery_date)).format('MMM Do, YYYY')+
                ". Open the Shaloz app to track your order. shaloz://purchased_orders";
              await smsFunctions.sendSMS(shoppingCart.user.phone, messageBody);
              return httpRespond.severResponse(res, {
                status: true,
                event_not_found: true,
              });
            }
          } catch (e) {
            console.log(e);

            return httpRespond.severResponse(res, {
              status: false,
              event_not_found: false,
            });
          }
        });
      }
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get(
    "/api/view/seller_weekly_activity/:seller_id/:dateTime",
    async (req, res) => {
      try {
        let per_page = 8;
        let page_no = parseInt(req.query.page);
        let pagination = {
          limit: per_page,
          skip: per_page * (page_no - 1),
        };
        let curr = new Date(req.params.dateTime); // get current date
        let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
        let last = first + 6; // last day is the first day + 6

        const firstDayOfWeek = Moment(
          new Date(curr.setDate(first)),
          "DD-MM-YYYY"
        ).add(1, "day");
        const lastDayOfWeek = Moment(
          new Date(curr.setDate(last)),
          "DD-MM-YYYY"
        ).add(1, "day");

        const startOfWeek = Moment(firstDayOfWeek).format();
        const endOfWeek = Moment(lastDayOfWeek).format();

        //convert date to regular time zone
        let newStartDate = Moment(startOfWeek).format("YYYY-MM-DD");
        let newStartOfWeekDateTime = new Date(
          newStartDate + "" + "T05:00:00.000Z"
        );

        let newEndDate = Moment(endOfWeek).format("YYYY-MM-DD");
        let newEndOfWeekDateTime = new Date(newEndDate + "" + "T05:00:00.000Z");

        const weeklyActivity = await ShoppingCart.find({
          seller: req.params.seller_id,
          has_checkedout: true,
          order_shipped: true,
          stripe_refund_id: { $eq: "" },
          date_added: {
            $gte: newStartOfWeekDateTime,
            $lte: newEndOfWeekDateTime,
          },
        })
          .populate("items.product")
          .populate("seller")
          .populate("user")
          .limit(pagination.limit)
          .skip(pagination.skip);

        return httpRespond.severResponse(res, {
          status: true,
          weeklyActivity,
          endOfFile: weeklyActivity.length === 0 ? true : false,
        });
      } catch (e) {
        console.log(e);
        return httpRespond.severResponse(res, {
          status: false,
        });
      }
    }
  );

  app.get("/api/get_earnings/:seller_id/:dateTime", async (req, res) => {
    try {
      const seller_info = await User.findOne({ _id: req.params.seller_id });

      const earnings = {};
      let curr = new Date(req.params.dateTime); // get current date
      let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
      let last = first + 6; // last day is the first day + 6

      const firstDayOfWeek = Moment(
        new Date(curr.setDate(first)),
        "DD-MM-YYYY"
      ).add(1, "day");
      const lastDayOfWeek = Moment(
        new Date(curr.setDate(last)),
        "DD-MM-YYYY"
      ).add(1, "day");

      const startOfWeek = Moment(firstDayOfWeek).format();
      const endOfWeek = Moment(lastDayOfWeek).format();

      //convert date to regular time zone
      let newStartDate = Moment(startOfWeek).format("YYYY-MM-DD");
      let newStartOfWeekDateTime = new Date(
        newStartDate + "" + "T05:00:00.000Z"
      );

      let newEndDate = Moment(endOfWeek).format("YYYY-MM-DD");
      let newEndOfWeekDateTime = new Date(newEndDate + "" + "T05:00:00.000Z");

      const balance = await stripe.balance.retrieve({
        stripeAccount: seller_info.stripe_seller_account_id,
      });

      const total_earned_per_week = await ShoppingCart.find({
        seller: req.params.seller_id,
        order_shipped: true,
        has_checkedout: true,
        stripe_refund_id: { $eq: "" },
        date_added: {
          $gte: newStartOfWeekDateTime,
          $lte: newEndOfWeekDateTime,
        },
      });
      // console.log(total_earned_per_week);

      let total = 0;

      for (var i = 0; i < total_earned_per_week.length; i++) {
        let total_earned = parseFloat(total_earned_per_week[i].seller_takes);
        total += parseFloat(total_earned);
      }

      earnings.available_balance = parseFloat(
        (balance.pending[0].amount + balance.available[0].amount) / 100
      ).toFixed(2);

      earnings.total_earned_per_week = parseFloat(total).toFixed(2);

      //console.log(Moment(curr).format());

      return httpRespond.severResponse(res, {
        status: true,
        earnings,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/completed_orders_history/:seller_id", async (req, res) => {
    try {
      let per_page = 5;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };
      const orders = await ShoppingCart.find({
        seller: req.params.seller_id,
        has_checkedout: true,
        order_shipped: true,
        stripe_refund_id: { $eq: "" },
      })
        .populate("items.product")
        .populate("seller")
        .populate("user")
        .limit(pagination.limit)
        .skip(pagination.skip);

      console.log(orders.length);

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

  app.get("/api/view/fetch_purchased_package/:user_id", async (req, res) => {
    try {
      let per_page = 10;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };
      const data = await ShoppingCart.find({
        user: { $eq: req.params.user_id },
        has_checkedout: true,
        stripe_refund_id: { $eq: "" },
        //order_shipped: true,
      })
        .populate("items.product")
        .populate("seller")
        .populate("user")
        .sort("-date_added")
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
    "/api/view/track_package_progress/:tracking_number",
    async (req, res) => {
      try {
        var options = {
          method: "GET",
          url:
            "https://api.shipengine.com/v1/tracking?carrier_code=stamps_com&tracking_number=" +
            req.params.tracking_number,
          headers: {
            Host: "api.shipengine.com",
            "API-Key": "TEST_4fXNkXGqxlhbxfcSEnGdfDZXpAK0bpSl84HUKvoZjcs",
          },
        };
        request(options, async function (error, response) {
          if (error) {
            if (error) {
              console.log(error);
              return httpRespond.severResponse(res, {
                status: false,
              });
            }
          }
          const data = JSON.parse(response.body);
          console.log(data.events);

          return httpRespond.severResponse(res, {
            status: true,
            data: data.events,
          });
        });
      } catch (e) {
        return httpRespond.severResponse(res, {
          status: false,
        });
      }
    }
  );

  app.get("/api/view/fetch_shop_about_me/:seller_id", async (req, res) => {
    try {
      const seller = await User.findOne({ _id: req.params.seller_id });
      return httpRespond.severResponse(res, {
        status: true,
        seller,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/view/fetch_promo/:shop_id", async (req, res) => {
    try {
      const shop = await User.findOne({ _id: req.params.shop_id });
      return httpRespond.severResponse(res, {
        status: true,
        shop,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post("/api/add/shipping_promo", async (req, res) => {
    try {
      const shop = await User.findOne({ _id: req.body.shop_id });
      shop.offers_free_shipping = req.body.offers_free_shipping;
      shop.price_threshold = req.body.price_threshold;
      shop.save();

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

  app.post("/api/add/discount_promo", async (req, res) => {
    try {
      const shop = await User.findOne({ _id: req.body.shop_id });
      shop.offers_discount_on_price_threshold =
        req.body.offers_discount_on_price_threshold;
      shop.max_items_to_get_discount = req.body.max_items_to_get_discount;
      shop.discount_amount_for_threshold =
        req.body.discount_amount_for_threshold;
      shop.save();

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

  app.get("/api/view/check_stripe_document/:seller_id", async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.params.seller_id,
      });

      const ac = await stripe.accounts.retrieve(user.stripe_seller_account_id);
      console.log(ac.individual.verification.status);

      if (ac.individual.verification.status !== "unverified") {
        return httpRespond.severResponse(res, {
          verification: true,
        });
      } else {
        return httpRespond.severResponse(res, {
          verification: false,
        });
      }
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post("/api/update/stripe_details", async (req, res) => {
    try {
      const seller = await User.findOne({ _id: req.body.seller_id });

      const newUpdate = await stripe.accounts.update(
        seller.stripe_seller_account_id,
        {
          individual: {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
          },
        }
      );

      console.log(newUpdate.individual);

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
};
