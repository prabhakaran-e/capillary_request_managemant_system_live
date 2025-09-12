import React from "react";
import { FileText, File, X } from "lucide-react";

const FilePreview = ({ selectedFile, onClear }) => {
    const [preview, setPreview] = React.useState(null);
    const [fileType, setFileType] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    React.useEffect(() => {
        if (!selectedFile) {
            setPreview(null);
            setFileType(null);
            setError(null);
            return;
        }

        setError(null);
        setPreview(null);

        if (selectedFile.type.startsWith("image/")) {
            setFileType("image");
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.onerror = () => setError("Failed to load preview");
            reader.readAsDataURL(selectedFile);
        } else if (selectedFile.type === "application/pdf") {
            setFileType("pdf");
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.onerror = () => setError("Failed to load preview");
            reader.readAsDataURL(selectedFile);
        } else {
            setFileType("other");
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.onerror = () => setError("Failed to load preview");
            reader.readAsDataURL(selectedFile);
        }
    }, [selectedFile]);

    if (!selectedFile) return null;

    return (
        <>
            <div
                className="relative w-14 h-14 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer"
                onClick={() => setIsModalOpen(true)}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                    className="absolute -top-1 -right-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-0.5 transition-colors z-10"
                    aria-label="Clear file"
                >
                    <X size={12} />
                </button>

                {fileType === "image" && preview ? (
                    <div className="w-full h-full rounded-lg overflow-hidden">
                        <img
                            src={preview}
                            alt="File preview"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full rounded-lg flex items-center justify-center bg-gray-50">
                        {fileType === "pdf" ? (
                            <FileText size={20} className="text-red-500" />
                        ) : (
                            <File size={20} className="text-blue-500" />
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="border-b p-4 flex justify-between items-center">
                            <h3 className="text-lg font-medium truncate">
                                {selectedFile.name}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
                            {fileType === "image" && preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-w-full h-auto mx-auto"
                                />
                            ) : fileType === "pdf" && preview ? (
                                <embed
                                    src={preview}
                                    type="application/pdf"
                                    className="w-full h-[70vh]"
                                />
                            ) : preview ? (
                                <div className="bg-gray-50 p-4 rounded">
                                    <p className="text-sm text-gray-600">
                                        Preview not available for this file
                                        type. Filename: {selectedFile.name}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        File size:{" "}
                                        {(
                                            selectedFile.size /
                                            1024 /
                                            1024
                                        ).toFixed(2)}{" "}
                                        MB
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2">
                                        File type:{" "}
                                        {selectedFile.type || "Unknown"}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border-t border-red-100">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FilePreview;
