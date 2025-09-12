import { useState } from 'react';
import { toast } from 'react-toastify';
import {
    addInvoiceDocument,
    addPODocument,
    releseReqStatus,
    sendReminder,
} from '../../../../../api/service/adminServices';
import uploadFiles from '../../../../../utils/s3BucketConfig';
import handleApprove from '../../handleApprove';

const useApprovalActions = (userId, role, email, department) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [loadingAction, setLoadingAction] = useState('');

    // Approval action handler
    const approveRequest = async (requestId, status, reason = '') => {
        setIsLoading(true);
        setLoadingAction(`${status.toLowerCase()}ing`);

        try {
            const response = await handleApprove(
                userId,
                role,
                requestId,
                status,
                email,
                reason
            );

            if (response.status === 200) {
                toast.success(response.data.message);
                return { success: true, message: response.data.message };
            } else if (response.status === 400) {
                toast.info(response.response.data.message);
                return { success: false, message: response.response.data.message };
            } else if (response.status === 401) {
                toast.info(response.response.data.message);
                return { success: false, message: response.response.data.message };
            }
        } catch (error) {
            console.error("Error in approving the request", error);
            const message = error.response?.data?.message || "Invalid workflow order";
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsLoading(false);
            setLoadingAction('');
        }
    };

    // Release request status
    const handleRelease = async (requestId, status) => {
        setIsLoading(true);
        setLoadingAction('releasing');

        try {
            const response = await releseReqStatus(
                status,
                department,
                userId,
                requestId,
                role,
                email
            );

            if (response.status === 200) {
                toast.success(response.data.message);
                return { success: true, message: response.data.message };
            } else {
                toast.error("Something went wrong");
                return { success: false, message: "Something went wrong" };
            }
        } catch (error) {
            console.error("Error:", error);
            const message = "An error occurred while processing your request";
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsLoading(false);
            setLoadingAction('');
        }
    };

    // Send reminder notification
    const sendReminderNotification = async (requestId) => {
        setIsLoading(true);
        setLoadingAction('sending reminder');

        try {
            const response = await sendReminder(requestId);

            if (response.status === 200) {
                toast.success("Notification sent successfully!");
                return { success: true, message: "Notification sent successfully!" };
            } else {
                toast.error("Failed to send notification.");
                return { success: false, message: "Failed to send notification." };
            }
        } catch (error) {
            console.error("Error:", error);
            const message = "An error occurred while sending the notification.";
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsLoading(false);
            setLoadingAction('');
        }
    };

    // Upload PO document
    const uploadPODocument = async (requestId, requestReqId, selectedFile,poNumber) => {
        if (!selectedFile) {
            toast.error("Please select a file to upload");
            return { success: false, message: "No file selected" };
        }

        setIsUploading(true);
        setLoadingAction('uploading PO');

        try {
            // Upload file to S3
            const uploadResponse = await uploadFiles(
                selectedFile,
                "PO-Documents",
                requestReqId,
            );

            if (!uploadResponse.data.fileUrls?.[0]) {
                throw new Error("File upload failed");
            }

            // Add PO document reference
            const response = await addPODocument(
                userId,
                requestId,
                uploadResponse.data.fileUrls[0],
                poNumber
            );

            if (response.status === 200) {
                toast.success(response.data.message);
                return { 
                    success: true, 
                    message: response.data.message,
                    fileUrl: uploadResponse.data.fileUrls[0]
                };
            } else {
                throw new Error("Failed to add PO document reference");
            }
        } catch (error) {
            console.error("PO upload error:", error);
            const message = error.message || "Failed to upload PO";
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsUploading(false);
            setLoadingAction('');
        }
    };

    // Upload Invoice document
    const uploadInvoiceDocument = async (requestId, requestReqId, selectedFile,invoiceNumber) => {
        if (!selectedFile) {
            toast.error("Please select a file to upload");
            return { success: false, message: "No file selected" };
        }

        setIsUploading(true);
        setLoadingAction('uploading invoice');

        try {
            // Upload file to S3
            const uploadResponse = await uploadFiles(
                selectedFile,
                "Invoice-Documents",
                requestReqId
            );

            if (!uploadResponse.data.fileUrls?.[0]) {
                throw new Error("File upload failed");
            }

            // Add invoice document reference
            const response = await addInvoiceDocument(
                userId,
                requestId,
                uploadResponse.data.fileUrls[0],
                invoiceNumber
            );

            if (response.status === 200) {
                toast.success(response.data.message);
                return { 
                    success: true, 
                    message: response.data.message,
                    fileUrl: uploadResponse.data.fileUrls[0]
                };
            } else {
                throw new Error("Failed to add invoice document reference");
            }
        } catch (error) {
            console.error("Invoice upload error:", error);
            const message = error.message || "Failed to upload invoice";
            toast.error(message);
            return { success: false, message };
        } finally {
            setIsUploading(false);
            setLoadingAction('');
        }
    };

    // PDF generation state management
    const setPDFGenerating = (isGenerating) => {
        setIsGeneratingPDF(isGenerating);
        if (isGenerating) {
            setLoadingAction('generating PDF');
        } else if (loadingAction === 'generating PDF') {
            setLoadingAction('');
        }
    };

    // Get current loading state description
    const getLoadingMessage = () => {
        const messages = {
            'approving': 'Approving request...',
            'rejecting': 'Rejecting request...',
            'holding': 'Putting request on hold...',
            'releasing': 'Releasing request...',
            'sending reminder': 'Sending reminder...',
            'uploading PO': 'Uploading PO document...',
            'uploading invoice': 'Uploading invoice document...',
            'generating PDF': 'Generating PDF...'
        };
        return messages[loadingAction] || 'Processing...';
    };

    // Check if any action is in progress
    const isAnyActionInProgress = isLoading || isUploading || isGeneratingPDF;

    return {
        // State
        isLoading,
        isUploading,
        isGeneratingPDF,
        loadingAction,
        isAnyActionInProgress,
        
        // Actions
        approveRequest,
        handleRelease,
        sendReminderNotification,
        uploadPODocument,
        uploadInvoiceDocument,
        
        // PDF generation helpers
        setPDFGenerating,
        
        // Utilities
        getLoadingMessage,
    };
};

export default useApprovalActions;