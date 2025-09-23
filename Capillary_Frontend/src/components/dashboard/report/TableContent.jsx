import React from "react";

const TableContent = ({ tableData, formatCurrencyValue }) => {
  // Calculate summary totals
  const summaryData = tableData.reduce(
    (acc, row) => {
      acc.totalRequests += row.totalRequests || 0;
      acc.approvedRequests += row.approvedRequests || 0;
      acc.rejectedRequests += row.rejectedRequests || 0;
      acc.pendingRequests += row.pendingRequests || 0;
      acc.holdRequests += row.holdRequests || 0;
      return acc;
    },
    {
      totalRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      pendingRequests: 0,
      holdRequests: 0,
    }
  );

  // Summary cards data
  const summaryCards = [
    {
      title: "Total Requests",
      count: summaryData.totalRequests,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
    },
    {
      title: "Approved Requests",
      count: summaryData.approvedRequests,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200",
      iconColor: "text-green-500",
    },
    {
      title: "Pending Requests",
      count: summaryData.pendingRequests,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-500",
    },
    {
      title: "Hold Requests",
      count: summaryData.holdRequests,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      borderColor: "border-orange-200",
      iconColor: "text-orange-500",
    },
    {
      title: "Rejected Requests",
      count: summaryData.rejectedRequests,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} ${card.borderColor} border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium ${card.textColor} mb-1`}>
                  {card.title}
                </h3>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.count.toLocaleString()}
                </p>
              </div>
              <div className={`${card.iconColor}`}>
                {/* Different icons for different card types */}
                {card.title === "Total Requests" && (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                )}
                {card.title === "Approved Requests" && (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {card.title === "Pending Requests" && (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {card.title === "Hold Requests" && (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {card.title === "Rejected Requests" && (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Add this div wrapper for horizontal scrolling */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            {" "}
            {/* min-w-max ensures the table doesn't shrink */}
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SL
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Requests
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rejected
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hold
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Funds
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rejected Funds
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hold Funds
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pending Funds
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved Funds
                </th>
                {/* Add flow analysis columns for special departments */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approved Flows
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hold Flows
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rejected Flows
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Department
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{row._id?.entity || "N/A"}</td>
                  <td className="px-4 py-3">{row._id?.department || "N/A"}</td>
                  <td className="px-4 py-3">{row.totalRequests || 0}</td>
                  <td className="px-4 py-3">{row.approvedRequests || 0}</td>
                  <td className="px-4 py-3">{row.rejectedRequests || 0}</td>
                  <td className="px-4 py-3">{row.pendingRequests || 0}</td>
                  <td className="px-4 py-3">{row.holdRequests || 0}</td>
                  <td className="px-4 py-3">{row._id?.currency || "N/A"}</td>
                  <td className="px-4 py-3">
                    {formatCurrencyValue(row.totalFund, row._id?.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrencyValue(row.rejectedFund, row._id?.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrencyValue(row.holdFund, row._id?.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrencyValue(row.pendingFund, row._id?.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrencyValue(row.approvedFund, row._id?.currency)}
                  </td>
                  {/* Flow analysis columns - only show for special departments */}
                  <td className="px-4 py-3">
                    {row.approvedToApprovedFlows !== undefined
                      ? row.approvedToApprovedFlows
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {row.approvedToHoldFlows !== undefined
                      ? row.approvedToHoldFlows
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {row.approvedToRejectedFlows !== undefined
                      ? row.approvedToRejectedFlows
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {row.successRate !== undefined
                      ? `${row.successRate.toFixed(1)}%`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{row.nextDepartment || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TableContent;
