import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import useRequestData from "./reqpreviewmaincompoent/hooks/useRequestData";
import useApprovalActions from "./reqpreviewmaincompoent/hooks/useApprovalActions";
import HTMLSectionGenerator from "./reqpreviewmaincompoent/HTMLSectionGenerator";
import PDFGenerator from "./reqpreviewmaincompoent/PDFGenerator";
import SectionNavigation from "./reqpreviewmaincompoent/SectionNavigation";
import RequestPreview from "./reqpreviewmaincompoent/RequestPreview";
import LoadingOverlay from "./reqpreviewmaincompoent/LoadingOverlay";
import ApprovalButtons from "./reqpreviewmaincompoent/ApprovalButton";
import ChatComments from "./ChatComments";
import RequestLogsTable from "./RequestLogs";
import DocumentsDisplay from "./DocumentsDisplay";
import ModalOption from "./reqpreviewmaincompoent/ModalOption";
import ReminderModal from "./reqpreviewmaincompoent/ReminderModal";
import SubmissionConfirmModal from "./reqpreviewmaincompoent/SubmissionConfirmModal";
import { extractDateAndTime } from "../../../utils/extractDateAndTime";
import { formatDateToDDMMYY } from "../../../utils/dateFormat";
import { showFileUrl, verifyUser } from "../../../api/service/adminServices";

