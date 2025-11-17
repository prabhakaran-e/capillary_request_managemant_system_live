import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import {
  Edit,
  Trash2,
  Search,
  Download,
  Plus,
  Filter,
  X,
  Copy,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  deleteReq,
  getAllCurrencyData,
  getApprovedReq,
  getPoPolicyLink,
} from "../../../api/service/adminServices";
import Pagination from "../requestlist/Pagination";
import LoadingSpinner from "../../spinner/LoadingSpinner";
import { exportAllRequestsToExcel } from "../../../utils/reqExportExel";
import TableContent from "./TableContent";

const Approvals = () => {
  const userId = localStorage.getItem("capEmpId");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");
  const navigate = useNavigate();
  const multiRole = localStorage.getItem("multiRole");

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [poPolicy, setPoPolicy] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const [reqId, setReqId] = useState(null);
  const [isShowModal, setIsShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("pending");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [showDepartmentOptions, setShowDepartmentOptions] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [copiedReqId, setCopiedReqId] = useState(null);

  const [dateFilters, setDateFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  const itemsPerPage = 20;
  const statusesWithDepartments = ["Pending", "Rejected", "Hold"];

  // Function to extract unique departments from data based on status
  const getAvailableDepartmentsForStatus = (status, data) => {
    if (!statusesWithDepartments.includes(status)) {
      return [];
    }

    const filteredData = data.filter((item) => item.status === status);
    const departments = filteredData
      .map((item) => item.nextDepartment)
      .filter((dept) => dept && dept.trim() !== "") // Filter out null, undefined, or empty strings
      .filter((dept, index, arr) => arr.indexOf(dept) === index) // Remove duplicates
      .sort(); // Sort alphabetically

    return departments;
  };

  // Update available departments when status changes or data changes
  useEffect(() => {
    if (statusFilter && statusesWithDepartments.includes(statusFilter)) {
      const departments = getAvailableDepartmentsForStatus(statusFilter, users);
      setAvailableDepartments(departments);

      // If current department filter is not available in new list, clear it
      if (departmentFilter && !departments.includes(departmentFilter)) {
        setDepartmentFilter("");
      }
    } else {
      setAvailableDepartments([]);
    }
  }, [statusFilter, users, departmentFilter]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getAllCurrencyData();
      if (response.status === 200) {
        setCurrencies(response.data.data);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getPoPolicyLink();
      if (response.status === 200) {
        setPoPolicy(response.data.data);
      }
    };
    fetchData();
  }, []);

  const fetchRequests = async (showPendingOnly = true) => {
    setIsLoading(true);

    try {
      const response = await getApprovedReq(userId, "Pending");
      console.log("response", response);
      if (response.status === 200) {
        const allRequests = response.data.reqData;

        if (showPendingOnly) {
          const pendingRequests = allRequests.filter((req) => {
            const approvals = req.approvals;
            const lastLevelApproval = approvals[approvals.length - 1];
            console.log("lastLevelApproval", lastLevelApproval);
            const isRed = req.approvalStatus?.color === "red";
            const isApproved =
              (req.firstLevelApproval.hodEmail === email &&
                req.firstLevelApproval.approved === false) ||
              lastLevelApproval.nextDepartment === role ||
              (lastLevelApproval.approvalId === userId &&
                lastLevelApproval.status != "Approved");

            console.log(`Request ID: ${req.reqid || "N/A"}`, {
              isRed,
              isApproved,
            });

            return isRed && isApproved;
          });

          setFilteredUsers(pendingRequests);
          setUsers(pendingRequests);
        } else {
          const response = await getApprovedReq(userId, "All");
          setFilteredUsers(allRequests);
          setUsers(allRequests);
        }
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    fetchRequests(viewMode === "pending");
  }, [userId, role]);

  useEffect(() => {
    const filterUsers = () => {
      let baseUsers = users;
      if (viewMode === "pending") {
        baseUsers = users.filter(
          (user) => user.approvalStatus && user.approvalStatus.color === "red"
        );
      }

      const filtered = baseUsers.filter((user) => {
        const searchString = searchTerm.toLowerCase();
        const reqIdMatch = user.reqid?.toLowerCase().includes(searchString);
        const nameMatch = user.userName?.toLowerCase().includes(searchString);
        const employeeMatch = user.commercials?.department
          ?.toLowerCase()
          .includes(searchString);
        const nextDeptMatch = user.nextDepartment
          ?.toLowerCase()
          .includes(searchString);

        // Status filter logic
        const statusMatch =
          !statusFilter ||
          (statusFilter === "Draft" && !user.isCompleted) ||
          (statusFilter && user.status === statusFilter);

        // Department filter logic (only applies for specific statuses)
        const departmentMatch =
          !departmentFilter ||
          !statusesWithDepartments.includes(statusFilter) ||
          user.nextDepartment === departmentFilter;

        console.log(`Filtering ${user.reqid}:`, {
          statusFilter,
          departmentFilter,
          userStatus: user.status,
          userNextDept: user.nextDepartment,
          statusMatch,
          departmentMatch,
        });

        return (
          (reqIdMatch || nameMatch || employeeMatch || nextDeptMatch) &&
          statusMatch &&
          departmentMatch
        );
      });

      const filteredByDate = filtered.filter((user) => {
        if (!dateFilters.fromDate && !dateFilters.toDate) return true;

        const userDate = new Date(user.createdAt);
        const fromDate = dateFilters.fromDate
          ? new Date(dateFilters.fromDate)
          : null;
        const toDate = dateFilters.toDate ? new Date(dateFilters.toDate) : null;

        if (fromDate && toDate) {
          return userDate >= fromDate && userDate <= toDate;
        } else if (fromDate) {
          return userDate >= fromDate;
        } else if (toDate) {
          return userDate <= toDate;
        }
        return true;
      });

      console.log(`Final filtered results: ${filteredByDate.length} records`);
      setFilteredUsers(filteredByDate);
    };

    filterUsers();
  }, [
    searchTerm,
    users,
    dateFilters,
    viewMode,
    statusFilter,
    departmentFilter,
  ]);

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setDateFilters({ fromDate: "", toDate: "" });
    setStatusFilter("");
    setDepartmentFilter("");
    setAvailableDepartments([]);
    setShowDepartmentOptions(false);
    setShowFilters(false);
  };

  // Handler for status filter change
  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);

    // Clear department filter when status changes
    setDepartmentFilter("");

    // Show department options for statuses that support it
    setShowDepartmentOptions(statusesWithDepartments.includes(newStatus));
  };

  // Handler for department filter change
  const handleDepartmentFilterChange = (e) => {
    setDepartmentFilter(e.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
    // Clear filters when changing view mode
    clearFilters();
    fetchRequests(mode === "pending");
  };

  // Copy ReqID functionality
  const handleCopyReqId = async (reqId, e) => {
    e.stopPropagation(); // Prevent row click navigation
    try {
      await navigator.clipboard.writeText(reqId);
      setCopiedReqId(reqId);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedReqId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = reqId;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedReqId(reqId);
        setTimeout(() => {
          setCopiedReqId(null);
        }, 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed: ", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Open in new tab functionality
  const handleOpenInNewTab = (id, e) => {
    e.stopPropagation(); // Prevent row click navigation
    const url = `/approval-request-list/preview-one-req/${id}`;
    window.open(url, "_blank");
  };

  const formatCurrency = (value, currencyCode) => {
    if (!value) return "N/A";
    const currency = currencies.find((c) => c.code === currencyCode);
    if (!currency) return value;

    try {
      return new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      console.error("Currency formatting error:", error);
      return value;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = async (e, userId) => {
    e.stopPropagation();
    navigate(`/req-list-table/edit-req/${userId}`);
  };

  const handleDelete = async (id) => {
    try {
      const response = await deleteReq(id);
      if (response.status === 200) {
        setUsers(users.filter((user) => user._id !== id));
        setIsDelete(false);
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedUsers([]);
    }
  };

  const getStatusBackgroundColor = (color) => {
    switch (color) {
      case "red":
        return "bg-red-200";
      default:
        return "bg-white";
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const renderActionColumn = (user) => {
    if (user.status === "Approved") {
      return (
        <td className="text-sm text-gray-500 text-center md:px-6 md:py-4 px-2 py-2">
          <span className="text-xs text-gray-400">No actions</span>
        </td>
      );
    }

    if (!user.isCompleted) {
      return (
        <td className="px-2 py-2 md:px-6 md:py-4 text-sm text-gray-500">
          <div className="flex justify-center items-center space-x-2">
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={(e) => handleEdit(e, user._id)}
            >
              <Edit className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                setReqId(user._id);
                setIsDelete(true);
              }}
            >
              <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </td>
      );
    }

    if (
      role === "Admin" ||
      role === "Head of Finance" ||
      role === "HOD Department" ||
      multiRole == 1
    ) {
      return (
        <td className="px-2 py-2 md:px-6 md:py-4 text-sm text-gray-500">
          <div className="flex justify-center items-center space-x-2">
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={(e) => handleEdit(e, user._id)}
            >
              <Edit className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            {role === "Admin" && (
              <button
                className="text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  setReqId(user._id);
                  setIsDelete(true);
                }}
              >
                <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            )}
          </div>
        </td>
      );
    } else {
      return (
        <td className="text-sm text-gray-500 text-center md:px-6 md:py-4 px-2 py-2">
          <button
            className="px-2 py-1 bg-primary text-white rounded-md hover:bg-primary text-xs md:text-sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsShowModal(true);
              setReqId(user._id);
            }}
          >
            Request Edit
          </button>
        </td>
      );
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}

      {/* Toast notification for copied ReqID */}
      {copiedReqId && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">
              ReqID "{copiedReqId}" copied successfully!
            </span>
          </div>
        </div>
      )}

      <div className="p-8 bg-white rounded-lg shadow-sm h-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Approval List
          </h2>

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="relative flex-1 min-w-[300px] max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by ID, name, department, or next department..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex rounded-md overflow-hidden">
                <button
                  className={`px-4 py-2.5 text-sm font-medium ${viewMode === "pending"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                    }`}
                  onClick={() => handleViewModeChange("pending")}
                >
                  Pending
                </button>
                <button
                  className={`px-4 py-2.5 text-sm font-medium ${viewMode === "all"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                    }`}
                  onClick={() => handleViewModeChange("all")}
                >
                  All
                </button>
              </div>

              <button
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </button>
              {poPolicy && (
                <a
                  href={poPolicy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2.5 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View PO Policy
                </a>
              )}
              <button
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => exportAllRequestsToExcel(users)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                className="inline-flex items-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                onClick={() => navigate("/req-list-table/create-request")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Request
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 w-full md:w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200 absolute right-0 md:right-8 z-20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Status Filter */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Status
                </h4>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Hold">Hold</option>
                  <option value="Rejected">Rejected</option>
                  <option value="PO-Pending">PO-Pending</option>
                  <option value="Invoice-Pending">Invoice-Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              {/* Department Filter - only show for certain statuses */}
              {statusesWithDepartments.includes(statusFilter) &&
                availableDepartments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Next Department ({statusFilter})
                    </h4>
                    <select
                      value={departmentFilter}
                      onChange={handleDepartmentFilterChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">All Departments</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Showing {availableDepartments.length} departments for{" "}
                      {statusFilter} status
                    </p>
                  </div>
                )}

              {statusesWithDepartments.includes(statusFilter) &&
                availableDepartments.length === 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Next Department ({statusFilter})
                    </h4>
                    <div className="px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-md border">
                      No departments available for {statusFilter} status
                    </div>
                  </div>
                )}

              {/* Date Range Filters */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      From
                    </label>
                    <input
                      type="date"
                      name="fromDate"
                      value={dateFilters.fromDate}
                      onChange={handleDateFilterChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      To
                    </label>
                    <input
                      type="date"
                      name="toDate"
                      value={dateFilters.toDate}
                      onChange={handleDateFilterChange}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-gray-200">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        <TableContent
          currentUsers={currentUsers}
          navigate={navigate}
          getStatusBackgroundColor={getStatusBackgroundColor}
          handleCopyReqId={handleCopyReqId}
          renderActionColumn={renderActionColumn}
          handleOpenInNewTab={handleOpenInNewTab}
          formatCurrency={formatCurrency}
          searchTerm={searchTerm}
          dateFilters={dateFilters}
          viewMode={viewMode}
          startIndex={startIndex}
        />

        {filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredUsers.length}
          />
        )}
        {isDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
              <h3 className="text-xl font-semibold mb-4">
                Do you really want to delete this request
              </h3>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsDelete(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(reqId)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  Yes Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {isShowModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-auto">
              <h3 className="text-xl font-semibold mb-4">
                Request Edit Permission
              </h3>
              <p className="mb-4">
                Your edit request has been sent to the administrator.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsShowModal(false)}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Approvals;
