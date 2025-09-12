import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { addEntityData } from "../../../api/service/adminServices";

function AddEntity() {
  const [currencies, setCurrencies] = useState([]);

  const navigate = useNavigate();

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get(
        "https://openexchangerates.org/api/currencies.json"
      );
      const currencyOptions = Object.entries(response.data).map(
        ([key, value]) => ({
          value: key,
          label: `${value} (${key})`,
        })
      );
      setCurrencies(currencyOptions);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      toast.error("Failed to load currencies");
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const formik = useFormik({
    initialValues: {
      entityName: "",
      currency: "",
      addressLine: "",
      city: "",
      site: "",
      type: "",
      taxId: "",
      invoiceMailId: "",
      poMailId: "",
      PoSVOK: "",
    },
    validationSchema: Yup.object({
      entityName: Yup.string().required("Entity name is required"),
      currency: Yup.string().required("Currency is required"),
      addressLine: Yup.string().required("Address line is required"),
      city: Yup.string().required("City is required"),
      site: Yup.string().required("Site is required"),
      type: Yup.string().required("Type is required"),
      taxId: Yup.string().required("TAX ID is required"),
      invoiceMailId: Yup.string()
        .email("Invalid email")
        .required("Invoice mail ID is required"),
      poMailId: Yup.string()
        .email("Invalid email")
        .required("PO mail ID is required"),
      PoSVOK: Yup.string().required("SPOC is required"),
    }),
    onSubmit: async (values) => {
      console.log("Form Values:", values);
      const response = await addEntityData(values);
      if (response.status === 201) {
        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/entity-list-table");
        }, 1500);
      } else {
        toast.error(response.data.message);
      }
    },
  });

  const handleCurrencyChange = (selectedOption) => {
    formik.setFieldValue("currency", selectedOption?.value || "");
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 bg-white shadow-md rounded-md">
      <form onSubmit={formik.handleSubmit}>
        <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4 sm:mb-6">
          Entity Form
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="col-span-1">
            <label className="block text-sm sm:text-base text-gray-700">
              Entity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="entityName"
              value={formik.values.entityName}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 text-sm sm:text-base border rounded ${
                formik.errors.entityName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.entityName && (
              <div className="text-red-500 text-xs sm:text-sm">
                {formik.errors.entityName}
              </div>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm sm:text-base text-gray-700">
              Currency <span className="text-red-500">*</span>
            </label>
            <Select
              options={currencies}
              onChange={handleCurrencyChange}
              placeholder="Select a currency"
              className="mt-1 text-sm sm:text-base"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "38px",
                  "@media (max-width: 640px)": {
                    minHeight: "36px",
                  },
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
            />
            {formik.errors.currency && (
              <div className="text-red-500 text-xs sm:text-sm">
                {formik.errors.currency}
              </div>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm sm:text-base text-gray-700">
              Address Line <span className="text-red-500">*</span>
            </label>
            <textarea
              name="addressLine"
              value={formik.values.addressLine}
              onChange={formik.handleChange}
              rows={2}
              className={`mt-1 w-full p-2 text-sm sm:text-base border rounded ${
                formik.errors.addressLine ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.addressLine && (
              <div className="text-red-500 text-xs sm:text-sm">
                {formik.errors.addressLine}
              </div>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm sm:text-base text-gray-700">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 text-sm sm:text-base border rounded ${
                formik.errors.city ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.city && (
              <div className="text-red-500 text-xs sm:text-sm">
                {formik.errors.city}
              </div>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm sm:text-base text-gray-700">
              Site <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="site"
              value={formik.values.site}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 text-sm sm:text-base border rounded ${
                formik.errors.site ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.site && (
              <div className="text-red-500 text-xs sm:text-sm">
                {formik.errors.site}
              </div>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm sm:text-base text-gray-700">
              Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 text-sm sm:text-base border rounded ${
                formik.errors.type ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.type && (
              <div className="text-red-500 text-xs sm:text-sm">
                {formik.errors.type}
              </div>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm sm:text-base text-gray-700">
              Tax Id <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="taxId"
              value={formik.values.taxId}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 text-sm sm:text-base border rounded ${
                formik.errors.taxId ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.taxId && (
              <div className="text-red-500 text-xs sm:text-sm">
                {formik.errors.taxId}
              </div>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm sm:text-base text-gray-700">
              Invoice Mail ID <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="invoiceMailId"
              value={formik.values.invoiceMailId}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 text-sm sm:text-base border rounded ${
                formik.errors.invoiceMailId
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {formik.errors.invoiceMailId && (
              <div className="text-red-500 text-xs sm:text-sm">
                {formik.errors.invoiceMailId}
              </div>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm sm:text-base text-gray-700">
              PO Mail ID <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="poMailId"
              value={formik.values.poMailId}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 text-sm sm:text-base border rounded ${
                formik.errors.poMailId ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.poMailId && (
              <div className="text-red-500 text-xs sm:text-sm">
                {formik.errors.poMailId}
              </div>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-sm sm:text-base text-gray-700">
              SPOC (Single Point of Contact){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="PoSVOK"
              value={formik.values.PoSVOK}
              onChange={formik.handleChange}
              className={`mt-1 w-full p-2 text-sm sm:text-base border rounded ${
                formik.errors.PoSVOK ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formik.errors.PoSVOK && (
              <div className="text-red-500 text-xs sm:text-sm">
                {formik.errors.PoSVOK}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center sm:justify-end gap-2 sm:gap-4">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-primary text-white text-sm sm:text-base rounded hover:bg-primary-dark"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={formik.handleReset}
            className="w-full sm:w-auto px-4 py-2 bg-gray-400 text-white text-sm sm:text-base rounded hover:bg-gray-500"
          >
            Reset
          </button>
        </div>
      </form>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </div>
  );
}

export default AddEntity;
