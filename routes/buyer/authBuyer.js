const mongoose = require("mongoose");
const User = mongoose.model("users");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
let messageBody = "";

const password = require("../../functions/password");
const httpRespond = require("../../functions/httpRespond");
const smsFunctions = require("../../functions/SMS");
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
  app.post("/api/verification", async (req, res) => {
    try {
      const code = Math.floor(Math.random() * 100) + 9000;
      //  send verification code
      messageBody =
        "Your verification code is: " +
        code +
        ". theShops is a marketplace where you can buy and sell anything";
      await smsFunctions.verification(req.body.phone, messageBody, code);
      return httpRespond.severResponse(res, {
        status: true,
        code: code,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        message: e,
      });
    }
  });

  app.post("/api/signup_buyer", async (req, res) => {
    try {
      const user = await User.findOne({ phone: req.body.phone });
      if (user) {
        return httpRespond.severResponse(res, {
          status: false,
          message: "user exist",
        });
      }

      const customer = await stripe.customers.create({
        description: "Customer for: " + req.body.email,
        name: req.body.first_name + " " + req.body.last_name,
        phone: req.body.phone,
        email: req.body.email,
      });
      const newUser = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone,
        email: req.body.email,
        stripe_payment_id: customer.id,
        country: "usa",
        currency: "USD",
      };
      const createdUser = await new User(newUser).save();
      console.log(createdUser);
      
      return httpRespond.severResponse(res, {
        status: true,
        message: "user created",
        user: createdUser,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        message: e,
      });
    }
  });

  //   app.post("/api/update_device_token", async (req, res) => {
  //     const client = await Client.findOne({ _id: req.body.clientId });
  //     client.deviceToken = req.body.token;
  //     client.save();
  //     return httpRespond.severResponse(res, {
  //       status: true,
  //     });
  //   });
};
