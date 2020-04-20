const mongoose = require("mongoose");
const User = mongoose.model("users");
const Variant = mongoose.model("variants");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");

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
  app.get("/api/user_info/:user_id", async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.user_id });
      return httpRespond.severResponse(res, {
        status: true,
        user,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.get("/api/view/variant_content/:variant_id", async (req, res) => {
    try {
      const data = await Variant.find({
        _id: req.params.variant_id,
      });
      return httpRespond.severResponse(res, {
        status: true,
        data: data.variantContent,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.get("/api/view/variant/:user_id", async (req, res) => {
    try {
      const data = await Variant.find({
        user: req.params.user_id,
      });
      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/add/variant", async (req, res) => {
    try {
      let response;
      const data = await Variant.findOne({
        user: req.body.user_id,
        name: req.body.name,
      });
      if (!data) {
        const newData = {
          user: req.body.user_id,
          name: req.body.name,
        };
        response = await new Variant(newData).save();
        return httpRespond.severResponse(res, {
          status: true,
          variant_id: response._id,
        });
      } else {
        return httpRespond.severResponse(res, {
          status: true,
          variant_id: data._id,
        });
      }
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });
  app.post("/api/add/variant_content", async (req, res) => {
    try {
      let response;
      const variant = await Variant.findOne({
        _id: req.body.variant_id,
      });
      //check if option content exist before you push
      response = variant.variantContent.filter((value) => {
        return value.content === req.body.content;
      });

      if (response.length === 0) {
        const product_content = {
          content: req.body.content,
          price: req.body.content_price,
        };
        variant.variantContent.push(product_content);
        variant.save();
      }

      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/edit/variant", async (req, res) => {
    try {
      let response;
      const data = await Variant.findOne({
        _id: req.body.variant_id,
      });
      data.name = req.body.name;
      data.save();
      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/edit/variant_content", async (req, res) => {
    try {
      let response;
      const data = await Variant.findOne({
        _id: req.body.variant_id,
      });

      for (let i = 0; i < data.variantContent; i++) {
        if (data.variantContent[i]._id.equals(req.body.variant_content_id)) {
          data.variantContent[i] = {
            content: req.body.content,
            price: req.body.content_price,
          };
        }
      }
      await data.save();
      return httpRespond.severResponse(res, {
        status: true,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });
};
