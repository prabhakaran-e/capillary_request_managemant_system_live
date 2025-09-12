const smtpModel = require("../models/smtpEmailConfig");
const empModel = require("../models/empModel");
const panelMembers = require("../models/addPanelUsers");

const getSmtpConfig = async (req, res) => {
  try {
    const activeConfig = await smtpModel.findOne({ status: true });

    if (!activeConfig) {
      return res.status(404).json({ message: "No active SMTP config found" });
    }

    res.status(200).json({
      message: "Active SMTP config retrieved successfully",
      data: activeConfig,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const addNewSmtpConfig = async (req, res) => {
  try {
    const { empId } = req.params;
    const { smtpConfig } = req.body;

    const empData =
      (await empModel.findOne(
        { employee_id: empId },
        { full_name: 1, department: 1 }
      )) ||
      (await panelMembers.findOne(
        { employee_id: empId },
        { full_name: 1, department: 1 }
      ));

    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const activeConfig = await smtpModel.findOne({ status: true });
    if (activeConfig) {
      return res.status(400).json({
        message:
          "An active SMTP config already exists. Please deactivate it before adding a new one.",
      });
    }

    const remark = `${empData.full_name} (${empId}) from ${empData.department} department created the new Google SSO key`;

    const newConfig = new smtpModel({
      email: smtpConfig.email,
      port: smtpConfig.port,
      password: smtpConfig.password,
      remarks: remark,
    });

    await newConfig.save();

    res.status(201).json({
      message: "SMTP Config saved successfully",
      data: newConfig,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteSmtpConfig = async (req, res) => {
  try {
    const { empId, configId } = req.params;

    const empData =
      (await empModel.findOne(
        { employee_id: empId },
        { full_name: 1, department: 1 }
      )) ||
      (await panelMembers.findOne(
        { employee_id: empId },
        { full_name: 1, department: 1 }
      ));

    if (!empData) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const config = await smtpModel.findById(configId);
    if (!config) {
      return res.status(404).json({ message: "SMTP config not found" });
    }

    const remark = `${empData.full_name} (${empId}) from ${empData.department} department deleted the SMTP config with email ${config.email}`;

    await smtpModel.findByIdAndDelete(configId);

    res.status(200).json({
      message: "SMTP config deleted successfully",
      remark: remark,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addNewSmtpConfig,
  getSmtpConfig,
  deleteSmtpConfig,
};
