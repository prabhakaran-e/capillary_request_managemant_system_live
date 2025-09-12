import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoreVertical, Bell, LogOut, User } from "lucide-react";
import capillary_logo from "../../../assets/images/CapillaryLogo_Horiz.png";
import { getNewNotification } from "../../../api/service/adminServices";

const TopBar = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("capEmpId");
  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");
  const department = localStorage.getItem("department");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileTooltipOpen, setIsProfileTooltipOpen] = useState(false);
  const [reqData, setReqData] = useState([]);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (role !== "Employee") {
      const fetchNotification = async () => {
        try {
          const response = await getNewNotification(userId);
          if (response.status === 200) {
            setReqData(response.data.reqData);
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      };
      fetchNotification();
    }
  }, [userId, role]);

  useEffect(() => {
    // Close tooltip when clicking outside
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsProfileTooltipOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleProfileClick = (e) => {
    // Only navigate if we're not clicking inside the tooltip
    if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
      navigate("/employee-profile");
    }
  };

  return (
    <div className="relative">
      <div className="bg-white shadow-md px-4 sm:px-6 py-4 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link to="/dashboard" className="mr-4 sm:mr-6">
            <img
              src={capillary_logo}
              alt="Capillary Logo"
              className="h-8 w-auto sm:h-16 p-3"
            />
          </Link>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
          <div className="relative" onClick={toggleNotifications}>
            <Bell className="text-gray-500 cursor-pointer hover:text-primary transition-colors" />
            {reqData?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {reqData?.length}
              </span>
            )}
          </div>
          <div
            className="relative flex items-center bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer px-3 sm:px-4 py-2 transition-colors duration-200 shadow-sm"
            onClick={handleProfileClick}
            onMouseEnter={() => setIsProfileTooltipOpen(true)}
            onMouseLeave={() => setIsProfileTooltipOpen(false)}
          >
            <div className="mr-2 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                {user?.name}
              </span>
              <span className="text-xs text-gray-500 truncate max-w-[120px]">
                {department && `${department}`}
                {role && department && " • "}
                {role && `${role}`}
              </span>
            </div>

            {/* Profile Tooltip */}
            {isProfileTooltipOpen && (
              <div
                ref={tooltipRef}
                className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-50 w-64"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start space-x-3">
                  <div className="h-10 w-10 bg-primary text-white rounded-full flex items-center justify-center text-lg font-medium">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-sm text-gray-600">{role}</p>
                    {department && (
                      <p className="text-sm text-gray-600">{department}</p>
                    )}
                    {user?.email && (
                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => navigate("/employee-profile")}
                    className="w-full text-left text-sm py-1 text-gray-700 hover:text-primary flex items-center"
                  >
                    <User size={14} className="mr-2" />
                    View Profile
                  </button>
                 
                </div>
              </div>
            )}
          </div>
          <MoreVertical className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors" />
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {isNotificationOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setReqData([])}
            >
              Clear All
            </button>
          </div>
          {reqData?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            <ul>
              {reqData?.map((notification) => (
                <li
                  key={notification?.reqid}
                  className="px-4 py-3 hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p>{`New Request is created with Request ID: ${notification?.reqid}`}</p>
                  </div>
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="p-4 text-center cursor-pointer font-bold text-black hover:underline">
            View All
          </div>
        </div>
      )}
    </div>
  );
};

export default TopBar;
