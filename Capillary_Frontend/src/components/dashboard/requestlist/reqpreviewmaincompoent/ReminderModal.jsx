import React from "react";
import { Bell } from "lucide-react";

const ReminderModal = ({ setShowDialog, handleNotify }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Bell className="text-primary w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold">Notify</h3>
                    <p className="mt-2 text-gray-600 text-center">
                        Do you want to make a reminder?
                    </p>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => setShowDialog(false)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition-colors duration-200"
                    >
                        No
                    </button>

                    <button
                        onClick={handleNotify}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium flex items-center gap-2"
                    >
                        <Bell size={16} />
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;
