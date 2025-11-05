const Vendor = require("../models/vendorModel");
const generateVendorId = require("../utils/generateVendorId");
const vendorPolicyFile = require("../models/vendorPolicyFile");
const poPolicyFile = require("../models/poPolicyFile");

// Create a new vendor
exports.createVendor = async (req, res) => {
  try {
    console.log("Create Vendor Request:", req.body);
    const vendor = new Vendor(req.body);
    await vendor.save();
    res.status(201).json({ message: "Vendor created successfully", vendor });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.createNewVendor = async (req, res) => {
  try {
    const { empId } = req.params;
    console.log("Received Vendor Data:", req.body);

    const vendorDataArray = req.body.data.map(async (vendor) => {
      const vendorId = vendor.ID;

      const vendorPayload = {
        vendorName: vendor.Name,
        primarySubsidiary: vendor["Primary Subsidiary"],
        category: vendor.Category,                      // Added
        entity: vendor.Entity,                          // Added
        taxNumber: vendor["Tax Number"],
        gstin: vendor.GSTIN,
        billingAddress: vendor["Billing Address"],
        shippingAddress: vendor["Shipping Address"],
        phone: vendor.Phone,
        email: vendor.Email || "",
        status: vendor.Status || "Active",

        bankAccountNumber: vendor["Bank Account Number"],   // Added
        ifscSwiftCode: vendor["IFSC/SWIFT Code"],           // Added
        bankName: vendor["Bank Name"],                      // Added

        hasAgreement: vendor["Has Agreement"],              // Added
        agreementFile: vendor["Agreement File"] || null,    // Added
        questionnaireAnswer: vendor["Questionnaire Answer"],// Added
        natureOfService: vendor["Nature of Service"],       // Added

        empId
      };

      const existingVendor = await Vendor.findOne({ vendorId });

      if (existingVendor) {
        return await Vendor.findOneAndUpdate(
          { vendorId },
          vendorPayload,
          { new: true, runValidators: true }
        );
      } else {
        return await Vendor.create({ vendorId, ...vendorPayload });
      }
    });

    const insertedOrUpdatedVendors = await Promise.all(vendorDataArray);

    res.status(201).json({
      success: true,
      message: "Vendors processed successfully",
      data: insertedOrUpdatedVendors,
    });
  } catch (error) {
    console.error("Error processing vendors:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// Read all vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVendorAddedByMe = async (req, res) => {
  try {
    const { empId } = req.params;
    const vendors = await Vendor.find({ empId: empId });
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Read a single vendor by ID
exports.getVendorById = async (req, res) => {
  try {
    console.log("Welcome to vendor data");
    console.log(req.params.id);
    const vendor = await Vendor.findOne({ _id: req.params.id });
    console.log(vendor);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a vendor by ID
exports.updateVendor = async (req, res) => {
  try {
    console.log("Welcome to update the vendor data", req.body);
    console.log("Updating vendor with ID:", req.params.id);

    const data = {
      vendorId: req.body.vendorId,
      vendorName: req.body.vendorName,
      primarySubsidiary: req.body.primarySubsidiary,
      taxNumber: req.body.taxNumber,
      gstin: req.body.gstin,
      billingAddress: req.body.billingAddress,
      shippingAddress: req.body.shippingAddress,
      phone: req.body.phone,
      email: req.body.email,
    };

    console.log("Update data:", data);

    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id },
      { $set: data },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Vendor updated successfully", vendor });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a vendor by ID
exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findOneAndDelete({ _id: req.params.id });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateManyVendors = async (req, res) => {
  try {
    const { filter, update } = req.body;

    const result = await Vendor.updateMany(filter, update);

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No vendors matched the filter criteria" });
    }

    res.status(200).json({ message: "Vendors updated successfully", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNewVendorId = async (req, res) => {
  try {
    let vendorId;
    let isUnique = false;

    while (!isUnique) {
      vendorId = await generateVendorId();
      console.log(`Generated ID: ${vendorId}`);

      const existVendor = await Vendor.findOne({ vendorId });
      if (!existVendor) {
        isUnique = true;
      } else {
        console.log(`ID ${vendorId} already exists. Generating a new one.`);
      }
    }

    console.log(`Unique Employee ID generated: ${vendorId}`);
    res.status(200).json({ vendorId });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.saveVendorPolicyFile = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ message: "fileUrl is required" });
    }

    // Check if a policy file already exists
    const existingPolicy = await vendorPolicyFile.findOne();

    if (existingPolicy) {
      existingPolicy.policyFile = fileUrl;
      await existingPolicy.save();
      return res.status(200).json({ message: "Vendor policy file updated successfully" });
    }

    // Create new file entry
    const newPolicy = new vendorPolicyFile({ policyFile: fileUrl });
    await newPolicy.save();

    return res.status(200).json({ message: "Vendor policy file saved successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.getVendorPolicyFile = async (req, res) => {
  try {
    const vendorPolicy = await vendorPolicyFile.findOne();
    if (!vendorPolicy) {
      return res.status(404).json({ message: "Vendor policy file not found" });
    }
    res.status(200).json(vendorPolicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVendorPolicyFile = async (req, res) => {
  try {
    const vendorPolicy = await vendorPolicyFile.findOneAndDelete();
    if (!vendorPolicy) {
      return res.status(404).json({ message: "Vendor policy file not found" });
    }
    res.status(200).json({ message: "Vendor policy file deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.savePoPolicyFile = async (req, res) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ message: "fileUrl is required" });
    }

    // Check if a policy file already exists
    const existingPolicy = await poPolicyFile.findOne();

    if (existingPolicy) {
      existingPolicy.policyFile = fileUrl;
      await existingPolicy.save();
      return res.status(200).json({ message: "Vendor policy file updated successfully" });
    }

    // Create new file entry
    const newPolicy = new poPolicyFile({ policyFile: fileUrl });
    await newPolicy.save();

    return res.status(200).json({ message: "Vendor policy file saved successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPoPolicyFile = async (req, res) => {
  try {
    const vendorPolicy = await poPolicyFile.findOne();
    if (!vendorPolicy) {
      return res.status(404).json({ message: "Vendor policy file not found" });
    }
    res.status(200).json(vendorPolicy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePoPolicyFile = async (req, res) => {
  try {
    const vendorPolicy = await poPolicyFile.findOneAndDelete();
    if (!vendorPolicy) {
      return res.status(404).json({ message: "Vendor policy file not found" });
    }
    res.status(200).json({ message: "Vendor policy file deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
