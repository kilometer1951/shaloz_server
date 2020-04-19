const mongoose = require("mongoose");
const User = mongoose.model("users");
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
        user
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  

};
