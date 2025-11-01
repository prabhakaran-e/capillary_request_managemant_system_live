const express = require('express');
const router = express()
const reqController = require("../controllers/reqController")
const approvalController= require("../controllers/approvalController") 






router.get('/get-statistic-data/:empId/:role/:email/:multipartRole', reqController.getStatisticData); 
router.get('/get-new-notification/:id', reqController.getNewNotifications); 
router.get('/get-approved-req/:id', reqController.getApprovedReqData); 
router.get('/get-filtered-req/:id/:action', reqController.getFilteredRequest); 
router.get('/is-display-button/:id', reqController.isButtonSDisplay); 
router.get('/generate-po/:id', reqController.generatePo); 
router.get('/get-all-chats/:id', reqController.getAllChats); 
router.get('/get-reports', reqController.getReports); 
router.get('/invoice/download/:id', reqController.downloadInvoicePdf); 
router.get('/is-approved/:userId/:reqId/:role', reqController.isApproved); 
router.get('/is-approved/:userId/:reqId/:role', reqController.isApproved); 

router.get('/get-individual-request-data/:reqId', reqController.getRequestDataForProvison); 

// router.get('/get-all-request-for-admin', reqController.getAllRequestForAdmin); 
router.get('/get-email-notification-data', reqController.getAllEmailData);
router.get('/tag-employee/:role/:reqId', reqController.tagMessageToEmployee);

router.post('/get-filtered-request/:userId', reqController.getAllFilteredRequest);










router.post('/accept-request-hod/:id', approvalController.approveRequest);
router.post('/accept-request-business/:id', approvalController.approveRequest); 
router.post('/accept-request-vendor/:id', approvalController.approveRequest); 
router.post('/accept-request-legal/:id', approvalController.approveRequest); 
router.post('/accept-request-info-security/:id', approvalController.approveRequest); 
router.post('/accept-request-po-team/:id', approvalController.approveRequest); 
router.post('/accept-request-hof-team/:id', approvalController.approveRequest);
router.post('/generate-request-pdf/:reqId', reqController.generateRequestPdfData);
router.post('/edit-commercial-data/:empId/:reqId', reqController.editCommercialData);

router.post('/email-notification-action', reqController.emailNotificationAction);
router.post('/get-searched-data', reqController.getSearchedData);
router.post(
  "/business-finance-bulk-approval/:empId",
  approvalController.businessFinanceBulkApproval
);






router.get("/get-a-request-id", reqController.getANewRequestId); 



router.post('/save-commercial-data/:empId', reqController.saveCommercialData);
router.put('/save-procurements-data/:newReqId', reqController.saveProcurementsData);
router.put('/save-supplies-data/:reqId', reqController.saveSuppliesData);
router.put('/save-aggrement-data/:reqId', reqController.saveAggrementData);










router.post('/send-reminder/:reqId', reqController.sendNudgeNotification); 
router.post('/add-request', reqController.addReqForm); 
router.post('/send-edit-request-mail/:empId/:reqId',reqController.editSendRequestMail)
router.post('/filter-by-date/:empId/:role/:email/:multipartRole',reqController.filterByDateStatitics)




router.put('/relese-status/:empId/:reqId', reqController.releaseReqStatus); 
// router.put('/update-request/:id', reqController.updateRequest); 
router.put('/update-request/:id', reqController.updateRequest); 

router.put('/chats/:id', reqController.postComments); 
router.put('/upload-po-documents/:empId/:reqId', reqController.uploadPoDocuments); 
router.put('/upload-invoice-documents/:empId/:reqId', reqController.uploadInvoiceDocuments); 






module.exports = router;
