const mongoose = require("mongoose");

const entitySchema = new mongoose.Schema(
  {
    entityName: { type: String },
    category: { type: String },
    addressLine: { type: String },
    currency: { type: String },
    city: { type: String },
    site: { type: String },

    invoiceMailId: { type: String },
    poMailId: { type: String },
    taxId: { type: String },
    type: { type: String },
    latitude: { type: String },

    PoSVOK: { type: String },

    attachments: { type: [String] },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Entity", entitySchema);
