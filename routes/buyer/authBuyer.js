const mongoose = require("mongoose");
const User = mongoose.model("users");
const Shipping = mongoose.model("shippings");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
let messageBody = "";

const password = require("../../functions/password");
const httpRespond = require("../../functions/httpRespond");
const smsFunctions = require("../../functions/SMS");
//const cloudinary = require("cloudinary");

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
// cloudinary.config({
//   cloud_name: "ibc",
//   api_key: "887482388487867",
//   api_secret: "IDtj1fdfnQNJV-BTQ0mgfGOIIgU",
// });

const bucketName = "the-shop-123";
const path = require("path");
const serviceKey = path.join(__dirname, "../keys.json");
const { Storage } = require("@google-cloud/storage");
const storage_google = new Storage({
  keyFilename: serviceKey,
  projectId: "theshop-275817",
});

module.exports = (app) => {
  app.post("/api/verification", async (req, res) => {
    try {
      const code = Math.floor(Math.random() * 100) + 9000;
      //  send verification code
      messageBody =
        "Your verification code is: " +
        code +
        ". theShop is a marketplace where you can buy and sell anything";
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


  app.post("/api/verify_user", async (req, res) => {
    try {
      const user = await User.findOne({ phone: req.body.phone });
      if(user) {
        //user found 
        const code = Math.floor(Math.random() * 100) + 9000;
        //  send verification code
        messageBody =
          "Your verification code is: " +
          code +
          ". theShops is a marketplace that allows you to build your online store and start selling in minutes. Buy and sell with theShops";
        await smsFunctions.verification(req.body.phone, messageBody, code);
        return httpRespond.severResponse(res, {
          status: true,
          code: code,
          user
        });
      } else {
        return httpRespond.severResponse(res, {
          status: false,
        });
      }

      
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        message: e,
      });
    }
  });

  app.post("/api/signup_buyer", async (req, res) => {
    try {
      const user = await User.findOne({ phone: req.body.phone});
      console.log(user);
      
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
        password: password.encryptPassword(req.body.password),
        country: "usa",
        currency: "USD",
      };
      const createdUser = await new User(newUser).save();

      const newShipping = {
        user: createdUser._id,
        full_name: req.body.first_name + " " + req.body.last_name,
        country: "United States",
      };

      await new Shipping(newShipping).save();

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
  app.post("/api/login_users", async (req, res) => {
    //login
    try {
      const user = await User.findOne({ email: req.body.email });            
      if (!user) {
        return httpRespond.severResponse(res, {
          status: false,
          message: "user not found",
        });
      }

      if (!password.comparePassword(req.body.password, user.password)) {
        return httpRespond.severResponse(res, {
          status: false,
          message: "user not found",
        });
      }

      return httpRespond.severResponse(res, {
        status: true,
        message: "user found",
        user: user,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        message: "api error",
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
