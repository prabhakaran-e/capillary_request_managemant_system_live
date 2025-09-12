import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Info,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVenorIndividualData } from "../../../api/service/adminServices";

const SectionHeader = ({ icon: Icon, title, className = "" }) => (
  <div className={`flex items-center gap-2 mb-4 ${className}`}>
    <Icon className="h-5 w-5 text-primary" />
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
  </div>
);

const DataCard = ({ title, value }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all">
    <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
    <div className="text-base font-medium text-gray-900 break-words">
      {value}
    </div>
  </div>
);

const VendorPreview = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const excludeKeys = ["_id", "uploadedAt", "lastModified", "updatedAt"];

  // Define structured sections with proper field mapping
  const sections = {
    basic: {
      icon: Building2,
      title: "Company Information",
      fields: [
        { key: "vendorId", label: "Vendor ID" },
        { key: "vendorName", label: "Vendor Name" },
        { key: "primarySubsidiary", label: "Primary Subsidiary" },
        { key: "status", label: "Status" },
      ],
    },
    contact: {
      icon: Mail,
      title: "Contact Details",
      fields: [
        { key: "email", label: "Email Address" },
        { key: "phone", label: "Phone Number" },
      ],
    },
    address: {
      icon: MapPin,
      title: "Address Information",
      fields: [
        { key: "billingAddress", label: "Billing Address" },
        { key: "shippingAddress", label: "Shipping Address" },
      ],
    },
    financial: {
      icon: DollarSign,
      title: "Financial Information",
      fields: [
        { key: "taxNumber", label: "Tax Number" },
        { key: "gstin", label: "GSTIN" },
      ],
    },
  };

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const response = await getVenorIndividualData(vendorId);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching vendor details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorDetails();
  }, [vendorId]);

  const formatValue = (value) => {
    if (value === "" || value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") {
      if (value === 0) return "0";
      if (Number.isInteger(value)) return value.toLocaleString();
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    // Format date strings
    if (
      typeof value === "string" &&
      value.includes("T") &&
      !isNaN(Date.parse(value))
    ) {
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return value;
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    return address.split(/\r?\n/).map((line, i) => (
      <span key={i} className="block">
        {line}
      </span>
    ));
  };

  // Find remaining fields not covered in the defined sections
  const getRemainingFields = () => {
    if (!data) return [];

    const definedFields = Object.values(sections).flatMap((section) =>
      section.fields.map((field) => field.key)
    );

    return Object.keys(data)
      .filter(
        (key) => !excludeKeys.includes(key) && !definedFields.includes(key)
      )
      .map((key) => ({
        key,
        label: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
      }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-lg font-medium text-gray-600">
            Loading vendor details...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Back to Vendors</span>
            </button>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {data.vendorId}
              </span>
              {data.status === "Active" && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Active
                </span>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data.vendorName || "Vendor Details"}
          </h1>
          <p className="text-gray-500">{data.primarySubsidiary || ""}</p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {Object.entries(sections).map(
            ([sectionKey, { icon, title, fields }]) => {
              const sectionFields = fields.filter(
                (field) =>
                  data &&
                  data.hasOwnProperty(field.key) &&
                  data[field.key] !== null &&
                  data[field.key] !== undefined
              );

              if (sectionFields.length === 0) return null;

              return (
                <div
                  key={sectionKey}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <SectionHeader icon={icon} title={title} />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sectionFields.map((field) => (
                      <DataCard
                        key={field.key}
                        title={field.label}
                        value={
                          field.key.toLowerCase().includes("address")
                            ? formatAddress(data[field.key])
                            : formatValue(data[field.key])
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            }
          )}

          {/* Additional Information Section */}
          {getRemainingFields().length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <SectionHeader icon={Info} title="Additional Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getRemainingFields().map((field) => (
                  <DataCard
                    key={field.key}
                    title={field.label}
                    value={formatValue(data[field.key])}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Last Modified: {formatValue(data.lastModified)} • Uploaded:{" "}
          {formatValue(data.uploadedAt)}
        </div>
      </div>
    </div>
  );
};

export default VendorPreview;
