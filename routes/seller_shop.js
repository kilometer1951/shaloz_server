const mongoose = require("mongoose");
const User = mongoose.model("users");
const Variant = mongoose.model("variants");
const Product = mongoose.model("products");
const ShoppingCart = mongoose.model("shoppingcarts");
const ShipmentCostPerProduct = mongoose.model("shipmentCostPerProducts");
const Refund = mongoose.model("refunds");

const TrackStoreVisitor = mongoose.model("trackStoreVisitors");
const config = require("../config/secret");
const stripe = require("stripe")(config.stripeSK);
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
          product_approval_status: true,
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
              product_approval_status: true,
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
        .sort({ date_user_checked_out: -1 })
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
        stripe_refund_id: { $eq: "" },
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
            "API-Key": "whyKvPPQflSdhMR+SA6Wedb9A1OGr+jdNBPjDBctx1w",
          },
          //whyKvPPQflSdhMR+SA6Wedb9A1OGr+jdNBPjDBctx1w
          //TEST_4fXNkXGqxlhbxfcSEnGdfDZXpAK0bpSl84HUKvoZjcs
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
              //

              if (parseFloat(shoppingCart.total) < 300.0) {
                console.log("charge 5% + 2");

                // update shopping cart
                shoppingCart.expected_arrival_date =
                  data.estimated_delivery_date === null
                    ? data.actual_delivery_date
                    : data.estimated_delivery_dat;
                shoppingCart.tracking_number = req.body.tracking_number;
                //shoppingCart.seller_takes = seller_takes;
                //shoppingCart.theshop_takes = theshop_takes;
                //  shoppingCart.stripe_transfer_id = transfer.id;
                shoppingCart.order_shipped = true;
                shoppingCart.date_entered_tracking = new Date();
                shoppingCart.save();
              } else {
                console.log("charge 6% + 3");
                // update shopping car
                shoppingCart.expected_arrival_date =
                  data.estimated_delivery_date === null
                    ? data.actual_delivery_date
                    : data.estimated_delivery_dat;
                shoppingCart.tracking_number = req.body.tracking_number;
                // shoppingCart.seller_takes = seller_takes;
                //shoppingCart.theshop_takes = theshop_takes;
                //shoppingCart.stripe_transfer_id = transfer.id;
                shoppingCart.order_shipped = true;
                shoppingCart.date_entered_tracking = new Date();
                shoppingCart.save();
              }

              messageBody =
                "Shaloz, Hi " +
                shoppingCart.user.first_name +
                ", your order has been shipped by " +
                shoppingCart.seller.shop_name +
                ". Your order should arrive by " +
                Moment(
                  new Date(
                    data.estimated_delivery_date === null
                      ? data.actual_delivery_date
                      : data.estimated_delivery_dat
                  )
                ).format("MMM Do, YYYY") +
                ". Your tracking number is " +
                req.body.tracking_number +
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
      } else {
        return httpRespond.severResponse(res, {
          status: false,
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
    "/api/view/seller_weekly_activity/:seller_id/:start_of_week/:end_of_week",
    async (req, res) => {
      try {
        let per_page = 10;
        let page_no = parseInt(req.query.page);
        let pagination = {
          limit: per_page,
          skip: per_page * (page_no - 1),
        };

        const weeklyActivity = await ShoppingCart.find({
          seller: req.params.seller_id,
          has_checkedout: true,
          order_shipped: true,
          stripe_refund_id: { $eq: "" },
          date_paid: {
            $gte: new Date(req.params.start_of_week),
            $lte: new Date(req.params.end_of_week),
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

  app.get(
    "/api/get_earnings/:seller_id/:start_of_week/:end_of_week",
    async (req, res) => {
      try {
        const seller_info = await User.findOne({ _id: req.params.seller_id });

        const earnings = {};
        // const start_of_week =  Moment(new Date()).startOf('isoWeek');
        // const end_of_week =  Moment(new Date()).endOf('isoWeek');

        const balance = await stripe.balance.retrieve({
          stripeAccount: seller_info.stripe_seller_account_id,
        });

        const total_earned_per_week = await ShoppingCart.find({
          seller: req.params.seller_id,
          order_shipped: true,
          has_checkedout: true,
          stripe_refund_id: { $eq: "" },
          date_paid: {
            $gte: new Date(req.params.start_of_week),
            $lte: new Date(req.params.end_of_week),
          },
        });

        let total = 0;

        for (var i = 0; i < total_earned_per_week.length; i++) {
          let total_earned = parseFloat(total_earned_per_week[i].seller_takes);
          total += parseFloat(total_earned);
        }

        earnings.available_balance = parseFloat(
          (balance.pending[0].amount + balance.available[0].amount) / 100
        ).toFixed(2);

        earnings.total_earned_per_week = parseFloat(total).toFixed(2);

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
    }
  );

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
        .sort({ date_user_checked_out: -1 })
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
            "API-Key": "whyKvPPQflSdhMR+SA6Wedb9A1OGr+jdNBPjDBctx1w",
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
          console.log(data);

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

  app.post("/api/track_store_visitors", async (req, res) => {
    try {
      const data = await TrackStoreVisitor.findOne({
        user: req.body.user_id,
        seller: req.body.seller_id,
      });
      if (!data) {
        //add
        await new TrackStoreVisitor({
          user: req.body.user_id,
          seller: req.body.seller_id,
          number_of_times_viewed: 1,
        }).save();
      } else {
        //update
        data.dateViewed = new Date();
        data.number_of_times_viewed += 1;
        data.save();
      }

      console.log(data);

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

  // app.post("/api/seller/refund_order", async (req, res) => {
  //   try {
  //     const cart = await ShoppingCart.findOne({
  //       _id: req.body.cart_id,
  //       order_shipped: false,
  //       has_checkedout: true,
  //       stripe_refund_id: { $eq: "" },
  //     })
  //       .populate("seller")
  //       .populate("user");

  //     if (cart) {
  //       const amount_to_refund = Math.round(
  //         parseFloat(req.body.amount_to_return) * 100
  //       );
  //       //    .1 refund client
  //       const refund = await stripe.refunds.create({
  //         charge: cart.stripe_charge_id,
  //         amount: amount_to_refund,
  //       });

  //       //update cart
  //       cart.stripe_refund_id = refund.id;
  //       cart.order_shipped = true;
  //       cart.refund_reason = req.body.refund_reason;
  //       cart.amount_to_refund = req.body.amount_to_refund;
  //       cart.save();
  //       //send sms

  //       const message2 =
  //         "Hi " +
  //         cart.user.first_name +
  //         " Your order has been cancelled. Thanks for shopping on Shaloz. For any issues or questions, you can send us an email at support@shaloz.com To view your orders, visit shaloz://purchased_orders";
  //       await smsFunctions.sendSMS(cart.user.phone, message2);

  //       return httpRespond.severResponse(res, {
  //         status: true,
  //       });
  //     } else {
  //       return httpRespond.severResponse(res, {
  //         status: false,
  //       });
  //     }
  //   } catch (e) {
  //     console.log(e);
  //     return httpRespond.severResponse(res, {
  //       status: false,
  //       message: e,
  //     });
  //   }
  // });

  app.post("/api/seller/refund_on_product", async (req, res) => {
    try {
      const cart = await ShoppingCart.findOne({
        _id: req.body.cart_id,
        order_shipped: false,
        has_checkedout: true,
        stripe_refund_id: { $eq: "" },
      })
        .populate("seller")
        .populate("user");

      const refundCollection = await Refund.findOne({
        cart_id: req.body.cart_id,
      })
        .populate("seller")
        .populate("user");

      const shipmentCostPerProduct = await ShipmentCostPerProduct.findOne({
        cart: req.body.cart_id,
        product: req.body.product_id,
      });

      if (cart) {
        const cartItemContent = cart.items.filter(
          (value) => value.product == req.body.product_id
        );

        let selected_variant_total = 0.0;

        for (
          let i = 0;
          i < cartItemContent[0].selected_variant_value.length;
          i++
        ) {
          let price = parseFloat(
            cartItemContent[0].selected_variant_value[i].price
          );
          selected_variant_total += price;
        }

        const price_with_variant = (
          parseFloat(cartItemContent[0].price) +
          parseFloat(selected_variant_total)
        ).toFixed(2);

        const original_price_of_item = (
          parseFloat(cartItemContent[0].price) +
          parseFloat(
            cartItemContent[0].discount !== ""
              ? cartItemContent[0].discount
              : 0.0
          )
        ).toFixed(2);

        const original_price_of_item_with_variant = (
          parseFloat(original_price_of_item) +
          parseFloat(selected_variant_total)
        ).toFixed(2);

        if (cart.store_promotion_discount_is_applied) {
          const new_store_discount = (
            parseFloat(cart.store_promotion_discount) -
            parseFloat(original_price_of_item_with_variant) *
              (parseFloat(cart.store_promotion_discount_percentage) / 100)
          ).toFixed(2);
          cart.store_promotion_discount = new_store_discount;
          // console.log(new_store_discount);
        }

        let amount_to_refund = 0.0;

        if (cart.store_promotion_discount_is_applied) {
          let amount =
            (parseFloat(selected_variant_total) +
              parseFloat(cartItemContent[0].price)) *
            parseInt(cartItemContent[0].qty);
          let amount_dis =
            parseFloat(original_price_of_item_with_variant) *
            (parseFloat(cart.store_promotion_discount_percentage) / 100);

          let newTotal = parseFloat(amount) - parseFloat(amount_dis);
          amount_to_refund = newTotal.toFixed(2);
        } else {
          amount_to_refund =
            (parseFloat(selected_variant_total) +
              parseFloat(cartItemContent[0].price)) *
            parseInt(cartItemContent[0].qty);
        }

        //update shipment total
        cart.shippment_price = (
          parseFloat(cart.shippment_price) -
          parseFloat(shipmentCostPerProduct.cost)
        ).toFixed(2);
        //end

        const newRefundAmount = Math.round(
          (parseFloat(amount_to_refund) +
            parseFloat(shipmentCostPerProduct.cost)) *
            100
        );
        //    .1 refund client
        const refund = await stripe.refunds.create({
          charge: cart.stripe_charge_id,
          amount: newRefundAmount,
        });

        const items = {
          product: cartItemContent[0].product,
          qty: cartItemContent[0].qty,
          price: cartItemContent[0].price,
          discount: cartItemContent[0].discount,
          selected_variant_value: cartItemContent[0].selected_variant_value,
          product_personalization_note:
            cartItemContent[0].product_personalization_note,
          stripe_refund_id: refund.id,
          date_refunded: new Date(),
          refund_reason: req.body.refund_reason,
          amount_to_refund: amount_to_refund,
          shippment_price: shipmentCostPerProduct.cost,
        };

        if (refundCollection) {
          //update
          await Refund.updateOne(
            { _id: refundCollection._id },
            { $push: { items: items } }
          );
        } else {
          //create
          const newData = {
            user: cart.user._id,
            seller: cart.seller._id,
            items: items,
            cart_id: cart._id,
            stripe_charge_id: cart.stripe_charge_id,
            tax: cart.tax,
            processing_fee: cart.processing_fee,
            buyer_hasRedeemedPoints: cart.buyer_hasRedeemedPoints,
            amount_in_points_redeemed: cart.amount_in_points_redeemed,
            amount_in_cash_redeemed: cart.amount_in_cash_redeemed,
            refund_issued_by: req.body.refund_issued_by,
          };

          const refundData = await Refund(newData).save();
        }

        cart.save();
        //send sms

        await ShoppingCart.updateOne(
          {
            _id: cart._id,
            user: cart.user._id,
          },
          {
            $pull: {
              items: {
                _id: cartItemContent[0]._id,
              },
            },
          },
          {
            multi: true,
          }
        );

        const message2 =
          "Hi " +
          cart.user.first_name +
          " One of your orders has been cancelled and we have issued a refunded to the card we have on file. Thanks for shopping on Shaloz. For any issues or questions, you can send us an email at support@shaloz.com To view your orders, visit shaloz://purchased_orders";
        await smsFunctions.sendSMS(cart.user.phone, message2);

        const checkCartItemLength = await ShoppingCart.findOne({
          _id: cart._id,
          user: cart.user._id,
        });
        if (checkCartItemLength.items.length === 0) {
          await ShoppingCart.deleteOne({
            _id: cart._id,
            user: cart.user._id,
          });
        }

        return httpRespond.severResponse(res, {
          status: true,
        });
      } else {
        return httpRespond.severResponse(res, {
          status: false,
        });
      }
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        message: e,
      });
    }
  });
};
