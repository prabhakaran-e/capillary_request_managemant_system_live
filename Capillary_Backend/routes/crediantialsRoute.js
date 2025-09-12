const express = require("express");
const crediantialRoute = express.Router();
const crediantialController = require("../controllers/crediantialController")


crediantialRoute.get("/get-all-api-data",crediantialController.getAllApiData)

crediantialRoute.post("/api-crediantials",crediantialController.createCredentials)

crediantialRoute.put("/update-api-status/:apiId",crediantialController.updateApiStatus)




module.exports = crediantialRoute