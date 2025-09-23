import { Copy, ExternalLink } from "lucide-react";
import React from "react";

const TableContent = ({currentUsers,navigate,handleCopyReqId,handleOpenInNewTab,formatCurrency,renderActionColumn,searchTerm,dateFilters,startIndex }) => {
  return (
    <div className="border border-gray-200 rounded-lg w-full">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-primary">
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[5%]"
                  >
                    SNo
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
                  >
                    ReqId
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%]"
                  >
                    Business Unit
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%]"
                  >
                    Vendor
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[8%]"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/approval-request-list/preview-one-req/${user._id}`
                        )
                      }
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="block font-medium">
                              {user.reqid}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => handleCopyReqId(user.reqid, e)}
                                className="text-gray-400 hover:text-blue-500 transition-colors"
                                title="Copy Request ID"
                              >
                                <Copy className="h-3 w-3 md:h-4 md:w-4" />
                              </button>
                              <button
                                onClick={(e) => handleOpenInNewTab(user._id, e)}
                                className="text-gray-400 hover:text-green-500 transition-colors"
                                title="Open in new tab"
                              >
                                <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                              </button>
                            </div>
                          </div>
                          <span className="block font-medium">
                            {user.userName || "Employee"}
                          </span>
                          <span className="block">
                            {user.commercials?.department}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          <span className="block font-medium">
                            {user.commercials?.businessUnit || "NA"}
                          </span>
                          <span className="block font-medium">
                            {user.commercials?.entity || "NA"}
                          </span>
                          <span className="block">
                            {user.commercials?.site || "NA"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          <span className="block font-medium">
                            {user.procurements?.vendor}
                          </span>
                          <span className="block">
                            {user.procurements?.vendorName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatCurrency(
                          user.supplies?.totalValue,
                          user.supplies?.selectedCurrency
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.isCompleted ? (
                          <>
                            {user.status !== "Approved" && (
                              <>
                                {user.nextDepartment || user.cDepartment} <br />
                                {" : "}
                              </>
                            )}
                            {user.status || "Pending"}
                          </>
                        ) : (
                          <span className="text-red-500">Draft</span>
                        )}
                      </td>
                      {renderActionColumn(user)}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {searchTerm || dateFilters.fromDate || dateFilters.toDate
                        ? "No matching results found."
                        : "No data available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableContent;
