const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  updateManyEmployees,
  updateEmployeeStatus,
  generateEmpId,
  createNewEmployee,
  verifyUser,
  createNewReq,
  getAllEmployeeReq,
  getAdminEmployeeReq,
  deleteRequest,
  getIndividualReq,
  syncEmployeeData,
  addNewPanelsMembers,
  getPanelMembers,
  addPanelUsers,
  deletePanelEmployee,
  getIndividualPanelMembers,
  getAllApprovalDatas,
  uploadApproverExcel,
  checkDarwinStatus,
  updateDarwinStatus,
  getAllEmployeeData,
  addNewApproverData,
  editApproverData,
  deleteApproverData

} = require("../controllers/empController");

const capEmpController = require("../controllers/capEmpController");

const router = express.Router(); 

const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Define routes
router.get("/generate-empid", generateEmpId);
router.get("/get-all", getAllEmployees);
router.get("/get/:id", getEmployeeById);
router.get("/get-individual-req/:id", getIndividualReq);
router.get("/get-all-req/:id", getAllEmployeeReq);
router.get("/get-all-req-admin", getAdminEmployeeReq);
router.get("/panel-member-get-all", getPanelMembers);
router.get("/get-panel-members/:id", getIndividualPanelMembers);
router.get("/get-all-employee", getAllEmployeeData);


router.get("/darwin-status", checkDarwinStatus);
router.get("/get-approval-datas", getAllApprovalDatas);
router.put("/update-darwin-status", updateDarwinStatus);

router.post("/add-new-approver-data", addNewApproverData);




router.post("/upload-csv-file", upload.single("file"), uploadApproverExcel);

router.post("/verify-person", capEmpController.verifyUser);
router.put("/create-newrequest/:id/:reqId", capEmpController.createNewReq);

// router.post('/verify-person',verifyUser);
// router.post('/create-newrequest/:id',createNewReq);

router.post("/create", createEmployee);
router.post("/create-new-employee", createEmployee);
router.post("/add-new-panels", addNewPanelsMembers);

router.post("/sync-emp-data", syncEmployeeData);

router.put("/edit-approver-data", editApproverData);
router.put("/delete-approver-data", deleteApproverData);




router.put("/update/:id", updateEmployee);
router.put("/update-many", updateManyEmployees);
router.put("/update-status/:id", updateEmployeeStatus);

router.delete("/delete/:id", deleteEmployee);
router.delete("/panel-delete/:id", deletePanelEmployee);

router.delete("/delete-req/:id", deleteRequest);

// router.put('/create-newrequest',updateEmployeeStatus);

// Uncomment this if bulk deletion is required
// router.delete('/delete-many', deleteManyEmployees);

module.exports = router;
