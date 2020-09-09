const mongoose = require("mongoose");
const User = mongoose.model("users");
const Shipping = mongoose.model("shippings");
const jwt = require("jwt-simple");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
let messageBody = "";

const password = require("../../functions/password");
const httpRespond = require("../../functions/httpRespond");
const smsFunctions = require("../../functions/SMS");
//const cloudinary = require("cloudinary");
const Mailchimp = require("mailchimp-api-v3");

const mailchimp = new Mailchimp("471b6932b11b8fb893da63c2274722a8-us17");

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

const Shopify = require("shopify-api-node");

const shopify = new Shopify({
  shopName: "Shaloz",
  apiKey: "366fb00f09f6cde2e1442388719cdb76",
  password: "Louis1951@1",
});

const tokenForUser = (user) => {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user, iat: timestamp }, "sdsfsfsf");
};

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
        "Shaloz, Your verification code is: " +
        code +
        ". Shaloz is a marketplace where you can buy and sell anything";
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
      if (user) {
        //user found
        const code = Math.floor(Math.random() * 100) + 9000;
        //  send verification code
        messageBody =
          "Shaloz, Your verification code is: " +
          code +
          ". Shaloz is the only platform that allow buyers to earn points while shopping for the things they love. Buyers can cash out points at anytime! With Shaloz, sellers spend less time managing their shop and more time on the fun stuff.";
        await smsFunctions.verification(req.body.phone, messageBody, code);
        return httpRespond.severResponse(res, {
          status: true,
          code: code,
          user,
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

  app.post("/api/mail_chimp", async (req, res) => {
    try {
      await mailchimp.post("/lists/776496a53d/members", {
        email_address: req.body.email.trim().toLowerCase(),
        status: "subscribed",
      });

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      console.log(e.detail);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.post("/api/signup_buyer", async (req, res) => {
    try {
      const user = await User.findOne({ phone: req.body.phone.trim() });
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
        phone: req.body.phone.trim(),
        email: req.body.email.trim().toLowerCase(),
      });

      const newUser = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone.trim(),
        email: req.body.email.trim().toLowerCase(),
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
        token: tokenForUser(createdUser),
      });
    } catch (e) {
      console.log(e.detail);

      return httpRespond.severResponse(res, {
        status: false,
        message: e,
      });
    }
  });
  app.post("/api/login_users", async (req, res) => {
    //login
    try {
      const user = await User.findOne({ email: req.body.email.toLowerCase() });
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
        token: tokenForUser(user),
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        message: "api error",
      });
    }
  });
  // app.post("/api/update_device_token", async (req, res) => {
  //   const client = await Client.findOne({ _id: req.body.clientId });
  //   client.deviceToken = req.body.token;
  //   client.save();
  //   return httpRespond.severResponse(res, {
  //     status: true,
  //   });
  // });

  app.get("/api/test", async (req, res) => {
    console.log(shopify);

    res.send({ status: true });
  });
};
