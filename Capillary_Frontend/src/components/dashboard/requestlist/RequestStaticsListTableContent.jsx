import { Copy, ExternalLink } from "lucide-react";
import React from "react";

const RequestStaticsListTableContent = ({showBulkApproval,handleSelectAll,selectAll,currentUsers,navigate,handleRequestSelect,handleCopyReqId,handleOpenInNewTab,formatCurrency,renderActionColumn,Pagination,currentPage,totalPages,handlePageChange,itemsPerPage,filteredUsers,selectedRequests  }) => {
    return (
        <div className="border border-gray-200 rounded-lg w-full">
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-primary">
                                <tr>
                                 
                                    {showBulkApproval && (
                                        <th
                                            scope="col"
                                            className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[5%]"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={(e) =>
                                                    handleSelectAll(
                                                        e.target.checked
                                                    )
                                                }
                                                className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
                                            />
                                        </th>
                                    )}
                                    <th
                                        scope="col"
                                        className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[5%]"
                                    >
                                        SNo
                                    </th>
                                    <th
                                        scope="col"
                                        className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%]"
                                    >
                                        ReqId
                                    </th>

                                    <th
                                        scope="col"
                                        className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%] hidden md:table-cell"
                                    >
                                        Entity
                                    </th>
                                    <th
                                        scope="col"
                                        className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[15%] hidden md:table-cell"
                                    >
                                        Vendor
                                    </th>
                                    <th
                                        scope="col"
                                        className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[9%]"
                                    >
                                        Amount
                                    </th>

                                    <th
                                        scope="col"
                                        className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[13%]"
                                    >
                                        Status
                                    </th>

                                    <th
                                        scope="col"
                                        className="sticky top-0 px-2 py-2 md:px-6 md:py-4 text-left text-xs font-medium text-white uppercase tracking-wider w-[10%]"
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
                                                    `/req-list-table/preview-one-req/${user._id}`
                                                )
                                            }
                                        >
                                            {/* Checkbox column for bulk approval */}
                                            {showBulkApproval && (
                                                <td className="px-2 py-2 md:px-6 md:py-4">
                                                    <div
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            const checkbox =
                                                                e.target.querySelector(
                                                                    'input[type="checkbox"]'
                                                                ) || e.target;
                                                            if (
                                                                checkbox.type ===
                                                                "checkbox"
                                                            ) {
                                                                handleRequestSelect(
                                                                    user._id,
                                                                    !selectedRequests?.includes(
                                                                        user._id
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                        className="flex items-center justify-center cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRequests?.includes(
                                                                user._id
                                                            )}
                                                            onChange={() => {}} // Empty onChange to avoid React warnings
                                                            className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 pointer-events-none"
                                                        />
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm font-medium text-gray-900">
                                                {(currentPage - 1) *
                                                    itemsPerPage +
                                                    index +
                                                    1}
                                            </td>

                                            <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="block font-medium">
                                                            {user.reqid}
                                                        </span>
                                                        <div className="flex space-x-1">
                                                            <button
                                                                onClick={(e) =>
                                                                    handleCopyReqId(
                                                                        user.reqid,
                                                                        e
                                                                    )
                                                                }
                                                                className="text-gray-400 hover:text-blue-500 transition-colors"
                                                                title="Copy Request ID"
                                                            >
                                                                <Copy className="h-3 w-3 md:h-4 md:w-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) =>
                                                                    handleOpenInNewTab(
                                                                        user._id,
                                                                        e
                                                                    )
                                                                }
                                                                className="text-gray-400 hover:text-green-500 transition-colors"
                                                                title="Open in new tab"
                                                            >
                                                                <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <span className="block font-medium">
                                                        {user.userName ||
                                                            "Employee"}
                                                    </span>
                                                    <span className="block text-xs md:text-sm">
                                                        {
                                                            user.commercials
                                                                ?.department
                                                        }
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500 hidden md:table-cell">
                                                <div>
                                                    <span className="block">
                                                        {user.commercials
                                                            ?.businessUnit ||
                                                            "NA"}
                                                    </span>
                                                    <span className="block font-medium">
                                                        {user.commercials
                                                            ?.entity || "NA"}
                                                    </span>
                                                    <span className="block">
                                                        {user.commercials
                                                            ?.site || "NA"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500 hidden md:table-cell">
                                                <div>
                                                    <span className="block font-medium">
                                                        {
                                                            user.procurements
                                                                ?.vendor
                                                        }
                                                    </span>
                                                    <span className="block">
                                                        {
                                                            user.procurements
                                                                ?.vendorName
                                                        }
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">
                                                {formatCurrency(
                                                    user.supplies?.totalValue,
                                                    user.supplies
                                                        ?.selectedCurrency
                                                )}
                                            </td>

                                            <td className="px-2 py-2 md:px-6 md:py-4 text-xs md:text-sm text-gray-500">
                                                {user.isCompleted ? (
                                                    <>
                                                        {user.status !==
                                                            "Approved" && (
                                                            <>
                                                                {
                                                                    user.nextDepartment
                                                                }{" "}
                                                                <br />
                                                            </>
                                                        )}
                                                        {user.status ||
                                                            "Pending"}
                                                    </>
                                                ) : (
                                                    <span className="text-red-500">
                                                        Draft
                                                    </span>
                                                )}
                                            </td>

                                            {renderActionColumn(user)}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={
                                                showBulkApproval ? "14" : "13"
                                            }
                                            className="px-2 py-2 md:px-6 md:py-4 text-center text-xs md:text-sm text-gray-500"
                                        >
                                            No matching results found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="mt-4 px-2 md:px-0">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                handlePageChange={handlePageChange}
                                itemsPerPage={itemsPerPage}
                                totalItems={filteredUsers.length}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestStaticsListTableContent;
