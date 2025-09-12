import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Search,
  Download,
  Plus,
  Filter,
  RefreshCw,
  X,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  deletePanelEmployee,
  getPanelMenberData,
  getSyncEmployeeTable,
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";
import Pagination from "./Pagination";
import FilterComponent from "./FilterComponent";

const PanelMemberTable = () => {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [employeeSyncStates, setEmployeeSyncStates] = useState({});
  const [syncOffEmployee, setSyncOffEmployee] = useState([]);

  const [activeFilters, setActiveFilters] = useState({
    department: "",
    hod: "",
  });

  const itemsPerPage = 20;

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await getPanelMenberData();
      setEmployees(response.data);
      setFilteredEmployees(response.data);

      // Set default sync state to true for all employees
      const defaultSyncStates = response.data.reduce((acc, employee) => {
        acc[employee.employee_id] = true;
        return acc;
      }, {});
      setEmployeeSyncStates(defaultSyncStates);
    } catch (err) {
      toast.error("Error fetching employees");
      console.error("Error fetching employees:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    let result = [...employees];

    if (searchTerm) {
      result = result.filter((employee) =>
        ["full_name", "employee._id", "department"].some((key) =>
          String(employee[key] || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    if (activeFilters.department) {
      result = result.filter(
        (employee) => employee.department === activeFilters.department
      );
    }
    if (activeFilters.hod) {
      result = result.filter((employee) => employee.hod === activeFilters.hod);
    }

    setFilteredEmployees(result);
    setCurrentPage(1);
  }, [searchTerm, activeFilters, employees]);

  const handleDelete = async (id) => {
    const response = await deletePanelEmployee(id);
    if (response.status === 200) {
      setEmployees(employees?.filter((person) => person?._id !== id));
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  const departments = [...new Set(employees.map((emp) => emp.department))];
  const hods = [...new Set(employees.map((emp) => emp.hod))];

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedUsers([]);
    }
  };

  const handleFilter = (filters) => {
    setActiveFilters(filters);
  };

  return (
    <div className="p-4 md:p-8 bg-white rounded-lg shadow-sm h-full">
      <div className="mb-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Employee List</h2>

        {/* Controls row - stacked on mobile, all inline on desktop */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 space-y-3 md:space-y-0">
          {/* Search bar - full width on mobile, flex-grow on desktop */}
          <div className="relative flex-1 w-full md:min-w-[300px] md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Filter button - full width on mobile, auto on desktop */}
          <div className="relative">
            <button
              className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>

            <FilterComponent
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              departments={departments}
              hods={hods}
              onFilter={handleFilter}
            />
          </div>

          {/* Export button - full width on mobile, auto on desktop */}
          <button className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>

          {/* Add User button - full width on mobile, auto on desktop */}
          <button
            className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            onClick={() => navigate("/panel-members-table/add-panel-members")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Table container with responsive overflow handling */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary">
              <tr>
                {["SL NO", "User Name", "Department", "Role", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="sticky top-0 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentEmployees?.map((employee, index) => (
                <tr
                  key={employee._id}
                  className="hover:bg-blue-50 transition duration-200 ease-in-out"
                >
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="block font-semibold text-gray-900">
                        {employee.employee_id || "NA"}
                      </span>
                      <span className="block font-medium text-gray-800">
                        {employee.full_name || "NA"}
                      </span>
                      <span className="block text-sm text-gray-500">
                        {employee.company_email_id || "NA"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {employee.department}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {employee.role}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex space-x-4">
                      <button
                        className="text-primary hover:text-blue-800 transition"
                        onClick={() =>
                          navigate(
                            `/panel-members-table/edit-panel-members/${employee._id}`
                          )
                        }
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="text-red-600 hover:text-red-800 transition"
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

        {/* Pagination component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={filteredEmployees.length}
        />
      </div>
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

export default PanelMemberTable;
