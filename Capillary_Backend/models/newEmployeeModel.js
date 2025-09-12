const mongoose = require('mongoose');

// Define the schema for the employee data with only String types
const employeeSchema = new mongoose.Schema(
  {
    empid: String,
    name: String,
    contact: String,
    email: String,
    gender: String,
    dob: String,
    joinDate: String,
    role: String,
    reportingTo: String,
    entity: String,
    location: String,
    workType: String,
    startTime: String,
    endTime: String,
    pincode: String,
    city: String,
    state: String,
    addressLine: String,
    landMark: String,
    area: String,
  },
  {
    timestamps: true,
  }
);

const newEmployeeModel = mongoose.model('Employee', employeeSchema);

module.exports = newEmployeeModel;
