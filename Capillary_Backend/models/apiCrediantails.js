const mongoose = require("mongoose");

const apiCredentialsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    employeeId: {
      type: String,
    },
    purpose: {
      type: String,
    },
    full_name: {
      type: String,
    },
    company_email_id: {
      type: String,
    },
    secretKey: {
      type: String,
    },
    apiKey: {
      type: String,
    },
    valid: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Credentials = mongoose.model("apiCredentials", apiCredentialsSchema);

module.exports = Credentials;
