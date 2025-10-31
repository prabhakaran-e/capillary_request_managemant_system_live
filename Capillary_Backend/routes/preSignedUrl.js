const express = require("express");
const multer = require("multer");
require("dotenv").config();
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Router = express();

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize S3 client (v3)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload files route
s3Router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    console.log(
      "process.env.AWS_ACCESS_KEY_ID: ",
      process.env.AWS_ACCESS_KEY_ID
    );
    console.log(
      "process.env.AWS_SECRET_ACCESS_KEY: ",
      process.env.AWS_SECRET_ACCESS_KEY
    );
    console.log("process.env.S3_BUCKET_NAME: ", process.env.S3_BUCKET_NAME);
    const files = req.files;
    const { fileType } = req.body;
    const date = new Date();
    let newReqId;
    const { reqId } = req.query;

    console.log("Received ReqId:", reqId);

    if (!reqId || reqId === "undefined") {
      const reqid = `INBH${String(date.getDate()).padStart(2, "0")}${String(
        date.getMonth() + 1
      ).padStart(2, "0")}${String(date.getFullYear()).slice(-2)}${
        Math.floor(Math.random() * 100) + 1
      }`;
      newReqId = reqid;
      console.log("Using ReqId 1:", newReqId);
    } else {
      newReqId = reqId;
      console.log("Using ReqId 2:", newReqId);
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files provided for upload" });
    }

    const folder = `PO-Uploads/${newReqId}/${fileType}`;
    console.log("Folder Path:", folder);

    const uploadPromises = files.map(async (file) => {
      const uniqueFileName = `${Date.now()}_${file.originalname}`;
      const key = `${folder}/${uniqueFileName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      const signedUrl = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
        }),
        { expiresIn: 60 * 60 * 24 * 7 } // 7 days
      );

      return signedUrl;
    });

    const fileUrls = await Promise.all(uploadPromises);

    res.status(200).json({
      message: "Files uploaded successfully",
      fileUrls,
      newReqId,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
});

// Helper: extract key and refresh presigned URL
function extractObjectKey(presignedUrl) {
  const url = new URL(presignedUrl);
  return decodeURIComponent(url.pathname.substring(1));
}

s3Router.post("/refresh-presigned-url", async (req, res) => {
  try {
    const { presignedUrl } = req.body;
    console.log("welcome to presigned url", presignedUrl);

    if (!presignedUrl) {
      return res.status(400).json({ error: "No pre-signed URL provided" });
    }

    const objectKey = extractObjectKey(presignedUrl);
    const bucketName = process.env.S3_BUCKET_NAME;

    const newPresignedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
      { expiresIn: 60 * 60 * 24 * 7 }
    );

    console.log("newPresignedUrl", newPresignedUrl);

    res.status(200).json({
      message: "New pre-signed URL generated successfully",
      presignedUrl: newPresignedUrl,
    });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    res.status(500).json({ error: "Failed to generate pre-signed URL" });
  }
});

module.exports = s3Router;

// const AWS = require("aws-sdk");
// const express = require("express");
// const multer = require("multer");
// require("dotenv").config();
// const s3Controller = require("../controllers/awsS3Controller");

// const s3Router = express();

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// const s3 = new AWS.S3();

// s3Router.post("/upload", upload.array("files"), async (req, res) => {
//   try {
//     const files = req.files;
//     const { fileType } = req.body;
//     const date = new Date();
//     let newReqId;
//     const { reqId } = req.query;

//     console.log("Received ReqId:", reqId);

//     // Generate new reqId if not provided
//     if (!reqId || reqId === "undefined") {
//       const reqid = `INBH${String(date.getDate()).padStart(2, "0")}${String(
//         date.getMonth() + 1
//       ).padStart(2, "0")}${String(date.getFullYear()).slice(-2)}${
//         Math.floor(Math.random() * 100) + 1
//       }`;
//       newReqId = reqid;
//       console.log("Using ReqId 1:", newReqId);
//     } else {
//       console.log("Using ReqId: 2", newReqId);
//       newReqId = reqId;
//     }

//     // Ensure files are provided
//     if (!files || files.length === 0) {
//       return res.status(400).json({ error: "No files provided for upload" });
//     }

//     // Define the folder path in S3
//     const folder = `PO-Uploads/${newReqId}/${fileType}`;
//     console.log("Folder Path:", folder);

//     // Upload files to S3
//     const uploadPromises = files.map((file) => {
//       // Ensure each file name is unique (use timestamp for uniqueness)
//       const uniqueFileName = `${Date.now()}_${file.originalname}`;

//       const s3Params = {
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: `${folder}/${uniqueFileName}`,
//         Body: file.buffer,
//         ContentType: file.mimetype,
//       };

//       return s3.upload(s3Params).promise();
//     });

//     const results = await Promise.all(uploadPromises);

//     // Generate pre-signed URLs for each file uploaded
//     const fileUrls = results.map((result) => {
//       const params = {
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: result.Key,
//         Expires: 60 * 60 * 24 * 7,
//       };

//       // Generate pre-signed URL for the uploaded file
//       const signedUrl = s3.getSignedUrl("getObject", params);
//       return signedUrl;
//     });

//     // Respond with success and file URLs
//     res.status(200).json({
//       message: "Files uploaded successfully",
//       fileUrls,
//       newReqId, // Return the reqId used for this upload
//     });
//   } catch (error) {
//     console.error("Error uploading files:", error);
//     res.status(500).json({ error: "Failed to upload files" });
//   }
// });

// function extractObjectKey(presignedUrl) {
//   const url = new URL(presignedUrl);
//   return decodeURIComponent(url.pathname.substring(1));
// }

// function generatePresignedUrl(bucket, key, expiresInSeconds = 604800) {
//   const params = {
//     Bucket: bucket,
//     Key: key,
//     Expires: expiresInSeconds,
//   };
//   return s3.getSignedUrl("getObject", params);
// }

// s3Router.post("/refresh-presigned-url",
//   async (req, res) => {
//     try {
//       const { presignedUrl } = req.body;
//       console.log("welcome to oreseigned url",presignedUrl)

//       if (!presignedUrl) {
//         return res.status(400).json({ error: "No pre-signed URL provided" });
//       }

//       const objectKey = extractObjectKey(presignedUrl);

//       const bucketName = process.env.S3_BUCKET_NAME;

//       const newPresignedUrl = generatePresignedUrl(bucketName, objectKey);
//       console.log("newPresignedUrl",newPresignedUrl)

//       res.status(200).json({
//         message: "New pre-signed URL generated successfully",
//         presignedUrl: newPresignedUrl,
//       });
//     } catch (error) {
//       console.error("Error generating pre-signed URL:", error);
//       res.status(500).json({ error: "Failed to generate pre-signed URL" });
//     }
//   });

// module.exports = s3Router;
