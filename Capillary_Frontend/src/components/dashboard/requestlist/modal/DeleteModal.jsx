import React from "react";

const DeleteModal = ({setIsDelete,handleDelete,reqId}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-sm md:max-w-md">
                <h3 className="text-lg md:text-xl font-semibold mb-4">
                    Do you really want to delete this request?
                </h3>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => setIsDelete(false)}
                        className="px-3 py-1.5 md:px-4 md:py-2 border rounded-lg text-sm hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleDelete(reqId)}
                        className="bg-primary text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm hover:bg-primary/90"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
