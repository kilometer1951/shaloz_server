const mongoose = require("mongoose");
const User = mongoose.model("users");
var ObjectId = require("mongodb").ObjectID;
var VideoAd = mongoose.model("videoAds");
const Moment = require("moment");
//const dropboxV2Api = require('dropbox-v2-api');
const fs = require("fs");
const MainCategory = mongoose.model("mainCategories");

const httpRespond = require("../functions/httpRespond");
//const cloudinary = require("cloudinary");

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

const bucketName = "the-shop-123";
const path = require("path");
const serviceKey = path.join(__dirname, "../keys.json");
const { Storage } = require("@google-cloud/storage");
const storage_google = new Storage({
  keyFilename: serviceKey,
  projectId: "theshop-275817",
});

// cloudinary.config({
//   cloud_name: "ibc",
//   api_key: "887482388487867",
//   api_secret: "IDtj1fdfnQNJV-BTQ0mgfGOIIgU",
// });

// const Cloud = require('@google-cloud/storage')

// const { Storage } = Cloud
// const storage_google = new Storage({
//   keyFilename: serviceKey,
//   projectId: 'theshop-275817',
// })

//await storage_google.bucket(bucketName).file("1588366258886IMG_0003.JPG").delete();
// let uri = `https://storage.cloud.google.com/${bucketName}/${data[0].metadata.name}`
// let id = data[0].metadata.name
module.exports = (app) => {
  //   app.post("/api/test", upload.single("photo"), async (req, res) => {
  //     try {
  //       const data = await storage_google
  //         .bucket(bucketName)
  //         .upload(req.file.path, {
  //           gzip: true,

  //           metadata: {
  //             cacheControl: "public, max-age=31536000",
  //           },
  //         });
  // console.log(data);

  //       return httpRespond.severResponse(res, {
  //         status: true,
  //       });
  //     } catch (e) {
  //       console.log(e);

  //       return httpRespond.severResponse(res, {
  //         status: false,
  //       });
  //     }
  //   });

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
          const response = await storage_google
            .bucket(bucketName)
            .upload(req.file.path, {
              gzip: true,

              metadata: {
                cacheControl: "public, max-age=31536000",
              },
            });
          uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;

          const newData = {
            seller: req.params.user_id,
            video: uri,
            cloud_id: response[0].metadata.name,
            video_ad_category: req.params.video_ad_category,
          };
          await new VideoAd(newData).save();
        } else {
          //            //update
          await storage_google
            .bucket(bucketName)
            .file(view_data.cloud_id)
            .delete();
          // //upload new photo
          const response = await storage_google
            .bucket(bucketName)
            .upload(req.file.path, {
              gzip: true,

              metadata: {
                cacheControl: "public, max-age=31536000",
              },
            });
          uri = `https://storage.googleapis.com/${bucketName}/${response[0].metadata.name}`;

          view_data.video = uri;
          view_data.cloud_id = response[0].metadata.name;
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
