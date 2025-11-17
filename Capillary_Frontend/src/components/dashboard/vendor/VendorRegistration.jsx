import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RegVendorData } from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import uploadFilesVendor from "../../../utils/s3VendorUpload";
import { Info } from "lucide-react";

const validationSchema = Yup.object({
  vendorId: Yup.string().required("Vendor ID is required"),
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
  agreementFile: Yup.mixed().when("hasAgreement", {
    is: "yes",
    then: (schema) => schema.required("Agreement file is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  // ✅ FIXED: Conditional validation for questionnaire
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
  panTaxFile: Yup.mixed().required("PAN/TAX/W9 file is required"),
  gstFile: Yup.mixed().nullable(),
  msmeFile: Yup.mixed().nullable(),
  bankProofFile: Yup.mixed().required("Bank account proof is required"),
});

const VendorRegistration = () => {
  const navigate = useNavigate();
  const empId = localStorage.getItem("capEmpId");
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const formik = useFormik({
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
      agreementFileUrl: "",
      agreementFileName: "",
      questionnaireData: {
        counterpartyRequired: "",
        agreementType: "",
        serviceType: "",
        paymentType: ""
      },
      natureOfService: "",
      primarySubsidiary: "",
      empId: empId,
      panTaxFile: null,
      panTaxFileUrl: "",
      panTaxFileName: "",
      gstFile: null,
      gstFileUrl: "",
      gstFileName: "",
      msmeFile: null,
      msmeFileUrl: "",
      msmeFileName: "",
      bankProofFile: null,
      bankProofFileUrl: "",
      bankProofFileName: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setIsUploadingFile(true);
        let fileUrl = "";
        let fileName = "";
        let panTaxUrl = "";
        let panTaxName = "";
        let gstUrl = "";
        let gstName = "";
        let msmeUrl = "";
        let msmeName = "";
        let bankProofUrl = "";
        let bankProofName = "";

        toast.info("Uploading files to S3...");

        try {
          // Upload Agreement file if hasAgreement is "yes"
          if (values.hasAgreement === "yes" && values.agreementFile) {
            const uploadResponse = await uploadFilesVendor(
              values.agreementFile,
              "agreement"
            );

            if (uploadResponse.status === 200 && uploadResponse.data.fileUrls) {
              fileUrl = uploadResponse.data.fileUrls[0];
              fileName = values.agreementFile.name;
            }
          }

          // Upload PAN/TAX/W9 file (required)
          if (values.panTaxFile) {
            const uploadResponse = await uploadFilesVendor(
              values.panTaxFile,
              "pan_tax"
            );
            if (uploadResponse.status === 200 && uploadResponse.data.fileUrls) {
              panTaxUrl = uploadResponse.data.fileUrls[0];
              panTaxName = values.panTaxFile.name;
            }
          }

          // Upload GST file (optional)
          if (values.gstFile) {
            const uploadResponse = await uploadFilesVendor(
              values.gstFile,
              "gst"
            );
            if (uploadResponse.status === 200 && uploadResponse.data.fileUrls) {
              gstUrl = uploadResponse.data.fileUrls[0];
              gstName = values.gstFile.name;
            }
          }

          // Upload MSME file (optional)
          if (values.msmeFile) {
            const uploadResponse = await uploadFilesVendor(
              values.msmeFile,
              "msme"
            );
            if (uploadResponse.status === 200 && uploadResponse.data.fileUrls) {
              msmeUrl = uploadResponse.data.fileUrls[0];
              msmeName = values.msmeFile.name;
            }
          }

          // Upload Bank Proof file (required)
          if (values.bankProofFile) {
            const uploadResponse = await uploadFilesVendor(
              values.bankProofFile,
              "bank_proof"
            );
            if (uploadResponse.status === 200 && uploadResponse.data.fileUrls) {
              bankProofUrl = uploadResponse.data.fileUrls[0];
              bankProofName = values.bankProofFile.name;
            }
          }

          toast.success("Files uploaded successfully!");
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          toast.error("Failed to upload files. Please try again.");
          setIsUploadingFile(false);
          return;
        }

        // Prepare data for submission
        const vendorData = {
          vendorId: values.vendorId,
          entity: values.entity,
          category: values.category,
          vendorName: values.vendorName,
          email: values.email,
          phone: values.phone,
          billingAddress: values.billingAddress,
          shippingAddress: values.shippingAddress,
          taxNumber: values.taxNumber,
          gstin: values.gstin,
          msme: values.msme,
          bankAccountNumber: values.bankAccountNumber,
          ifscSwiftCode: values.ifscSwiftCode,
          bankName: values.bankName,
          hasAgreement: values.hasAgreement,
          agreementFileUrl: fileUrl,
          agreementFileName: fileName,
          natureOfService: values.natureOfService,
          primarySubsidiary: values.primarySubsidiary,
          empId: values.empId,
          panTaxFileUrl: panTaxUrl,
          panTaxFileName: panTaxName,
          gstFileUrl: gstUrl,
          gstFileName: gstName,
          msmeFileUrl: msmeUrl,
          msmeFileName: msmeName,
          bankProofFileUrl: bankProofUrl,
          bankProofFileName: bankProofName,
          // Include questionnaire data if no agreement
          ...(values.hasAgreement === 'no' && {
            questionnaireAnswer: JSON.stringify(values.questionnaireData),
          }),
        };

        console.log("Submitting vendor data:", vendorData);
        const response = await RegVendorData(vendorData);

        if (response.status === 201) {
          toast.success(
            response.data.message || "Vendor registered successfully!"
          );
          setTimeout(() => {
            navigate("/vendor-list-table");
          }, 1500);
        }
      } catch (error) {
        console.error("Registration failed:", error);
        toast.error(
          error.response?.data?.message ||
          "Registration failed. Please try again."
        );
      } finally {
        setIsUploadingFile(false);
      }
    },
  });

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size should not exceed 10MB");
        e.target.value = "";
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, DOC, and DOCX files are allowed");
        e.target.value = "";
        return;
      }

      formik.setFieldValue("agreementFile", file);
    }
  };

  // Handle document file uploads
  const handleDocumentFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size should not exceed 10MB");
        e.target.value = "";
        return;
      }

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
    }
  };

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="max-w-6xl bg-white mx-auto p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Vendor Registration
      </h2>

      {/* Vendor ID - Mandatory Field */}
      <div className="p-4 border rounded-lg border-primary">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vendor ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="vendorId"
            value={formik.values.vendorId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`mt-1 block w-full px-3 py-2 border ${formik.touched.vendorId && formik.errors.vendorId
              ? 'border-red-500'
              : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="Enter Vendor ID"
          />
          {formik.touched.vendorId && formik.errors.vendorId && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.vendorId}
            </p>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="p-4 border rounded-lg border-primary">
        <h3 className="text-lg font-semibold text-primary mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Entity */}
          <div>
            <label htmlFor="entity" className="block mb-2 font-medium">
              Entity <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="entity"
              placeholder="Enter Entity"
              value={formik.values.entity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
              <span className="text-red-500 text-sm">
                {formik.errors.category}
              </span>
            )}
          </div>

          {/* Company Name */}
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
              <span className="text-red-500 text-sm">
                {formik.errors.vendorName}
              </span>
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
              <span className="text-red-500 text-sm">
                {formik.errors.natureOfService}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="p-4 border rounded-lg border-primary">
        <h3 className="text-lg font-semibold text-primary mb-4">
          Address Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Billing Address */}
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
              <span className="text-red-500 text-sm">
                {formik.errors.billingAddress}
              </span>
            )}
          </div>

          {/* Shipping Address */}
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
        <h3 className="text-lg font-semibold text-primary mb-4">
          Tax & Registration Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PAN/Tax Registration/W9 */}
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
              <span className="text-red-500 text-sm">
                {formik.errors.taxNumber}
              </span>
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

          {/* Primary Subsidiary */}
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

      {/* Document Upload Section */}
      <div className="p-4 border rounded-lg border-primary">
        <h3 className="text-lg font-semibold text-primary mb-4">
          Document Uploads
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PAN/TAX/W9 File Upload */}
          <div>
            <label htmlFor="panTaxFile" className="block mb-2 font-medium">
              Upload PAN / TAX / W9 file <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="panTaxFile"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleDocumentFileChange(e, "panTaxFile")}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.values.panTaxFile && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Selected: {formik.values.panTaxFile.name}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
            </p>
            {formik.touched.panTaxFile && formik.errors.panTaxFile && (
              <span className="text-red-500 text-sm">
                {formik.errors.panTaxFile}
              </span>
            )}
          </div>

          {/* GST File Upload */}
          <div>
            <label htmlFor="gstFile" className="block mb-2 font-medium">
              Upload GST file
            </label>
            <input
              type="file"
              name="gstFile"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleDocumentFileChange(e, "gstFile")}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.values.gstFile && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Selected: {formik.values.gstFile.name}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
            </p>
            {formik.touched.gstFile && formik.errors.gstFile && (
              <span className="text-red-500 text-sm">
                {formik.errors.gstFile}
              </span>
            )}
          </div>

          {/* MSME File Upload */}
          <div>
            <label htmlFor="msmeFile" className="block mb-2 font-medium">
              Upload MSME file
            </label>
            <input
              type="file"
              name="msmeFile"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleDocumentFileChange(e, "msmeFile")}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.values.msmeFile && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Selected: {formik.values.msmeFile.name}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
            </p>
            {formik.touched.msmeFile && formik.errors.msmeFile && (
              <span className="text-red-500 text-sm">
                {formik.errors.msmeFile}
              </span>
            )}
          </div>

          {/* Bank Account Proof Upload */}
          <div>
            <label htmlFor="bankProofFile" className="block mb-2 font-medium">
              Upload bank account proof <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="bankProofFile"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleDocumentFileChange(e, "bankProofFile")}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.values.bankProofFile && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Selected: {formik.values.bankProofFile.name}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (Max: 10MB)
            </p>
            {formik.touched.bankProofFile && formik.errors.bankProofFile && (
              <span className="text-red-500 text-sm">
                {formik.errors.bankProofFile}
              </span>
            )}
          </div>
        </div>
      </div>

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
            {formik.touched.bankAccountNumber &&
              formik.errors.bankAccountNumber && (
                <span className="text-red-500 text-sm">
                  {formik.errors.bankAccountNumber}
                </span>
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
              <span className="text-red-500 text-sm">
                {formik.errors.ifscSwiftCode}
              </span>
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
              <span className="text-red-500 text-sm">
                {formik.errors.bankName}
              </span>
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
            <span className="text-red-500 text-sm">
              {formik.errors.hasAgreement}
            </span>
          )}
        </div>

        {/* Conditional: Upload File if Yes */}
        {formik.values.hasAgreement === "yes" && (
          <div>
            <label htmlFor="agreementFile" className="block mb-2 font-medium">
              Upload Agreement File <span className="text-red-500">*</span>
            </label>
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
                ✓ Selected: {formik.values.agreementFile.name}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX (Max size: 10MB)
            </p>
            {formik.touched.agreementFile && formik.errors.agreementFile && (
              <span className="text-red-500 text-sm">
                {formik.errors.agreementFile}
              </span>
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
                      onChange={() => {
                        formik.setFieldValue('questionnaireData.counterpartyRequired', option);
                        formik.setFieldTouched('questionnaireData.counterpartyRequired', true, false);
                      }}
                      onBlur={formik.handleBlur}
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
                      onChange={() => {
                        formik.setFieldValue('questionnaireData.agreementType', option);
                        formik.setFieldTouched('questionnaireData.agreementType', true, false);
                      }}
                      onBlur={formik.handleBlur}
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
                      onChange={() => {
                        formik.setFieldValue('questionnaireData.serviceType', option);
                        formik.setFieldTouched('questionnaireData.serviceType', true, false);
                      }}
                      onBlur={formik.handleBlur}
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
                      onChange={() => {
                        formik.setFieldValue('questionnaireData.paymentType', option);
                        formik.setFieldTouched('questionnaireData.paymentType', true, false);
                      }}
                      onBlur={formik.handleBlur}
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
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={formik.isSubmitting || !formik.isValid || isUploadingFile}
        >
          {isUploadingFile
            ? "Uploading File..."
            : formik.isSubmitting
              ? "Registering..."
              : "Register Vendor"}
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

export default VendorRegistration;