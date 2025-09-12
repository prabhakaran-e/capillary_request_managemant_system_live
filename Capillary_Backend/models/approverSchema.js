const mongoose = require("mongoose");

const ApproverSchema = new mongoose.Schema({
  businessUnit: {
    type: String,
    required: true,
  },
  departments: [
    {
      name: String, // Department name
      approvers: [
        {
          approverId: String,
          approverName: String,
          approverEmail: String,

        },
      ],
    },
  ],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

const Approver = mongoose.model("Approver", ApproverSchema);

module.exports = Approver;
