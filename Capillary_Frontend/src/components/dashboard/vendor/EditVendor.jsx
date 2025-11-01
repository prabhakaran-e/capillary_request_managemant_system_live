import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVendorData,
  updateVendorData,
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";

// Validation schema
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
});

const EditVendor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [existingFileName, setExistingFileName] = useState("");

  // Fetch Vendor Data on component mount
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setIsLoading(true);
        const vendorData = await getVendorData(id);
        console.log("Response Vendor Data:", vendorData);

        if (vendorData.status === 200) {
          const data = vendorData.data;
          
          // Set existing file name if available
          if (data.agreementFileName) {
            setExistingFileName(data.agreementFileName);
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
            questionnaireAnswer: data.questionnaireAnswer || "",
            natureOfService: data.natureOfService || "",
            primarySubsidiary: data.primarySubsidiary || "",
          });
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
      questionnaireAnswer: "",
      natureOfService: "",
      primarySubsidiary: "",
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
          } else if (key !== "agreementFile") {
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

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("agreementFile", file);
      setExistingFileName(""); // Clear existing file name when new file is selected
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

      {/* Vendor ID - Read Only */}
      <div className="p-4 border rounded-lg border-primary">
        <label htmlFor="vendorId" className="block mb-2 font-medium">
          Vendor ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="vendorId"
          placeholder="Vendor ID"
          value={formik.values.vendorId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100"
          readOnly
        />
        {formik.touched.vendorId && formik.errors.vendorId && (
          <span className="text-red-500 text-sm">{formik.errors.vendorId}</span>
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

        {/* Conditional: Text Input if No */}
        {formik.values.hasAgreement === "no" && (
          <div>
            <label htmlFor="questionnaireAnswer" className="block mb-2 font-medium">
              Fill the Questionnaire <span className="text-red-500">*</span>
            </label>
            <textarea
              name="questionnaireAnswer"
              placeholder="Enter your questionnaire answer"
              value={formik.values.questionnaireAnswer}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows="4"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.questionnaireAnswer && formik.errors.questionnaireAnswer && (
              <span className="text-red-500 text-sm">{formik.errors.questionnaireAnswer}</span>
            )}
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