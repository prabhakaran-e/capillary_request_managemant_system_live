// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   generateEmployeeUniqueId,
//   getAllEntityData,
//   regNewEmployee,
// } from "../../../api/service/adminServices";
// import { toast, ToastContainer } from "react-toastify";

// const EditEmployee = () => {
//   const navigate = useNavigate();

//   const { id } = useParams();

 
//   const [isDateInput, setIsDateInput] = useState(false);
//   const [isStartTimeInput, setIsStartTimeInput] = useState(false);
//   const [isEndTimeInput, setIsEndTimeInput] = useState(false);

//   const [formData, setFormData] = useState({
//     empId: "",
//     name: "",
//     contact: "",
//     email: "",
//     dob: "",
//     dateOfJoining: "",
//     gender: "",
//     role: "",
//     entity: "",
//     reportingTo: "",
//     location: "",
//     workType: "",
//     department: "",
//     pincode: "",
//     city: "",
//     state: "",
//     addressLine: "",
//     area: "",
//     landmark: "",
//     startTime: "",
//     endTime: "",
//   });

//   useEffect(() => {
//     const fetchEmpId = async () => {
//       console.log("generating id");
  
//       const response = await generateEmployeeUniqueId();
//       console.log(response);
//       if (response.status === 200) {
//         setFormData((prev) => ({
//           ...prev,
//           empId: response?.data?.empId,
//         }));
//       }
//     };
  
//     fetchEmpId();
//   }, []);

//   useEffect(() => {
//     const fetchEntity = async () => {
//       const response = await getAllEntityData();
//       console.log("response entity", response);
//     };
//     fetchEntity();
//   }, []);
  

//   const fetchCityState = async () => {
//     if (!formData.pincode) {
//       alert("Please enter a valid pincode.");
//       return;
//     }

//     try {
//       const response = await axios.get(
//         `https://api.postalpincode.in/pincode/${formData.pincode}`
//       );

//       if (response.data && response.data[0].Status === "Success") {
//         const { District, State } = response.data[0].PostOffice[0];
//         setFormData(prevData => ({
//           ...prevData,
//           city: District,
//           state: State
//         }));
//       } else {
//         alert("Invalid pincode or data not found!");
//       }
//     } catch (error) {
//       console.error("Error fetching city and state:", error);
//       alert("Failed to fetch city and state. Please try again later.");
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prevData => ({
//       ...prevData,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     console.log("Employee Data:", formData);
//     const response = await regNewEmployee(formData);
//     console.log(response);
//     if (response.status === 201) {
//       toast.success(response.data.message)
//       setTimeout(() => {
        
//         navigate("/employee-list-table");
//       }, 1500);
//     }
//   };



//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-6">
//       <div>
//         <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Employee</h2>
//       </div>
//       <form onSubmit={handleSubmit}>
//         <div className="p-4 border rounded-lg border-primary">
//           <div>
//             <input
//               name="empid"
//               value={formData.empId}
//               type="text"
//               placeholder="Employee ID"
//               readOnly
//               className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary mb-3"
//             />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <input
//                 name="name"
//                 type="text"
//                 placeholder="Name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//             <div>
//               <input
//                 name="contact"
//                 type="text"
//                 placeholder="Contact"
//                 value={formData.contact}
//                 onChange={handleInputChange}
//                 className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//             <div>
//               <input
//                 name="email"
//                 type="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//             <div>
//               <select
//                 name="gender"
//                 className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                 value={formData.gender}
//                 onChange={handleInputChange}
//               >
//                 <option value="">Gender</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>
//             <div className="relative">
//               {isDateInput ? (
//                 <input
//                   type="date"
//                   name="dob"
//                   value={formData.dob}
//                   onChange={handleInputChange}
//                   onBlur={() => !formData.dob && setIsDateInput(false)}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               ) : (
//                 <input
//                   type="text"
//                   value={formData.dob}
//                   placeholder="Date of Birth"
//                   readOnly
//                   onFocus={() => setIsDateInput(true)}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
//                 />
//               )}
//             </div>
//             <div className="relative">
//               {isDateInput ? (
//                 <input
//                   type="date"
//                   name="dateOfJoining"
//                   value={formData.dateOfJoining}
//                   onChange={handleInputChange}
//                   onBlur={() => !formData.dateOfJoining && setIsDateInput(false)}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               ) : (
//                 <input
//                   type="text"
//                   value={formData.dateOfJoining}
//                   placeholder="Date of Joining"
//                   readOnly
//                   onFocus={() => setIsDateInput(true)}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
//                 />
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Entity Section */}
//         <div className="mt-6">
//           <h2 className="text-lg text-primary mb-2">Entity</h2>
//           <div className="p-4 border rounded-lg border-primary">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div>
//                 <input
//                   name="role"
//                   type="text"
//                   placeholder="Role"
//                   value={formData.role}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               </div>
//               <div>
//                 <input
//                   name="department"
//                   type="text"
//                   placeholder="Department"
//                   value={formData.department}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               </div>
//               <div>
//                 <input
//                   name="reportingTo"
//                   type="text"
//                   placeholder="Reporting To"
//                   value={formData.reportingTo}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               </div>
//               <div>
//                 <select
//                   name="entity"
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                   value={formData.entity}
//                   onChange={handleInputChange}
//                 >
//                   <option value="">Entity</option>
//                   {/* Add entity options here */}
//                 </select>
//               </div>
//             </div>

//             {/* Second Row */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//               <div>
//                 <input
//                   name="location"
//                   type="text"
//                   placeholder="Location"
//                   value={formData.location}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               </div>
//               <div>
//                 <select
//                   name="workType"
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                   value={formData.workType}
//                   onChange={handleInputChange}
//                 >
//                   <option value="">Work Type</option>
//                   <option value="full-time">Full Time</option>
//                   <option value="part-time">Part Time</option>
//                   <option value="contract">Contract</option>
//                 </select>
//               </div>
//               <div>
//                 <div className="flex space-x-5">
             
//                   {isStartTimeInput ? (
//                     <input
//                       type="time"
//                       name="startTime"
//                       value={formData.startTime}
//                       onChange={handleInputChange}
//                       onBlur={() => !formData.startTime && setIsStartTimeInput(false)}
//                       className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                     />
//                   ) : (
//                     <input
//                       type="text"
//                       placeholder="Start Time"
//                       readOnly
//                       value={formData.startTime}
//                       onFocus={() => setIsStartTimeInput(true)}
//                       className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
//                     />
//                   )}
//                   <span className="text-gray-600 self-center">to</span>
//                   {/* End Time Input */}
//                   {isEndTimeInput ? (
//                     <input
//                       type="time"
//                       name="endTime"
//                       value={formData.endTime}
//                       onChange={handleInputChange}
//                       onBlur={() => !formData.endTime && setIsEndTimeInput(false)}
//                       className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                     />
//                   ) : (
//                     <input
//                       type="text"
//                       placeholder="End Time"
//                       readOnly
//                       value={formData.endTime}
//                       onFocus={() => setIsEndTimeInput(true)}
//                       className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
//                     />
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Address Details Section */}
//         <div className="mt-6">
//           <h2 className="text-lg text-primary mb-2">Address Details</h2>
//           <div className="p-4 border rounded-lg border-primary">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div>
//                 <input
//                   name="pincode"
//                   type="text"
//                   placeholder="Pincode"
//                   value={formData.pincode}
//                   onChange={handleInputChange}
//                   onBlur={fetchCityState}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               </div>
//               <div>
//                 <input
//                   name="city"
//                   type="text"
//                   placeholder="City"
//                   value={formData.city}
//                   readOnly
//                   className="w-full p-2 border rounded bg-gray-100"
//                 />
//               </div>
//               <div>
//                 <input
//                   name="state"
//                   type="text"
//                   placeholder="State"
//                   value={formData.state}
//                   readOnly
//                   className="w-full p-2 border rounded bg-gray-100"
//                 />
//               </div>
//               <div>
//                 <input
//                   name="addressLine"
//                   type="text"
//                   placeholder="Address Line"
//                   value={formData.addressLine}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               </div>
//               <div>
//                 <input
//                   name="area"
//                   type="text"
//                   placeholder="Area"
//                   value={formData.area}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               </div>
//               <div>
//                 <input
//                   name="landmark"
//                   type="text"
//                   placeholder="Landmark"
//                   value={formData.landmark}
//                   onChange={handleInputChange}
//                   className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end mt-6">
//           <button
//             type="submit"
//             className="px-6 py-2 bg-primary text-white rounded hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
//           >
//             SUBMIT
//           </button>
//         </div>
//       </form>
//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//         pauseOnFocusLoss
//       />
//     </div>
//   );
// };

