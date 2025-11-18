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
  CheckCircle,
  Clock,
  Eye,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVenorIndividualData, approveVendor, rejectVendor, teamVerifiedTheVendorData, teamRejectTheVendorData } from "../../../api/service/adminServices";
import { toast } from "react-toastify";

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

// ✅ NEW: Questionnaire Display Component
const QuestionnaireCard = ({ questionnaireData }) => {
  // Map the questionnaire keys to actual questions
  const questionMap = {
    counterpartyRequired: "Is the agreement required by the counterparty?",
    agreementType: "Does the agreement have an auto-renewal clause or a fixed tenure?",
    serviceType: "Is this a one-time or recurring service?",
    paymentType: "Is the payment a one-time transaction or a recurring payment?"
  };

  if (!questionnaireData || typeof questionnaireData !== 'object') {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-500">
          No questionnaire data available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(questionnaireData).map(([key, value], index) => (
        <div
          key={key}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 hover:border-green-300 transition-all"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-green-700">
                  {index + 1}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 mb-2">
                {questionMap[key] || key}
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-base font-semibold text-gray-900">
                  {value}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const VendorPreview = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  // Check if vendorId is present for Vendor Management role
  const role = localStorage.getItem('role');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLegalLogs, setShowLegalLogs] = useState(false);
  const [showVendorLogs, setShowVendorLogs] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showVendorIdAlert, setShowVendorIdAlert] = useState(false);

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
    "questionnaireData", // ✅ Added to exclude from additional info
    "panTaxFile",
    "panTaxFileName",
    "panTaxFileUrl",
    "gstFile",
    "gstFileName",
    "gstFileUrl",
    "msmeFile",
    "msmeFileName",
    "msmeFileUrl",
    "bankProofFile",
    "bankProofFileName",
    "bankProofFileUrl",
    "__v",
    "empId",
    "isLegalTeamVerifiedLogs",
    "isVendorTeamVerifiedLogs",
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

        // Show alert for Vendor Management if vendorId is missing
        if (role === 'Vendor Management' && (!response.data.vendorId || response.data.vendorId.trim() === '')) {
          setShowVendorIdAlert(true);
        }
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
    if (typeof value === "object" && !Array.isArray(value)) {
      // Handle verification log objects
      if (value.status !== undefined && value.verifiedBy !== undefined && value.verifiedAt !== undefined) {
        return `${value.status ? "Verified" : "Not Verified"} by ${value.verifiedBy || "Unknown"} on ${new Date(value.verifiedAt).toLocaleDateString()}`;
      }
      // Handle verification status objects with comments
      if (value.status !== undefined && value.comments !== undefined) {
        return `${value.status ? "Verified" : "Not Verified"}${value.comments && value.comments.length > 0 ? ` (${value.comments.length} comment${value.comments.length > 1 ? 's' : ''})` : ""}`;
      }
      return "N/A";
    }
    if (typeof value === "number") {
      if (value === 0) return "0";
      if (Number.isInteger(value)) return value.toLocaleString();
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
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

  // Approve/Reject handler functions
  const handleApprove = () => {
    setShowApproveModal(true);
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const confirmApprove = async () => {
    try {
      const empId = localStorage.getItem('capEmpId');
      const role = localStorage.getItem('role');

      let response;
      if (role === 'Legal Team') {
        response = await approveVendor(vendorId, empId);
      } else {
        response = await teamVerifiedTheVendorData(vendorId, empId, "Approved by Vendor Management");
      }

      if (response.status === 200) {
        if (role === 'Legal Team') {
          setData({ ...data, status: 'approved', isLegalTeamVerified: true });
        } else {
          setData({ ...data, isVendorTeamVerified: true });
        }
        toast.success(response.data.message || "Vendor approved successfully");
        setShowApproveModal(false);
      } else {
        toast.error("Failed to approve vendor");
      }
    } catch (error) {
      toast.error("Error approving vendor");
    }
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      const empId = localStorage.getItem('capEmpId');
      const role = localStorage.getItem('role');

      let response;
      if (role === 'Legal Team') {
        response = await rejectVendor(vendorId, empId, rejectionReason);
      } else {
        response = await teamRejectTheVendorData(vendorId, empId, rejectionReason);
      }

      if (response.status === 200) {
        if (role === 'Legal Team') {
          setData({ ...data, status: 'rejected', isLegalTeamVerified: false });
        } else {
          setData({ ...data, isVendorTeamVerified: false });
        }
        toast.success(response.data.message || "Vendor rejected successfully");
        setShowRejectModal(false);
        setRejectionReason("");
      } else {
        toast.error("Failed to reject vendor");
      }
    } catch (error) {
      toast.error("Error rejecting vendor");
    }
  };

  const cancelApprove = () => {
    setShowApproveModal(false);
  };

  const cancelReject = () => {
    setShowRejectModal(false);
    setRejectionReason("");
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
        {/* Vendor ID Alert Popup */}
        {showVendorIdAlert && role === 'Vendor Management' && (
          <div className="fixed top-15 right-4 z-50 bg-white rounded-lg shadow-lg border-l-4 border-yellow-500 p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Vendor ID Required</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Vendor ID is mandatory for Vendor Management users. Please edit the vendor to add a Vendor ID.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/vendor-list-table/edit-vendor/${vendorId}`)}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit Vendor
                  </button>
                  <button
                    onClick={() => setShowVendorIdAlert(false)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                {data.vendorId || "N/A"}
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

          {/* Document Uploads Section */}
          {(data.panTaxFileUrl || data.gstFileUrl || data.msmeFileUrl || data.bankProofFileUrl) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <SectionHeader icon={FileText} title="Document Uploads" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PAN/TAX/W9 File */}
                {data.panTaxFileUrl && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      PAN / TAX / W9 File
                    </div>
                    <FileCard fileUrl={data.panTaxFileUrl} />
                  </div>
                )}

                {/* GST File */}
                {data.gstFileUrl && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      GST File
                    </div>
                    <FileCard fileUrl={data.gstFileUrl} />
                  </div>
                )}

                {/* MSME File */}
                {data.msmeFileUrl && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      MSME File
                    </div>
                    <FileCard fileUrl={data.msmeFileUrl} />
                  </div>
                )}

                {/* Bank Account Proof */}
                {data.bankProofFileUrl && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      Bank Account Proof
                    </div>
                    <FileCard fileUrl={data.bankProofFileUrl} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ UPDATED: Agreement/EL Section with Questionnaire Display */}
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
                  <div className="mb-3">
                    <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <Info className="h-4 w-4 mr-1.5" />
                      Questionnaire Responses
                    </div>
                  </div>
                  {data.questionnaireData ? (
                    <QuestionnaireCard questionnaireData={data.questionnaireData} />
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">
                        No questionnaire data available
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

          {/* Verification Logs Section */}
          {(data.isLegalTeamVerifiedLogs?.length > 0 || data.isVendorTeamVerifiedLogs?.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <SectionHeader icon={Clock} title="Verification Logs" />
              <div className="space-y-4">
                {data.isLegalTeamVerifiedLogs?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Legal Team Verification</h3>
                      <button
                        onClick={() => setShowLegalLogs(!showLegalLogs)}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        {showLegalLogs ? 'Hide Logs' : 'Show Logs'}
                      </button>
                    </div>
                    {showLegalLogs && (
                      <div className="space-y-2">
                        {data.isLegalTeamVerifiedLogs.map((log, index) => (
                          <div key={log._id || index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${log.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-sm font-medium text-gray-900">
                                  {log.status ? 'Verified' : 'Not Verified'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(log.verifiedAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              By: {log.verifiedBy || log.verifiedUserId || 'Unknown'}
                            </div>
                            {log.comments && log.comments.length > 0 && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Comments: </span>
                                {log.comments.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {data.isVendorTeamVerifiedLogs?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Vendor Team Verification</h3>
                      <button
                        onClick={() => setShowVendorLogs(!showVendorLogs)}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        {showVendorLogs ? 'Hide Logs' : 'Show Logs'}
                      </button>
                    </div>
                    {showVendorLogs && (
                      <div className="space-y-2">
                        {data.isVendorTeamVerifiedLogs.map((log, index) => (
                          <div key={log._id || index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${log.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-sm font-medium text-gray-900">
                                  {log.status ? 'Verified' : 'Not Verified'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(log.verifiedAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-600">
                              By: {`${log.verifiedUserId} - ${log.verifiedBy} ` || 'Unknown'}
                            </div>
                            {log.comments && log.comments.length > 0 && (
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">Comments: </span>
                                {log.comments.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Approve/Reject Buttons - Role-based visibility */}
          {(() => {
            const role = localStorage.getItem('role');
            if (role === 'Legal Team') {
              return data.status === "Pending" && data.isLegalTeamVerified === false;
            } else if (role === 'Vendor Management') {
              return data.status === "Pending" && data.isVendorTeamVerified === false;
            }
            return false;
          })() && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleApprove}
                    disabled={localStorage.getItem('role') === 'Vendor Management' && (!data.vendorId || data.vendorId.trim() === '')}
                    className={`px-6 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${localStorage.getItem('role') === 'Vendor Management' && (!data.vendorId || data.vendorId.trim() === '')
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve Vendor
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={localStorage.getItem('role') === 'Vendor Management' && (!data.vendorId || data.vendorId.trim() === '')}
                    className={`px-6 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${localStorage.getItem('role') === 'Vendor Management' && (!data.vendorId || data.vendorId.trim() === '')
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                  >
                    <XCircle className="h-5 w-5" />
                    Reject Vendor
                  </button>
                </div>
              </div>
            )}

          {/* Approve Modal */}
          {showApproveModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Vendor</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to approve this vendor? This action cannot be undone.
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={cancelApprove}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApprove}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Vendor</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to reject this vendor? This action cannot be undone.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for rejection <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                    placeholder="Please provide a reason for rejection..."
                  />
                </div>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={cancelReject}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
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