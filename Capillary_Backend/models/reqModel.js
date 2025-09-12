const mongoose = require('mongoose');

const reqSchema = new mongoose.Schema({
  ChooseExpectedDelivery: {
    type: String
  },
  advancePayment: {
    type: String
  },
  billTo: {
    type: String
  },
  city: {
    type: String
  },
  comparativeStatement: {
    type: String,
    default: ""
  },
  currency: {
    type: String,
    default: ""
  },
  entity: {
    type: String
  },
  insuranceCopy: {
    type: String,
    default: ""
  },
  poEntityType: {
    type: String
  },
  quotationDate: {
    type: String
  },
  quotationNumber: {
    type: String
  },
  shipTo: {
    type: String
  },
  site: {
    type: String,
    default: ""
  },
  vendor: {
    type: String
  }
}, { timestamps: true }); 

const reqModel = mongoose.model('Order', reqSchema);

module.exports = reqModel;
