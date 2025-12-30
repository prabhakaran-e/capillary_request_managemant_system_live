const Vendor = require("../models/vendorModel");
const generateVendorId = require("../utils/generateVendorId");
const vendorPolicyFile = require("../models/vendorPolicyFile");
const poPolicyFile = require("../models/poPolicyFile");
const Employee = require("../models/empModel");
const AWS = require("aws-sdk");
require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
});

const s3 = new AWS.S3();



function getFreshSignedUrl(expiredUrl) {
  if (!expiredUrl) return expiredUrl;
  try {
    const urlObj = new URL(expiredUrl);
    // Remove leading slash from pathname
    let pathName = decodeURIComponent(urlObj.pathname);
    if (pathName.startsWith("/")) {
      pathName = pathName.substring(1);
    }

    // Attempt to extract key.
    // Logic: If "PO-Uploads" is in the path, start key from there.
    // Otherwise, ensure we don't accidentally include the bucket name if it's in the path (Path-Style).

    let key = pathName;
    const prefixIndex = pathName.indexOf("PO-Uploads");

    if (prefixIndex !== -1) {
      key = pathName.substring(prefixIndex);
    }

    // Check if Bucket is available
    if (!process.env.S3_BUCKET_NAME) {
      console.error("S3_BUCKET_NAME is not defined in environment variables");
      return expiredUrl;
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Expires: 60 * 60 * 24 * 7, // 7 days
    };

    console.log("Refreshing URL for Key:", key);
    const newUrl = s3.getSignedUrl("getObject", params);
    return newUrl;
  } catch (e) {
    console.error("Error refreshing URL:", e);
    return expiredUrl;
  }
}

// Create a new vendor
// exports.createVendor = async (req, res) => {
//   try {
//     console.log("Create Vendor Request:", req.body);

//     // Handle questionnaireAnswer safely
//     if (req.body.questionnaireAnswer) {
//       let questionnaireData = {};

//       // If it's a string, try parsing JSON
//       if (typeof req.body.questionnaireAnswer === "string") {
//         try {
//           questionnaireData = JSON.parse(req.body.questionnaireAnswer);
//         } catch (err) {
//           console.error("Invalid questionnaireAnswer JSON:", err);
//           return res.status(400).json({
//             message: "Invalid questionnaireAnswer format. Must be a valid JSON string."
//           });
//         }
//       } else if (typeof req.body.questionnaireAnswer === "object") {
//         questionnaireData = req.body.questionnaireAnswer;
//       }

//       // Assign to schema field
//       req.body.questionnaireData = questionnaireData;
//       delete req.body.questionnaireAnswer; // clean up unused field
//     }

//     // Create and save vendor
//     const vendor = new Vendor(req.body);
//     await vendor.save();

//     res.status(201).json({
//       message: "Vendor created successfully",
//       vendor
//     });
//   } catch (error) {
//     console.error("Error creating vendor:", error);
//     res.status(400).json({ message: error.message });
//   }
// };
// exports.createNewVendor = async (req, res) => {
//   try {
//     const { empId } = req.params;
//     console.log("Received Vendor Data:", req.body);

//     const vendorDataArray = req.body.data.map(async (vendor) => {
//       const vendorId = vendor.ID;

//       // Parse questionnaire data
//       let questionnaireData = {};
//       let questionnaireAnswer = "";

//       try {
//         if (vendor["Questionnaire Answer"]) {
//           if (typeof vendor["Questionnaire Answer"] === 'string') {
//             questionnaireData = JSON.parse(vendor["Questionnaire Answer"]);
//             questionnaireAnswer = vendor["Questionnaire Answer"];
//           } else if (typeof vendor["Questionnaire Answer"] === 'object') {
//             questionnaireData = vendor["Questionnaire Answer"];
//             questionnaireAnswer = JSON.stringify(vendor["Questionnaire Answer"]);
//           }
//         }
//       } catch (error) {
//         console.error("Error parsing questionnaire data:", error);
//         // In case of error, store empty data
//         questionnaireData = {};
//         questionnaireAnswer = "";
//       }

