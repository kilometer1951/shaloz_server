const mongoose = require("mongoose");
const User = mongoose.model("users");
const MainCategory = mongoose.model("mainCategories");
const SubCategoryOne = mongoose.model("subCategoriesOne");
const SubCategoryTwo = mongoose.model("subCategoriesTwo");
const stripe = require("stripe")("sk_test_zIKmTcf9gNJ6fMUcywWPHQSx00a3c6qvsD");
const Admin = mongoose.model("admins");
const jwt = require("jwt-simple");

const password = require("../functions/password");
const httpRespond = require("../functions/httpRespond");


const tokenForUser = (user) => {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user, iat: timestamp },"sdsfsfsf");
  };
  

module.exports = (app) => {
  app.post("/api/create_admin", async (req, res) => {
    try {
      const newData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email.toLowerCase(),
        password: password.encryptPassword(req.body.password),
      };

      const data = await new Admin(newData).save();      
      return httpRespond.severResponse(res, {
        status: true,
        data,
      });
    } catch (e) {
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
  app.post("/api/auth/admin", async (req, res) => {
    //login
    try {
      const admin = await Admin.findOne({ email: req.body.email.toLowerCase() });            
      if (!admin) {
        return httpRespond.severResponse(res, {
          status: false,
          message: "admin not found",
        });
      }

      if (!password.comparePassword(req.body.password, admin.password)) {
        return httpRespond.severResponse(res, {
          status: false,
          message: "admin not found",
        });
      }

      return httpRespond.severResponse(res, {
        status: true,
        message: "admin found",
        admin: admin,
        token: tokenForUser(admin)
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
        message: "api error",
      });
    }
  });
};
