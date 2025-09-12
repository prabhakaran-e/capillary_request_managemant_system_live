import React from "react";
import {
  Briefcase,
  Mail,
  UserCircle2,
  Building,
  Phone,
  Calendar,
} from "lucide-react";

const EmployeeProfileCard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role") || "No role assigned";
  const department = localStorage.getItem("department") || "No department";

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Banner with gradient background */}
      <div className="bg-gradient-to-r from-primary to-primary h-32" />

      <div className="p-6 relative">
        {/* Avatar Section - Positioned to overlap the banner */}
        <div className="flex flex-col lg:flex-row">
          <div className="-mt-20 mb-4 lg:mb-0 flex justify-center lg:justify-start">
            {user?.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center shadow-md">
                <UserCircle2 className="w-20 h-20 text-gray-400" />
              </div>
            )}
          </div>

          {/* User Information */}
          <div className="lg:ml-6 flex-1 text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
              {user?.name || "User"}
            </h2>
            <p className="text-lg text-indigo-600 font-medium mb-4">{role}</p>

            {/* Info Cards in Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-3 flex items-start">
                <Mail className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Email</p>
                  <p className="text-sm font-medium text-gray-800 break-all">
                    {user?.email || "No email provided"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 flex items-start">
                <Briefcase className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Role</p>
                  <p className="text-sm font-medium text-gray-800">{role}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 flex items-start">
                <Building className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    Department
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {department}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 flex items-start">
                <Phone className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Phone</p>
                  <p className="text-sm font-medium text-gray-800">
                    {user?.phone || "No phone provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default EmployeeProfileCard;
