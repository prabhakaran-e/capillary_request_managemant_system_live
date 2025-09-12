import { FileText } from "lucide-react";
import React from "react";

const DataTable = ({monthColumns,data,formatCurrency,calculateRowTotal,handleEdit,handleDeleteClick}) => {
  return (
    <div className="p-6">
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse border border-gray-300"
          style={{ minWidth: "1900px" }}
        >
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-24">
                FY Start
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-24">
                FY End
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-32">
                PO Number
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-48">
                Vendor Name
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-40">
                PO Description
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-32">
                Computation
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-28">
                PO Value
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20">
                Currency
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-24">
                Start Date
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-24">
                End Date
              </th>
              {monthColumns.map((month) => (
                <th
                  key={month}
                  className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-700 uppercase w-20"
                >
                  {month.replace("-", " ").toUpperCase()}
                </th>
              ))}
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-24 bg-yellow-50">
                Total
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {row.fyStart}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {row.fyEnd}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {row.poNumber}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {row.vendorName}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {row.poDescription}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {row.computation}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {row.poValue}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {row.currency}
                  </span>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {row.poStartDate}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {row.poEndDate}
                </td>
                {monthColumns.map((month) => {
                  const monthData = row.monthlyData?.[month];
                  const amount =
                    typeof monthData === "object"
                      ? monthData.amount
                      : monthData;
                  const currency =
                    typeof monthData === "object"
                      ? monthData.currency
                      : row.currency;

                  return (
                    <td
                      key={month}
                      className="border border-gray-300 px-2 py-2 text-sm text-right"
                    >
                      {amount && amount !== "0"
                        ? formatCurrency(amount, currency)
                        : "-"}
                    </td>
                  );
                })}
                <td className="border border-gray-300 px-3 py-2 text-sm font-semibold text-right bg-yellow-50">
                  {formatCurrency(
                    calculateRowTotal(row.monthlyData),
                    row.currency
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(row)}
                      className="px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(row)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            No data available. Add new entries to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default DataTable;
