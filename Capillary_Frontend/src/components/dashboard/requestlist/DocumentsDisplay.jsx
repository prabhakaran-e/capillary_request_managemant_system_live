import { FaFilePdf } from "react-icons/fa";
import { formatDateToDDMMYY } from "../../../utils/dateFormat";
import { showFileUrl } from "../../../api/service/adminServices.js";

const DocumentsDisplay = ({ request }) => {
    const showDocuments = ["Invoice-Pending", "Approved"].includes(
        request.status
    );

    const getCleanFileName = (url) => {
        try {
            let fileName = url.split("/").pop();
            fileName = fileName.split("?")[0];
            fileName = decodeURIComponent(fileName);
            fileName = fileName
                .replace(/[-_]/g, " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
            return fileName.replace(/\.[^/.]+$/, "");
        } catch (error) {
            console.error("Error parsing filename:", error);
            return "Document";
        }
    };

    const handleShowFile = async (fileUrl) => {
        try {
            const response = await showFileUrl(fileUrl);
            if (response.status === 200) {
                window.open(response.data.presignedUrl, "_blank");
            } else {
                console.error("No presigned URL received");
            }
        } catch (error) {
            console.error("Error fetching presigned URL:", error);
        }
    };

    if (!showDocuments) return null;

    const DocumentCard = ({ title, documents, isPO = false }) => (
        <div className="bg-white rounded-xl shadow-md overflow-hidden w-full">
            <div className="bg-primary/10 px-3 sm:px-6 py-3 sm:py-4">
                <h3 className="text-lg sm:text-xl font-semibold text-primary">
                    {title}
                </h3>
            </div>
            <div className="p-3 sm:p-6">
                {isPO ? (
                    documents?.poLink ? (
                        <DocumentItem
                            link={documents.poLink}
                            poNumber={documents.poNumber}
                            uploadInfo={documents.uploadedBy}
                            uploadDate={documents.uploadedOn}
                        />
                    ) : (
                        <p className="text-gray-500 italic text-sm sm:text-base">
                            No PO documents available
                        </p>
                    )
                ) : documents?.length > 0 ? (
                    <div className="space-y-4 sm:space-y-6">
                        {documents.map((doc, index) => (
                            <DocumentItem
                                key={index}
                                link={doc.uploadedBy.invoiceLink}
                                uploadInfo={doc.uploadedBy}
                                uploadDate={doc.uploadedOn}
                                showDivider={index !== documents.length - 1}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic text-sm sm:text-base">
                        No invoice documents available
                    </p>
                )}
            </div>
        </div>
    );

    const DocumentItem = ({
        link,
        poNumber,
        uploadInfo,
        uploadDate,
        showDivider = false,
    }) => (
        <div className={`${showDivider ? "border-b pb-4 sm:pb-6" : ""}`}>
            <div
                onClick={() => handleShowFile(link)}
                className="group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            >
                <div className="p-1.5 sm:p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors flex-shrink-0">
                    <FaFilePdf className="text-red-500 text-lg sm:text-xl" />
                </div>
                <span className="text-gray-700 font-medium group-hover:text-primary transition-colors text-sm sm:text-base truncate">
                    {getCleanFileName(link)}
                </span>
            </div>
            <div className="mt-2 sm:mt-3 px-2 sm:px-4 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-600 font-medium text-xs sm:text-sm">
                        {uploadInfo.docType === "Invoice"
                            ? "Invoice Number:"
                            : "PO Number:"}
                    </span>
                    <span className="text-gray-700 text-xs sm:text-sm break-all">
                        {uploadInfo.docType === "Invoice"
                            ? uploadInfo.invoiceNumber
                            : poNumber}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-600 font-medium text-xs sm:text-sm">
                        Uploaded by:
                    </span>
                    <span className="text-gray-700 text-xs sm:text-sm">
                        {uploadInfo.empName}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-600 font-medium text-xs sm:text-sm">
                        Department:
                    </span>
                    <span className="text-gray-700 text-xs sm:text-sm">
                        {uploadInfo.department}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-gray-600 font-medium text-xs sm:text-sm">
                        Date:
                    </span>
                    <span className="text-gray-700 text-xs sm:text-sm">
                        {formatDateToDDMMYY(uploadInfo.uploadedOn)}
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 sm:space-y-8 px-2 sm:px-0">
            <div className="border-b pb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-primary">
                    Documents
                </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <DocumentCard
                    title="Purchase Order Document"
                    documents={request.poDocuments}
                    isPO={true}
                />
                <DocumentCard
                    title="Invoice Documents"
                    documents={request.invoiceDocumets}
                />
            </div>
        </div>
    );
};

export default DocumentsDisplay;
