import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  getIndividualEmployee,
  addNewUser,
} from "../../../api/service/adminServices";

const EditPanelmembers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: "",
    empName: "",
    email: "",
    role: "",
    department: "",
  });

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await getIndividualEmployee(id);
        const employee = response.data;
        
        setFormData({
          employeeId: employee.employee_id,
          empName: employee.full_name,
          email: employee.company_email_id,
          department: employee.department,
          role: employee.role || "Admin", // Default to empty if no role
        });
      } catch (err) {
        toast.error("Error fetching employee details");
        console.error("Error fetching employee details:", err);
      }
    };
    
    fetchEmployeeDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addNewUser(formData);

      if (response.status === 200) {
        toast.success(response.data.message);
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID
            </label>
            <input
              name="employeeId"
              type="text"
              value={formData.employeeId}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee Name
            </label>
            <input
              name="empName"
              type="text"
              value={formData.empName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              name="department"
              type="text"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
              <option value="Vendor Management">Vendor Management</option>
              <option value="Business Finance">Business Finance</option>
              <option value="Legal Team">Legal Team</option>
              <option value="Info Security">Info Security</option>
              <option value="Head of Finance">Head Of Finance</option>
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

export default EditPanelmembers;