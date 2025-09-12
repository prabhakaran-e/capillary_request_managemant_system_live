const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    vendorId: { type: String },
    vendorName: { type: String },

    primarySubsidiary: { type: String },
    taxNumber: { type: String },
    gstin: { type: String },
    billingAddress: { type: String },
    shippingAddress: { type: String },
    phone: { type: String },
    status:{type:String},
    email:{type:String},
    empId:{type:String}
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
