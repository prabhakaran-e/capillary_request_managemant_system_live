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
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import Pagination from "./Pagination";
import {
  addNewVendorsExcel,
  deleteVendor,
  getVendorList,
  fetchAllVendorData
} from "../../../api/service/adminServices";

const VendorListTable = () => {
  const navigate = useNavigate();
  const [personalData, setPersonalData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showImportModal, setShowImportModal] = useState(false);
  const [newVendors, setNewVendors] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const fileInputRef = useRef(null);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      setIsLoading(true);
      try {
        const response = await fetchAllVendorData();
        setPersonalData(response.data);
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

    return matchesSearch && matchesFilter;
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
        setPersonalData(updatedVendorList.data);

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
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-medium">Import Vendors</h3>
            <button
              onClick={() => setShowImportModal(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv"
                className="w-full text-sm"
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Supported formats: .xlsx, .xls, .csv
              </p>
              {newVendors.length > 0 && (
                <p className="text-xs sm:text-sm text-green-600 mt-2">
                  {newVendors.length} vendors ready to upload
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={uploadVendorData}
                disabled={newVendors.length === 0}
                className={`w-full sm:w-auto px-4 py-2 text-sm font-medium text-white rounded-lg order-1 sm:order-2
            ${
              newVendors.length > 0
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
      )}

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
    </div>
  );
};

export default VendorListTable;
