import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Search,
  Download,
  Plus,
  Filter,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  deleteReq,
  getAdminReqListEmployee,
  getReqListEmployee,
} from "../../../api/service/adminServices";
import Pagination from "./Pagination";
import * as XLSX from 'xlsx';

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

const AllRequestList = () => {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  console.log(role)
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchReqTable = async () => {
      try {
        let response;
        if (role === "Admin") {
          response = await getAdminReqListEmployee();
        } else {
          response = await getReqListEmployee(userId);
          
        }
        console.log("Response",response)
        if (response && response.data) {
          setUsers(response.data.data);
          setFilteredUsers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchReqTable();
  }, [userId, role]);

  useEffect(() => {
    let result = [...users];

    if (searchTerm) {
      result = result.filter((user) =>
        Object.values(user).some((value) => {
          if (typeof value === 'object' && value !== null) {
            return Object.values(value).some(v => 
              String(v).toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    if (selectedDepartment) {
      result = result.filter(
        (user) => user.commercials?.department === selectedDepartment
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment, users]);

  const formatCurrency = (value, currencyCode) => {
    if (!value) return 'N/A';
    const currency = currencies.find(c => c.code === currencyCode);
    if (!currency) return value;
    
    try {
      return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return value;
    }
  };

  const departments = [...new Set(users.map(user => user.commercials?.department).filter(Boolean))];

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

  const exportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      'SL No': user.sno,
      'Request ID': user.reqid,
      'Business Unit': user.commercials?.businessUnit || 'NA',
      'Entity': user.commercials?.entity,
      'Site': user.commercials?.site,
      'Vendor': user.procurements?.vendor,
      'Amount': formatCurrency(user.supplies?.totalValue, user.supplies?.selectedCurrency),
      'Requestor': user.requestor || 'Employee',
      'Department': user.commercials?.department,
      'Status': user.status || 'Pending'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Requests");
    XLSX.writeFile(wb, "RequestList.xlsx");
  };

  const onDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const response = await deleteReq(id);
      if (response) {
        setUsers(users?.filter((person) => person?._id !== id));
        setFilteredUsers(filteredUsers?.filter((person) => person?._id !== id));
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const onEdit = (e, user) => {
    e.stopPropagation();
    navigate(`/req-list-table/edit-req/${user._id}`);
  };

  const renderActionColumn = (user) => {
    if (role === "Employee") {
      return (
        <td className="px-6 py-4 text-sm text-gray-500 text-center">
          <button
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary"
            onClick={(e) => e.stopPropagation()}
          >
            Request Edit
          </button>
        </td>
      );
    } else {
      return (
        <td
          className="px-6 py-4 text-sm text-gray-500 flex items-center justify-center space-x-2 mt-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={(e) => onEdit(e, user)}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={(e) => onDelete(e, user._id)}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </td>
      );
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Request List</h2>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search requests..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-4">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <button 
              onClick={exportToExcel}
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
      </div>

      <div className="border border-gray-200 rounded-lg">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary">
                  <tr>
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      SL No
                    </th>
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      ReqId
                    </th>
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      Business Unit
                    </th>
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      Entity
                    </th>
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      Site
                    </th>
                    
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      Vendor
                    </th>
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      Amount
                    </th>
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      Requestor
                    </th>
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      Department
                    </th>
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      Status
                    </th>
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      PO Document
                    </th>
                    <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                      Actions
                    </th>
                    
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/req-list-table/preview-one-req/${user._id}`)}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.reqid}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {user.commercials?.businessUnit || "NA"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {user.commercials?.entity}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.commercials?.site}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.procurements?.vendor}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                        {formatCurrency(user.supplies?.totalValue, user.supplies?.selectedCurrency)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.requestor || "Employee"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.commercials?.department}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.status || "Pending"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.status === "Approved" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/req-list-table/invoice/${user._id}`);
                              }}
                              className="flex items-center text-blue-500 hover:text-blue-700"
                            >
                              <FileText className="h-5 w-5 mr-2" />
                              View PO
                            </button>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        {renderActionColumn(user)}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="px-6 py-4 text-center text-gray-500">
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredUsers.length}
        />
      </div>
    </div>
  );
};

export default AllRequestList;