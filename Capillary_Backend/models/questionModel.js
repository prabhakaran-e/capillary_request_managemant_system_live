const mongoose = require("mongoose");

const questionsSchema = new mongoose.Schema(
  {
  
    question: { type: String },
    status: { type: Boolean, default: false },
    description: { type: String },
    expectedAnswer: { type: Boolean },
    createdBy: {
      empName: { type: String },
      department: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionsSchema);
