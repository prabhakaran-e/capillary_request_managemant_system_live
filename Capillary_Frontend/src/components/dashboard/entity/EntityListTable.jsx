import { useEffect, useState } from "react";
import { Edit, Trash2, Search, Download, Plus, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  deleteEntity,
  getAllEntityData,
} from "../../../api/service/adminServices";
import Pagination from "./Pagination";
import * as XLSX from "xlsx";

const EntityListTable = () => {
  const empId = localStorage.getItem("userId")

  const navigate = useNavigate();

  // State management
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [entity, setEntity] = useState([]);
  const [filteredEntities, setFilteredEntities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const itemsPerPage = 10;

  // Fetch data
  useEffect(() => {
    const fetchAllEntity = async () => {
      const response = await getAllEntityData(empId);
      console.log(response);
      if (response.status === 200) {
        setEntity(response.data.entities);
        setFilteredEntities(response.data.entities);
      }
    };
    fetchAllEntity();
  }, []);

  // Search and filter logic
  useEffect(() => {
    let result = [...entity];

    // Search filter
    if (searchTerm) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Type filter
    if (selectedType) {
      result = result.filter((item) => item.type === selectedType);
    }

    // Status filter
    if (selectedStatus) {
      result = result.filter((item) => item.status === selectedStatus);
    }

    setFilteredEntities(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedType, selectedStatus, entity]);

  // Delete handler
  const onDelete = async (id) => {
    try {
      const response = await deleteEntity(id);
      if (response.status === 200) {
        setEntity(entity?.filter((entity) => entity?._id !== id));
        setFilteredEntities(
          filteredEntities?.filter((entity) => entity?._id !== id)
        );
      }
    } catch (err) {
      console.log("Error in delete entity", err);
    }
  };

  // Excel export handler
  const handleExport = () => {
    const workbook = XLSX.utils.book_new();
    const filteredData = filteredEntities.map((item) => ({
      "Entity Name": item.entityName,
      Currency: item.currency,
      Address: item.addressLine,
      Type: item.type,
      "Tax ID": item.taxId,
      "Invoice Mail": item.invoiceMailId,
      "PO Mail": item.poMailId,
      Status: item.status,
      PoSVOK: item.PoSVOK,
    }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Entities");
    XLSX.writeFile(workbook, "entity_list.xlsx");
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredEntities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntities = filteredEntities.slice(startIndex, endIndex);

  // Get unique types and statuses for filters
  const types = [...new Set(entity.map((item) => item.type))];
  const statuses = [...new Set(entity.map((item) => item.status))];

  return (
    <div className="p-4 md:p-8 bg-white rounded-lg shadow-sm h-full">
    <div className="mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Entity List</h2>

      {/* Mobile Add Entity Button - Full Width */}
      <div className="block md:hidden mb-4">
        <button
          className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
          onClick={() => navigate("/entity-list-table/entities")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entity
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
            placeholder="Search entities..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Action Buttons - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <button
              className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="">All Types</option>
                      {types.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="">All Statuses</option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>

          <button
            className="inline-flex items-center px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            onClick={() => navigate("/entity-list-table/entities")}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entity
          </button>
        </div>

        {/* Mobile Action Buttons Row */}
        <div className="flex md:hidden items-center gap-2 w-full">
          <div className="relative flex-1">
            <button
              className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="">All Types</option>
                      {types.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="">All Statuses</option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
      </div>
    </div>

    {/* Responsive Table with Horizontal Scroll on Mobile */}
    <div className="border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary">
                <tr>
                  <th className="sticky top-0 px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Sno
                  </th>
                  <th className="sticky top-0 px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    EntityName
                  </th>
                  <th className="sticky top-0 px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="sticky top-0 px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    AddressLine
                  </th>
                  <th className="sticky top-0 px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Type
                  </th>
                  <th className="sticky top-0 px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Tax Id
                  </th>
                  <th className="sticky top-0 px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Invoice Mail Id
                  </th>
                  <th className="sticky top-0 px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Po MailId
                  </th>
                  <th className="sticky top-0 px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    SPOC
                  </th>
                  <th className="sticky top-0 px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="sticky top-0 px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEntities.map((entities, index) => (
                  <tr key={entities._id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm font-medium text-gray-900">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                      {entities.entityName}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                      {entities.currency}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                      {entities.addressLine}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                      {entities.type}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                      {entities.taxId}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                      {entities.invoiceMailId}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                      {entities.poMailId}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                      {entities.PoSVOK}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                      {entities.status}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                      <div className="flex space-x-3 md:space-x-4">
                        <button
                          className="text-primary hover:text-primary/80"
                          onClick={() =>
                            navigate(
                              `/entity-list-table/edit-entities/${entities._id}`
                            )
                          }
                        >
                          <Edit className="h-4 md:h-5 w-4 md:w-5" />
                        </button>
                        <button
                          onClick={() => onDelete(entities._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 md:h-5 w-4 md:w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    {/* Pagination */}
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      handlePageChange={setCurrentPage}
      itemsPerPage={itemsPerPage}
      totalItems={filteredEntities.length}
    />
  </div>
  );
};

export default EntityListTable;
