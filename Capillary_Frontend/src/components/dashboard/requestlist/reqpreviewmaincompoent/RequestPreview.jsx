import React from 'react';
import CommericalMainComponentSection from './CommericalMainComponentSection';
import ProcurementMainComponent from './ProcurementMainComponent';
import SuppliesMainComponent from './SuppliesMainComponent';
import CompliancesMainComponent from './CompliancesMainComponent';
import pfdIcon from "../../../../assets/images/pdfIcon.png"

const RequestPreview = ({ 
    request, 
    extractDateAndTime, 
    formatDateToDDMMYY,
    formatCurrency,
    openInfoModal,
    showFileUrl,
    
}) => {
    if (!request) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading request details...</p>
                </div>
            </div>
        );
    }

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

    const renderUploadedFiles = (uploadedFiles) => {
        if (!uploadedFiles || uploadedFiles.length === 0) {
            return null;
        }

        // Transform the data structure - handle both urls array and agreement info
        const fileCategories = uploadedFiles.reduce((acc, fileGroup) => {
            Object.entries(fileGroup).forEach(([category, categoryData]) => {
                // Check if categoryData has urls property (your data structure)
                if (
                    categoryData &&
                    categoryData.urls &&
                    Array.isArray(categoryData.urls)
                ) {
                    acc[category] = {
                        files: categoryData.urls,
                        agreementValidFrom: categoryData.agreementValidFrom,
                        agreementValidTo: categoryData.agreementValidTo,
                    };
                }
                // Fallback for direct array structure
                else if (Array.isArray(categoryData)) {
                    acc[category] = {
                        files: categoryData,
                        agreementValidFrom: null,
                        agreementValidTo: null,
                    };
                }
            });
            return acc;
        }, {});

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(fileCategories).map(
                    ([category, categoryInfo], index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-3 capitalize border-b pb-2">
                                {category.replace(/_/g, " ")}
                            </h4>

                            {/* Display agreement validity dates if available */}
                            {(categoryInfo.agreementValidFrom ||
                                categoryInfo.agreementValidTo) && (
                                <div className="mb-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                    {categoryInfo.agreementValidFrom && (
                                        <div>
                                            Valid From:{" "}
                                            {formatDateToDDMMYY(
                                                categoryInfo.agreementValidFrom
                                            )}
                                        </div>
                                    )}
                                    {categoryInfo.agreementValidTo && (
                                        <div>
                                            Valid To:{" "}
                                            {formatDateToDDMMYY(
                                                categoryInfo.agreementValidTo
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                                {categoryInfo.files &&
                                categoryInfo.files.length > 0 ? (
                                    categoryInfo.files.map(
                                        (file, fileIndex) => (
                                            <div
                                                key={fileIndex}
                                                className="flex flex-col items-center bg-gray-50 rounded p-2"
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleShowFile(file)
                                                    }
                                                    className="text-xs text-primary hover:text-blue-800 truncate max-w-full text-center"
                                                >
                                                    <img
                                                        src={pfdIcon}
                                                        alt={`${category} file ${
                                                            fileIndex + 1
                                                        }`}
                                                        className="w-10 h-10 object-cover mb-2"
                                                    />
                                                    <span className="block">
                                                        File {fileIndex + 1}
                                                    </span>
                                                </button>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <div className="col-span-3 text-center text-gray-500 text-xs">
                                        No files available
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8" id="request-preview-content">
            {/* Commercial Details Section */}
            <CommericalMainComponentSection
                request={request}
                extractDateAndTime={extractDateAndTime}
                handleShowFile={handleShowFile}
            />

            {/* Procurement Details Section */}
            <ProcurementMainComponent
                request={request}
                formatDateToDDMMYY={formatDateToDDMMYY}
                renderUploadedFiles={renderUploadedFiles}
            />

            {/* Product/Services Section */}
            <SuppliesMainComponent
                request={request}
                parseFloat={parseFloat}
                formatCurrency={formatCurrency}
            />

            {/* Compliance Details Section */}
            <CompliancesMainComponent
                request={request}
                openInfoModal={openInfoModal}
                handleShowFile={handleShowFile}
            />
        </div>
    );
};

export default RequestPreview;