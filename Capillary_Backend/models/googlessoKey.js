const mongoose = require('mongoose');

const googleSSOKey = new mongoose.Schema({
  googleSSOKey: { type: String },
});

const googleSSOKeys = mongoose.model('googleSSOKey', googleSSOKey);

module.exports = googleSSOKeys;
