const express = require("express");
const currencyRouter = express.Router();
const currencyController = require("../controllers/currencyController");

currencyRouter.post("/add-new-currency", currencyController.addNewCurrency);
currencyRouter.get("/get-currency-data", currencyController.getallCurrencyData);
currencyRouter.put("/update-currency-status/:currencyId", currencyController.updateCurrencyStatus);
currencyRouter.delete("/delete-currency-data/:currencyId", currencyController.deleteCurrencyData);




module.exports = currencyRouter;
