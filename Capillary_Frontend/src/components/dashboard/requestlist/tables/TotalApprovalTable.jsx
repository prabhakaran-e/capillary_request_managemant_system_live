import { useEffect, useState } from "react";
import {
    Edit,
    Trash2,
    Search,
    Download,
    Plus,
    Filter,
    FileText,
    InboxIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    deleteReq,
    getReqListEmployee,
    getAdminReqListEmployee,
} from "../../../api/service/adminServices";
import LoadingSpinner from "../../spinner/LoadingSpinner";
import Pagination from "./Pagination";
import { getAllRequestForPureAdmin } from "../../../../api/service/adminServices";

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


const TotalApprovalTable = () => {
    const userId = localStorage.getItem("capEmpId");
    const department = localStorage.getItem("department");
    const multiRole = localStorage.getItem("multiRole")
    const role = localStorage.getItem("role");
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDelete, setIsDelete] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isShowModal, setIsShowModal] = useState(false);


    const [reqId, setReqId] = useState(null);
    const [dateFilters, setDateFilters] = useState({
        fromDate: "",
        toDate: "",
    });

    const [filteredUsers, setFilteredUsers] = useState([]);
    const itemsPerPage = 10;

    // Update filtered users when search term changes
    useEffect(() => {
        const filtered = users.filter(
            (user) =>
                user.reqid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.userName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                user.commercials?.businessUnit
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
        setCurrentPage(1); // Reset to first page when search changes
    }, [searchTerm, users]);

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

    

    useEffect(() => {
        const fetchReqTable = async () => {
            setIsLoading(true);
            try {
                let response;

                if(role==="Admin" && department==="Admin"){
                    const response  = await getAllRequestForPureAdmin()
                    console.log(response)

                }else {

                }










                // if (role === "Admin" && department === "Admin") {
                //     response = await getAllApprovelRequest();
                //     if (action === "Total-Request") {
                //         setUsers(response.data.data);
                //     } else {
                //         const filteredData = response.data.data.filter(
                //             (item) => filterAction.includes(item.status) 
                //         );
                //         setUsers(filteredData);
                //     }
                // } else {
                //     response = await getReqListEmployee(userId);
                //     if (response.status === 200) {
                //         const filteredData = response.data.data.filter(
                //             (item) => filterAction.includes(item.status) // Check if status is in the array
                //         );
                //         setUsers(filteredData);
                //     }
                // }
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
    const exportToExcel = () => {
        const exportData = filteredUsers.map((user) => ({
            "SL No": user.sno,
            "Request ID": user.reqid,
            "Business Unit": user.commercials?.businessUnit || "NA",
            Entity: user.commercials?.entity,
            Site: user.commercials?.site,
            Vendor: user.procurements?.vendor,
            Amount: formatCurrency(
                user.supplies?.totalValue,
                user.supplies?.selectedCurrency
            ),
            Requestor: user.requestor || "Employee",
            Department: user.commercials?.department,
            Status: user.status || "Pending",
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Requests");
        XLSX.writeFile(wb, "RequestList.xlsx");
    };
    const clearFilters = () => {
        setDateFilters({
            fromDate: "",
            toDate: "",
        });
        setSearchTerm("");
        setShowFilters(false);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
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

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (users.length === 0) {
        return <EmptyState action={action} />;
    }

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
        if (role === "Admin" || role === "Head of Finance"||role === "HOD Department"||multiRole==1) {
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
            <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                    {`${action} List`}
                </h2>

                {/* Mobile View Top Buttons */}
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
                            onClick={exportToExcel}
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

                    {/* Desktop View Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        <button
                            className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </button>
                        <button
                            className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            onClick={exportToExcel}
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
                                Date Range
                            </h3>
                            <button
                                onClick={clearFilters}
                                className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
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
                                    {filteredUsers?.length > 0 ? (
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
                                                        <span className="block font-medium">
                                                            {user.reqid}
                                                        </span>
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

export default TotalApprovalTable;
