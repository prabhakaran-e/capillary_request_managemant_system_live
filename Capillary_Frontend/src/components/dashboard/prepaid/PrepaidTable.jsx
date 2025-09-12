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
    vendor: "",
    remarks: "",
    nsDocumentId: "",
    invoiceNoDate: "",
    invoiceAmount: "",
    remarksFromTo: "",
    startDate: "",
    endDate: "",
    numberOfDays: "",
    clBal: "",
    mar24: "",
    amtPerDay: "",
    openingBalance: "",
    // Monthly data will be calculated
    monthlyData: {},
  });

  // Available months for the prepaid calculations
  const availableMonths = [
    "apr-24", "may-24", "jun-24", "jul-24", "aug-24", "sep-24",
    "oct-24", "nov-24", "dec-24", "jan-25", "feb-25", "mar-25",
    "apr-25", "may-25", "jun-25", "jul-25", "aug-25", "sep-25",
    "oct-25", "nov-25", "dec-25"
  ];

  // Required CSV field names
  const requiredCsvFields = [
    "rpNumber",
    "glNumber", 
    "month",
    "vendor",
    "remarks",
    "nsDocumentId",
    "invoiceNoDate",
    "invoiceAmount",
    "remarksFromTo",
    "startDate",
    "endDate",
    "numberOfDays",
    "clBal",
    "mar24",
    "amtPerDay",
    "openingBalance"
  ];

  const optionalCsvFields = availableMonths;

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
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
  };

  // Calculate amount per day
  const calculateAmtPerDay = (invoiceAmount, numberOfDays) => {
    if (!invoiceAmount || !numberOfDays || numberOfDays === 0) return 0;
    return parseFloat(invoiceAmount) / parseInt(numberOfDays);
  };

  // Calculate monthly amortization
  const calculateMonthlyAmortization = (month, startDate, endDate, amtPerDay) => {
    if (!startDate || !endDate || !amtPerDay) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Extract year and month from the month string (e.g., "apr-25" -> 2025, 3)
    const [monthName, year] = month.split('-');
    const monthMap = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };
    
    const targetMonth = monthMap[monthName];
    const targetYear = parseInt('20' + year);
    
    // Get the first and last day of the target month
    const monthStart = new Date(targetYear, targetMonth, 1);
    const monthEnd = new Date(targetYear, targetMonth + 1, 0);
    
    // Find the overlap between the invoice period and the target month
    const overlapStart = new Date(Math.max(start.getTime(), monthStart.getTime()));
    const overlapEnd = new Date(Math.min(end.getTime(), monthEnd.getTime()));
    
    if (overlapStart > overlapEnd) return 0;
    
    const daysInMonth = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 3600 * 24)) + 1;
    return daysInMonth * parseFloat(amtPerDay);
  };

  // Auto-calculate fields when related fields change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = calculateDays(formData.startDate, formData.endDate);
      setFormData(prev => ({ ...prev, numberOfDays: days.toString() }));
    }
  }, [formData.startDate, formData.endDate]);

  useEffect(() => {
    if (formData.invoiceAmount && formData.numberOfDays) {
      const amtPerDay = calculateAmtPerDay(formData.invoiceAmount, formData.numberOfDays);
      setFormData(prev => ({ ...prev, amtPerDay: amtPerDay.toFixed(2) }));
    }
  }, [formData.invoiceAmount, formData.numberOfDays]);

  const validateCsvHeaders = (headers) => {
    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
    const missingFields = requiredCsvFields.filter(field => 
      !normalizedHeaders.includes(field.toLowerCase())
    );
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required CSV fields: ${missingFields.join(', ')}`);
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

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < requiredCsvFields.length) continue;

      const getFieldValue = (fieldName) => {
        const fieldIndex = headers.findIndex(h => h.toLowerCase() === fieldName.toLowerCase());
        return fieldIndex !== -1 ? values[fieldIndex] : "";
      };

      // Parse monthly data
      const monthlyData = {};
      availableMonths.forEach(month => {
        const monthIndex = headers.findIndex(h => h.toLowerCase() === month.toLowerCase());
        if (monthIndex !== -1 && values[monthIndex]) {
          const amount = values[monthIndex].replace(/[₹$€£د.إRpRM\s,]/g, "");
          if (amount && amount !== "-" && parseFloat(amount) > 0) {
            monthlyData[month] = parseFloat(amount);
          }
        }
      });

      const entry = {
        id: Date.now() + Math.random(),
        rpNumber: getFieldValue("rpNumber"),
        glNumber: getFieldValue("glNumber"),
        month: getFieldValue("month"),
        vendor: getFieldValue("vendor"),
        remarks: getFieldValue("remarks"),
        nsDocumentId: getFieldValue("nsDocumentId"),
        invoiceNoDate: getFieldValue("invoiceNoDate"),
        invoiceAmount: getFieldValue("invoiceAmount"),
        remarksFromTo: getFieldValue("remarksFromTo"),
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

      // Parse CSV data with validation
      const parsedData = parseCSVData(csvText);

      if (parsedData.length === 0) {
        throw new Error("No valid data found in CSV file");
      }

      // Add parsed data to existing data
      setData(prevData => [...prevData, ...parsedData]);
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

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.vendor || !formData.invoiceAmount) {
        showToast("Please fill in required fields (Vendor and Invoice Amount)", "error");
        return;
      }

      // Calculate monthly amortization data
      const monthlyData = {};
      if (formData.startDate && formData.endDate && formData.amtPerDay) {
        availableMonths.forEach(month => {
          const amortization = calculateMonthlyAmortization(
            month, 
            formData.startDate, 
            formData.endDate, 
            formData.amtPerDay
          );
          if (amortization > 0) {
            monthlyData[month] = amortization;
          }
        });
      }

      const newEntry = {
        id: editingId || Date.now(),
        ...formData,
        monthlyData,
      };

      if (editingId) {
        setData(prevData => 
          prevData.map(item => item.id === editingId ? newEntry : item)
        );
        showToast("Entry updated successfully");
        setEditingId(null);
      } else {
        setData(prevData => [...prevData, newEntry]);
        showToast("Entry added successfully");
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
      rpNumber: "",
      glNumber: "",
      month: "",
      vendor: "",
      remarks: "",
      nsDocumentId: "",
      invoiceNoDate: "",
      invoiceAmount: "",
      remarksFromTo: "",
      startDate: "",
      endDate: "",
      numberOfDays: "",
      clBal: "",
      mar24: "",
      amtPerDay: "",
      openingBalance: "",
      monthlyData: {},
    });
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setFormData({
      rpNumber: item.rpNumber || "",
      glNumber: item.glNumber || "",
      month: item.month || "",
      vendor: item.vendor || "",
      remarks: item.remarks || "",
      nsDocumentId: item.nsDocumentId || "",
      invoiceNoDate: item.invoiceNoDate || "",
      invoiceAmount: item.invoiceAmount || "",
      remarksFromTo: item.remarksFromTo || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      numberOfDays: item.numberOfDays || "",
      clBal: item.clBal || "",
      mar24: item.mar24 || "",
      amtPerDay: item.amtPerDay || "",
      openingBalance: item.openingBalance || "",
      monthlyData: item.monthlyData || {},
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setDeleteModal({ show: true, item });
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    
    try {
      setData(prevData => prevData.filter(item => item.id !== deleteModal.item.id));
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
      ...availableMonths,
    ];

    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        [
          row.rpNumber || "",
          row.glNumber || "",
          row.month || "",
          row.vendor || "",
          row.remarks || "",
          row.nsDocumentId || "",
          row.invoiceNoDate || "",
          row.invoiceAmount || "",
          row.remarksFromTo || "",
          row.startDate || "",
          row.endDate || "",
          row.numberOfDays || "",
          row.clBal || "",
          row.mar24 || "",
          row.amtPerDay || "",
          row.openingBalance || "",
          ...availableMonths.map(month => row.monthlyData?.[month] || "0"),
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
    return `₹${num.toLocaleString('en-IN')}`;
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
                <h3 className="text-lg font-medium text-gray-900">Delete Entry</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this prepaid entry? This action cannot be undone.
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
              <h4 className="font-medium text-blue-900 mb-2">CSV Upload Requirements:</h4>
              <div className="text-sm text-blue-800">
                <p className="mb-2"><strong>Required Fields (exact names):</strong></p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  {requiredCsvFields.map(field => (
                    <span key={field} className="bg-blue-100 px-2 py-1 rounded text-xs font-mono">
                      {field}
                    </span>
                  ))}
                </div>
                <p className="mb-2"><strong>Optional Monthly Fields (examples):</strong></p>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {optionalCsvFields.slice(0, 12).map(field => (
                    <span key={field} className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                      {field}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs">Note: Field names are case-sensitive and must match exactly.</p>
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
                <input
                  type="text"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Apr-25"
                />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks From To
                </label>
                <input
                  type="text"
                  name="remarksFromTo"
                  value={formData.remarksFromTo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Apr 2024 - Mar 2025"
                />
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

            {/* Auto-calculation notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <strong>Auto-calculations:</strong> Number of Days = (End Date - Start Date + 1), Amount Per Day = Invoice Amount ÷ Number of Days
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

        {/* Data Table */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse border border-gray-300"
              style={{ minWidth: "2500px" }}
            >
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-16">RP#</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-16">GL#</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">Month</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-32">Vendor</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-32">Remarks</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">NS Doc ID</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-32">Invoice No/Date</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-24">Invoice Amount</th>
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-24">Remarks From To</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">Start Date</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">End Date</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-16">No of Days</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-16">CL Bal</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-16">Mar'24</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">Amt Per Day</th>
                  <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">Opening Balance</th>
                  
                  {/* Monthly columns */}
                  {availableMonths.map((month) => (
                    <th
                      key={month}
                      className="border border-gray-300 px-2 py-2 text-center text-xs font-medium text-gray-700 uppercase w-20"
                    >
                      {month.toUpperCase()}
                    </th>
                  ))}
                  
                  <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-xs">{row.rpNumber}</td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">{row.glNumber}</td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">{row.month}</td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">{row.vendor}</td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">{row.remarks}</td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">{row.nsDocumentId}</td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">{row.invoiceNoDate}</td>
                    <td className="border border-gray-300 px-3 py-2 text-xs text-right">{formatCurrency(row.invoiceAmount)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-xs">{row.remarksFromTo}</td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">{row.startDate}</td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">{row.endDate}</td>
                    <td className="border border-gray-300 px-2 py-2 text-xs text-center">{row.numberOfDays}</td>
                    <td className="border border-gray-300 px-2 py-2 text-xs">{row.clBal}</td>
                    <td className="border border-gray-300 px-2 py-2 text-xs text-right">{formatCurrency(row.mar24)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-xs text-right">{formatCurrency(row.amtPerDay)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-xs text-right">{formatCurrency(row.openingBalance)}</td>
                    
                    {/* Monthly amortization columns */}
                    {availableMonths.map((month) => (
                      <td
                        key={month}
                        className="border border-gray-300 px-2 py-2 text-xs text-right"
                      >
                        {row.monthlyData?.[month] ? formatCurrency(row.monthlyData[month]) : "-"}
                      </td>
                    ))}
                    
                    <td className="border border-gray-300 px-3 py-2 text-xs">
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
        </div>
      </div>
    </div>
  );
};

export default PrepaidTable;