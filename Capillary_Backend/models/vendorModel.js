const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorId: { type: String, required: true },
    vendorName: { type: String, required: true },

    primarySubsidiary: { type: String },
    category: { type: String },
    entity: { type: String },

    taxNumber: { type: String },
    gstin: { type: String },
    msme: { type: String }, // ✅ Added

    billingAddress: { type: String },
    shippingAddress: { type: String },

    phone: { type: String },
    email: { type: String, lowercase: true },

    bankAccountNumber: { type: String },
    ifscSwiftCode: { type: String },
    bankName: { type: String },

    hasAgreement: { type: String },      // yes/no
    agreementFileUrl: { type: String },
    agreementFileName: { type: String }, // ✅ Added

    questionnaireAnswer: { type: String },
    natureOfService: { type: String },

    // ✅ File Upload URLs & Names
    panTaxFileUrl: { type: String },
    panTaxFileName: { type: String },

    gstFileUrl: { type: String },
    gstFileName: { type: String },

    msmeFileUrl: { type: String },
    msmeFileName: { type: String },

    bankProofFileUrl: { type: String },
    bankProofFileName: { type: String },

    empId: { type: String },
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