//       const vendorPayload = {
//         vendorName: vendor.Name,
//         primarySubsidiary: vendor["Primary Subsidiary"],
//         category: vendor.Category,
//         entity: vendor.Entity,
//         taxNumber: vendor["Tax Number"],
//         gstin: vendor.GSTIN,
//         msme: vendor.MSME || "",
//         billingAddress: vendor["Billing Address"],
//         shippingAddress: vendor["Shipping Address"],
//         phone: vendor.Phone,
//         email: vendor.Email || "",
//         status: vendor.Status || "Active",
//         bankAccountNumber: vendor["Bank Account Number"],
//         ifscSwiftCode: vendor["IFSC/SWIFT Code"],
//         bankName: vendor["Bank Name"],
//         hasAgreement: vendor["Has Agreement"],
//         agreementFileUrl: vendor["Agreement File URL"] || "",
//         agreementFileName: vendor["Agreement File Name"] || "",
//         questionnaireAnswer: questionnaireAnswer,
//         questionnaireData: questionnaireData,
//         natureOfService: vendor["Nature of Service"],
//         panTaxFileUrl: vendor["PAN/Tax File URL"] || "",
//         panTaxFileName: vendor["PAN/Tax File Name"] || "",
//         gstFileUrl: vendor["GST File URL"] || "",
//         gstFileName: vendor["GST File Name"] || "",
//         msmeFileUrl: vendor["MSME File URL"] || "",
//         msmeFileName: vendor["MSME File Name"] || "",
//         bankProofFileUrl: vendor["Bank Proof File URL"] || "",
//         bankProofFileName: vendor["Bank Proof File Name"] || "",
//         empId
//       };

//       const existingVendor = await Vendor.findOne({ vendorId });

//       if (existingVendor) {
//         return await Vendor.findOneAndUpdate(
//           { vendorId },
//           vendorPayload,
//           { new: true, runValidators: true }
//         );
//       } else {
//         return await Vendor.create({ vendorId, ...vendorPayload });
//       }
//     });

//     const insertedOrUpdatedVendors = await Promise.all(vendorDataArray);

//     res.status(201).json({
//       success: true,
//       message: "Vendors processed successfully",
//       data: insertedOrUpdatedVendors,
//     });
//   } catch (error) {
//     console.error("Error processing vendors:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

