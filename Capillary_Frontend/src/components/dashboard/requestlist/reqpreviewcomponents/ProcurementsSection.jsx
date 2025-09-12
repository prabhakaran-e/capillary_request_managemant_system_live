import { CheckCircle2, Package } from "lucide-react";
import React from "react";

const ProcurementsSection = ({
    formData,
    formatDateToDDMMYY,
    renderUploadedFiles,
}) => {
    return (
        <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
            <div className="flex items-center space-x-2 text-primary">
                <Package size={24} />
                <h2 className="text-xl sm:text-2xl font-bold border-b pb-3">
                    Procurements Details
                </h2>
            </div>

            {formData.procurements &&
                Object.values(formData.procurements).some((value) => value) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {
                                label: "Client Name",
                                value: formData.procurements.clientName,
                            },
                            {
                                label: "Project Code",
                                value: formData.procurements.projectCode,
                            },
                            {
                                label: "Vendor ID",
                                value: formData.procurements.vendor,
                            },
                            {
                                label: "Vendor Name",
                                value: formData.procurements.vendorName,
                            },
                            {
                                label: "Quotation Number",
                                value: formData.procurements.quotationNumber,
                            },
                            {
                                label: "Quotation Date",
                                value: formData.procurements.quotationDate
                                    ? formatDateToDDMMYY(
                                          formData.procurements.quotationDate
                                      )
                                    : null,
                            },
                            {
                                label: "Service Period",
                                value: formData.procurements.servicePeriod,
                            },
                            {
                                label: "PO Valid From",
                                value: formData.procurements.poValidFrom
                                    ? formatDateToDDMMYY(
                                          formData.procurements.poValidFrom
                                      )
                                    : null,
                            },
                            {
                                label: "PO Valid To",
                                value: formData.procurements.poValidTo
                                    ? formatDateToDDMMYY(
                                          formData.procurements.poValidTo
                                      )
                                    : null,
                            },
                        ]
                            .filter((item) => item.value)
                            .map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row sm:justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <span className="text-gray-600 font-medium mb-1 sm:mb-0">
                                        {item.label}
                                    </span>
                                    <span className="text-gray-800 font-semibold">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                    </div>
                )}

            {/* Uploaded Files Section - Show agreement dates with each PDF */}
            {formData.procurements?.uploadedFiles && (
                <div className="mt-4 sm:mt-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-4">
                        Uploaded Files
                    </h3>
                    <div className="bg-white shadow-md rounded-lg p-4">
                        {Object.keys(formData.procurements.uploadedFiles)
                            .length > 0 ? (
                            <div className="text-green-600 flex items-center mb-4">
                                <CheckCircle2 className="mr-2" size={20} />
                                Files uploaded successfully
                            </div>
                        ) : (
                            <div className="text-gray-500 flex items-center">
                                No files uploaded
                            </div>
                        )}

                        {/* Custom file rendering with agreement dates for each PDF */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(
                                formData.procurements.uploadedFiles
                            ).map(
                                ([key, fileData]) =>
                                    fileData?.urls &&
                                    fileData.urls.length > 0 && (
                                        <div
                                            key={key}
                                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                        >
                                            <h4 className="text-sm font-semibold text-gray-800 mb-3 capitalize border-b pb-2">
                                                {key
                                                    .replace(/([A-Z])/g, " $1")
                                                    .toLowerCase()}
                                            </h4>

                                            {/* PDF Files */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                                                {fileData.urls.map(
                                                    (fileUrl, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex flex-col items-center bg-gray-50 rounded p-2"
                                                        >
                                                            <a
                                                                href={fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-600 hover:text-blue-800 truncate max-w-full text-center"
                                                            >
                                                                <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center mb-2">
                                                                    <span className="text-red-600 text-xs font-bold">
                                                                        PDF
                                                                    </span>
                                                                </div>
                                                                <span className="block text-xs">
                                                                    File{" "}
                                                                    {index + 1}
                                                                </span>
                                                            </a>
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            {/* Agreement Dates for this file type */}
                                            {(fileData.agreementValidFrom ||
                                                fileData.agreementValidTo) && (
                                                <div className="border-t pt-3 mt-3">
                                                    <h5 className="text-xs font-medium text-gray-700 mb-2">
                                                        Agreement Validity
                                                    </h5>
                                                    <div className="space-y-2">
                                                        {fileData.agreementValidFrom && (
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-600">
                                                                    Valid From:
                                                                </span>
                                                                <span className="text-gray-800 font-medium">
                                                                    {formatDateToDDMMYY(
                                                                        fileData.agreementValidFrom
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {fileData.agreementValidTo && (
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-600">
                                                                    Valid To:
                                                                </span>
                                                                <span className="text-gray-800 font-medium">
                                                                    {formatDateToDDMMYY(
                                                                        fileData.agreementValidTo
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcurementsSection;
