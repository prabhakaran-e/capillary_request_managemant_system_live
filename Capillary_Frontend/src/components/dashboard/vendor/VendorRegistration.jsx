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
  natureOfService: Yup.string().required("Nature of Service is required"),
});

const VendorRegistration = () => {
  const navigate = useNavigate();
  const empId = localStorage.getItem("capEmpId");

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
      hasAgreement: "yes",
      natureOfService: "",
      primarySubsidiary: "",
      empId: empId,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
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
          natureOfService: values.natureOfService,
          primarySubsidiary: values.primarySubsidiary,
          empId: values.empId,
          hasAgreement: values.hasAgreement,
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
      }
    },
  });

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

      {/* Submit Button */}
      <div className="p-4 text-end">
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {formik.isSubmitting
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