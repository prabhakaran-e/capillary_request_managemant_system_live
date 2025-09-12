const Credentials = require("../models/apiCrediantails");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const generateStrongPassword = () => {
  return crypto.randomBytes(16).toString("hex"); 
};

const getAllApiData = async (req, res) => {
  try {
    const apiData = await Credentials.find();

    const formattedData = apiData.map((item) => ({
      ...item._doc,
      createdAt: new Date(item.createdAt).toLocaleString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      
    }));

    console.log("formattedData",formattedData)

    res.status(200).json({ success: true,  formattedData });
  } catch (err) {
    console.error("Error in getting the API data:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};













const createCredentials = async (req, res) => {
  try {
    console.log("Received Credentials:", req.body);

    const { email } = req.body;

    if (!email || !email.purpose || !email.employeeDetails) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await Credentials.findOne({
      email: email.employeeDetails.company_email_id,
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const secretKey = crypto.randomBytes(32).toString("hex");
    const plainPassword = generateStrongPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newCredentials = new Credentials({
      email: email.employeeDetails.company_email_id,
      purpose: email.purpose,
      employeeDetails: email.employeeDetails,
      secretKey,
      apiKey: hashedPassword,
      employeeId: email.employeeDetails.employeeId,
      full_name: email.employeeDetails.full_name,
      employeeId: email.employeeDetails.employee_id,
    });

    await newCredentials.save();

    res.status(201).json({
      message: "Credentials created successfully",
      secretKey,
      password: plainPassword, 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
 

const updateApiStatus = async (req, res) => {
  try {
    const { apiId } = req.params;
    const { status } = req.body;

    if (!apiId) {
      return res.status(400).json({ success: false, message: "Invalid request parameters" });
    }

    const updatedApi = await Credentials.findByIdAndUpdate(
      apiId,
      { valid: status },
      { new: true }
    );

    if (!updatedApi) {
      return res.status(404).json({ success: false, message: "API data not found" });
    }

    res.status(200).json({
      success: true,
      message: "API status updated successfully",
      updatedApi,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};









module.exports = {
  createCredentials,
  getAllApiData,
  updateApiStatus
};
