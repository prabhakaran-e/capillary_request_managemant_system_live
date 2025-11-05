import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Mail,
  Building2,
  Database,
  GitBranch,
  Coins,
  Clock,
  CreditCard,
  ScrollText,
  Settings as SettingsIcon,
  DollarSign,
  Banknote,
  TrendingUp,
  Cloud,
  Server,
  UserCheck,
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();

  const settingsGroups = [
    {
      title: "Integrations",
      description: "Configure third-party service connections",
      items: [
        // {
        //   title: "Google SSO",
        //   icon: Users,
        //   bgColor: "bg-blue-50",
        //   textColor: "text-blue-600",
        //   description: "Single sign-on configuration",
        //   path: "/settings/google-sso",
        // },
        // {
        //   title: "SMTP",
        //   icon: Mail,
        //   bgColor: "bg-purple-50",
        //   textColor: "text-purple-600",
        //   description: "Email server settings",
        //   path: "/settings/smtp",
        // },
        {
          title: "REST API",
          icon: Building2,
          bgColor: "bg-indigo-50",
          textColor: "text-indigo-600",
          description: "Create Api keys",
          path: "/settings/create-rest-api",
        },
        {
          title: "Email Notification",
          icon: Database,
          bgColor: "bg-cyan-50",
          textColor: "text-cyan-600",
          description: "Enable disable Email notification",
          path: "/settings/email-notification",
        },
        {
          title: "Approver Type",
          icon: GitBranch,
          bgColor: "bg-green-50",
          textColor: "text-green-600",
          description: "Configure approval workflows",
          path: "/settings/approver-type",
        },
        {
          title: "Currency",
          icon: Coins,
          bgColor: "bg-amber-50",
          textColor: "text-amber-600",
          description: "Manage currency settings",
          path: "/settings/all-listed-currency",
        },
        {
          title: "Upload Vendor Policy",
          icon: ScrollText,
          bgColor: "bg-fuchsia-50",
          textColor: "text-fuchsia-600",
          description: "Manage the vendor policy document",
          path: "/settings/upload-vendor-policy",
        },
        {
          title: "Upload PO Policy",
          icon: ScrollText,
          bgColor: "bg-pink-50",
          textColor: "text-pink-600",
          description: "Manage the purchase order policy",
          path: "/settings/upload-po-policy",
        },
      ],
    },
  ];

  const StatCard = ({
    title,
    icon: Icon,
    bgColor,
    textColor,
    description,
    path,
    onClick,
  }) => (
    <div
      onClick={() => navigate(path)}
      className={`${bgColor} rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-transparent hover:border-gray-200`}
    >
      <div className="flex items-start space-x-4">
        <div
          className={`${textColor} bg-white p-3 rounded-lg shadow-sm flex-shrink-0`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">
          Manage your application settings and configurations
        </p>
      </div>

      <div className="space-y-12">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {group.title}
              </h2>
              <p className="text-gray-600">{group.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.items.map((item, index) => (
                <StatCard key={index} {...item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
