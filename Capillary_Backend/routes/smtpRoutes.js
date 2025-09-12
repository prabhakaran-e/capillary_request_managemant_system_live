const express = require('express');
const smtpRouter = express()
const smtpController = require("../controllers/smtpController")


smtpRouter.get("/get-new-smtp-data",smtpController.getSmtpConfig)

smtpRouter.post("/add-new-smtp-data/:empId",smtpController.addNewSmtpConfig)

smtpRouter.delete("/delete-smtp-data/:configId/:empId",smtpController.deleteSmtpConfig)


module.exports = smtpRouter