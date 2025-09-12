const express = require("express");
const poRouter = express();
const poController = require("../controllers/poController");

poRouter.post("/add-new-po-data/:empId", poController.savePoData);
poRouter.get("/get-po-data", poController.getPoData);
poRouter.delete("/delete-po-data/:id/:empId", poController.deletePoData);
poRouter.put("/update-po-data/:id/:empId", poController.updatePoData);




module.exports = poRouter;
