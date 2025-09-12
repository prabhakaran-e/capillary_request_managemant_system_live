import { useState, useEffect, useRef } from "react";
import { FaFilePdf } from "react-icons/fa";
import { toast } from "react-toastify";
import uploadFiles from "../../../../utils/s3BucketConfig";
import { savePocurementsData } from "../../../../api/service/adminServices";


const NewProcurements = ({
    formData = {},
    setFormData,
    onBack,
    onNext,
    reqId,
}) => {
    console.log("procurements formData", formData);
    // Note: Vendor selection is now moved to Commercials component
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const [errors, setErrors] = useState({
        servicePeriod: "",
        poValidFrom: "",
        poValidTo: "",
        quotationDate: "",
        documents: "",
    });

    // Agreement date fields state
    const [hasAgreement, setHasAgreement] = useState(
        formData.hasAgreement || false
    );

    const [filesData, setFilesData] = useState([
        { id: Date.now(), fileType: "", otherType: "", files: [], urls: [] },
    ]);

    useEffect(() => {
        if (
            formData.uploadedFiles &&
            Object.keys(formData.uploadedFiles).length > 0
        ) {
            const reconstructedFilesData = Object.entries(
                formData.uploadedFiles
            ).map(([fileType, urls]) => ({
                id: Date.now(),
                fileType: fileType,
                otherType: fileType === "Other" ? fileType : "",
                files: [],
                urls: urls,
            }));

            setFilesData(
                reconstructedFilesData.length > 0
                    ? reconstructedFilesData
                    : [
                          {
                              id: Date.now(),
                              fileType: "",
                              otherType: "",
                              files: [],
                              urls: [],
                          },
                      ]
            );
        }
    }, []);

    useEffect(() => {
        if (!formData.quotationDate) {
            const today = new Date().toISOString().split("T")[0];
            setFormData((prevState) => ({
                ...prevState,
                quotationDate: today,
                servicePeriod: "One Time",
            }));
        }
    }, [setFormData, formData.quotationDate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getEffectiveFileType = (fileData) => {
        return fileData.fileType === "Other"
            ? fileData.otherType
            : fileData.fileType;
    };

    const validateFields = () => {
        let tempErrors = {};
        let isValid = true;

        // Service Period validation
        if (!formData.servicePeriod) {
            tempErrors.servicePeriod = "Service period is required";
            isValid = false;
        }

        const hasUploadedFiles =
            formData.uploadedFiles &&
            Object.keys(formData.uploadedFiles).length > 0 &&
            Object.values(formData.uploadedFiles).some(
                (files) => files.length > 0
            );

        if (!hasUploadedFiles) {
            tempErrors.documents = "At least one document must be uploaded";
            isValid = false;
        }

        // Custom period validation
        if (formData.servicePeriod === "custom") {
            if (!formData.poValidFrom) {
                tempErrors.poValidFrom = "Valid from date is required";
                isValid = false;
            }
            if (!formData.poValidTo) {
                tempErrors.poValidTo = "Valid to date is required";
                isValid = false;
            }
            if (
                formData.poValidFrom &&
                formData.poValidTo &&
                new Date(formData.poValidFrom) > new Date(formData.poValidTo)
            ) {
                tempErrors.poValidTo =
                    "Valid to date must be after valid from date";
                isValid = false;
            }
        }

        // Agreement date validation
        if (hasAgreement) {
            if (!formData.agreementValidFrom) {
                tempErrors.agreementValidFrom =
                    "Agreement valid from date is required";
                isValid = false;
            }
            if (!formData.agreementValidTo) {
                tempErrors.agreementValidTo =
                    "Agreement valid to date is required";
                isValid = false;
            }
            if (
                formData.agreementValidFrom &&
                formData.agreementValidTo &&
                new Date(formData.agreementValidFrom) >
                    new Date(formData.agreementValidTo)
            ) {
                tempErrors.agreementValidTo =
                    "Agreement valid to date must be after valid from date";
                isValid = false;
            }
        }

        // Quotation date validation
        if (!formData.quotationDate) {
            tempErrors.quotationDate = "Quotation date is required";
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleAgreementCheckboxChange = (e) => {
        const isChecked = e.target.checked;
        setHasAgreement(isChecked);
        setFormData((prevState) => ({
            ...prevState,
            hasAgreement: isChecked,
            // Clear agreement dates if unchecked
            agreementValidFrom: isChecked ? prevState.agreementValidFrom : "",
            agreementValidTo: isChecked ? prevState.agreementValidTo : "",
        }));
    };

    const getDateRange = () => {
        const maxDate = new Date().toISOString().split("T")[0]; // Today
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - 10);
        return {
            min: minDate.toISOString().split("T")[0],
            max: maxDate,
        };
    };

    // Handle multiple file uploads
    const handleMultiFileChange = async (e, index) => {
        const files = Array.from(e.target.files);
        const currentFileData = filesData[index];
        const fileType = getEffectiveFileType(currentFileData);

        console.log(
            ",files",
            files,
            "currentFileData",
            currentFileData,
            "fileType",
            fileType
        );

        if (!fileType) {
            alert("Please select a file type first");
            return;
        }

        try {
            const uploadedUrls = await Promise.all(
                files.map(async (file) => {
                    const data = await uploadFiles(file, fileType, reqId);
                    console.log("data", data);
                    return data.data.fileUrls[0];
                })
            );

            // Update filesData for the specific row
            setFilesData((prevData) =>
                prevData.map((data, idx) => {
                    if (idx === index) {
                        return {
                            ...data,
                            files: [...data.files, ...files],
                            urls: [...data.urls, ...uploadedUrls],
                        };
                    }
                    return data;
                })
            );

            // Update formData
            setFormData((prevState) => {
                const currentUploadedFiles = prevState.uploadedFiles || {};
                return {
                    ...prevState,
                    uploadedFiles: {
                        ...currentUploadedFiles,
                        [fileType]: [
                            ...(currentUploadedFiles[fileType] || []),
                            ...uploadedUrls,
                        ],
                    },
                };
            });
        } catch (error) {
            console.error("Error uploading files:", error);
            alert("Error uploading files. Please try again.");
        }
    };

    // Remove a specific file
    const handleRemoveFile = async (fileType, fileIndex, url) => {
        console.log(fileType, fileIndex, url);

        setFormData((prevState) => {
            const updatedFiles = { ...prevState.uploadedFiles };
            if (updatedFiles[fileType]) {
                updatedFiles[fileType] = updatedFiles[fileType].filter(
                    (_, i) => i !== fileIndex
                );

                if (updatedFiles[fileType].length === 0) {
                    delete updatedFiles[fileType];
                }
            }
            return {
                ...prevState,
                uploadedFiles: updatedFiles,
            };
        });

        // Update filesData without creating new rows
        setFilesData((prevData) =>
            prevData.map((fileData) => {
                const currentFileType = getEffectiveFileType(fileData);
                if (currentFileType === fileType) {
                    const updatedUrls = fileData.urls.filter(
                        (_, i) => i !== fileIndex
                    );
                    return updatedUrls.length !== fileData.urls.length
                        ? { ...fileData, urls: updatedUrls }
                        : fileData;
                }
                return fileData;
            })
        );
    };

    // Handle file type selection
    const handleFileTypeChange = (e, index) => {
        const newFileType = e.target.value;

        setFilesData((prevData) => {
            const updatedData = [...prevData];
            updatedData[index] = {
                ...updatedData[index],
                fileType: newFileType,
                otherType:
                    newFileType === "Other" ? updatedData[index].otherType : "",
            };
            return updatedData;
        });

        // Update formData only if file type changes
        const oldFileType = getEffectiveFileType(filesData[index]);
        const newEffectiveType =
            newFileType === "Other" ? filesData[index].otherType : newFileType;

        if (oldFileType && oldFileType !== newEffectiveType) {
            setFormData((prevState) => {
                const updatedFiles = { ...prevState.uploadedFiles };
                if (filesData[index].urls.length > 0) {
                    updatedFiles[newEffectiveType] = filesData[index].urls;
                }
                delete updatedFiles[oldFileType];
                return {
                    ...prevState,
                    uploadedFiles: updatedFiles,
                };
            });
        }
    };

    // Handle other file type input
    const handleOtherTypeChange = (e, index) => {
        const updatedData = [...filesData];
        updatedData[index].otherType = e.target.value;
        setFilesData(updatedData);
    };

    // Add a new file upload row
    const handleAddRow = () => {
        setFilesData((prev) => [
            ...prev,
            {
                id: Date.now(),
                fileType: "",
                otherType: "",
                files: [],
                urls: [],
            },
        ]);
    };

    // Remove a file upload row
    const handleRemoveRow = (index) => {
        const fileType = getEffectiveFileType(filesData[index]);

        const updatedFilesData = filesData.filter((_, i) => i !== index);
        setFilesData(updatedFilesData);

        if (fileType) {
            setFormData((prevState) => {
                const updatedFiles = { ...prevState.uploadedFiles };
                delete updatedFiles[fileType];
                return {
                    ...prevState,
                    uploadedFiles: updatedFiles,
                };
            });
        }
    };

    const handleSubmit = async () => {
        if (validateFields()) {
            const response = await savePocurementsData(formData, reqId);
            if (response.status === 200) {
                onNext();
            }
        } else {
            toast.error("Please fill in all required fields correctly");
        }
    };

    // Render uploaded files for a specific row
    const renderUploadedFiles = (rowIndex) => {
        const fileData = filesData[rowIndex];
        const fileType = getEffectiveFileType(fileData);

        if (!fileType || !fileData.urls.length) return null;

        const displayType =
            fileData.fileType === "Other"
                ? fileData.otherType
                : fileData.fileType;

        return (
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="font-semibold mb-2">{displayType}</h3>

                    <div className="flex flex-wrap gap-2">
                        {fileData.urls.map((url, fileIndex) => (
                            <div
                                key={fileIndex}
                                className="flex items-center bg-gray-100 rounded-lg p-2"
                            >
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center"
                                >
                                    <FaFilePdf
                                        size={24}
                                        className="text-red-500"
                                    />
                                    <span className="ml-1 text-sm md:text-base truncate max-w-xs">
                                        {`${fileType}-${fileIndex}`}
                                    </span>
                                </a>
                                <button
                                    onClick={() =>
                                        handleRemoveFile(
                                            fileType,
                                            fileIndex,
                                            url
                                        )
                                    }
                                    className="ml-2 text-red-500 hover:text-red-700"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const ErrorMessage = ({ error }) => {
        if (!error) return null;
        return <p className="text-red-500 text-sm mt-1">{error}</p>;
    };

    return (
        <div className="mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary p-4 md:p-6">
                <h2 className="text-xl md:text-3xl font-extrabold text-white text-center">
                    Procurement Details
                </h2>
            </div>

            <div className="p-4 md:p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {/* First row - dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Quotation Date
                            </label>
                            <input
                                type="date"
                                name="quotationDate"
                                value={formData.quotationDate || ""}
                                onChange={handleInputChange}
                                min={getDateRange().min}
                                max={getDateRange().max}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            />
                            <ErrorMessage error={errors.quotationDate} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Quotation Number
                            </label>
                            <input
                                type="text"
                                name="quotationNumber"
                                value={formData.quotationNumber || ""}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                                placeholder="Enter Quotation Number"
                            />
                        </div>
                    </div>

                    {/* Service Period row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Service Period
                                <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="servicePeriod"
                                value={formData.servicePeriod || "oneTime"}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    if (e.target.value === "oneTime") {
                                        setFormData((prevData) => ({
                                            ...prevData,
                                            poValidFrom: "",
                                            poValidTo: "",
                                        }));
                                    }
                                }}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            >
                                <option value="oneTime">One Time</option>
                                <option value="custom">Custom</option>
                            </select>
                            <ErrorMessage error={errors.servicePeriod} />
                        </div>

                        {formData.servicePeriod === "custom" && (
                            <>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Service Valid From
                                    </label>
                                    <input
                                        type="date"
                                        name="poValidFrom"
                                        value={formData.poValidFrom || ""}
                                        onChange={handleInputChange}
                                        min={getDateRange().min}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                                    />
                                    <ErrorMessage error={errors.poValidFrom} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Service Valid To
                                    </label>
                                    <input
                                        type="date"
                                        name="poValidTo"
                                        value={formData.poValidTo || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                                    />
                                    <ErrorMessage error={errors.poValidTo} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Agreement Date Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                id="hasAgreement"
                                checked={hasAgreement}
                                onChange={handleAgreementCheckboxChange}
                                className="w-4 h-4 text-primary rounded"
                            />
                            <label
                                htmlFor="hasAgreement"
                                className="text-sm font-semibold text-gray-700"
                            >
                                Agreement has specific validity dates
                            </label>
                        </div>

                        {hasAgreement && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Agreement Valid From{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="agreementValidFrom"
                                        value={
                                            formData.agreementValidFrom || ""
                                        }
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                                    />
                                    <ErrorMessage
                                        error={errors.agreementValidFrom}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Agreement Valid To{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="agreementValidTo"
                                        value={formData.agreementValidTo || ""}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                                    />
                                    <ErrorMessage
                                        error={errors.agreementValidTo}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Project and Client row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Project Code
                            </label>
                            <input
                                type="text"
                                name="projectCode"
                                value={formData.projectCode || ""}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Client Name
                            </label>
                            <input
                                type="text"
                                name="clientName"
                                value={formData.clientName || ""}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            />
                        </div>
                    </div>

                    {/* Document Upload section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Upload Documents
                        </h3>
                        {errors.documents && (
                            <p className="text-red-500 text-sm mt-1 mb-2">
                                {errors.documents}
                            </p>
                        )}

                        <div className="overflow-x-auto">
                            <div className="md:hidden">
                                {/* Mobile view - cards instead of table */}
                                {filesData.map((fileData, index) => (
                                    <div
                                        key={fileData.id}
                                        className="mb-4 p-4 border rounded-lg shadow-sm"
                                    >
                                        <div className="mb-3">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                                                File Type
                                            </label>
                                            <select
                                                value={fileData.fileType}
                                                onChange={(e) =>
                                                    handleFileTypeChange(
                                                        e,
                                                        index
                                                    )
                                                }
                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">
                                                    Select File Type
                                                </option>
                                                <option value="finalQuotation">
                                                    Final Quotation
                                                </option>
                                                <option value="competitive">
                                                    Competitive
                                                </option>
                                                <option value="agreement">
                                                    Agreement
                                                </option>
                                                <option value="engagementwork">
                                                    Engagement Letter(EL)
                                                </option>
                                                <option value="statementofwork">
                                                    Statement Of Work (SOW)
                                                </option>
                                                <option value="Other">
                                                    Other
                                                </option>
                                            </select>

                                            {fileData.fileType === "Other" && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter other file type"
                                                    value={fileData.otherType}
                                                    onChange={(e) =>
                                                        handleOtherTypeChange(
                                                            e,
                                                            index
                                                        )
                                                    }
                                                    className="mt-2 w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                />
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                                                Upload File
                                            </label>
                                            <input
                                                type="file"
                                                onChange={(e) =>
                                                    handleMultiFileChange(
                                                        e,
                                                        index
                                                    )
                                                }
                                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                multiple
                                                disabled={!fileData.fileType}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                                                Uploaded Files
                                            </label>
                                            {renderUploadedFiles(index)}
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                onClick={() =>
                                                    handleRemoveRow(index)
                                                }
                                                className={`bg-red-500 text-white hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300 ${
                                                    index === 0
                                                        ? "cursor-not-allowed opacity-50"
                                                        : ""
                                                }`}
                                                disabled={index === 0}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop view - table */}
                            <div className="hidden md:block">
                                <table className="w-full table-auto border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                File Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Upload File
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Uploaded Files
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filesData.map((fileData, index) => (
                                            <tr
                                                key={fileData.id}
                                                className="border-b hover:bg-gray-50 transition duration-200"
                                            >
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={
                                                            fileData.fileType
                                                        }
                                                        onChange={(e) =>
                                                            handleFileTypeChange(
                                                                e,
                                                                index
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                    >
                                                        <option value="">
                                                            Select File Type
                                                        </option>
                                                        <option value="finalQuotation">
                                                            Final Quotation
                                                        </option>
                                                        <option value="competitive">
                                                            Competitive
                                                        </option>
                                                        <option value="agreement">
                                                            Agreement
                                                        </option>
                                                        <option value="engagementwork">
                                                            Engagement
                                                            Letter(EL)
                                                        </option>
                                                        <option value="statementofwork">
                                                            Statement Of Work
                                                            (SOW)
                                                        </option>
                                                        <option value="Other">
                                                            Other
                                                        </option>
                                                    </select>

                                                    {fileData.fileType ===
                                                        "Other" && (
                                                        <input
                                                            type="text"
                                                            placeholder="Enter other file type"
                                                            value={
                                                                fileData.otherType
                                                            }
                                                            onChange={(e) =>
                                                                handleOtherTypeChange(
                                                                    e,
                                                                    index
                                                                )
                                                            }
                                                            className="mt-2 w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                        />
                                                    )}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <input
                                                        type="file"
                                                        onChange={(e) =>
                                                            handleMultiFileChange(
                                                                e,
                                                                index
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                        multiple
                                                        disabled={
                                                            !fileData.fileType
                                                        }
                                                    />
                                                </td>

                                                <td className="px-4 py-3">
                                                    {renderUploadedFiles(index)}
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveRow(
                                                                index
                                                            )
                                                        }
                                                        className={`bg-red-500 text-white hover:bg-red-700 px-4 py-2 rounded-lg transition duration-300 ${
                                                            index === 0
                                                                ? "cursor-not-allowed opacity-50"
                                                                : ""
                                                        }`}
                                                        disabled={index === 0}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-start">
                            <button
                                onClick={handleAddRow}
                                className="bg-primary text-white flex items-center px-4 py-2 rounded-lg hover:bg-primary-dark transition duration-300"
                            >
                                Add Row
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                        <button
                            onClick={onBack}
                            className="px-6 w-full sm:w-40 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 w-full sm:w-40 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewProcurements;
