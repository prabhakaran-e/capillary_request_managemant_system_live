import { X } from "lucide-react";
import { useState } from "react";

const FilterComponent = ({ isOpen, onClose, departments, hods, onFilter }) => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedHod, setSelectedHod] = useState("");

  const handleApplyFilter = () => {
    onFilter({ department: selectedDepartment, hod: selectedHod });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Filters</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HOD
            </label>
            <select
              value={selectedHod}
              onChange={(e) => setSelectedHod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All HODs</option>
              {hods.map((hod) => (
                <option key={hod} value={hod}>
                  {hod}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleApplyFilter}
            className="w-full bg-primary text-white rounded-md py-2 text-sm font-medium hover:bg-primary/90"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};



export default FilterComponent;