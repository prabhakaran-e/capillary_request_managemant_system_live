const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
    },
    full_name: {
      type: String,
    },
    company_email_id: {
      type: String,
    },
    role: {
      type: String,
    },
    department: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("panelMember", employeeSchema);

module.exports = Employee;
