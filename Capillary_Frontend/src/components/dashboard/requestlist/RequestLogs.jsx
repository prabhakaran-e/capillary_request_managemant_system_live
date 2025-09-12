import React from "react";
import { extractDateTime } from "../../../utils/extractDateTime";
import { ChevronRight, FileText, Info, Clock, User } from "lucide-react";

const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return { days: "-", hours: "-", minutes: "-" };

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffInMs = end - start;

    if (diffInMs < 0) return { days: "-", hours: "-", minutes: "-" };

    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
        (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
};

const formatDuration = (duration) => {
    if (duration.days === "-") return "Pending";

    const parts = [];
    if (duration.days > 0) parts.push(`${duration.days}d`);
    if (duration.hours > 0) parts.push(`${duration.hours}h`);
    if (duration.minutes > 0) parts.push(`${duration.minutes}m`);

    return parts.length > 0 ? parts.join(" ") : "Less than 1m";
};

const getStatusColorClasses = (status) => {
    const statusMap = {
        // Primary statuses
        approved: {
            bg: "bg-green-100",
            text: "text-green-800",
            border: "border-green-200",
        },
        rejected: {
            bg: "bg-red-100",
            text: "text-red-800",
            border: "border-red-200",
        },
        pending: {
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            border: "border-yellow-200",
        },
        hold: {
            bg: "bg-orange-100",
            text: "text-orange-800",
            border: "border-orange-200",
        },

        // Specific statuses
        "po-pending": {
            bg: "bg-blue-100",
            text: "text-blue-800",
            border: "border-blue-200",
        },
        "invoice-pending": {
            bg: "bg-indigo-100",
            text: "text-indigo-800",
            border: "border-indigo-200",
        },

        // Fallback
        default: {
            bg: "bg-gray-100",
            text: "text-gray-800",
            border: "border-gray-200",
        },
    };

    const normalizedStatus = status.toLowerCase();

    // Check for exact match first
    if (statusMap[normalizedStatus]) {
        return `${statusMap[normalizedStatus].bg} ${statusMap[normalizedStatus].text} ${statusMap[normalizedStatus].border} rounded-full px-3 py-1 text-xs font-medium border`;
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(statusMap)) {
        if (normalizedStatus.includes(key)) {
            return `${value.bg} ${value.text} ${value.border} rounded-full px-3 py-1 text-xs font-medium border`;
        }
    }

    // Fallback to default
    return `${statusMap.default.bg} ${statusMap.default.text} ${statusMap.default.border} rounded-full px-3 py-1 text-xs font-medium border`;
};

const RequestDetailsSummaryRow = ({ requestDetails, serialNumber = 1 }) => {
    if (!requestDetails) return null;

    const { date: submissionDate, time: submissionTime } =
        requestDetails.reqCreatedAt
            ? extractDateTime(requestDetails.reqCreatedAt)
            : { date: "N/A", time: "N/A" };

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6 border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <User className="mr-3 text-blue-500" size={24} />
                    Requestor Details
                </h3>
            </div>
            <table className="w-full">
                <tbody>
                    <tr className="border-b">
                        <td className="p-4 w-1/3">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    Requestor
                                </p>
                                <p className="text-base text-gray-900 font-semibold">
                                    {requestDetails.requestorName || "N/A"}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {requestDetails.requestorDepartment ||
                                        "N/A"}
                                </p>
                            </div>
                        </td>
                        <td className="p-4 w-1/3">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    Current Status
                                </p>
                                <span
                                    className={getStatusColorClasses(
                                        requestDetails.currentStatus
                                    )}
                                >
                                    {requestDetails.currentStatus || "N/A"}
                                </span>
                            </div>
                        </td>
                        <td className="p-4 w-1/3">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    Submission Date
                                </p>
                                <p className="text-base text-gray-900">
                                    {submissionDate}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {submissionTime}
                                </p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const RequestLogsTable = ({ createdAt, logData, reqLogs }) => {
    if (!logData || logData.length === 0) {
        return (
            <>
                <RequestDetailsSummaryRow requestDetails={reqLogs} />
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl">
                    <FileText className="text-gray-400 mb-4" size={64} />
                    <p className="text-lg text-gray-600 text-center">
                        No approval logs available
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <RequestDetailsSummaryRow requestDetails={reqLogs} />
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between relative">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Clock className="mr-3 text-blue-500" size={24} />
                        Approval Logs
                    </h2>
                    <div className="flex items-center gap-4">
                        {" "}
                        {/* Increased spacing between elements */}
                        <span className="text-sm text-gray-600">
                            Turn Around Time
                        </span>
                        <span className="relative inline-flex items-center justify-center w-5 h-5 bg-gray-200 rounded-full cursor-help group">
                            <Info size={12} className="text-gray-600" />
                            <span className="absolute hidden group-hover:flex items-center z-50 right-0 mr-4 top-1/2 -translate-y-1/2 px-3 py-1 text-xs text-white bg-gray-800 rounded-lg whitespace-nowrap shadow-lg">
                                Turn around time includes non-working hours
                            </span>
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Sl.No
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Approved By
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Created On
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Received On
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Updated On
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    TAT
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Proceeded To
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logData.map((log, index) => {
                                const {
                                    date: approvalDate,
                                    time: approvalTime,
                                } = extractDateTime(log.approvalDate);
                                const { date: requestDate, time: requestTime } =
                                    extractDateTime(createdAt);
                                const {
                                    date: receivedDate,
                                    time: receivedTime,
                                } = extractDateTime(log.receivedOn);
                                const duration = calculateDuration(
                                    log.receivedOn,
                                    log.approvalDate
                                );
                                const formattedDuration =
                                    formatDuration(duration);

                                return (
                                    <tr
                                        key={log._id || index}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-gray-900">
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {log.approvalId || "NA"}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {log.approverName || "NA"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {log.departmentName || "NA"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-2">
                                                <span
                                                    className={getStatusColorClasses(
                                                        log.status
                                                    )}
                                                >
                                                    {log.status}
                                                </span>
                                                {log.remarks && (
                                                    <div className="relative">
                                                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                            <p className="whitespace-pre-wrap">
                                                                {log.remarks}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-900">
                                                {requestDate}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {requestTime}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-900">
                                                {receivedDate || "NA"}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {receivedTime || "NA"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-900">
                                                {approvalDate}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {approvalTime}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-gray-900">
                                                {formattedDuration}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-1">
                                                <span className="text-sm text-gray-900">
                                                    {log.nextDepartment}
                                                </span>
                                                <ChevronRight
                                                    size={16}
                                                    className="text-gray-400"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default RequestLogsTable;
