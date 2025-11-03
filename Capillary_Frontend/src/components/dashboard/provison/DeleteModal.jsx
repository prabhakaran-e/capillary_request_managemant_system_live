import React from 'react'

function DeleteModal({deleteModal,setDeleteModal,confirmDelete}) {
  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Entry
                </h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this entry? This action cannot
                  be undone.
                </p>
              </div>
            </div>

            {deleteModal.item && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-900">
                  PO Number: {deleteModal.item.poNumber}
                </p>
                <p className="text-sm text-gray-600">
                  Vendor: {deleteModal.item.vendorName}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, item: null })}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
  )
}

export default DeleteModal