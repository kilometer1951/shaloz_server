const mongoose = require("mongoose");
const User = mongoose.model("users");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
const Shipping = mongoose.model("shippings");

const password = require("../../functions/password");
const httpRespond = require("../../functions/httpRespond");
const smsFunctions = require("../../functions/SMS");
let messageBody = "";
const ip = require("ip");

const fs = require("fs");
//const cloudinary = require("cloudinary");

const multer = require("multer");
// const storage = multer.diskStorage({
//   filename: function (req, file, callback) {
//     callback(null, Date.now() + file.originalname);
//   },
// });
// const upload = multer({
//   storage: storage,
//   limits: { fieldSize: 25 * 1024 * 1024 },
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/filepath");
  },

  filename: function (req, file, cb) {
    let filename = "filenametogive";
    req.body.file = filename;

    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

// cloudinary.config({
//   cloud_name: "ibc",
//   api_key: "887482388487867",
//   api_secret: "IDtj1fdfnQNJV-BTQ0mgfGOIIgU",
// });

const bucketName = "the-shop-123";
const path = require("path");
const serviceKey = path.join(__dirname, "../../keys.json");
const { Storage } = require("@google-cloud/storage");
const storage_google = new Storage({
  keyFilename: serviceKey,
  projectId: "theshop-275817",
});

module.exports = (app) => {
  app.post("/api/create_stripe_partner_account", async (req, res) => {
    try {
      //find the user and update isActive to true
      const user = await User.findOne({ _id: req.body.user_id });
      if (user.stripe_seller_account_id === "") {
        //onbord the user for stripe connect
        const accountDetails = await stripe.accounts.create({
          type: "custom",
          country: "US",
          business_type: "individual",
          individual: {
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            email: user.email,
            address: {
              city: "Griffith",
              country: "US",
              line1: "1814 dylane drive",
              line2: null,
              postal_code: "46319",
              state: "IN",
            },
          },
          business_profile: {
            mcc: "7278",
            name: `${user.first_name} ${user.last_name}`,
            product_description: "I sell my products on Shaloz.",
            support_email: "support@shaloz.com",
            support_phone: "+13124010122",
            url: "https://www.shaloz.com",
          },
          requested_capabilities: ["card_payments", "transfers"],
          settings: {
            card_payments: {
              statement_descriptor_prefix: "Sz",
            },
            payments: {
              statement_descriptor: "Shaloz",
            },
            payouts: {
              statement_descriptor: "Shaloz",
            },
          },
        });
        user.stripe_seller_account_id = accountDetails.id;
        await user.save();
      }

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        message: e,
      });
    }
  });

  app.post("/api/upload_shop_image/:user_id", async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.user_id });
      upload((req, res) => {
        console.log(req.file);
      });

      //if (user.cloud_id === "") {
      //new upload
      //   const response = await storage_google
      //     .bucket(bucketName)
      //     .upload(req.file.path, {
      //       gzip: true,
      //       metadata: {
      //         cacheControl: "public, max-age=31536000",
      //       },
      //     });
      //   let uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;
      //   user.shop_logo = uri;
      //   user.cloud_id = response[0].metadata.name;
      //   user.save();
      // } else {
      //   //delete old photo and upload new photo
      //   await storage_google.bucket(bucketName).file(user.cloud_id).delete();
      //   // //upload new photo
      //   const response = await storage_google
      //     .bucket(bucketName)
      //     .upload(req.file.path, {
      //       gzip: true,

      //       metadata: {
      //         cacheControl: "public, max-age=31536000",
      //       },
      //     });
      //   let uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;
      //   user.shop_logo = uri;
      //   user.cloud_id = response[0].metadata.name;
      //   user.save();
      // }

      // return httpRespond.severResponse(res, {
      //   status: true,
      //   message: "upload complete",
      // });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        message: e,
      });
    }
  });

  app.post("/api/update_shop_location", async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.user_id });

      user.shop_location_state = req.body.locationState;
      user.shop_location_city = req.body.locationCity;
      user.shop_postal_code = req.body.postalCode;
      user.shop_address = req.body.address;
      user.shop_name = req.body.shopName;
      user.country = "United States";
      user.save();

      //update shipping info
      const shipping = await Shipping.findOne({
        user: req.body.user_id,
      });

      shipping.country = "United States";
      shipping.stree_address = req.body.address;
      shipping.zipe_code = req.body.postalCode;
      shipping.city = req.body.locationCity;
      shipping.state = req.body.locationState;
      shipping.save();

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

  app.post("/api/update_ssn", async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.user_id });
      const ssnSplit = req.body.ssn.split("");
      const lastFour = ssnSplit.splice(5, 8).toString().replace(/,/g, "");
      const response = await stripe.accounts.update(
        user.stripe_seller_account_id,
        {
          individual: { ssn_last_4: lastFour },
        }
      );
      console.log(response);

      user.ssn_number = req.body.ssn;
      user.save();
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
  app.post(
    "/api/upload_front_of_id/:user_id",
    upload.single("photo"),
    async (req, res) => {
      try {
        const user = await User.findOne({ _id: req.params.user_id });
        //update stripe account front of id card
        //upload to stripe
        const fp = fs.readFileSync(req.file.path);
        const photofileId = await stripe.files.create({
          file: {
            data: fp,
            name: req.file.filename,
            type: req.file.mimetype,
          },
          purpose: "identity_document",
        });
        //update stripe account
        const s = await stripe.accounts.update(user.stripe_seller_account_id, {
          individual: {
            verification: {
              document: {
                front: photofileId.id,
              },
            },
          },
        });

        console.log(photofileId);

        return httpRespond.severResponse(res, {
          status: true,
          user,
        });
      } catch (e) {
        console.log(e);
        return httpRespond.severResponse(res, {
          status: false,
          message: e,
        });
      }
    }
  );

  app.post(
    "/api/upload_back_of_id/:user_id",
    upload.single("photo"),
    async (req, res) => {
      try {
        const user = await User.findOne({ _id: req.params.user_id });
        // update stripe account front of id card
        // upload to stripe
        const fp = fs.readFileSync(req.file.path);
        const photofileId = await stripe.files.create({
          file: {
            data: fp,
            name: req.file.filename,
            type: req.file.mimetype,
          },
          purpose: "identity_document",
        });
        //update stripe account
        const s = await stripe.accounts.update(user.stripe_seller_account_id, {
          individual: {
            verification: {
              document: {
                back: photofileId.id,
              },
            },
            id_number: user.ssn_number,
          },
          tos_acceptance: {
            date: Math.floor(Date.now() / 1000),
            ip: ip.address(),
            user_agent: req.headers["user-agent"],
          },
        });

        console.log(photofileId);

        return httpRespond.severResponse(res, {
          status: true,
          user,
        });
      } catch (e) {
        console.log(e);
        return httpRespond.severResponse(res, {
          status: false,
          message: e,
        });
      }
    }
  );

  app.post("/api/add_bank_account_info", async (req, res) => {
    //add bank to account and update DOB
    try {
      const user = await User.findOne({ _id: req.body.user_id });
      const newDob = req.body.dob.split("/");
      await stripe.accounts.createExternalAccount(
        user.stripe_seller_account_id,
        {
          external_account: req.body.bankAccountToken,
        }
      );
      await stripe.accounts.update(user.stripe_seller_account_id, {
        individual: {
          id_number: user.ssn_number,
          dob: {
            day: parseInt(newDob[1].trim(""), 10),
            month: parseInt(newDob[0].trim(""), 10),
            year: parseInt(newDob[2].trim(""), 10),
          },
        },
      });

      user.shop_setup = "complete";
      user.save();

      return httpRespond.severResponse(res, {
        status: true,
        user,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        message: e.raw.message,
      });
    }
  });
};
