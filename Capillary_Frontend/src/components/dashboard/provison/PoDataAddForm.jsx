import React from "react";
import { Search } from "lucide-react";

const PoDataAddForm = ({
  formData,
  handleInputChange,
  currencies,
  monthlyEntries,
  updateMonthlyEntry,
  months,
  years,
  addMonthlyEntry,
  removeMonthlyEntry,
  setShowForm,
  setEditingId,
  resetForm,
  handleSubmit,
  editingId,
  searchMode,
  setSearchMode,
  searchQuery,
  setSearchQuery,
  onSearch,
  onAutoCalculate,
}) => {
  return (
    <div className="p-6 border-b border-gray-200 bg-gray-50">
      <h3 className="text-lg font-semibold mb-6">
        {editingId ? "Edit Entry" : "Add New Entry"}
      </h3>

      {/* Basic Information Section */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FY Start <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fyStart"
              value={formData.fyStart}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FY End <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fyEnd"
              value={formData.fyEnd}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PO Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="poNumber"
              value={formData.poNumber}
              onChange={handleInputChange}
              placeholder="Enter PO Number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            
            {/* Search Tabs and Input - Integrated below PO Number */}
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Quick Search
              </label>
              
              {/* Tab Buttons */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setSearchMode("po")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    searchMode === "po"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  PO Number
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("req")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    searchMode === "req"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  Request ID
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("invoice")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    searchMode === "invoice"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  Invoice Number
                </button>
              </div>

              {/* Search Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        onSearch && onSearch(searchQuery, searchMode);
                      }
                    }}
                    placeholder={
                      searchMode === "po"
                        ? "Enter PO Number"
                        : searchMode === "req"
                        ? "Enter Request ID"
                        : "Enter Invoice Number"
                    }
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={() => onSearch && onSearch(searchQuery, searchMode)}
                  disabled={!searchQuery.trim()}
                  className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Additional Details Section */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-700 mb-4">
          Additional Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PO Description
            </label>
            <input
              type="text"
              name="poDescription"
              value={formData.poDescription}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Computation
            </label>
            <input
              type="text"
              name="computation"
              value={formData.computation}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PO Value
            </label>
            <input
              type="number"
              name="poValue"
              value={formData.poValue}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PO Start Date
            </label>
            <input
              type="date"
              name="poStartDate"
              value={formData.poStartDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PO End Date
            </label>
            <input
              type="date"
              name="poEndDate"
              value={formData.poEndDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Monthly Values Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold text-gray-700">
            Monthly Amounts
          </h4>
          <button
            type="button"
            onClick={() => onAutoCalculate && onAutoCalculate()}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            Auto-calculate Monthly Amounts
          </button>
        </div>

        <div className="space-y-3">
          {monthlyEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Month
                </label>
                <select
                  value={entry.month}
                  onChange={(e) =>
                    updateMonthlyEntry(index, "month", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Month</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Year
                </label>
                <select
                  value={entry.year}
                  onChange={(e) =>
                    updateMonthlyEntry(index, "year", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={entry.amount}
                  onChange={(e) =>
                    updateMonthlyEntry(index, "amount", e.target.value)
                  }
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Currency
                </label>
                <select
                  value={entry.currency}
                  onChange={(e) =>
                    updateMonthlyEntry(index, "currency", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                {index === monthlyEntries.length - 1 ? (
                  <button
                    type="button"
                    onClick={addMonthlyEntry}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add More
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeMonthlyEntry(index)}
                    disabled={monthlyEntries.length === 1}
                    className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setEditingId(null);
            resetForm();
          }}
          className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {editingId ? "Update Entry" : "Add Entry"}
        </button>
      </div>
    </div>
  );
};

export default PoDataAddForm;