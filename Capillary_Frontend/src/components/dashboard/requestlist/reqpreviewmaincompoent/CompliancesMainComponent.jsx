import React from "react";

const CompliancesMainComponent = ({request,openInfoModal,handleShowFile}) => {
    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-3">
                Compliance Details
            </h2>
            {request.complinces && request?.complinces ? (
                <div className="space-y-4">
                    {Object.keys(request?.complinces)?.length > 0 ? (
                        Object.entries(request?.complinces)?.map(
                            ([questionId, compliance], index) => (
                                <div
                                    key={questionId}
                                    className={`p-3 sm:p-4 rounded-lg ${
                                        compliance.deviation
                                            ? "bg-red-50 border border-red-200"
                                            : "bg-green-50 border border-green-200"
                                    }`}
                                >
                                    <div className="flex items-start ">
                                        <h3
                                            className={`text-base sm:text-lg font-semibold ${
                                                compliance.deviation
                                                    ? "text-red-800"
                                                    : "text-green-800"
                                            }`}
                                        >
                                            {compliance.question}
                                        </h3>
                                        <button
                                            onClick={() =>
                                                openInfoModal(
                                                    compliance.question,
                                                    compliance.description
                                                )
                                            }
                                            className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            aria-label="More information"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <p
                                        className={`mt-2 font-medium ${
                                            compliance.deviation
                                                ? "text-red-600"
                                                : "text-green-600"
                                        }`}
                                    >
                                        {compliance.answer ? "Yes" : "No"}
                                    </p>
                                    {compliance.department && (
                                        <p className="mt-2 text-xs sm:text-sm text-gray-600">
                                            <strong>Department:</strong>{" "}
                                            {compliance.department}
                                        </p>
                                    )}
                                    {compliance.deviation && (
                                        <div className="mt-2 p-2 sm:p-3 bg-red-100 rounded">
                                            <p className="text-xs sm:text-sm text-red-700">
                                                <strong>
                                                    Deviation Reason:
                                                </strong>{" "}
                                                {compliance.deviation.reason}
                                            </p>
                                        </div>
                                    )}

                                    {compliance?.deviation?.attachments
                                        ?.length > 0 && (
                                        <div className="mt-4">
                                            <strong className="text-xs sm:text-sm text-red-700">
                                                Attachments:
                                            </strong>
                                            <ul className="list-disc pl-4 sm:pl-6 mt-2">
                                                {compliance?.deviation?.attachments.map(
                                                    (attachment, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-xs sm:text-sm"
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    handleShowFile(
                                                                        attachment
                                                                            .data
                                                                            .fileUrls[
                                                                            i
                                                                        ]
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-800 underline"
                                                            >
                                                                Attachment{" "}
                                                                {i + 1}
                                                            </button>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )
                        )
                    ) : (
                        <div className="text-gray-500">
                            No compliance details available
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-gray-500">
                    No compliance data available
                </div>
            )}
        </div>
    );
};

export default CompliancesMainComponent;
