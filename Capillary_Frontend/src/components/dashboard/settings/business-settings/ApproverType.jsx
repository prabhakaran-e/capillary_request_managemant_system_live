import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  checkDarwinStatus,
  getAllApprovalData,
  uploadCSVFile,
  updateDarwinStatus,
  addNewApprover,
  editApprover,
  deleteApproverData,
} from "../../../../api/service/adminServices";

const ApproverManagement = () => {
  const [isDarwinEnabled, setIsDarwinEnabled] = useState(false);
  const [approvalData, setApprovalData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteData, setDeleteData] = useState(null);
  const [newApprover, setNewApprover] = useState({
    businessUnit: "",
    department: "",
    approverName: "",
    approverId: "",
    approverEmail: "",
    role: "Approver",
  });

  const [importedFile, setImportedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // New state for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approverToDelete, setApproverToDelete] = useState(null);

  // New state for edit mode
  const [editMode, setEditMode] = useState(false);
  const [approverToEdit, setApproverToEdit] = useState(null);

  const itemsPerPage = 5;

  // Filter data based on search query
  const filteredData = approvalData.filter((entry) =>
    entry.approvers.some((approver) => {
      const searchString = searchQuery.toLowerCase();
      return (
        approver.approverName.toLowerCase().includes(searchString) ||
        approver.approverId.toLowerCase().includes(searchString) ||
        entry.departmentName.toLowerCase().includes(searchString)
      );
    })
  );

  // Create flattened and paginated data
  const flattenedData = filteredData.flatMap((entry) =>
    entry.approvers.map((approver) => ({
      businessUnit: entry.businessUnit,
      departmentName: entry.departmentName,
      ...approver,
    }))
  );

  const totalPages = Math.ceil(flattenedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = flattenedData.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const darwinResponse = await checkDarwinStatus();
        if (darwinResponse.status === 200) {
          setIsDarwinEnabled(darwinResponse.data.status);
        }

        const response = await getAllApprovalData();
        const flattenedData = response.data.approvalData.flatMap((bu) =>
          bu.departments.map((dept) => ({
            businessUnit: bu.businessUnit,
            departmentName: dept.name,
            approvers: dept.approvers.map((approver) => ({
              ...approver,
              role: approver.role || "Approver",
            })),
          }))
        );
        setApprovalData(flattenedData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleToggleChange = async () => {
    try {
      const response = await updateDarwinStatus();
      setIsDarwinEnabled(response.data.enabled);
    } catch (error) {
      console.error("Error toggling Darwin status:", error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImportedFile(file);
      setShowModal(true);
    }
  };

  const handleFileUpload = async () => {
    if (!importedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", importedFile);

      const response = await uploadCSVFile(formData);

      if (response.status === 200) {
        const updatedData = await getAllApprovalData();
        const flattenedData = updatedData.data.approvalData.flatMap((bu) =>
          bu.departments.map((dept) => ({
            businessUnit: bu.businessUnit,
            departmentName: dept.name,
            approvers: dept.approvers,
          }))
        );
        setApprovalData(flattenedData);
        setShowModal(false);
        setImportedFile(null);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddApprover = async (e) => {
    e.preventDefault();

    // Convert business unit to uppercase
    const formattedApprover = {
      ...newApprover,
      businessUnit: newApprover.businessUnit.toUpperCase(),
    };

    if (editMode && approverToEdit) {
      // Display all data in console when editing
      console.log("Editing approver - Full data:", {
        originalData: approverToEdit,
        newData: formattedApprover,
      });

      // Update the approvalData state with edited values
      setApprovalData((prev) =>
        prev.map((entry) => {
          if (
            entry.businessUnit === approverToEdit.originalBusinessUnit &&
            entry.departmentName === approverToEdit.originalDepartmentName
          ) {
            return {
              ...entry,
              businessUnit: formattedApprover.businessUnit,
              departmentName: formattedApprover.department,
              approvers: entry.approvers.map((approver) => {
                if (approver.approverId === approverToEdit.originalApproverId) {
                  return {
                    approverId: formattedApprover.approverId,
                    approverName: formattedApprover.approverName,
                    approverEmail: formattedApprover.approverEmail,
                    role: formattedApprover.role || "Approver",
                  };
                }
                return approver;
              }),
            };
          }
          return entry;
        })
      );

      try {
        // Call API to update the approver
        await editApprover({
          originalData: {
            businessUnit: approverToEdit.originalBusinessUnit,
            departmentName: approverToEdit.originalDepartmentName,
            approverId: approverToEdit.originalApproverId,
          },
          newData: {
            businessUnit: formattedApprover.businessUnit,
            departmentName: formattedApprover.department,
            approverName: formattedApprover.approverName,
            approverId: formattedApprover.approverId,
            approverEmail: formattedApprover.approverEmail,
            role: formattedApprover.role,
          },
        });
      } catch (error) {
        console.error("Error updating approver:", error);
      }

      // Reset form and exit edit mode
      setEditMode(false);
      setApproverToEdit(null);
    } else {
      // Handle add new approver
      console.log("Adding new approver:", formattedApprover);

      const newEntry = {
        businessUnit: formattedApprover.businessUnit,
        departmentName: formattedApprover.department,
        approvers: [
          {
            approverId: formattedApprover.approverId,
            approverName: formattedApprover.approverName,
            approverEmail: formattedApprover.approverEmail,
            role: formattedApprover.role || "Approver",
          },
        ],
      };

      setApprovalData((prev) => [newEntry, ...prev]);

      try {
        const response = await addNewApprover(newEntry);
        console.log("Add approver response:", response);
      } catch (error) {
        console.error("Error adding approver:", error);
      }
    }

    // Reset form state
    setNewApprover({
      businessUnit: "",
      department: "",
      approverName: "",
      approverId: "",
      approverEmail: "",
      role: "Approver",
    });
  };

  const handleEditClick = (item) => {
    // Display all data in console when clicking edit
    console.log("Editing approver - Current data:", item);

    setEditMode(true);
    setApproverToEdit({
      originalBusinessUnit: item.businessUnit,
      originalDepartmentName: item.departmentName,
      originalApproverId: item.approverId,
    });
    setNewApprover({
      businessUnit: item.businessUnit,
      department: item.departmentName,
      approverName: item.approverName,
      approverId: item.approverId,
      approverEmail: item.approverEmail,
      role: item.role || "Approver",
    });
  };

  const handleDeleteClick = async (
    businessUnit,
    departmentName,
    approverId
  ) => {
    // Find the full approver object to delete
    const approverData = flattenedData.find(
      (item) =>
        item.businessUnit === businessUnit &&
        item.departmentName === departmentName &&
        item.approverId === approverId
    );

    // Display all data in console when clicking delete
    console.log("Deleting approver - Full data:", approverData);
    setDeleteData(approverData);

    setApproverToDelete({ businessUnit, departmentName, approverId });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!approverToDelete) return;

    const { businessUnit, departmentName, approverId } = approverToDelete;

    const response = await deleteApproverData(deleteData);

    // Log complete information about the approver being deleted
    console.log("Confirming deletion of approver:", {
      businessUnit,
      departmentName,
      approverId,
      // Find the full data of the approver being deleted
      fullData: flattenedData.find(
        (item) =>
          item.businessUnit === businessUnit &&
          item.departmentName === departmentName &&
          item.approverId === approverId
      ),
    });

    // Update state to remove the approver
    setApprovalData((prev) =>
      prev
        .map((entry) => {
          if (
            entry.businessUnit === businessUnit &&
            entry.departmentName === departmentName
          ) {
            return {
              ...entry,
              approvers: entry.approvers.filter(
                (approver) => approver.approverId !== approverId
              ),
            };
          }
          return entry;
        })
        .filter((entry) => entry.approvers.length > 0)
    );

    // Here you would typically call an API to delete the approver
    try {
      // Example API call (commented out as it wasn't in the original code)
      // await deleteApprover({ businessUnit, departmentName, approverId });
      console.log("Approver successfully deleted from UI state");
    } catch (error) {
      console.error("Error deleting approver:", error);
    }

    // Close modal and reset state
    setShowDeleteModal(false);
    setApproverToDelete(null);
  };

  const handleCancelEdit = () => {
    console.log("Edit canceled");
    setEditMode(false);
    setApproverToEdit(null);
    setNewApprover({
      businessUnit: "",
      department: "",
      approverName: "",
      approverId: "",
      approverEmail: "",
      role: "Approver",
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
      {/* Toggle Switch */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="mr-4">Darwin</span>
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isDarwinEnabled}
              onChange={handleToggleChange}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="ml-4">Custom</span>
        </div>
      </div>

      {isDarwinEnabled && (
        <>
          {/* File Upload Section */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Approver Management</h2>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="excel-upload"
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer px-4 py-2 border border-primary text-primary rounded-md hover:bg-gray-50"
              >
                Choose Excel File
              </label>
              {importedFile && !showModal && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {importedFile.name}
                  </span>
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  >
                    Upload
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search by name, ID, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-8 border rounded-md"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* CSV Upload Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">
                  CSV Format Requirements
                </h3>
                <p className="mb-4">
                  Your CSV file must include the following columns:
                </p>
                <ul className="list-disc ml-6 mb-4">
                  <li>businessUnit</li>
                  <li>departments</li>
                  <li>approverId</li>
                  <li>approverName</li>
                  <li>approverEmail</li>
                </ul>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setImportedFile(null);
                    }}
                    className="px-4 py-2 border rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Confirm & Upload"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                <p className="mb-4">
                  Are you sure you want to delete this approver? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Approver Form */}
          <form
            onSubmit={handleAddApprover}
            className="grid grid-cols-6 gap-4 mb-6"
          >
            <input
              type="text"
              placeholder="Business Unit"
              value={newApprover.businessUnit}
              onChange={(e) =>
                setNewApprover((prev) => ({
                  ...prev,
                  businessUnit: e.target.value,
                }))
              }
              className="p-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Department"
              value={newApprover.department}
              onChange={(e) =>
                setNewApprover((prev) => ({
                  ...prev,
                  department: e.target.value,
                }))
              }
              className="p-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Approver Name"
              value={newApprover.approverName}
              onChange={(e) =>
                setNewApprover((prev) => ({
                  ...prev,
                  approverName: e.target.value,
                }))
              }
              className="p-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Approver ID"
              value={newApprover.approverId}
              onChange={(e) =>
                setNewApprover((prev) => ({
                  ...prev,
                  approverId: e.target.value,
                }))
              }
              className="p-2 border rounded-md"
              required
            />
            <input
              type="email"
              placeholder="Approver Email"
              value={newApprover.approverEmail}
              onChange={(e) =>
                setNewApprover((prev) => ({
                  ...prev,
                  approverEmail: e.target.value,
                }))
              }
              className="p-2 border rounded-md"
              required
            />

            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-primary text-white p-2 rounded-md hover:bg-primary/90"
              >
                {editMode ? "Update " : "Add Approver"}
              </button>

              {editMode && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-200 text-gray-800 p-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Approver Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left border">S.No</th>
                  <th className="p-3 text-left border">Business Unit</th>
                  <th className="p-3 text-left border">Department</th>
                  <th className="p-3 text-left border">Approver Name</th>
                  <th className="p-3 text-left border">Approver ID</th>
                  <th className="p-3 text-left border">Approver Email</th>
                  <th className="p-3 text-left border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr
                    key={`${item.approverId}-${index}`}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-3 border">{startIndex + index + 1}</td>
                    <td className="p-3 border">{item.businessUnit}</td>
                    <td className="p-3 border">{item.departmentName}</td>
                    <td className="p-3 border">{item.approverName}</td>
                    <td className="p-3 border">{item.approverId}</td>
                    <td className="p-3 border">{item.approverEmail}</td>
                    <td className="p-3 border">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleDeleteClick(
                              item.businessUnit,
                              item.departmentName,
                              item.approverId
                            )
                          }
                          className="text-red-600 hover:text-red-800 px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleEditClick(item)}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, flattenedData.length)} of{" "}
              {flattenedData.length} entries
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  // Show first and last page
                  // Show current page and one page before and after
                  const shouldShow =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                  if (shouldShow) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded-md ${
                          currentPage === pageNum
                            ? "bg-primary text-white"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }

                  // Show ellipsis for gaps
                  if (
                    (pageNum === currentPage - 2 && pageNum > 2) ||
                    (pageNum === currentPage + 2 && pageNum < totalPages - 1)
                  ) {
                    return (
                      <span key={pageNum} className="px-2">
                        ...
                      </span>
                    );
                  }

                  return null;
                }
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ApproverManagement;
