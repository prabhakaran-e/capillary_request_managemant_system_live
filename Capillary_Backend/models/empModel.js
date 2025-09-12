const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employee_id: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    company_email_id: { type: String, required: true },
    direct_manager: { type: String },
    direct_manager_email: { type: String },
    hod: { type: String },
    hod_email_id: { type: String },
    department: { type: String },
    business_unit: { type: String },
    role:{type:String},
    sync:{type:Boolean,default:false}
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
