import React from "react";

const SubmissionConfirmModal = ({approveStatus,needsReason,setReason,setSubmissionDialog,approveRequest,reason,newStatus}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 md:w-[32rem]">
                <h3 className="text-xl font-semibold mb-4">
                    Confirm Submission
                </h3>
                <p className="mb-4">
                    {`Are you sure you want to ${approveStatus.toLowerCase()} the request?`}
                </p>

                {needsReason && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Please provide a reason
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                            rows={4}
                            placeholder={`Enter reason for ${approveStatus.toLowerCase()}ing the request...`}
                            required
                        />
                    </div>
                )}

                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => {
                            setSubmissionDialog(false);
                            setReason("");
                        }}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => {
                            approveRequest(newStatus);
                            setSubmissionDialog(false);
                        }}
                        disabled={needsReason && !reason.trim()}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {approveStatus}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionConfirmModal;
