import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import {
  getVendorData,
  updateVendorData,
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";

// Updated Validation schema
const validationSchema = Yup.object({
  vendorId: Yup.string().required("Vendor ID is required"),
  vendorName: Yup.string().required("Vendor Name is required"),


  billingAddress: Yup.string().required("Billing Address is required"),
});

const EditVendor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    vendorId: "",
    vendorName: "",
    primarySubsidiary: "",
    taxNumber: "",
    gstin: "",
    billingAddress: "",
    shippingAddress: "",
    phone: "",
    email: "",
  });

  // Fetch Vendor Data on component mount
  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setIsLoading(true);
        const vendorData = await getVendorData(id);
        console.log("Response Vendor Data:", vendorData);

        if (vendorData.status === 200) {
          setFormData(vendorData.data);
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
    initialValues: formData,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        console.log("Update values", values);
        const response = await updateVendorData(id, values);
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

      <div className="p-4 border rounded-lg border-primary">
        <label htmlFor="vendorId">
          Vendor ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="vendorId"
          placeholder="Vendor ID"
          value={formik.values.vendorId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          readOnly
        />
        {formik.touched.vendorId && formik.errors.vendorId && (
          <span className="text-red-500 text-sm">{formik.errors.vendorId}</span>
        )}
      </div>

      <div className="p-4 border rounded-lg border-primary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vendorName">
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vendorName"
              placeholder="Vendor Name"
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
          <div>
            <label htmlFor="primarySubsidiary">Primary Subsidiary</label>
            <input
              type="text"
              name="primarySubsidiary"
              placeholder="Primary Subsidiary"
              value={formik.values.primarySubsidiary}
              onChange={formik.handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.phone && formik.errors.phone && (
              <span className="text-red-500 text-sm">
                {formik.errors.phone}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.email && formik.errors.email && (
              <span className="text-red-500 text-sm">
                {formik.errors.email}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="gstin">
              GSTIN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="gstin"
              placeholder="GSTIN"
              value={formik.values.gstin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {formik.touched.gstin && formik.errors.gstin && (
              <span className="text-red-500 text-sm">
                {formik.errors.gstin}
              </span>
            )}
          </div>
          <div>
            <label htmlFor="taxNumber">Tax Number</label>
            <input
              type="text"
              name="taxNumber"
              placeholder="Tax Number"
              value={formik.values.taxNumber}
              onChange={formik.handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg text-primary mb-2">Address</h2>
        <div className="p-4 border w-full rounded-lg border-primary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="billingAddress">
                Billing Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="billingAddress"
                placeholder="Billing Address"
                value={formik.values.billingAddress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formik.touched.billingAddress &&
                formik.errors.billingAddress && (
                  <span className="text-red-500 text-sm">
                    {formik.errors.billingAddress}
                  </span>
                )}
            </div>
            <div>
              <label htmlFor="shippingAddress">Shipping Address</label>
              <textarea
                name="shippingAddress"
                placeholder="Shipping Address"
                value={formik.values.shippingAddress}
                onChange={formik.handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 text-end">
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded"
          disabled={formik.isSubmitting || !formik.isValid}
        >
          Update Vendor
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
