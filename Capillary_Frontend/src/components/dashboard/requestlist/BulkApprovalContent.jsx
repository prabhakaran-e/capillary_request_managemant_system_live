import React from "react";

const BulkApprovalContent = ({selectedRequests,handleBulkApproval,currentUsers,isBulkApproving}) => {
    return (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-blue-900">
                        Bulk Actions:
                    </span>
                    <span className="text-sm text-blue-700">
                        {selectedRequests.length} of {currentUsers.length}{" "}
                        selected
                    </span>
                </div>
                <button
                    onClick={handleBulkApproval}
                    disabled={selectedRequests.length === 0 || isBulkApproving}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedRequests.length > 0 && !isBulkApproving
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                    {isBulkApproving ? "Approving..." : "Bulk Approve"}
                </button>
            </div>
        </div>
    );
};

export default BulkApprovalContent;
