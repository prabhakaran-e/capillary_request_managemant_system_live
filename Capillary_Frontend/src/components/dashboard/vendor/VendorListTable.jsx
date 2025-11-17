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
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import Pagination from "./Pagination";
import {
  addNewVendorsExcel,
  deleteVendor,
  getVendorList,
  fetchAllVendorData,
  getVendorManagementCount,
  teamVerifiedTheVendorData,
  teamRejectTheVendorData
} from "../../../api/service/adminServices";

const VendorListTable = () => {
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
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "all"
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'approve' | 'reject', vendorId: string, vendorName: string }
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    const fetchVendor = async () => {
      setIsLoading(true);
      try {
        const response = await fetchAllVendorData();
        console.log("response", response);
        setPersonalData(response.data.vendors || []);
        // Set vendor policy if available in response
        if (response.data.vendorPolicyFiles && response.data.vendorPolicyFiles.length > 0) {
          setVendorPolicy(response.data.vendorPolicyFiles[0]);
        }
      } catch (err) {
        toast.error("Error fetching vendor data");
        console.error("Error in fetching the vendor data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendor();
  }, []);

  const filteredData = personalData?.filter((person) => {
    const matchesSearch = Object.values(person).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesFilter =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? person.Inactive?.toLowerCase() === "no"
          : person.Inactive?.toLowerCase() === "yes";

    // Filter based on active tab
    const matchesTab = activeTab === "all"
      ? true
      : activeTab === "pending"
        ? person.isLegalTeamVerified === true && person.isVendorTeamVerified === false
        : true;

    return matchesSearch && matchesFilter && matchesTab;
  });

  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData?.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (id) => {
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

  const handleApprove = async (id) => {
    const vendor = personalData?.find(p => p._id === id);
    setConfirmAction({ type: 'approve', vendorId: id, vendorName: vendor?.vendorName || vendor?.Name });
  };

  const handleReject = async (id) => {
    const vendor = personalData?.find(p => p._id === id);
    setConfirmAction({ type: 'reject', vendorId: id, vendorName: vendor?.vendorName || vendor?.Name });
  };

  const confirmApprove = async () => {
    try {
      // API call to approve vendor
      const response = await teamVerifiedTheVendorData(confirmAction.vendorId, empId);



      if (response.status === 200) {
        // Update local state to reflect approval
        setPersonalData(personalData?.map(person =>
          person._id === confirmAction.vendorId
            ? { ...person, isVendorTeamVerified: true }
            : person
        ));
        toast.success(response.data.message);
      } else {
        toast.error("Failed to approve vendor");
      }
    } catch (error) {
      toast.error("Error approving vendor");
    } finally {
      setConfirmAction(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      // API call to reject vendor with reason
      const response = await teamRejectTheVendorData(confirmAction.vendorId, empId, rejectReason);



      if (response.status === 200) {
        // Update local state to reflect rejection
        setPersonalData(personalData?.map(person =>
          person._id === confirmAction.vendorId
            ? { ...person, isVendorTeamVerified: false, isLegalTeamVerified: false }
            : person
        ));
        toast.success("Vendor rejected successfully");
      } else {
        toast.error("Failed to reject vendor");
      }
    } catch (error) {
      toast.error("Error rejecting vendor");
    } finally {
      setConfirmAction(null);
      setRejectReason("");
    }
  };

  const cancelAction = () => {
    setConfirmAction(null);
    setRejectReason("");
  };

  const handleRejectReasonChange = useCallback((e) => {
    setRejectReason(e.target.value);
  }, []);

  useEffect(() => {
    if (confirmAction && confirmAction.type === 'reject' && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
    }
  }, [confirmAction]);

  const downloadSampleTemplate = () => {
    // Define the required columns for the Excel template
    const templateHeaders = [
      "ID",
      "Name",
      "Primary Subsidiary",
      "Category",
      "Entity",
      "Tax Number",
      "GSTIN",
      "Billing Address",
      "Shipping Address",
      "Phone",
      "Email",
      "Status",
      "Bank Account Number",
      "IFSC/SWIFT Code",
      "Bank Name",
      "Has Agreement",
      "Agreement File",
      "Questionnaire Answer",
      "Nature of Service",
      "MSME"
    ];

    // Create sample data rows with examples and instructions
    const sampleData = [
      {
        "ID": "V001",
        "Name": "Sample Vendor Ltd",
        "Primary Subsidiary": "Main Office",
        "Category": "Supplier",
        "Entity": "Private Limited",
        "Tax Number": "ABCDE1234F",
        "GSTIN": "22ABCDE1234F1Z5",
        "Billing Address": "123 Main Street, City, State - 123456",
        "Shipping Address": "456 Warehouse Road, City, State - 123456",
        "Phone": "9876543210",
        "Email": "vendor@example.com",
        "Status": "Active",
        "Bank Account Number": "1234567890",
        "IFSC/SWIFT Code": "ABCD0123456",
        "Bank Name": "Sample Bank",
        "Has Agreement": "yes",
        "Agreement File": "(File upload handled separately after vendor creation)",
        "Questionnaire Answer": "(Fill only if Has Agreement = no)",
        "Nature of Service": "Product Supply",
        "MSME": "MSME123456"
      },
      {
        "ID": "V002",
        "Name": "Example Services Inc",
        "Primary Subsidiary": "Branch Office",
        "Category": "Service Provider",
        "Entity": "Corporation",
        "Tax Number": "FGHIJ5678K",
        "GSTIN": "27FGHIJ5678K1Z8",
        "Billing Address": "789 Business Park, City, State - 654321",
        "Shipping Address": "789 Business Park, City, State - 654321",
        "Phone": "9123456789",
        "Email": "contact@exampleservices.com",
        "Status": "Active",
        "Bank Account Number": "9876543210",
        "IFSC/SWIFT Code": "EFGH0987654",
        "Bank Name": "Example Bank",
        "Has Agreement": "no",
        "Agreement File": "",
        "Questionnaire Answer": "We provide consulting services and have been in business for 5 years",
        "Nature of Service": "Consulting",
        "MSME": "MSME789012"
      }
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths for better readability
    const colWidths = [
      { wch: 10 },  // ID
      { wch: 25 },  // Name
      { wch: 20 },  // Primary Subsidiary
      { wch: 15 },  // Category
      { wch: 15 },  // Entity
      { wch: 15 },  // Tax Number
      { wch: 18 },  // GSTIN
      { wch: 40 },  // Billing Address
      { wch: 40 },  // Shipping Address
      { wch: 15 },  // Phone
      { wch: 25 },  // Email
      { wch: 12 },  // Status
      { wch: 20 },  // Bank Account Number
      { wch: 18 },  // IFSC/SWIFT Code
      { wch: 20 },  // Bank Name
      { wch: 15 },  // Has Agreement
      { wch: 45 },  // Agreement File
      { wch: 45 },  // Questionnaire Answer
      { wch: 20 },  // Nature of Service
      { wch: 15 },  // MSME
    ];
    ws['!cols'] = colWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Vendor Template");

    // Generate and download the file
    XLSX.writeFile(wb, "Vendor_Upload_Template.xlsx");

    toast.success("Sample template downloaded successfully!");
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);

          console.log("Imported data:", data);
          setNewVendors(data);

          toast.info('File imported. Click "Upload File" to proceed.');

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (error) {
          console.error("Complete Import Error:", error);
          toast.error(`Error importing file: ${error.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const uploadVendorData = async () => {
    try {
      if (newVendors.length === 0) {
        toast.error("No vendors to upload. Please import a file first.");
        return;
      }

      const response = await addNewVendorsExcel(newVendors);

      if (response.status === 201) {
        toast.success("Vendors uploaded successfully");

        const updatedVendorList = await getVendorList();
        setPersonalData(updatedVendorList.data.data || []);

        setNewVendors([]);
        setShowImportModal(false);
      } else {
        toast.error(response.data.message || "Failed to upload vendors");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Error uploading vendors");
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
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Import Vendors</h3>
            <button
              onClick={() => setShowImportModal(false)}
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
                  <span className="mr-2">•</span>
                  <span><strong>ID</strong> - Vendor ID</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Name</strong> - Company Name</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Entity</strong> - Entity Type</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Category</strong> - Vendor Category</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Email</strong> - Email Address</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Phone</strong> - Phone Number</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Billing Address</strong> - Address</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Tax Number</strong> - PAN/Tax/W9</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>GSTIN</strong> - GST Number</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>MSME</strong> - MSME Number</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Bank Account Number</strong></span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>IFSC/SWIFT Code</strong></span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Bank Name</strong></span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Has Agreement</strong> (yes/no)</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Nature of Service</strong></span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-300">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Agreement files must be uploaded separately after vendor creation.
                  If "Has Agreement" is "no", fill the "Questionnaire Answer" column.
                </p>
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
                Supported formats: .xlsx, .xls, .csv
              </p>
              {newVendors.length > 0 && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ {newVendors.length} vendor{newVendors.length > 1 ? 's' : ''} ready to upload
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setNewVendors([]);
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={uploadVendorData}
                disabled={newVendors.length === 0}
                className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg order-1 sm:order-2 transition-colors
            ${newVendors.length > 0
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-gray-400 cursor-not-allowed"
                  }`}
              >
                Upload File
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
          Vendor Information
        </h2>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "pending"
              ? "bg-primary text-white border-b-2 border-primary"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Approvals
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "all"
              ? "bg-primary text-white border-b-2 border-primary"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            onClick={() => setActiveTab("all")}
          >
            All Vendors
          </button>
        </div>

        {/* Controls for smaller screens */}
        <div className="md:hidden space-y-3">
          <button
            className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            onClick={() => navigate("/vendor-list-table/vendor-registration")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </button>

          <div className="relative w-full">
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
          <div className="flex flex-wrap md:flex-nowrap gap-3 mb-4">

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
            <button
              className="inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
              onClick={() => navigate("/vendor-list-table/vendor-registration")}
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
                View Vendor Policy
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
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
                    {activeTab === "pending" && (
                      <>
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(person?._id);
                          }}
                          title="Approve Vendor"
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(person?._id);
                          }}
                          title="Reject Vendor"
                        >
                          Reject
                        </button>
                      </>
                    )}
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
                          {activeTab === "pending" && (
                            <>
                              <button
                                className="px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(person?._id);
                                }}
                                title="Approve Vendor"
                              >
                                Approve
                              </button>
                              <button
                                className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(person?._id);
                                }}
                                title="Reject Vendor"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData?.length || 0}
      />

      <ImportModal />

      {/* Confirmation Modal for Approve/Reject */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {confirmAction.type === 'approve' ? 'Approve Vendor' : 'Reject Vendor'}
            </h3>

            <p className="text-gray-600 mb-6">
              {confirmAction.type === 'approve'
                ? `Are you sure you want to approve ${confirmAction.vendorName}?`
                : `Are you sure you want to reject ${confirmAction.vendorName}?`
              }
            </p>

            {confirmAction.type === 'reject' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  ref={textareaRef}
                  value={rejectReason}
                  onChange={handleRejectReasonChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelAction}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction.type === 'approve' ? confirmApprove : confirmReject}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${confirmAction.type === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {confirmAction.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

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
};

export default VendorListTable;