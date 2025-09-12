import { CheckCircle2 } from "lucide-react";
import React from "react";

const ProcurementMainComponent = ({request,formatDateToDDMMYY,renderUploadedFiles}) => {
    console.log("request",request)
    return (
        <div className="p-5 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-3">
                Procurement Details
            </h2>

            {request.procurements &&
                Object.values(request.procurements).some((value) => value) && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            {
                                label: "Vendor ID",
                                value: request.procurements.vendor,
                            },
                            {
                                label: "Vendor Name",
                                value: request.procurements.vendorName,
                            },
                            {
                                label: "Quotation Number",
                                value: request.procurements.quotationNumber,
                            },
                            {
                                label: "Quotation Date",
                                value: request.procurements.quotationDate
                                    ? formatDateToDDMMYY(
                                          request.procurements.quotationDate
                                      )
                                    : null,
                            },
                            {
                                label: "Service Period",
                                value: request.procurements.servicePeriod,
                            },
                            {
                                label: "PO Valid From",
                                value: request.procurements.poValidFrom
                                    ? formatDateToDDMMYY(
                                          request.procurements.poValidFrom
                                      )
                                    : null,
                            },
                            {
                                label: "PO Valid To",
                                value: request.procurements.poValidTo
                                    ? formatDateToDDMMYY(
                                          request.procurements.poValidTo
                                      )
                                    : null,
                            },
                        ]
                            .filter((item) => item.value) // Ensures only non-empty values are displayed
                            .map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <span className="text-gray-600 font-medium">
                                        {item.label}
                                    </span>
                                    <span className="text-gray-800 font-semibold">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                    </div>
                )}

            {request.procurements?.uploadedFiles && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold text-primary mb-4">
                        Uploaded Files
                    </h3>
                    <div className="bg-white shadow-md rounded-lg p-4">
                        {Object.keys(request.procurements.uploadedFiles)
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
                        {renderUploadedFiles(
                            request.procurements.uploadedFiles
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcurementMainComponent;
