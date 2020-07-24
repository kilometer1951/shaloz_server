const mongoose = require("mongoose");
const User = mongoose.model("users");
const MainCategory = mongoose.model("mainCategories");
const SubCategoryOne = mongoose.model("subCategoriesOne");
const SubCategoryTwo = mongoose.model("subCategoriesTwo");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
const ShoppingCart = mongoose.model("shoppingcarts");
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

  app.get(
    "/api/admin/view/main_category/:main_category_name/:sub_category1",
    async (req, res) => {
      try {
        const main_data = await MainCategory.findOne({
          name: req.params.main_category_name,
        });
        const sub_data = await SubCategoryOne.findOne({
          mainCategory: main_data._id,
        });
        console.log(sub_data);
        console.log(main_data);

        return httpRespond.severResponse(res, {
          status: true,
          main_data,
          sub_data,
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
    "/api/admin/view/sub_category_one/:mainCategory_id",
    async (req, res) => {
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
    }
  );
  app.get(
    "/api/admin/view/sub_category_two/:sub_category1_id",
    async (req, res) => {
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
    }
  );

  app.get("/api/admin/fetch_purcahsed_package", async (req, res) => {
    try {
      console.log(parseInt(req.query.page));

      let per_page = 10;
      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };
      const data = await ShoppingCart.find({
        has_checkedout: true,
        order_shipped: true,
        seller_takes: "0.00",
        stripe_refund_id: { $eq: "" },
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

  app.post("/api/add/pay_seller", async (req, res) => {
    try {
      //get the cart
      const shoppingCart = await ShoppingCart.findOne({
        _id: req.body.cart_id,
      })
        .populate("user")
        .populate("seller");

      if (shoppingCart) {
        if (parseFloat(shoppingCart.total) < 300) {
          console.log("charge 5%");
          const cart_total = parseFloat(shoppingCart.total).toFixed(2);
          const processing_fee = parseFloat(
            shoppingCart.processing_fee
          ).toFixed(2);
          const tax = parseFloat(shoppingCart.tax).toFixed(2);

          const newTotal = (
            parseFloat(cart_total) -
            parseFloat(processing_fee) -
            parseFloat(tax)
          ).toFixed(2);

          const theshop_takes = (parseFloat(newTotal) * 0.05).toFixed(2);
          const seller_takes = (
            parseFloat(newTotal) - parseFloat(theshop_takes)
          ).toFixed(2);

          const amount_to_transfer = Math.round(parseFloat(seller_takes) * 100);

          const transfer = await stripe.transfers.create({
            amount: amount_to_transfer,
            currency: "usd",
            source_transaction: shoppingCart.stripe_charge_id,
            destination: shoppingCart.seller.stripe_seller_account_id,
          });
          // update shopping cart

          shoppingCart.seller_takes = seller_takes;
          shoppingCart.theshop_takes = theshop_takes;
          shoppingCart.stripe_transfer_id = transfer.id;
          shoppingCart.date_paid = new Date();
          shoppingCart.save();
        } else {
          console.log("charge 6% + 2.50");
          const cart_total = parseFloat(shoppingCart.total).toFixed(2);
          const processing_fee = parseFloat(
            shoppingCart.processing_fee
          ).toFixed(2);
          const tax = parseFloat(shoppingCart.tax).toFixed(2);

          const newTotal = (
            parseFloat(cart_total) -
            parseFloat(processing_fee) -
            parseFloat(tax)
          ).toFixed(2);

          const theshop_takes = (parseFloat(newTotal) * 0.06 + 2.5).toFixed(2);
          const seller_takes = (
            parseFloat(newTotal) - parseFloat(theshop_takes)
          ).toFixed(2);

          const amount_to_transfer = Math.round(parseFloat(seller_takes) * 100);

          const transfer = await stripe.transfers.create({
            amount: amount_to_transfer,
            currency: "usd",
            source_transaction: shoppingCart.stripe_charge_id,
            destination: shoppingCart.seller.stripe_seller_account_id,
          });
          // update shopping cart
          shoppingCart.seller_takes = seller_takes;
          shoppingCart.theshop_takes = theshop_takes;
          shoppingCart.stripe_transfer_id = transfer.id;
          shoppingCart.date_paid = new Date();
          shoppingCart.save();
        }
        messageBody =
          "Hi " +
          shoppingCart.seller.first_name +
          " we just processed your payment. shaloz://view_earning";
        await smsFunctions.sendSMS(shoppingCart.seller.phone, messageBody);
      }
      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      console.log(e);

      const shoppingCart = await ShoppingCart.findOne({
        _id: req.body.cart_id,
      })
        .populate("user")
        .populate("seller");
      messageBody =
        "Hi " +
        shoppingCart.seller.first_name +
        " we encountered an error while processing your payment. This might be due to verification issues. Please open the Shaloz app and review any verificaiton errors found in your shop. shaloz://review_errors";
     // await smsFunctions.sendSMS(shoppingCart.seller.phone, messageBody);
      //errors
      //send error message
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  // app.get("/api/view/fetch_cancel_order/:user_id", async (req, res) => {
  //   try {
  //     let per_page = 10;
  //     let page_no = parseInt(req.query.page);
  //     let pagination = {
  //       limit: per_page,
  //       skip: per_page * (page_no - 1),
  //     };
  //     const data = await ShoppingCart.find({
  //       has_checkedout: true,
  //       stripe_refund_id: { $eq: "" },
  //       order_shipped: false,
  //     })
  //       .populate("items.product")
  //       .populate("seller")
  //       .populate("user")
  //       .sort("-date_added")
  //       .limit(pagination.limit)
  //       .skip(pagination.skip);

  //     return httpRespond.severResponse(res, {
  //       status: true,
  //       data,
  //       endOfFile: data.length === 0 ? true : false,
  //     });
  //   } catch (e) {
  //     console.log(e);
  //     return httpRespond.severResponse(res, {
  //       status: false,
  //     });
  //   }
  // });

  app.post("/api/admin/insert_many", async (req, res) => {
    try {
      let _id = "5efdfc8262ca593b5bccefa2";
      let data = [
        {
          mainCategory: _id,
          name: "Everything Else",
        },
      ];
      const response = await SubCategoryTwo.insertMany(data);
      res.send(response);
    } catch (e) {
      console.log(e);
      res.send(e);
    }
  });

  app.get("/api/admin/all_users", async (req, res) => {
    try {
      let per_page = 20;

      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await User.aggregate([
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
      ]);
      const count = await User.countDocuments({});
      const pageCount = Math.ceil(count / per_page);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        pageCount,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.get("/api/admin/buyers", async (req, res) => {
    try {
      let per_page = 20;

      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await User.aggregate([
        {
          $match: {
            shop_setup: { $eq: "not_complete" },
          },
        },
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
      ]);
      const count = await User.countDocuments({});
      const pageCount = Math.ceil(count / per_page);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        pageCount,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.get("/api/admin/sellers", async (req, res) => {
    try {
      let per_page = 20;

      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await User.aggregate([
        {
          $match: {
            shop_setup: { $eq: "complete" },
          },
        },
        { $skip: pagination.skip },
        { $limit: pagination.limit },
        { $sample: { size: pagination.limit } },
      ]);
      const count = await User.countDocuments({});
      const pageCount = Math.ceil(count / per_page);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        pageCount,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.get("/api/admin/pay_seller", async (req, res) => {
    try {
      let per_page = 20;

      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await ShoppingCart.find({
        has_checkedout: true,
        order_shipped: true,
        stripe_refund_id: { $eq: "" },
        seller_takes: "0.00",
      })
        .populate("items.product")
        .populate("seller")
        .populate("user")
        .sort({ date_user_checked_out: -1 })
        .limit(pagination.limit)
        .skip(pagination.skip);

      const count = await User.countDocuments({});
      const pageCount = Math.ceil(count / per_page);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        pageCount,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/admin/fetch_orders_to_cancel", async (req, res) => {
    try {
      let per_page = 20;

      let page_no = parseInt(req.query.page);
      let pagination = {
        limit: per_page,
        skip: per_page * (page_no - 1),
      };

      const data = await ShoppingCart.find({
        has_checkedout: true,
        order_shipped: false,
      })
        .populate("items.product")
        .populate("seller")
        .populate("user")
        .sort({ date_user_checked_out: -1 })
        .limit(pagination.limit)
        .skip(pagination.skip);

      const count = await User.countDocuments({});
      const pageCount = Math.ceil(count / per_page);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        pageCount,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/admin/search_by_orderId/:orderId", async (req, res) => {
    try {
      const data = await ShoppingCart.find({
        _id: ObjectId(req.params.orderId),
        order_shipped: true,
        has_checkedout: true,
      })
        .populate("items.product")
        .populate("seller")
        .populate("user");

      return httpRespond.severResponse(res, {
        status: true,
        data,
        pageCount: 0,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get("/api/admin/search_by_orderId_cancel/:orderId", async (req, res) => {
    try {
      const data = await ShoppingCart.find({
        _id: ObjectId(req.params.orderId),
        order_shipped: false,
        has_checkedout: true,
        stripe_refund_id: { $eq: "" },
      })
        .populate("items.product")
        .populate("seller")
        .populate("user");

      return httpRespond.severResponse(res, {
        status: true,
        data,
        pageCount: 0,
      });
    } catch (e) {
      console.log(e);

      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post("/api/admin/cancel_order", async (req, res) => {
    try {
      const cart = await ShoppingCart.findOne({
        _id: req.body.cart_id,
        order_shipped: false,
        has_checkedout: true,
        stripe_refund_id: { $eq: "" },
      })
        .populate("seller")
        .populate("user");

      if (cart) {
        const amount_to_refund = Math.round(
          parseFloat(req.body.amount_to_return) * 100
        );
        //    .1 refund client
        const refund = await stripe.refunds.create({
          charge: cart.stripe_charge_id,
          amount: amount_to_refund,
        });

        //update cart

        cart.stripe_refund_id = refund.id;
        cart.order_shipped = true;
        cart.save();
        //send sms
        messageBody =
          "Hi " +
          cart.seller.first_name +
          " One of your customers cancelled their orders. This might be due to delay shipments. For any issues or questions, you can send us an email at support@shaloz.com To view your orders, visit shaloz://view_orders";
        await smsFunctions.sendSMS(cart.seller.phone, messageBody);

        const message2 =
          "Hi " +
          cart.user.first_name +
          " Your order has been cancelled. Thanks for shopping on Shaloz. For any issues or questions, you can send us an email at support@shaloz.com To view your orders, visit shaloz://purchased_orders";
        await smsFunctions.sendSMS(cart.user.phone, message2);

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
