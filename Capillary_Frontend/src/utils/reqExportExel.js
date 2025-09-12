import * as XLSX from "xlsx";

export const exportAllRequestsToExcel= (allRequests) => {
    console.log("allRequests",allRequests)
  const exportData = allRequests.map((request, index) => {
    const baseExport = {
      "SL No": index + 1,
      "Request ID": request.reqid || "NA",
      Requestor: request.userName || "NA",
      "Requestor Department": request.empDepartment || "NA",
      Status: request.status || "NA",
    };

    // Detailed Commercials Section
    if (request.commercials) {
      baseExport["Bill To"] = request.commercials.billTo || "NA";
      baseExport["Business Unit"] = request.commercials.businessUnit || "NA";
      baseExport["City"] = request.commercials.city || "NA";
      baseExport["Cost Centre"] = request.commercials.costCentre || "NA";
      baseExport["Department"] = request.commercials.department || "NA";
      baseExport["Entity"] = request.commercials.entity || "NA";
      baseExport["Entity ID"] = request.commercials.entityId || "NA";
      baseExport["HOD"] = request.commercials.hod || "NA";
      baseExport["HOD Email"] = request.commercials.hodEmail || "NA";
      baseExport["Payment Mode"] = request.commercials.paymentMode || "NA";
      baseExport["Ship To"] = request.commercials.shipTo || "NA";
      baseExport["Site"] = request.commercials.site || "NA";

      // Payment Terms Details
      if (
        request.commercials.paymentTerms &&
        request.commercials.paymentTerms.length > 0
      ) {
        request.commercials.paymentTerms.forEach((term, termIndex) => {
          baseExport[`Payment Term ${termIndex + 1} Percentage`] =
            term.percentageTerm || "NA";
          baseExport[`Payment Term ${termIndex + 1} Payment Type`] =
            term.paymentType || "NA";
          baseExport[`Payment Term ${termIndex + 1} Payment Term`] =
            term.paymentTerm || "NA";
      
       
        });
      }
    }

    // Detailed Procurements Section
    if (request.procurements) {
      baseExport["Quotation Date"] = request.procurements.quotationDate
        ? new Date(request.procurements.quotationDate).toLocaleDateString()
        : "NA";
      baseExport["Quotation Number"] =
        request.procurements.quotationNumber || "NA";
      baseExport["Vendor"] = request.procurements.vendor || "NA";
      baseExport["Vendor Name"] = request.procurements.vendorName || "NA";
      baseExport["Vendor Email"] = request.procurements.email || "NA";
      baseExport["Is New Vendor"] = request.procurements.isNewVendor
        ? "Yes"
        : "No";
      baseExport["Service Period"] = request.procurements.servicePeriod || "NA";
      baseExport["Project Code"] = request.procurements.projectCode || "NA";
      baseExport["Client Name"] = request.procurements.clientName || "NA";
      baseExport["PO Valid From"] = request.procurements.poValidFrom
        ? new Date(request.procurements.poValidFrom).toLocaleDateString()
        : "NA";
      baseExport["PO Valid To"] = request.procurements.poValidTo
        ? new Date(request.procurements.poValidTo).toLocaleDateString()
        : "NA";
      baseExport["PO Expiry Date"] = request.procurements.poExpiryDate
        ? new Date(request.procurements.poExpiryDate).toLocaleDateString()
        : "NA";
      baseExport["Remarks"] = request.procurements.remarks || "NA";

      // Uploaded Files
      if (
        request.procurements.uploadedFiles &&
        request.procurements.uploadedFiles.length > 0
      ) {
        request.procurements.uploadedFiles.forEach((file, fileIndex) => {
          baseExport[`Uploaded File ${fileIndex + 1}`] =
            JSON.stringify(file) || "NA";
        });
      }
    }

    // Detailed Supplies Section
    if (request.supplies) {
      baseExport["Total Value"] = formatCurrency(
        request.supplies.totalValue,
        request.supplies.selectedCurrency
      );
      baseExport["Selected Currency"] =
        request.supplies.selectedCurrency || "NA";
      baseExport["Remarks"] = request.supplies.remarks || "NA";

      // Services Details
      if (request.supplies.services && request.supplies.services.length > 0) {
        request.supplies.services.forEach((service, serviceIndex) => {
          baseExport[`Service ${serviceIndex + 1} Product Name`] =
            service.productName || "NA";
          baseExport[`Service ${serviceIndex + 1} Description`] =
            service.productDescription || "NA";
          baseExport[`Service ${serviceIndex + 1} Purpose`] =
            service.productPurpose || "NA";
          baseExport[`Service ${serviceIndex + 1} Quantity`] =
            service.quantity || "NA";
          baseExport[`Service ${serviceIndex + 1} Price`] =
            service.price || "NA";
          baseExport[`Service ${serviceIndex + 1} Tax`] = service.tax || "NA";
        });
      }
    }

    return baseExport;
  });

//   const ws = XLSX.utils.json_to_sheet(exportData);
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, "All Requests");

  
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Requests");
        XLSX.writeFile(wb, "RequestList.xlsx");
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

