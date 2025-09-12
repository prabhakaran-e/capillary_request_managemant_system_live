import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Plus,
  Download,
  FileText,
  AlertCircle,
  X,
  Check,
  Info,
  Trash2,
} from "lucide-react";
import {
  addNewPOData,
  deletePOData,
  getPoData,
  updatePOData,
} from "../../../api/service/adminServices";
import PoDataAddForm from "./PoDataAddForm";
import DataTable from "./DataTable";

const ProvisonTable = () => {
  const empId = localStorage.getItem("capEmpId");

  // Currency configuration
  const currencies = [
    { code: "USD", symbol: "$", locale: "en-US" },
    { code: "EUR", symbol: "€", locale: "de-DE" },
    { code: "GBP", symbol: "£", locale: "en-GB" },
    { code: "INR", symbol: "₹", locale: "en-IN" },
    { code: "AED", symbol: "د.إ", locale: "ar-AE" },
    { code: "IDR", symbol: "Rp", locale: "id-ID" },
    { code: "MYR", symbol: "RM", locale: "ms-MY" },
    { code: "SGD", symbol: "S$", locale: "en-SG" },
    { code: "PHP", symbol: "₱", locale: "fil-PH" },
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [csvError, setCsvError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showCsvInfo, setShowCsvInfo] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    fyStart: "",
    fyEnd: "",
    poNumber: "",
    vendorName: "",
    poDescription: "",
    computation: "",
    poValue: "",
    poStartDate: "",
    poEndDate: "",
    currency: "INR",
  });

  // Monthly entries for form with currency
  const [monthlyEntries, setMonthlyEntries] = useState([
    { id: Date.now(), month: "", year: "", amount: "", currency: "INR" },
  ]);

  // Required CSV field names - matching your backend API field names exactly
  const requiredCsvFields = [
    "fyStart",
    "fyEnd",
    "poNumber",
    "vendorName",
    "poDescription",
    "computation",
    "poValue",
    "currency",
    "poStartDate",
    "poEndDate",
  ];

  const optionalCsvFields = [
    "jan-2024",
    "feb-2024",
    "mar-2024",
    "apr-2024",
    "may-2024",
    "jun-2024",
    "jul-2024",
    "aug-2024",
    "sep-2024",
    "oct-2024",
    "nov-2024",
    "dec-2024",
    "jan-2025",
    "feb-2025",
    "mar-2025",
    "apr-2025",
    "may-2025",
    "jun-2025",
    "jul-2025",
    "aug-2025",
    "sep-2025",
    "oct-2025",
    "nov-2025",
    "dec-2025",
  ];

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 4000);
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getPoData();
        if (response.status === 200 && response.data) {
          // Transform backend data to match component structure
          const transformedData = response.data.map((item, index) => ({
            id: item._id || index,
            fyStart: item.fyStart,
            fyEnd: item.fyEnd,
            poNumber: item.poNumber,
            vendorName: item.vendorName,
            poDescription: item.poDescription,
            computation: item.computation,
            poValue: item.poValue?.toString() || "",
            poStartDate: item.poStartDate
              ? new Date(item.poStartDate).toISOString().split("T")[0]
              : "",
            poEndDate: item.poEndDate
              ? new Date(item.poEndDate).toISOString().split("T")[0]
              : "",
            currency: item.currency || "INR",
            monthlyData: item.monthlyData || {},
          }));
          setData(transformedData);
          showToast("Data loaded successfully");
        } else {
          showToast("Failed to load data", "error");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast("Error loading data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const months = [
    { value: "jan", label: "January" },
    { value: "feb", label: "February" },
    { value: "mar", label: "March" },
    { value: "apr", label: "April" },
    { value: "may", label: "May" },
    { value: "jun", label: "June" },
    { value: "jul", label: "July" },
    { value: "aug", label: "August" },
    { value: "sep", label: "September" },
    { value: "oct", label: "October" },
    { value: "nov", label: "November" },
    { value: "dec", label: "December" },
  ];

  const years = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

  const validateCsvHeaders = (headers) => {
    const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());
    const missingFields = requiredCsvFields.filter(
      (field) => !normalizedHeaders.includes(field.toLowerCase())
    );

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required CSV fields: ${missingFields.join(", ")}`
      );
    }

    return true;
  };

  const parseCSVData = (csvText) => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length < 2) throw new Error("CSV file is empty or invalid");

    const headers = lines[0].split(",").map((h) => h.trim());

    // Validate required headers
    validateCsvHeaders(headers);

    const parsedData = [];

    const monthColumns = headers.filter(
      (h) =>
        !requiredCsvFields.includes(h.trim().toLowerCase()) &&
        h.trim() !== "total"
    );

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < requiredCsvFields.length) continue;

      const monthlyData = {};
      monthColumns.forEach((month) => {
        const monthIndex = headers.indexOf(month);
        if (monthIndex !== -1 && values[monthIndex]) {
          const amount = values[monthIndex].replace(/[₹$€£د.إRpRM\s,]/g, "");
          if (amount && amount !== "-" && parseFloat(amount) > 0) {
            const currencyIndex = headers.findIndex(
              (h) => h.toLowerCase() === "currency"
            );
            monthlyData[month.toLowerCase().replace(" ", "-")] = {
              amount: amount,
              currency: currencyIndex !== -1 ? values[currencyIndex] : "INR",
            };
          }
        }
      });

      const getFieldValue = (fieldName) => {
        const fieldIndex = headers.findIndex(
          (h) => h.toLowerCase() === fieldName.toLowerCase()
        );
        return fieldIndex !== -1 ? values[fieldIndex] : "";
      };

      const entry = {
        fyStart: getFieldValue("fyStart"),
        fyEnd: getFieldValue("fyEnd"),
        poNumber: getFieldValue("poNumber"),
        vendorName: getFieldValue("vendorName"),
        poDescription: getFieldValue("poDescription"),
        computation: getFieldValue("computation"),
        poValue: getFieldValue("poValue"),
        currency: getFieldValue("currency") || "INR",
        poStartDate: getFieldValue("poStartDate"),
        poEndDate: getFieldValue("poEndDate"),
        monthlyData,
      };

      if (entry.poNumber) {
        parsedData.push(entry);
      }
    }

    return parsedData;
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setCsvError("Please select a valid CSV file");
      return;
    }

    setIsUploading(true);
    setCsvError("");

    try {
      const csvText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });

      // Parse CSV data with validation
      const parsedData = parseCSVData(csvText);

      if (parsedData.length === 0) {
        throw new Error("No valid data found in CSV file");
      }

      // Upload to API
      const response = await addNewPOData(parsedData, empId);

      if (response.status === 201) {
        // Refresh data from backend
        const updatedResponse = await getPoData();
        if (updatedResponse.status === 200) {
          const transformedData = updatedResponse.data.map((item, index) => ({
            id: item._id || index,
            fyStart: item.fyStart,
            fyEnd: item.fyEnd,
            poNumber: item.poNumber,
            vendorName: item.vendorName,
            poDescription: item.poDescription,
            computation: item.computation,
            poValue: item.poValue?.toString() || "",
            poStartDate: item.poStartDate
              ? new Date(item.poStartDate).toISOString().split("T")[0]
              : "",
            poEndDate: item.poEndDate
              ? new Date(item.poEndDate).toISOString().split("T")[0]
              : "",
            currency: item.currency || "INR",
            monthlyData: item.monthlyData || {},
          }));
          setData(transformedData);
        }
        showToast(
          `Successfully uploaded ${parsedData.length} entries from CSV`
        );
      } else {
        throw new Error("Failed to upload CSV data");
      }
    } catch (error) {
      console.error("CSV upload error:", error);
      setCsvError(
        error.message ||
          "Error processing CSV file. Please check the format and try again."
      );
      showToast("CSV upload failed", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const formatCurrency = (amount, currencyCode) => {
    if (!amount || amount === "0") return "-";

    const currency = currencies.find((c) => c.code === currencyCode);
    if (!currency) return amount;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;

    return `${currency.symbol}${numAmount.toLocaleString(currency.locale)}`;
  };

  // Get all unique months from all entries for table columns
  const getAllMonthColumns = () => {
    const allMonths = new Set();
    data.forEach((row) => {
      if (row.monthlyData) {
        Object.keys(row.monthlyData).forEach((key) => allMonths.add(key));
      }
    });
    return Array.from(allMonths).sort();
  };

  // Calculate total for a row
  const calculateRowTotal = (monthlyData) => {
    if (!monthlyData) return 0;
    return Object.values(monthlyData).reduce((sum, entry) => {
      const amount = typeof entry === "object" ? entry.amount : entry;
      const num = parseFloat(amount) || 0;
      return sum + num;
    }, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateMonthlyEntry = (index, field, value) => {
    setMonthlyEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addMonthlyEntry = () => {
    setMonthlyEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        month: "",
        year: "",
        amount: "",
        currency: formData.currency || "INR",
      },
    ]);
  };

  const removeMonthlyEntry = (index) => {
    if (monthlyEntries.length > 1) {
      setMonthlyEntries((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.poNumber || !formData.vendorName) {
        showToast("Please fill in required fields", "error");
        return;
      }

      // Process monthly entries
      const monthlyData = {};
      monthlyEntries.forEach((entry) => {
        if (entry.month && entry.year && entry.amount) {
          const key = `${entry.month}-${entry.year}`;
          monthlyData[key] = {
            amount: parseFloat(entry.amount),
            currency: entry.currency,
          };
        }
      });

      const newEntry = {
        ...formData,
        poValue: parseFloat(formData.poValue) || 0,
        monthlyData,
      };

      let response;
      if (editingId) {
        response = await updatePOData(editingId, newEntry, empId);
        if (response && response.status === 200) {
          // Refresh data
          const updatedResponse = await getPoData();
          if (updatedResponse.status === 200) {
            const transformedData = updatedResponse.data.map((item, index) => ({
              id: item._id || index,
              fyStart: item.fyStart,
              fyEnd: item.fyEnd,
              poNumber: item.poNumber,
              vendorName: item.vendorName,
              poDescription: item.poDescription,
              computation: item.computation,
              poValue: item.poValue?.toString() || "",
              poStartDate: item.poStartDate
                ? new Date(item.poStartDate).toISOString().split("T")[0]
                : "",
              poEndDate: item.poEndDate
                ? new Date(item.poEndDate).toISOString().split("T")[0]
                : "",
              currency: item.currency || "INR",
              monthlyData: item.monthlyData || {},
            }));
            setData(transformedData);
          }
          showToast("Entry updated successfully");
        } else {
          throw new Error("Failed to update entry");
        }
        setEditingId(null);
      } else {
        response = await addNewPOData(newEntry, empId);
        if (response.status === 201) {
          // Refresh data
          const updatedResponse = await getPoData();
          if (updatedResponse.status === 200) {
            const transformedData = updatedResponse.data.map((item, index) => ({
              id: item._id || index,
              fyStart: item.fyStart,
              fyEnd: item.fyEnd,
              poNumber: item.poNumber,
              vendorName: item.vendorName,
              poDescription: item.poDescription,
              computation: item.computation,
              poValue: item.poValue?.toString() || "",
              poStartDate: item.poStartDate
                ? new Date(item.poStartDate).toISOString().split("T")[0]
                : "",
              poEndDate: item.poEndDate
                ? new Date(item.poEndDate).toISOString().split("T")[0]
                : "",
              currency: item.currency || "INR",
              monthlyData: item.monthlyData || {},
            }));
            setData(transformedData);
          }
          showToast("Entry added successfully");
        } else {
          throw new Error("Failed to add entry");
        }
      }

      // Reset form
      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
      showToast(error.message || "Operation failed", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      fyStart: "",
      fyEnd: "",
      poNumber: "",
      vendorName: "",
      poDescription: "",
      computation: "",
      poValue: "",
      poStartDate: "",
      poEndDate: "",
      currency: "INR",
    });
    setMonthlyEntries([
      { id: Date.now(), month: "", year: "", amount: "", currency: "INR" },
    ]);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    const { monthlyData, ...basicData } = item;
    setFormData({
      ...basicData,
      poStartDate: basicData.poStartDate || "",
      poEndDate: basicData.poEndDate || "",
    });

    // Convert monthlyData to monthlyEntries
    const entries = [];
    if (monthlyData) {
      Object.entries(monthlyData).forEach(([key, value]) => {
        const amount = typeof value === "object" ? value.amount : value;
        const currency =
          typeof value === "object" ? value.currency : item.currency || "INR";

        if (amount && amount !== "0") {
          const [month, year] = key.split("-");
          entries.push({
            id: Date.now() + Math.random(),
            month,
            year,
            amount: amount.toString(),
            currency,
          });
        }
      });
    }

    if (entries.length === 0) {
      entries.push({
        id: Date.now(),
        month: "",
        year: "",
        amount: "",
        currency: item.currency || "INR",
      });
    }

    setMonthlyEntries(entries);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setDeleteModal({ show: true, item });
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;

    try {
      const response = await deletePOData(deleteModal.item.id, empId);
      if (response.status === 200) {
        setData((prev) =>
          prev.filter((item) => item.id !== deleteModal.item.id)
        );
        showToast("Entry deleted successfully");
      } else {
        throw new Error("Failed to delete entry");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete entry", "error");
    } finally {
      setDeleteModal({ show: false, item: null });
    }
  };

  const exportToCSV = () => {
    const monthColumns = getAllMonthColumns();
    const headers = [
      "fyStart",
      "fyEnd",
      "poNumber",
      "vendorName",
      "poDescription",
      "computation",
      "poValue",
      "currency",
      "poStartDate",
      "poEndDate",
      ...monthColumns,
      "total",
    ];

    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        [
          row.fyStart,
          row.fyEnd,
          row.poNumber,
          row.vendorName,
          row.poDescription,
          row.computation,
          row.poValue,
          row.currency,
          row.poStartDate,
          row.poEndDate,
          ...monthColumns.map((col) => {
            const monthData = row.monthlyData?.[col];
            const amount =
              typeof monthData === "object" ? monthData.amount : monthData;
            return amount || "0";
          }),
          calculateRowTotal(row.monthlyData),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial_year_po_data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    showToast("CSV exported successfully");
  };

  const monthColumns = getAllMonthColumns();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-100 border border-red-400 text-red-700"
              : "bg-green-100 border border-green-400 text-green-700"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Check className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast({ show: false, message: "", type: "" })}
            className="ml-2 hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Entry
                </h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this entry? This action cannot
                  be undone.
                </p>
              </div>
            </div>

            {deleteModal.item && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-900">
                  PO Number: {deleteModal.item.poNumber}
                </p>
                <p className="text-sm text-gray-600">
                  Vendor: {deleteModal.item.vendorName}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, item: null })}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full mx-auto bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-800">
              Financial Year Purchase Order Manager
            </h1>

            <div className="flex flex-wrap gap-4">
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New Entry
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCSVUpload}
                accept=".csv"
                className="hidden"
              />

              <div className="relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  <Upload className="w-4 h-4" />
                  {isUploading ? "Uploading..." : "Upload CSV"}
                </button>
                <button
                  onClick={() => setShowCsvInfo(!showCsvInfo)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* CSV Info Panel */}
          {showCsvInfo && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                CSV Upload Requirements:
              </h4>
              <div className="text-sm text-blue-800">
                <p className="mb-2">
                  <strong>Required Fields (exact names):</strong>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                  {requiredCsvFields.map((field) => (
                    <span
                      key={field}
                      className="bg-blue-100 px-2 py-1 rounded text-xs font-mono"
                    >
                      {field}
                    </span>
                  ))}
                </div>
                <p className="mb-2">
                  <strong>Optional Monthly Fields (examples):</strong>
                </p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {optionalCsvFields.slice(0, 12).map((field) => (
                    <span
                      key={field}
                      className="bg-gray-100 px-2 py-1 rounded text-xs font-mono"
                    >
                      {field}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs">
                  Note: Field names are case-sensitive and must match exactly.
                </p>
              </div>
            </div>
          )}

          {/* CSV Error Display */}
          {csvError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{csvError}</span>
              <button
                onClick={() => setCsvError("")}
                className="ml-auto text-red-700 hover:text-red-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Entry Form */}
        {showForm && (
          <PoDataAddForm
            formData={formData}
            handleInputChange={handleInputChange}
            currencies={currencies}
            monthlyEntries={monthlyEntries}
            updateMonthlyEntry={updateMonthlyEntry}
            months={months}
            years={years}
            addMonthlyEntry={addMonthlyEntry}
            removeMonthlyEntry={removeMonthlyEntry}
            setShowForm={setShowForm}
            setEditingId={setEditingId}
            resetForm={resetForm}
            handleSubmit={handleSubmit}
            editingId={editingId}
          />
        )}

        {/* Data Table */}
        <DataTable
          monthColumns={monthColumns}
          data={data}
          formatCurrency={formatCurrency}
          calculateRowTotal={calculateRowTotal}
          handleEdit={handleEdit}
          handleDeleteClick={handleDeleteClick}
        />
      </div>
    </div>
  );
};

export default ProvisonTable;
