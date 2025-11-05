import { PlusCircle, Search, Trash2, Info, X, Upload } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
    getAllEntityData,
    getNewReqId,
    saveCommercialData,
} from "../../../api/service/adminServices";
import { toast } from "react-toastify";
import { CommercialValidationSchema } from "./yupValidation/commercialValidation";
import businessUnits from "./dropDownData/businessUnit";
import uploadFiles from "../../../utils/s3BucketConfig";

const Commercials = ({ formData, setFormData, onNext, setReqId, reqId }) => {
    const empDepartment = localStorage.getItem("department");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("user", reqId);

    const empId = localStorage.getItem("userId");
    const [isDropDown, setIsDropDown] = useState(false);
    const [approvers, setApprovers] = useState([]);
    const [filteredApprovers, setFilteredApprovers] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [availableBusinessUnits, setAvailableBusinessUnits] = useState([]);

    const [showPaymentTermInfo, setShowPaymentTermInfo] = useState(false);
    const [additionalApprovers, setAdditionalApprovers] = useState([]);
    const [selectedAdditionalApprover, setSelectedAdditionalApprover] =
        useState("");

    // Multiple file upload state variables
    const [approverProofFiles, setApproverProofFiles] = useState([]);
    const [approverProofPreviews, setApproverProofPreviews] = useState([]);

    const [entityVariants, setEntityVariants] = useState([]);
    const [selectedEntityVariant, setSelectedEntityVariant] = useState("");
    const [availableBillToOptions, setAvailableBillToOptions] = useState([]);
    const [availableShipToOptions, setAvailableShipToOptions] = useState([]);

    // State variables for city and site dropdowns
    const [citySearchTerm, setCitySearchTerm] = useState("");
    const [siteSearchTerm, setSiteSearchTerm] = useState("");
    const [isCitySearchFocused, setIsCitySearchFocused] = useState(false);
    const [isSiteSearchFocused, setIsSiteSearchFocused] = useState(false);
    const [availableCities, setAvailableCities] = useState([]);
    const [availableSites, setAvailableSites] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [filteredSites, setFilteredSites] = useState([]);

    const mockAdditionalApprovers = [
        {
            id: "CAP-651",
            name: "Anant Choubey",
            email: "anant.choubey@capillarytech.com",
            department: "Corporate (12CCRM01)",
        },
        {
            id: "CAP-005",
            name: "Aneesh Reddy Boddu",
            email: "aneesh@capillarytech.com",
            department: "Corporate (12CCRM01)",
        },
    ].sort((a, b) => a.name.localeCompare(b.name));

    const [localFormData, setLocalFormData] = useState({
        entity: formData.entity || "",
        city: formData.city || "",
        site: formData.site || "",
        department: formData.department || empDepartment || "",
        amount: formData.amount || "",
        entityId: formData.entityId || "",
        paymentTerms: formData.paymentTerms || [
            {
                percentageTerm: 0,
                paymentTerm: "",
                paymentType: "",
                customPaymentTerm: "",
                customPaymentType: "",
            },
        ],
        billTo: formData.billTo || "",
        shipTo: formData.shipTo || "",
        hod: formData.hod || "",
        hodEmail: formData.hodEmail || "",
        businessUnit: formData.businessUnit || "",
        isCreditCardSelected: formData.isCreditCardSelected || false,
        newReqId: reqId,
        empDepartment: empDepartment,
        userName: user.name,
        additionalApprover: formData.additionalApprover || "",
        additionalApproverName: formData.additionalApproverName || "",
        additionalApproverEmail: formData.additionalApproverEmail || "",
        additionalApproverProof: formData.additionalApproverProof || null,
    });

    const [entities, setEntities] = useState([]);
    const [selectedEntityDetails, setSelectedEntityDetails] = useState(null);
    const [errors, setErrors] = useState({});
    const [department, setDepartment] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [uniqueDepartments, setUniqueDepartments] = useState(new Map());

    // Entity search state
    const [entitySearchTerm, setEntitySearchTerm] = useState("");
    const [isEntityFocused, setIsEntityFocused] = useState(false);
    const entityRef = useRef(null);

    // Cost Center split selection states
    const [selectedCC1, setSelectedCC1] = useState("");
    const [cc1SearchTerm, setCc1SearchTerm] = useState("");
    const [isCc1Focused, setIsCc1Focused] = useState(false);
    const [cc2SearchTerm, setCc2SearchTerm] = useState("");
    const [isCc2Focused, setIsCc2Focused] = useState(false);
    const [cc2Options, setCc2Options] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getNewReqId();
            if (response.status === 200) {
                setReqId(response.data.reqid);
                setLocalFormData((prev) => ({
                    ...prev,
                    newReqId: response.data.reqid,
                }));
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (formData.department && isDropDown) {
            setSearchTerm(formData.department);
            const savedDept = availableDepartments.find(
                (dept) => dept.department === formData.department
            );

            if (savedDept) {
                setSelectedDepartment(savedDept);
                setApprovers(savedDept.approvers);
                setFilteredDepartments([savedDept]);
            }

            const parts = (formData.department || "").split(":");
            setSelectedCC1((parts[0] || "").trim());
            setCc2SearchTerm((parts.slice(1).join(":") || "").trim());
        } else if (!formData.department) {
            setSelectedCC1("");
            setCc2SearchTerm("");
        }
    }, [formData.department, availableDepartments, isDropDown]);

    // Build CC2 options when CC1 or availableDepartments change
    useEffect(() => {
        if (!isDropDown) return;
        if (!selectedCC1) {
            setCc2Options([]);
            return;
        }
        const options = availableDepartments
            .filter((d) => (d.department || "").split(":")[0].trim().toLowerCase() === selectedCC1.toLowerCase())
            .map((d) => (d.department.split(":").slice(1).join(":") || "").trim())
            .filter(Boolean);
        const unique = Array.from(new Set(options)).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        setCc2Options(unique);
        if (cc2SearchTerm && !unique.includes(cc2SearchTerm)) {
            setCc2SearchTerm("");
        }
    }, [isDropDown, selectedCC1, availableDepartments]);

    // Populate cities and sites based on selected entity variants; fallback to all entities
    useEffect(() => {
        const source = entityVariants && entityVariants.length > 0 ? entityVariants : entities;
        if (source.length > 0) {
            const uniqueCities = [
                ...new Set(source.map((e) => e.city).filter(Boolean)),
            ].sort();
            setAvailableCities(uniqueCities);
            setFilteredCities(uniqueCities);

            const uniqueSites = [
                ...new Set(source.map((e) => e.site || e.area).filter(Boolean)),
            ].sort();
            setAvailableSites(uniqueSites);
            setFilteredSites(uniqueSites);

            if (formData.city) setCitySearchTerm(formData.city);
            if (formData.site) setSiteSearchTerm(formData.site);
        } else {
            setAvailableCities([]);
            setFilteredCities([]);
            setAvailableSites([]);
            setFilteredSites([]);
        }
    }, [entities, entityVariants, formData.city, formData.site]);

    // Close entity dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (entityRef && entityRef.current && !entityRef.current.contains(e.target)) {
                setIsEntityFocused(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        const fetchEntity = async () => {
            try {
                const response = await getAllEntityData(empId);
                if (response.status === 200) {
                    const sortedEntities = (response.data.entities || []).sort(
                        (a, b) => (a.entityName || "").toLowerCase().localeCompare((b.entityName || "").toLowerCase())
                    );
                    setEntities(sortedEntities);

                    setDepartment(response.data.department || []);
                    setIsDropDown(response.data.isDropDown);

                    if (
                        response.data.isDropDown &&
                        Array.isArray(response.data.department)
                    ) {
                        const uniqueBusinessUnitsSet = new Set();
                        response.data.department.forEach((dept) => {
                            if (dept.businessUnit) {
                                uniqueBusinessUnitsSet.add(dept.businessUnit);
                            }
                        });

                        const uniqueBusinessUnits = Array.from(
                            uniqueBusinessUnitsSet
                        )
                            .sort()
                            .map((unit) => ({
                                value: unit,
                                label: unit,
                            }));

                        setAvailableBusinessUnits(uniqueBusinessUnits);

                        if (formData.businessUnit) {
                            const filtered = response.data.department.filter(
                                (dept) =>
                                    dept.businessUnit?.toLowerCase() ===
                                    formData.businessUnit.toLowerCase()
                            );

                            const deptMap = new Map();
                            filtered.forEach((dept) => {
                                const key = dept.department;
                                if (!deptMap.has(key)) {
                                    deptMap.set(key, {
                                        department: dept.department,
                                        businessUnit: dept.businessUnit,
                                        approvers: filtered
                                            .filter(
                                                (d) =>
                                                    d.department ===
                                                    dept.department
                                            )
                                            .map((d) => ({
                                                hod: d.hod,
                                                hodEmail: d.hod_email_id,
                                            })),
                                    });
                                }
                            });

                            setUniqueDepartments(deptMap);
                            const sortedDepartments = Array.from(deptMap.values()).sort((a, b) =>
                                (a.department || "").toLowerCase().localeCompare((b.department || "").toLowerCase())
                            );
                            setAvailableDepartments(sortedDepartments);
                            setFilteredDepartments(sortedDepartments);
                        }
                    } else {
                        const sortedBusinessUnits = businessUnits.sort((a, b) =>
                            a.label.localeCompare(b.label)
                        );
                        setAvailableBusinessUnits(sortedBusinessUnits);
                    }

                    if (!response.data.isDropDown && formData.department) {
                        const selectedDept = response.data.department.find(
                            (dept) => dept.department === formData.department
                        );
                        if (selectedDept) {
                            setLocalFormData((prev) => ({
                                ...prev,
                                hod: selectedDept.hod,
                                hodEmail: selectedDept.hod_email_id,
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching entities:", error);
                setDepartment([]);
                setFilteredDepartments([]);
                setAvailableDepartments([]);
                setUniqueDepartments(new Map());
                setAvailableBusinessUnits(
                    isDropDown
                        ? []
                        : businessUnits.sort((a, b) =>
                            a.label.localeCompare(b.label)
                        )
                );
            }
        };
        fetchEntity();
    }, [empId, formData.businessUnit, formData.department]);

    useEffect(() => {
        setAdditionalApprovers(mockAdditionalApprovers);
    }, []);

    // Cleanup preview URLs when component unmounts
    useEffect(() => {
        return () => {
            approverProofPreviews.forEach((fileData) => {
                if (fileData.preview) {
                    URL.revokeObjectURL(fileData.preview);
                }
            });
        };
    }, [approverProofPreviews]);

    // Handler functions for city and site dropdowns
    const handleCityChange = (selectedCity) => {
        // narrow to entity variants in selected city, then compute sites and bill/ship
        const cityVariants = (entityVariants && entityVariants.length > 0
            ? entityVariants
            : entities.filter((e) => e.entityName === localFormData.entity))
            .filter((e) => (e.city || "") === selectedCity);

        const uniqueSites = [...new Set(cityVariants.map(v => v.site || v.area).filter(Boolean))].sort();

        let updatedFormData = {
            ...localFormData,
            city: selectedCity,
        };

        // update site list in UI
        setAvailableSites(uniqueSites);
        setFilteredSites(uniqueSites);

        if (uniqueSites.length === 1) {
            // auto-fill site and bill/ship if only one
            const onlySite = uniqueSites[0];
            const variant = cityVariants.find(v => (v.site || v.area) === onlySite) || cityVariants[0];
            setSelectedEntityDetails(variant);
            setSelectedEntityVariant(variant._id);
            const formattedAddress = `${variant.addressLine}\n\nTax ID: ${variant.taxId || "N/A"}\nTax Type: ${variant.type || "N/A"}`;
            updatedFormData = {
                ...updatedFormData,
                site: onlySite,
                billTo: formattedAddress,
                shipTo: formattedAddress,
            };
            setSiteSearchTerm(onlySite);
        } else {
            // multiple sites for the selected city: clear selection and addresses until site chosen
            updatedFormData = {
                ...updatedFormData,
                site: "",
                billTo: "",
                shipTo: "",
            };
            setSiteSearchTerm("");
        }

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
        setCitySearchTerm(selectedCity);
        setIsCitySearchFocused(false);

        if (errors.city) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.city;
                return newErrors;
            });
        }
    };

    const handleSiteChange = (selectedSite) => {
        const updatedFormData = {
            ...localFormData,
            site: selectedSite,
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
        setSiteSearchTerm(selectedSite);
        setIsSiteSearchFocused(false);

        if (errors.site) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.site;
                return newErrors;
            });
        }
    };

    const handleBusinessUnitChange = (e) => {
        const { name, value } = e.target;
        if (isDropDown) {
            const updatedFormData = {
                ...localFormData,
                [name]: value,
                department: "",
                hod: "",
                hodEmail: "",
            };

            setLocalFormData(updatedFormData);
            setFormData(updatedFormData);
            setSearchTerm("");
            setSelectedDepartment(null);
            setApprovers([]);
            setSelectedCC1("");
            setCc2SearchTerm("");
            setCc2Options([]);
            setIsCc2Focused(false);
        } else {
            const updatedFormData = {
                ...localFormData,
                [name]: value,
            };

            setLocalFormData(updatedFormData);
            setFormData(updatedFormData);
            setSearchTerm("");
            setSelectedDepartment(null);
            setApprovers([]);
            setSelectedCC1("");
            setCc2SearchTerm("");
            setCc2Options([]);
            setIsCc2Focused(false);
        }

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDepartmentChange = (selectedDept) => {
        setSelectedDepartment(selectedDept);
        setApprovers(selectedDept.approvers);

        const updatedFormData = {
            ...localFormData,
            department: selectedDept.department,
            hod: "",
            hodEmail: "",
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
        setSearchTerm(selectedDept.department);
        setIsSearchFocused(false);
    };

    const handleApproverChange = (e) => {
        const selectedApprover = approvers.find(
            (approver) => approver.hod === e.target.value
        );

        if (selectedApprover) {
            const updatedFormData = {
                ...localFormData,
                hod: selectedApprover.hod,
                hodEmail: selectedApprover.hodEmail,
            };

            setLocalFormData(updatedFormData);
            setFormData(updatedFormData);
        }
    };

    const handleAdditionalApproverChange = (e) => {
        const approverId = e.target.value;
        setSelectedAdditionalApprover(approverId);

        // Find the selected approver details
        const selectedApproverDetails = additionalApprovers.find(
            approver => approver.id === approverId
        );

        const updatedFormData = {
            ...localFormData,
            additionalApprover: approverId,
            // Include name and email, or clear them if no approver selected
            additionalApproverName: selectedApproverDetails ? selectedApproverDetails.name : "",
            additionalApproverEmail: selectedApproverDetails ? selectedApproverDetails.email : "",
        };

        // If no approver selected, also clear the proof files
        if (!approverId) {
            updatedFormData.additionalApproverProof = null;
            // Clear the file arrays
            setApproverProofFiles([]);
            setApproverProofPreviews([]);
        }

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };

    // Enhanced file upload handler for multiple files
    const handleApproverProofUpload = async (e) => {
        console.log("Uploading files", e.target.files);
        const files = Array.from(e.target.files);

        if (files.length === 0) return;

        try {
            const uploadPromises = files.map(async (file) => {
                console.log("Processing file:", file.name);

                // Create preview data for each file
                let previewData = {
                    file: file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    preview: null,
                    uploadedUrl: null,
                };

                // Create preview URL for images
                if (file.type.startsWith("image/")) {
                    previewData.preview = URL.createObjectURL(file);
                }

                // Upload file
                const data = await uploadFiles(file, file.type, reqId);
                previewData.uploadedUrl = data.data.fileUrls[0];
                console.log(
                    "File uploaded successfully:",
                    previewData.uploadedUrl
                );

                return previewData;
            });

            const uploadedFiles = await Promise.all(uploadPromises);

            // Update state with new files (append to existing)
            setApproverProofFiles((prev) => [...prev, ...uploadedFiles]);
            setApproverProofPreviews((prev) => [...prev, ...uploadedFiles]);

            // Update form data with all uploaded URLs
            const allUploadedUrls = [
                ...approverProofFiles,
                ...uploadedFiles,
            ].map((f) => f.uploadedUrl);
            const updatedFormData = {
                ...localFormData,
                additionalApproverProof: allUploadedUrls,
            };

            setLocalFormData(updatedFormData);
            setFormData(updatedFormData);

            // Clear the input
            e.target.value = "";
        } catch (error) {
            console.error("File upload failed:", error);
            toast.error("File upload failed. Please try again.");
        }
    };

    // Function to remove a specific file
    const handleRemoveApproverProof = (indexToRemove) => {
        const fileToRemove = approverProofFiles[indexToRemove];

        // Clean up preview URL if it exists
        if (fileToRemove?.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
        }

        // Remove file from arrays
        const updatedFiles = approverProofFiles.filter(
            (_, index) => index !== indexToRemove
        );
        const updatedPreviews = approverProofPreviews.filter(
            (_, index) => index !== indexToRemove
        );

        setApproverProofFiles(updatedFiles);
        setApproverProofPreviews(updatedPreviews);

        // Update form data
        const updatedUrls = updatedFiles.map((f) => f.uploadedUrl);
        const updatedFormData = {
            ...localFormData,
            additionalApproverProof:
                updatedUrls.length > 0 ? updatedUrls : null,
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };

    // Function to view/download file
    const handleViewFile = (fileData) => {
        if (fileData.uploadedUrl) {
            // Open in new tab for viewing
            window.open(fileData.uploadedUrl, "_blank");
        } else if (fileData.preview) {
            // For local image previews
            window.open(fileData.preview, "_blank");
        }
    };

    // Enhanced File Preview Component with PDF support and multiple files
    const FilePreview = () => {
        if (!approverProofFiles || approverProofFiles.length === 0) return null;

        return (
            <div className="mt-3 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                    Uploaded Files ({approverProofFiles.length})
                </h4>
                {approverProofFiles.map((fileData, index) => (
                    <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                {fileData.preview &&
                                    fileData.type.startsWith("image/") ? (
                                    // Image preview
                                    <img
                                        src={fileData.preview}
                                        alt="File preview"
                                        className="w-12 h-12 object-cover rounded border flex-shrink-0"
                                    />
                                ) : (
                                    // File icon based on type
                                    <div className="w-12 h-12 bg-blue-100 rounded border flex items-center justify-center flex-shrink-0">
                                        {fileData.type === "application/pdf" ? (
                                            <span className="text-red-600 text-xs font-bold">
                                                PDF
                                            </span>
                                        ) : fileData.type.includes("word") ||
                                            fileData.name.endsWith(".doc") ||
                                            fileData.name.endsWith(".docx") ? (
                                            <span className="text-blue-600 text-xs font-bold">
                                                DOC
                                            </span>
                                        ) : (
                                            <span className="text-blue-600 text-xs font-medium">
                                                {fileData.name
                                                    .split(".")
                                                    .pop()
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {fileData.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(fileData.size / 1024).toFixed(1)} KB
                                    </p>
                                    {fileData.uploadedUrl && (
                                        <p className="text-xs text-green-600">
                                            ✓ Uploaded
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                                {/* View/Download button */}
                                <button
                                    type="button"
                                    onClick={() => handleViewFile(fileData)}
                                    className="text-blue-500 hover:text-blue-700 transition duration-200 text-xs px-2 py-1 border border-blue-300 rounded"
                                    title="View file"
                                >
                                    View
                                </button>
                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRemoveApproverProof(index)
                                    }
                                    className="text-red-500 hover:text-red-700 transition duration-200"
                                    title="Remove file"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const validateForm = async () => {
        try {
            await CommercialValidationSchema.validate(localFormData, {
                abortEarly: false,
            });
            setErrors({});
            return true;
        } catch (yupError) {
            if (yupError.inner) {
                const formErrors = yupError.inner.reduce((acc, error) => {
                    acc[error.path] = error.message;
                    return acc;
                }, {});

                setErrors(formErrors);
                const firstErrorKey = Object.keys(formErrors)[0];
                if (firstErrorKey) {
                    toast.error(formErrors[firstErrorKey]);
                }
            }
            return false;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let updatedFormData = {
            ...localFormData,
            [name]: value,
        };

        if (name === "paymentMode" && value === "creditcard") {
            updatedFormData.paymentTerms = [
                {
                    percentageTerm: "100",
                    paymentTerm: "Immediate",
                    paymentType: "Full Payment",
                },
            ];
            updatedFormData.isCreditCardSelected = true;
        } else if (name === "paymentMode") {
            updatedFormData.isCreditCardSelected = false;
        }

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleEntityChange = (e) => {
        const selectedEntityName = e.target.value;

        const matchingEntities = entities.filter(
            (entity) => entity.entityName === selectedEntityName
        );

        if (matchingEntities.length > 0) {
            setEntityVariants(matchingEntities);

            // derive bill/ship from all variants (will be narrowed further on city/site)
            const billToOptions = matchingEntities.map((entity) => ({
                value: `${entity.addressLine}\n\nTax ID: ${entity.taxId || "N/A"}\nTax Type: ${entity.type || "N/A"}`,
                label: `${entity.addressLine} - ${entity.city || "N/A"}`,
                entity,
            }));
            const shipToOptions = matchingEntities.map((entity) => ({
                value: `${entity.addressLine}\n\nTax ID: ${entity.taxId || "N/A"}\nTax Type: ${entity.type || "N/A"}`,
                label: `${entity.addressLine} - ${entity.city || "N/A"}`,
                entity,
            }));
            setAvailableBillToOptions(billToOptions);
            setAvailableShipToOptions(shipToOptions);

            // derive cities for the selected entity
            const uniqueCities = [...new Set(matchingEntities.map(m => m.city).filter(Boolean))].sort();

            if (matchingEntities.length === 1) {
                const selectedEntity = matchingEntities[0];
                setSelectedEntityDetails(selectedEntity);
                setSelectedEntityVariant(selectedEntity._id);

                const formattedAddress = `${selectedEntity.addressLine}\n\nTax ID: ${selectedEntity.taxId || "N/A"}\nTax Type: ${selectedEntity.type || "N/A"}`;

                const updatedFormData = {
                    ...localFormData,
                    entity: selectedEntityName,
                    entityId: selectedEntity._id,
                    city: selectedEntity.city || "",
                    site: selectedEntity.area || selectedEntity.site || "",
                    billTo: formattedAddress,
                    shipTo: formattedAddress,
                };
                setLocalFormData(updatedFormData);
                setFormData(updatedFormData);
                setCitySearchTerm(selectedEntity.city || "");
                setSiteSearchTerm(selectedEntity.area || selectedEntity.site || "");

                // set city/site arrays from single variant
                setAvailableCities(uniqueCities);
                setFilteredCities(uniqueCities);
                const uniqueSites = [...new Set([selectedEntity.site || selectedEntity.area].filter(Boolean))].sort();
                setAvailableSites(uniqueSites);
                setFilteredSites(uniqueSites);
            } else {
                // Multiple variants for the same entity
                const updatedFormData = {
                    ...localFormData,
                    entity: selectedEntityName,
                    entityId: "",
                    city: "",
                    site: "",
                    billTo: "",
                    shipTo: "",
                };
                setLocalFormData(updatedFormData);
                setFormData(updatedFormData);

                // set city list for UI; auto-select if unique
                setAvailableCities(uniqueCities);
                setFilteredCities(uniqueCities);
                if (uniqueCities.length === 1) {
                    const onlyCity = uniqueCities[0];
                    setCitySearchTerm(onlyCity);

                    // Filter to that city and derive sites and bill/ship
                    const cityVariants = matchingEntities.filter(m => (m.city || "") === onlyCity);
                    const uniqueSites = [...new Set(cityVariants.map(m => m.site || m.area).filter(Boolean))].sort();
                    setAvailableSites(uniqueSites);
                    setFilteredSites(uniqueSites);

                    if (uniqueSites.length === 1) {
                        const onlySite = uniqueSites[0];
                        setSiteSearchTerm(onlySite);
                        // set selected details for the first match of city+site
                        const variant = cityVariants.find(v => (v.site || v.area) === onlySite) || cityVariants[0];
                        setSelectedEntityDetails(variant);
                        setSelectedEntityVariant(variant._id);
                        const formattedAddress = `${variant.addressLine}\n\nTax ID: ${variant.taxId || "N/A"}\nTax Type: ${variant.type || "N/A"}`;
                        const updatedAutoForm = {
                            ...updatedFormData,
                            city: onlyCity,
                            site: onlySite,
                            billTo: formattedAddress,
                            shipTo: formattedAddress,
                        };
                        setLocalFormData(updatedAutoForm);
                        setFormData(updatedAutoForm);
                    } else {
                        setCitySearchTerm(onlyCity);
                        setSiteSearchTerm("");
                    }
                } else {
                    setCitySearchTerm("");
                    setSiteSearchTerm("");
                    setAvailableSites([]);
                    setFilteredSites([]);
                }
            }

            if (errors.entity) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.entity;
                    return newErrors;
                });
            }
        }
    };

    const handleBillToChange = (e) => {
        const selectedValue = e.target.value;
        const selectedOption = availableBillToOptions.find(
            (option) => option.value === selectedValue
        );

        if (selectedOption) {
            const updatedFormData = {
                ...localFormData,
                billTo: selectedValue,
                city: selectedOption.entity.city || "",
                site: selectedOption.entity.area || selectedOption.entity.site || "",
                entityId: selectedOption.entity._id,
            };

            setLocalFormData(updatedFormData);
            setFormData(updatedFormData);
            setSelectedEntityDetails(selectedOption.entity);

            // Update search terms
            setCitySearchTerm(selectedOption.entity.city || "");
            setSiteSearchTerm(selectedOption.entity.area || selectedOption.entity.site || "");
        }
    };

    const handleShipToChange = (e) => {
        const selectedValue = e.target.value;

        const updatedFormData = {
            ...localFormData,
            shipTo: selectedValue,
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };

    const handlePaymentTermChange = (e, index) => {
        const { name, value } = e.target;
        const updatedPaymentTerms = [...localFormData.paymentTerms];

        const updatedTerm = { ...updatedPaymentTerms[index] };

        if (name === "paymentTerm") {
            updatedTerm[name] = value;
            if (value !== "Others") {
                updatedTerm.customPaymentTerm = "";
            }
        } else if (name === "paymentType") {
            updatedTerm[name] = value;
            if (value !== "Others") {
                updatedTerm.customPaymentType = "";
            }
        } else {
            updatedTerm[name] = value;
        }

        updatedPaymentTerms[index] = updatedTerm;

        const updatedFormData = {
            ...localFormData,
            paymentTerms: updatedPaymentTerms,
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);

        if (errors.paymentTerms?.[index]?.[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                if (newErrors.paymentTerms?.[index]) {
                    delete newErrors.paymentTerms[index][name];
                }
                return newErrors;
            });
        }
    };

    const handleCustomTermChange = (e, index, fieldType) => {
        const { value } = e.target;
        const updatedPaymentTerms = [...localFormData.paymentTerms];

        updatedPaymentTerms[index] = {
            ...updatedPaymentTerms[index],
            [fieldType]: value,
        };

        const updatedFormData = {
            ...localFormData,
            paymentTerms: updatedPaymentTerms,
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };

    const handleAddMorePaymentTerm = () => {
        const updatedFormData = {
            ...localFormData,
            paymentTerms: [
                ...localFormData.paymentTerms,
                {
                    percentageTerm: "",
                    paymentTerm: "",
                    paymentType: "",
                    customPaymentTerm: "",
                    customPaymentType: "",
                },
            ],
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };

    const handleDeletePaymentTerm = (indexToRemove) => {
        const updatedPaymentTerms = localFormData.paymentTerms.filter(
            (_, index) => index !== indexToRemove
        );

        const updatedFormData = {
            ...localFormData,
            paymentTerms: updatedPaymentTerms,
        };

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };

    const handleNextStep = async () => {
        const isValid = await validateForm();
        if (isValid) {
            const submissionData = prepareSubmissionData();
            console.log(submissionData);
            const response = await saveCommercialData(submissionData, empId);
            toast.success(response.data.message)

            if (response.status === 200) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                }));
                onNext();
            }
        }
    };

    // Handle click outside for all dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".site-dropdown")) {
                setIsSiteSearchFocused(false);
            }
            if (!event.target.closest(".city-dropdown")) {
                setIsCitySearchFocused(false);
            }
            if (!event.target.closest(".relative")) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const prepareSubmissionData = () => {
        const preparedData = { ...localFormData };

        preparedData.paymentTerms = localFormData.paymentTerms.map((term) => {
            const transformedTerm = { ...term };

            if (term.paymentTerm === "Others" && term.customPaymentTerm) {
                transformedTerm.paymentTerm = term.customPaymentTerm;
            }

            if (term.paymentType === "Others" && term.customPaymentType) {
                transformedTerm.paymentType = term.customPaymentType;
            }

            delete transformedTerm.customPaymentTerm;
            delete transformedTerm.customPaymentType;

            return transformedTerm;
        });

        return preparedData;
    };

    const PaymentTermInfoModal = () => {
        if (!showPaymentTermInfo) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Payment Term Information
                        </h3>
                        <button
                            onClick={() => setShowPaymentTermInfo(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Enter 100% if full amount to be paid upfront; otherwise,
                        select the appropriate %
                    </p>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => setShowPaymentTermInfo(false)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition duration-300"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render functions for city and site fields
    const renderCityField = () => {
        return (
            <div className="city-dropdown relative w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={citySearchTerm}
                        onChange={(e) => {
                            setCitySearchTerm(e.target.value);
                            const filtered = availableCities.filter((city) =>
                                city
                                    .toLowerCase()
                                    .includes(e.target.value.toLowerCase())
                            );
                            setFilteredCities(filtered);
                        }}
                        onFocus={() => setIsCitySearchFocused(true)}
                        placeholder="Search city..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                    />
                    <Search
                        className="absolute right-3 top-3.5 text-gray-400"
                        size={20}
                    />
                </div>

                {isCitySearchFocused && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredCities.length > 0 ? (
                            filteredCities.map((city) => (
                                <div
                                    key={city}
                                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                                    onClick={() => handleCityChange(city)}
                                >
                                    <span className="font-medium">{city}</span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-gray-500">
                                No cities found
                            </div>
                        )}
                    </div>
                )}
                {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
            </div>
        );
    };

    const renderSiteField = () => {
        return (
            <div className="site-dropdown relative w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Site
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={siteSearchTerm}
                        onChange={(e) => {
                            setSiteSearchTerm(e.target.value);
                            const filtered = availableSites.filter((site) =>
                                site
                                    .toLowerCase()
                                    .includes(e.target.value.toLowerCase())
                            );
                            setFilteredSites(filtered);
                        }}
                        onFocus={() => setIsSiteSearchFocused(true)}
                        placeholder="Search site..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                    />
                    <Search
                        className="absolute right-3 top-3.5 text-gray-400"
                        size={20}
                    />
                </div>

                {isSiteSearchFocused && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredSites.length > 0 ? (
                            filteredSites.map((site) => (
                                <div
                                    key={site}
                                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                                    onClick={() => handleSiteChange(site)}
                                >
                                    <span className="font-medium">{site}</span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-gray-500">
                                No sites found
                            </div>
                        )}
                    </div>
                )}
                {errors.site && (
                    <p className="text-red-500 text-xs mt-1">{errors.site}</p>
                )}
            </div>
        );
    };

    const renderDepartmentField = () => {
        if (isDropDown) {
            const cc1Options = Array.from(
                new Set(
                    availableDepartments
                        .map((d) => (d.department || "").split(":")[0].trim())
                        .filter(Boolean)
                )
            ).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

            return (
                <div className="relative w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cost Center <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="w-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Center 1</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cc1SearchTerm || selectedCC1}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCc1SearchTerm(val);
                                        setIsCc1Focused(true);
                                    }}
                                    onFocus={() => setIsCc1Focused(true)}
                                    placeholder="Search cost center 1..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                                />
                                <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
                                {isCc1Focused && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {cc1Options
                                            .filter((opt) => opt.toLowerCase().includes((cc1SearchTerm || "").toLowerCase()))
                                            .map((opt) => (
                                                <div
                                                    key={opt}
                                                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                                                    onClick={() => {
                                                        setSelectedCC1(opt);
                                                        setCc1SearchTerm(opt);
                                                        setIsCc1Focused(false);
                                                        setCc2SearchTerm("");
                                                        setIsCc2Focused(false);
                                                        setSelectedDepartment(null);
                                                        setApprovers([]);
                                                        const updatedFormData = {
                                                            ...localFormData,
                                                            department: "",
                                                            hod: "",
                                                            hodEmail: "",
                                                        };
                                                        setLocalFormData(updatedFormData);
                                                        setFormData(updatedFormData);
                                                    }}
                                                >
                                                    <span className="font-medium">{opt}</span>
                                                </div>
                                            ))}
                                        {cc1Options.filter((opt) => opt.toLowerCase().includes((cc1SearchTerm || "").toLowerCase())).length === 0 && (
                                            <div className="px-4 py-3 text-gray-500">No options found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.department && !selectedCC1 && (
                                <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                            )}
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Center 2</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cc2SearchTerm}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setCc2SearchTerm(val);
                                        setIsCc2Focused(true);
                                    }}
                                    onFocus={() => setIsCc2Focused(true)}
                                    placeholder={selectedCC1 ? "Search cost center 2..." : "Select Cost Center 1 first"}
                                    disabled={!selectedCC1}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300 ${!selectedCC1
                                        ? "border-gray-300 bg-gray-100"
                                        : "border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        }`}
                                />
                                <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />

                                {isCc2Focused && selectedCC1 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {cc2Options
                                            .filter((opt) => opt.toLowerCase().includes(cc2SearchTerm.toLowerCase()))
                                            .map((opt) => (
                                                <div
                                                    key={opt}
                                                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                                                    onClick={() => {
                                                        const full = `${selectedCC1} : ${opt}`;
                                                        setCc2SearchTerm(opt);
                                                        setIsCc2Focused(false);
                                                        setSearchTerm(full);
                                                        const deptObj = availableDepartments.find((d) => d.department === full);
                                                        if (deptObj) {
                                                            handleDepartmentChange(deptObj);
                                                        } else {
                                                            const updatedFormData = {
                                                                ...localFormData,
                                                                department: full,
                                                                hod: "",
                                                                hodEmail: "",
                                                            };
                                                            setLocalFormData(updatedFormData);
                                                            setFormData(updatedFormData);
                                                            setSelectedDepartment(null);
                                                            setApprovers([]);
                                                        }
                                                    }}
                                                >
                                                    <span className="font-medium">{opt}</span>
                                                </div>
                                            ))}
                                        {cc2Options.filter((opt) => opt.toLowerCase().includes(cc2SearchTerm.toLowerCase())).length === 0 && (
                                            <div className="px-4 py-3 text-gray-500">No options found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {errors.department && (
                        <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                    )}
                </div>
            );
        }

        return (
            <div className="relative w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cost Center <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={formData.department || empDepartment}
                    className="w-full px-4 py-3 border-2 bg-gray-100 border-gray-500 rounded-lg"
                    placeholder=""
                    readOnly
                />
                {errors.department && (
                    <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                )}
            </div>
        );
    };

    const renderApproverField = () => {
        if (isDropDown) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Approver <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={localFormData.hod}
                            onChange={handleApproverChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            disabled={!selectedDepartment}
                        >
                            <option value="">Select Approver</option>
                            {approvers.map((approver, index) => (
                                <option key={index} value={approver.hod}>
                                    {approver.hod}
                                </option>
                            ))}
                        </select>
                        {errors.hod && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.hod}
                            </p>
                        )}
                    </div>

                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Additional Approver
                        </label>
                        <select
                            value={selectedAdditionalApprover}
                            onChange={handleAdditionalApproverChange}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        >
                            <option value="">Select Additional Approver</option>
                            {additionalApprovers.map((approver) => (
                                <option key={approver.id} value={approver.id}>
                                    {approver.id} - {approver.name} - {approver.email} - {approver.department}
                                </option>
                            ))}
                        </select>

                        {selectedAdditionalApprover && (
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Proof{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-300">
                                            <Upload
                                                size={16}
                                                className="mr-2"
                                            />
                                            Choose Files
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={
                                                    handleApproverProofUpload
                                                }
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                multiple
                                            />
                                        </label>
                                        <span className="text-xs text-gray-500">
                                            PDF, DOC, DOCX, JPG, PNG (Max 5MB
                                            each) - Multiple files allowed
                                        </span>
                                    </div>
                                    <FilePreview />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Approver <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="hod"
                        value={localFormData.hod}
                        readOnly
                        className="w-full px-4 py-3 border-2 border-gray-500 rounded-lg bg-gray-100"
                        placeholder="HOD will be auto-populated"
                    />
                    {errors.hod && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.hod}
                        </p>
                    )}
                </div>

                <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Additional Approver
                    </label>
                    <select
                        value={selectedAdditionalApprover}
                        onChange={handleAdditionalApproverChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                    >
                        <option value="">Select Additional Approver</option>
                        {additionalApprovers.map((approver) => (
                            <option key={approver.id} value={approver.id}>
                                {approver.id} - {approver.name} - {approver.email} - {approver.department}
                            </option>
                        ))}
                    </select>

                    {selectedAdditionalApprover && (
                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Proof{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition duration-300">
                                        <Upload size={16} className="mr-2" />
                                        Choose Files
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleApproverProofUpload}
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            multiple
                                        />
                                    </label>
                                    <span className="text-xs text-gray-500">
                                        PDF, DOC, DOCX, JPG, PNG (Max 5MB each)
                                        - Multiple files allowed
                                    </span>
                                </div>
                                <FilePreview />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderBusinessUnitField = () => (
        <div className="w-full">
            <label className="block text-sm font-semibold text-primary mb-2">
                Business Unit <span className="text-red-500">*</span>
            </label>
            <select
                onChange={handleBusinessUnitChange}
                value={localFormData.businessUnit}
                name="businessUnit"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            >
                <option value="">Select Business Unit</option>
                {availableBusinessUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                        {unit.label}
                    </option>
                ))}
            </select>
            {errors.businessUnit && (
                <p className="text-red-500 text-xs mt-1">
                    {errors.businessUnit}
                </p>
            )}
        </div>
    );

    const toTitleCase = (str) => {
        if (!str) return "";
        return str
            .toLowerCase()
            .split(" ")
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    };

    const renderEntityField = () => {
        const names = [
            ...new Set(entities.map((e) => e.entityName).filter(Boolean)),
        ].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        return (
            <div className="w-full">
                <label className="block text-sm font-semibold text-primary mb-2">
                    Entity <span className="text-red-500">*</span>
                </label>
                <div className="relative" ref={entityRef}>
                    <input
                        type="text"
                        name="entity"
                        value={entitySearchTerm || localFormData.entity}
                        onChange={(e) => {
                            setEntitySearchTerm(e.target.value);
                            setIsEntityFocused(true);
                        }}
                        onFocus={() => setIsEntityFocused(true)}
                        placeholder="Search entity..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />

                    {isEntityFocused && (
                        <div className="absolute left-0 z-30 mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-96 overflow-y-auto min-w-[20rem] md:min-w-[20rem]">
                            {names
                                .filter((n) =>
                                    (entitySearchTerm || "")
                                        .toLowerCase()
                                        ? n.toLowerCase().includes(entitySearchTerm.toLowerCase())
                                        : true
                                )
                                .map((entityName) => (
                                    <button
                                        type="button"
                                        key={entityName}
                                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-800"
                                        onClick={() => {
                                            setEntitySearchTerm(entityName);
                                            setIsEntityFocused(false);
                                            handleEntityChange({ target: { value: entityName } });
                                        }}
                                        title={toTitleCase(entityName)}
                                    >
                                        <span className="block whitespace-normal break-words">{toTitleCase(entityName)}</span>
                                    </button>
                                ))}
                            {names.filter((n) => (entitySearchTerm || "").toLowerCase() ? n.toLowerCase().includes(entitySearchTerm.toLowerCase()) : true).length === 0 && (
                                <div className="px-4 py-3 text-xs text-gray-500">No entities found</div>
                            )}
                        </div>
                    )}
                </div>
                {errors.entity && (
                    <p className="text-red-500 text-xs mt-1">{errors.entity}</p>
                )}
            </div>
        );
    };

    return (
        <div className="w-full mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
            <PaymentTermInfoModal />

            <div className="bg-gradient-to-r from-primary to-primary p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white text-center">
                    Commercial Details
                </h2>
            </div>

            <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {renderBusinessUnitField()}
                    {renderEntityField()}
                    {renderCityField()}
                    {renderSiteField()}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {renderDepartmentField()}
                    {renderApproverField()}
                </div>

                <div className="space-y-4">
                    <div className="mb-2 sm:mb-4 flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                            Payment Term
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowPaymentTermInfo(true)}
                            className="text-blue-500 hover:text-blue-700 transition duration-300"
                        >
                            <Info size={18} />
                        </button>
                    </div>

                    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                        <div className="min-w-max sm:min-w-0 sm:w-full">
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-200">
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Percentage Term{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Payment Term{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Payment Type{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {localFormData.paymentTerms.map(
                                        (term, index) => (
                                            <tr
                                                key={index}
                                                className="border-b hover:bg-gray-50 transition duration-200"
                                            >
                                                <td className="px-2 sm:px-4 py-2 sm:py-3">
                                                    <input
                                                        type="number"
                                                        name="percentageTerm"
                                                        value={
                                                            term.percentageTerm
                                                        }
                                                        onChange={(e) =>
                                                            handlePaymentTermChange(
                                                                e,
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            localFormData.isCreditCardSelected
                                                        }
                                                        className={`w-full px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg ${localFormData.isCreditCardSelected
                                                            ? "bg-gray-100 cursor-not-allowed"
                                                            : "focus:ring-2 focus:ring-primary"
                                                            } focus:outline-none focus:border-transparent transition duration-300`}
                                                        placeholder="Enter %"
                                                        style={{
                                                            appearance: "none",
                                                            MozAppearance:
                                                                "textfield",
                                                            WebkitAppearance:
                                                                "none",
                                                        }}
                                                    />
                                                    {errors.paymentTerms?.[
                                                        index
                                                    ]?.percentageTerm && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {
                                                                    errors
                                                                        .paymentTerms[
                                                                        index
                                                                    ].percentageTerm
                                                                }
                                                            </p>
                                                        )}
                                                </td>

                                                <td className="px-2 sm:px-4 py-2 sm:py-3">
                                                    <select
                                                        name="paymentTerm"
                                                        value={term.paymentTerm}
                                                        onChange={(e) =>
                                                            handlePaymentTermChange(
                                                                e,
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            localFormData.isCreditCardSelected
                                                        }
                                                        className={`w-full px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm ${localFormData.isCreditCardSelected
                                                            ? "bg-gray-100 cursor-not-allowed"
                                                            : "focus:ring-2 focus:ring-primary"
                                                            } focus:outline-none focus:border-transparent transition duration-300`}
                                                    >
                                                        <option value="">
                                                            Select Payment Term
                                                        </option>
                                                        <option value="Immediate">
                                                            Immediate
                                                        </option>
                                                        <option value="30 days credit period">
                                                            30 days credit
                                                            period
                                                        </option>
                                                        <option value="45 days credit period">
                                                            45 days credit
                                                            period
                                                        </option>
                                                        <option value="60 days credit period">
                                                            60 days credit
                                                            period
                                                        </option>
                                                        <option value="90 days credit period">
                                                            90 days credit
                                                            period
                                                        </option>
                                                        <option value="Others">
                                                            Others
                                                        </option>
                                                    </select>
                                                    {term.paymentTerm ===
                                                        "Others" && (
                                                            <input
                                                                type="text"
                                                                value={
                                                                    term.customPaymentTerm ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleCustomTermChange(
                                                                        e,
                                                                        index,
                                                                        "customPaymentTerm"
                                                                    )
                                                                }
                                                                disabled={
                                                                    localFormData.isCreditCardSelected
                                                                }
                                                                className="w-full mt-2 px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent transition duration-300"
                                                                placeholder="Specify payment term"
                                                            />
                                                        )}
                                                    {errors.paymentTerms?.[
                                                        index
                                                    ]?.paymentTerm && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {
                                                                    errors
                                                                        .paymentTerms[
                                                                        index
                                                                    ].paymentTerm
                                                                }
                                                            </p>
                                                        )}
                                                    {term.paymentTerm ===
                                                        "Others" &&
                                                        errors.paymentTerms?.[
                                                            index
                                                        ]
                                                            ?.customPaymentTerm && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {
                                                                    errors
                                                                        .paymentTerms[
                                                                        index
                                                                    ]
                                                                        .customPaymentTerm
                                                                }
                                                            </p>
                                                        )}
                                                </td>

                                                <td className="px-2 sm:px-4 py-2 sm:py-3">
                                                    <select
                                                        name="paymentType"
                                                        value={term.paymentType}
                                                        onChange={(e) =>
                                                            handlePaymentTermChange(
                                                                e,
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            localFormData.isCreditCardSelected
                                                        }
                                                        className={`w-full px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm ${localFormData.isCreditCardSelected
                                                            ? "bg-gray-100 cursor-not-allowed"
                                                            : "focus:ring-2 focus:ring-primary"
                                                            } focus:outline-none focus:border-transparent transition duration-300`}
                                                    >
                                                        <option value="">
                                                            Select Payment Type
                                                        </option>
                                                        <option value="Full Payment">
                                                            Full Payment
                                                        </option>
                                                        <option value="Advance Payment">
                                                            Advance Payment
                                                        </option>
                                                        <option value="Payment on Delivery">
                                                            Payment on Delivery
                                                        </option>
                                                        <option value="Part Payment">
                                                            Part Payment
                                                        </option>
                                                        <option value="Others">
                                                            Others
                                                        </option>
                                                    </select>
                                                    {term.paymentType ===
                                                        "Others" && (
                                                            <input
                                                                type="text"
                                                                value={
                                                                    term.customPaymentType ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleCustomTermChange(
                                                                        e,
                                                                        index,
                                                                        "customPaymentType"
                                                                    )
                                                                }
                                                                disabled={
                                                                    localFormData.isCreditCardSelected
                                                                }
                                                                className="w-full mt-2 px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:outline-none focus:border-transparent transition duration-300"
                                                                placeholder="Specify payment type"
                                                            />
                                                        )}
                                                    {errors.paymentTerms?.[
                                                        index
                                                    ]?.paymentType && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {
                                                                    errors
                                                                        .paymentTerms[
                                                                        index
                                                                    ].paymentType
                                                                }
                                                            </p>
                                                        )}
                                                    {term.paymentType ===
                                                        "Others" &&
                                                        errors.paymentTerms?.[
                                                            index
                                                        ]
                                                            ?.customPaymentType && (
                                                            <p className="text-red-500 text-xs mt-1">
                                                                {
                                                                    errors
                                                                        .paymentTerms[
                                                                        index
                                                                    ]
                                                                        .customPaymentType
                                                                }
                                                            </p>
                                                        )}
                                                </td>

                                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-right">
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeletePaymentTerm(
                                                                    index
                                                                )
                                                            }
                                                            disabled={
                                                                localFormData.isCreditCardSelected ||
                                                                index === 0
                                                            }
                                                            className={`flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition duration-300 text-xs sm:text-sm ${localFormData.isCreditCardSelected ||
                                                                index === 0
                                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                                : "bg-red-500 text-white hover:bg-red-700"
                                                                }`}
                                                        >
                                                            <Trash2
                                                                size={16}
                                                                className="mr-1 sm:mr-2 hidden sm:inline"
                                                            />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-2 sm:mt-4 flex justify-start">
                        <button
                            type="button"
                            onClick={handleAddMorePaymentTerm}
                            className={`${localFormData.isCreditCardSelected
                                ? "bg-gray-300 text-black"
                                : "bg-primary text-white"
                                } flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-primary-dark transition duration-300 text-xs sm:text-sm`}
                            disabled={localFormData.isCreditCardSelected}
                        >
                            <PlusCircle size={16} className="mr-1 sm:mr-2" />
                            Add Payment Term
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Bill To <span className="text-red-500">*</span>
                        </label>
                        {availableBillToOptions.length > 1 ? (
                            <select
                                name="billTo"
                                value={localFormData.billTo}
                                onChange={handleBillToChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            >
                                <option value="">Select Bill To Address</option>
                                {availableBillToOptions.map((option, index) => (
                                    <option key={index} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <textarea
                                name="billTo"
                                value={localFormData.billTo}
                                readOnly={!!selectedEntityDetails}
                                onChange={
                                    !selectedEntityDetails
                                        ? handleInputChange
                                        : undefined
                                }
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300 ${selectedEntityDetails
                                    ? "border-gray-500 bg-gray-100"
                                    : "border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    }`}
                                placeholder="Enter Bill To"
                                rows={window.innerWidth < 640 ? "4" : "6"}
                            ></textarea>
                        )}
                        {errors.billTo && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.billTo}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ship To <span className="text-red-500">*</span>
                        </label>
                        {availableShipToOptions.length > 1 ? (
                            <select
                                name="shipTo"
                                value={localFormData.shipTo}
                                onChange={handleShipToChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                            >
                                <option value="">Select Ship To Address</option>
                                {availableShipToOptions.map((option, index) => (
                                    <option key={index} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <textarea
                                name="shipTo"
                                value={localFormData.shipTo}
                                readOnly={!!selectedEntityDetails}
                                onChange={
                                    !selectedEntityDetails
                                        ? handleInputChange
                                        : undefined
                                }
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300 ${selectedEntityDetails
                                    ? "border-gray-500 bg-gray-100"
                                    : "border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    }`}
                                placeholder="Enter Ship To"
                                rows={window.innerWidth < 640 ? "4" : "6"}
                            ></textarea>
                        )}
                        {errors.shipTo && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.shipTo}
                            </p>
                        )}
                    </div>
                </div>
                <div className="mt-4 sm:mt-8 flex justify-end">
                    <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 sm:px-10 py-2 sm:py-3 bg-gradient-to-r from-primary to-primary text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Commercials;