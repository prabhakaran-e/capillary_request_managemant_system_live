import React, { useState } from "react";
import {
    CheckCircle2,
    XCircle,
    PauseCircle,
    Bell,
    Upload,
    FileText,
} from "lucide-react";
import FilePreview from "../FilePreview";

const ApprovalButtons = ({
    request,
    role,
    disable,
    isLoading,
    isUploading,
    isGeneratingPDF,
    selectedImage,
    setSelectedImage,
    setShowDialog,
    handleStatus,
    handleUploadPo,
    handleUploadInvoice,
    handleGeneratePDF,
}) => {
    const [poNumber, setPoNumber] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");

    const renderNudgeButton = () => {
        if (request.status === "Approved") return <div></div>;

        return (
            <button
                onClick={() => setShowDialog(true)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium text-xs sm:text-sm shadow-sm active:scale-95 transform"
            >
                <Bell size={14} className="sm:w-4 sm:h-4 animate-bounce" />
                <span className="hidden sm:inline">Nudge</span>
                <span className="sm:hidden">N</span>
            </button>
        );
    };

    const renderApprovalActions = () => {
        if (role === "Employee" || disable) return null;

        const getActionButtons = (status) => {
            const buttonConfig = {
                Pending: [
                    {
                        action: "Reject",
                        icon: XCircle,
                        color: "bg-red-600",
                        label: "Reject",
                        shortLabel: "R",
                    },
                    {
                        action: "Hold",
                        icon: PauseCircle,
                        color: "bg-yellow-600",
                        label: "Hold",
                        shortLabel: "H",
                    },
                    {
                        action: "Approved",
                        icon: CheckCircle2,
                        color: "bg-green-600",
                        label: "Approve",
                        shortLabel: "A",
                    },
                ],
                Hold: [
                    {
                        action: "Reject",
                        icon: XCircle,
                        color: "bg-red-600",
                        label: "Reject",
                        shortLabel: "R",
                    },
                    {
                        action: "Approved",
                        icon: CheckCircle2,
                        color: "bg-green-600",
                        label: "Approve",
                        shortLabel: "A",
                    },
                ],
                Rejected: [
                    {
                        action: "Hold",
                        icon: PauseCircle,
                        color: "bg-yellow-600",
                        label: "Hold",
                        shortLabel: "H",
                    },
                    {
                        action: "Approved",
                        icon: CheckCircle2,
                        color: "bg-green-600",
                        label: "Approve",
                        shortLabel: "A",
                    },
                ],
            };

            return buttonConfig[status] || [];
        };

        const buttons = getActionButtons(request.status);

        if (buttons.length === 0) return null;

        return (
            <div className="flex space-x-2 sm:space-x-4">
                {buttons.map(
                    ({ action, icon: Icon, color, label, shortLabel }) => (
                        <button
                            key={action}
                            onClick={() => handleStatus(action)}
                            disabled={isLoading}
                            className={`px-3 sm:px-6 py-2 rounded-lg flex items-center ${color} text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm`}
                        >
                            <Icon className="mr-1 sm:mr-2" size={14} />
                            <span className="hidden sm:inline">{label}</span>
                            <span className="sm:hidden">{shortLabel}</span>
                        </button>
                    )
                )}
            </div>
        );
    };

    const renderPOUploadSection = () => {
        const shouldShowPOSection =
            (request.status === "PO-Pending" ||
                request.status === "Approved") &&
            role === "Head of Finance";

        if (!shouldShowPOSection) return null;

        const handlePOSubmit = () => {
            if (!poNumber.trim()) {
                alert("Please enter PO number");
                return;
            }
            handleUploadPo(poNumber.trim());
        };

        return (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full space-y-4 lg:space-y-0">
                <div className="flex justify-start">
                    <button
                        onClick={handleGeneratePDF}
                        disabled={isGeneratingPDF}
                        className="flex items-center px-3 sm:px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors text-xs sm:text-sm"
                    >
                        {isGeneratingPDF ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                <span className="hidden sm:inline">
                                    Generating PDF...
                                </span>
                                <span className="sm:hidden">Gen...</span>
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                </svg>
                                <span className="hidden sm:inline">
                                    Download PDF
                                </span>
                                <span className="sm:hidden">PDF</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full lg:w-auto">
                    <div className="order-1 sm:order-none">
                        <FilePreview
                            selectedFile={selectedImage}
                            onClear={() => setSelectedImage(null)}
                        />
                    </div>

                    <input
                        type="text"
                        placeholder="Enter PO Number"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-auto"
                    />

                    <label className="flex items-center justify-center px-4 sm:px-6 py-2 rounded-lg border border-gray-300 cursor-pointer bg-white hover:bg-gray-50 w-full sm:w-auto">
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-1 sm:mr-2" />
                        <span className="text-xs sm:text-sm text-gray-600">
                            <span className="hidden sm:inline">Select PO</span>
                            <span className="sm:hidden">PO File</span>
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf,application/pdf"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setSelectedImage(file);
                                }
                            }}
                        />
                    </label>

                    <button
                        onClick={handlePOSubmit}
                        disabled={
                            !selectedImage || !poNumber.trim() || isUploading
                        }
                        className="px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-full sm:w-auto"
                    >
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                        {isUploading ? (
                            <>
                                <span className="hidden sm:inline">
                                    Uploading...
                                </span>
                                <span className="sm:hidden">Up...</span>
                            </>
                        ) : (
                            "Submit"
                        )}
                    </button>
                </div>
            </div>
        );
    };

    const renderInvoiceUploadSection = () => {
        const shouldShowInvoiceSection =
            (request.status === "Invoice-Pending" ||
                request.status === "Approved") &&
            (role === "Employee" ||
                role === "HOD Department" ||
                role === "Admin");

        if (!shouldShowInvoiceSection) return null;

        const handleInvoiceSubmit = () => {
            if (!invoiceNumber.trim()) {
                alert("Please enter Invoice number");
                return;
            }
            handleUploadInvoice(invoiceNumber.trim());
        };

        return (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full">
                <div className="order-1 sm:order-none">
                    <FilePreview
                        selectedFile={selectedImage}
                        onClear={() => setSelectedImage(null)}
                    />
                </div>

                <input
                    type="text"
                    placeholder="Enter Invoice Number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-auto"
                />

                <label className="flex items-center justify-center px-4 sm:px-6 py-2 rounded-lg border border-gray-300 cursor-pointer bg-white hover:bg-gray-50 w-full sm:w-auto">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm text-gray-600">
                        <span className="hidden sm:inline">Select Invoice</span>
                        <span className="sm:hidden">Invoice File</span>
                    </span>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,application/pdf"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                setSelectedImage(file);
                            }
                        }}
                    />
                </label>

                <button
                    onClick={handleInvoiceSubmit}
                    disabled={
                        !selectedImage || !invoiceNumber.trim() || isUploading
                    }
                    className="px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-full sm:w-auto"
                >
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    {isUploading ? (
                        <>
                            <span className="hidden sm:inline">
                                Uploading...
                            </span>
                            <span className="sm:hidden">Up...</span>
                        </>
                    ) : (
                        "Submit"
                    )}
                </button>
            </div>
        );
    };

    return (
        <div className="bg-white p-3 sm:p-4 flex flex-col lg:flex-row lg:justify-between lg:items-center border-t shadow-md space-y-3 lg:space-y-0">
            <div className="flex justify-between items-center lg:justify-start">
                {renderNudgeButton()}
                {renderApprovalActions()}
            </div>
            {renderPOUploadSection()}
            <div className="lg:ml-auto">{renderInvoiceUploadSection()}</div>
        </div>
    );
};

export default ApprovalButtons;
