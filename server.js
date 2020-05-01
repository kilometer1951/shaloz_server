const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  Agenda = require("agenda");

let http = require("http").Server(app);
let io = require("socket.io")(http);

const config = require("./config/secret");

//models
require("./models/User");
require("./models/SubCategoryOne");
require("./models/SubCategoryTwo");
require("./models/MainCategory");
require("./models/Product");
require("./models/Variant");
require("./models/ShoppingCart");
require("./models/Shipping");
require("./models/ReviewProduct");
require("./models/ReviewShop");
require("./models/RecentView");

require("./models/FavoriteProduct");
require("./models/FavoriteShop");
require("./models/VideoAd");


app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(config.database, {
  socketTimeoutMS: 0,
  keepAlive: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

require("./routes/buyer/authBuyer")(app);
require("./routes/seller/authSeller")(app);
require("./routes/api")(app);
require("./routes/adminApi")(app);
require("./routes/product_api")(app);
require("./routes/cart_api")(app);
require("./routes/checkout_api")(app);
require("./routes/seller_shop")(app);
require("./routes/video_ad")(app);



const port = process.env.PORT || 5002;
http.listen(port, () => {
  console.log("theShop server connected successfully at port:", port);
});
