import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  BarChart3,
  Clock,
  XCircle,
  PauseCircle,
  FileText,
  CreditCard,
  Search,
  ChevronDown,
} from "lucide-react";

// Import your API service functions
import {
  getReqReports,
  getEntityName,
  searchReports,
} from "../../../api/service/adminServices";
import TableContent from "./TableContent";

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

// Roles list
const roles = [
  "Business Finance",
  "Vendor Management",
  "Legal Team",
  "Info Security",
  "Head of Finance",
];

const ReportPage = () => {
  // State for report data
  const [reportData, setReportData] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    rejectedRequests: 0,
    invoicePending: 0,
    approvedRequests: 0,
    poPendingRequest: 0,
    holdRequests: 0,
    departmentBudgetByCurrency: {},
  });

  // State for filter type selections
  const [filterType, setFilterType] = useState("department"); // "department" or "role"
  const [dateFilterType, setDateFilterType] = useState("general"); // "general", "poRequested", "poExpiry"

  // State for search criteria
  const [searchCriteria, setSearchCriteria] = useState({
    entity: "",
    department: "",
    role: "",
    status: "",
    nextDepartment: "",
    fromDate: "",
    toDate: "",
  });

  // State for dropdown options
  const [entities, setEntities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);

  // State for department search functionality
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  // State for search results
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Statuses that support department filtering
  const statusesWithDepartments = ["Pending", "Rejected", "Hold"];

  // Fetch initial report data and dropdown options
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch report data
        const reportResponse = await getReqReports();

        if (reportResponse.status === 200) {
          setReportData(reportResponse.data);
        }

        // Fetch entities
        const entitiesResponse = await getEntityName();
        console.log(entitiesResponse);

        if (entitiesResponse.status === 200) {
          setEntities(entitiesResponse.data.entities);

          // Only use departments from API, no additional ones
          const allDepartments = (
            entitiesResponse.data.departments || []
          ).sort();

          setDepartments(allDepartments);
          setFilteredDepartments(allDepartments);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Filter departments based on search term
  useEffect(() => {
    if (departmentSearchTerm) {
      const filtered = departments.filter((dept) =>
        dept.toLowerCase().includes(departmentSearchTerm.toLowerCase())
      );
      setFilteredDepartments(filtered);
    } else {
      setFilteredDepartments(departments);
    }
  }, [departmentSearchTerm, departments]);

  // Handle filter type change (Department/Role)
  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    // Clear the other filter when switching
    setSearchCriteria((prev) => ({
      ...prev,
      department: type === "role" ? "" : prev.department,
      role: type === "department" ? "" : prev.role,
    }));
    if (type === "role") {
      setDepartmentSearchTerm("");
      setIsDepartmentDropdownOpen(false);
    }
  };

  // Handle date filter type change
  const handleDateFilterTypeChange = (type) => {
    setDateFilterType(type);
    // Clear date fields when switching filter types
    setSearchCriteria((prev) => ({
      ...prev,
      fromDate: "",
      toDate: "",
    }));
  };

  // Handle department search input
  const handleDepartmentSearch = (e) => {
    setDepartmentSearchTerm(e.target.value);
    setIsDepartmentDropdownOpen(true);
  };

  // Handle department selection
  const handleDepartmentSelect = (department) => {
    setSearchCriteria((prev) => ({
      ...prev,
      department: department,
    }));
    setDepartmentSearchTerm(department);
    setIsDepartmentDropdownOpen(false);
  };

  // Clear department selection
  const clearDepartmentSelection = () => {
    setSearchCriteria((prev) => ({
      ...prev,
      department: "",
    }));
    setDepartmentSearchTerm("");
    setIsDepartmentDropdownOpen(false);
  };

  // Handle input changes in search form
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setSearchCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If status changes, clear nextDepartment and fetch available departments
    if (name === "status") {
      setSearchCriteria((prev) => ({
        ...prev,
        [name]: value,
        nextDepartment: "",
      }));

      // Fetch available departments for the selected status
      if (statusesWithDepartments.includes(value)) {
        fetchAvailableDepartments(value);
      } else {
        setAvailableDepartments([]);
      }
    }
  };

  // Fetch available departments based on status
  const fetchAvailableDepartments = async (status) => {
    try {
      setIsLoading(true);

      const departmentSearchCriteria = {
        ...searchCriteria,
        status: status,
        nextDepartment: "",
      };

      const response = await searchReports(departmentSearchCriteria);

      if (response.status === 200 && response.data.data) {
        const uniqueDepartments = [
          ...new Set(
            response.data.data
              .map((item) => item.nextDepartment)
              .filter((dept) => dept && dept.trim() !== "")
          ),
        ].sort();

        setAvailableDepartments(uniqueDepartments);
        console.log(`Available departments for ${status}:`, uniqueDepartments);
      }
    } catch (error) {
      console.error("Error fetching available departments:", error);
      setAvailableDepartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = async () => {
    try {
      setIsLoading(true);

      // Prepare search criteria based on selected filter types
      const finalSearchCriteria = {
        ...searchCriteria,
        // Only include the selected filter type
        department:
          filterType === "department" ? searchCriteria.department : "",
        role: filterType === "role" ? searchCriteria.role : "",
      };

      const response = await searchReports(finalSearchCriteria);
      if (response.status === 200) {
        setTableData(response.data.data);
        console.log("Search results:", response.data.data);
      }
    } catch (error) {
      console.error("Error searching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchCriteria({
      entity: "",
      department: "",
      role: "",
      status: "",
      nextDepartment: "",
      fromDate: "",
      toDate: "",
    });
    setDepartmentSearchTerm("");
    setAvailableDepartments([]);
    setTableData([]);
    setIsDepartmentDropdownOpen(false);
    setFilterType("department");
    setDateFilterType("general");
  };

  // Format currency with proper symbol
  const formatCurrencyValue = (value, currencyCode) => {
    if (!value) return 0;
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

  // Calculate total budget
  const calculateTotalBudget = (budgetByCurrency) => {
    if (!budgetByCurrency) return "0";

    return (
      Object.entries(budgetByCurrency)
        .filter(([_, amount]) => amount != null)
        .map(([currency, amount]) => formatCurrencyValue(amount, currency))
        .join(" + ") || "0"
    );
  };

  // Get date filter label based on type
  const getDateFilterLabel = () => {
    switch (dateFilterType) {
      case "general":
        return { from: "From Date", to: "To Date" };
      case "poRequested":
        return { from: "PO Requested From", to: "PO Requested To" };
      case "poExpiry":
        return { from: "PO Expiry From", to: "PO Expiry To" };
      default:
        return { from: "From Date", to: "To Date" };
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-800">
                {reportData.totalRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-lg font-bold text-gray-800">
                {calculateTotalBudget(reportData.departmentBudgetByCurrency)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-800">
                {reportData.pendingRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected Requests</p>
              <p className="text-2xl font-bold text-gray-800">
                {reportData.rejectedRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <PauseCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hold Requests</p>
              <p className="text-2xl font-bold text-gray-800">
                {reportData.holdRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved Requests</p>
              <p className="text-2xl font-bold text-gray-800">
                {reportData.approvedRequests}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">PO Pending Requests</p>
              <p className="text-2xl font-bold text-gray-800">
                {reportData.poPendingRequest}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Invoice Pending</p>
              <p className="text-2xl font-bold text-gray-800">
                {reportData.invoicePending}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Search Filters
        </h3>

        {/* First Row - Entity and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity
            </label>
            <select
              name="entity"
              value={searchCriteria.entity}
              onChange={handleInputChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 h-11"
            >
              <option value="">Select Entity</option>
              {entities.map((entity, index) => (
                <option key={index} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={searchCriteria.status}
              onChange={handleInputChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 h-11"
            >
              <option value="">Select Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Hold">Hold</option>
              <option value="PO-Pending">PO Pending</option>
              <option value="Invoice-Pending">Invoice Pending</option>
            </select>
          </div>
        </div>

        {/* Second Row - Department/Role Filter Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Filter By
          </label>
          <div className="flex gap-6 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="filterType"
                value="department"
                checked={filterType === "department"}
                onChange={(e) => handleFilterTypeChange(e.target.value)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 focus:ring-2"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Department
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="filterType"
                value="role"
                checked={filterType === "role"}
                onChange={(e) => handleFilterTypeChange(e.target.value)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 focus:ring-2"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Role
              </span>
            </label>
          </div>

          {/* Department Filter */}
          {filterType === "department" && (
            <div className="relative max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={departmentSearchTerm}
                  onChange={handleDepartmentSearch}
                  onFocus={() => setIsDepartmentDropdownOpen(true)}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 pr-10 h-11"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </div>

                {/* Dropdown */}
                {isDepartmentDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg border border-gray-200 overflow-auto">
                    {searchCriteria.department && (
                      <div className="p-3 border-b border-gray-200">
                        <button
                          onClick={clearDepartmentSelection}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          ✕ Clear Selection
                        </button>
                      </div>
                    )}
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map((dept, index) => (
                        <button
                          key={index}
                          onClick={() => handleDepartmentSelect(dept)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                            searchCriteria.department === dept
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "text-gray-900"
                          }`}
                        >
                          {dept}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        No departments found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Click outside handler */}
              {isDepartmentDropdownOpen && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDepartmentDropdownOpen(false)}
                />
              )}
            </div>
          )}

          {/* Role Filter */}
          {filterType === "role" && (
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={searchCriteria.role}
                onChange={handleInputChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 h-11"
              >
                <option value="">Select Role</option>
                {roles.map((role, index) => (
                  <option key={index} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Third Row - Date Filter Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Date Filter Type
          </label>
          <div className="flex gap-6 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="dateFilterType"
                value="general"
                checked={dateFilterType === "general"}
                onChange={(e) => handleDateFilterTypeChange(e.target.value)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 focus:ring-2"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                General Dates
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="dateFilterType"
                value="poRequested"
                checked={dateFilterType === "poRequested"}
                onChange={(e) => handleDateFilterTypeChange(e.target.value)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 focus:ring-2"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                PO Requested Date
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="dateFilterType"
                value="poExpiry"
                checked={dateFilterType === "poExpiry"}
                onChange={(e) => handleDateFilterTypeChange(e.target.value)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 focus:ring-2"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                PO Expiry Date
              </span>
            </label>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getDateFilterLabel().from}
              </label>
              <input
                type="date"
                name="fromDate"
                value={searchCriteria.fromDate}
                onChange={handleInputChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 h-11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getDateFilterLabel().to}
              </label>
              <input
                type="date"
                name="toDate"
                value={searchCriteria.toDate}
                onChange={handleInputChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 h-11"
              />
            </div>
          </div>
        </div>

        {/* Fourth Row - Next Department (conditional) */}
        {statusesWithDepartments.includes(searchCriteria.status) && (
          <div className="mb-6">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Department ({searchCriteria.status})
              </label>
              <select
                name="nextDepartment"
                value={searchCriteria.nextDepartment}
                onChange={handleInputChange}
                disabled={isLoading}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-100 h-11"
              >
                <option value="">
                  {isLoading ? "Loading..." : "All Departments"}
                </option>
                {availableDepartments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {availableDepartments.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {availableDepartments.length} departments available
                </p>
              )}
              {statusesWithDepartments.includes(searchCriteria.status) &&
                availableDepartments.length === 0 &&
                !isLoading && (
                  <p className="text-xs text-gray-400 mt-2">
                    No departments found for {searchCriteria.status} status
                  </p>
                )}
            </div>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm font-medium"
          >
            Clear Filters
          </button>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <Search className="mr-2 w-4 h-4" />
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Results Table */}
      {tableData.length > 0 && (
        <TableContent
          tableData={tableData}
          formatCurrencyValue={formatCurrencyValue}
        />
      )}

      {/* No Results Message */}
      {tableData.length === 0 && searchCriteria.status && !isLoading && (
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
          <p className="text-gray-500">
            No results found for the selected criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
