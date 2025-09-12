const mongoose = require("mongoose");

const monthlyDataSchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    fyStart: { type: String, required: true },
    fyEnd: { type: String, required: true },
    poNumber: { type: String, required: true, unique: true },
    vendorName: { type: String, required: true },
    poDescription: { type: String },
    computation: { type: String },
    poValue: { type: Number, default: 0 },
    poStartDate: { type: Date },
    poEndDate: { type: Date },

    monthlyData: {
      type: Map,
      of: monthlyDataSchema,
      default: {},
    },

    createdBy: { type: String },
  },
  { timestamps: true }
);

const PurchaseOrder = mongoose.model("PurchaseOrder", purchaseOrderSchema);

module.exports = PurchaseOrder;
