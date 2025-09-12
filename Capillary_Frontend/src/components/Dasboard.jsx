import { Navigate, useNavigate } from "react-router-dom";
import {
  UserCircle2,
  Mail,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  ClipboardList,
  CheckSquare,
  Building2,
  Wallet,
  Calendar,
  Search,
  X,
  Users,
  Layers,
  AlertCircle,
  PauseCircle,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  fetchDateFilterStatistics,
  getAllCurrencyData,
  getStatisticData,
} from "../api/service/adminServices";
import LoadingSpinner from "./spinner/LoadingSpinner";

const Dashboard = () => {
  const multipartRole = localStorage.getItem("multiRole");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");
  const empId = localStorage.getItem("capEmpId");
  const department = localStorage.getItem("department");
  const email = localStorage.getItem("email");
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    fromDate: null,
    toDate: null,
  });
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
    adminAllTotalRequests: 0,
    adminAllPendingRequests: 0,
    adminAllCompletedRequests: 0,
    adminAllOnHoldRequests: 0,
    adminAllRejectedRequests: 0,
    adminAlltotalFunds: 0,

    myRequests: 0,
    myApprovals: 0,
    myReqOnHold: 0,
    myReqRejected: 0,
    pendingRequest: 0,

    pendingApprovals: 0,
    completedApprovals: 0,
    rejectedApprovals: 0,
    onHoldApprovals: 0,
    departmentBudget: 0,
    totalApprovals: 0,

    // Adding new properties for multipart role stats
    roleApprovals: 0,
    pendingRoleRequests: 0,
    approvedRoleRequests: 0,
    onHoldRoleRequests: 0,
    rejectedRoleRequests: 0,
  });

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
    const fetchDashboardStats = async () => {
      setIsLoading(true);

      try {
        const response = await getStatisticData(
          empId,
          role,
          email,
          multipartRole
        );
        if (response.status === 200) {
          setDashboardStats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    fetchDashboardStats();
  }, [empId]);

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

  const clearFilters = () => {
    setDateRange({
      fromDate: "",
      toDate: "",
    });
    setIsFilterActive(false);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilter = async () => {
    if (dateRange.fromDate && dateRange.toDate) {
      setIsFilterActive(true);
      try {
        const response = await fetchDateFilterStatistics(
          empId,
          role,
          email,
          multipartRole,
          dateRange.fromDate,
          dateRange.toDate
        );
        if (response.status === 200) {
          setDashboardStats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch filtered statistics:", error);
      }
    } else {
      alert("Please select both From and To dates");
    }
  };

  const DateFilter = () => (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 border border-gray-100">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-primary" />
          Date Range Filter
        </h3>
        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              name="fromDate"
              value={dateRange.fromDate}
              onChange={handleDateChange}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              name="toDate"
              value={dateRange.toDate}
              onChange={handleDateChange}
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <button
              onClick={handleFilter}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Filter
            </button>
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({
    title,
    value,
    icon: Icon,
    bgColor,
    textColor,
    onClick,
  }) => (
    <div
      onClick={onClick}
      className={`${bgColor} rounded-xl p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
    >
      <div className="flex items-center space-x-3 mb-2">
        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${textColor}`} />
        <h4 className="font-semibold text-sm sm:text-base text-gray-900">
          {title}
        </h4>
      </div>
      <div>
        <span className={`text-xl sm:text-3xl font-bold ${textColor}`}>
          {value}
        </span>
      </div>
    </div>
  );

  const BudgetCard = ({
    title,
    departmentBudgetByCurrency,
    icon: Icon,
    bgColor,
    textColor,
    onClick,
  }) => (
    <div
      onClick={onClick}
      className={`${bgColor} rounded-xl p-4 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
    >
      <div className="flex items-center space-x-3 mb-2">
        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${textColor}`} />
        <h4 className="font-semibold text-sm sm:text-base text-gray-900">
          {title}
        </h4>
      </div>
      <div className="space-y-1">
        {departmentBudgetByCurrency &&
          Object.entries(departmentBudgetByCurrency).map(
            ([currency, value]) => (
              <div key={currency} className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">
                  {currency}
                </span>
                <span className={`text-sm sm:text-xl font-bold ${textColor}`}>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency,
                  }).format(value)}
                </span>
              </div>
            )
          )}
        {(!departmentBudgetByCurrency ||
          Object.keys(departmentBudgetByCurrency).length === 0) && (
          <span className="text-xs sm:text-sm text-gray-500">
            No budget data available
          </span>
        )}
      </div>
    </div>
  );

  // New section for multipart role cards
  const renderMultipartRoleCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      <StatCard
        title="Approved Role Requests"
        value={dashboardStats.completedApprovals || 0}
        icon={CheckSquare}
        bgColor="bg-emerald-50 hover:bg-emerald-100"
        textColor="text-emerald-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/My-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Pending Role Requests"
        value={dashboardStats.pendingApprovals || 0}
        icon={AlertCircle}
        bgColor="bg-amber-50 hover:bg-amber-100"
        textColor="text-amber-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Pending-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="On Hold Role Requests"
        value={dashboardStats.onHoldRoleRequests || 0}
        icon={PauseCircle}
        bgColor="bg-amber-50 hover:bg-amber-100"
        textColor="text-amber-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/OnHold-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Rejected Role Requests"
        value={dashboardStats.rejectedRoleRequests || 0}
        icon={XCircle}
        bgColor="bg-red-50 hover:bg-red-100"
        textColor="text-red-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Rejected-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Total Role Approvals"
        value={dashboardStats.totalApprovals || 0}
        icon={Users}
        bgColor="bg-purple-50 hover:bg-purple-100"
        textColor="text-purple-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Total-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />
    </div>
  );

  const renderAdminCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Requests"
        value={dashboardStats.adminAllTotalRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Total-Request/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.adminAllPendingRequests}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Pending-Request/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />
      <StatCard
        title="Approved Requests"
        value={dashboardStats.adminAllCompletedRequests}
        icon={CheckCircle2}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Approved-Request/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="On Hold Requests"
        value={dashboardStats.adminAllOnHoldRequests || 0}
        icon={PauseCircle}
        bgColor="bg-amber-50 hover:bg-amber-100"
        textColor="text-amber-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/OnHold-Request/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Rejected Requests"
        value={dashboardStats.adminAllRejectedRequests || 0}
        icon={XCircle}
        bgColor="bg-red-50 hover:bg-red-100"
        textColor="text-red-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Rejected-Request/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <BudgetCard
        title="Department Expense"
        departmentBudgetByCurrency={dashboardStats?.departmentBudgetByCurrency}
        icon={Building2}
        bgColor="bg-blue-100"
        textColor="text-blue-600"
      />
    </div>
  );

  const renderHODCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard
        title="My Requests"
        value={dashboardStats.myRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() => navigate("/req-list-table")}
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.pendingRequest}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Pending-Request")
        }
      />
      <StatCard
        title="Approved Requests"
        value={dashboardStats.completedApprovals}
        icon={CheckCircle2}
        bgColor="bg-teal-50 hover:bg-teal-100"
        textColor="text-teal-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Completed-Request")
        }
      />

      <StatCard
        title="On Hold Requests"
        value={dashboardStats.myReqOnHold || 0}
        icon={PauseCircle}
        bgColor="bg-amber-50 hover:bg-amber-100"
        textColor="text-amber-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/OnHold-Request")
        }
      />

      <StatCard
        title="Rejected Requests"
        value={dashboardStats.myRejectedReq || 0}
        icon={XCircle}
        bgColor="bg-red-50 hover:bg-red-100"
        textColor="text-red-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Rejected-Request")
        }
      />

      <StatCard
        title="⁠Approved Approvals"
        value={dashboardStats.myApprovals}
        icon={CheckSquare}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Approved-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Pending Approvals"
        value={dashboardStats.pendingApprovals}
        icon={ClipboardList}
        bgColor="bg-yellow-50 hover:bg-yellow-100"
        textColor="text-yellow-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Pending-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="On Hold Approvals"
        value={dashboardStats.onHoldApprovals || 0}
        icon={PauseCircle}
        bgColor="bg-amber-50 hover:bg-amber-100"
        textColor="text-amber-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/OnHold-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Rejected Approvals"
        value={dashboardStats.rejectedApprovals || 0}
        icon={XCircle}
        bgColor="bg-red-50 hover:bg-red-100"
        textColor="text-red-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Rejected-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="My Department Approvals"
        value={dashboardStats.totalApprovals}
        icon={CheckCircle2}
        bgColor="bg-indigo-50 hover:bg-indigo-100"
        textColor="text-indigo-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Total-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <BudgetCard
        title="Department Expense"
        departmentBudgetByCurrency={dashboardStats?.departmentBudgetByCurrency}
        icon={Building2}
        bgColor="bg-blue-100"
        textColor="text-blue-600"
      />
    </div>
  );

  const renderFinanceCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard
        title="My Requests"
        value={dashboardStats.myRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() => navigate("/req-list-table")}
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.pendingRequest}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Pending-Request")
        }
      />
      <StatCard
        title="Completed Requests"
        value={dashboardStats.completedRequest}
        icon={CheckCircle2}
        bgColor="bg-teal-50 hover:bg-teal-100"
        textColor="text-teal-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Approved-Request")
        }
      />

      <StatCard
        title="On Hold Requests"
        value={dashboardStats.myReqOnHold || 0}
        icon={PauseCircle}
        bgColor="bg-amber-50 hover:bg-amber-100"
        textColor="text-amber-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/OnHold-Request")
        }
      />

      <StatCard
        title="Rejected Requests"
        value={dashboardStats.myRejectedReq || 0}
        icon={XCircle}
        bgColor="bg-red-50 hover:bg-red-100"
        textColor="text-red-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Rejected-Request")
        }
      />

      <StatCard
        title="My Approvals"
        value={dashboardStats.completedApprovals}
        icon={CheckSquare}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/My-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Pending Approvals"
        value={dashboardStats.pendingApprovals}
        icon={ClipboardList}
        bgColor="bg-yellow-50 hover:bg-yellow-100"
        textColor="text-yellow-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Pending-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="On Hold Approvals"
        value={dashboardStats.onHoldApprovals || 0}
        icon={PauseCircle}
        bgColor="bg-amber-50 hover:bg-amber-100"
        textColor="text-amber-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/OnHold-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Rejected Approvals"
        value={dashboardStats.rejectedApprovals || 0}
        icon={XCircle}
        bgColor="bg-red-50 hover:bg-red-100"
        textColor="text-red-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Rejected-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Total Approvals"
        value={dashboardStats.totalApprovals}
        icon={CheckCircle2}
        bgColor="bg-indigo-50 hover:bg-indigo-100"
        textColor="text-indigo-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Total-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />
      <BudgetCard
        title="Department Expense"
        departmentBudgetByCurrency={dashboardStats?.departmentBudgetByCurrency}
        icon={Building2}
        bgColor="bg-blue-100"
        textColor="text-blue-600"
      />
    </div>
  );

  const renderEmployeeCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="My Requests"
        value={dashboardStats.myRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() => navigate("/req-list-table")}
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.pendingApprovals}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Pending-Request")
        }
      />
      <StatCard
        title="Completed Requests"
        value={dashboardStats.completedApprovals}
        icon={CheckCircle2}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Approved-Request")
        }
      />

      <StatCard
        title="On Hold Requests"
        value={dashboardStats.myReqOnHold || 0}
        icon={PauseCircle}
        bgColor="bg-amber-50 hover:bg-amber-100"
        textColor="text-amber-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/OnHold-Request")
        }
      />

      <StatCard
        title="Rejected Requests"
        value={dashboardStats.myRejectedReq || 0}
        icon={XCircle}
        bgColor="bg-red-50 hover:bg-red-100"
        textColor="text-red-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Rejected-Request")
        }
      />
    </div>
  );

  const renderVendorManagement = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard
        title="My Requests"
        value={dashboardStats.myRequests}
        icon={FileText}
        bgColor="bg-blue-50 hover:bg-blue-100"
        textColor="text-blue-600"
        onClick={() => navigate("/req-list-table")}
      />
      <StatCard
        title="Pending Requests"
        value={dashboardStats.pendingRequest}
        icon={Clock}
        bgColor="bg-orange-50 hover:bg-orange-100"
        textColor="text-orange-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Pending-Request")
        }
      />
      <StatCard
        title="Approved Requests"
        value={dashboardStats.completedRequest}
        icon={CheckCircle2}
        bgColor="bg-teal-50 hover:bg-teal-100"
        textColor="text-teal-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Completed-Request")
        }
      />

      <StatCard
        title="On Hold Requests"
        value={dashboardStats.onHoldApprovals || 0}
        icon={PauseCircle}
        bgColor="bg-amber-50 hover:bg-amber-100"
        textColor="text-amber-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/OnHold-Request")
        }
      />

      <StatCard
        title="Rejected Requests"
        value={dashboardStats.rejectedApprovals || 0}
        icon={XCircle}
        bgColor="bg-red-50 hover:bg-red-100"
        textColor="text-red-600"
        onClick={() =>
          navigate("/req-list-table/show-request-statistcs/Rejected-Request")
        }
      />

      <StatCard
        title="My Approvals"
        value={dashboardStats.completedApprovals}
        icon={CheckSquare}
        bgColor="bg-green-50 hover:bg-green-100"
        textColor="text-green-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/My-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Pending Approvals"
        value={dashboardStats.pendingApprovals}
        icon={ClipboardList}
        bgColor="bg-yellow-50 hover:bg-yellow-100"
        textColor="text-yellow-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Pending-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="On Hold Approvals"
        value={dashboardStats.onHoldApprovals || 0}
        icon={PauseCircle}
        bgColor="bg-amber-50 hover:bg-amber-100"
        textColor="text-amber-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/OnHold-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Rejected Approvals"
        value={dashboardStats.rejectedApprovals || 0}
        icon={XCircle}
        bgColor="bg-red-50 hover:bg-red-100"
        textColor="text-red-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Rejected-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />

      <StatCard
        title="Total Approvals"
        value={dashboardStats.totalApprovals}
        icon={CheckCircle2}
        bgColor="bg-indigo-50 hover:bg-indigo-100"
        textColor="text-indigo-600"
        onClick={() =>
          navigate(
            `/approval-request-list/show-request-statistcs/Total-Approvals/${dateRange.fromDate}/${dateRange.toDate}`
          )
        }
      />
    </div>
  );

  const renderStatisticCards = () => {
    switch (role?.toLowerCase()) {
      case "admin":
        if (
          department?.toLowerCase() === "admin" ||
          (role?.toLowerCase() === "admin" && multipartRole === 0)
        ) {
          return renderAdminCards();
        }
        return renderHODCards();
      case "hod department":
        return renderHODCards();
      case "head of finance":
      case "business finance":
        return renderFinanceCards();
      case "vendor management":
      case "legal team":
      case "info security":
        return renderVendorManagement();
      default:
        return renderEmployeeCards();
    }
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}

      <div className="min-h-screen bg-gray-50/50 py-4 sm:py-8 px-2 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Profile Card */}

          <DateFilter />

          {/* Statistics Cards */}
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <span className="inline-block w-2 h-4 sm:h-6 bg-primary rounded-full mr-2 sm:mr-3"></span>
              Dashboard Statistics
            </h3>
            {renderStatisticCards()}

            {/* Multipart Role Section */}
            {multipartRole == 1 && (
              <>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center">
                  <span className="inline-block w-2 h-4 sm:h-6 bg-purple-500 rounded-full mr-2 sm:mr-3"></span>
                  Role Management
                </h3>
                {renderMultipartRoleCards()}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
