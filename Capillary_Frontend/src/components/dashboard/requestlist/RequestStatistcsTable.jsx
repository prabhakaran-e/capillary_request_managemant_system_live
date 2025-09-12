import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    deleteReq,
    getApprovedReq,
    getReqListEmployee,
    getAdminReqListEmployee,
    sendReqEditMail,
    getAllCurrencyData,
    bulkApprovalReq,
} from "../../../api/service/adminServices";
import LoadingSpinner from "../../spinner/LoadingSpinner";
import Pagination from "./Pagination";
import * as XLSX from "xlsx";
import { exportAllRequestsToExcel } from "../../../utils/reqExportExel";

const RequestStatistcsTable = () => {
    let { action, fromDate, toDate } = useParams();
    const userId = localStorage.getItem("capEmpId");
    const role = localStorage.getItem("role");
    const department = localStorage.getItem("department");
    const email = localStorage.getItem("email");
    const multiRole = localStorage.getItem("multiRole");
    const [reqId, setReqId] = useState(null);
    const [filterAction, setFilterAction] = useState([]);
    const [newStatus, setNewStatus] = useState("");
    const [showAllData, setShowAllData] = useState(false);
    const [statusFilter, setStatusFilter] = useState("");

    // Bulk approval states
    const [selectedRequests, setSelectedRequests] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isBulkApproving, setIsBulkApproving] = useState(false);

    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isShowModal, setIsShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDelete, setIsDelete] = useState(false);
    const [dateFilters, setDateFilters] = useState({
        fromDate: "",
        toDate: "",
    });
    const [currencies, setCurrencies] = useState([]);
    const [copiedReqId, setCopiedReqId] = useState(null);

    const itemsPerPage = 20;

    // Check if bulk approval functionality should be shown
    const showBulkApproval =
        role === "Business Finance" && action === "Pending-Approvals";

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
        if (action === "Pending-Request") {
            setFilterAction(["Pending", "PO-Pending", "Invoice-Pending"]);
        } else if (action === "Approved-Request") {
            setFilterAction("Approved");
        } else if (action === "Completed-Request") {
            setFilterAction("Approved");
        } else if (action === "Pending-Approvals") {
            setFilterAction("Pending");
        } else if (action === "Approved-Approvals") {
            setNewStatus("Approved-Approvals");
            setFilterAction("Approved");
        } else if (action === "OnHold-Approvals") {
            setFilterAction("Hold");
        } else if (action === "Rejected-Approvals") {
            setFilterAction("Rejected");
        }
    }, [action]);

    // Handle individual checkbox selection
    const handleRequestSelect = (requestId, isChecked) => {
        if (isChecked) {
            setSelectedRequests((prev) => [...prev, requestId]);
        } else {
            setSelectedRequests((prev) =>
                prev.filter((id) => id !== requestId)
            );
        }
    };

    // Handle select all checkbox
    const handleSelectAll = (isChecked) => {
        setSelectAll(isChecked);
        if (isChecked) {
            const allRequestIds = currentUsers.map((user) => user._id);
            setSelectedRequests(allRequestIds);
        } else {
            setSelectedRequests([]);
        }
    };

    // Handle bulk approval
    const handleBulkApproval = async () => {
        if (selectedRequests.length === 0) {
            alert("Please select at least one request to approve.");
            return;
        }

        try {
            setIsBulkApproving(true);
            const response = await bulkApprovalReq(
                userId,
                selectedRequests,
                role
            );

            if (response.status === 200) {
                alert(
                    `${selectedRequests.length} requests approved successfully!`
                );
                // Refresh the table data
                await fetchReqTable(showAllData);
                // Clear selections
                setSelectedRequests([]);
                setSelectAll(false);
            } else {
                alert("Failed to approve requests. Please try again.");
            }
        } catch (error) {
            console.error("Error in bulk approval:", error);
            alert("An error occurred while approving requests.");
        } finally {
            setIsBulkApproving(false);
        }
    };

    // Update useEffect to reset selections when data changes
    useEffect(() => {
        setSelectedRequests([]);
        setSelectAll(false);
    }, [users, filteredUsers, currentPage]);

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const fetchReqTable = async (showAll = false) => {
        setIsLoading(true);
        try {
            let response;

            if (role === "Admin" && department === "Admin") {
                response = await getAdminReqListEmployee();
                console.log("1", response);
                setAllUsers(response.data.data);

                if (showAll || action === "Total-Request") {
                    setUsers(response.data.data);
                } else {
                    const filteredData = response.data.data.filter(
                        (item) => filterAction.includes(item.status) // Check if status is in the array
                    );
                    setUsers(filteredData);
                }
            } else {
                if (role === "Employee") {
                    response = await getReqListEmployee(userId);
                    if (response.status === 200) {
                        setAllUsers(response.data.data);

                        if (showAll) {
                            setUsers(response.data.data);
                        } else {
                            const filteredData = response.data.data.filter(
                                (item) => item.status === filterAction
                            );
                            setUsers(filteredData);
                        }
                    }
                } else {
                    response = await getApprovedReq(userId);
                    console.log("response hod", response);
                    if (response.status === 200) {
                        setAllUsers(response.data.reqData);

                        if (showAll) {
                            setUsers(response.data.reqData);
                        } else if (action === newStatus) {
                            console.log("0");
                            const filteredData = response.data.reqData.filter(
                                (items) =>
                                    items.approvals.some((app) => {
                                        console.log(app.status);
                                        return app.status === filterAction;
                                    })
                            );
                            setUsers(filteredData);
                        } else if (
                            action === "Pending-Approvals" ||
                            action === "OnHold-Approvals" ||
                            action === "Rejected-Approvals"
                        ) {
                            console.log("Inside pending approvals");
                            if (role === "HOD Department" || role === "Admin") {
                                console.log("1");
                                let filteredData;
                                if (action === "OnHold-Approvals") {
                                    filteredData = response.data.reqData.filter(
                                        (items) =>
                                            ["Hold"].includes(
                                                items.firstLevelApproval.status
                                            )
                                    );
                                } else if (action === "Rejected-Approvals") {
                                    filteredData = response.data.reqData.filter(
                                        (items) =>
                                            ["Rejected"].includes(
                                                items.firstLevelApproval.status
                                            )
                                    );
                                } else {
                                    filteredData = response.data.reqData.filter(
                                        (items) =>
                                            [
                                                "Pending",

                                                "PO-Pending",
                                                "Invoice-Pending",
                                            ].includes(
                                                items.firstLevelApproval.status
                                            )
                                    );
                                }

                                setUsers(filteredData);
                                setFilteredUsers(filteredData);
                            } else {
                                console.log("2", response.data.reqData);
                                let filteredByApprovals = [];
                                if (action === "OnHold-Approvals") {
                                    filteredByApprovals =
                                        response.data.reqData.filter(
                                            (items) =>
                                                items.approvals &&
                                                items.approvals.some(
                                                    (app, index, arr) => {
                                                        const isPending =
                                                            app.approvalId ===
                                                                userId &&
                                                            app.status ===
                                                                "Hold";

                                                        const isLatestApproval =
                                                            index ===
                                                            arr.length - 1;

                                                        return (
                                                            isPending &&
                                                            isLatestApproval
                                                        );
                                                    }
                                                )
                                        );
                                } else if (action === "Rejected-Approvals") {
                                    filteredByApprovals =
                                        response.data.reqData.filter(
                                            (items) =>
                                                items.approvals &&
                                                items.approvals.some(
                                                    (app, index, arr) => {
                                                        const isPending =
                                                            app.approvalId ===
                                                                userId &&
                                                            app.status ===
                                                                "Rejected";

                                                        const isLatestApproval =
                                                            index ===
                                                            arr.length - 1;

                                                        return (
                                                            isPending &&
                                                            isLatestApproval
                                                        );
                                                    }
                                                )
                                        );
                                } else {
                                    filteredByApprovals =
                                        response.data.reqData.filter(
                                            (items) =>
                                                items.approvals &&
                                                items.approvals.some(
                                                    (app, index, arr) => {
                                                        const isPending =
                                                            app.nextDepartment ===
                                                                role &&
                                                            app.approvalId !==
                                                                userId &&
                                                            app.status ===
                                                                "Approved";

                                                        const isLatestApproval =
                                                            index ===
                                                            arr.length - 1;

                                                        return (
                                                            isPending &&
                                                            isLatestApproval
                                                        );
                                                    }
                                                )
                                        );
                                }

                                const filteredByHodEmail =
                                    response.data.reqData.filter(
                                        (items) =>
                                            items.firstLevelApproval &&
                                            items.firstLevelApproval
                                                .hodEmail === email &&
                                            ![
                                                "Approved",
                                                "Hold",
                                                "Rejected",
                                            ].includes(
                                                items.firstLevelApproval.status
                                            )
                                    );

                                const combinedData = [
                                    ...filteredByApprovals,
                                    ...filteredByHodEmail,
                                ].filter(
                                    (item, index, self) =>
                                        index ===
                                        self.findIndex(
                                            (t) => t._id === item._id
                                        )
                                );

                                console.log(
                                    "Combined data for pending approvals:",
                                    combinedData
                                );

                                setUsers(combinedData);
                                setFilteredUsers(combinedData);
                            }
                        } else if (action === "Total-Approvals") {
                            console.log("Action-->", response.data.reqData);
                            const filteredData = response.data.reqData;
                            setUsers(filteredData);
                        } else if (action === "My-Approvals") {
                            const filteredData = response.data.reqData.filter(
                                (item) =>
                                    item.approvals.some(
                                        (app) =>
                                            app.approvalId === userId &&
                                            app.status === "Approved"
                                    )
                            );

                            setUsers(filteredData);
                        } else {
                            console.log("else");
                            const filteredData = response.data.reqData.filter(
                                (item) => item.status === "Approved"
                            );
                            setUsers(filteredData);
                        }
                    }
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

    useEffect(() => {
        fetchReqTable(showAllData);
    }, [userId, role, action, filterAction, email, department, showAllData]);
    useEffect(() => {
        let filtered = [...users];

        // Convert route parameters to dates if they exist
        const routeFromDate =
            fromDate && fromDate !== "null" ? new Date(fromDate) : null;
        const routeToDate =
            toDate && toDate !== "null" ? new Date(toDate) : null;

        // Combine route parameters with local date filters
        const finalFromDate =
            routeFromDate ||
            (dateFilters.fromDate ? new Date(dateFilters.fromDate) : null);
        const finalToDate =
            routeToDate ||
            (dateFilters.toDate ? new Date(dateFilters.toDate) : null);

        console.log(
            "Route fromDate:",
            routeFromDate,
            "Route toDate:",
            routeToDate
        );
        console.log(
            "Local fromDate:",
            dateFilters.fromDate,
            "Local toDate:",
            dateFilters.toDate
        );
        console.log(
            "Final fromDate:",
            finalFromDate,
            "Final toDate:",
            finalToDate
        );

        if (finalFromDate || finalToDate) {
            filtered = filtered.filter((user) => {
                const createdDate = user.createdAt
                    ? new Date(user.createdAt)
                    : null;
                if (!createdDate) return false;

                if (finalFromDate && finalToDate) {
                    // Set the time to the end of the day for the toDate
                    const adjustedToDate = new Date(finalToDate);
                    adjustedToDate.setHours(23, 59, 59, 999);

                    return (
                        createdDate >= finalFromDate &&
                        createdDate <= adjustedToDate
                    );
                } else if (finalFromDate) {
                    return createdDate >= finalFromDate;
                } else if (finalToDate) {
                    const adjustedToDate = new Date(finalToDate);
                    adjustedToDate.setHours(23, 59, 59, 999);
                    return createdDate <= adjustedToDate;
                }

                return true;
            });
        }

        // Apply status filter
        if (statusFilter) {
            filtered = filtered.filter((user) => {
                if (user.status === statusFilter) return true;
                if (user.approvals) {
                    return user.approvals.some(
                        (approval) => approval.status === statusFilter
                    );
                }
                if (
                    user.firstLevelApproval &&
                    user.firstLevelApproval.status === statusFilter
                ) {
                    return true;
                }
                return false;
            });
        }

        // Apply search term filter
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((user) => {
                const safeCheck = (obj, path) => {
                    if (!obj) return false;

                    if (typeof obj === "string") {
                        return obj.toLowerCase().includes(term);
                    }

                    if (Array.isArray(obj)) {
                        return obj.some((item) => safeCheck(item, ""));
                    }

                    if (path) {
                        const props = path.split(".");
                        let current = obj;
                        for (const prop of props) {
                            if (current[prop] === undefined) return false;
                            current = current[prop];
                        }
                        return typeof current === "string"
                            ? current.toLowerCase().includes(term)
                            : false;
                    }

                    return Object.values(obj).some((value) => {
                        if (typeof value === "string") {
                            return value.toLowerCase().includes(term);
                        } else if (
                            typeof value === "object" &&
                            value !== null
                        ) {
                            return safeCheck(value, "");
                        }
                        return false;
                    });
                };

                if (user.reqid && user.reqid.toLowerCase().includes(term))
                    return true;
                if (user.userName && user.userName.toLowerCase().includes(term))
                    return true;
                if (user.status && user.status.toLowerCase().includes(term))
                    return true;

                if (safeCheck(user.commercials, "")) return true;
                if (safeCheck(user.procurements, "")) return true;
                if (safeCheck(user.supplies, "")) return true;
                if (safeCheck(user.firstLevelApproval, "")) return true;
                if (safeCheck(user.approvals, "")) return true;

                return (
                    safeCheck(user.commercials, "department") ||
                    safeCheck(user.commercials, "businessUnit") ||
                    safeCheck(user.commercials, "entity") ||
                    safeCheck(user.commercials, "site") ||
                    safeCheck(user.procurements, "vendor") ||
                    safeCheck(user.procurements, "vendorName")
                );
            });
        }

        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [users, searchTerm, dateFilters, statusFilter, fromDate, toDate]);

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

    const handleFilterToggle = (showAll) => {
        fromDate = "";
        toDate = "";
        setShowAllData(showAll);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

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
        setDateFilters({
            fromDate: "",
            toDate: "",
        });
        setSearchTerm("");
        setStatusFilter(""); // Add status filter reset
        setShowFilters(false);
    };

    const handleEdit = async (e, userId) => {
        e.stopPropagation();
        navigate(`/req-list-table/edit-req/${userId}`);
    };

    const handleDateFilterChange = (e) => {
        const { name, value } = e.target;
        setDateFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
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
            <div className="p-3 md:p-8 bg-white rounded-lg shadow-sm h-full">
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
                <div className="mb-4 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                        {`${action.replace(/-/g, " ")}`}
                    </h2>

                    {/* Bulk Approval Controls - Show only for Business finance role with Pending-Approvals action */}
                    {showBulkApproval && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-blue-900">
                                        Bulk Actions:
                                    </span>
                                    <span className="text-sm text-blue-700">
                                        {selectedRequests.length} of{" "}
                                        {currentUsers.length} selected
                                    </span>
                                </div>
                                <button
                                    onClick={handleBulkApproval}
                                    disabled={
                                        selectedRequests.length === 0 ||
                                        isBulkApproving
                                    }
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        selectedRequests.length > 0 &&
                                        !isBulkApproving
                                            ? "bg-green-600 text-white hover:bg-green-700"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    {isBulkApproving
                                        ? "Approving..."
                                        : "Bulk Approve"}
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
                                className={`px-4 py-2 mr-2 rounded-lg text-sm font-medium ${
                                    !showAllData
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                                onClick={() => handleFilterToggle(false)}
                            >
                                {action.replace(/-/g, " ")}
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                    showAllData
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                                onClick={() => handleFilterToggle(true)}
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
                                placeholder="Search by ID, name, or department..."
                                className="w-full pl-10 pr-4 py-2 md:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        <div className="hidden lg:flex items-center gap-4">
                            <button
                                className={`px-4 py-2  rounded-lg text-sm font-medium ${
                                    !showAllData
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                                onClick={() => handleFilterToggle(false)}
                            >
                                {action.replace(/-/g, " ")}
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                    showAllData
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-700"
                                }`}
                                onClick={() => handleFilterToggle(true)}
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
                                            {/* Checkbox column for bulk approval - only show for Business finance role with Pending-Approvals */}
                                            {showBulkApproval && (
                                                <th
                                                    scope="col"
                                                    className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[5%]"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectAll}
                                                        onChange={(e) =>
                                                            handleSelectAll(
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
                                                    />
                                                </th>
                                            )}
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
                                                className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentUsers.length > 0 ? (
                                            currentUsers.map((user, index) => (
                                                <tr
                                                    key={user._id}
                                                    className="hover:bg-gray-100 cursor-pointer"
                                                    onClick={() =>
                                                        navigate(
                                                            `/req-list-table/preview-one-req/${user._id}`
                                                        )
                                                    }
                                                >
                                                    {/* Checkbox column for bulk approval */}
                                                    {showBulkApproval && (
                                                        <td className="px-2 py-2 md:px-6 md:py-4">
                                                            <div
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    const checkbox =
                                                                        e.target.querySelector(
                                                                            'input[type="checkbox"]'
                                                                        ) ||
                                                                        e.target;
                                                                    if (
                                                                        checkbox.type ===
                                                                        "checkbox"
                                                                    ) {
                                                                        handleRequestSelect(
                                                                            user._id,
                                                                            !selectedRequests.includes(
                                                                                user._id
                                                                            )
                                                                        );
                                                                    }
                                                                }}
                                                                className="flex items-center justify-center cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedRequests.includes(
                                                                        user._id
                                                                    )}
                                                                    onChange={() => {}} // Empty onChange to avoid React warnings
                                                                    className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 pointer-events-none"
                                                                />
                                                            </div>
                                                        </td>
                                                    )}
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
                                                    colSpan={
                                                        showBulkApproval
                                                            ? "14"
                                                            : "13"
                                                    }
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

export default RequestStatistcsTable;
