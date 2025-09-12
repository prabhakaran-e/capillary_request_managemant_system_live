import React from 'react';
import { FileText, Download, Eye, Calendar, AlertCircle } from 'lucide-react';
import pfdIcon from '../../../assets/images/pdfIcon.png';

const UploadedFilesDisplay = ({ 
    uploadedFiles, 
    handleShowFile, 
    formatDateToDDMMYY,
    showAgreementDates = true,
    layout = "grid" // "grid" or "list"
}) => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
        return (
            <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-sm">No files uploaded</p>
            </div>
        );
    }

    // Transform the data structure - handle both urls array and agreement info
    const transformFileCategories = (uploadedFiles) => {
        return uploadedFiles.reduce((acc, fileGroup) => {
            Object.entries(fileGroup).forEach(([category, categoryData]) => {
                // Check if categoryData has urls property
                if (categoryData && categoryData.urls && Array.isArray(categoryData.urls)) {
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
    };

    const fileCategories = transformFileCategories(uploadedFiles);

    const renderAgreementDates = (categoryInfo) => {
        if (!showAgreementDates || (!categoryInfo.agreementValidFrom && !categoryInfo.agreementValidTo)) {
            return null;
        }

        const isExpired = categoryInfo.agreementValidTo && new Date(categoryInfo.agreementValidTo) < new Date();

        return (
            <div className={`mb-3 text-xs p-2 rounded-lg border ${
                isExpired 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
                <div className="flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">Agreement Validity</span>
                    {isExpired && <AlertCircle className="w-3 h-3 text-red-500" />}
                </div>
                
                {categoryInfo.agreementValidFrom && (
                    <div className="flex justify-between">
                        <span>From:</span>
                        <span className="font-medium">
                            {formatDateToDDMMYY(categoryInfo.agreementValidFrom)}
                        </span>
                    </div>
                )}
                
                {categoryInfo.agreementValidTo && (
                    <div className="flex justify-between">
                        <span>To:</span>
                        <span className={`font-medium ${isExpired ? 'text-red-600' : ''}`}>
                            {formatDateToDDMMYY(categoryInfo.agreementValidTo)}
                        </span>
                    </div>
                )}
                
                {isExpired && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                        ⚠️ Agreement Expired
                    </div>
                )}
            </div>
        );
    };

    const renderFileItem = (file, fileIndex, category) => (
        <div
            key={fileIndex}
            className="flex flex-col items-center bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors duration-200 group"
        >
            <button
                onClick={() => handleShowFile(file)}
                className="flex flex-col items-center text-center w-full"
            >
                <div className="relative mb-2">
                    <img
                        src={pfdIcon}
                        alt={`${category} file ${fileIndex + 1}`}
                        className="w-8 h-8 object-cover transition-transform duration-200 group-hover:scale-110"
                    />
                    <div className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {fileIndex + 1}
                    </div>
                </div>
                
                <span className="text-xs text-primary hover:text-blue-800 transition-colors duration-200 truncate max-w-full">
                    File {fileIndex + 1}
                </span>
                
                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Eye className="w-3 h-3" />
                    <span className="text-xs text-gray-600">View</span>
                </div>
            </button>
        </div>
    );

    const renderCategoryCard = ([category, categoryInfo], index) => (
        <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
            {/* Category Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b">
                <h4 className="text-sm font-semibold text-gray-800 capitalize flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    {category.replace(/_/g, " ")}
                </h4>
                
                {categoryInfo.files && categoryInfo.files.length > 0 && (
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                        {categoryInfo.files.length} file{categoryInfo.files.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Agreement Dates */}
            {renderAgreementDates(categoryInfo)}

            {/* Files Grid */}
            {categoryInfo.files && categoryInfo.files.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                    {categoryInfo.files.map((file, fileIndex) =>
                        renderFileItem(file, fileIndex, category)
                    )}
                </div>
            ) : (
                <div className="text-center py-4">
                    <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-gray-400 text-xs">No files available</p>
                </div>
            )}
        </div>
    );

    const renderListView = () => (
        <div className="space-y-4">
            {Object.entries(fileCategories).map(renderCategoryCard)}
        </div>
    );

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(fileCategories).map(renderCategoryCard)}
        </div>
    );

    return (
        <div className="uploaded-files-container">
            {/* Summary */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{Object.keys(fileCategories).length} categor{Object.keys(fileCategories).length > 1 ? 'ies' : 'y'}</span>
                    <span>
                        {Object.values(fileCategories).reduce((total, category) => 
                            total + (category.files ? category.files.length : 0), 0
                        )} total files
                    </span>
                </div>
            </div>

            {/* Files Display */}
            {layout === "list" ? renderListView() : renderGridView()}
        </div>
    );
};

export default UploadedFilesDisplay;