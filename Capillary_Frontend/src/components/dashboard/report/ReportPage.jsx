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
} from "lucide-react";

// Import your API service functions
import {
  getReqReports,
  // searchReports,
  getEntityName,
  searchReports,
  // getDepartments,
} from "../../../api/service/adminServices";

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

  // State for search criteria
  const [searchCriteria, setSearchCriteria] = useState({
    entity: "",
    department: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

  // State for dropdown options
  const [entities, setEntities] = useState([]);
  const [departments, setDepartments] = useState([]);

  // State for search results
  const [tableData, setTableData] = useState([]);

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
          setDepartments(entitiesResponse.data.departments);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Handle input changes in search form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle search submission
  const handleSearch = async () => {
    try {
      const response = await searchReports(searchCriteria);
      if (response.status === 200) {
        setTableData(response.data.data);
      }
    } catch (error) {
      console.error("Error searching reports:", error);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Entity
            </label>
            <select
              name="entity"
              value={searchCriteria.entity}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              name="department"
              value={searchCriteria.department}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select Department</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              value={searchCriteria.status}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              From Date
            </label>
            <input
              type="date"
              name="fromDate"
              value={searchCriteria.fromDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              To Date
            </label>
            <input
              type="date"
              name="toDate"
              value={searchCriteria.toDate}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <Search className="mr-2 w-5 h-5" /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {tableData.length > 0 && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Add this div wrapper for horizontal scrolling */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              {" "}
              {/* min-w-max ensures the table doesn't shrink */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Requests
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rejected
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hold
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Funds
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rejected Funds
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hold Funds
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending Funds
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved Funds
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tableData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{row.entity}</td>
                    <td className="px-4 py-3">{row.department}</td>
                    <td className="px-4 py-3">{row.totalRequests || 0}</td>
                    <td className="px-4 py-3">{row.approvedRequest || 0}</td>
                    <td className="px-4 py-3">{row.rejectedRequests || 0}</td>
                    <td className="px-4 py-3">{row.pendingRequests || 0}</td>
                    <td className="px-4 py-3">{row.holdRequests || 0}</td>
                    <td className="px-4 py-3">{row.currency}</td>
                    <td className="px-4 py-3">
                      {formatCurrencyValue(row.totalFund, row.currency)}
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrencyValue(row.rejectedFund, row.currency)}
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrencyValue(row.holdFund, row.currency)}
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrencyValue(row.pendingFund, row.currency)}
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrencyValue(row.approvedFund, row.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
