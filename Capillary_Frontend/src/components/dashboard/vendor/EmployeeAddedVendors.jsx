import {
  Search,
  Download,
  Filter,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import Pagination from "./Pagination";
import {
  addNewVendorsExcel,
  deleteVendor,
  getVendorList,
} from "../../../api/service/adminServices";

const EmployeeAddedVendors = () => {
  const empId = localStorage.getItem("capEmpId");
  const navigate = useNavigate();
  const [personalData, setPersonalData] = useState([]);
  const [vendorPolicy, setVendorPolicy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showImportModal, setShowImportModal] = useState(false);
  const [newVendors, setNewVendors] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchVendorData();
  }, [empId]);

  const fetchVendorData = async () => {
    setIsLoading(true);
    try {
      const response = await getVendorList(empId);
      console.log(response);
      setPersonalData(response.data.vendors || []);
      if (response.data.vendorPolicyFiles?.length > 0) {
        setVendorPolicy(response.data.vendorPolicyFiles[0]);
      }
    } catch (err) {
      toast.error("Error fetching vendor data");
      console.error("Error in fetching the vendor data", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Validate imported vendor data
  const validateVendorData = (vendors) => {
    const errors = [];
    const requiredFields = [
      { key: 'Name', label: 'Company Name' },
      { key: 'Entity', label: 'Entity' },
      { key: 'Category', label: 'Category' },
      { key: 'Email', label: 'Email' },
      { key: 'Phone', label: 'Phone Number' },
      { key: 'Billing Address', label: 'Address' },
      { key: 'Tax Number', label: 'PAN/Tax Registration' },
      { key: 'Bank Account Number', label: 'Bank Account Number' },
      { key: 'IFSC/SWIFT Code', label: 'IFSC/SWIFT CODE' },
      { key: 'Bank Name', label: 'Bank Name' },
      { key: 'Has Agreement', label: 'Has Agreement (yes/no)' },
      { key: 'Nature of Service', label: 'Nature of Service' }
    ];

    vendors.forEach((vendor, index) => {
      const rowNum = index + 2; // +2 because Excel is 1-indexed and has header row

      // Check required fields
      requiredFields.forEach(field => {
        if (!vendor[field.key] || String(vendor[field.key]).trim() === '') {
          errors.push(`Row ${rowNum}: Missing ${field.label}`);
        }
      });

      // Validate email format
      if (vendor.Email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(vendor.Email).trim())) {
          errors.push(`Row ${rowNum}: Invalid email format`);
        }
      }

      // Validate phone number (basic validation)
      if (vendor.Phone) {
        const phoneStr = String(vendor.Phone).replace(/\D/g, '');
        if (phoneStr.length < 10) {
          errors.push(`Row ${rowNum}: Invalid phone number (minimum 10 digits)`);
        }
      }

      // Validate Has Agreement field
      if (vendor['Has Agreement']) {
        const hasAgreement = String(vendor['Has Agreement']).toLowerCase().trim();
        if (hasAgreement !== 'yes' && hasAgreement !== 'no') {
          errors.push(`Row ${rowNum}: Has Agreement must be "yes" or "no"`);
        }

        // If no agreement, questionnaire answer is required
        if (hasAgreement === 'no' && (!vendor['Questionnaire Answer'] || String(vendor['Questionnaire Answer']).trim() === '')) {
          errors.push(`Row ${rowNum}: Questionnaire Answer is required when Has Agreement is "no"`);
        }
      }

      // Validate Bank Account Number (should be numeric)
      if (vendor['Bank Account Number']) {
        const bankAccStr = String(vendor['Bank Account Number']).replace(/\D/g, '');
        if (bankAccStr.length < 9) {
          errors.push(`Row ${rowNum}: Invalid Bank Account Number (minimum 9 digits)`);
        }
      }
    });

    return errors;
  };

  // Download sample template
  const downloadSampleTemplate = () => {
    const templateHeaders = [
      "ID",
      "Name",
      "Entity",
      "Category",
      "Email",
      "Phone",
      "Billing Address",
      "Shipping Address",
      "Tax Number",
      "GSTIN",
      "MSME",
      "Bank Account Number",
      "IFSC/SWIFT Code",
      "Bank Name",
      "Has Agreement",
      "Agreement File",
      "Questionnaire Answer",
      "Nature of Service",
      "Primary Subsidiary"
    ];

    const sampleData = [
      {
        "ID": "V001",
        "Name": "Sample Vendor Ltd",
        "Entity": "ABC Corporation Pvt. Ltd.",
        "Category": "Supplier",
        "Email": "vendor@example.com",
        "Phone": "9876543210",
        "Billing Address": "123 Main Street, City, State - 123456",
        "Shipping Address": "456 Warehouse Road, City, State - 123456",
        "Tax Number": "ABCDE1234F",
        "GSTIN": "22ABCDE1234F1Z5",
        "MSME": "MSME123456",
        "Bank Account Number": "1234567890123456",
        "IFSC/SWIFT Code": "ABCD0123456",
        "Bank Name": "Sample Bank",
        "Has Agreement": "yes",
        "Agreement File": "(Upload separately after vendor creation)",
        "Questionnaire Answer": "",
        "Nature of Service": "Product Supply",
        "Primary Subsidiary": "Main Office"
      },
      {
        "ID": "V002",
        "Name": "Example Services Inc",
        "Entity": "XYZ Services Corp",
        "Category": "Service Provider",
        "Email": "contact@exampleservices.com",
        "Phone": "9123456789",
        "Billing Address": "789 Business Park, City, State - 654321",
        "Shipping Address": "789 Business Park, City, State - 654321",
        "Tax Number": "FGHIJ5678K",
        "GSTIN": "27FGHIJ5678K1Z8",
        "MSME": "MSME789012",
        "Bank Account Number": "9876543210987654",
        "IFSC/SWIFT Code": "EFGH0987654",
        "Bank Name": "Example Bank",
        "Has Agreement": "no",
        "Agreement File": "",
        "Questionnaire Answer": "We provide consulting services with 5+ years experience. Recurring monthly service with auto-renewal contract.",
        "Nature of Service": "Consulting",
        "Primary Subsidiary": "Branch Office"
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    const colWidths = [
      { wch: 10 },  // ID
      { wch: 25 },  // Name
      { wch: 25 },  // Entity
      { wch: 15 },  // Category
      { wch: 25 },  // Email
      { wch: 15 },  // Phone
      { wch: 40 },  // Billing Address
      { wch: 40 },  // Shipping Address
      { wch: 15 },  // Tax Number
      { wch: 18 },  // GSTIN
      { wch: 15 },  // MSME
      { wch: 20 },  // Bank Account Number
      { wch: 18 },  // IFSC/SWIFT Code
      { wch: 20 },  // Bank Name
      { wch: 15 },  // Has Agreement
      { wch: 45 },  // Agreement File
      { wch: 50 },  // Questionnaire Answer
      { wch: 20 },  // Nature of Service
      { wch: 20 },  // Primary Subsidiary
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Vendor Template");
    XLSX.writeFile(wb, "Vendor_Upload_Template.xlsx");
    toast.success("Sample template downloaded successfully!");
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
          toast.error("The uploaded file is empty. Please add vendor data.");
          return;
        }

        console.log("Imported data:", data);

        // Validate data
        const errors = validateVendorData(data);

        if (errors.length > 0) {
          setValidationErrors(errors);
          toast.error(`Found ${errors.length} validation error(s). Please check the details.`);
          setNewVendors(data); // Still show the data so user can see what was imported
        } else {
          setValidationErrors([]);
          setNewVendors(data);
          toast.success(`${data.length} vendor(s) validated successfully! Click "Upload File" to proceed.`);
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Import Error:", error);
        toast.error(`Error importing file: ${error.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadVendorData = async () => {
    if (newVendors.length === 0) {
      toast.error("No vendors to upload. Please import a file first.");
      return;
    }

    if (validationErrors.length > 0) {
      toast.error("Please fix all validation errors before uploading.");
      return;
    }

    try {
      setIsUploading(true);

      // Transform data to match backend schema
      const vendorsToUpload = newVendors.map(vendor => {
        const hasAgreement = String(vendor['Has Agreement'] || 'yes').toLowerCase().trim();

        return {
          vendorId: vendor.ID || '',
          vendorName: vendor.Name,
          entity: vendor.Entity,
          category: vendor.Category,
          email: vendor.Email,
          phone: String(vendor.Phone),
          billingAddress: vendor['Billing Address'],
          shippingAddress: vendor['Shipping Address'] || vendor['Billing Address'],
          taxNumber: vendor['Tax Number'],
          gstin: vendor.GSTIN || '',
          msme: vendor.MSME || '',
          bankAccountNumber: String(vendor['Bank Account Number']),
          ifscSwiftCode: vendor['IFSC/SWIFT Code'],
          bankName: vendor['Bank Name'],
          hasAgreement: hasAgreement,
          natureOfService: vendor['Nature of Service'],
          primarySubsidiary: vendor['Primary Subsidiary'] || '',
          empId: empId,
          // Add questionnaire data if no agreement
          ...(hasAgreement === 'no' && {
            questionnaireAnswer: vendor['Questionnaire Answer'] || '',
            isDeviation: true
          })
        };
      });

      console.log("Uploading vendors:", vendorsToUpload);

      const response = await addNewVendorsExcel(vendorsToUpload, empId);

      if (response.status === 201) {
        toast.success(`${vendorsToUpload.length} vendor(s) uploaded successfully!`);

        // Refresh vendor list
        await fetchVendorData();

        // Reset state
        setNewVendors([]);
        setValidationErrors([]);
        setShowImportModal(false);
      } else {
        toast.error(response.data.message || "Failed to upload vendors");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(error.response?.data?.message || "Error uploading vendors. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredData = useMemo(() => {
    return personalData?.filter((person) => {
      const searchableFields = ['vendorName', 'Name', 'email', 'phone', 'vendorId', 'ID', 'taxNumber', 'Tax Number'];

      const matchesSearch = searchTerm.trim() === '' || searchableFields.some(field => {
        const value = person[field];
        return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });

      const matchesFilter =
        filterStatus === "all"
          ? true
          : filterStatus === "active"
            ? person.Inactive?.toLowerCase() === "no"
            : person.Inactive?.toLowerCase() === "yes";

      return matchesSearch && matchesFilter;
    });
  }, [personalData, searchTerm, filterStatus]);

  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData?.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) {
      return;
    }

    try {
      const response = await deleteVendor(id);
      if (response.status === 200) {
        setPersonalData(personalData?.filter((person) => person?._id !== id));
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Error deleting vendor");
    }
  };

  const toggleRow = (id, e) => {
    e.stopPropagation();
    setExpandedRow(expandedRow === id ? null : id);
  };

  const ImportModal = () => {
    if (!showImportModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Import Vendors</h3>
            <button
              onClick={() => {
                setShowImportModal(false);
                setNewVendors([]);
                setValidationErrors([]);
              }}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Required Format Section */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Required Excel Format
            </h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p className="font-medium">Your Excel file must include these columns:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>Name</strong> - Company Name (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>Entity</strong> - Entity Type (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>Category</strong> - Vendor Category (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>Email</strong> - Email Address (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>Phone</strong> - Phone Number (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>Billing Address</strong> - Address (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>Tax Number</strong> - PAN/Tax/W9 (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>GSTIN</strong> - GST Number (Optional)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>MSME</strong> - MSME Number (Optional)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>Bank Account Number</strong> (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>IFSC/SWIFT Code</strong> (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>Bank Name</strong> (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>Has Agreement</strong> - yes/no (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2 text-red-500">•</span>
                  <span><strong>Nature of Service</strong> (Required)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>ID</strong> - Vendor ID (Optional)</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-300">
                <p className="text-xs text-blue-700">
                  <strong>Important Notes:</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1 ml-4">
                  <li>• Fields marked with <span className="text-red-500">red</span> are mandatory</li>
                  <li>• Agreement files and document uploads must be done separately after vendor creation</li>
                  <li>• If &quot;Has Agreement&quot; is &quot;no&quot;, fill the &quot;Questionnaire Answer&quot; column</li>
                  <li>• Email must be in valid format (e.g., name@company.com)</li>
                  <li>• Phone number must be at least 10 digits</li>
                  <li>• Bank Account Number must be at least 9 digits</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Template Button */}
          <div className="mb-4">
            <button
              onClick={downloadSampleTemplate}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Sample Template
            </button>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Your Excel File
              </label>
              <input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv"
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
              />
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: .xlsx, .xls, .csv (Max size: 5MB)
              </p>

              {newVendors.length > 0 && (
                <div className={`mt-3 p-3 border rounded ${validationErrors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <p className={`text-sm font-medium ${validationErrors.length > 0 ? 'text-red-700' : 'text-green-700'}`}>
                    {validationErrors.length > 0 ? (
                      <span>⚠ {newVendors.length} vendor(s) imported with {validationErrors.length} error(s)</span>
                    ) : (
                      <span>✓ {newVendors.length} vendor(s) ready to upload</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Validation Errors Display */}
            {validationErrors.length > 0 && (
              <div className="max-h-48 overflow-y-auto bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  Validation Errors ({validationErrors.length})
                </h4>
                <ul className="text-xs text-red-700 space-y-1">
                  {validationErrors.slice(0, 10).map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                  {validationErrors.length > 10 && (
                    <li className="text-red-800 font-medium mt-2">
                      ... and {validationErrors.length - 10} more error(s)
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setNewVendors([]);
                  setValidationErrors([]);
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 order-2 sm:order-1"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={uploadVendorData}
                disabled={newVendors.length === 0 || validationErrors.length > 0 || isUploading}
                className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg order-1 sm:order-2 transition-colors flex items-center justify-center
                  ${newVendors.length > 0 && validationErrors.length === 0 && !isUploading
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  "Upload File"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-white rounded-lg shadow-sm h-full">
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
          My Added Vendors
        </h2>

        {/* Controls for smaller screens */}
        <div className="md:hidden space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
              onClick={() => navigate("/vendor-list-table/my-vendor-registration")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </button>
            {vendorPolicy && (
              <a
                href={vendorPolicy.policyFile}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2.5 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                <FileText className="h-4 w-4 mr-2" />
                Policy
              </a>
            )}
          </div>

          <div className="flex gap-2 w-full">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
          </div>
        </div>

        {/* Controls for medium and larger screens */}
        <div className="hidden md:block">
          <div className="flex flex-wrap md:flex-nowrap gap-3 mb-4 justify-between">
            <div className="relative w-full md:w-96 lg:w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              {vendorPolicy && (
                <a
                  href={vendorPolicy.policyFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2.5 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Policy
                </a>
              )}
              <button
                className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                onClick={() => navigate("/vendor-list-table/my-vendor-registration")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      </div >

      {/* Loading State */}
      {
        isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredData?.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg font-medium">No vendors found</p>
            <p className="text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 mb-4">
              {currentData?.map((person, index) => (
                <div
                  key={person._id}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs text-gray-500">
                        {person?.vendorId || person.ID}
                      </span>
                      <h3 className="font-semibold text-gray-900">
                        {person?.vendorName || person.Name}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-primary hover:text-primary/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/vendor-list-table/edit-vendor/${person._id}`
                          );
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(person?._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={(e) => toggleRow(person._id, e)}
                        aria-expanded={expandedRow === person._id}
                      >
                        {expandedRow === person._id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-900 mb-1">
                    Tax ID: {person?.taxNumber || person["Tax Number"]}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Phone: {person?.phone}
                  </div>

                  {expandedRow === person._id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                      <div className="mb-1">
                        <span className="font-medium">Address:</span>{" "}
                        {person?.shippingAddress || person["Shipping Address"]}
                      </div>
                      <div className="mb-1">
                        <span className="font-medium">Status:</span>{" "}
                        {person?.Inactive?.toLowerCase() === "no"
                          ? "Active"
                          : "Inactive"}
                      </div>
                    </div>
                  )}

                  <button
                    className="w-full mt-3 text-sm text-primary hover:text-primary/80 text-center"
                    onClick={() =>
                      navigate(`/vendor-list-table/get-vendor/${person._id}`)
                    }
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-primary">
                    <tr>
                      <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Sno
                      </th>
                      <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Address
                      </th>
                      <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData?.map((person, index) => (
                      <tr
                        key={person._id}
                        onClick={() =>
                          navigate(`/vendor-list-table/get-vendor/${person._id}`)
                        }
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="space-y-1">
                            <span className="block text-sm text-gray-500">
                              {person?.vendorId || person.ID}
                            </span>
                            <span className="block font-semibold text-gray-900">
                              {person?.vendorName || person.Name}
                            </span>
                            <span className="block text-sm text-gray-900">
                              Tax ID: {person?.taxNumber || person["Tax Number"]}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {person?.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs lg:max-w-md break-words whitespace-normal">
                          {person?.shippingAddress || person["Shipping Address"]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-4">
                            <button
                              className="text-primary hover:text-primary/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/vendor-list-table/edit-vendor/${person._id}`
                                );
                              }}
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(person?._id);
                              }}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      }

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData?.length || 0}
      />

      <ImportModal />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss
      />
    </div >
  );
};

export default EmployeeAddedVendors;