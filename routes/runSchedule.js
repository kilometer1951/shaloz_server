const mongoose = require("mongoose");

const Moment = require("moment");
const Product = mongoose.model("products");
const ShoppingCart = mongoose.model("shoppingcarts");
const smsFunctions = require("../functions/SMS");
const httpRespond = require("../functions/httpRespond");

module.exports = (agenda) => {
  const runTask = async () => {
    const product = await Product.find({});

    for (var i = 0; i < product.length; i++) {
      if (product[i].discount !== "") {
        const date = new Date();
        if (
          Moment(date).isAfter(
            new Date(product[i].discount_end_date.split(/\s+/).join("")),
            "day"
          )
        ) {
          const response = await Product.findOne({ _id: product[i]._id });
          response.discount = "";
          response.save();
        }
      }
    }
    // console.log("update");
  };

  const runBuyerCartTask = async () => {
    const shopping_cart = await ShoppingCart.find({
      has_checkedout: false,
    }).populate("user");
    // //send message to all users

    if (shopping_cart.length !== 0) {
      for (let i = 0; i < shopping_cart.length; i++) {
        smsFunctions.sendSMS(
          shopping_cart[i].user.phone,
          `Hi ${shopping_cart[i].user.first_name}, you added items to your shopping cart and haven't completed your purchase. You can complete it now while they're still available. Open the Shaloz app to view your cart shaloz://cart`
        );
      }
    }
  };

  const run = async () => {
    agenda.define("update discount", async (job) => {
      await runTask();
    });
    agenda.define("check buyer cart send message", async (job) => {
      await runBuyerCartTask();
    });
  };

  (async function () {
    await agenda.start();
    await agenda.every("2 seconds", "update discount");
    await agenda.every("4 days", "check buyer cart send message");
  })();

  run();
};
