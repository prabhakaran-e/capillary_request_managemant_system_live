import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { regNewEmployee } from "../../../api/service/adminServices";

const EmployeeForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    company_email_id: "",
    direct_manager: "",
    direct_manager_email: "",
    hod: "",
    hod_email_id: "",
    department: "",
    business_unit: "",
  });

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
      const response = await regNewEmployee(formData)
       

      if (response.status===201) {
        toast.success("Employee added successfully");
        setTimeout(() => {
          navigate("/employee-list-table");
        }, 1500);
      }
    } catch (error) {
      toast.error("Error adding employee");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Employee</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-4 border rounded-lg border-primary">
          <div>
            <input
              name="employee_id"
              value={formData.employee_id}
              type="text"
              placeholder="Employee ID (CAP-XXXX)"
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary mb-3"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                name="full_name"
                type="text"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <input
                name="company_email_id"
                type="email"
                placeholder="Company Email"
                value={formData.company_email_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <input
                name="direct_manager"
                type="text"
                placeholder="Direct Manager"
                value={formData.direct_manager}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg text-primary mb-2">Management Details</h2>
          <div className="p-4 border rounded-lg border-primary">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  name="direct_manager_email"
                  type="email"
                  placeholder="Manager's Email"
                  value={formData.direct_manager_email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  name="hod"
                  type="text"
                  placeholder="Head of Department"
                  value={formData.hod}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  name="hod_email_id"
                  type="email"
                  placeholder="HOD Email"
                  value={formData.hod_email_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg text-primary mb-2">Department Details</h2>
          <div className="p-4 border rounded-lg border-primary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="department"
                  type="text"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <input
                  name="business_unit"
                  type="text"
                  placeholder="Business Unit"
                  value={formData.business_unit}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
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

export default EmployeeForm;
