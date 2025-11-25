import * as XLSX from "xlsx";

export const exportAllRequestsToExcel = (allRequests) => {
  console.log("Exporting requests:", allRequests);

  const exportData = allRequests.map((request) => {
    // Format payment terms
    let paymentPercentage = "NA";
    let paymentType = "NA";

    if (request.commercials?.paymentTerms?.length > 0) {
      const term = request.commercials.paymentTerms[0]; // Get first payment term
      paymentPercentage = term.percentageTerm ? `${term.percentageTerm}%` : "NA";
      paymentType = term.paymentType || "NA";
    }

    // Format PO dates
    const formatDate = (dateString) => {
      if (!dateString) return "NA";
      try {
        return new Date(dateString).toLocaleDateString('en-GB'); // DD/MM/YYYY format
      } catch (e) {
        return dateString;
      }
    };

    // Format service description
    let serviceDescription = "NA";
    if (request.supplies?.services?.length > 0) {
      serviceDescription = request.supplies.services
        .map(s => s.productDescription || s.productName)
        .filter(Boolean)
        .join(", ");
    }

    // Check if it's a one-time service
    const isOneTime = request.procurements?.servicePeriod ? "No" : "Yes";

    // Format total value with currency
    const totalValue = request.supplies?.totalValue
      ? `${request.supplies.selectedCurrency || ''} ${request.supplies.totalValue.toLocaleString()}`
      : "NA";

    return {
      "Status of Request": request.status || "NA",
      "Request Date": request.createdAt ? formatDate(request.createdAt) : "NA",
      "Request ID": request.reqid || "NA",
      "BU": request.commercials?.businessUnit || "NA",
      "Entity": request.commercials?.entity || "NA",
      "City": request.commercials?.city || "NA",
      "Requestor": request.userName || "NA",
      "Requestor Department": request.empDepartment || "NA",
      "Cost Center": request.commercials?.costCentre || "NA",
      "HOD": request.commercials?.hod || "NA",
      "Vendor ID & Name": request.procurements?.vendorName
        ? `${request.procurements.vendor || ''} - ${request.procurements.vendorName}`
        : "NA",
      "Payment Percentage": paymentPercentage,
      "Payment Term": paymentType,
      "Payment Type": request.commercials?.paymentMode || "NA",
      "Service Description": serviceDescription,
      "One Time": isOneTime,
      "PO Valid from": request.procurements?.poValidFrom ? formatDate(request.procurements.poValidFrom) : "NA",
      "PO Valid To": request.procurements?.poValidTo ? formatDate(request.procurements.poValidTo) : "NA",
      "PO Expiry Date": request.procurements?.poExpiryDate ? formatDate(request.procurements.poExpiryDate) : "NA",
      "PO Total Value with Currency": totalValue,
      "Project Code": request.procurements?.projectCode || "NA",
      "Client Name": request.procurements?.clientName || "NA",
      "Remarks": request.procurements?.remarks || request.supplies?.remarks || "NA"
    };
  });

  // Create worksheet with the export data
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Auto-size columns
  const wscols = Object.keys(exportData[0] || {}).map(key => ({
    wch: Math.max(
      key.length,
      ...exportData.map(row => String(row[key] || '').length)
    ) + 2 // Add some padding
  }));

  ws['!cols'] = wscols;

  // Create workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Requests");

  // Generate the Excel file
  const fileName = `Request_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);

  console.log("Export completed successfully");
};

const formatCurrency = (value, currency) => {
  if (!value) return "NA";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(value);
  } catch (error) {
    return value.toString();
  }
};

