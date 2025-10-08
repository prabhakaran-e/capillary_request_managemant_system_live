const mongoose = require("mongoose");
require("dotenv").config();
const {
  MONGO_USERNAME_SANDBOX,
  MONGO_PASSWORD_SANDBOX,
  MONGO_DATABASE_NAME_SANDBOX,
} = require("./variables");

const dbConnect = () => {
  console.log(
    "Welcome to database",
    MONGO_USERNAME_SANDBOX,
    MONGO_PASSWORD_SANDBOX,
    MONGO_DATABASE_NAME_SANDBOX,
    process.env.MONGO_USERNAME_SANDBOX

  );
  mongoose
    .connect(
      //test
      // `mongodb+srv://${MONGO_USERNAME_TEST}:${MONGO_PASSWORD_TEST}@cluster0.jczad.mongodb.net/${MONGO_DATABASE_NAME_TEST}`,

      //live
      // `mongodb+srv://${MONGO_USERNAME_PO}:${MONGO_PASSWORD_PO}@cluster0.5vetz.mongodb.net/${MONGO_DATABASE_NAME_PO}`,

      //sandbox
      `mongodb+srv://${MONGO_USERNAME_SANDBOX}:${MONGO_PASSWORD_SANDBOX}@cluster0.tz9hmqx.mongodb.net/${MONGO_DATABASE_NAME_SANDBOX}`,
      {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      }
    )
    .then(() => {
      console.log("Connected to the database Atlas");
    })
    .catch((err) => {
      console.error("Error in connecting the database", err);
    });
};

module.exports = dbConnect;
