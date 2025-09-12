import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  getNewVendorId,
  RegVendorData,
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Updated Validation schema
const validationSchema = Yup.object({
  vendorId: Yup.string().required("Vendor ID is required"),
  vendorName: Yup.string().required("Vendor Name is required"),
  phone: Yup.string().required("Phone Number is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  billingAddress: Yup.string().required("Billing Address is required"),
});

const VendorRegistration = () => {
  const navigate = useNavigate();
  const empId = localStorage.getItem("capEmpId")
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
    empId:empId
  });

  // Fetch Vendor ID on component mount
  useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const response = await getNewVendorId();
        if (response.status === 200) {
          // Only update vendorId if it's not already set
          setFormData((prevState) => ({
            ...prevState,
            vendorId: prevState.vendorId || response.data.vendorId,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch Vendor ID:", error);
      }
    };
    fetchVendorId();
  }, []);

  const formik = useFormik({
    initialValues: formData,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        console.log(values);
        const response = await RegVendorData(values);
        console.log(response);
        if (response.status === 201) {
          toast.success(response.data.message);
          setTimeout(() => {
            navigate("/vendor-list-table");
          }, 1500);
        }

        setFormData({
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
      } catch (error) {
        console.error("Registration failed:", error);
        toast.error("Registration failed. Please try again.");
      }
    },
  });

  // Function to handle manual vendor ID input
  const handleVendorIdChange = (e) => {
    const newVendorId = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      vendorId: newVendorId,
    }));
    formik.handleChange(e);
  };

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="max-w-6xl bg-white mx-auto p-6 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Vendor Registration
      </h2>

      <div className="p-4 border rounded-lg border-primary">
        <label htmlFor="vendorId">
          Vendor ID <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="vendorId"
          placeholder="Vendor ID"
          value={formik.values.vendorId}
          onChange={handleVendorIdChange}
          onBlur={formik.handleBlur}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
              GSTIN 
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
          Register Vendor
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
