// const mongoose = require("mongoose");
// const User = mongoose.model("users");
// const Variant = mongoose.model("variants");
// const Product = mongoose.model("products");
// const ShoppingCart = mongoose.model("shoppingcarts");
// const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
// var ObjectId = require("mongodb").ObjectID;

// let messageBody = "";
// const smsFunctions = require("../functions/SMS");
// const httpRespond = require("../functions/httpRespond");
// const cloudinary = require("cloudinary");

// const multer = require("multer");
// const storage = multer.diskStorage({
//   filename: function (req, file, callback) {
//     callback(null, Date.now() + file.originalname);
//   },
// });
// const upload = multer({
//   storage: storage,
//   limits: { fieldSize: 25 * 1024 * 1024 },
// });
// cloudinary.config({
//   cloud_name: "ibc",
//   api_key: "887482388487867",
//   api_secret: "IDtj1fdfnQNJV-BTQ0mgfGOIIgU",
// });

// module.exports = (app) => {
//   app.get("/api/add/message", async (req, res) => {
//     try {
       

//         console.log("message");
        

//       return httpRespond.severResponse(res, {
//         status: true,
//       });
//     } catch (e) {
//       return httpRespond.severResponse(res, {
//         status: false,
//       });
//     }
//   });

// };