// export default EditEmployee;




import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Search,
  Download,
  Plus,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  deleteEmployee,
  getEmployeeList,
  getSyncEmployeeTable,
} from "../../../api/service/adminServices";
import { toast } from "react-toastify";
import Pagination from "./Pagination";

const EmployeeListTable = () => {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await getEmployeeList();
      setEmployees(response.data);
    } catch (err) {
      toast.error("Error fetching employees");
      console.error("Error fetching employees:", err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

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
    try {
      const response = await getSyncEmployeeTable();
      console.log(response);
    } catch (err) {
      console.log("Error in sync the empl Data", err);
    }
  };



  // Get visible page numbers
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedUsers([]); 
    }
  };


  const paginationButtonStyle =
    "flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors duration-200";
  const paginationActiveStyle = "bg-primary text-white hover:bg-primary/90";
  const paginationInactiveStyle = "text-gray-500 hover:bg-gray-100";
  const paginationDisabledStyle =
    "text-gray-300 cursor-not-allowed hover:bg-transparent";

  return (
    <div className="p-8 bg-white rounded-lg shadow-sm h-full">

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Employee List</h2>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="relative flex-1 min-w-[300px] max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={syncEmpData}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Sync
            </button>
            <button className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
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
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary">
              <tr>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  SL NO
                </th>

                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Employee ID
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Full Name
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Company Email
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Direct Manager
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Manager Email
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  HOD
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  HOD Email
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Department
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Business Unit
                </th>
                <th className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEmployees?.map((employee, index) => (
                <tr key={employee.employee_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.employee_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.full_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.company_email_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.direct_manager}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.direct_manager_email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.hod}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.hod_email_id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {employee.business_unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex space-x-4">
                      <button
                        className="text-primary hover:text-primary/80"
                        onClick={() =>
                          navigate(
                            `/employee-list-table/edit-employee/${employee._id}`
                          )
                        }
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="text-red-600 hover:text-red-800"
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

        {/* New Professional Pagination Layout */}
        <Pagination employees={employees} handlePageChange={handlePageChange} />
   
      </div>
    </div>
  );
};

export default EmployeeListTable;
