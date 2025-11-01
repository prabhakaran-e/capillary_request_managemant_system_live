const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true },
    vendorName: { type: String, required: true },

    primarySubsidiary: { type: String },
    category: { type: String },                   // Added
    entity: { type: String },                     // Added

    taxNumber: { type: String },
    gstin: { type: String },

    billingAddress: { type: String },
    shippingAddress: { type: String },

    phone: { type: String },
    email: { type: String, lowercase: true },

    bankAccountNumber: { type: String },          // Added
    ifscSwiftCode: { type: String },              // Added
    bankName: { type: String },                   // Added

    hasAgreement: { type: String },               // yes/no
    agreementFileUrl: { type: String },

    questionnaireAnswer: { type: String },        // Added
    natureOfService: { type: String },            // Added

    empId: { type: String },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
