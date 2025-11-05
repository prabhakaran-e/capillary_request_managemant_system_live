import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Upload,
    FileText,
    Trash2,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Eye,
    Download,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import uploadFilesVendor from "../../../../utils/s3VendorUpload";
import { deletePOPolicy, getPOPolicy, savePOPolicy } from "../../../../api/service/adminServices";

const UploadPOPolicy = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [existingFile, setExistingFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchExistingFile();
    }, []);

    // Fetch existing file from backend
    const fetchExistingFile = async () => {
        setIsLoading(true);
        try {
            const response = await getPOPolicy();
            console.log(response);

            if (response.status === 200) {
                setExistingFile({
                    name: "po-policy-document.pdf",
                    url: response.data.policyFile,
                });
            } else {
                setExistingFile(null);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setExistingFile(null);
            } else {
                console.error("Error fetching file:", error);
                toast.error("Error loading existing policy");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                toast.error("Please select a PDF file");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                // 10MB limit
                toast.error("File size should be less than 10MB");
                return;
            }
            setSelectedFile(file);
        }
    };

    // Upload file using your API
    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file first");
            return;
        }

        setIsUploading(true);
        try {
            // Step 1: Upload file to S3 and get URL
            const uploadResponse = await uploadFilesVendor(selectedFile, "po-policy");
            console.log(uploadResponse);

            if (uploadResponse) {
                const fileUrl = uploadResponse.data.fileUrls[0]; // Get the first URL from the array

                // Step 2: Save the URL to your backend database
                const saveResponse = await savePOPolicy(fileUrl);

                if (saveResponse.status === 200) {
                    toast.success("PO Policy uploaded successfully!");
                    setSelectedFile(null);
                    await fetchExistingFile();
                } else {
                    toast.error("Failed to save policy URL");
                }
            } else {
                toast.error("Failed to upload file to S3");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    // Delete file
    const handleDelete = async () => {
        if (
            !window.confirm("Are you sure you want to delete this policy document?")
        ) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await deletePOPolicy();

            if (response.status === 200) {
                toast.success("PO Policy deleted successfully!");
                setExistingFile(null);
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete file. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    // View file
    const handleView = () => {
        if (existingFile?.url) {
            window.open(existingFile.url, "_blank");
        }
    };

    // Download file
    const handleDownload = () => {
        if (existingFile?.url) {
            const link = document.createElement("a");
            link.href = existingFile.url;
            link.download = existingFile.name;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate("/settings")}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Upload PO Policy
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Manage your purchase order policy document
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Existing File Section */}
                {isLoading ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <span className="ml-3 text-gray-600">Loading...</span>
                        </div>
                    </div>
                ) : existingFile ? (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Current Policy Document
                            </h2>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-600">Active</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-rose-100 p-3 rounded-lg">
                                        <FileText className="w-6 h-6 text-rose-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {existingFile.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Uploaded: {existingFile.uploadDate}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 flex-wrap gap-2">
                                    <button
                                        onClick={handleView}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>View</span>
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download</span>
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center space-x-3 text-amber-600">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm font-medium">
                                No policy document uploaded yet
                            </p>
                        </div>
                    </div>
                )}

                {/* Upload Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {existingFile
                            ? "Replace Policy Document"
                            : "Upload New Policy Document"}
                    </h2>

                    <div className="space-y-4">
                        {/* File Input */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
                            <input
                                type="file"
                                id="fileInput"
                                accept=".pdf,application/pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <label
                                htmlFor="fileInput"
                                className="cursor-pointer flex flex-col items-center"
                            >
                                <div className="bg-primary/10 p-4 rounded-full mb-4">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <p className="text-gray-700 font-medium mb-1">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-sm text-gray-500">
                                    PDF files only (Max 10MB)
                                </p>
                            </label>
                        </div>

                        {/* Selected File Preview */}
                        {selectedFile && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {isUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    <span>Upload Policy Document</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Info Section */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Guidelines:</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Only PDF files are accepted</li>
                            <li>• Maximum file size is 10MB</li>
                            <li>• Uploading a new file will replace the existing one</li>
                            <li>
                                • Make sure the document is properly formatted and readable
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default UploadPOPolicy;