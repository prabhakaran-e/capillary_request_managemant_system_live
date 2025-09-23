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
  Calculator,
} from "lucide-react";

const PrepaidTable = () => {
  const empId = localStorage.getItem("capEmpId");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
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
    rpNumber: "",
    glNumber: "",
    month: "",
    year: "",
    vendor: "",
    remarks: "",
    nsDocumentId: "",
    invoiceNoDate: "",
    invoiceAmount: "",
    remarksFromMonth: "",
    remarksFromYear: "",
    remarksToMonth: "",
    remarksToYear: "",
    startDate: "",
    endDate: "",
    numberOfDays: "",
    clBal: "",
    mar24: "",
    amtPerDay: "",
    openingBalance: "",
    monthlyData: {},
  });

  // Monthly entries state for form
  const [monthlyEntries, setMonthlyEntries] = useState([
    {
      id: Date.now(),
      month: "",
      year: "",
      openingBalance: "",
      addition: "",
      amortization: "",
    },
  ]);

  // Available months and years
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = ["2024", "2025", "2026", "2027", "2028"];

  // Available months for the prepaid calculations with proper format
  const availableMonths = [
    "2024-04",
    "2024-05",
    "2024-06",
    "2024-07",
    "2024-08",
    "2024-09",
    "2024-10",
    "2024-11",
    "2024-12",
    "2025-01",
    "2025-02",
    "2025-03",
    "2025-04",
    "2025-05",
    "2025-06",
    "2025-07",
    "2025-08",
    "2025-09",
    "2025-10",
    "2025-11",
    "2025-12",
    "2026-01",
    "2026-02",
    "2026-03",
  ];

  // Format month-year for display
  const formatMonthYear = (monthYear) => {
    if (!monthYear) return "";
    const [year, month] = monthYear.split("-");
    const monthName = months.find((m) => m.value === month)?.label || month;
    return `${monthName} ${year}`;
  };

  // Required CSV field names
  const requiredCsvFields = [
    "rpNumber",
    "glNumber",
    "month",
    "year",
    "vendor",
    "remarks",
    "nsDocumentId",
    "invoiceNoDate",
    "invoiceAmount",
    "remarksFromMonth",
    "remarksFromYear",
    "remarksToMonth",
    "remarksToYear",
    "startDate",
    "endDate",
    "numberOfDays",
    "clBal",
    "mar24",
    "amtPerDay",
    "openingBalance",
  ];

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 4000);
  };

  // Calculate number of days between two dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  // Calculate amount per day
  const calculateAmtPerDay = (invoiceAmount, numberOfDays) => {
    if (!invoiceAmount || !numberOfDays || numberOfDays === 0) return 0;
    return parseFloat(invoiceAmount) / parseInt(numberOfDays);
  };

  // Calculate closing balance for monthly entry
  const calculateClosingBalance = (openingBalance, addition, amortization) => {
    const opening = parseFloat(openingBalance) || 0;
    const add = parseFloat(addition) || 0;
    const amort = parseFloat(amortization) || 0;
    return opening + add - amort;
  };

  // Auto-calculate fields when related fields change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = calculateDays(formData.startDate, formData.endDate);
      setFormData((prev) => ({ ...prev, numberOfDays: days.toString() }));
    }
  }, [formData.startDate, formData.endDate]);

  useEffect(() => {
    if (formData.invoiceAmount && formData.numberOfDays) {
      const amtPerDay = calculateAmtPerDay(
        formData.invoiceAmount,
        formData.numberOfDays
      );
      setFormData((prev) => ({ ...prev, amtPerDay: amtPerDay.toFixed(2) }));
    }
  }, [formData.invoiceAmount, formData.numberOfDays]);

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

    validateCsvHeaders(headers);

    const parsedData = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < requiredCsvFields.length) continue;

      const getFieldValue = (fieldName) => {
        const fieldIndex = headers.findIndex(
          (h) => h.toLowerCase() === fieldName.toLowerCase()
        );
        return fieldIndex !== -1 ? values[fieldIndex] : "";
      };

      // Parse monthly data
      const monthlyData = {};
      availableMonths.forEach((monthYear) => {
        const monthIndex = headers.findIndex(
          (h) => h.toLowerCase() === monthYear.toLowerCase()
        );
        if (monthIndex !== -1 && values[monthIndex]) {
          const amount = values[monthIndex].replace(/[₹$€£د.إRpRM\s,]/g, "");
          if (amount && amount !== "-" && parseFloat(amount) > 0) {
            monthlyData[monthYear] = {
              openingBalance: 0,
              addition: 0,
              amortization: parseFloat(amount),
              closingBalance: 0,
            };
          }
        }
      });

      const entry = {
        id: Date.now() + Math.random(),
        rpNumber: getFieldValue("rpNumber"),
        glNumber: getFieldValue("glNumber"),
        month: getFieldValue("month"),
        year: getFieldValue("year"),
        vendor: getFieldValue("vendor"),
        remarks: getFieldValue("remarks"),
        nsDocumentId: getFieldValue("nsDocumentId"),
        invoiceNoDate: getFieldValue("invoiceNoDate"),
        invoiceAmount: getFieldValue("invoiceAmount"),
        remarksFromMonth: getFieldValue("remarksFromMonth"),
        remarksFromYear: getFieldValue("remarksFromYear"),
        remarksToMonth: getFieldValue("remarksToMonth"),
        remarksToYear: getFieldValue("remarksToYear"),
        startDate: getFieldValue("startDate"),
        endDate: getFieldValue("endDate"),
        numberOfDays: getFieldValue("numberOfDays"),
        clBal: getFieldValue("clBal"),
        mar24: getFieldValue("mar24"),
        amtPerDay: getFieldValue("amtPerDay"),
        openingBalance: getFieldValue("openingBalance"),
        monthlyData,
      };

      if (entry.rpNumber || entry.vendor) {
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

      const parsedData = parseCSVData(csvText);

      if (parsedData.length === 0) {
        throw new Error("No valid data found in CSV file");
      }

      setData((prevData) => [...prevData, ...parsedData]);
      showToast(`Successfully uploaded ${parsedData.length} entries from CSV`);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle monthly entries changes
  const handleMonthlyEntryChange = (index, field, value) => {
    setMonthlyEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  };

  // Add new monthly entry
  const addMonthlyEntry = () => {
    setMonthlyEntries((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        month: "",
        year: "",
        openingBalance: "",
        addition: "",
        amortization: "",
      },
    ]);
  };

  // Remove monthly entry
  const removeMonthlyEntry = (index) => {
    if (monthlyEntries.length > 1) {
      setMonthlyEntries((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.vendor || !formData.invoiceAmount) {
        showToast(
          "Please fill in required fields (Vendor and Invoice Amount)",
          "error"
        );
        return;
      }

      // Process monthly entries into monthlyData format
      const monthlyData = {};
      monthlyEntries.forEach((entry) => {
        if (entry.month && entry.year) {
          const monthYear = `${entry.year}-${entry.month}`;
          const closingBalance = calculateClosingBalance(
            entry.openingBalance,
            entry.addition,
            entry.amortization
          );

          monthlyData[monthYear] = {
            openingBalance: parseFloat(entry.openingBalance) || 0,
            addition: parseFloat(entry.addition) || 0,
            amortization: parseFloat(entry.amortization) || 0,
            closingBalance: closingBalance,
          };
        }
      });

      const newEntry = {
        id: editingId || Date.now(),
        ...formData,
        monthlyData,
      };

      if (editingId) {
        setData((prevData) =>
          prevData.map((item) => (item.id === editingId ? newEntry : item))
        );
        showToast("Entry updated successfully");
        setEditingId(null);
      } else {
        setData((prevData) => [...prevData, newEntry]);
        showToast("Entry added successfully");
      }

      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
      showToast(error.message || "Operation failed", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      rpNumber: "",
      glNumber: "",
      month: "",
      year: "",
      vendor: "",
      remarks: "",
      nsDocumentId: "",
      invoiceNoDate: "",
      invoiceAmount: "",
      remarksFromMonth: "",
      remarksFromYear: "",
      remarksToMonth: "",
      remarksToYear: "",
      startDate: "",
      endDate: "",
      numberOfDays: "",
      clBal: "",
      mar24: "",
      amtPerDay: "",
      openingBalance: "",
      monthlyData: {},
    });
    setMonthlyEntries([
      {
        id: Date.now(),
        month: "",
        year: "",
        openingBalance: "",
        addition: "",
        amortization: "",
      },
    ]);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setFormData({
      rpNumber: item.rpNumber || "",
      glNumber: item.glNumber || "",
      month: item.month || "",
      year: item.year || "",
      vendor: item.vendor || "",
      remarks: item.remarks || "",
      nsDocumentId: item.nsDocumentId || "",
      invoiceNoDate: item.invoiceNoDate || "",
      invoiceAmount: item.invoiceAmount || "",
      remarksFromMonth: item.remarksFromMonth || "",
      remarksFromYear: item.remarksFromYear || "",
      remarksToMonth: item.remarksToMonth || "",
      remarksToYear: item.remarksToYear || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      numberOfDays: item.numberOfDays || "",
      clBal: item.clBal || "",
      mar24: item.mar24 || "",
      amtPerDay: item.amtPerDay || "",
      openingBalance: item.openingBalance || "",
      monthlyData: item.monthlyData || {},
    });

    // Convert monthlyData back to monthlyEntries format for editing
    const entries = Object.entries(item.monthlyData || {}).map(
      ([monthYear, data]) => {
        const [year, month] = monthYear.split("-");
        return {
          id: Date.now() + Math.random(),
          month: month,
          year: year,
          openingBalance: data.openingBalance?.toString() || "",
          addition: data.addition?.toString() || "",
          amortization: data.amortization?.toString() || "",
        };
      }
    );

    setMonthlyEntries(
      entries.length > 0
        ? entries
        : [
            {
              id: Date.now(),
              month: "",
              year: "",
              openingBalance: "",
              addition: "",
              amortization: "",
            },
          ]
    );

    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setDeleteModal({ show: true, item });
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;

    try {
      setData((prevData) =>
        prevData.filter((item) => item.id !== deleteModal.item.id)
      );
      showToast("Entry deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("Failed to delete entry", "error");
    } finally {
      setDeleteModal({ show: false, item: null });
    }
  };

  const exportToCSV = () => {
    const headers = [
      ...requiredCsvFields,
      ...availableMonths.map((m) => `${m}_opening_balance`),
      ...availableMonths.map((m) => `${m}_addition`),
      ...availableMonths.map((m) => `${m}_amortization`),
      ...availableMonths.map((m) => `${m}_closing_balance`),
    ];

    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        [
          row.rpNumber || "",
          row.glNumber || "",
          row.month || "",
          row.year || "",
          row.vendor || "",
          row.remarks || "",
          row.nsDocumentId || "",
          row.invoiceNoDate || "",
          row.invoiceAmount || "",
          row.remarksFromMonth || "",
          row.remarksFromYear || "",
          row.remarksToMonth || "",
          row.remarksToYear || "",
          row.startDate || "",
          row.endDate || "",
          row.numberOfDays || "",
          row.clBal || "",
          row.mar24 || "",
          row.amtPerDay || "",
          row.openingBalance || "",
          ...availableMonths.map(
            (month) => row.monthlyData?.[month]?.openingBalance || "0"
          ),
          ...availableMonths.map(
            (month) => row.monthlyData?.[month]?.addition || "0"
          ),
          ...availableMonths.map(
            (month) => row.monthlyData?.[month]?.amortization || "0"
          ),
          ...availableMonths.map(
            (month) => row.monthlyData?.[month]?.closingBalance || "0"
          ),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prepaid_expenses_data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    showToast("CSV exported successfully");
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === "0") return "-";
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return `₹${num.toLocaleString("en-IN")}`;
  };

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
                  Are you sure you want to delete this prepaid entry? This
                  action cannot be undone.
                </p>
              </div>
            </div>

            {deleteModal.item && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-900">
                  RP#: {deleteModal.item.rpNumber || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Vendor: {deleteModal.item.vendor}
                </p>
                <p className="text-sm text-gray-600">
                  Amount: {formatCurrency(deleteModal.item.invoiceAmount)}
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
              Prepaid Expenses Management
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  {requiredCsvFields.map((field) => (
                    <span
                      key={field}
                      className="bg-blue-100 px-2 py-1 rounded text-xs font-mono"
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
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              {editingId ? "Edit Prepaid Entry" : "Add New Prepaid Entry"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RP Number
                </label>
                <input
                  type="text"
                  name="rpNumber"
                  value={formData.rpNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="RP001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GL Number
                </label>
                <input
                  type="text"
                  name="glNumber"
                  value={formData.glNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="GL001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Month</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor *
                </label>
                <input
                  type="text"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  placeholder="Vendor Name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <input
                  type="text"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Additional remarks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NS Document ID
                </label>
                <input
                  type="text"
                  name="nsDocumentId"
                  value={formData.nsDocumentId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="NS001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice No/Date
                </label>
                <input
                  type="text"
                  name="invoiceNoDate"
                  value={formData.invoiceNoDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="INV001/2024-04-01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Amount *
                </label>
                <input
                  type="number"
                  name="invoiceAmount"
                  value={formData.invoiceAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  placeholder="100000"
                />
              </div>

              {/* Remarks From To - Month/Year Dropdowns */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks From To (Month/Year Range)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <select
                      name="remarksFromMonth"
                      value={formData.remarksFromMonth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">From Month</option>
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      name="remarksFromYear"
                      value={formData.remarksFromYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">From Year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      name="remarksToMonth"
                      value={formData.remarksToMonth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">To Month</option>
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      name="remarksToYear"
                      value={formData.remarksToYear}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">To Year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No of Days (Auto-calculated)
                </label>
                <input
                  type="number"
                  name="numberOfDays"
                  value={formData.numberOfDays}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                  placeholder="365"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CL Bal
                </label>
                <input
                  type="text"
                  name="clBal"
                  value={formData.clBal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Closing Balance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mar'24
                </label>
                <input
                  type="number"
                  name="mar24"
                  value={formData.mar24}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amt Per Day (Auto-calculated)
                </label>
                <input
                  type="number"
                  name="amtPerDay"
                  value={formData.amtPerDay}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                  placeholder="273.97"
                  step="0.01"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Balance
                </label>
                <input
                  type="number"
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Monthly Entries Section */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-700">
                  Monthly Data Entries
                </h4>
                <button
                  type="button"
                  onClick={addMonthlyEntry}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add More Entry
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {monthlyEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-sm font-medium text-gray-700">
                        Entry {index + 1}
                      </h5>
                      {monthlyEntries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMonthlyEntry(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Month *
                        </label>
                        <select
                          value={entry.month}
                          onChange={(e) =>
                            handleMonthlyEntryChange(
                              index,
                              "month",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          required
                        >
                          <option value="">Select Month</option>
                          {months.map((month) => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Year *
                        </label>
                        <select
                          value={entry.year}
                          onChange={(e) =>
                            handleMonthlyEntryChange(
                              index,
                              "year",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          required
                        >
                          <option value="">Select Year</option>
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Opening Balance
                        </label>
                        <input
                          type="number"
                          value={entry.openingBalance}
                          onChange={(e) =>
                            handleMonthlyEntryChange(
                              index,
                              "openingBalance",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Addition
                        </label>
                        <input
                          type="number"
                          value={entry.addition}
                          onChange={(e) =>
                            handleMonthlyEntryChange(
                              index,
                              "addition",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Amortization
                        </label>
                        <input
                          type="number"
                          value={entry.amortization}
                          onChange={(e) =>
                            handleMonthlyEntryChange(
                              index,
                              "amortization",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Show calculated closing balance */}
                    {(entry.openingBalance ||
                      entry.addition ||
                      entry.amortization) && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <span className="text-xs text-blue-800">
                          <strong>Calculated Closing Balance: </strong>₹
                          {calculateClosingBalance(
                            entry.openingBalance,
                            entry.addition,
                            entry.amortization
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-calculation notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <strong>Auto-calculations:</strong> Number of Days = (End Date -
                Start Date + 1), Amount Per Day = Invoice Amount ÷ Number of
                Days, Closing Balance = Opening Balance + Addition -
                Amortization
              </p>
            </div>

            {/* Form Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingId ? "Update Entry" : "Add Entry"}
              </button>
            </div>
          </div>
        )}

        {/* Data Table with Scrollable Container */}
        <div className="p-6">
          <div
            className="overflow-auto border border-gray-300 rounded-lg"
            style={{ maxHeight: "600px" }}
          >
            <table
              className="w-full border-collapse bg-white sticky-header"
              style={{ minWidth: "3000px" }}
            >
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-16 sticky left-0 bg-gray-100">
                    RP#
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-16">
                    GL#
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">
                    Month
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-16">
                    Year
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-32">
                    Vendor
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-32">
                    Remarks
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">
                    NS Doc ID
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-32">
                    Invoice No/Date
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-24">
                    Invoice Amount
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-32">
                    Remarks From To
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">
                    Start Date
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">
                    End Date
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-16">
                    No of Days
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-16">
                    CL Bal
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-16">
                    Mar'24
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">
                    Amt Per Day
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">
                    Opening Balance
                  </th>

                  {/* Monthly columns with subheaders */}
                  {availableMonths.map((monthYear) => (
                    <th
                      key={monthYear}
                      className="border border-gray-300 px-1 py-1 text-center text-xs font-medium text-gray-700 uppercase w-20"
                      colSpan={3}
                    >
                      {formatMonthYear(monthYear)}
                    </th>
                  ))}

                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-24 sticky right-0 bg-gray-100">
                    Actions
                  </th>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 sticky left-0 bg-gray-100">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>
                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700">
                    &nbsp;
                  </th>

                  {/* Monthly subheaders */}
                  {availableMonths.map((monthYear) => (
                    <React.Fragment key={`sub-${monthYear}`}>
                      <th className="border border-gray-300 px-1 py-1 text-center text-xs font-medium text-gray-600 bg-blue-50 w-16">
                        Opening
                      </th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-xs font-medium text-gray-600 bg-green-50 w-16">
                        Addition
                      </th>
                      <th className="border border-gray-300 px-1 py-1 text-center text-xs font-medium text-gray-600 bg-red-50 w-16">
                        Amortization
                      </th>
                    </React.Fragment>
                  ))}

                  <th className="border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 sticky right-0 bg-gray-100">
                    &nbsp;
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    }`}
                  >
                    <td className="border border-gray-300 px-2 py-2 text-xs sticky left-0 bg-inherit">
                      {row.rpNumber}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">
                      {row.glNumber}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">
                      {row.month
                        ? months.find((m) => m.value === row.month)?.label
                        : ""}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">
                      {row.year}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">
                      {row.vendor}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">
                      {row.remarks}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">
                      {row.nsDocumentId}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">
                      {row.invoiceNoDate}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs text-right">
                      {formatCurrency(row.invoiceAmount)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">
                      {row.remarksFromMonth &&
                      row.remarksFromYear &&
                      row.remarksToMonth &&
                      row.remarksToYear
                        ? `${
                            months.find((m) => m.value === row.remarksFromMonth)
                              ?.label
                          } ${row.remarksFromYear} - ${
                            months.find((m) => m.value === row.remarksToMonth)
                              ?.label
                          } ${row.remarksToYear}`
                        : ""}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">
                      {row.startDate}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">
                      {row.endDate}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-xs text-center">
                      {row.numberOfDays}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">
                      {row.clBal}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-xs text-right">
                      {formatCurrency(row.mar24)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-xs text-right">
                      {formatCurrency(row.amtPerDay)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-xs text-right">
                      {formatCurrency(row.openingBalance)}
                    </td>

                    {/* Monthly data columns */}
                    {availableMonths.map((monthYear) => {
                      const monthData = row.monthlyData?.[monthYear];
                      return (
                        <React.Fragment key={`data-${monthYear}`}>
                          <td className="border border-gray-300 px-1 py-2 text-xs text-right bg-blue-25">
                            {monthData?.openingBalance
                              ? formatCurrency(monthData.openingBalance)
                              : "-"}
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-xs text-right bg-green-25">
                            {monthData?.addition
                              ? formatCurrency(monthData.addition)
                              : "-"}
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-xs text-right bg-red-25">
                            {monthData?.amortization
                              ? formatCurrency(monthData.amortization)
                              : "-"}
                          </td>
                        </React.Fragment>
                      );
                    })}

                    <td className="border border-gray-300 px-3 py-2 text-xs sticky right-0 bg-inherit">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(row)}
                          className="px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(row)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No prepaid entries available. Add new entries to get started.
              </p>
            </div>
          )}

          {/* Display Monthly Entries Summary */}
          {data.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Monthly Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((row) =>
                  Object.entries(row.monthlyData || {}).map(
                    ([monthYear, monthData]) => (
                      <div
                        key={`${row.id}-${monthYear}`}
                        className="bg-white p-3 rounded border"
                      >
                        <div className="text-sm font-medium text-gray-800">
                          {formatMonthYear(monthYear)} - {row.vendor}
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Opening:</span>
                            <span>
                              {formatCurrency(monthData.openingBalance)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Addition:</span>
                            <span className="text-green-600">
                              {formatCurrency(monthData.addition)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Amortization:</span>
                            <span className="text-red-600">
                              {formatCurrency(monthData.amortization)}
                            </span>
                          </div>
                          <div className="flex justify-between font-medium border-t pt-1">
                            <span>Closing:</span>
                            <span>
                              {formatCurrency(monthData.closingBalance)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrepaidTable;
