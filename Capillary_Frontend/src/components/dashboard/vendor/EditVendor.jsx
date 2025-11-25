import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVendorData,
  updateVendorData,
  getAllEntityData
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";

// Validation schema
const createValidationSchema = (role) => Yup.object({
  vendorId: role === 'Vendor Management'
    ? Yup.string().required("Vendor ID is required for Vendor Management")
    : Yup.string().nullable(),
  entity: Yup.string().required("Entity is required"),
  category: Yup.string().required("Category is required"),
  vendorName: Yup.string().required("Company Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string().required("Phone Number is required"),
  billingAddress: Yup.string().required("Address is required"),
  taxNumber: Yup.string().required("PAN/Tax Registration/W9 is required"),
  gstin: Yup.string().required("GST is required"),
  msme: Yup.string().required("MSME is required"),
  bankAccountNumber: Yup.string().required("Bank Account Number is required"),
  ifscSwiftCode: Yup.string().required("IFSC/SWIFT CODE is required"),
  bankName: Yup.string().required("Bank Name is required"),
  hasAgreement: Yup.string().required("Agreement/EL selection is required"),
  natureOfService: Yup.string().required("Nature of Service is required"),
  questionnaireData: Yup.object().when("hasAgreement", ([hasAgreement], schema) => {
    return hasAgreement === "no"
      ? schema.shape({
        counterpartyRequired: Yup.string().required("Please select an option"),
        agreementType: Yup.string().required("Please select an option"),
        serviceType: Yup.string().required("Please select an option"),
        paymentType: Yup.string().required("Please select an option")
      })
      : schema.nullable();
  }),
  panTaxFile: Yup.mixed().nullable(),
  gstFile: Yup.mixed().nullable(),
  msmeFile: Yup.mixed().nullable(),
  bankProofFile: Yup.mixed().nullable(),
});

const EditVendor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem("userId")

  // Create validation schema based on role
  const validationSchema = createValidationSchema(role);
  const [isLoading, setIsLoading] = useState(true);
  const [existingFileName, setExistingFileName] = useState("");
  const [existingPanTaxFileName, setExistingPanTaxFileName] = useState("");
  const [existingGstFileName, setExistingGstFileName] = useState("");
  const [existingMsmeFileName, setExistingMsmeFileName] = useState("");
  const [existingBankProofFileName, setExistingBankProofFileName] = useState("");
  const [showVendorIdTooltip, setShowVendorIdTooltip] = useState(false);
  const [enableVendorId, setEnableVendorId] = useState(false);
  const [entities, setEntities] = useState([]);
  const [isEntityLoading, setIsEntityLoading] = useState(true);
  const [vendorDataLoaded, setVendorDataLoaded] = useState(false);

  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues: {
      vendorId: "",
      entity: "",
      category: "",
      vendorName: "",
      email: "",
      phone: "",
      billingAddress: "",
      shippingAddress: "",
      taxNumber: "",
      gstin: "",
      msme: "",
      bankAccountNumber: "",
      ifscSwiftCode: "",
      bankName: "",
      hasAgreement: "",
      agreementFile: null,
      questionnaireData: {
        counterpartyRequired: "",
        agreementType: "",
        serviceType: "",
        paymentType: ""
      },
      natureOfService: "",
      primarySubsidiary: "",
      panTaxFile: null,
      gstFile: null,
      msmeFile: null,
      bankProofFile: null,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        console.log("Update values", values);

        // Create FormData for file upload
        const formData = new FormData();

        // Append all fields
        Object.keys(values).forEach((key) => {
          if (key === "agreementFile" && values.agreementFile) {
            formData.append("agreementFile", values.agreementFile);
          } else if (key === "panTaxFile" && values.panTaxFile) {
            formData.append("panTaxFile", values.panTaxFile);
          } else if (key === "gstFile" && values.gstFile) {
            formData.append("gstFile", values.gstFile);
          } else if (key === "msmeFile" && values.msmeFile) {
            formData.append("msmeFile", values.msmeFile);
          } else if (key === "bankProofFile" && values.bankProofFile) {
            formData.append("bankProofFile", values.bankProofFile);
          } else if (key === "questionnaireData" && values.hasAgreement === "no") {
            formData.append("questionnaireAnswer", JSON.stringify(values.questionnaireData));
          } else if (key !== "agreementFile" && key !== "panTaxFile" && key !== "gstFile" && key !== "msmeFile" && key !== "bankProofFile" && key !== "questionnaireData") {
            formData.append(key, values[key] || "");
          }
        });

        const response = await updateVendorData(id, formData);
        console.log("Update response", response);

        if (response.status === 200) {
          toast.success(response.data.message || "Vendor updated successfully");
          setTimeout(() => {
            navigate("/vendor-list-table");
          }, 1500);
        } else {
          toast.error("Update failed. Please try again.");
        }
      } catch (error) {
        console.error("Update failed:", error);
        toast.error(
          error.response?.data?.message || "Update failed. Please try again."
        );
      }
    },
  });

  // Fetch entities for dropdown
  useEffect(() => {
    const formatEntityName = (name) => {
      if (!name) return '';
      let formatted = name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      formatted = formatted
        .replace(/ Pte\./gi, ' Pte.')
        .replace(/ Ltd\./gi, ' Ltd.')
        .replace(/ Inc\./gi, ' Inc.');

      return formatted;
    };

    const fetchEntities = async () => {
      try {
        const response = await getAllEntityData(userId);
        if (response.data) {
          const formattedEntities = response.data.entities
            ? response.data.entities.map(entity => {
              const displayName = formatEntityName(entity.entityName);
              return {
                ...entity,
                displayName,
                originalName: entity.entityName
              };
            }).sort((a, b) => a.displayName.localeCompare(b.displayName))
            : [];

          setEntities(formattedEntities);
        }
      } catch (error) {
        console.error("Error fetching entities:", error);
        toast.error("Failed to load entities");
      } finally {
        setIsEntityLoading(false);
      }
    };

    fetchEntities();
  }, []);

  // Debug logs
  useEffect(() => {
    console.log('Current form values:', formik.values);
    console.log('Entities:', entities);
    console.log('Vendor data loaded:', vendorDataLoaded);
  }, [formik.values, entities, vendorDataLoaded]);

  // Match entity after both vendor data and entities are loaded
  useEffect(() => {
    if (vendorDataLoaded && formik.values.entity) {
      const currentEntityValue = formik.values.entity.trim();
      console.log('Current entity from vendor data:', currentEntityValue);

      // If we have entities, try to find a match
      if (entities.length > 0) {
        // Try to find exact or case-insensitive match
        const matchedEntity = entities.find(
          e => e.entityName === currentEntityValue ||
            e.entityName.toLowerCase() === currentEntityValue.toLowerCase() ||
            (e.originalName && e.originalName.toLowerCase() === currentEntityValue.toLowerCase())
        );

        if (matchedEntity) {
          console.log('Found matching entity:', matchedEntity);
          formik.setFieldValue('entity', matchedEntity.entityName, false);
        } else {
          console.log('Adding vendor entity to dropdown:', currentEntityValue);
          // Add the vendor's entity to the dropdown
          setEntities(prev => [
            ...prev,
            {
              _id: `vendor-${Date.now()}`,
              entityName: currentEntityValue,
              displayName: currentEntityValue,
              originalName: currentEntityValue
            }
          ]);
        }
      }
    }
  }, [vendorDataLoaded, entities, formik.values.entity]);

  // Fetch Vendor Data on component mount
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setIsLoading(true);
        const vendorData = await getVendorData(id);
        console.log("Response Vendor Data:", vendorData);

        if (vendorData.status === 200) {
          const data = vendorData.data;

          // Set existing file names if available
          if (data.agreementFileName) {
            setExistingFileName(data.agreementFileName);
          }
          if (data.panTaxFileName) {
            setExistingPanTaxFileName(data.panTaxFileName);
          }
          if (data.gstFileName) {
            setExistingGstFileName(data.gstFileName);
          }
          if (data.msmeFileName) {
            setExistingMsmeFileName(data.msmeFileName);
          }
          if (data.bankProofFileName) {
            setExistingBankProofFileName(data.bankProofFileName);
          }

          // Parse questionnaire data if it exists
          let parsedQuestionnaireData = {
            counterpartyRequired: "",
            agreementType: "",
            serviceType: "",
            paymentType: ""
          };

          if (data.questionnaireAnswer) {
            try {
              parsedQuestionnaireData = JSON.parse(data.questionnaireAnswer);
            } catch (e) {
              console.error("Failed to parse questionnaire data:", e);
            }
          } else if (data.questionnaireData) {
            parsedQuestionnaireData = data.questionnaireData;
          }

          formik.setValues({
            vendorId: data.vendorId || "",
            entity: data.entity || "",
            category: data.category || "",
            vendorName: data.vendorName || "",
            email: data.email || "",
            phone: data.phone || "",
            billingAddress: data.billingAddress || "",
            shippingAddress: data.shippingAddress || "",
            taxNumber: data.taxNumber || "",
            gstin: data.gstin || "",
            msme: data.msme || "",
            bankAccountNumber: data.bankAccountNumber || "",
            ifscSwiftCode: data.ifscSwiftCode || "",
            bankName: data.bankName || "",
            hasAgreement: data.hasAgreement || "",
            agreementFile: null,
            questionnaireData: parsedQuestionnaireData,
            natureOfService: data.natureOfService || "",
            primarySubsidiary: data.primarySubsidiary || "",
            panTaxFile: null,
            gstFile: null,
            msmeFile: null,
            bankProofFile: null,
          });

          // Enable vendorId toggle if vendorId exists (only for non-Vendor Management roles)
          const hasVendorId = !!data.vendorId;
          if (role !== 'Vendor Management') {
            setEnableVendorId(hasVendorId);
          }

          // Mark vendor data as loaded
          setVendorDataLoaded(true);
        } else {
          toast.error("Failed to fetch vendor data");
        }
      } catch (error) {
        console.error("Failed to fetch Vendor Data:", error);
        toast.error("Error fetching vendor data");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchVendorData();
    }
  }, [id]);

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("agreementFile", file);
      setExistingFileName("");
    }
  };

  // Handle document file uploads
  const handleDocumentFileChange = (e, fieldName, setExistingFileNameFunc) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size should not exceed 10MB");
        e.target.value = "";
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, DOC, DOCX, JPG, JPEG, and PNG files are allowed");
        e.target.value = "";
        return;
      }

      formik.setFieldValue(fieldName, file);
      setExistingFileNameFunc("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="max-w-6xl bg-white mx-auto p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Vendor</h2>

      {/* Vendor ID - Mandatory for Vendor Management */}
      <div className="p-4 border rounded-lg border-primary">
        {role === 'Vendor Management' ? (
          <div className="mb-4">
            <label htmlFor="vendorId" className="block mb-2 font-medium text-gray-700">
              Vendor ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vendorId"
              placeholder="Enter Vendor ID (Required)"
              value={formik.values.vendorId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${formik.touched.vendorId && formik.errors.vendorId ? 'border-red-500' : ''
                }`}
            />
            {formik.touched.vendorId && formik.errors.vendorId && (
              <span className="text-red-500 text-sm">{formik.errors.vendorId}</span>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Vendor ID is mandatory for Vendor Management users
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableVendorId}
                  onChange={(e) => {
                    setEnableVendorId(e.target.checked);
                    if (!e.target.checked) {
                      formik.setFieldValue("vendorId", "");
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">Add Vendor ID (Optional)</span>
              <div
                className="ml-2 relative"
                onMouseEnter={() => setShowVendorIdTooltip(true)}
                onMouseLeave={() => setShowVendorIdTooltip(false)}
              >
                <i className="fas fa-info-circle text-gray-400 cursor-help"></i>
                {showVendorIdTooltip && (
                  <div className="absolute z-10 left-0 mt-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
                    Toggle to add a Vendor ID if available. This field is optional.
                  </div>
                )}
              </div>
            </div>
            {enableVendorId && (
              <div className="mt-2">
                <input
                  type="text"
                  name="vendorId"
                  placeholder="Enter Vendor ID"
                  value={formik.values.vendorId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {formik.touched.vendorId && formik.errors.vendorId && (
                  <span className="text-red-500 text-sm">{formik.errors.vendorId}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="p-4 border rounded-lg border-primary">
        <h3 className="text-lg font-semibold text-primary mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Entity */}
          <div>
            <label htmlFor="entity" className="block mb-2 font-medium">
              Entity <span className="text-red-500">*</span>
            </label>
            {isEntityLoading ? (
              <select
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary text-gray-500"
                disabled
              >
                <option>Loading entities...</option>
              </select>
            ) : (
              <select
                name="entity"
                value={formik.values.entity || ''}
                onChange={(e) => {
                  console.log('Selected entity:', e.target.value);
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary ${formik.touched.entity && formik.errors.entity
                  ? 'border-red-500'
                  : 'border-gray-300'
                  }`}
              >
                <option value="">Select an entity</option>
                {entities.map((entity) => (
                  <option
                    key={entity._id || `entity-${entity.entityName}`}
                    value={entity.entityName}
                  >
                    {entity.displayName || entity.entityName}
                  </option>
                ))}
              </select>
            )}
            {formik.touched.entity && formik.errors.entity && (
              <span className="text-red-500 text-sm">{formik.errors.entity}</span>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block mb-2 font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category"
              placeholder="Enter Category"
              value={formik.values.category}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.category && formik.errors.category && (
              <span className="text-red-500 text-sm">{formik.errors.category}</span>
            )}
          </div>

          {/* Company Name (vendorName) */}
          <div>
            <label htmlFor="vendorName" className="block mb-2 font-medium">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vendorName"
              placeholder="Enter Company Name"
              value={formik.values.vendorName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.vendorName && formik.errors.vendorName && (
              <span className="text-red-500 text-sm">{formik.errors.vendorName}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-2 font-medium">
              Email-ID <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.email && formik.errors.email && (
              <span className="text-red-500 text-sm">{formik.errors.email}</span>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block mb-2 font-medium">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter Phone Number"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.phone && formik.errors.phone && (
              <span className="text-red-500 text-sm">{formik.errors.phone}</span>
            )}
          </div>

          {/* Nature of Service */}
          <div>
            <label htmlFor="natureOfService" className="block mb-2 font-medium">
              Nature of Service <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="natureOfService"
              placeholder="Enter Nature of Service"
              value={formik.values.natureOfService}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.natureOfService && formik.errors.natureOfService && (
              <span className="text-red-500 text-sm">{formik.errors.natureOfService}</span>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="p-4 border rounded-lg border-primary">
        <h3 className="text-lg font-semibold text-primary mb-4">Address Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Billing Address (Address) */}
          <div>
            <label htmlFor="billingAddress" className="block mb-2 font-medium">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="billingAddress"
              placeholder="Enter Address"
              value={formik.values.billingAddress}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows="3"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.billingAddress && formik.errors.billingAddress && (
              <span className="text-red-500 text-sm">{formik.errors.billingAddress}</span>
            )}
          </div>

          {/* Shipping Address (Optional) */}
          <div>
            <label htmlFor="shippingAddress" className="block mb-2 font-medium">
              Shipping Address
            </label>
            <textarea
              name="shippingAddress"
              placeholder="Enter Shipping Address"
              value={formik.values.shippingAddress}
              onChange={formik.handleChange}
              rows="3"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Tax & Registration Details */}
      <div className="p-4 border rounded-lg border-primary">
        <h3 className="text-lg font-semibold text-primary mb-4">Tax & Registration Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PAN/Tax Registration/W9 (taxNumber) */}
          <div>
            <label htmlFor="taxNumber" className="block mb-2 font-medium">
              PAN/Tax Registration/W9 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="taxNumber"
              placeholder="Enter PAN/Tax Registration/W9"
              value={formik.values.taxNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.taxNumber && formik.errors.taxNumber && (
              <span className="text-red-500 text-sm">{formik.errors.taxNumber}</span>
            )}
          </div>

          {/* GST */}
          <div>
            <label htmlFor="gstin" className="block mb-2 font-medium">
              GST <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="gstin"
              placeholder="Enter GST Number"
              value={formik.values.gstin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.gstin && formik.errors.gstin && (
              <span className="text-red-500 text-sm">{formik.errors.gstin}</span>
            )}
          </div>

          {/* MSME */}
          <div>
            <label htmlFor="msme" className="block mb-2 font-medium">
              MSME <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="msme"
              placeholder="Enter MSME Number"
              value={formik.values.msme}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.msme && formik.errors.msme && (
              <span className="text-red-500 text-sm">{formik.errors.msme}</span>
            )}
          </div>

          {/* Primary Subsidiary (Optional) */}
          <div>
            <label htmlFor="primarySubsidiary" className="block mb-2 font-medium">
              Primary Subsidiary
            </label>
            <input
              type="text"
              name="primarySubsidiary"
              placeholder="Enter Primary Subsidiary"
              value={formik.values.primarySubsidiary}
              onChange={formik.handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Document Upload Section - Hidden for Vendor Management */}
      {role !== 'Vendor Management' && (
        <div className="p-4 border rounded-lg border-primary">
          <h3 className="text-lg font-semibold text-primary mb-4">
            Document Uploads
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PAN/TAX/W9 File Upload */}
            <div>
              <label htmlFor="panTaxFile" className="block mb-2 font-medium">
                Upload PAN / TAX / W9 file
              </label>
              {existingPanTaxFileName && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    Current file: <span className="font-semibold">{existingPanTaxFileName}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Upload a new file to replace the existing one
                  </p>
                </div>
              )}
              <input
                type="file"
                name="panTaxFile"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleDocumentFileChange(e, "panTaxFile", setExistingPanTaxFileName)}
                onBlur={formik.handleBlur}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formik.values.panTaxFile && (
                <p className="text-sm text-green-600 mt-1">
                  New file selected: {formik.values.panTaxFile.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
              </p>
            </div>

            {/* GST File Upload */}
            <div>
              <label htmlFor="gstFile" className="block mb-2 font-medium">
                Upload GST file
              </label>
              {existingGstFileName && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    Current file: <span className="font-semibold">{existingGstFileName}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Upload a new file to replace the existing one
                  </p>
                </div>
              )}
              <input
                type="file"
                name="gstFile"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleDocumentFileChange(e, "gstFile", setExistingGstFileName)}
                onBlur={formik.handleBlur}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formik.values.gstFile && (
                <p className="text-sm text-green-600 mt-1">
                  New file selected: {formik.values.gstFile.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
              </p>
            </div>

            {/* MSME File Upload */}
            <div>
              <label htmlFor="msmeFile" className="block mb-2 font-medium">
                Upload MSME file
              </label>
              {existingMsmeFileName && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    Current file: <span className="font-semibold">{existingMsmeFileName}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Upload a new file to replace the existing one
                  </p>
                </div>
              )}
              <input
                type="file"
                name="msmeFile"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleDocumentFileChange(e, "msmeFile", setExistingMsmeFileName)}
                onBlur={formik.handleBlur}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formik.values.msmeFile && (
                <p className="text-sm text-green-600 mt-1">
                  New file selected: {formik.values.msmeFile.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
              </p>
            </div>

            {/* Bank Account Proof Upload */}
            <div>
              <label htmlFor="bankProofFile" className="block mb-2 font-medium">
                Upload bank account proof
              </label>
              {existingBankProofFileName && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    Current file: <span className="font-semibold">{existingBankProofFileName}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Upload a new file to replace the existing one
                  </p>
                </div>
              )}
              <input
                type="file"
                name="bankProofFile"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleDocumentFileChange(e, "bankProofFile", setExistingBankProofFileName)}
                onBlur={formik.handleBlur}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formik.values.bankProofFile && (
                <p className="text-sm text-green-600 mt-1">
                  New file selected: {formik.values.bankProofFile.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details */}
      <div className="p-4 border rounded-lg border-primary">
        <h3 className="text-lg font-semibold text-primary mb-4">Bank Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Bank Account Number */}
          <div>
            <label htmlFor="bankAccountNumber" className="block mb-2 font-medium">
              Bank Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bankAccountNumber"
              placeholder="Enter Bank Account Number"
              value={formik.values.bankAccountNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.bankAccountNumber && formik.errors.bankAccountNumber && (
              <span className="text-red-500 text-sm">{formik.errors.bankAccountNumber}</span>
            )}
          </div>

          {/* IFSC/SWIFT CODE */}
          <div>
            <label htmlFor="ifscSwiftCode" className="block mb-2 font-medium">
              IFSC/SWIFT CODE <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ifscSwiftCode"
              placeholder="Enter IFSC/SWIFT CODE"
              value={formik.values.ifscSwiftCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.ifscSwiftCode && formik.errors.ifscSwiftCode && (
              <span className="text-red-500 text-sm">{formik.errors.ifscSwiftCode}</span>
            )}
          </div>

          {/* Bank Name */}
          <div>
            <label htmlFor="bankName" className="block mb-2 font-medium">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="bankName"
              placeholder="Enter Bank Name"
              value={formik.values.bankName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.bankName && formik.errors.bankName && (
              <span className="text-red-500 text-sm">{formik.errors.bankName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Agreement/EL Section */}
      <div className="p-4 border rounded-lg border-primary">
        <h3 className="text-lg font-semibold text-primary mb-4">Agreement/EL</h3>

        {/* Agreement Yes/No Selection */}
        <div className="mb-4">
          <label className="block mb-2 font-medium">
            Do you have an Agreement/EL? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasAgreement"
                value="yes"
                checked={formik.values.hasAgreement === "yes"}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasAgreement"
                value="no"
                checked={formik.values.hasAgreement === "no"}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="mr-2"
              />
              No
            </label>
          </div>
          {formik.touched.hasAgreement && formik.errors.hasAgreement && (
            <span className="text-red-500 text-sm">{formik.errors.hasAgreement}</span>
          )}
        </div>

        {/* Conditional: Upload File if Yes */}
        {formik.values.hasAgreement === "yes" && (
          <div>
            <label htmlFor="agreementFile" className="block mb-2 font-medium">
              Upload Agreement File {!existingFileName && <span className="text-red-500">*</span>}
            </label>
            {existingFileName && (
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  Current file: <span className="font-semibold">{existingFileName}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Upload a new file to replace the existing one
                </p>
              </div>
            )}
            <input
              type="file"
              name="agreementFile"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.values.agreementFile && (
              <p className="text-sm text-green-600 mt-1">
                New file selected: {formik.values.agreementFile.name}
              </p>
            )}
            {formik.touched.agreementFile && formik.errors.agreementFile && !existingFileName && (
              <span className="text-red-500 text-sm">{formik.errors.agreementFile}</span>
            )}
          </div>
        )}

        {/* Conditional: Questionnaire if No Agreement */}
        {formik.values.hasAgreement === "no" && (
          <div className="space-y-6">
            <div>
              <p className="block mb-2 font-medium">
                1. Is the agreement required by the counterparty? <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-6">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="questionnaireData.counterpartyRequired"
                      value={option}
                      checked={formik.values.questionnaireData?.counterpartyRequired === option}
                      onChange={(e) => {
                        formik.setFieldValue('questionnaireData', {
                          ...formik.values.questionnaireData,
                          counterpartyRequired: option
                        });
                      }}
                      onBlur={() => formik.setFieldTouched('questionnaireData.counterpartyRequired', true)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {formik.touched.questionnaireData?.counterpartyRequired &&
                formik.errors.questionnaireData?.counterpartyRequired && (
                  <span className="text-red-500 text-sm">
                    {formik.errors.questionnaireData.counterpartyRequired}
                  </span>
                )}
            </div>

            <div>
              <p className="block mb-2 font-medium">
                2. Does the agreement have an auto-renewal clause or a fixed tenure? <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-6">
                {['Auto-renewal', 'Fixed tenure'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="questionnaireData.agreementType"
                      value={option}
                      checked={formik.values.questionnaireData?.agreementType === option}
                      onChange={(e) => {
                        formik.setFieldValue('questionnaireData', {
                          ...formik.values.questionnaireData,
                          agreementType: option
                        });
                      }}
                      onBlur={() => formik.setFieldTouched('questionnaireData.agreementType', true)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {formik.touched.questionnaireData?.agreementType &&
                formik.errors.questionnaireData?.agreementType && (
                  <span className="text-red-500 text-sm">
                    {formik.errors.questionnaireData.agreementType}
                  </span>
                )}
            </div>

            <div>
              <p className="block mb-2 font-medium">
                3. Is this a one-time or recurring service? <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-6">
                {['One-time', 'Recurring'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="questionnaireData.serviceType"
                      value={option}
                      checked={formik.values.questionnaireData?.serviceType === option}
                      onChange={(e) => {
                        formik.setFieldValue('questionnaireData', {
                          ...formik.values.questionnaireData,
                          serviceType: option
                        });
                      }}
                      onBlur={() => formik.setFieldTouched('questionnaireData.serviceType', true)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {formik.touched.questionnaireData?.serviceType &&
                formik.errors.questionnaireData?.serviceType && (
                  <span className="text-red-500 text-sm">
                    {formik.errors.questionnaireData.serviceType}
                  </span>
                )}
            </div>

            <div>
              <p className="block mb-2 font-medium">
                4. Is the payment a one-time transaction or a recurring payment? <span className="text-red-500">*</span>
              </p>
              <div className="flex gap-6">
                {['One-time', 'Recurring'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="questionnaireData.paymentType"
                      value={option}
                      checked={formik.values.questionnaireData?.paymentType === option}
                      onChange={(e) => {
                        formik.setFieldValue('questionnaireData', {
                          ...formik.values.questionnaireData,
                          paymentType: option
                        });
                      }}
                      onBlur={() => formik.setFieldTouched('questionnaireData.paymentType', true)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
              </div>
              {formik.touched.questionnaireData?.paymentType &&
                formik.errors.questionnaireData?.paymentType && (
                  <span className="text-red-500 text-sm">
                    {formik.errors.questionnaireData.paymentType}
                  </span>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="p-4 text-end">
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {formik.isSubmitting ? "Updating..." : "Update Vendor"}
        </button>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </form>
  );
};

export default EditVendor;