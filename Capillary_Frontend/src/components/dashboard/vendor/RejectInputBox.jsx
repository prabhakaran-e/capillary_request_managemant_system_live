import { X } from 'lucide-react'
import React, { useCallback } from 'react'

const RejectInputBox = ({ cancelReject, confirmReject, textareaRef, rejectionReason, setRejectionReason }) => {
    const handleRejectionReasonChange = useCallback((e) => {
        setRejectionReason(e.target.value);
    }, [setRejectionReason]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Reject Vendor</h3>
                    <button
                        onClick={cancelReject}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Rejection <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        ref={textareaRef}
                        value={rejectionReason}
                        onChange={handleRejectionReasonChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        rows={4}
                        placeholder="Please provide a detailed reason for rejecting this vendor..."
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={cancelReject}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmReject}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RejectInputBox