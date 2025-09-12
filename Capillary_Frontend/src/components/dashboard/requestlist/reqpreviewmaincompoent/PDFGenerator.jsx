import React from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "react-toastify";
import { extractDateAndTime } from "../../../../utils/extractDateAndTime";

const PDFGenerator = ({ request, generateSectionHTML }) => {
    const handleGeneratePDF = async () => {
        if (!request) return;

        try {
            // Define margins (in mm)
            const margin = 15;

            // Create a PDF document
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true,
            });

            // Get page dimensions
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pdfWidth - margin * 2;
            const contentHeight = pdfHeight - margin * 2;

            // Define sections to be on separate pages
            const sections = [
                { id: "commercial-details", title: "Commercial Details" },
                { id: "procurement-details", title: "Procurement Details" },
                { id: "supplies-details", title: "Product/Services Details" },
                { id: "compliance-details", title: "Compliance Details" },
                { id: "approval-logs", title: "Approval Logs" },
            ];

            // Create a temporary container for the content
            const tempContainer = document.createElement("div");
            tempContainer.style.position = "absolute";
            tempContainer.style.left = "-9999px";
            tempContainer.style.width = contentWidth * 3.779528 + "px"; // Convert mm to px (1mm ≈ 3.779528px)
            tempContainer.style.padding = "0";
            tempContainer.style.boxSizing = "border-box";
            tempContainer.style.fontSize = "10px"; // Set a base font size
            document.body.appendChild(tempContainer);

            // Generate cover page
            generateCoverPage(pdf, request, pdfWidth, pdfHeight, margin);

            // Generate each section on a separate page
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];

                // Add a new page for each section
                pdf.addPage();

                // Add section header with styling
                addSectionHeader(pdf, section.title, pdfWidth, margin);

                // Reset text color for content
                pdf.setTextColor(0, 0, 0);

                // Create content for this section
                tempContainer.innerHTML = "";

                // Special handling for supplies-details section
                if (section.id === "supplies-details") {
                    // Adjust container width specifically for table
                    tempContainer.style.width = contentWidth * 3.779528 + "px";

                    // Custom styling for the supplies section table
                    const customStyle = document.createElement("style");
                    customStyle.textContent = `
                        table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px; }
                        th, td { border: 1px solid #ddd; padding: 4px; overflow: hidden; text-overflow: ellipsis; }
                        th { background-color: rgba(128, 194, 66, 0.1); }
                        td { word-break: break-word; }
                    `;
                    tempContainer.appendChild(customStyle);
                }

                tempContainer.innerHTML += generateSectionHTML(
                    section.id,
                    section.title
                );

                // Find any tables in this section and adjust them
                const tables = tempContainer.querySelectorAll("table");
                tables.forEach((table) => {
                    table.style.fontSize = "9px";
                    table.style.width = "100%";
                    table.style.tableLayout = "fixed";

                    // Adjust cell content to prevent overflow
                    const cells = table.querySelectorAll("td");
                    cells.forEach((cell) => {
                        cell.style.maxWidth = "100%";
                        cell.style.overflow = "hidden";
                        cell.style.textOverflow = "ellipsis";
                        cell.style.wordWrap = "break-word";
                    });
                });

                // Convert this section to canvas with a higher resolution
                const canvas = await html2canvas(tempContainer, {
                    scale: 3, // Higher scale for better quality
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: "#ffffff",
                    logging: false,
                    letterRendering: true,
                });

                // Calculate scaling ratio to fit within content area
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(
                    contentWidth / (imgWidth / 3), // Compensate for the higher scale
                    (contentHeight - 30) / (imgHeight / 3) // Subtract header height
                );

                // Add the image to the PDF with proper scaling
                const imgData = canvas.toDataURL("image/jpeg", 1.0);
                pdf.addImage(
                    imgData,
                    "JPEG",
                    margin,
                    margin + 20, // Add content below the header
                    (imgWidth / 3) * ratio,
                    (imgHeight / 3) * ratio
                );

                // Add page number and footer
                addPageFooter(
                    pdf,
                    i + 2,
                    sections.length + 1,
                    pdfWidth,
                    pdfHeight,
                    margin
                );
            }

            // Download the PDF
            pdf.save(
                `Request_${request.reqid || "Details"}_${new Date()
                    .toISOString()
                    .slice(0, 10)}.pdf`
            );

            // Clean up
            document.body.removeChild(tempContainer);

            // Show success message
            if (toast?.success) {
                toast.success("PDF generated successfully");
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            if (toast?.error) {
                toast.error("Error generating PDF");
            }
        }
    };

    const generateCoverPage = (pdf, request, pdfWidth, pdfHeight, margin) => {
        // Cover page content (Center alignment for requestor information)
        const centerX = pdfWidth / 2;
        const startY = pdfHeight / 2 - 40;

        // Title (if available)
        if (request.title) {
            pdf.setFontSize(18);
            pdf.setFont("helvetica", "bold");
            const titleWidth =
                (pdf.getStringUnitWidth(request.title) * 18) /
                pdf.internal.scaleFactor;
            pdf.text(request.title, centerX - titleWidth / 2, startY);
        }

        // Requestor Information (all centered)
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Requestor Information", centerX, startY + 25, {
            align: "center",
        });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);

        // Request ID (centered)
        const reqIdText = `Request ID: ${request.reqid || "N/A"}`;
        pdf.text(reqIdText, centerX, startY + 40, { align: "center" });

        // Created At (centered)
        const createdAtText = `Created At: ${
            extractDateAndTime(request.createdAt) || "N/A"
        }`;
        pdf.text(createdAtText, centerX, startY + 55, { align: "center" });

        // Requestor ID (centered)
        const requestorIdText = `Requestor ID: ${request.userId || "N/A"}`;
        pdf.text(requestorIdText, centerX, startY + 70, {
            align: "center",
        });

        // Requestor Name (centered)
        const requestorNameText = `Requestor: ${request.userName || "N/A"}`;
        pdf.text(requestorNameText, centerX, startY + 80, {
            align: "center",
        });

        // Add page footer
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(
            `Generated: ${new Date().toLocaleDateString()}`,
            centerX,
            pdfHeight - margin,
            { align: "center" }
        );

        // Add divider line above footer
        pdf.setDrawColor(128, 194, 66);
        pdf.setLineWidth(0.5);
        pdf.line(
            margin,
            pdfHeight - margin - 10,
            pdfWidth - margin,
            pdfHeight - margin - 10
        );
    };

    const addSectionHeader = (pdf, title, pdfWidth, margin) => {
        pdf.setFillColor(128, 194, 66);
        pdf.rect(0, 0, pdfWidth, 25, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.setTextColor(255, 255, 255);
        pdf.text(title, margin, margin);
    };

    const addPageFooter = (
        pdf,
        currentPage,
        totalPages,
        pdfWidth,
        pdfHeight,
        margin
    ) => {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(
            `Page ${currentPage} of ${totalPages}`,
            pdfWidth - margin - 30,
            pdfHeight - margin
        );

        // Add divider line above footer
        pdf.setDrawColor(128, 194, 66);
        pdf.setLineWidth(0.5);
        pdf.line(
            margin,
            pdfHeight - margin - 10,
            pdfWidth - margin,
            pdfHeight - margin - 10
        );
    };

    return { handleGeneratePDF };
};

export default PDFGenerator;
