const mongoose = require("mongoose");
const User = mongoose.model("users");
const LoyaltyPoints = mongoose.model("loyaltyPoints");
const Product = mongoose.model("products");
const ShoppingCart = mongoose.model("shoppingcarts");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
var ObjectId = require("mongodb").ObjectID;
const httpRespond = require("../functions/httpRespond");

module.exports = (app) => {
  app.post("/api/redeem_points", async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.user_id });

      //update user collection
      user.can_redeem_points = false;
      user.points = 0;
      user.save();

      //add loyalty points
      await new LoyaltyPoints({
        buyer: req.body.user_id,
        amount_in_points_redeemed: req.body.amount_in_points_redeemed,
        amount_in_cash_redeemed: req.body.amount_in_cash_redeemed,
        buyer_hasRedeemedPoints: true,
      }).save();

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
};
