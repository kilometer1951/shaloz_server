const mongoose = require("mongoose");
const Subscriber = mongoose.model("subscribers");
var ObjectId = require("mongodb").ObjectID;
const Moment = require("moment");

const httpRespond = require("../functions/httpRespond");
const Mailchimp = require("mailchimp-api-v3");

const mailchimp = new Mailchimp("471b6932b11b8fb893da63c2274722a8-us17");

module.exports = (app) => {
  app.post("/api/subscribe", async (req, res) => {
    try {
      const subs = await Subscriber.findOne({
        email: req.body.inputValue.trim().toLowerCase(),
      });
      if (!subs) {
        //save to db
        await new Subscriber({
          email: req.body.inputValue.trim().toLowerCase(),
        }).save();
        //send to mailchimp
        await mailchimp.post("/lists/776496a53d/members", {
          email_address: req.body.inputValue.trim().toLowerCase(),
          status: "subscribed",
        });
      } else {
        console.log("copy already exist");
      }

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
