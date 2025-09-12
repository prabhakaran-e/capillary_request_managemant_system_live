const express = require("express");
const ssoRoute = express.Router();
const newKeyController = require("../../controllers/newKeyController");

ssoRoute.post("/save-new-sso-key", newKeyController.saveNewSSoKey);
ssoRoute.get("/get-saved-sso-key", newKeyController.getSavedSSoKey);
ssoRoute.delete("/delete-saved-sso-key", newKeyController.deleteSavedSSoKey);



module.exports = ssoRoute;
