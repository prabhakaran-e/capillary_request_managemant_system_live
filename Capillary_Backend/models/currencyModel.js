const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
    },
    locale: {
      type: String,
      required: true,
      trim: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ Export the model, NOT the schema
const Currency = mongoose.model("Currency", currencySchema);
module.exports = Currency;
