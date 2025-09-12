import { useEffect, useState } from "react";
import {
    Edit,
    Trash2,
    Search,
    Download,
    Plus,
    Filter,
    InboxIcon,
    X,
    Copy,
    ExternalLink,
    Check,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    deleteReq,
    getReqListEmployee,
    getAdminReqListEmployee,
    getAllCurrencyData,
} from "../../../api/service/adminServices";
import LoadingSpinner from "../../spinner/LoadingSpinner";
import Pagination from "./Pagination";
import { exportAllRequestsToExcel } from "../../../utils/reqExportExel";

// const currencies = [
//     { code: "USD", symbol: "$", locale: "en-US" },
//     { code: "EUR", symbol: "€", locale: "de-DE" },
//     { code: "GBP", symbol: "£", locale: "en-GB" },
//     { code: "INR", symbol: "₹", locale: "en-IN" },
//     { code: "AED", symbol: "د.إ", locale: "ar-AE" },
//     { code: "IDR", symbol: "Rp", locale: "id-ID" },
//     { code: "MYR", symbol: "RM", locale: "ms-MY" },
//     { code: "SGD", symbol: "S$", locale: "en-SG" },
//     { code: "PHP", symbol: "₱", locale: "fil-PH" },
// ];

const EmptyState = ({ action }) => {
    const navigate = useNavigate();

    const getEmptyStateMessage = () => {
        switch (action) {
            case "Pending-Request":
                return {
                    title: "No Pending Requests",
                    description:
                        "There are currently no requests waiting for approval.",
                };
            case "Approved-Request":
                return {
                    title: "No Approved Requests",
                    description:
                        "There are no requests that have been approved yet.",
                };
            case "Completed-Request":
                return {
                    title: "No Completed Requests",
                    description:
                        "There are no requests that have been completed yet.",
                };
            case "Total-Request":
                return {
                    title: "No Requests Found",
                    description:
                        "There are no requests in the system at the moment.",
                };
            default:
                return {
                    title: "No Data Available",
                    description: "No requests match the current criteria.",
                };
        }
    };

    const message = getEmptyStateMessage();

    return (
        <div className="text-center py-12">
            <div className="flex justify-center">
                <div className="bg-gray-100 rounded-full p-4">
                    <InboxIcon className="h-12 w-12 text-gray-400" />
                </div>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
                {message.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500">{message.description}</p>
            <div className="mt-6">
                <button
                    onClick={() => navigate("/req-list-table/create-request")}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Request
                </button>
            </div>
        </div>
    );
};

const MyRequestStatistics = () => {
    const { action } = useParams();
    const userId = localStorage.getItem("capEmpId");
    const department = localStorage.getItem("department");
    const multiRole = localStorage.getItem("multiRole");

    const role = localStorage.getItem("role");
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDelete, setIsDelete] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isShowModal, setIsShowModal] = useState(false);
    const [viewMode, setViewMode] = useState("action");
    const [statusFilter, setStatusFilter] = useState("");
    const [currencies, setCurrencies] = useState([]);
    const [copiedReqId, setCopiedReqId] = useState(null);

    const [reqId, setReqId] = useState(null);
    const [dateFilters, setDateFilters] = useState({
        fromDate: "",
        toDate: "",
    });

    const [filteredUsers, setFilteredUsers] = useState([]);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchData = async () => {
            const response = await getAllCurrencyData();
            if (response.status === 200) {
                setCurrencies(response.data.data);
            }
        };
        fetchData();
    }, []);

    // Update filtered users when search term changes
    useEffect(() => {
        const dataToFilter = viewMode === "action" ? users : allUsers;

        // Apply multiple filters
        const filtered = dataToFilter.filter((user) => {
            const matchesSearch =
                user.reqid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.userName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                user.commercials?.businessUnit
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            // Status filter logic
            const matchesStatus = !statusFilter || user.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [searchTerm, users, allUsers, viewMode, statusFilter]);
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            setSelectedUsers([]);
        }
    };

    let filterAction;
    if (action === "Pending-Request") {
        filterAction = ["Pending", "PO-Pending", "Invoice-Pending"];
    } else if (
        action === "Approved-Request" ||
        action === "Completed-Request"
    ) {
        filterAction = ["Approved"];
    }else if(action==="OnHold-Request"){
        filterAction = ["Hold"]
    }else if(action==="Rejected-Request"){
        filterAction =["Rejected"]
    }

    const handleDateFilterChange = (e) => {
        const { name, value } = e.target;
        setDateFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Function to toggle between "Action" and "All" views
    const toggleViewMode = (mode) => {
        setViewMode(mode);
        setCurrentPage(1);
        setSelectedUsers([]);
    };

    useEffect(() => {
        const fetchReqTable = async () => {
            setIsLoading(true);
            try {
                let response;
                if (role === "Admin" && department === "Admin") {
                    response = await getAdminReqListEmployee();
                    // Save all requests for "All" view
                    setAllUsers(response.data.data);

                    if (action === "Total-Request") {
                        setUsers(response.data.data);
                    } else {
                        const filteredData = response.data.data.filter(
                            (item) => filterAction.includes(item.status) // Check if status is in the array
                        );
                        setUsers(filteredData);
                    }
                } else {
                    response = await getReqListEmployee(userId);
                    if (response.status === 200) {
                        // Save all requests for "All" view
                        setAllUsers(response.data.data);

                        const filteredData = response.data.data.filter(
                            (item) => filterAction.includes(item.status) // Check if status is in the array
                        );
                        setUsers(filteredData);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            }
        };

        fetchReqTable();
    }, [userId, role, action]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
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

    const handleEdit = async (e, userId) => {
        e.stopPropagation();
        navigate(`/req-list-table/edit-req/${userId}`);
    };

    const clearFilters = () => {
        setDateFilters({
            fromDate: "",
            toDate: "",
        });
        setSearchTerm("");
        setShowFilters(false);
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
        const url = `/req-list-table/preview-one-req/${id}`;
        window.open(url, "_blank");
    };

    const handleDelete = async (id) => {
        try {
            const response = await deleteReq(id);
            if (response.status === 200) {
                // Update both user lists
                setUsers(users.filter((user) => user._id !== id));
                setAllUsers(allUsers.filter((user) => user._id !== id));
                setIsDelete(false);
            }
        } catch (error) {
            console.error("Error deleting request:", error);
        }
    };

    const sendEditMail = () => {
        // Implement your send edit mail functionality here
        console.log("Sending edit mail for request:", reqId);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Display empty state only if both views are empty
    if (users.length === 0 && allUsers.length === 0) {
        return <EmptyState action={action} />;
    }

    // Get display data based on current view mode
    const currentViewData = viewMode === "action" ? users : allUsers;

    // Format action name for display
    const formatActionName = (actionName) => {
        return actionName.replace("-", " ");
    };

    const renderActionColumn = (user) => {
        // If status is Approved, don't show any actions
        if (user.status === "Approved") {
            return (
                <td className="text-sm text-gray-500 text-center md:px-6 md:py-4 px-2 py-2">
                    <span className="text-xs text-gray-400">No actions</span>
                </td>
            );
        }

        // If request is not completed (Draft), show edit and delete options for all users
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

        // Role-specific actions for completed requests
        if (
            role === "Admin" ||
            role === "Head of Finance" ||
            role === "HOD Department" ||
            multiRole == 1
        ) {
            return (
                <td className="px-2 py-2 md:px-6 md:py-4 text-sm text-gray-500">
                    <div className="flex justify-center items-center space-x-2">
                        {/* Both Admin and Head of Finance can edit */}
                        <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={(e) => handleEdit(e, user._id)}
                        >
                            <Edit className="h-4 w-4 md:h-5 md:w-5" />
                        </button>

                        {/* Only Admin can delete completed requests */}
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
            // For regular employees with completed requests
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
            <div className="p-3 md:p-4 bg-white rounded-lg shadow-sm h-full">
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
                <div className="mb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-0">
                            {`${formatActionName(action)} List`}
                        </h2>
                    </div>

                    <div className="block lg:hidden mb-4">
                        <button
                            className="w-full flex justify-center items-center px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 mb-2"
                            onClick={() =>
                                navigate("/req-list-table/create-request")
                            }
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Request
                        </button>
                        <div className="flex justify-between">
                            <button
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-colors ${
                                    viewMode === "action"
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={() => toggleViewMode("action")}
                            >
                                {formatActionName(action)}
                            </button>
                            <button
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-colors ${
                                    viewMode === "all"
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={() => toggleViewMode("all")}
                            >
                                All
                            </button>

                            <button
                                className="flex-1 mr-2 flex justify-center items-center px-2 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-3 w-3 mr-1" />
                                Filter
                            </button>
                            <button
                                className="flex-1 flex justify-center items-center px-2 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                onClick={() => exportAllRequestsToExcel(users)}
                            >
                                <Download className="h-3 w-3 mr-1" />
                                Export
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-6">
                        <div className="relative w-full lg:flex-1 lg:min-w-[300px] lg:max-w-md">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search by ID, name, or employee..."
                                className="w-full pl-10 pr-4 py-2 md:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        <div className="hidden lg:flex items-center gap-4">
                            <button
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-colors ${
                                    viewMode === "action"
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={() => toggleViewMode("action")}
                            >
                                {formatActionName(action)}
                            </button>
                            <button
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-colors ${
                                    viewMode === "all"
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                                onClick={() => toggleViewMode("all")}
                            >
                                All
                            </button>
                            <button
                                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filter
                            </button>
                            <button
                                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                onClick={() => exportAllRequestsToExcel(users)}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </button>
                            <button
                                className="inline-flex items-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                                onClick={() =>
                                    navigate("/req-list-table/create-request")
                                }
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Request
                            </button>
                        </div>
                    </div>

                    {showFilters && (
                        <div className="mt-4 w-full md:w-80 p-3 bg-white rounded-lg shadow-sm border border-gray-200 absolute right-0 md:right-8 z-10">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-medium text-gray-700">
                                    Filters
                                </h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>

                            {/* Date Range Filters */}
                            <div className="mb-3">
                                <h4 className="text-xs font-medium text-gray-700 mb-2">
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
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
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
                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <h4 className="text-xs font-medium text-gray-700 mb-2">
                                    Status
                                </h4>
                                <select
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Hold">Hold</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="PO-Pending">
                                        PO-Pending
                                    </option>
                                    <option value="Invoice-Pending">
                                        Invoice-Pending
                                    </option>
                                    <option value="Approved">Approved</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                <div className="border border-gray-200 rounded-lg w-full">
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-primary">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[5%]"
                                            >
                                                SNo
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%]"
                                            >
                                                ReqId
                                            </th>

                                            <th
                                                scope="col"
                                                className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%] hidden md:table-cell"
                                            >
                                                Entity
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%] hidden md:table-cell"
                                            >
                                                Vendor
                                            </th>
                                            <th
                                                scope="col"
                                                className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[9%]"
                                            >
                                                Amount
                                            </th>

                                            <th
                                                scope="col"
                                                className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[13%]"
                                            >
                                                Status
                                            </th>

                                            <th
                                                scope="col"
                                                className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[9%]"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user, index) => (
                                                <tr
                                                    key={user._id}
                                                    className="hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        navigate(
                                                            `/req-list-table/preview-one-req/${user._id}`
                                                        )
                                                    }
                                                >
                                                    <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm font-medium text-gray-900">
                                                        {(currentPage - 1) *
                                                            itemsPerPage +
                                                            index +
                                                            1}
                                                    </td>

                                                    <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="block font-medium">
                                                                    {user.reqid}
                                                                </span>
                                                                <div className="flex space-x-1">
                                                                    <button
                                                                        onClick={(
                                                                            e
                                                                        ) =>
                                                                            handleCopyReqId(
                                                                                user.reqid,
                                                                                e
                                                                            )
                                                                        }
                                                                        className="text-gray-400 hover:text-blue-500 transition-colors"
                                                                        title="Copy Request ID"
                                                                    >
                                                                        <Copy className="h-3 w-3 md:h-4 md:w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(
                                                                            e
                                                                        ) =>
                                                                            handleOpenInNewTab(
                                                                                user._id,
                                                                                e
                                                                            )
                                                                        }
                                                                        className="text-gray-400 hover:text-green-500 transition-colors"
                                                                        title="Open in new tab"
                                                                    >
                                                                        <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <span className="block font-medium">
                                                                {user.userName ||
                                                                    "Employee"}
                                                            </span>
                                                            <span className="block text-xs md:text-sm">
                                                                {
                                                                    user
                                                                        .commercials
                                                                        ?.department
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500 hidden md:table-cell">
                                                        <div>
                                                            <span className="block">
                                                                {user
                                                                    .commercials
                                                                    ?.businessUnit ||
                                                                    "NA"}
                                                            </span>
                                                            <span className="block font-medium">
                                                                {user
                                                                    .commercials
                                                                    ?.entity ||
                                                                    "NA"}
                                                            </span>
                                                            <span className="block">
                                                                {user
                                                                    .commercials
                                                                    ?.site ||
                                                                    "NA"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500 hidden md:table-cell">
                                                        <div>
                                                            <span className="block font-medium">
                                                                {
                                                                    user
                                                                        .procurements
                                                                        ?.vendor
                                                                }
                                                            </span>
                                                            <span className="block">
                                                                {
                                                                    user
                                                                        .procurements
                                                                        ?.vendorName
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">
                                                        {formatCurrency(
                                                            user.supplies
                                                                ?.totalValue,
                                                            user.supplies
                                                                ?.selectedCurrency
                                                        )}
                                                    </td>

                                                    <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">
                                                        {user.isCompleted ? (
                                                            <>
                                                                {user.status !==
                                                                    "Approved" && (
                                                                    <>
                                                                        {
                                                                            user.nextDepartment
                                                                        }{" "}
                                                                        <br />
                                                                    </>
                                                                )}
                                                                {user.status ||
                                                                    "Pending"}
                                                            </>
                                                        ) : (
                                                            <span className="text-red-500">
                                                                Draft
                                                            </span>
                                                        )}
                                                    </td>

                                                    {renderActionColumn(user)}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="13"
                                                    className="px-2 py-2 md:px-6 md:py-4 text-center text-xs md:text-sm text-gray-500"
                                                >
                                                    No matching results found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="mt-4 px-2 md:px-0">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        handlePageChange={handlePageChange}
                                        itemsPerPage={itemsPerPage}
                                        totalItems={filteredUsers.length}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty state for filtered view */}
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <div className="flex justify-center">
                            <div className="bg-gray-100 rounded-full p-4">
                                <InboxIcon className="h-10 w-10 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            No matching results
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            {viewMode === "action"
                                ? `No ${formatActionName(
                                      action
                                  ).toLowerCase()} requests match your search criteria.`
                                : "No requests match your search criteria."}
                        </p>
                        {viewMode === "action" && allUsers.length > 0 && (
                            <div className="mt-4">
                                <button
                                    onClick={() => toggleViewMode("all")}
                                    className="text-primary hover:text-primary/80 text-sm font-medium"
                                >
                                    View all requests instead
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Modal for Edit Request */}
                {isShowModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-sm md:max-w-md">
                            <h3 className="text-lg md:text-xl font-semibold mb-4">
                                Send Edit Request
                            </h3>
                            <p className="mb-6 text-sm md:text-base">
                                Do you want to send a edit request email to the
                                Head of Department?
                            </p>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setIsShowModal(false)}
                                    className="px-3 py-1.5 md:px-4 md:py-2 border rounded-lg text-sm hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setIsShowModal(false);
                                        sendEditMail();
                                    }}
                                    className="bg-primary text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm hover:bg-primary/90"
                                >
                                    Send Request
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal for Delete Confirmation */}
                {isDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-sm md:max-w-md">
                            <h3 className="text-lg md:text-xl font-semibold mb-4">
                                Do you really want to delete this request?
                            </h3>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setIsDelete(false)}
                                    className="px-3 py-1.5 md:px-4 md:py-2 border rounded-lg text-sm hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(reqId)}
                                    className="bg-primary text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm hover:bg-primary/90"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MyRequestStatistics;
