import { User } from "lucide-react";
import React from "react";

const ApproverSection = ({formData}) => {
    return (
        <div className="p-4 sm:p-6 border rounded-lg shadow-sm bg-gray-50">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <h3 className="font-semibold text-xl sm:text-2xl">Approver</h3>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 p-3 sm:p-4">
                <div className="w-full sm:w-auto">
                    <div className="text-gray-600 text-xs sm:text-sm">
                        Department
                    </div>
                    <div className="font-medium text-sm sm:text-base">
                        {formData.commercials.department}
                    </div>
                </div>

                <div className="w-full sm:w-auto">
                    <div className="text-gray-600 text-xs sm:text-sm">
                        Head of Department
                    </div>
                    <div className="font-medium text-sm sm:text-base">
                        {formData.commercials.hod || "No HOD found"}
                    </div>
                </div>

                <div className="w-full sm:w-auto">
                    <div className="text-gray-600 text-xs sm:text-sm">
                        HOD Email
                    </div>
                    <div className="font-medium text-sm sm:text-base break-words">
                        {formData?.commercials?.hodEmail || "No email found"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApproverSection;
