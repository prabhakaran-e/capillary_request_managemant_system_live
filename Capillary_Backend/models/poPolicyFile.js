const mongoose = require("mongoose");

const poPolicyFileSchema = new mongoose.Schema(
    {
        policyFile: { type: String }

    },
    { timestamps: true }
);

const poPolicyFile = mongoose.model("poPolicyFile", poPolicyFileSchema);

module.exports = poPolicyFile;
