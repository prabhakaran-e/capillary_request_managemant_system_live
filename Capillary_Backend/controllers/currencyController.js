const Currency = require("../models/currencyModel");

const getallCurrencyData = async (req, res) => {
  try {
    const currencyData = await Currency.find();

    return res.status(200).json({
      success: true,
      message: "All currencies fetched successfully",
      data: currencyData,
    });
  } catch (err) {
    console.error("Error fetching currencies", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching currencies",
    });
  }
};
const addNewCurrency = async (req, res) => {
  try {
    const { currency } = req.body;
    console.log("currency", currency);

    // Handle single object or array
    const currencies = Array.isArray(currency) ? currency : [currency];

    const results = [];

    for (let item of currencies) {
      const updated = await Currency.findOneAndUpdate(
        // ✅ use Currency
        { code: item.code }, // condition: match by code
        { $set: item }, // update fields
        { new: true, upsert: true } // if not found → insert new
      );
      results.push(updated);
    }

    return res.status(200).json({
      message: "Currencies added/updated successfully",
      data: results,
    });
  } catch (err) {
    console.error("Error in adding/updating currency", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateCurrencyStatus = async (req, res) => {
  try {
    const { currencyId } = req.params;
    const { status } = req.body;

    if (typeof status !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Status must be a boolean (true/false)",
      });
    }

    const updatedCurrency = await Currency.findByIdAndUpdate(
      currencyId,
      { enabled: status },
      { new: true }
    );

    if (!updatedCurrency) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Currency status updated successfully",
      data: updatedCurrency,
    });
  } catch (err) {
    console.error("Error updating currency status", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating currency status",
    });
  }
};

const deleteCurrencyData = async (req, res) => {
  try {
    const { currencyId } = req.params;

    const deletedCurrency = await Currency.findByIdAndDelete(currencyId);

    if (!deletedCurrency) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Currency deleted successfully",
      data: deletedCurrency,
    });
  } catch (err) {
    console.error("Error deleting currency", err);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting currency",
    });
  }
};

module.exports = {
  deleteCurrencyData,
  updateCurrencyStatus,
  addNewCurrency,
  getallCurrencyData,
};
