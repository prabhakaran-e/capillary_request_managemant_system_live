const AWS = require("aws-sdk");
require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region:process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const uploadImageAws = async (req, res) => {
  try {
    const files = req.files;
    const folder = req.body.folder || "uploads";

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files provided for upload" });
    }

    const uploadPromises = files.map((file) => {
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${folder}/${Date.now()}_${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      return s3.upload(s3Params).promise();
    });

    const results = await Promise.all(uploadPromises);
    const fileUrls = results.map((result) => result.Location);

    res.status(200).json({
      message: "Files uploaded successfully",
      fileUrls,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Failed to upload files" });
  }
};

const deleteImageFromS3Bucket = async (req, res) => {
  try {
    console.log("Received delete request:", req.body);
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "Image URL is required" });
    }


    let key;
    try {
   
      const urlParts = url.split('.com/');
      if (urlParts.length < 2) {
        throw new Error('Invalid URL format');
      }
      key = urlParts[1]; 
      console.log("Full path to delete:", key);
    } catch (error) {
      console.error("Error extracting key:", error);
      return res.status(400).json({ message: "Invalid URL format" });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key
    };

    console.log("Delete parameters:", params);


    await s3.deleteObject(params).promise();
    console.log("File deleted successfully");

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error in deleteImageFromS3Bucket:", error);
    return res.status(500).json({
      message: "Error deleting image from S3",
      error: error.message
    });
  }
};

module.exports = {
  uploadImageAws,
  deleteImageFromS3Bucket,
};
