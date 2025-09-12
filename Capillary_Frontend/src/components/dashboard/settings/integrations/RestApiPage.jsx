// Fix for the employee selection and form submission issues
import React, { useEffect, useState, useRef } from "react";
import { Copy, Search, ChevronDown, Eye, EyeOff } from "lucide-react";
import {
  generateApiCrediantial,
  getAllApiData,
  getEmployeeDataForApi,
  updateApiCredentialValidity,
} from "../../../../api/service/adminServices";

const Toast = ({ message, type, onClose }) => (
  <div
    className="fixed top-20 right-4 py-2 px-4 rounded-md shadow-lg z-50 text-white"
    style={{
      backgroundColor: type === "success" ? "#10b981" : "#ef4444",
      animation: "slideIn 0.5s ease-out",
    }}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200 focus:outline-none"
      >
        ×
      </button>
    </div>
  </div>
);

const RestApiPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [apiCredentials, setApiCredentials] = useState([]);
  const [newGeneratedCredential, setNewGeneratedCredential] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecretKeys, setShowSecretKeys] = useState({});
  const dropdownRef = useRef(null);



  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-hide new credentials after 30 seconds
  useEffect(() => {
    if (newGeneratedCredential) {
      const timer = setTimeout(() => {
        setNewGeneratedCredential(null);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [newGeneratedCredential]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch employees data
        const employeeResponse = await getEmployeeDataForApi();
        if (employeeResponse.status === 200) {
          const employeeData = employeeResponse.data.empData || [];
          setUsers(employeeData);
          setFilteredUsers(employeeData);
        } else {
          showToast("Failed to fetch employees", "error");
        }

        // Fetch API credentials
        const apiResponse = await getAllApiData();
        if (apiResponse.status === 200) {
          const formattedData = apiResponse.data.formattedData || [];

          const transformedCredentials = formattedData.map((item) => ({
            id: item._id,
            apiKey: item.apiKey,
            secretKey: item.secretKey,
            purpose: item.purpose,
            valid: item.valid,
            employeeDetails: {
              employeeId: item.employeeId,
              full_name: item.full_name,
              company_email_id: item.email,
            },
            createdAt: new Date(item.createdAt).toLocaleString(),
          }));

          setApiCredentials(transformedCredentials);
        } else {
          showToast("Failed to fetch API credentials", "error");
        }
      } catch (error) {
        showToast("Failed to fetch data", "error");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEmployeeSearch = (term) => {
    setEmployeeSearchTerm(term);
    if (term.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.employeeId?.toLowerCase().includes(term.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(term.toLowerCase()) ||
          user.company_email_id?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleEmployeeSelect = (user) => {
    console.log("Employee selected:", user); // Debug log
    setSelectedEmployee(user.employee_id);
    setSelectedEmployeeData(user);
    setEmployeeSearchTerm(`${user.full_name} (${user.company_email_id})`);
    setIsDropdownOpen(false);
  };

  const showToast = (message, type = "success") => {
    setToast(null);
    setTimeout(() => {
      setToast({ message, type });
    }, 100);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!");
    } catch (error) {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  const handleGenerateApiCredentials = async (e) => {
    e.preventDefault();
    console.log(
      "Form submitted - Employee:",
      selectedEmployee,
      "Purpose:",
      purpose
    );

    if (!selectedEmployee) {
      showToast("Please select an employee", "error");
      return;
    }

    if (!purpose.trim()) {
      showToast("Please enter a purpose", "error");
      return;
    }

    setLoading(true);
    try {
      const employeeDetails =
        selectedEmployeeData ||
        users.find((user) => user.employee_id === selectedEmployee);

      if (!employeeDetails) {
        showToast("Employee details not found", "error");
        setLoading(false);
        return;
      }

      const response = await generateApiCrediantial({
        employeeId: selectedEmployee,
        purpose: purpose,
        employeeDetails: employeeDetails,
      });

      if (response.status === 201) {
        const newCredential = {
          id: response.data.id,
          employeeId: selectedEmployee,
          apiKey: response.data.password,
          secretKey: response.data.secretKey,
          purpose: purpose,
          valid: response.data.valid,
          employeeDetails: employeeDetails,
          createdAt: new Date().toLocaleString(),
        };

        setNewGeneratedCredential(newCredential);

        setApiCredentials((prevCredentials) => [
          newCredential,
          ...prevCredentials,
        ]);

        setSelectedEmployee("");
        setSelectedEmployeeData(null);
        setEmployeeSearchTerm("");
        setPurpose("");
        showToast("API Credentials generated successfully!");
      } else {
        showToast(
          response.data.message || "Failed to generate credentials",
          "error"
        );
      }
    } catch (error) {
      showToast(error.message || "Failed to generate credentials", "error");
      console.error("Error generating credentials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCredentials = async (credentialId) => {
    try {
      const currentCredential = apiCredentials.find(
        (cred) => cred.id === credentialId
      );
      const valid = !currentCredential.valid;

      const response = await updateApiCredentialValidity(credentialId, valid);

      if (response.status === 200) {
        const updatedCredentials = apiCredentials.map((cred) =>
          cred.id === credentialId ? { ...cred, valid: !cred.valid } : cred
        );
        setApiCredentials(updatedCredentials);

        showToast(
          `Credential ${
            !currentCredential.valid ? "enabled" : "disabled"
          } successfully`
        );
      } else {
        showToast("Failed to update credential status", "error");
      }
    } catch (error) {
      showToast("Error updating credential status", "error");
      console.error(error);
    }
  };

  const toggleCredentialVisibility = (id) => {
    setShowSecretKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredCredentials = apiCredentials.filter((cred) => {
    if (!tableSearchTerm.trim()) return true;

    const searchTerm = tableSearchTerm.toLowerCase();
    return (
      cred.employeeDetails?.full_name?.toLowerCase().includes(searchTerm) ||
      cred.employeeDetails?.company_email_id
        ?.toLowerCase()
        .includes(searchTerm) ||
      cred.purpose?.toLowerCase().includes(searchTerm) ||
      cred.apiKey?.toLowerCase().includes(searchTerm) ||
      cred.secretKey?.toLowerCase().includes(searchTerm)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCredentials = filteredCredentials.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="fixed top-16 right-0 p-4 z-50">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>

      <div className="container mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-primary">
            Generate API Credentials
          </h1>

          <form onSubmit={handleGenerateApiCredentials} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium mb-1">
                  Select Employee
                </label>
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Employees"
                      value={employeeSearchTerm}
                      onChange={(e) => {
                        handleEmployeeSearch(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onClick={() => setIsDropdownOpen(true)}
                      className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>

                  {isDropdownOpen && (
                    <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border rounded-lg shadow-lg mt-1">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <li
                            key={user.employeeId}
                            onClick={() => handleEmployeeSelect(user)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-gray-500">
                              {user.employeeId} - {user.company_email_id}
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-2 text-gray-500">
                          No employees found
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Purpose of API
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Enter purpose of API"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {newGeneratedCredential && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Generated Token</h3>
                  <div className="text-sm text-gray-500">
                    Will disappear in 30 seconds
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      API Key
                    </label>
                    <div className="flex items-center bg-white border rounded-lg">
                      <input
                        type={showSecretKeys["newApi"] ? "text" : "password"}
                        value={newGeneratedCredential.apiKey}
                        readOnly
                        className="flex-grow px-3 py-2 bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => toggleCredentialVisibility("newApi")}
                        className="p-2 text-gray-600 hover:bg-gray-100"
                      >
                        {showSecretKeys["newApi"] ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(newGeneratedCredential.apiKey)
                        }
                        className="p-2 text-primary hover:bg-gray-100"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Secret Key
                    </label>
                    <div className="flex items-center bg-white border rounded-lg">
                      <input
                        type={showSecretKeys["newSecret"] ? "text" : "password"}
                        value={newGeneratedCredential.secretKey}
                        readOnly
                        className="flex-grow px-3 py-2 bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => toggleCredentialVisibility("newSecret")}
                        className="p-2 text-gray-600 hover:bg-gray-100"
                      >
                        {showSecretKeys["newSecret"] ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(newGeneratedCredential.secretKey)
                        }
                        className="p-2 text-primary hover:bg-gray-100"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-auto bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 mt-4 text-sm flex items-center"
            >
              {loading ? "Generating..." : "Generate Credentials"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="mb-4 flex flex-col md:flex-row md:items-center">
            <div className="relative flex-grow mr-0 md:mr-2 mb-2 md:mb-0">
              <input
                type="text"
                placeholder="Search API Credentials"
                value={tableSearchTerm}
                onChange={(e) => {
                  setTableSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">SL</th>
                      <th className="p-3 text-left">Employee</th>
                      <th className="p-3 text-left">Purpose</th>
                      <th className="p-3 text-left">API Key</th>
                      <th className="p-3 text-left">Secret Key</th>
                      <th className="p-3 text-left">Created At</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCredentials.length > 0 ? (
                      currentCredentials.map((cred, index) => (
                        <tr key={cred.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-3">
                            <div className="font-medium">
                              {cred.employeeDetails?.full_name || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {cred.employeeDetails?.company_email_id || "N/A"}
                            </div>
                          </td>
                          <td className="p-3">{cred.purpose || "N/A"}</td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <span className="mr-2 truncate max-w-[100px] md:max-w-[150px]">
                                {showSecretKeys[`api-${cred.id}`]
                                  ? cred.apiKey
                                  : "••••••••••••••••"}
                              </span>
                              <button
                                onClick={() =>
                                  toggleCredentialVisibility(`api-${cred.id}`)
                                }
                                className="text-gray-600 hover:text-gray-800 mr-1"
                              >
                                {showSecretKeys[`api-${cred.id}`] ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(cred.apiKey)}
                                className="text-primary hover:text-primary/80"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <span className="mr-2 truncate max-w-[100px] md:max-w-[150px]">
                                {showSecretKeys[`secret-${cred.id}`]
                                  ? cred.secretKey
                                  : "••••••••••••••••"}
                              </span>
                              <button
                                onClick={() =>
                                  toggleCredentialVisibility(
                                    `secret-${cred.id}`
                                  )
                                }
                                className="text-gray-600 hover:text-gray-800 mr-1"
                              >
                                {showSecretKeys[`secret-${cred.id}`] ? (
                                  <EyeOff size={16} />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => copyToClipboard(cred.secretKey)}
                                className="text-primary hover:text-primary/80"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </td>
                          <td className="p-3">{cred.createdAt}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                cred.valid
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {cred.valid ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleRevokeCredentials(cred.id)}
                              className={`py-1 px-2 rounded text-xs ${
                                cred.valid
                                  ? "bg-red-500 text-white hover:bg-red-600"
                                  : "bg-green-500 text-white hover:bg-green-600"
                              }`}
                            >
                              {cred.valid ? "Disable" : "Enable"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="p-4 text-center text-gray-500"
                        >
                          {tableSearchTerm
                            ? "No matching credentials found"
                            : "No credentials available"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredCredentials.length > itemsPerPage && (
                <div className="flex justify-center mt-4">
                  <nav>
                    <ul className="flex flex-wrap space-x-1">
                      {Array.from({
                        length: Math.ceil(
                          filteredCredentials.length / itemsPerPage
                        ),
                      }).map((_, index) => (
                        <li key={index}>
                          <button
                            onClick={() => paginate(index + 1)}
                            className={`px-3 py-1 rounded ${
                              currentPage === index + 1
                                ? "bg-primary text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {index + 1}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestApiPage;
