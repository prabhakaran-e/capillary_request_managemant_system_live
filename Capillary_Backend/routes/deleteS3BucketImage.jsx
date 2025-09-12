// const express = require("express");
// const multer = require("multer");
// require("dotenv").config();
// const s3Controller = require("../controllers/awsS3Controller");

// const s3Router = express.Router(); // Change from `express()` to `express.Router()`

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// s3Router.post("/upload", upload.array("files"), s3Controller.uploadImageAws);
// s3Router.post("/delete-s3-image", s3Controller.deleteImageFromS3Bucket);

// module.exports = s3Router;
