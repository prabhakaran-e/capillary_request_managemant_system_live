const express = require("express");
const restApiRoute = express.Router();
const restApiController = require("../../controllers/getAllreqController/getAllReqController")


restApiRoute.post("/get-all-request",restApiController.getAllRequestData)
restApiRoute.post("/get-all-request-by-status",restApiController.getAllRequestDataByStatus)
restApiRoute.post("/get-request-by-id",restApiController.getAllRequestDataById)
restApiRoute.post("/get-request-by-emloyeeid",restApiController.getAllRequestOfEmployee)











module.exports = restApiRoute