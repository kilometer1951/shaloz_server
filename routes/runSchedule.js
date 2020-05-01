const mongoose = require("mongoose");

const Moment = require("moment");
const Product = mongoose.model("products");

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

  const run = async () => {
    agenda.define("update discount", async (job) => {
      await runTask();
    });
  };

  (async function () {
    await agenda.start();
    await agenda.every("2 seconds", "update discount");
  })();

  run();
};
