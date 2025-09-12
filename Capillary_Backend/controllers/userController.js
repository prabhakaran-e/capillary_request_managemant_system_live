
const Employee = require("../models/empModel");
const User = require("../models/userModel");
const { OAuth2Client } = require("google-auth-library");
const googleClientData = require("../models/googlessoKey")

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



exports.verifyToken = async (req, res) => {
  const { token } = req.body;



  try {
    const googleClientId = await googleClientData.find()
    console.log("googleClientId",googleClientId)
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture,  } = payload;



    const employeeData = await Employee.findOne(
      { email: email },
      { _id: 1, role: 1, name: 1 }
    );

    console.log("Employee data", employeeData);
    const user = {
      userId: employeeData._id,
      email,
      name,
      picture,
      role: employeeData.role,
    };
    console.log("Usre",employeeData._id,employeeData.role)

    res.status(200).json({ success: true, user ,employeeData});
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

exports.createUser = async (req, res) => {
  try {
    console.log("login", req.body);
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.log("err", error);
    res.status(400).json({ message: error.message });
  }
};

// Read all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read a single user
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, 
      runValidators: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateManyUsers = async (req, res) => {
  try {
 
    const { filter, update } = req.body;

 
    const result = await User.updateMany(filter, update);


    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No users matched the filter criteria" });
    }

    res.status(200).json({ message: "Users updated successfully", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
