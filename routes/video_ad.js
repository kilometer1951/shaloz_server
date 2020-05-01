const mongoose = require("mongoose");
const User = mongoose.model("users");
var ObjectId = require("mongodb").ObjectID;
var VideoAd = mongoose.model("videoAds");
const Moment = require("moment");
//const dropboxV2Api = require('dropbox-v2-api');
const fs = require("fs");
const MainCategory = mongoose.model("mainCategories");

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
  app.get("/api/view/fetch_video_ad/:user_id/", async (req, res) => {
    try {
      const data = await VideoAd.aggregate([
        {
          $match: {
            seller: { $ne: ObjectId(req.params.user_id) },
            active: true,
          },
        }, // filter the results
        { $limit: 10 },
        { $sample: { size: 10 } },
      ]);
      const mainCategory = await MainCategory.find({});

      return httpRespond.severResponse(res, {
        status: true,
        data,
        mainCategory,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });

  app.get(
    "/api/view/fetch_video_ad_per_cat/:user_id/:main_cat",
    async (req, res) => {
      try {
        const data = await VideoAd.aggregate([
          {
            $match: {
              seller: { $ne: ObjectId(req.params.user_id) },
              video_ad_category: req.params.main_cat,
              active: true,
            },
          }, // filter the results
          { $limit: 10 },
          { $sample: { size: 10 } },
        ]);
        const mainCategory = await MainCategory.find({});
        //console.log(data);

        return httpRespond.severResponse(res, {
          status: true,
          data,
          mainCategory,
        });
      } catch (e) {
        console.log(e);
        return httpRespond.severResponse(res, {
          status: false,
        });
      }
    }
  );

  app.post(
    "/api/upload_video_ad/:user_id/:video_ad_category",
    upload.single("photo"),
    async (req, res) => {
      try {
        let uri;
        const view_data = await VideoAd.findOne({ seller: req.params.user_id });
        // console.log(view_data);

        if (!view_data) {
          //add
          const cloud_id = await cloudinary.v2.uploader.upload(req.file.path, {
            resource_type: "video",
          });
          uri = cloud_id.url;
          const newData = {
            seller: req.params.user_id,
            video: cloud_id.url,
            cloudinary_id: cloud_id.public_id,
            video_ad_category: req.params.video_ad_category,
          };
          await new VideoAd(newData).save();
        } else {
          //            //update
          await cloudinary.v2.uploader.destroy(view_data.cloudinary_id, {
            resource_type: "video",
          });
          // //upload new photo
          const cloud_id = await cloudinary.v2.uploader.upload(req.file.path, {
            resource_type: "video",
          });
          uri = cloud_id.url;
          view_data.video = cloud_id.url;
          view_data.cloudinary_id = cloud_id.public_id;
          view_data.video_ad_category = req.params.video_ad_category;
          view_data.save();
        }

        return httpRespond.severResponse(res, {
          status: true,
          message: "upload complete",
          uri,
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

  app.get("/api/view/fetch_user_video_ad/:user_id", async (req, res) => {
    try {
      const data = await VideoAd.findOne({ seller: req.params.user_id });
      const mainCategory = await MainCategory.find({});

      return httpRespond.severResponse(res, {
        status: true,
        data,
        mainCategory,
      });
    } catch (e) {
      console.log(e);
      return httpRespond.severResponse(res, {
        status: false,
      });
    }
  });
};
