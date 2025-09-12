import { PlusCircle, Search, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
    getAllEntityData,
    editCommercials,
} from "../../../../api/service/adminServices";
import { toast } from "react-toastify";
import { CommercialValidationSchema } from "../yupValidation/commercialValidation";
import businessUnits from "../dropDownData/businessUnit";
import uploadFiles from "../../../../utils/s3BucketConfig";

const CommercialsDetails = ({ formData, setFormData, onNext, reqId }) => {
    const empDepartment = localStorage.getItem("department");
    const empId = localStorage.getItem("userId");
    const [isDropDown, setIsDropDown] = useState(false);
    const [approvers, setApprovers] = useState([]);
    const [filteredApprovers, setFilteredApprovers] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [availableBusinessUnits, setAvailableBusinessUnits] = useState([]);

    const [entityVariants, setEntityVariants] = useState([]);
    const [selectedEntityVariant, setSelectedEntityVariant] = useState("");
    const [availableBillToOptions, setAvailableBillToOptions] = useState([]);
    const [availableShipToOptions, setAvailableShipToOptions] = useState([]);
    const [availableCities, setAvailableCities] = useState([]);
    const [availableSites, setAvailableSites] = useState([]);

    // Additional Approver states
    const [additionalApprovers, setAdditionalApprovers] = useState([]);
    const [selectedAdditionalApprover, setSelectedAdditionalApprover] =
        useState("");
    const [approverProofFiles, setApproverProofFiles] = useState([]);
    const [approverProofPreviews, setApproverProofPreviews] = useState([]);

    // Mock data for additional approvers (alphabetically sorted)
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
        entity: formData?.entity || "",
        city: formData?.city || "",
        site: formData?.site || "",
        department: formData?.department || "",
        amount: formData?.amount || "",
        entityId: formData?.entityId || "",
        paymentTerms: formData?.paymentTerms || [
            {
                percentageTerm: 0,
                paymentTerm: "",
                paymentType: "",
                customPaymentTerm: "",
                customPaymentType: "",
            },
        ],
        billTo: formData?.billTo || "",
        shipTo: formData?.shipTo || "",
        hod: formData?.hod || "",
        hodEmail: formData?.hodEmail || "",
        businessUnit: formData?.businessUnit || "",
        isCreditCardSelected: formData?.isCreditCardSelected || false,
        // Additional approver fields
        additionalApprover: formData?.additionalApprover || "",
        additionalApproverName: formData?.additionalApproverName || "",
        additionalApproverEmail: formData?.additionalApproverEmail || "",
        additionalApproverProof: formData?.additionalApproverProof || null,
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

    // Initialize additional approvers and existing files
    useEffect(() => {
        setAdditionalApprovers(mockAdditionalApprovers);

        // Set selected additional approver if exists in formData
        if (formData?.additionalApprover) {
            setSelectedAdditionalApprover(formData.additionalApprover);
        }

        // Initialize proof files if they exist
        if (formData?.additionalApproverProof) {
            const existingFiles = Array.isArray(
                formData.additionalApproverProof
            )
                ? formData.additionalApproverProof
                : [formData.additionalApproverProof];

            const fileObjects = existingFiles.map((url, index) => ({
                name: `Existing File ${index + 1}`,
                uploadedUrl: url,
                type: "application/pdf",
                size: 0,
                preview: null,
            }));

            setApproverProofFiles(fileObjects);
            setApproverProofPreviews(fileObjects);
        }
    }, [formData]);

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

    useEffect(() => {
        if (formData) {
            const newLocalFormData = {
                entity: formData.entity || "",
                city: formData.city || "",
                site: formData.site || "",
                department: formData.department || empDepartment || "",
                paymentMode: formData.paymentMode || "",
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
                // Additional approver fields
                additionalApprover: formData.additionalApprover || "",
                additionalApproverName: formData.additionalApproverName || "",
                additionalApproverEmail: formData.additionalApproverEmail || "",
                additionalApproverProof:
                    formData.additionalApproverProof || null,
            };

            setLocalFormData(newLocalFormData);
            setSearchTerm(formData.department || "");
        }
    }, [formData, empDepartment]);

    // Additional Approver Change Handler
    const handleAdditionalApproverChange = (e) => {
        const approverId = e.target.value;
        setSelectedAdditionalApprover(approverId);

        const selectedApproverDetails = additionalApprovers.find(
            (approver) => approver.id === approverId
        );

        const updatedFormData = {
            ...localFormData,
            additionalApprover: approverId,
            additionalApproverName: selectedApproverDetails
                ? selectedApproverDetails.name
                : "",
            additionalApproverEmail: selectedApproverDetails
                ? selectedApproverDetails.email
                : "",
        };

        if (!approverId) {
            updatedFormData.additionalApproverProof = null;
            setApproverProofFiles([]);
            setApproverProofPreviews([]);
        }

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);
    };
    useEffect(() => {
        if (formData?.entity && entities.length > 0) {
            // Find matching entities for the existing entity name
            const matchingEntities = entities.filter(
                (entity) => entity.entityName === formData.entity
            );

            if (matchingEntities.length > 0) {
                setEntityVariants(matchingEntities);

                // Prepare options for dropdowns
                const cityOptions = [
                    ...new Set(
                        matchingEntities
                            .map((entity) => entity.city)
                            .filter((city) => city)
                    ),
                ];
                const siteOptions = [
                    ...new Set(
                        matchingEntities
                            .map((entity) => entity.area || entity.site)
                            .filter((site) => site)
                    ),
                ];

                const billToOptions = matchingEntities.map((entity) => ({
                    value: `${entity.addressLine}\n\nTax ID: ${
                        entity.taxId || "N/A"
                    }\nTax Type: ${entity.type || "N/A"}`,
                    label: `${entity.addressLine} - ${entity.city || "N/A"}`,
                    entity: entity,
                }));

                const shipToOptions = matchingEntities.map((entity) => ({
                    value: `${entity.addressLine}\n\nTax ID: ${
                        entity.taxId || "N/A"
                    }\nTax Type: ${entity.type || "N/A"}`,
                    label: `${entity.addressLine} - ${entity.city || "N/A"}`,
                    entity: entity,
                }));

                setAvailableCities(cityOptions);
                setAvailableSites(siteOptions);
                setAvailableBillToOptions(billToOptions);
                setAvailableShipToOptions(shipToOptions);

                // If we have entityId in formData, find and set the specific entity
                if (formData.entityId) {
                    const specificEntity = matchingEntities.find(
                        (entity) => entity._id === formData.entityId
                    );
                    if (specificEntity) {
                        setSelectedEntityDetails(specificEntity);
                        setSelectedEntityVariant(specificEntity._id);
                    }
                }
            }
        }
    }, [formData?.entity, formData?.entityId, entities]);

    // Enhanced file upload handler for multiple files
    const handleApproverProofUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            const uploadPromises = files.map(async (file) => {
                let previewData = {
                    file: file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    preview: null,
                    uploadedUrl: null,
                };

                if (file.type.startsWith("image/")) {
                    previewData.preview = URL.createObjectURL(file);
                }

                const data = await uploadFiles(file, file.type, reqId);
                previewData.uploadedUrl = data.data.fileUrls[0];

                return previewData;
            });

            const uploadedFiles = await Promise.all(uploadPromises);

            setApproverProofFiles((prev) => [...prev, ...uploadedFiles]);
            setApproverProofPreviews((prev) => [...prev, ...uploadedFiles]);

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

            e.target.value = "";
        } catch (error) {
            console.error("File upload failed:", error);
            toast.error("File upload failed. Please try again.");
        }
    };

    // Function to remove a specific file
    const handleRemoveApproverProof = (indexToRemove) => {
        const fileToRemove = approverProofFiles[indexToRemove];

        if (fileToRemove?.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
        }

        const updatedFiles = approverProofFiles.filter(
            (_, index) => index !== indexToRemove
        );
        const updatedPreviews = approverProofPreviews.filter(
            (_, index) => index !== indexToRemove
        );

        setApproverProofFiles(updatedFiles);
        setApproverProofPreviews(updatedPreviews);

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
            window.open(fileData.uploadedUrl, "_blank");
        } else if (fileData.preview) {
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
                                    <img
                                        src={fileData.preview}
                                        alt="File preview"
                                        className="w-12 h-12 object-cover rounded border flex-shrink-0"
                                    />
                                ) : (
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
                                        {fileData.size
                                            ? (fileData.size / 1024).toFixed(
                                                  1
                                              ) + " KB"
                                            : "Unknown size"}
                                    </p>
                                    {fileData.uploadedUrl && (
                                        <p className="text-xs text-green-600">
                                            ✓ Uploaded
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                                <button
                                    type="button"
                                    onClick={() => handleViewFile(fileData)}
                                    className="text-blue-500 hover:text-blue-700 transition duration-200 text-xs px-2 py-1 border border-blue-300 rounded"
                                    title="View file"
                                >
                                    View
                                </button>
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

    useEffect(() => {
        const fetchEntity = async () => {
            try {
                const response = await getAllEntityData(empId);
                if (response.status === 200) {
                    const sortedEntities = (response.data.entities || []).sort(
                        (a, b) => a.entityName.localeCompare(b.entityName)
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

                        if (localFormData.businessUnit) {
                            const filtered = response.data.department.filter(
                                (dept) =>
                                    dept.businessUnit?.toLowerCase() ===
                                    localFormData.businessUnit.toLowerCase()
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
                            const departmentArray = Array.from(
                                deptMap.values()
                            );
                            setAvailableDepartments(departmentArray);
                            setFilteredDepartments(departmentArray);

                            if (localFormData.department) {
                                const deptData = departmentArray.find(
                                    (d) =>
                                        d.department ===
                                        localFormData.department
                                );
                                if (deptData) {
                                    setApprovers(deptData.approvers);
                                    setSelectedDepartment(deptData);
                                    setSearchTerm(localFormData.department);
                                }
                            }
                        }
                    } else {
                        const sortedBusinessUnits = businessUnits.sort((a, b) =>
                            a.label.localeCompare(b.label)
                        );
                        setAvailableBusinessUnits(sortedBusinessUnits);
                    }

                    if (!response.data.isDropDown && localFormData.department) {
                        const selectedDept = response.data.department.find(
                            (dept) =>
                                dept.department === localFormData.department
                        );
                        if (selectedDept) {
                            setLocalFormData((prev) => ({
                                ...prev,
                                businessUnit: formData.businessUnit,
                                department: selectedDept.department,
                                hod: selectedDept.hod,
                                hodEmail: selectedDept.hod_email_id,
                            }));
                            setFormData((prev) => ({
                                ...prev,
                                businessUnit: formData.businessUnit,
                                department: selectedDept.department,
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
    }, [empId, localFormData.businessUnit, localFormData.department]);

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

        // Clear previous entity-related state
        setEntityVariants([]);
        setSelectedEntityDetails(null);
        setSelectedEntityVariant("");
        setAvailableCities([]);
        setAvailableSites([]);
        setAvailableBillToOptions([]);
        setAvailableShipToOptions([]);

        const matchingEntities = entities.filter(
            (entity) => entity.entityName === selectedEntityName
        );

        if (matchingEntities.length > 0) {
            setEntityVariants(matchingEntities);

            // Prepare options for dropdowns
            const cityOptions = [
                ...new Set(
                    matchingEntities
                        .map((entity) => entity.city)
                        .filter((city) => city)
                ),
            ];
            const siteOptions = [
                ...new Set(
                    matchingEntities
                        .map((entity) => entity.area || entity.site)
                        .filter((site) => site)
                ),
            ];

            const billToOptions = matchingEntities.map((entity) => ({
                value: `${entity.addressLine}\n\nTax ID: ${
                    entity.taxId || "N/A"
                }\nTax Type: ${entity.type || "N/A"}`,
                label: `${entity.addressLine} - ${entity.city || "N/A"}`,
                entity: entity,
            }));

            const shipToOptions = matchingEntities.map((entity) => ({
                value: `${entity.addressLine}\n\nTax ID: ${
                    entity.taxId || "N/A"
                }\nTax Type: ${entity.type || "N/A"}`,
                label: `${entity.addressLine} - ${entity.city || "N/A"}`,
                entity: entity,
            }));

            setAvailableCities(cityOptions);
            setAvailableSites(siteOptions);
            setAvailableBillToOptions(billToOptions);
            setAvailableShipToOptions(shipToOptions);

            if (matchingEntities.length === 1) {
                // Single entity variant - auto-populate
                const selectedEntity = matchingEntities[0];
                setSelectedEntityDetails(selectedEntity);
                setSelectedEntityVariant(selectedEntity._id);

                const formattedAddress = `${
                    selectedEntity.addressLine
                }\n\nTax ID: ${selectedEntity.taxId || "N/A"}\nTax Type: ${
                    selectedEntity.type || "N/A"
                }`;

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
            } else {
                // Multiple entity variants - clear fields for selection
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
            }

            if (errors.entity) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.entity;
                    return newErrors;
                });
            }
        } else {
            // No matching entities - clear all related fields
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
        }
    };
    const renderEntityField = () => (
        <div className="w-full">
            <label className="block text-sm font-semibold text-primary mb-2">
                Entity <span className="text-red-500">*</span>
            </label>
            <select
                name="entity"
                value={localFormData.entity}
                onChange={handleEntityChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
            >
                <option value="">Select Entity</option>
                {[...new Set(entities.map((entity) => entity.entityName))]
                    .sort()
                    .map((entityName, index) => (
                        <option key={index} value={entityName}>
                            {entityName}
                        </option>
                    ))}
            </select>
            {errors.entity && (
                <p className="text-red-500 text-xs mt-1">{errors.entity}</p>
            )}
        </div>
    );

    const handleCityChange = (e) => {
        const selectedCity = e.target.value;

        const entitiesWithCity = entityVariants.filter(
            (entity) => entity.city === selectedCity
        );

        const updatedFormData = {
            ...localFormData,
            city: selectedCity,
        };

        if (entitiesWithCity.length === 1) {
            const entity = entitiesWithCity[0];
            const formattedAddress = `${entity.addressLine}\n\nTax ID: ${
                entity.taxId || "N/A"
            }\nTax Type: ${entity.type || "N/A"}`;

            updatedFormData.entityId = entity._id;
            updatedFormData.site = entity.area || entity.site || "";
            updatedFormData.billTo = formattedAddress;
            updatedFormData.shipTo = formattedAddress;

            setSelectedEntityDetails(entity);
        }

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);

        if (errors.city) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.city;
                return newErrors;
            });
        }
    };

    const handleSiteChange = (e) => {
        const selectedSite = e.target.value;

        const entitiesWithSite = entityVariants.filter(
            (entity) =>
                entity.area === selectedSite || entity.site === selectedSite
        );

        const updatedFormData = {
            ...localFormData,
            site: selectedSite,
        };

        if (entitiesWithSite.length === 1) {
            const entity = entitiesWithSite[0];
            const formattedAddress = `${entity.addressLine}\n\nTax ID: ${
                entity.taxId || "N/A"
            }\nTax Type: ${entity.type || "N/A"}`;

            updatedFormData.entityId = entity._id;
            updatedFormData.city = entity.city || "";
            updatedFormData.billTo = formattedAddress;
            updatedFormData.shipTo = formattedAddress;

            setSelectedEntityDetails(entity);
        }

        setLocalFormData(updatedFormData);
        setFormData(updatedFormData);

        if (errors.site) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.site;
                return newErrors;
            });
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
                site:
                    selectedOption.entity.area ||
                    selectedOption.entity.site ||
                    "",
                entityId: selectedOption.entity._id,
            };

            setLocalFormData(updatedFormData);
            setFormData(updatedFormData);
            setSelectedEntityDetails(selectedOption.entity);
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
            const response = await editCommercials(
                submissionData,
                empId,
                reqId
            );

            if (response.status === 201) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    newReqId: response.data.reqid,
                }));
                toast.success("Commercial details updated successfully");
                onNext();
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".relative")) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const renderDepartmentField = () => {
        if (isDropDown) {
            return (
                <div className="relative w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cost Center <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                const filtered = availableDepartments.filter(
                                    (dept) =>
                                        dept.department
                                            .toLowerCase()
                                            .includes(
                                                e.target.value.toLowerCase()
                                            )
                                );
                                setFilteredDepartments(filtered);
                            }}
                            onFocus={() => setIsSearchFocused(true)}
                            placeholder="Search department..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                        />
                        <Search
                            className="absolute right-3 top-3.5 text-gray-400"
                            size={20}
                        />
                    </div>

                    {isSearchFocused && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept) => (
                                    <div
                                        key={dept.department}
                                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex flex-col border-b border-gray-100"
                                        onClick={() =>
                                            handleDepartmentChange(dept)
                                        }
                                    >
                                        <span className="font-medium">
                                            {dept.department}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {dept.businessUnit}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-gray-500">
                                    No departments found
                                </div>
                            )}
                        </div>
                    )}
                    {errors.department && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.department}
                        </p>
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
                    <p className="text-red-500 text-xs mt-1">
                        {errors.department}
                    </p>
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
                                    {approver.id} - {approver.name} -{" "}
                                    {approver.email} - {approver.department}
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
                                {approver.id} - {approver.name} -{" "}
                                {approver.email} - {approver.department}
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

    const renderCityField = () => {
        // Show dropdown if there are multiple cities available, regardless of entity variants
        if (availableCities.length > 1) {
            return (
                <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="city"
                        value={localFormData.city}
                        onChange={handleCityChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                    >
                        <option value="">Select City</option>
                        {availableCities.map((city, index) => (
                            <option key={index} value={city}>
                                {city}
                            </option>
                        ))}
                    </select>
                    {errors.city && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.city}
                        </p>
                    )}
                </div>
            );
        }

        // Show text input if only one city or no cities available
        return (
            <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                </label>
                <input
                    type="text"
                    name="city"
                    value={localFormData.city}
                    onChange={handleInputChange}
                    readOnly={!!selectedEntityDetails}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300 ${
                        selectedEntityDetails
                            ? "border-gray-500 bg-gray-100"
                            : "border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    }`}
                    placeholder="Enter City"
                />
                {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
            </div>
        );
    };

    const renderSiteField = () => {
        if (entityVariants.length > 1 && availableSites.length > 1) {
            return (
                <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Site <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="site"
                        value={localFormData.site}
                        onChange={handleSiteChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-300"
                    >
                        <option value="">Select Site</option>
                        {availableSites.map((site, index) => (
                            <option key={index} value={site}>
                                {site}
                            </option>
                        ))}
                    </select>
                    {errors.site && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.site}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Site
                </label>
                <input
                    type="text"
                    name="site"
                    value={localFormData.site}
                    onChange={handleInputChange}
                    readOnly={!!selectedEntityDetails}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300 ${
                        selectedEntityDetails
                            ? "border-gray-500 bg-gray-100"
                            : "border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    }`}
                    placeholder="Enter Site"
                />
                {errors.site && (
                    <p className="text-red-500 text-xs mt-1">{errors.site}</p>
                )}
            </div>
        );
    };

    const renderBillToField = () => {
        if (entityVariants.length > 1 && availableBillToOptions.length > 1) {
            return (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bill To <span className="text-red-500">*</span>
                    </label>
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
                    {errors.billTo && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.billTo}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bill To <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="billTo"
                    value={localFormData.billTo}
                    readOnly={!!selectedEntityDetails}
                    onChange={
                        !selectedEntityDetails ? handleInputChange : undefined
                    }
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300 ${
                        selectedEntityDetails
                            ? "border-gray-500 bg-gray-100"
                            : "border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    }`}
                    placeholder="Enter Bill To"
                    rows="6"
                />
                {errors.billTo && (
                    <p className="text-red-500 text-xs mt-1">{errors.billTo}</p>
                )}
            </div>
        );
    };

    const renderShipToField = () => {
        if (entityVariants.length > 1 && availableShipToOptions.length > 1) {
            return (
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ship To <span className="text-red-500">*</span>
                    </label>
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
                    {errors.shipTo && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.shipTo}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ship To <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="shipTo"
                    value={localFormData.shipTo}
                    readOnly={!!selectedEntityDetails}
                    onChange={
                        !selectedEntityDetails ? handleInputChange : undefined
                    }
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition duration-300 ${
                        selectedEntityDetails
                            ? "border-gray-500 bg-gray-100"
                            : "border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    }`}
                    placeholder="Enter Ship To"
                    rows="6"
                />
                {errors.shipTo && (
                    <p className="text-red-500 text-xs mt-1">{errors.shipTo}</p>
                )}
            </div>
        );
    };

    return (
        <div className="w-full mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
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
                    <div className="mb-2 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-700">
                            Payment Term
                        </h3>
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
                                                        className={`w-full px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg ${
                                                            localFormData.isCreditCardSelected
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
                                                        className={`w-full px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm ${
                                                            localFormData.isCreditCardSelected
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
                                                        className={`w-full px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg text-xs sm:text-sm ${
                                                            localFormData.isCreditCardSelected
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
                                                            className={`flex items-center px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition duration-300 text-xs sm:text-sm ${
                                                                localFormData.isCreditCardSelected ||
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
                            className={`${
                                localFormData.isCreditCardSelected
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
                    {renderBillToField()}
                    {renderShipToField()}
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

export default CommercialsDetails;
