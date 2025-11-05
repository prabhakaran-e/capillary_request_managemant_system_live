const mongoose = require("mongoose");

const vendorPolicyFileSchema = new mongoose.Schema(
    {
        policyFile: { type: String }

    },
    { timestamps: true }
);

const vendorPolicyFile = mongoose.model("vendorPolicyFile", vendorPolicyFileSchema);

module.exports = vendorPolicyFile;
