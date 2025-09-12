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
  deleteEmployee,
  getEmployeeList,
  getSyncEmployeeTable,
} from "../../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";
import Pagination from "./Pagination";
import FilterComponent from "./FilterComponent";

const EmployeeListTable = () => {
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
    syncStatus: ""
  });

  const itemsPerPage = 20;

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await getEmployeeList();
      setEmployees(response.data);
      setFilteredEmployees(response.data);

      // Set sync states based on employee data
      const initialSyncStates = response.data.reduce((acc, employee) => {
        acc[employee.employee_id] = employee.sync;
        return acc;
      }, {});
      setEmployeeSyncStates(initialSyncStates);

      // Initialize syncOffEmployee with employees that have sync set to false
      const initialSyncOffEmployees = response.data
        .filter(employee => !employee.sync)
        .map(employee => employee.employee_id);
      setSyncOffEmployee(initialSyncOffEmployees);
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
        ["full_name", "employee_id", "department"].some((key) =>
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
    if (activeFilters.syncStatus !== "") {
      const syncValue = activeFilters.syncStatus === "true";
      result = result.filter((employee) => employeeSyncStates[employee.employee_id] === syncValue);
    }

    setFilteredEmployees(result);
    setCurrentPage(1);
  }, [searchTerm, activeFilters, employees, employeeSyncStates]);

  const handleDelete = async (id) => {
    const response = await deleteEmployee(id);
    if (response.status === 200) {
      setEmployees(employees?.filter((person) => person?._id !== id));
      toast.success(response.data.message);
    } else {
      toast.error(response.data.message);
    }
  };

  const syncEmpData = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      console.log("Not sync data", syncOffEmployee);
      const response = await getSyncEmployeeTable(syncOffEmployee);
      if (response.status === 200) {
        toast.success(response.data.message);
        await fetchEmployees();
      }
    } catch (err) {
      toast.error("Failed to sync employee data");
    } finally {
      setIsSyncing(false);
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

  const handleIndividualSyncToggle = (employeeId) => {
    setEmployeeSyncStates((prevStates) => {
      const newStates = {
        ...prevStates,
        [employeeId]: !prevStates[employeeId],
      };

      // Update syncOffEmployee based on the new states
      const employeesWithSyncOff = Object.keys(newStates).filter(
        (id) => !newStates[id]
      );
      setSyncOffEmployee(employeesWithSyncOff);

      return newStates;
    });
  };

  const handleFilter = (filters) => {
    setActiveFilters(filters);
  };

  return (
    <div className="p-4 md:p-8 bg-white rounded-lg shadow-sm h-full">
    <div className="mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Employee List</h2>

      {/* Mobile Add Employee Button - Full Width */}
      <div className="block md:hidden mb-4">
        <button
          className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
          onClick={() => navigate("/employee-list-table/employee-reg")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-4 md:gap-6">
        {/* Search Bar */}
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

        {/* Desktop Action Buttons - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-4">
          <button
            className={`inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium ${
              isSyncing
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "text-gray-700 bg-white hover:bg-gray-50"
            }`}
            onClick={syncEmpData}
            disabled={isSyncing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync"}
          </button>

          <div className="relative">
            <button
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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

          <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          
          <button
            className="inline-flex items-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            onClick={() => navigate("/employee-list-table/employee-reg")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        </div>

        {/* Mobile Action Buttons - Displayed as a row */}
        <div className="flex md:hidden items-center w-full gap-2">
          <button
            className={`flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium ${
              isSyncing
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "text-gray-700 bg-white hover:bg-gray-50"
            }`}
            onClick={syncEmpData}
            disabled={isSyncing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Sync" : "Sync"}
          </button>

          <div className="relative flex-1">
            <button
              className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4 mr-1" />
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

          <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
      </div>
    </div>

    <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-primary">
            <tr>
              {[
                "SNO",
                "Employee",
                "Sync",
                "Bus_Unit",
                "Head Of Department",
                "Direct Manager",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="sticky top-0 px-3 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentEmployees?.map((employee, index) => (
              <tr
                key={employee._id}
                className="hover:bg-blue-50 transition duration-200 ease-in-out"
              >
                <td className="px-3 md:px-6 py-3 md:py-4 text-sm text-gray-700">
                  {index + 1}
                </td>

                <td className="px-3 md:px-6 py-3 md:py-4">
                  <div className="space-y-1">
                    <span className="block font-semibold text-gray-900">
                      {employee.employee_id || "NA"}
                    </span>
                    <span className="block font-medium text-gray-800">
                      {employee.full_name || "NA"}
                    </span>
                    <span className="block text-xs md:text-sm text-gray-500">
                      {employee.company_email_id || "NA"}
                    </span>
                    <span className="block text-xs md:text-sm text-gray-500">
                      {employee.department || "NA"}
                    </span>
                  </div>
                </td>

                <td className="px-3 md:px-6 py-3 md:py-4">
                  <div className="flex items-center">
                    {employeeSyncStates[employee.employee_id] ? (
                      <ToggleRight
                        className="h-6 w-6 md:h-8 md:w-8 text-green-500 hover:text-green-600 cursor-pointer transition"
                        onClick={() =>
                          handleIndividualSyncToggle(employee.employee_id)
                        }
                      />
                    ) : (
                      <ToggleLeft
                        className="h-6 w-6 md:h-8 md:w-8 text-gray-400 hover:text-gray-500 cursor-pointer transition"
                        onClick={() =>
                          handleIndividualSyncToggle(employee.employee_id)
                        }
                      />
                    )}
                  </div>
                </td>

                <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">
                  {employee.business_unit}
                </td>

                <td className="px-3 md:px-6 py-3 md:py-4">
                  <div className="space-y-1">
                    <span className="block font-semibold text-gray-900">
                      {employee.hod || "NA"}
                    </span>
                    <span className="block text-xs md:text-sm text-gray-500">
                      {employee.hod_email_id || "NA"}
                    </span>
                  </div>
                </td>

                <td className="px-3 md:px-6 py-3 md:py-4">
                  <div className="space-y-1">
                    <span className="block font-semibold text-gray-900">
                      {employee.direct_manager || "NA"}
                    </span>
                    <span className="block text-xs md:text-sm text-gray-500">
                      {employee.direct_manager_email || "NA"}
                    </span>
                  </div>
                </td>

                <td className="px-3 md:px-6 py-3 md:py-4">
                  <div className="flex space-x-3 md:space-x-4">
                    <button
                      className="text-primary hover:text-blue-800 transition"
                      onClick={() =>
                        navigate(
                          `/employee-list-table/edit-employee/${employee._id}`
                        )
                      }
                    >
                      <Edit className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export default EmployeeListTable;