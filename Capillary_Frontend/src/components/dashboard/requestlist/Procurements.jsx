import { useState, useEffect, useRef } from "react";
import {
    deleteFileFromAwsS3,
    fetchAllVendorData,
    savePocurementsData,
} from "../../../api/service/adminServices";
import { FaFilePdf, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import uploadFiles from "../../../utils/s3BucketConfig.js";

const Procurements = ({
    formData = {},
    setFormData,
    onBack,
    onNext,
    reqId,
}) => {
    console.log("procurements formData", formData);
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const [errors, setErrors] = useState({
        vendor: "",
        servicePeriod: "",
        poValidFrom: "",
        poValidTo: "",
        quotationDate: "",
    });

    const [filesData, setFilesData] = useState([
        {
            id: Date.now(),
            fileType: "",
            otherType: "",
            files: [],
            urls: [],
            agreementValidFrom: "",
            agreementValidTo: "",
        },
    ]);

    useEffect(() => {
        if (formData.vendor && formData.vendorName) {
            const vendorDisplay = `${formData.vendor} - ${formData.vendorName}`;
            setSearchTerm(vendorDisplay);
        }
    }, [formData.vendor, formData.vendorName]);

    useEffect(() => {
        const fetchVendor = async () => {
            try {
                const response = await fetchAllVendorData();
                if (response.status === 200) {
                    setVendors(response?.data?.vendors);

                    if (formData.vendor) {
                        const selectedVendor = response?.data?.vendors.find(
                            (v) =>
                                v.vendorId === formData.vendor ||
                                v.ID === formData.vendor
                        );
                        if (selectedVendor) {
                            const vendorDisplay =
                                getVendorDisplayName(selectedVendor);
                            setSearchTerm(vendorDisplay);
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching vendors:", error);
            }
        };

        fetchVendor();
    }, []);

    useEffect(() => {
        if (
            formData.uploadedFiles &&
            Object.keys(formData.uploadedFiles).length > 0
        ) {
            const reconstructedFilesData = Object.entries(
                formData.uploadedFiles
            ).map(([fileType, data]) => ({
                id: Date.now() + Math.random(), // Add randomness to prevent duplicate IDs
                fileType: fileType,
                otherType: fileType === "Other" ? fileType : "",
                files: [],
                urls: data.urls || data,
                agreementValidFrom: data.agreementValidFrom || "",
                agreementValidTo: data.agreementValidTo || "",
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
                              agreementValidFrom: "",
                              agreementValidTo: "",
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

    const getMinDate = () => {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - 10);
        return minDate.toISOString().split("T")[0];
    };

    const getMaxDate = () => {
        return new Date().toISOString().split("T")[0];
    };

    const getFilteredVendors = () => {
        if (!searchTerm) return [];

        return vendors.filter((vendor) => {
            const vendorName = (
                vendor.firstName ||
                vendor.Name ||
                vendor.name ||
                vendor.vendorName ||
                ""
            ).toLowerCase();
            const vendorId = (vendor.ID || vendor.vendorId || "")
                .toString()
                .toLowerCase();
            const search = searchTerm.toLowerCase();

            return vendorName.includes(search) || vendorId.includes(search);
        });
    };

    const getEffectiveFileType = (fileData) => {
        return fileData.fileType === "Other"
            ? fileData.otherType
            : fileData.fileType;
    };

    const validateFields = () => {
        let tempErrors = {};
        let isValid = true;

        if (!formData.vendor) {
            tempErrors.vendor = "Vendor selection is required";
            isValid = false;
        }

        if (!formData.servicePeriod) {
            tempErrors.servicePeriod = "Service period is required";
            isValid = false;
        }

        const hasUploadedFiles =
            formData.uploadedFiles &&
            Object.keys(formData.uploadedFiles).length > 0 &&
            Object.values(formData.uploadedFiles).some(
                (data) => (data.urls || data).length > 0
            );

        if (!hasUploadedFiles) {
            tempErrors.documents = "At least one document must be uploaded";
            isValid = false;
        }

        if (formData.servicePeriod === "custom") {
            if (!formData.poValidFrom) {
                tempErrors.poValidFrom = "Valid from date is required";
                isValid = false;
            } else {
                // Additional validation for manually entered dates
                const selectedDate = new Date(formData.poValidFrom);
                const minDate = new Date();
                minDate.setDate(minDate.getDate() - 11);
                const maxDate = new Date();

                if (selectedDate <= minDate) {
                    tempErrors.poValidFrom =
                        "Date cannot be more than 10 days in the past";
                    isValid = false;
                }
                
            }

            if (!formData.poValidTo) {
                tempErrors.poValidTo = "Valid to date is required";
                isValid = false;
            } else {
                // Additional validation for manually entered dates
                const selectedDate = new Date(formData.poValidTo);
                const minDate = new Date();
                minDate.setDate(minDate.getDate() - 11);

                if (selectedDate <= minDate) {
                    tempErrors.poValidTo =
                        "Date cannot be more than 10 days in the past";
                    isValid = false;
                }
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

        if (!formData.quotationDate) {
            tempErrors.quotationDate = "Quotation date is required";
            isValid = false;
        } else {
            // Additional validation for manually entered quotation date
            const selectedDate = new Date(formData.quotationDate);
            const minDate = new Date();
            minDate.setDate(minDate.getDate() - 11);
            const maxDate = new Date();

            if (selectedDate <= minDate) {
                tempErrors.quotationDate =
                    "Quotation date cannot be more than 10 days in the past";
                isValid = false;
            } 
           
        }

        // Validate agreement dates
        if (formData.uploadedFiles) {
            Object.entries(formData.uploadedFiles).forEach(
                ([fileType, data]) => {
                    if (data.agreementValidFrom && data.agreementValidTo) {
                        if (
                            new Date(data.agreementValidFrom) >
                            new Date(data.agreementValidTo)
                        ) {
                            tempErrors[
                                `${fileType}_agreementDates`
                            ] = `${fileType}: Agreement Valid To date must be after Valid From date`;
                            isValid = false;
                        }
                    }
                }
            );
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Date validation for service period dates
        if ((name === "poValidFrom" || name === "poValidTo") && value) {
            const selectedDate = new Date(value);
            const minDate = new Date();
            minDate.setDate(minDate.getDate() - 11);
            const maxDate = new Date();

            if (selectedDate <= minDate) {
                setErrors((prev) => ({
                    ...prev,
                    [name]: `Date cannot be more than 10 days in the past`,
                }));
                return; // Don't update the formData if date is invalid
            } 
    
            
            else {
                // Clear the error if date is valid
                setErrors((prev) => ({
                    ...prev,
                    [name]: "",
                }));
            }
        }

        // Quotation date validation
        if (name === "quotationDate" && value) {
            const selectedDate = new Date(value);
            const minDate = new Date();
            minDate.setDate(minDate.getDate() - 11);
            const maxDate = new Date();

            if (selectedDate < minDate) {
                setErrors((prev) => ({
                    ...prev,
                    quotationDate: `Quotation date cannot be more than 10 days in the past`,
                }));
                return;
            } else if (selectedDate > maxDate) {
                setErrors((prev) => ({
                    ...prev,
                    quotationDate: `Quotation date cannot be in the future`,
                }));
                return;
            } else {
                setErrors((prev) => ({
                    ...prev,
                    quotationDate: "",
                }));
            }
        }

        if (name === "vendor") {
            const selectedVendor = vendors.find((v) => v.vendorId === value);
            console.log("selectedVendor", selectedVendor);
            setFormData((prevState) => ({
                ...prevState,
                vendor: value,
                vendorName: selectedVendor
                    ? selectedVendor.vendorName ||
                      selectedVendor.Name ||
                      selectedVendor.name
                    : "",
                email: selectedVendor.email,
                isNewVendor: selectedVendor.isNewVendor,
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleSelectVendor = (vendor) => {
        const vendorId = vendor.ID || vendor.vendorId;
        const vendorName =
            vendor.firstName || vendor.Name || vendor.name || vendor.vendorName;

        setFormData((prevState) => ({
            ...prevState,
            vendor: vendorId,
            vendorName: vendorName,
            email: vendor.email,
            isNewVendor: vendor.isNewVendor,
        }));

        setSearchTerm(getVendorDisplayName(vendor));
        setShowResults(false);
        setErrors((prev) => ({ ...prev, vendor: "" }));
    };

    const getDateRange = () => {
        return {
            min: getMinDate(),
            max: getMaxDate(),
        };
    };

    const getVendorDisplayName = (vendor) => {
        if (vendor.isNewVendor) {
            return `${vendor.firstName} (New Vendor)`;
        }
        const displayName =
            vendor.firstName || vendor.Name || vendor.name || vendor.vendorName;
        const id = vendor.vendorId || vendor.ID;
        return `${id} - ${displayName}`;
    };

    const handleMultiFileChange = async (e, index) => {
        const files = Array.from(e.target.files);
        const currentFileData = filesData[index];
        const fileType = getEffectiveFileType(currentFileData);

        if (!fileType) {
            alert("Please select a file type first");
            return;
        }

        try {
            const uploadedUrls = await Promise.all(
                files.map(async (file) => {
                    const data = await uploadFiles(file, fileType, reqId);
                    return data.data.fileUrls[0];
                })
            );

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

            setFormData((prevState) => {
                const currentUploadedFiles = prevState.uploadedFiles || {};
                const existingData = currentUploadedFiles[fileType] || {
                    urls: [],
                    agreementValidFrom: "",
                    agreementValidTo: "",
                };

                return {
                    ...prevState,
                    uploadedFiles: {
                        ...currentUploadedFiles,
                        [fileType]: {
                            urls: [
                                ...(existingData.urls || existingData),
                                ...uploadedUrls,
                            ],
                            agreementValidFrom:
                                existingData.agreementValidFrom || "",
                            agreementValidTo:
                                existingData.agreementValidTo || "",
                        },
                    },
                };
            });
        } catch (error) {
            console.error("Error uploading files:", error);
            alert("Error uploading files. Please try again.");
        }
    };

    const handleRemoveFile = async (fileType, fileIndex, url) => {
        setFormData((prevState) => {
            const updatedFiles = { ...prevState.uploadedFiles };
            if (updatedFiles[fileType]) {
                const currentData = updatedFiles[fileType];
                const urls = currentData.urls || currentData;
                const updatedUrls = urls.filter((_, i) => i !== fileIndex);

                if (updatedUrls.length === 0) {
                    delete updatedFiles[fileType];
                } else {
                    updatedFiles[fileType] = {
                        ...currentData,
                        urls: updatedUrls,
                    };
                }
            }
            return {
                ...prevState,
                uploadedFiles: updatedFiles,
            };
        });

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

        const oldFileType = getEffectiveFileType(filesData[index]);
        const newEffectiveType =
            newFileType === "Other" ? filesData[index].otherType : newFileType;

        if (oldFileType && oldFileType !== newEffectiveType) {
            setFormData((prevState) => {
                const updatedFiles = { ...prevState.uploadedFiles };
                if (filesData[index].urls.length > 0) {
                    updatedFiles[newEffectiveType] = {
                        urls: filesData[index].urls,
                        agreementValidFrom: filesData[index].agreementValidFrom,
                        agreementValidTo: filesData[index].agreementValidTo,
                    };
                }
                delete updatedFiles[oldFileType];
                return {
                    ...prevState,
                    uploadedFiles: updatedFiles,
                };
            });
        }
    };

    const handleOtherTypeChange = (e, index) => {
        const updatedData = [...filesData];
        updatedData[index].otherType = e.target.value;
        setFilesData(updatedData);
    };

    // FIXED: handleAgreementDateChange function
    const handleAgreementDateChange = (e, index, dateType) => {
        const { value } = e.target;
        const fileData = filesData[index];
        const fileType = getEffectiveFileType(fileData);

        // Update local filesData state
        setFilesData((prevData) =>
            prevData.map((data, idx) => {
                if (idx === index) {
                    return {
                        ...data,
                        [dateType]: value,
                    };
                }
                return data;
            })
        );

        // Update formData.uploadedFiles - create structure if it doesn't exist
        if (fileType) {
            setFormData((prevState) => {
                const updatedFiles = { ...prevState.uploadedFiles };

                // Initialize the fileType object if it doesn't exist
                if (!updatedFiles[fileType]) {
                    updatedFiles[fileType] = {
                        urls: [],
                        agreementValidFrom: "",
                        agreementValidTo: "",
                    };
                }

                // Update the specific date field
                updatedFiles[fileType] = {
                    ...updatedFiles[fileType],
                    [dateType]: value,
                };

                return {
                    ...prevState,
                    uploadedFiles: updatedFiles,
                };
            });
        }
    };

    const handleAddRow = () => {
        setFilesData((prev) => [
            ...prev,
            {
                id: Date.now() + Math.random(),
                fileType: "",
                otherType: "",
                files: [],
                urls: [],
                agreementValidFrom: "",
                agreementValidTo: "",
            },
        ]);
    };

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
        // Add debugging
        console.log("FormData being sent:", formData);
        console.log("UploadedFiles structure:", formData.uploadedFiles);

        if (validateFields()) {
            const response = await savePocurementsData(formData, reqId);
            if (response.status === 200) {
                onNext();
            }
        } else {
            toast.error("Please fill in all required fields correctly");
        }
    };

    const renderVendorSearch = () => {
        const filteredVendors = getFilteredVendors();

        return (
            <div className="relative" ref={searchRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Choose Vendor<span className="text-red-500">*</span>
                </label>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search vendor by name or ID..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowResults(true);
                        }}
                        onClick={() => setShowResults(true)}
                        className="w-full pl-10 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                    />
                </div>

                {showResults && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredVendors.length > 0 ? (
                            filteredVendors.map((vendor) => (
                                <div
                                    key={vendor._id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition duration-200"
                                    onClick={() => handleSelectVendor(vendor)}
                                >
                                    <div className="font-medium">
                                        {getVendorDisplayName(vendor)}
                                    </div>
                                    {vendor.email && (
                                        <div className="text-sm text-gray-500">
                                            {vendor.email}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-gray-500">
                                No vendors found
                            </div>
                        )}
                    </div>
                )}
                <ErrorMessage error={errors.vendor} />
            </div>
        );
    };

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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-1">{renderVendorSearch()}</div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Quotation Date
                            </label>
                            <input
                                type="date"
                                name="quotationDate"
                                value={formData.quotationDate || ""}
                                onChange={handleInputChange}
                                min={getMinDate()}
                                max={getMaxDate()}
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
                                        min={getMinDate()}
                                        max={getMaxDate()}
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

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Upload Documents
                        </h3>
                        {errors.documents && (
                            <p className="text-red-500 text-sm mt-1 mb-2">
                                {errors.documents}
                            </p>
                        )}

                        {/* Display agreement date validation errors */}
                        {Object.entries(errors).map(([key, error]) => {
                            if (key.includes("_agreementDates")) {
                                return <ErrorMessage key={key} error={error} />;
                            }
                            return null;
                        })}

                        <div className="overflow-x-auto">
                            <div className="md:hidden">
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

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                                                    Agreement Valid From
                                                </label>
                                                <input
                                                    type="date"
                                                    value={
                                                        fileData.agreementValidFrom
                                                    }
                                                    onChange={(e) =>
                                                        handleAgreementDateChange(
                                                            e,
                                                            index,
                                                            "agreementValidFrom"
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                                                    Agreement Valid To
                                                </label>
                                                <input
                                                    type="date"
                                                    value={
                                                        fileData.agreementValidTo
                                                    }
                                                    onChange={(e) =>
                                                        handleAgreementDateChange(
                                                            e,
                                                            index,
                                                            "agreementValidTo"
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
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

                            <div className="hidden md:block">
                                <table className="w-full table-auto border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                File Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Agreement Valid From
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Agreement Valid To
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
                                                        type="date"
                                                        value={
                                                            fileData.agreementValidFrom
                                                        }
                                                        onChange={(e) =>
                                                            handleAgreementDateChange(
                                                                e,
                                                                index,
                                                                "agreementValidFrom"
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                    />
                                                </td>

                                                <td className="px-4 py-3">
                                                    <input
                                                        type="date"
                                                        value={
                                                            fileData.agreementValidTo
                                                        }
                                                        onChange={(e) =>
                                                            handleAgreementDateChange(
                                                                e,
                                                                index,
                                                                "agreementValidTo"
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                                    />
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
                        <div></div>
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

export default Procurements;
