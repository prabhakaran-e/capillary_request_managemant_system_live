import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { addNewUser ,getEmployeeList } from "../../../api/service/adminServices";

const PanelMembers = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    empName: "",
    email: "",
    role: "",
    department: "",
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployeeList();
        setEmployees(response.data || []);
      } catch (err) {
        toast.error("Error fetching employees");
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) {
      setSelectedEmployee(null);
      setSearchResults([]);
      return;
    }

    const results = employees.filter(
      (emp) =>
        emp.employee_id.toLowerCase().includes(value.toLowerCase()) ||
        emp.full_name.toLowerCase().includes(value.toLowerCase())
    );

    setSearchResults(results);
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setFormData((prevData) => ({
      ...prevData,
      employeeId: employee.employee_id,
      empName: employee.full_name,
      email: employee.company_email_id,
      department: employee.department,
      role: "",
    }));
    setSearchTerm(employee.employee_id);
    setSearchResults([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    console.log("Selected employee", formData);
    e.preventDefault();
    try {
      const response = await addNewUser(formData);

      if (response.status === 201) {
        toast.success("Employee added successfully");
        setTimeout(() => {
          navigate("/panel-members-table");
        }, 1500);
      }
    } catch (error) {
      toast.error("Error adding employee");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add User</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-4 border rounded-lg border-primary space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Employee
            </label>
            <input
              name="searchInput"
              value={searchTerm}
              type="text"
              placeholder="Search by Employee ID or Name"
              onChange={handleSearch}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded shadow-lg">
                {searchResults.map((employee) => (
                  <div
                    key={employee._id}
                    onClick={() => handleEmployeeSelect(employee)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {employee.employee_id} - {employee.full_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name
            </label>
            <input
              name="empName"
              type="text"
              placeholder="Employee Name"
              value={formData.empName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              name="department"
              type="text"
              placeholder="Department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select role</option>
              <option value="Admin">Admin</option>
              <option value="Business Finance">Business Finance</option>
              <option value="Vendor Management">Vendor Management</option>
              <option value="Legal Team">Legal Team</option>
              <option value="Info Security">Info Security</option>
              <option value="Head of Finance">Head of Finance</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            SUBMIT
          </button>
        </div>
      </form>
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

export default PanelMembers;
