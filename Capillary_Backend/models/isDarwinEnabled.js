const mongoose = require('mongoose');

const darwinEnabled = new mongoose.Schema({
  isDarwinEnabled: { type: Boolean, default: false },
});

const darwinBox = mongoose.model('isDarwin', darwinEnabled);

module.exports = darwinBox;
