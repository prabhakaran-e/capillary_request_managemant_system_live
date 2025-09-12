import { useEffect, useState } from "react";
import {
    Edit,
    Trash2,
    Search,
    Download,
    Plus,
    Filter,
    FileText,
    X,
    Menu,
    Copy,
    ExternalLink,
    Check,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    deleteReq,
    getAdminReqListEmployee,
    getAllCurrencyData,
    getReqListEmployee,
    sendReqEditMail,
    getFilteredRequests,
} from "../../../api/service/adminServices";
import Pagination from "./Pagination";
import * as XLSX from "xlsx";
import LoadingSpinner from "../../spinner/LoadingSpinner";
import { exportAllRequestsToExcel } from "../../../utils/reqExportExel";
import ShowModal from "./modal/ShowModal";
import DeleteModal from "./modal/DeleteModal";
import TableContents from "./modal/TableContents";

const ReqListTable = () => {
    const userId = localStorage.getItem("capEmpId");
    const role = localStorage.getItem("role");
    const multiRole = localStorage.getItem("multiRole");
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isShowModal, setIsShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDelete, setIsDelete] = useState(false);
    const [showMobileActions, setShowMobileActions] = useState(false);
    const [isReminderNotification, setReminderNotification] = useState(false);
    const [currencies, setCurrencies] = useState([]);
    const [copiedReqId, setCopiedReqId] = useState(null);
    const [isApplyingFilter, setIsApplyingFilter] = useState(false);

    const [reqId, setReqId] = useState(null);
    const [dateFilters, setDateFilters] = useState({
        fromDate: "",
        toDate: "",
    });
    const [statusFilter, setStatusFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [showDepartmentOptions, setShowDepartmentOptions] = useState(false);

    // Add state for applied filters to track what filters are currently active
    const [appliedFilters, setAppliedFilters] = useState({
        statusFilter: "",
        departmentFilter: "",
        dateFilters: {
            fromDate: "",
            toDate: "",
        },
    });

    const itemsPerPage = 20;

    const departments = [
        "Head of the department",
        "Business Finance",
        "Vendor Management",
        "Legal Team",
        "Info Security",
        "Head of Finance",
        "Proceed the PO invoice",
    ];

    const statusesWithDepartments = ["Pending", "Rejected", "Hold"];

    useEffect(() => {
        const fetchData = async () => {
            const response = await getAllCurrencyData();
            if (response.status === 200) {
                setCurrencies(response.data.data);
            }
        };
        fetchData();
    }, []);

    // Initial data fetch - load all data without filters
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                let response;
                if (role === "Admin") {
                    response = await getAdminReqListEmployee();
                } else {
                    response = await getReqListEmployee(userId);
                }

                if (response && response.data) {
                    setUsers(response.data.data);
                    setFilteredUsers(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching initial data:", error);
            } finally {
                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            }
        };
        fetchInitialData();
    }, [userId, role]);

    // Apply filters function that calls the API
    const applyFilters = async () => {
        setIsApplyingFilter(true);
        setIsLoading(true);

        try {
            let response;

            // Check if any filters are applied
            const hasFilters =
                statusFilter ||
                departmentFilter ||
                dateFilters.fromDate ||
                dateFilters.toDate;

            if (hasFilters) {
                // Call the filtered API
                response = await getFilteredRequests({
                    userId: role === "Admin" ? null : userId,
                    status: statusFilter || null,
                    department: departmentFilter || null,
                    fromDate: dateFilters.fromDate || null,
                    toDate: dateFilters.toDate || null,
                });
            } else {
                // If no filters, get all data
                if (role === "Admin") {
                    response = await getAdminReqListEmployee();
                } else {
                    response = await getReqListEmployee(userId);
                }
            }

            if (response && response.data) {
                setUsers(response.data.data);
                setFilteredUsers(response.data.data);

                // Update applied filters state
                setAppliedFilters({
                    statusFilter,
                    departmentFilter,
                    dateFilters: { ...dateFilters },
                });

                setCurrentPage(1);
                setShowFilters(false); // Close filter panel after applying
            }
        } catch (error) {
            console.error("Error applying filters:", error);
        } finally {
            setIsApplyingFilter(false);
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    };

    // Search functionality (client-side filtering on already loaded data)
    useEffect(() => {
        let result = [...users];

        if (searchTerm.trim()) {
            result = result.filter((user) => {
                const searchLower = searchTerm.toLowerCase().trim();
                return (
                    user.reqid?.toLowerCase().includes(searchLower) ||
                    user.userName?.toLowerCase().includes(searchLower) ||
                    user.commercials?.department
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    user.commercials?.businessUnit
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    user.commercials?.entity
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    user.procurements?.vendor
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    user.procurements?.vendorName
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    user.status?.toLowerCase().includes(searchLower)
                );
            });
        }

        setFilteredUsers(result);
        setCurrentPage(1);
    }, [searchTerm, users]);

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

    const handleStatusFilterChange = (e) => {
        const newStatus = e.target.value;
        setStatusFilter(newStatus);

        if (!statusesWithDepartments.includes(newStatus)) {
            setDepartmentFilter("");
        }

        setShowDepartmentOptions(statusesWithDepartments.includes(newStatus));
    };

    const handleDepartmentFilterChange = (e) => {
        setDepartmentFilter(e.target.value);
    };

    const clearFilters = () => {
        setDateFilters({
            fromDate: "",
            toDate: "",
        });
        setStatusFilter("");
        setDepartmentFilter("");
        setSearchTerm("");
        setShowDepartmentOptions(false);

        // Reset applied filters and reload all data
        setAppliedFilters({
            statusFilter: "",
            departmentFilter: "",
            dateFilters: {
                fromDate: "",
                toDate: "",
            },
        });

        // Reload all data
        applyFilters();
    };

    const handleCopyReqId = async (reqId, e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(reqId);
            setCopiedReqId(reqId);

            setTimeout(() => {
                setCopiedReqId(null);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy: ", err);

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

    const handleOpenInNewTab = (id, e) => {
        e.stopPropagation();
        const url = `/req-list-table/preview-one-req/${id}`;
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

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleEdit = (e, id) => {
        e.stopPropagation();
        navigate(`/req-list-table/edit-req/${id}`);
    };

    const handleDelete = async (id) => {
        try {
            const response = await deleteReq(id);
            if (response) {
                setUsers(users?.filter((person) => person?._id !== id));
                setFilteredUsers(
                    filteredUsers?.filter((person) => person?._id !== id)
                );
                setIsDelete(false);
            }
        } catch (error) {
            console.error("Error deleting request:", error);
        }
    };

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

    const sendEditMail = async () => {
        try {
            console.log("Sending...");
            const response = await sendReqEditMail(userId, reqId);
            console.log(response);
        } catch (error) {
            console.error("Error sending mail", error);
        }
    };

    const getFilterDisplayText = () => {
        let text = "";
        if (appliedFilters.statusFilter) {
            text += `Status: ${appliedFilters.statusFilter}`;
            if (appliedFilters.departmentFilter) {
                text += ` - ${appliedFilters.departmentFilter}`;
            }
        }
        return text;
    };

    // Check if there are any applied filters for the display banner
    const hasAppliedFilters =
        appliedFilters.statusFilter ||
        appliedFilters.departmentFilter ||
        appliedFilters.dateFilters.fromDate ||
        appliedFilters.dateFilters.toDate;

    return (
        <>
            {isLoading && <LoadingSpinner />}

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

            <div className="p-3 md:p-4 bg-white rounded-lg shadow-sm h-full">
                <div className="mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                        Request List
                    </h2>

                    {hasAppliedFilters && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-blue-800">
                                        Active Filters:
                                    </span>
                                    {appliedFilters.statusFilter && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                            {appliedFilters.statusFilter}
                                            {appliedFilters.departmentFilter &&
                                                ` - ${appliedFilters.departmentFilter}`}
                                        </span>
                                    )}
                                    {(appliedFilters.dateFilters.fromDate ||
                                        appliedFilters.dateFilters.toDate) && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                            Date:{" "}
                                            {appliedFilters.dateFilters
                                                .fromDate || "Any"}{" "}
                                            to{" "}
                                            {appliedFilters.dateFilters
                                                .toDate || "Any"}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    disabled={isApplyingFilter}
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>
                    )}

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
                        <div className="mt-4 w-full md:w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200 absolute right-0 md:right-8 z-20">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    Filters
                                </h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

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
                                    <option value="PO-Pending">
                                        PO-Pending
                                    </option>
                                    <option value="Invoice-Pending">
                                        Invoice-Pending
                                    </option>
                                    <option value="Approved">Approved</option>
                                </select>
                            </div>

                            {statusesWithDepartments.includes(statusFilter) && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Department ({statusFilter})
                                    </h4>
                                    <select
                                        value={departmentFilter}
                                        onChange={handleDepartmentFilterChange}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                    >
                                        <option value="">
                                            All Departments
                                        </option>
                                        {departments.map((dept) => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

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
                                    onClick={applyFilters}
                                    disabled={isApplyingFilter}
                                    className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isApplyingFilter && (
                                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <TableContents
                    filteredUsers={filteredUsers}
                    currentUsers={currentUsers}
                    navigate={navigate}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    handleCopyReqId={handleCopyReqId}
                    handleOpenInNewTab={handleOpenInNewTab}
                    formatCurrency={formatCurrency}
                    Pagination={Pagination}
                    totalPages={totalPages}
                    renderActionColumn={renderActionColumn}
                    handlePageChange={handlePageChange}
                />

                {/* Modal for Edit Request */}
                {isShowModal && (
                    <ShowModal
                        setIsShowModal={setIsShowModal}
                        sendEditMail={sendEditMail}
                    />
                )}

                {/* Modal for Delete Confirmation */}
                {isDelete && (
                    <DeleteModal
                        setIsDelete={setIsDelete}
                        handleDelete={handleDelete}
                        reqId={reqId}
                    />
                )}
            </div>
        </>
    );
};

export default ReqListTable;
