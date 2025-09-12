const mongoose = require("mongoose");

const emailSettingsSchema = new mongoose.Schema({
  emailId: {
    type: String,

  },

  label: {
    type: String,
  },
  emailType: {
    type: String,
  },
  emailStatus: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
 
});

const EmailSettings = mongoose.model("EmailSettings", emailSettingsSchema);

module.exports = EmailSettings;
