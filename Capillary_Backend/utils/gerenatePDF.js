const PDFDocument = require("pdfkit");
const fs = require("fs");

function generatePDF(reqData, outputFile = "request_details.pdf") {
  const doc = new PDFDocument({ margin: 50 });

  // Create a write stream to save the PDF
  const stream = fs.createWriteStream(outputFile);
  doc.pipe(stream);

  // Title
  doc
    .fontSize(18)
    .text("Request Details", { align: "center" })
    .moveDown();

  // Basic Info
  doc.fontSize(12).text(`Request ID: ${reqData.reqid}`);
  doc.text(`User ID: ${reqData.userId}`);
  doc.text(`User Name: ${reqData.userName}`);
  doc.text(`Status: ${reqData.status}`).moveDown();

  // Commercials Section
  if (reqData.commercials) {
    doc.fontSize(14).text("Commercials", { underline: true }).moveDown();
    doc.fontSize(12).text(`Bill To: ${reqData.commercials.billTo}`);
    doc.text(`Business Unit: ${reqData.commercials.businessUnit}`);
    doc.text(`City: ${reqData.commercials.city}`);
    doc.text(`Department: ${reqData.commercials.department}`);
    doc.text(`Entity: ${reqData.commercials.entity}`);
    doc.text(`HOD: ${reqData.commercials.hod}`);
    doc.text(`Payment Mode: ${reqData.commercials.paymentMode}`).moveDown();
  }

  // Procurement Section
  if (reqData.procurements) {
    doc.fontSize(14).text("Procurement Details", { underline: true }).moveDown();
    doc.fontSize(12).text(`Quotation Date: ${reqData.procurements.quotationDate}`);
    doc.text(`Vendor Name: ${reqData.procurements.vendorName}`);
    doc.text(`Email: ${reqData.procurements.email}`);
    doc.text(`Service Period: ${reqData.procurements.servicePeriod}`);
    doc.text(`Project Code: ${reqData.procurements.projectCode}`).moveDown();
  }

  // Supplies Section
  if (reqData.supplies) {
    doc.fontSize(14).text("Supplies", { underline: true }).moveDown();
    doc.fontSize(12).text(`Total Value: ${reqData.supplies.totalValue}`);
    doc.text(`Currency: ${reqData.supplies.selectedCurrency}`);
    doc.text(`Remarks: ${reqData.supplies.remarks}`).moveDown();
  }

  // Compliance Section
  if (reqData.complinces && reqData.complinces.length > 0) {
    doc.fontSize(14).text("Compliance Details", { underline: true }).moveDown();
    reqData.complinces.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}. ${item.question}`);
      doc.text(`Answer: ${item.answer ? "Yes" : "No"}`);
      doc.text(`Department: ${item.department}`);
      doc.text(`Has Deviations: ${item.hasDeviations ? "Yes" : "No"}`).moveDown();
    });
  }

  // Approvals Section
  if (reqData.approvals && reqData.approvals.length > 0) {
    doc.fontSize(14).text("Approval Details", { underline: true }).moveDown();
    reqData.approvals.forEach((approval, index) => {
      doc.fontSize(12).text(`${index + 1}. Department: ${approval.departmentName}`);
      doc.text(`Approver: ${approval.approverName}`);
      doc.text(`Status: ${approval.status}`);
      doc.text(`Approval Date: ${approval.approvalDate}`).moveDown();
    });
  }

  // Comments Section
  if (reqData.commentLogs && reqData.commentLogs.length > 0) {
    doc.fontSize(14).text("Comments", { underline: true }).moveDown();
    reqData.commentLogs.forEach((comment, index) => {
      doc.fontSize(12).text(`${index + 1}. ${comment.senderName}: ${comment.message}`);
      doc.text(`Department: ${comment.department}`);
      doc.text(`Timestamp: ${comment.timestamp}`).moveDown();
    });
  }

  // PO Documents
  if (reqData.poDocuments && reqData.poDocuments.poLink) {
    doc.fontSize(14).text("PO Documents", { underline: true }).moveDown();
    doc.fontSize(12).text(`PO Link: ${reqData.poDocuments.poLink}`);
  }

  // Invoice Documents
  if (reqData.invoiceDocumets && reqData.invoiceDocumets.length > 0) {
    doc.fontSize(14).text("Invoice Documents", { underline: true }).moveDown();
    reqData.invoiceDocumets.forEach((invoice, index) => {
      doc.fontSize(12).text(`${index + 1}. Uploaded By: ${invoice.uploadedBy.empName}`);
      doc.text(`Invoice Link: ${invoice.invoiceLink}`).moveDown();
    });
  }

  // Close the PDF
  doc.end();

  console.log(`PDF generated: ${outputFile}`);
  return outputFile;
}

module.exports = { generatePDF };
