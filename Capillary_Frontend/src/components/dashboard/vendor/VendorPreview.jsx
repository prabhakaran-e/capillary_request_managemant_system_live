import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Info,
  User,
  FileText,
  Download,
  ExternalLink,
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

const FileCard = ({ fileUrl }) => {
  // Extract filename from S3 URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "agreement-file.pdf";
    try {
      const urlParts = url.split("/");
      const fileNameWithParams = urlParts[urlParts.length - 1];
      const fileName = fileNameWithParams.split("?")[0]; // Remove query parameters
      // Extract original filename after timestamp (format: timestamp_originalname.ext)
      const parts = fileName.split("_");
      if (parts.length > 1) {
        return decodeURIComponent(parts.slice(1).join("_")); // Join back if filename had underscores
      }
      return decodeURIComponent(fileName);
    } catch (error) {
      return "agreement-file.pdf";
    }
  };

  const fileName = getFileNameFromUrl(fileUrl);

  const handleDownload = () => {
    if (!fileUrl) return;
    // Create a temporary link to download the file
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = () => {
    if (!fileUrl) return;
    // Open file in new tab with security attributes
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  if (!fileUrl) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-500">No agreement file available</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm p-4 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-500 mb-1">
              Agreement File
            </div>
            <div className="text-base font-semibold text-gray-900 break-words">
              {fileName}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Stored in S3
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleView}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 text-sm rounded-md hover:bg-blue-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VendorPreview = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const excludeKeys = [
    "_id",
    "uploadedAt",
    "lastModified",
    "updatedAt",
    "createdAt",
    "agreementFile",
    "agreementFileName",
    "agreementFileUrl",
    "hasAgreement",
    "questionnaireAnswer",
    "__v",
    "empId",
  ];

  // Define structured sections with proper field mapping
  const sections = {
    basic: {
      icon: Building2,
      title: "Company Information",
      fields: [
        { key: "vendorId", label: "Vendor ID" },
        { key: "vendorName", label: "Company Name" },
        { key: "entity", label: "Entity" },
        { key: "category", label: "Category" },
        { key: "primarySubsidiary", label: "Primary Subsidiary" },
        { key: "natureOfService", label: "Nature of Service" },
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
        { key: "billingAddress", label: "Address" },
        { key: "shippingAddress", label: "Shipping Address" },
      ],
    },
    financial: {
      icon: DollarSign,
      title: "Tax & Financial Information",
      fields: [
        { key: "taxNumber", label: "PAN/Tax Registration/W9" },
        { key: "gstin", label: "GST" },
        { key: "msme", label: "MSME" },
      ],
    },
    banking: {
      icon: Building2,
      title: "Bank Details",
      fields: [
        { key: "bankAccountNumber", label: "Bank Account Number" },
        { key: "ifscSwiftCode", label: "IFSC/SWIFT CODE" },
        { key: "bankName", label: "Bank Name" },
      ],
    },
  };

  useEffect(() => {
    const fetchVendorDetails = async () => {
      try {
        const response = await getVenorIndividualData(vendorId);
        console.log("Vendor data:", response.data);
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

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">Vendor not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-primary hover:underline"
          >
            Go back
          </button>
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
              {data.status === "Pending" && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                  Pending
                </span>
              )}
              {data.status === "Inactive" && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  Inactive
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
                  data[field.key] !== undefined &&
                  data[field.key] !== ""
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

          {/* Agreement/EL Section */}
          {data.hasAgreement && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <SectionHeader icon={FileText} title="Agreement/EL" />

              {data.hasAgreement === "yes" && (
                <div className="space-y-4">
                  {data.agreementFileUrl ? (
                    <FileCard fileUrl={data.agreementFileUrl} />
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        Agreement file URL not available
                      </p>
                    </div>
                  )}
                </div>
              )}

              {data.hasAgreement === "no" && (
                <div>
                  {data.questionnaireAnswer ? (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-sm font-medium text-gray-500 mb-2">
                        Questionnaire Answer
                      </div>
                      <div className="text-base text-gray-900 whitespace-pre-wrap">
                        {data.questionnaireAnswer}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">
                        No questionnaire answer provided
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
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
          {data.createdAt && (
            <>
              Created: {formatValue(data.createdAt)}
              {data.updatedAt && " • "}
            </>
          )}
          {data.updatedAt && <>Last Updated: {formatValue(data.updatedAt)}</>}
        </div>
      </div>
    </div>
  );
};

export default VendorPreview;