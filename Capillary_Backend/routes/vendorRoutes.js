const express = require("express");
const {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  updateManyVendors,
  getNewVendorId,
  createNewVendor,
  getVendorAddedByMe,
  saveVendorPolicyFile,
  deleteVendorPolicyFile,
  getVendorPolicyFile,
  savePoPolicyFile,
  getPoPolicyFile,
  deletePoPolicyFile,
  getPoPolicyFileLink,
  getVendorDeviationDataCount,
  getVendorDeviationData,
  approveVendorData,
  getVendorApproveDataCount,
  teamVerifiedTheVendorData,
  teamRejectTheVendorData,
  legalRejectTheVendorData,

} = require("../controllers/vendorController");
const router = express.Router();


router.get("/get-new-vendorid", getNewVendorId);

router.post("/create", createVendor);

router.post("/create-new-vendors/:empId", createNewVendor);
router.post("/save-vendor-policy-file", saveVendorPolicyFile);
router.get("/get-vendor-policy-file", getVendorPolicyFile);
router.delete("/delete-vendor-policy-file", deleteVendorPolicyFile);

router.post("/save-po-policy-file", savePoPolicyFile);
router.get("/get-po-policy-file", getPoPolicyFile);
router.delete("/delete-po-policy-file", deletePoPolicyFile);

router.get("/get-po-policy-file-link", getPoPolicyFileLink);
router.get("/legal-deviation-count-vendor", getVendorDeviationDataCount);
router.get("/vendor-management-approve-count", getVendorApproveDataCount);


router.put("/approve-vendor/:vendorId/:empId", approveVendorData);
router.put("/reject-vendor/:vendorId/:empId", legalRejectTheVendorData);


router.put("/team-verified-the-vendor-data/:vendorId/:empId", teamVerifiedTheVendorData);
router.put("/team-reject-the-vendor-data/:vendorId/:empId", teamRejectTheVendorData);



router.get("/get-all", getAllVendors);
router.get("/legal-deviation-pending-vendor", getVendorDeviationData);
router.get("/vendor-added-by-me/:empId", getVendorAddedByMe);

router.get("/get-vendor-data/:id", getVendorById);
router.put("/update/:id", updateVendor);
router.delete("/delete/:id", deleteVendor);
router.put("/update-many", updateManyVendors);

module.exports = router;
