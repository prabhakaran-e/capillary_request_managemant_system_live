const mongoose = require('mongoose');

const domainsSchema = new mongoose.Schema(
  {
    sno: { type: Number }, 
    domain: { type: String,  }, 
    entity: { type: String, },
    status: { type: String, default: 'Active' }, 
    date: { type: Date }, 
    time: { type: String }, 
  },
  { timestamps: true } 
);

module.exports = mongoose.model('Domain', domainsSchema);