const HodApproveRequest = () => {
    const navigate = useNavigate();
    const { hodEmail, reqId } = useParams();
    console.log(hodEmail, reqId)

    // User data state
    const [userInfo, setUserInfo] = useState(() => {
        // Initialize from localStorage if available
        return {
            userId: localStorage.getItem("capEmpId"),
            role: localStorage.getItem("role"),
            department: localStorage.getItem("department"),
            email: localStorage.getItem("email"),
        };
    });

    const [isInitialized, setIsInitialized] = useState(false);

    // Verify user and update data
    useEffect(() => {
        let isMounted = true;

        const verifyAndSetUser = async () => {
            try {
                const response = await verifyUser(hodEmail);
                if (response.status === 200 && isMounted) {
                    const userData = response?.data?.data;

                    // Set localStorage
                    localStorage.setItem("userId", userData?._id);
                    localStorage.setItem("role", userData?.role);
                    localStorage.setItem("user", JSON.stringify(userData));
                    localStorage.setItem("department", userData?.department);
                    localStorage.setItem("empAccessToken", response?.data?.token);
                    localStorage.setItem("capEmpId", userData?.employee_id);
                    localStorage.setItem("multiRole", response?.data?.multiRole);
                    localStorage.setItem("email", hodEmail);

                    // Update state
                    setUserInfo({
                        userId: userData?.employee_id,
                        role: userData?.role,
                        department: userData?.department,
                        email: userData?.email,
                    });

                    setIsInitialized(true);
                }
            } catch (error) {
                console.error("Error verifying user:", error);
                toast.error("Failed to verify user. Please try again.");
            }
        };

        if (hodEmail) {
            verifyAndSetUser();
        } else if (userInfo.userId) {
            // If hodEmail is not present but we have user data, we're initialized
            setIsInitialized(true);
        }

        return () => {
            isMounted = false;
        };
    }, [hodEmail]);

    // Custom hooks for data and actions - only initialize when user is verified
    const {
        request,
        currencies,
        reqLogs,
        isLoading: isDataLoading,
        isDisabled,
        canApprove,
        formatCurrency,
        refreshRequestData,
        updateRequestStatus,
    } = useRequestData(
        reqId,
        isInitialized ? userInfo.userId : null,
        isInitialized ? userInfo.role : null
    );

    const {
        isLoading,
        isUploading,
        isGeneratingPDF,
        isAnyActionInProgress,
        approveRequest,
        sendReminderNotification,
        uploadPODocument,
        uploadInvoiceDocument,
        setPDFGenerating,
        getLoadingMessage,
    } = useApprovalActions(
        isInitialized ? userInfo.userId : null,
        isInitialized ? userInfo.role : null,
        isInitialized ? userInfo.email : null,
        isInitialized ? userInfo.department : null
    );

    // Local component state
    const [activeSection, setActiveSection] = useState("preview");
    const [selectedImage, setSelectedImage] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [showSubmissionDialog, setSubmissionDialog] = useState(false);
    const [approveStatus, setApproveStatus] = useState();
    const [newStatus, setNewStatus] = useState();
    const [reason, setReason] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: "",
        description: "",
    });
    const [poNumber, setPONumber] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");

    // Modal handlers
    const openInfoModal = (question, description) => {
        setModalContent({
            title: question,
            description:
                description ||
                "No additional information available for this question.",
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // PDF Generation
    const { generateSectionHTML } = HTMLSectionGenerator({
        request,
        currencies,
    });

    const { handleGeneratePDF } = PDFGenerator({
        request,
        generateSectionHTML,
    });

    const handlePDFGeneration = async () => {
        setPDFGenerating(true);
        try {
            await handleGeneratePDF();
        } finally {
            setPDFGenerating(false);
        }
    };

    // Action handlers
    const handleStatus = (status) => {
        setApproveStatus(status);
        setNewStatus(status === "Approve" ? "Approved" : status);
        setSubmissionDialog(true);
    };

    const handleApprovalSubmit = async () => {
        const result = await approveRequest(reqId, approveStatus, reason);
        if (result.success) {
            updateRequestStatus(newStatus);
            setSubmissionDialog(false);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
        setSubmissionDialog(false);
    };

    const handleNotify = async () => {
        const result = await sendReminderNotification(request._id);
        if (result.success) {
            setShowDialog(false);
        }
    };

    const handleUploadPo = async (poNumber) => {
        const result = await uploadPODocument(
            reqId,
            request.reqid,
            selectedImage,
            poNumber
        );
        if (result.success) {
            navigate("/approval-request-list");
        }
    };

    const handleUploadInvoice = async (invoiceNumber) => {
        const result = await uploadInvoiceDocument(
            reqId,
            request.reqid,
            selectedImage,
            invoiceNumber
        );
        if (result.success) {
            navigate("/req-list-table");
        }
    };

    // Section content renderer
    const renderSectionContent = () => {
        if (!request) return null;

        switch (activeSection) {
            case "preview":
                return (
                    <RequestPreview
                        request={request}
                        extractDateAndTime={extractDateAndTime}
                        formatDateToDDMMYY={formatDateToDDMMYY}
                        formatCurrency={formatCurrency}
                        openInfoModal={openInfoModal}
                        showFileUrl={showFileUrl}
                    />
                );
            case "chat":
                return <ChatComments reqId={reqId} reqid={request.reqid} />;
            case "logs":
                return (
                    <RequestLogsTable
                        createdAt={request.createdAt}
                        logData={request.approvals}
                        reqLogs={reqLogs}
                    />
                );
            default:
                return null;
        }
    };

    // Loading state - only show if we're loading data, not during initialization
    if (!isInitialized || isDataLoading) {
        return (
            <LoadingOverlay
                isVisible={true}
                message="Loading request details..."
            />
        );
    }

    // Error state
    if (!request) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg text-gray-600 mb-4">
                        Request not found
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-primary text-white rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const needsReason = ["Hold", "Reject"].includes(approveStatus);

    return (
        <div className="flex flex-col bg-white min-h-screen">
            {/* Loading overlay for actions */}
            <LoadingOverlay
                isVisible={isAnyActionInProgress}
                message={getLoadingMessage()}
                variant={
                    isGeneratingPDF
                        ? "generating"
                        : isUploading
                            ? "uploading"
                            : "processing"
                }
            />

            {/* Header */}
            <div className="bg-primary text-white p-4 text-center shadow-md">
                <h1 className="text-2xl font-bold">Purchase Order Preview</h1>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="m-8">
                    <SectionNavigation
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    />
                </div>

                {/* Content with margin */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    <div className="mb-4">
                        {renderSectionContent()}
                    </div>
                    <DocumentsDisplay request={request} />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="m-8">
                <ApprovalButtons
                    request={request}
                    role={userInfo.role}
                    disable={isDisabled}
                    isLoading={isLoading}
                    isUploading={isUploading}
                    isGeneratingPDF={isGeneratingPDF}
                    selectedImage={selectedImage}
                    setSelectedImage={setSelectedImage}
                    setShowDialog={setShowDialog}
                    handleStatus={handleStatus}
                    handleUploadPo={handleUploadPo}
                    handleUploadInvoice={handleUploadInvoice}
                    handleGeneratePDF={handlePDFGeneration}
                />
            </div>

            {/* Modals */}
            {showDialog && (
                <ReminderModal
                    setShowDialog={setShowDialog}
                    handleNotify={handleNotify}
                />
            )}

            {showSubmissionDialog && (
                <SubmissionConfirmModal
                    approveStatus={approveStatus}
                    needsReason={needsReason}
                    setReason={setReason}
                    setSubmissionDialog={setSubmissionDialog}
                    approveRequest={handleApprovalSubmit}
                    reason={reason}
                    newStatus={newStatus}
                />
            )}

            {isModalOpen && (
                <ModalOption
                    closeModal={closeModal}
                    modalContent={modalContent}
                />
            )}

            {/* Toast Container */}
            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    );
};

export default HodApproveRequest;