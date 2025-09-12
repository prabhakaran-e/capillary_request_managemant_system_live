import React from "react";

const PoDataAddForm = ({formData,handleInputChange,currencies,monthlyEntries,updateMonthlyEntry,months,years,addMonthlyEntry,removeMonthlyEntry,setShowForm,setEditingId,resetForm,handleSubmit,editingId}) => {
  return (
    <div className="p-6 border-b border-gray-200 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">
        {editingId ? "Edit Entry" : "Add New Entry"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            FY Start *
          </label>
          <input
            type="text"
            name="fyStart"
            value={formData.fyStart}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="2024-25"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            FY End *
          </label>
          <input
            type="text"
            name="fyEnd"
            value={formData.fyEnd}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="2025-26"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PO Number *
          </label>
          <input
            type="text"
            name="poNumber"
            value={formData.poNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor Name *
          </label>
          <input
            type="text"
            name="vendorName"
            value={formData.vendorName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PO Description
          </label>
          <input
            type="text"
            name="poDescription"
            value={formData.poDescription}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code}
              </option>
            ))}
          </select>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Monthly Values */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-md font-medium text-gray-700">
              Monthly Amounts
            </h4>
          </div>

          <div className="space-y-3">
            {monthlyEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end p-3 border border-gray-200 rounded-lg bg-white"
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
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                      onClick={addMonthlyEntry}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                      Add More
                    </button>
                  ) : (
                    <button
                      onClick={() => removeMonthlyEntry(index)}
                      disabled={monthlyEntries.length === 1}
                      className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Action Buttons - Right Side */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
        <button
          onClick={() => {
            setShowForm(false);
            setEditingId(null);
            resetForm();
          }}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
        >
          {editingId ? "Update Entry" : "Add Entry"}
        </button>
      </div>
    </div>
  );
};

export default PoDataAddForm;
