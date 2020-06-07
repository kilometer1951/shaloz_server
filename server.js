const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  Agenda = require("agenda"),
  cors = require("cors")


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
require("./models/AgendaJob");

// require("./models/Message");
// require("./models/Conversation");

app.use(cors())
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(config.database, {
  socketTimeoutMS: 0,
  keepAlive: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
});


mongoose.connection.on("open", () => {
  mongoose.connection.db.collection("agendaJobs", (err, collection) => {
    collection.updateOne(
      { lockedAt: { $exists: true }, lastFinishedAt: { $exists: false } },
      {
        $unset: {
          lockedAt: undefined,
          lastModifiedBy: undefined,
          lastRunAt: undefined
        },
        $set: { nextRunAt: new Date() }
      },
      { multi: true },
      (e, numUnlocked) => {
        if (e) {
          console.error(e);
        }
        //console.log(`Unlocked #{${numUnlocked}} jobs.`);
      }
    );
  });
});


const agenda = new Agenda({
  db: {
    address: config.database,
    collection: "agendaJobs",
    options: { useNewUrlParser: true , useUnifiedTopology: true}
  }
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
//require("./socket/message_socket")(io);
require("./routes/runSchedule")(agenda);




const port = process.env.PORT || 5002;
http.listen(port, () => {
  console.log("theShop server connected successfully at port:", port);
});