exports.createVendor = async (req, res) => {
  try {
    console.log("Create Vendor Request:", req.body);

    // Handle questionnaireAnswer safely
    if (req.body.questionnaireAnswer) {
      let questionnaireData = {};

      // If it's a string, try parsing JSON
      if (typeof req.body.questionnaireAnswer === "string") {
        try {
          questionnaireData = JSON.parse(req.body.questionnaireAnswer);
        } catch (err) {
          console.error("Invalid questionnaireAnswer JSON:", err);
          return res.status(400).json({
            message: "Invalid questionnaireAnswer format. Must be a valid JSON string."
          });
        }
      } else if (typeof req.body.questionnaireAnswer === "object") {
        questionnaireData = req.body.questionnaireAnswer;
      }

      // Assign to schema field
      req.body.questionnaireData = questionnaireData;
      delete req.body.questionnaireAnswer; // clean up unused field
    }

    // Auto-approve legal team verification if no deviation
    if (req.body.hasAgreement === 'yes' || req.body.isDeviation === false) {
      req.body.isLegalTeamVerified = true;

      // Add auto-approval log
      req.body.isLegalTeamVerifiedLogs = [{
        status: true,
        verifiedBy: 'System Auto-Approval',
        verifiedAt: new Date(),
        verifiedUserId: 'system',
        comments: ['Auto-approved: Vendor has agreement, no legal verification required']
      }];
    }

    // Create and save vendor
    const vendor = new Vendor(req.body);
    await vendor.save();

    res.status(201).json({
      message: "Vendor created successfully",
      vendor
    });
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

      // Parse questionnaire data
      let questionnaireData = {};
      let questionnaireAnswer = "";

      try {
        if (vendor["Questionnaire Answer"]) {
          if (typeof vendor["Questionnaire Answer"] === 'string') {
            questionnaireData = JSON.parse(vendor["Questionnaire Answer"]);
            questionnaireAnswer = vendor["Questionnaire Answer"];
          } else if (typeof vendor["Questionnaire Answer"] === 'object') {
            questionnaireData = vendor["Questionnaire Answer"];
            questionnaireAnswer = JSON.stringify(vendor["Questionnaire Answer"]);
          }
        }
      } catch (error) {
        console.error("Error parsing questionnaire data:", error);
        // In case of error, store empty data
        questionnaireData = {};
        questionnaireAnswer = "";
      }

      const vendorPayload = {
        vendorName: vendor.Name,
        primarySubsidiary: vendor["Primary Subsidiary"],
        category: vendor.Category,
        entity: vendor.Entity,
        taxNumber: vendor["Tax Number"],
        gstin: vendor.GSTIN,
        msme: vendor.MSME || "",
        billingAddress: vendor["Billing Address"],
        shippingAddress: vendor["Shipping Address"],
        phone: vendor.Phone,
        email: vendor.Email || "",
        status: vendor.Status || "Active",
        bankAccountNumber: vendor["Bank Account Number"],
        ifscSwiftCode: vendor["IFSC/SWIFT Code"],
        bankName: vendor["Bank Name"],
        hasAgreement: vendor["Has Agreement"],
        agreementFileUrl: vendor["Agreement File URL"] || "",
        agreementFileName: vendor["Agreement File Name"] || "",
        questionnaireAnswer: questionnaireAnswer,
        questionnaireData: questionnaireData,
        natureOfService: vendor["Nature of Service"],
        panTaxFileUrl: vendor["PAN/Tax File URL"] || "",
        panTaxFileName: vendor["PAN/Tax File Name"] || "",
        gstFileUrl: vendor["GST File URL"] || "",
        gstFileName: vendor["GST File Name"] || "",
        msmeFileUrl: vendor["MSME File URL"] || "",
        msmeFileName: vendor["MSME File Name"] || "",
        bankProofFileUrl: vendor["Bank Proof File URL"] || "",
        bankProofFileName: vendor["Bank Proof File Name"] || "",
        empId
      };

      // Auto-approve legal team verification if no deviation
      if (vendorPayload.hasAgreement === 'yes' || vendorPayload.isDeviation === false) {
        vendorPayload.isLegalTeamVerified = true;

        // Add auto-approval log
        vendorPayload.isLegalTeamVerifiedLogs = [{
          status: true,
          verifiedBy: 'System Auto-Approval',
          verifiedAt: new Date(),
          verifiedUserId: 'system',
          comments: ['Auto-approved: Vendor has agreement, no legal verification required']
        }];
      }

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
    const vendorPolicyFiles = await vendorPolicyFile.find();

    // Refresh URLs for policy files
    const refreshedPolicies = vendorPolicyFiles.map(doc => {
      const obj = doc.toObject();
      obj.policyFile = getFreshSignedUrl(obj.policyFile);
      return obj;
    });

    res.status(200).json({ vendors, vendorPolicyFiles: refreshedPolicies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVendorAddedByMe = async (req, res) => {
  try {
    const { empId } = req.params;
    const vendors = await Vendor.find({ empId: empId });
    const vendorPolicyFiles = await vendorPolicyFile.find();

    // Refresh URLs for policy files
    const refreshedPolicies = vendorPolicyFiles.map(doc => {
      const obj = doc.toObject();
      obj.policyFile = getFreshSignedUrl(obj.policyFile);
      return obj;
    });

    res.status(200).json({ vendors: vendors, vendorPolicyFiles: refreshedPolicies });
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
    console.log("Updating vendor with ID:", req.params.id);
    console.log("Received Data:", req.body);

    const updateData = {
      vendorId: req.body.vendorId,
      vendorName: req.body.vendorName,
      primarySubsidiary: req.body.primarySubsidiary,
      category: req.body.category,
      entity: req.body.entity,
      taxNumber: req.body.taxNumber,
      gstin: req.body.gstin,
      msme: req.body.msme,

      billingAddress: req.body.billingAddress,
      shippingAddress: req.body.shippingAddress,

      phone: req.body.phone,
      email: req.body.email,

      bankAccountNumber: req.body.bankAccountNumber,
      ifscSwiftCode: req.body.ifscSwiftCode,
      bankName: req.body.bankName,

      hasAgreement: req.body.hasAgreement,
      agreementFileUrl: req.body.agreementFileUrl,
      agreementFileName: req.body.agreementFileName,

      natureOfService: req.body.natureOfService,

      // File URLs and Names
      panTaxFileUrl: req.body.panTaxFileUrl,
      panTaxFileName: req.body.panTaxFileName,

      gstFileUrl: req.body.gstFileUrl,
      gstFileName: req.body.gstFileName,

      msmeFileUrl: req.body.msmeFileUrl,
      msmeFileName: req.body.msmeFileName,

      bankProofFileUrl: req.body.bankProofFileUrl,
      bankProofFileName: req.body.bankProofFileName,

      status: req.body.status,
    };

    // ✅ Handle questionnaireAnswer
    if (req.body.questionnaireAnswer) {
      let questionnaireData = {};

      if (typeof req.body.questionnaireAnswer === "string") {
        try {
          questionnaireData = JSON.parse(req.body.questionnaireAnswer);
        } catch (err) {
          console.error("Invalid questionnaireAnswer JSON:", err);
          return res.status(400).json({
            success: false,
            message: "Invalid questionnaireAnswer format. Must be valid JSON string."
          });
        }
      } else if (typeof req.body.questionnaireAnswer === "object") {
        questionnaireData = req.body.questionnaireAnswer;
      }

      updateData.questionnaireData = questionnaireData;
    }

    // Remove undefined keys
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      vendor,
    });
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

    // Refresh URL
    const doc = vendorPolicy.toObject();
    doc.policyFile = getFreshSignedUrl(doc.policyFile);

    // Prevent caching
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");

    res.status(200).json(doc);
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
    // Refresh URL
    const doc = vendorPolicy.toObject();
    doc.policyFile = getFreshSignedUrl(doc.policyFile);

    // Prevent caching
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");

    res.status(200).json(doc);
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


exports.getPoPolicyFileLink = async (req, res) => {
  try {
    const getPoPolicyFileLink = await poPolicyFile.findOne();
    if (!getPoPolicyFileLink) {
      return res.status(404).json({ message: "po policy file not found" });
    }

    // Refresh URL
    const freshUrl = getFreshSignedUrl(getPoPolicyFileLink.policyFile);

    res.status(200).json({ data: freshUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getVendorDeviationDataCount = async (req, res) => {
  try {
    const vendorDeviationData = await Vendor.find({ isDeviation: true, isLegalTeamVerified: false });
    if (!vendorDeviationData) {
      return res.status(404).json({ message: "Vendor deviation data not found" });
    }
    res.status(200).json({ vendorDeviationData: vendorDeviationData?.length || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVendorDeviationData = async (req, res) => {
  try {
    const vendorDeviationData = await Vendor.find({ isDeviation: true, isLegalTeamVerified: false });

    if (!vendorDeviationData) {
      return res.status(404).json({ message: "Vendor deviation data not found" });
    }
    res.status(200).json({ vendorDeviationData: vendorDeviationData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.approveVendorData = async (req, res) => {
  try {
    const { vendorId, empId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }


    const empData = await Employee.findOne({ employee_id: empId }, { full_name: 1 });


    vendor.isLegalTeamVerified = true;

    // Push logs instead of overwriting to preserve rejection history
    vendor.isLegalTeamVerifiedLogs.push({
      status: true,
      verifiedBy: empData?.full_name || "",
      verifiedAt: new Date(),
      verifiedUserId: empId,
      comments: []
    });

    await vendor.save();

    res.status(200).json({
      message: "Vendor verified and approved by legal team successfully",
      vendor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVendorApproveDataCount = async (req, res) => {
  try {
    const vendorApproveData = await Vendor.find({ isLegalTeamVerified: true, isVendorTeamVerified: false });
    if (!vendorApproveData) {
      return res.status(404).json({ message: "Vendor approve data not found" });
    }
    res.status(200).json({ vendorApproveData: vendorApproveData?.length || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




exports.teamVerifiedTheVendorData = async (req, res) => {
  try {
    const { vendorId, empId } = req.params;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const empData = await Employee.findOne(
      { employee_id: empId },
      { full_name: 1 }
    );

    // Update the boolean flag
    vendor.isVendorTeamVerified = true;
    vendor.status = "Active"

    // PUSH the verification log (not replace)
    vendor.isVendorTeamVerifiedLogs.push({
      status: true,
      verifiedBy: empData?.full_name || "",
      verifiedAt: new Date(),
      verifiedUserId: empId,
      comments: []
    });

    await vendor.save();

    res.status(200).json({
      message: "Vendor verified and approved by Vendor management team successfully",
      vendor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.teamRejectTheVendorData = async (req, res) => {
  try {
    const { vendorId, empId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const empData = await Employee.findOne(
      { employee_id: empId },
      { full_name: 1 }
    );

    console.log("data", empData)

    // Update boolean
    vendor.isVendorTeamVerified = false;

    // Push logs
    vendor.isVendorTeamVerifiedLogs.push({
      status: false,
      verifiedBy: empData?.full_name || "",
      verifiedAt: new Date(),
      verifiedUserId: empId,
      comments: [reason]
    });

    await vendor.save();

    res.status(200).json({
      message: "Vendor rejected by Vendor Management Team",
      vendor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.legalRejectTheVendorData = async (req, res) => {
  try {
    const { vendorId, empId } = req.params;
    const { reason } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const empData = await Employee.findOne(
      { employee_id: empId },
      { full_name: 1 }
    );

    // Update boolean
    vendor.isLegalTeamVerified = false;

    // Push logs
    vendor.isLegalTeamVerifiedLogs.push({
      status: false,
      verifiedBy: empData?.full_name || "",
      verifiedAt: new Date(),
      verifiedUserId: empId,
      comments: [reason]
    });

    await vendor.save();

    res.status(200).json({
      message: "Vendor rejected by Legal Team",
      vendor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};