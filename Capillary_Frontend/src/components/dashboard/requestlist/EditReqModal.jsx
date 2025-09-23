import React from "react";

const EditReqModal = ({ setIsShowModal, sendEditMail }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-sm md:max-w-md">
                <h3 className="text-lg md:text-xl font-semibold mb-4">
                    Send Edit Request
                </h3>
                <p className="mb-6 text-sm md:text-base">
                    Do you want to send a edit request email to the Head of
                    Department?
                </p>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => setIsShowModal(false)}
                        className="px-3 py-1.5 md:px-4 md:py-2 border rounded-lg text-sm hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            setIsShowModal(false);
                            sendEditMail();
                        }}
                        className="bg-primary text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm hover:bg-primary/90"
                    >
                        Send Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditReqModal;
