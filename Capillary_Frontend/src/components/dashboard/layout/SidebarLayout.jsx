import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Home,
  Users,
  MonitorSmartphone,
  Building2,
  FileEdit,
  HelpCircle,
  FileText,
  LogOut,
  CheckCircle,
  Flag,
  Settings,
  Menu,
  X,
} from "lucide-react";
import TopBar from "./TopBar";
import { ToastContainer } from "react-toastify";
import { getLegalVendorsCount, getVendorManagementCount } from "../../../api/service/adminServices";


const SidebarItem = ({ icon: Icon, title, isActive, path, badgeCount }) => {
  return (
    <Link to={path} className="cursor-pointer px-2 relative">
      <div
        className={`aspect-square flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ease-in-out
          hover:bg-primary hover:text-white
          ${isActive
            ? "bg-primary text-white"
            : "text-gray-600 border-transparent"
          }
          `}
      >
        <Icon
          className={`w-5 h-5 mb-2 ${isActive ? "text-white" : "text-primary"
            } group-hover:text-white`}
        />
        <span
          className={`text-xs font-medium text-center leading-tight ${isActive ? "text-white" : ""
            }`}
        >
          {title}
        </span>
        {badgeCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </div>
    </Link>
  );
};

const SidebarLayout = () => {
  const location = useLocation();
  const role = localStorage.getItem("role") || "Employee";
  const multiRole = localStorage.getItem("multiRole") || "0";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [legalVendorsCount, setLegalVendorsCount] = useState(0); // Set to 5 for testing
  const [vendorManagementCount, setVendorManagementCount] = useState(0); // Badge count for Vendor Management

  console.log("Current role:", role);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch legal vendors count for Legal Team role
  useEffect(() => {
    if (role === "Legal Team") {
      const fetchLegalVendorsCount = async () => {
        try {
          console.log("Fetching legal vendors count...");
          const response = await getLegalVendorsCount();
          console.log("API response:", response);
          if (response.status === 200) {
            console.log("Setting count to:", response.data.count);
            setLegalVendorsCount(response.data.vendorDeviationData);
          }

          else {
            console.log("No count data, setting fallback to 1");
            setLegalVendorsCount(0);
          }
        } catch (error) {
          console.error("Failed to fetch legal vendors count:", error);
          console.log("Setting fallback count to 1 due to error");
          setLegalVendorsCount(0);
        }
      };

      fetchLegalVendorsCount();
    }
  }, [role]);

  // Fetch vendor management count for Vendor Management role
  useEffect(() => {
    if (role === "Vendor Management") {
      const fetchVendorManagementCount = async () => {
        try {
          console.log("Fetching vendor management count...");
          const response = await getVendorManagementCount();
          console.log("Vendor Management API response:", response);
          if (response.status === 200) {

            setVendorManagementCount(response.data.vendorApproveData || 0);
          } else {
            console.log("No vendor management count data, setting fallback to 0");
            setVendorManagementCount(0);
          }
        } catch (error) {
          console.error("Failed to fetch vendor management count:", error);
          setVendorManagementCount(0);
        }
      };

      fetchVendorManagementCount();
    }
  }, [role]);

  const isRouteActive = (path) => {
    if (location.pathname === path) return true;

    if (path !== "/dashboard") {
      return location.pathname.startsWith(path);
    }

    return false;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Base items that are common for all roles
  const baseItems = [
    { icon: Home, title: "Dashboard", path: "/dashboard" },
    { icon: MonitorSmartphone, title: "Requests", path: "/req-list-table" },
  ];

  // Items that should be shown when multiRole is "1"
  const multiRoleItems = [
    {
      icon: CheckCircle,
      title: "My Department Approvals",
      path: "/approval-request-list",
    },
  ];

  // My Vendors item - for roles except Admin and Vendor Management
  const myVendorsItem = [
    { icon: Building2, title: "My Vendors", path: "/vendor/my-added-vendors" },
  ];

  // Role-specific items
  const roleSpecificItems = {
    Admin: [
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
      { icon: FileEdit, title: "Entities", path: "/entity-list-table" },
      { icon: Users, title: "Employees", path: "/employee-list-table" },
      { icon: Users, title: "Users", path: "/panel-members-table" },
      { icon: Building2, title: "Vendors", path: "/vendor-list-table" },
      { icon: Building2, title: "Provision", path: "/provision-table" },
      { icon: Building2, title: "Prepaid", path: "/prepaid-table" },

      { icon: Flag, title: "Reports", path: "/genarate-report-page" },
      { icon: HelpCircle, title: "Questions", path: "/questions" },
      { icon: Settings, title: "Settings", path: "/settings" },
    ],
    Employee: [],
    "Legal Team": [
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
      {
        icon: Building2,
        title: "Vendors",
        path: "/vendor/pending-vendor-list-table",
        badgeCount: legalVendorsCount
      },
      { icon: HelpCircle, title: "Questions", path: "/questions" },
    ],
    "Info Security": [
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
      { icon: HelpCircle, title: "Questions", path: "/questions" },
    ],
    "Vendor Management": [
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
      {
        icon: Building2,
        title: "Vendors",
        path: "/vendor-list-table",
        badgeCount: vendorManagementCount
      },
    ],
    "Head of Finance": [
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
      { icon: Building2, title: "Vendors", path: "/vendor-list-table" },
      { icon: Building2, title: "Provision", path: "/provision-table" },
      { icon: Building2, title: "Prepaid", path: "/prepaid-table" },

      { icon: Flag, title: "Reports", path: "/genarate-report-page" },
    ],
    default: [
      {
        icon: CheckCircle,
        title: `${role} Approvals`,
        path: "/role-based-approvals-list",
      },
    ],
  };

  // Combine items based on role and multiRole value
  const getSidebarItems = () => {
    const items = [...baseItems];

    // Add multiRole items if multiRole is "1"
    if (multiRole === "1") {
      items.push(...multiRoleItems);
    }

    // Add My Vendors for all roles except Admin and Vendor Management
    if (role !== "Admin" && role !== "Vendor Management") {
      items.push(...myVendorsItem);
    }

    // Add role-specific items
    items.push(...(roleSpecificItems[role] || roleSpecificItems.default));

    return items;
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="flex flex-col h-screen scrollbar-none overflow-y-scroll">
      <div className="fixed w-full z-20">
        <TopBar />
      </div>

      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-10 left-2 z-30 bg-white p-2 rounded-md shadow-md"
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6 text-primary" />
          ) : (
            <Menu className="h-6 w-6 text-primary" />
          )}
        </button>
      )}

      <div className="flex flex-1 mt-10 scrollbar-none overflow-y-scroll">
        <div
          className={`${isMobile
            ? `fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } z-10 mt-20 transition-transform duration-300 ease-in-out`
            : "w-28 h-full fixed"
            } bg-white border-r border-gray-200 scrollbar-none overflow-y-scroll`}
        >
          <div className="flex flex-col py-6">
            <div className="grid grid-cols-1 gap-4 mt-5 mb-10">
              {sidebarItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  icon={item.icon}
                  title={item.title}
                  path={item.path}
                  isActive={isRouteActive(item.path)}
                  badgeCount={item.badgeCount || 0}
                />
              ))}
            </div>
          </div>
        </div>

        <ToastContainer
          position="top-center"
          autoClose={false}
          newestOnTop
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
        />

        <div
          className={`flex-1 ${isMobile ? "ml-0" : "ml-28"
            } scrollbar-none overflow-y-scroll bg-gray-50 pt-4`}
        >
          <div className="p-2 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
