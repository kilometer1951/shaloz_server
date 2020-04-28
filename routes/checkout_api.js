const mongoose = require("mongoose");
const User = mongoose.model("users");
const Variant = mongoose.model("variants");
const Product = mongoose.model("products");
const FavoriteProduct = mongoose.model("favoriteProducts");
const FavoriteShop = mongoose.model("favoriteShops");
const ReviewProduct = mongoose.model("reviewProducts");
const RecentView = mongoose.model("recentViews");
const MainCategory = mongoose.model("mainCategories");
const SubCategoryOne = mongoose.model("subCategoriesOne");
const SubCategoryTwo = mongoose.model("subCategoriesTwo");
const ShoppingCart = mongoose.model("shoppingcarts");
const Shipping = mongoose.model("shippings");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
var ObjectId = require("mongodb").ObjectID;
var request = require("request");

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
  app.get("/api/view/shipping_details/:user_id", async (req, res) => {
    try {
      const data = await Shipping.findOne({
        user: req.params.user_id,
      });
      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/validate_address", async (req, res) => {
    try {
      var options = {
        method: "POST",
        url: "https://api.shipengine.com/v1/addresses/validate",
        headers: {
          Host: "api.shipengine.com",
          "API-Key": "TEST_4fXNkXGqxlhbxfcSEnGdfDZXpAK0bpSl84HUKvoZjcs",
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            address_line1: req.body.data.street_address,
            city_locality: req.body.data.city,
            state_province: req.body.data.state,
            postal_code: req.body.data.zip_code,
            country_code: "US",
          },
        ]),
      };
      request(options, function (error, response) {
        if (error) throw new Error(error);

        return httpRespond.severResponse(res, {
          status: true,
          data: response.body,
        });
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/update_shipping_address", async (req, res) => {
    try {
      const {
        user_id,
        address,
        _city,
        _state,
        _postal_code,
        full_name,
        cart_id,
      } = req.body.data;

      const shipping = await Shipping.findOne({
        user: user_id,
      });

      const user = await User.findOne({ _id: user_id });

      //update shipping info
      shipping.full_name = full_name;
      shipping.street_address = address;
      shipping.zipe_code = _postal_code;
      shipping.city = _city;
      shipping.state = _state;
      shipping.save();

      //update cart
      const shoppingCart = await ShoppingCart.findOne({
        _id: cart_id,
      });

      shoppingCart.shipping_details = `${address}, ${_city}, ${_state}, ${_postal_code}`;
      shoppingCart.save();

      const data = {
        full_name,
        address,
        _city,
        _state,
        _postal_code,
      };

      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.get("/api/view/cards/:user_id", async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.params.user_id,
      });
      //get client card
      const cards = await stripe.customers.listSources(
        user.stripe_payment_id,
        {}
      );

      return httpRespond.severResponse(res, {
        status: true,
        cards: cards.data,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        e: e,
      });
    }
  });

  app.post("/api/add/add_card/", async (req, res) => {
    try {
      const user = await User.findOne({
        _id: req.body.user_id,
      });

      const response = await stripe.customers.createSource(
        user.stripe_payment_id,
        {
          source: req.body.tokenId,
        }
      );

      //   console.log(response);

      return httpRespond.severResponse(res, {
        status: true,
        card_id: response.id,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        message: e,
      });
    }
  });

  app.get(
    "/api/view/get_shipping_rate/:user_id/:seller_id/:total_qty/:unit",
    async (req, res) => {
      try {
        const user_shipping_info = await Shipping.findOne({
          user: req.params.user_id,
        });

        const user = await User.findOne({
            _id: req.params.user_id,
          });

        const seller_info = await User.findOne({
          _id: req.params.seller_id,
        });
        // console.log(req.body.items);

        //calculate shipping cost
        var options = {
          method: "POST",
          url: "https://api.shipengine.com/v1/rates",
          headers: {
            Host: "api.shipengine.com",
            "API-Key": "TEST_4fXNkXGqxlhbxfcSEnGdfDZXpAK0bpSl84HUKvoZjcs",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rate_options: { carrier_ids: ["se-222572"] },
            shipment: {
              validate_address: "validate_and_clean",
              ship_to: {
                name: user_shipping_info.full_name,
                phone: user.phone,
                address_line1: user_shipping_info.street_address,
                city_locality: user_shipping_info.city,
                state_province: user_shipping_info.state,
                postal_code: user_shipping_info.zipe_code,
                country_code: "US",
                address_residential_indicator: "yes",
              },
              ship_from: {
                company_name: seller_info.shop_name,
                name: seller_info.first_name + " "+ seller_info.last_name,
                phone: seller_info.phone,
                address_line1: seller_info.shop_address,
                address_line2: "",
                city_locality: seller_info.shop_location_city,
                state_province: seller_info.shop_location_state,
                postal_code: seller_info.shop_postal_code,
                country_code: "US",
                address_residential_indicator: "no",
              },
              packages: [{ weight: { value: parseInt(req.params.total_qty), unit:  req.params.unit} }],
            },
          }),
        };

        request(options, async function (error, response) {
          if (error) throw new Error(error);
          const data = JSON.parse(response.body);

          return httpRespond.severResponse(res, {
            status: true,
            amount: data.rate_response.rates[0].shipping_amount.amount,
          });
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



  app.post("/api/add/checkout_pay/", async (req, res) => {
    try {

        //get user details
      const user = await User.findOne({
        _id: req.body.user_id,
      });

      //get shopping cart 
      const shoppingCart = await ShoppingCart.findOne({
        _id: req.body.cart_id,
      });

      //get seller phone number 
      const seller_info = await User.findOne({
        _id: shoppingCart.seller,
      });

        //charge card
        let amount = Math.round(parseFloat(req.body.total) * 100);
        const charge = await stripe.charges.create({
          amount: amount,
          currency: "usd",
          customer: user.stripe_payment_id,
          source: req.body.card_id,
          transfer_group: req.body.cart_id,
          description:
            "Payment for products",
          statement_descriptor: "theShop"
        });

        shoppingCart.has_checkedout = true
        shoppingCart.sub_total = req.body.sub_total
        shoppingCart.shippment_price = req.body.shippment_price
        shoppingCart.tax = req.body.tax
        shoppingCart.processing_fee = req.body.processing_fee
        shoppingCart.total = req.body.total
        shoppingCart.stripe_charge_id = charge.id;
        shoppingCart.save()

        messageBody = "Hi "+seller_info.first_name+"you have a new order from "+user.first_name+". Open theShop to view the order"
              await smsFunctions.sendSMS(seller_info.phone, messageBody);

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
};




