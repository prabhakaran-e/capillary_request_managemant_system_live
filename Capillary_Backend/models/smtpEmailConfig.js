const mongoose = require("mongoose");

const smtpConfigSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    port: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: { type: Boolean, default: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

const SmtpConfig = mongoose.model("SmtpConfig", smtpConfigSchema);

module.exports = SmtpConfig;
