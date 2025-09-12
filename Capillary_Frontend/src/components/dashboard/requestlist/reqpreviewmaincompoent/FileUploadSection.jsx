import React, { useRef, useState } from "react";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import FilePreview from "./FilePreview";

const FileUploadSection = ({
    selectedFile,
    setSelectedFile,
    isUploading = false,
    uploadType = "PO", // "PO" or "Invoice"
    onUpload,
    acceptedTypes = "image/*,.pdf,application/pdf",
    maxSize = 10 * 1024 * 1024, // 10MB default
    disabled = false,
    showPreview = true,
    className = "",
}) => {
    const fileInputRef = useRef(null);
    const [documentNumber, setDocumentNumber] = useState("");

    const getUploadConfig = (type) => {
        const configs = {
            PO: {
                label: "Select PO",
                buttonText: "Submit PO",
                description: "Upload Purchase Order document",
                icon: FileText,
                numberPlaceholder: "Enter PO Number",
            },
            Invoice: {
                label: "Select Invoice",
                buttonText: "Submit Invoice",
                description: "Upload Invoice document",
                icon: FileText,
                numberPlaceholder: "Enter Invoice Number",
            },
        };
        return configs[type] || configs.PO;
    };

    const config = getUploadConfig(uploadType);
    const Icon = config.icon;

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const validateFile = (file) => {
        const errors = [];

        if (file.size > maxSize) {
            errors.push(`File size exceeds ${formatFileSize(maxSize)}`);
        }

        const allowedTypes = acceptedTypes
            .split(",")
            .map((type) => type.trim());
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();
        const mimeType = file.type;

        const isValidType = allowedTypes.some(
            (type) =>
                type === mimeType ||
                (type.startsWith(".") && type === fileExtension) ||
                (type.includes("*") && mimeType.startsWith(type.split("*")[0]))
        );

        if (!isValidType) {
            errors.push("File type not supported");
        }

        return errors;
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const validationErrors = validateFile(file);

        if (validationErrors.length > 0) {
            alert(`File validation failed:\n${validationErrors.join("\n")}`);
            event.target.value = "";
            return;
        }

        setSelectedFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (disabled || isUploading) return;

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const validationErrors = validateFile(file);

            if (validationErrors.length > 0) {
                alert(
                    `File validation failed:\n${validationErrors.join("\n")}`
                );
                return;
            }

            setSelectedFile(file);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleUploadClick = () => {
        if (!documentNumber.trim()) {
            alert(`Please enter ${uploadType} number`);
            return;
        }
        onUpload(documentNumber.trim());
    };

    return (
        <div className={`file-upload-section ${className}`}>
            <div className="flex items-center gap-4">
                {/* File Preview */}
                {showPreview && selectedFile && (
                    <div className="flex-shrink-0">
                        <FilePreview
                            selectedFile={selectedFile}
                            onClear={clearFile}
                        />
                    </div>
                )}

                {/* Document Number Input */}
                <div className="flex-shrink-0">
                    <input
                        type="text"
                        placeholder={config.numberPlaceholder}
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        disabled={disabled || isUploading}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Upload Area */}
                <div
                    className={`
                        flex-1 border-2 border-dashed rounded-lg p-4 transition-all duration-200
                        ${
                            disabled || isUploading
                                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                                : "border-gray-300 hover:border-primary hover:bg-gray-50 cursor-pointer"
                        }
                        ${selectedFile ? "border-green-300 bg-green-50" : ""}
                    `}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={
                        !disabled && !isUploading
                            ? triggerFileSelect
                            : undefined
                    }
                >
                    <div className="flex items-center justify-center">
                        {selectedFile ? (
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-green-800 truncate">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-green-600">
                                        {formatFileSize(selectedFile.size)} •
                                        Ready to upload
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearFile();
                                    }}
                                    className="p-1 hover:bg-white rounded-full transition-colors"
                                    disabled={isUploading}
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 mb-1">
                                    {config.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Click or drag & drop files here
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Max size: {formatFileSize(maxSize)}
                                </p>
                            </div>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={acceptedTypes}
                        onChange={handleFileSelect}
                        disabled={disabled || isUploading}
                    />
                </div>

                {/* Upload Button */}
                <div className="flex-shrink-0">
                    <button
                        onClick={handleUploadClick}
                        disabled={
                            !selectedFile ||
                            !documentNumber.trim() ||
                            isUploading ||
                            disabled
                        }
                        className={`
                            px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-all duration-200
                            ${
                                !selectedFile ||
                                !documentNumber.trim() ||
                                isUploading ||
                                disabled
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-primary text-white hover:bg-primary/90 active:scale-95"
                            }
                        `}
                    >
                        {isUploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Icon className="w-5 h-5" />
                                <span>{config.buttonText}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* File Type Info */}
            <div className="mt-2 text-xs text-gray-500">
                Accepted formats: PDF, Images • Max size:{" "}
                {formatFileSize(maxSize)}
            </div>
        </div>
    );
};

export default FileUploadSection;
