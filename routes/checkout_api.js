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
const LoyaltyPoints = mongoose.model("loyaltyPoints");
const ShipmentCostPerProduct = mongoose.model("shipmentCostPerProducts");

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

const displayPrice = (product_price, discount) => {
  if (discount === "") {
    return parseFloat(product_price).toFixed(2);
  } else {
    let price = parseInt(product_price);
    let _discount = parseInt(discount);

    let total_d = _discount / 100;
    let total_p = price * total_d;
    let total = price - total_p;

    return total.toFixed(2);
  }
};

module.exports = (app) => {
  app.get("/api/view/shipping_details/:user_id", async (req, res) => {
    try {
      const data = await Shipping.findOne({
        user: req.params.user_id,
      });
      const userRewardData = await User.findOne(
        { _id: req.params.user_id },
        { can_redeem_points: 1, points: 1 }
      );

      const loyalty_point_response = await LoyaltyPoints.findOne(
        {
          buyer: req.params.user_id,
          buyer_hasUsedPoints: false,
        },
        { buyer_hasRedeemedPoints: 1, amount_in_cash_redeemed: 1 }
      );

      console.log(loyalty_point_response);

      return httpRespond.severResponse(res, {
        status: true,
        data,
        userRewardData,
        loyalty_point_response:
          loyalty_point_response === null
            ? { buyer_hasRedeemedPoints: false, amount_in_cash_redeemed: 0 }
            : loyalty_point_response,
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

  app.post("/api/update_cart_item_price/", async (req, res) => {
    try {
      const shopping_cart = await ShoppingCart.findOne({
        _id: req.body.cart_id,
        user: req.body.user_id,
      }).populate("items.product");
      for (let i = 0; i < shopping_cart.items.length; i++) {
        await ShoppingCart.updateOne(
          {
            _id: req.body.cart_id,
            user: req.body.user_id,
            items: {
              $elemMatch: { _id: shopping_cart.items[i]._id },
            },
          },
          {
            $set: {
              "items.$.price": displayPrice(
                shopping_cart.items[i].product.product_price,
                shopping_cart.items[i].product.discount
              ),
              "items.$.discount":
                shopping_cart.items[i].product.discount !== ""
                  ? (
                      (parseFloat(shopping_cart.items[i].product.discount) /
                        100) *
                      parseFloat(shopping_cart.items[i].product.product_price)
                    ).toFixed(2)
                  : "",
            },
          }
        );
      }

      //console.log("response");

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

  app.get(
    "/api/view/get_shipping_rate/:user_id/:seller_id/:total_weight/:unit/:product_id/:product_weight/:cart_id/:product_qty",
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
                name: seller_info.first_name + " " + seller_info.last_name,
                phone: seller_info.phone,
                address_line1: seller_info.shop_address,
                address_line2: "",
                city_locality: seller_info.shop_location_city,
                state_province: seller_info.shop_location_state,
                postal_code: seller_info.shop_postal_code,
                country_code: "US",
                address_residential_indicator: "no",
              },
              packages: [
                {
                  weight: {
                    value: parseFloat(req.params.total_weight),
                    unit: req.params.unit,
                  },
                },
              ],
            },
          }),
        };

        //console.log(req.params.total_qty);

        request(options, async function (error, response) {
          if (error) {
            console.log(error);

            throw new Error(error);
          }
          const data = JSON.parse(response.body);

          if (data.rate_response.rates.length > 0) {
            //update shipment calculation
            const shopping_cart = await ShoppingCart.findOne({
              _id: req.params.cart_id,
              user: req.params.user_id,
            }).populate("items.product");

            const shipment_per_product = await ShipmentCostPerProduct.findOne({
              cart: req.params.cart_id,
              product: req.params.product_id,
            });
            if (shipment_per_product) {
              //update

              shipment_per_product.weight = req.params.product_weight;
              shipment_per_product.unit = req.params.unit;
              shipment_per_product.qty = req.params.product_qty;
              shipment_per_product.cost =
                data.rate_response.rates[0].shipping_amount.amount;
              shipment_per_product.shipping_to = {
                address_line1: user_shipping_info.street_address,
                city_locality: user_shipping_info.city,
                state_province: user_shipping_info.state,
                postal_code: user_shipping_info.zipe_code,
                country: "US",
              };
              shipment_per_product.shipping_from = {
                address_line1: seller_info.shop_address,
                city_locality: seller_info.shop_location_city,
                state_province: seller_info.shop_location_state,
                postal_code: seller_info.shop_postal_code,
                country: "US",
              };
              shipment_per_product.save();
            } else {
              //create
              await new ShipmentCostPerProduct({
                buyer: req.params.user_id,
                seller: req.params.seller_id,
                product: req.params.product_id,
                cart: req.params.cart_id,
                weight: req.params.product_weight,
                unit: req.params.unit,
                cost: data.rate_response.rates[0].shipping_amount.amount,
                qty: req.params.product_qty,
                shipping_to: {
                  address_line1: user_shipping_info.street_address,
                  city_locality: user_shipping_info.city,
                  state_province: user_shipping_info.state,
                  postal_code: user_shipping_info.zipe_code,
                  country: "US",
                },
                shipping_from: {
                  address_line1: seller_info.shop_address,
                  city_locality: seller_info.shop_location_city,
                  state_province: seller_info.shop_location_state,
                  postal_code: seller_info.shop_postal_code,
                  country: "US",
                },
              }).save();
            }

            for (let i = 0; i < shopping_cart.items.length; i++) {
              await ShoppingCart.updateOne(
                {
                  _id: req.params.cart_id,
                  user: req.params.user_id,
                  items: {
                    $elemMatch: { _id: shopping_cart.items[i]._id },
                  },
                },
                {
                  $set: {
                    "items.$.shipment_price":
                      data.rate_response.rates[0].shipping_amount.amount,
                  },
                }
              );
            }

            return httpRespond.severResponse(res, {
              status: true,
              amount: data.rate_response.rates[0].shipping_amount.amount,
            });
          } else {
            return httpRespond.severResponse(res, {
              status: false,
              message: "Weight limit exceeded",
            });
          }
        });
      } catch (e) {
        // console.log(e);
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

      //update loyalty points
      const loyalty_points = await LoyaltyPoints.findOne({
        buyer: req.body.user_id,
        buyer_hasUsedPoints: false,
      });

      // charge card
      let amount = Math.round(parseFloat(req.body.total) * 100);
      const charge = await stripe.charges.create({
        amount: amount,
        currency: "usd",
        customer: user.stripe_payment_id,
        source: req.body.card_id,
        transfer_group: req.body.cart_id,
        description: "Payment for products",
        statement_descriptor: "Shaloz, Inc",
      });

      let total_discount = 0.0;
      for (let i = 0; i < shoppingCart.items.length; i++) {
        let discount =
          shoppingCart.items[i].discount !== ""
            ? parseFloat(shoppingCart.items[i].discount)
            : 0.0;
        total_discount += discount;
      }

      const store_discount =
        parseInt(seller_info.max_items_to_get_discount) -
        shoppingCart.items.length;

      const store_promotion_discount = (
        parseFloat(req.body.discount) - parseFloat(total_discount)
      ).toFixed(2);

      shoppingCart.store_promotion_discount = store_promotion_discount;

      shoppingCart.store_promotion_discount_is_applied =
        store_discount <= 0 ? true : false;
      shoppingCart.store_promotion_discount_percentage =
        seller_info.discount_amount_for_threshold;
      shoppingCart.has_checkedout = true;
      // shoppingCart.sub_total = req.body.sub_total;
      shoppingCart.shippment_price = req.body.shippment_price;
      shoppingCart.tax = req.body.tax;
      shoppingCart.processing_fee = req.body.processing_fee;
      shoppingCart.client_paid = req.body.total;
      shoppingCart.stripe_charge_id = charge.id;
      shoppingCart.date_user_checked_out = new Date();
      shoppingCart.discount_applied =
        req.body.discount !== "0.00" ? "true" : "false";
      shoppingCart.buyer_hasRedeemedPoints =
        loyalty_points === null ? false : true;
      shoppingCart.amount_in_points_redeemed =
        loyalty_points === null ? 0 : loyalty_points.amount_in_points_redeemed;
      shoppingCart.amount_in_cash_redeemed =
        loyalty_points === null ? 0 : loyalty_points.amount_in_cash_redeemed;

      shoppingCart.save();

      //points
      const points = user.points + Math.round(req.body.total);
      user.points = points;
      user.can_redeem_points = points >= 1000 ? true : false;
      user.save();

      if (loyalty_points) {
        loyalty_points.seller = shoppingCart.seller;
        loyalty_points.cart = req.body.cart_id;
        loyalty_points.buyer_hasUsedPoints = true;
        loyalty_points.save();
      }

      //update product qty
      for (let i = 0; i < shoppingCart.items.length; i++) {
        const product = await Product.findOne({
          _id: shoppingCart.items[i].product,
        });
        const qty_in_stock = parseInt(product.product_qty);
        const qty_bought = parseInt(shoppingCart.items[i].qty);
        const newQty = qty_in_stock - qty_bought;
        if (newQty <= 0) {
          if (!product.allow_purchase_when_out_of_stock) {
            product.inStock = false;
          }
        }
        product.product_qty = newQty;
        product.save();
      }

      messageBody =
        "Shaloz, Hi " +
        seller_info.shop_name +
        " you have a new order from " +
        user.first_name +
        ". Open the Shaloz app to view the order. shaloz://view_orders";
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
