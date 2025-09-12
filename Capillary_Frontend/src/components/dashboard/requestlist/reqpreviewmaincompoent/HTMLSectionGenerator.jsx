import React from "react";
import { extractDateAndTime } from "../../../../utils/extractDateAndTime";
import { formatDateToDDMMYY } from "../../../../utils/dateFormat";

const HTMLSectionGenerator = ({ request, currencies }) => {
    const formatCurrency = (value) => {
        const currency = currencies.find(
            (c) => c.code === request.supplies.selectedCurrency
        );
        if (!currency || !value) return "N/A";

        return new Intl.NumberFormat(currency.locale, {
            style: "currency",
            currency: currency.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const createInfoBox = (label, value) => {
        return `
          <div class="info-box">
            <div class="info-label">${label}</div>
            <div class="info-value">${value || "N/A"}</div>
          </div>
        `;
    };

    const generateSectionHTML = (sectionId, sectionTitle) => {
        // Base styles for all sections - updated with theme color and better spacing
        const styles = `
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 5px; }
            .section-container { max-width: 210mm; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #80c242; padding-bottom: 15px; margin-bottom: 25px; }
            h1 { color: #80c242; font-size: 24px; margin: 0; }
            h2 { color: #80c242; font-size: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-top: 30px; margin-bottom: 20px; }
            .info-box { background-color: #f9fafb; border-radius: 8px; padding: 15px; margin-bottom: 15px; border-left: 4px solid #80c242; }
            .info-label { color: #4b5563; font-weight: 600; margin-bottom: 6px; }
            .info-value { color: #1f2937; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 25px; }
            th { background-color: #eef7e6; color: #3d611f; padding: 12px; text-align: left; font-weight: 600; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .status-approved { background-color: #d1fae5; color: #065f46; border-radius: 12px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
            .status-rejected { background-color: #fee2e2; color: #b91c1c; border-radius: 12px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
            .status-pending { background-color: #fef3c7; color: #92400e; border-radius: 12px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
            .remarks-box { background-color: #f3f4f6; border-radius: 6px; padding: 10px; margin-top: 8px; font-size: 13px; }
          </style>
        `;

        // Header with logo and request information
        const header = `
          <div class="header">
            <div>
              <h1>${sectionTitle}</h1>
              <p>Request ID: ${request.reqid || "N/A"}</p>
            </div>
            <div>
              <p>Generated: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        `;

        let sectionContent = "";

        // Generate content based on section ID
        switch (sectionId) {
            case "commercial-details":
                sectionContent = generateCommercialDetailsHTML();
                break;
            case "procurement-details":
                sectionContent = generateProcurementDetailsHTML();
                break;
            case "supplies-details":
                sectionContent = generateSuppliesDetailsHTML();
                break;
            case "compliance-details":
                sectionContent = generateComplianceDetailsHTML();
                break;
            case "approval-logs":
                sectionContent = generateApprovalLogsHTML();
                break;
            default:
                sectionContent = "<p>No content available</p>";
        }

        return `
          <div class="section-container">
            ${styles}
            ${header}
            ${sectionContent}
          </div>
        `;
    };

    const generateCommercialDetailsHTML = () => {
        if (!request || !request.commercials)
            return "<p>No commercial details available</p>";

        let commercialHTML = `
          <div class="section-content">
            <h2>Commercials</h2>
            <div class="grid-3">
              ${createInfoBox("Request ID", request.reqid)}
              ${createInfoBox(
                  "Business Unit",
                  request.commercials.businessUnit
              )}
              ${createInfoBox(
                  "Created At",
                  extractDateAndTime(request.createdAt)
              )}
            </div>
            
            <div class="grid-3">
              ${createInfoBox("Entity", request.commercials.entity)}
              ${createInfoBox("City", request.commercials.city)}
              ${createInfoBox("Site", request.commercials.site)}
            </div>
            
            <div class="grid-2">
              ${createInfoBox("Department", request.commercials.department)}
              ${createInfoBox("Head of Department", request.commercials.hod)}
            </div>
            
            <div class="grid-2">
              ${createInfoBox("Bill To", request.commercials.billTo)}
              ${createInfoBox("Ship To", request.commercials.shipTo)}
            </div>
        `;

        // Add additional approver section if available
        if (request.commercials?.additionalApprover) {
            commercialHTML += `
            <h2>Additional Approver Information</h2>
            <div class="grid-3">
                ${createInfoBox(
                    "Approver ID",
                    request.commercials.additionalApprover
                )}
                ${createInfoBox(
                    "Approver Name",
                    request.commercials.additionalApproverName || "N/A"
                )}
                ${createInfoBox(
                    "Approver Email",
                    request.commercials.additionalApproverEmail || "N/A"
                )}
            </div>
            ${
                request.commercials.additionalApproverProof &&
                request.commercials.additionalApproverProof.length > 0
                    ? `
                <div class="info-box">
                    <div class="info-label">Proof Documents</div>
                    <div class="info-value">✓ ${request.commercials.additionalApproverProof.length} document(s) uploaded</div>
                </div>
            `
                    : ""
            }
        `;
        }

        // Add payment terms if available
        if (request.commercials?.paymentTerms?.length > 0) {
            commercialHTML += `
            <h2>Payment Terms</h2>
            <table>
              <thead>
                <tr>
                  <th>Percentage</th>
                  <th>Payment Term</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                ${request.commercials.paymentTerms
                    .map(
                        (term) => `
                  <tr>
                    <td>${term.percentageTerm}%</td>
                    <td>${(term.paymentTerm || "").toLowerCase()}${
                            term.customPaymentTerm
                                ? ` - ${term.customPaymentTerm.toLowerCase()}`
                                : ""
                        }</td>
                    <td>${(term.paymentType || "").toLowerCase()}${
                            term.customPaymentType
                                ? ` - ${term.customPaymentType.toLowerCase()}`
                                : ""
                        }</td>
                  </tr>
                `
                    )
                    .join("")}
              </tbody>
            </table>
          `;
        }

        commercialHTML += "</div>";
        return commercialHTML;
    };

    const generateProcurementDetailsHTML = () => {
        if (!request || !request.procurements)
            return "<p>No procurement details available</p>";

        let procurementHTML = `
          <div class="section-content">
            <h2>Vendor Information</h2>
            <div class="grid-2">
              ${createInfoBox("Vendor ID", request.procurements.vendor)}
              ${createInfoBox("Vendor Name", request.procurements.vendorName)}
            </div>
            
            <div class="grid-2">
              ${createInfoBox(
                  "Quotation Number",
                  request.procurements.quotationNumber
              )}
              ${createInfoBox(
                  "Quotation Date",
                  request.procurements.quotationDate
                      ? formatDateToDDMMYY(request.procurements.quotationDate)
                      : "N/A"
              )}
            </div>
            
            <div class="grid-3">
              ${createInfoBox(
                  "Service Period",
                  request.procurements.servicePeriod
              )}
              ${createInfoBox(
                  "PO Valid From",
                  request.procurements.poValidFrom
                      ? formatDateToDDMMYY(request.procurements.poValidFrom)
                      : "N/A"
              )}
              ${createInfoBox(
                  "PO Valid To",
                  request.procurements.poValidTo
                      ? formatDateToDDMMYY(request.procurements.poValidTo)
                      : "N/A"
              )}
            </div>
        `;

        // Add uploaded files if available
        if (
            request.procurements?.uploadedFiles &&
            request.procurements.uploadedFiles.length > 0
        ) {
            procurementHTML += `<h2>Uploaded Files & Agreement Details</h2>`;

            request.procurements.uploadedFiles.forEach(
                (fileGroup, groupIndex) => {
                    Object.entries(fileGroup).forEach(
                        ([category, categoryData]) => {
                            if (
                                categoryData &&
                                (categoryData.urls ||
                                    categoryData.agreementValidFrom ||
                                    categoryData.agreementValidTo)
                            ) {
                                procurementHTML += `
                        <div class="info-box" style="margin-bottom: 20px;">
                            <h3 style="color: #80c242; margin-top: 0; margin-bottom: 15px; text-transform: capitalize;">
                                ${category.replace(/_/g, " ")}
                            </h3>
                            
                            ${
                                categoryData.agreementValidFrom ||
                                categoryData.agreementValidTo
                                    ? `
                                <div class="grid-2" style="margin-bottom: 15px;">
                                    ${
                                        categoryData.agreementValidFrom
                                            ? createInfoBox(
                                                  "Agreement Valid From",
                                                  formatDateToDDMMYY(
                                                      categoryData.agreementValidFrom
                                                  )
                                              )
                                            : ""
                                    }
                                    ${
                                        categoryData.agreementValidTo
                                            ? createInfoBox(
                                                  "Agreement Valid To",
                                                  formatDateToDDMMYY(
                                                      categoryData.agreementValidTo
                                                  )
                                              )
                                            : ""
                                    }
                                </div>
                            `
                                    : ""
                            }
                            
                            ${
                                categoryData.urls &&
                                categoryData.urls.length > 0
                                    ? `
                                <div class="info-value" style="color: #80c242;">
                                    ✓ ${categoryData.urls.length} file(s) uploaded successfully
                                </div>
                            `
                                    : `
                                <div class="info-value" style="color: #666;">
                                    No files uploaded for this category
                                </div>
                            `
                            }
                        </div>
                    `;
                            }
                        }
                    );
                }
            );
        } else {
            procurementHTML += `
            <h2>Uploaded Files</h2>
            <div class="info-box">
                <p class="info-value">No files uploaded</p>
            </div>
        `;
        }

        procurementHTML += "</div>";
        return procurementHTML;
    };

    const generateSuppliesDetailsHTML = () => {
        if (!request || !request.supplies)
            return "<p>No product/services details available</p>";

        let suppliesHTML = `<div class="section-content" style="max-width: 100%; margin: 0;">`;

        // Add services table if available
        if (request.supplies?.services?.length > 0) {
            suppliesHTML += `
            <h2>Products and Services</h2>
            <div style="width: 100%;">
                <table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px;">
                    <thead>
                        <tr style="background-color: rgba(128, 194, 66, 0.1);">
                            <th style="padding: 6px; text-align: left; width: 13%; border: 1px solid #ddd;">Product Name</th>
                            <th style="padding: 6px; text-align: left; width: 22%; border: 1px solid #ddd;">Description</th>
                            <th style="padding: 6px; text-align: left; width: 13%; border: 1px solid #ddd;">Purpose</th>
                            <th style="padding: 6px; text-align: center; width: 8%; border: 1px solid #ddd;">Quantity</th>
                            <th style="padding: 6px; text-align: right; width: 10%; border: 1px solid #ddd;">Price</th>
                            <th style="padding: 6px; text-align: center; width: 7%; border: 1px solid #ddd;">Tax (%)</th>
                            <th style="padding: 6px; text-align: right; width: 12%; border: 1px solid #ddd;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${request.supplies.services
                            .map((service) => {
                                const quantity =
                                    parseFloat(service.quantity) || 0;
                                const price = parseFloat(service.price) || 0;
                                const tax = parseFloat(service.tax) || 0;
                                const total =
                                    quantity * price * (1 + tax / 100);

                                const truncateText = (text, maxLength = 60) => {
                                    if (!text) return "N/A";
                                    return text.length > maxLength
                                        ? text.substring(0, maxLength) + "..."
                                        : text;
                                };

                                return `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 6px; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; border: 1px solid #ddd;">
                                    ${
                                        truncateText(service.productName, 40) ||
                                        "N/A"
                                    }
                                </td>
                                <td style="padding: 6px; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; border: 1px solid #ddd;">
                                    ${
                                        truncateText(
                                            service.productDescription,
                                            80
                                        ) || "N/A"
                                    }
                                </td>
                                <td style="padding: 6px; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; border: 1px solid #ddd;">
                                    ${
                                        truncateText(
                                            service.productPurpose,
                                            40
                                        ) || "N/A"
                                    }
                                </td>
                                <td style="padding: 6px; text-align: center; border: 1px solid #ddd;">
                                    ${service.quantity}
                                </td>
                                <td style="padding: 6px; text-align: right; border: 1px solid #ddd;">
                                    ${formatCurrency(service.price)}
                                </td>
                                <td style="padding: 6px; text-align: center; border: 1px solid #ddd;">
                                    ${service.tax || "0"}
                                </td>
                                <td style="padding: 6px; text-align: right; font-weight: 600; border: 1px solid #ddd;">
                                    ${formatCurrency(total)}
                                </td>
                            </tr>
                            `;
                            })
                            .join("")}
                    </tbody>
                </table>
            </div>
            `;
        }

        // Add total value if available
        if (request.supplies?.totalValue !== undefined) {
            suppliesHTML += `
            <div style="margin-top: 20px; font-weight: bold; background-color: #eef7e6; border-left: 4px solid #80c242; padding: 10px;">
                <div style="color: #3d611f;">Total Value</div>
                <div style="font-size: 18px; color: #3d611f;">${formatCurrency(
                    request.supplies.totalValue
                )}</div>
            </div>
            `;
        }

        // Add remarks if available
        if (request.supplies?.remarks) {
            suppliesHTML += `
            <h2>Remarks</h2>
            <div style="padding: 10px; border: 1px solid #eee; background-color: #f9f9f9;">
                <p style="margin: 0;">${request.supplies.remarks}</p>
            </div>
            `;
        }

        suppliesHTML += "</div>";
        return suppliesHTML;
    };

    const generateComplianceDetailsHTML = () => {
        if (!request || !request.complinces)
            return "<p>No compliance details available</p>";

        let complianceHTML = `
          <div class="section-content">
            <h2>Compliance Answers</h2>
        `;

        if (Object.keys(request.complinces).length > 0) {
            complianceHTML += `<div style="display: grid; grid-template-columns: 1fr; gap: 20px;">`;

            Object.entries(request.complinces).forEach(
                ([questionId, compliance]) => {
                    const isCompliant =
                        compliance.expectedAnswer === compliance.answer;

                    complianceHTML += `
              <div style="padding: 18px; border-radius: 8px; ${
                  isCompliant
                      ? "background-color: #d1fae5; border: 1px solid #a7f3d0;"
                      : "background-color: #fee2e2; border: 1px solid #fecaca;"
              }">
                <h3 style="margin-top: 0; margin-bottom: 12px; ${
                    isCompliant ? "color: #065f46;" : "color: #b91c1c;"
                }">${compliance.question}</h3>
                <p style="font-weight: 600; ${
                    isCompliant ? "color: #047857;" : "color: #dc2626;"
                }; margin-bottom: 10px;">
                  ${compliance.answer ? "Yes" : "No"}
                </p>
                
                ${
                    compliance.department
                        ? `
                  <p style="margin-top: 12px; font-size: 14px; color: #4b5563;">
                    <strong>Department:</strong> ${compliance.department}
                  </p>
                `
                        : ""
                }
                
                ${
                    compliance.deviation && !isCompliant
                        ? `
                  <div style="margin-top: 15px; padding: 12px; background-color: #fef2f2; border-radius: 6px;">
                    <p style="margin: 0; font-size: 14px; color: #b91c1c;">
                      <strong>Deviation Reason:</strong> ${compliance.deviation.reason}
                    </p>
                  </div>
                `
                        : ""
                }
                
                ${
                    compliance?.deviation?.attachments?.length > 0
                        ? `
                  <div style="margin-top: 15px;">
                    <strong style="color: #b91c1c;">Attachments:</strong>
                    <ul style="margin-top: 8px; padding-left: 20px;">
                      ${compliance.deviation.attachments
                          .map(
                              (attachment, i) => `<li>Attachment ${i + 1}</li>`
                          )
                          .join("")}
                    </ul>
                  </div>
                `
                        : ""
                }
              </div>
            `;
                }
            );

            complianceHTML += "</div>";
        } else {
            complianceHTML += `
            <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
              <p style="color: #6b7280; margin: 0;">No compliance details available</p>
            </div>`;
        }

        complianceHTML += "</div>";
        return complianceHTML;
    };

    const generateApprovalLogsHTML = () => {
        if (!request || !request.approvals || request.approvals.length === 0) {
            return `
            <div class="section-content">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; background-color: #f9fafb; border-radius: 8px; text-align: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <p style="color: #6b7280; margin-top: 16px;">No approval logs available</p>
                </div>
            </div>`;
        }

        const calculateDuration = (startDate, endDate) => {
            if (!startDate || !endDate)
                return { days: "-", hours: "-", minutes: "-" };

            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffInMs = end - start;

            if (diffInMs < 0) return { days: "-", hours: "-", minutes: "-" };

            const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
                (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
            );

            return { days, hours, minutes };
        };

        const formatDuration = (duration) => {
            if (duration.days === "-") return "Pending";

            const parts = [];
            if (duration.days > 0) parts.push(`${duration.days}d`);
            if (duration.hours > 0) parts.push(`${duration.hours}h`);
            if (duration.minutes > 0) parts.push(`${duration.minutes}m`);

            return parts.length > 0 ? parts.join(" ") : "< 1m";
        };

        const getStatusStyle = (status) => {
            if (!status) return "background-color: #f0f0f0; color: #666;";

            switch (status.toLowerCase()) {
                case "approved":
                    return "background-color: #e6f7e6; color: #2c7a2c;";
                case "rejected":
                    return "background-color: #fde8e8; color: #c53030;";
                case "pending":
                    return "background-color: #f0f0f0; color: #666;";
                default:
                    return "background-color: #f0f0f0; color: #666;";
            }
        };

        const formatDateTime = (dateTimeStr) => {
            if (!dateTimeStr) return { date: "N/A", time: "N/A" };

            try {
                const date = new Date(dateTimeStr);
                return {
                    date: date.toLocaleDateString(undefined, {
                        month: "2-digit",
                        day: "2-digit",
                        year: "2-digit",
                    }),
                    time: date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                };
            } catch (e) {
                return { date: "N/A", time: "N/A" };
            }
        };

        const truncateText = (text, maxLength = 25) => {
            if (!text) return "N/A";
            return text.length > maxLength
                ? text.substring(0, maxLength) + "..."
                : text;
        };

        let logsHTML = `
        <div class="section-content" style="width: 100%;">
            <h2>Approval Timeline</h2>
            <div style="width: 100%; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px;">
                    <thead>
                        <tr style="background-color: rgba(128, 194, 66, 0.1);">
                            <th style="width: 5%; padding: 6px; border: 1px solid #ddd; text-align: center;">#</th>
                            <th style="width: 18%; padding: 6px; border: 1px solid #ddd; text-align: left;">Approver</th>
                            <th style="width: 18%; padding: 6px; border: 1px solid #ddd; text-align: left;">Status & Remarks</th>
                            <th style="width: 14%; padding: 6px; border: 1px solid #ddd; text-align: left;">Received On</th>
                            <th style="width: 14%; padding: 6px; border: 1px solid #ddd; text-align: left;">Updated On</th>
                            <th style="width: 12%; padding: 6px; border: 1px solid #ddd; text-align: center;">Turn Around</th>
                            <th style="width: 19%; padding: 6px; border: 1px solid #ddd; text-align: left;">Proceeded To</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        request.approvals.forEach((log, index) => {
            const receivedDateTime = formatDateTime(log.receivedOn);
            const approvalDateTime = formatDateTime(log.approvalDate);
            const duration = calculateDuration(
                log.receivedOn,
                log.approvalDate
            );
            const formattedDuration = formatDuration(duration);

            logsHTML += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${
                    index + 1
                }</td>
                <td style="padding: 6px; border: 1px solid #ddd; word-wrap: break-word; overflow-wrap: break-word;">
                    <div style="font-weight: 600;">${
                        truncateText(log.approverName, 20) || "N/A"
                    }</div>
                    <div style="font-size: 8px; color: #6b7280;">${
                        truncateText(log.departmentName, 20) || "N/A"
                    }</div>
                    <div style="font-size: 8px; color: #6b7280;">${
                        truncateText(log.approvalId, 18) || "N/A"
                    }</div>
                </td>
                <td style="padding: 6px; border: 1px solid #ddd; word-wrap: break-word; overflow-wrap: break-word;">
                    <div>
                        <span style="padding: 2px 6px; border-radius: 4px; font-size: 8px; font-weight: 600; ${getStatusStyle(
                            log.status
                        )}">${log.status || "Pending"}</span>
                        ${
                            log.remarks
                                ? `<div style="margin-top: 4px; padding: 3px; background-color: #f7f7f7; border-radius: 3px; font-size: 8px;">${truncateText(
                                      log.remarks,
                                      35
                                  )}</div>`
                                : ""
                        }
                    </div>
                </td>
                <td style="padding: 6px; border: 1px solid #ddd;">
                    <div style="font-weight: 500;">${
                        receivedDateTime.date
                    }</div>
                    <div style="font-size: 8px; color: #6b7280;">${
                        receivedDateTime.time
                    }</div>
                </td>
                <td style="padding: 6px; border: 1px solid #ddd;">
                    <div style="font-weight: 500;">${
                        approvalDateTime.date
                    }</div>
                    <div style="font-size: 8px; color: #6b7280;">${
                        approvalDateTime.time
                    }</div>
                </td>
                <td style="padding: 6px; border: 1px solid #ddd; text-align: center; font-weight: 500;">${formattedDuration}</td>
                <td style="padding: 6px; border: 1px solid #ddd; word-wrap: break-word; overflow-wrap: break-word;">${
                    truncateText(log.nextDepartment, 25) || "N/A"
                }</td>
            </tr>
            `;
        });

        logsHTML += `
                </tbody>
            </table>
            
            <div style="margin-top: 15px; font-size: 8px; color: #6b7280; font-style: italic; background-color: #f8f9fa; padding: 6px; border-radius: 4px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline; vertical-align: text-bottom; margin-right: 2px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Note: Turn Around Time includes non-working hours
            </div>
        </div>
        `;

        return logsHTML;
    };

    return {
        generateSectionHTML,
        generateCommercialDetailsHTML,
        generateProcurementDetailsHTML,
        generateSuppliesDetailsHTML,
        generateComplianceDetailsHTML,
        generateApprovalLogsHTML,
        formatCurrency,
        createInfoBox,
    };
};

export default HTMLSectionGenerator;
