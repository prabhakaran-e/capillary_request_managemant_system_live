import React from "react";
import { User, FileText } from "lucide-react";

const CommericalMainComponentSection = ({
    request,
    extractDateAndTime,
    handleShowFile,
}) => {
    return (
        <div className="p-5 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-2">
                Commercial Details
            </h2>
            {request.commercials &&
                Object.values(request.commercials).some((value) => value) && (
                    <div className="grid gap-6 p-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    Request ID
                                </span>
                                <div className="text-gray-800 font-semibold mt-1">
                                    {request.reqid}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    Business Unit
                                </span>
                                <div className="text-gray-800 font-semibold mt-1">
                                    {request.commercials.businessUnit}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    Created At
                                </span>
                                <div className="text-gray-800 font-semibold mt-1">
                                    {extractDateAndTime(request.createdAt)}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    Entity
                                </span>
                                <div className="text-gray-800 font-semibold mt-1">
                                    {request.commercials.entity}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    City
                                </span>
                                <div className="text-gray-800 font-semibold mt-1">
                                    {request.commercials.city}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    Site
                                </span>
                                <div className="text-gray-800 font-semibold mt-1">
                                    {request.commercials.site}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    Requestor Details
                                </span>
                                <div className="mt-2 space-y-1">
                                    {request.userId && (
                                        <div>
                                            <span className="text-gray-500 text-sm">
                                                ID:
                                            </span>
                                            <div className="text-gray-800 font-semibold">
                                                {request.userId}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500 text-sm">
                                            Name:
                                        </span>
                                        <div className="text-gray-800 font-semibold">
                                            {request.userName || "N/A"}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm">
                                            Department:
                                        </span>
                                        <div className="text-gray-800 font-semibold">
                                            {request.empDepartment || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    HOD Details
                                </span>
                                <div className="mt-2 space-y-1">
                                    <div>
                                        <span className="text-gray-500 text-sm">
                                            Name:
                                        </span>
                                        <div className="text-gray-800 font-semibold">
                                            {request.commercials.hod || "N/A"}
                                        </div>
                                    </div>
                                    {request.commercials.hodId && (
                                        <div>
                                            <span className="text-gray-500 text-sm">
                                                ID:
                                            </span>
                                            <div className="text-gray-800 font-semibold">
                                                {request.commercials.hodId}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500 text-sm">
                                            Department:
                                        </span>
                                        <div className="text-gray-800 font-semibold">
                                            {request.commercials.department ||
                                                "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Approver Details */}
                            {request.commercials.additionalApprover && (
                                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center mb-2">
                                        <User className="w-4 h-4 text-blue-600 mr-2" />
                                        <span className="text-blue-800 font-medium">
                                            Additional Approver
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div>
                                            <span className="text-blue-600 text-sm">
                                                ID:
                                            </span>
                                            <div className="text-blue-800 font-semibold">
                                                {
                                                    request.commercials
                                                        .additionalApprover
                                                }
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-blue-600 text-sm">
                                                Name:
                                            </span>
                                            <div className="text-blue-800 font-semibold">
                                                {request.commercials
                                                    .additionalApproverName ||
                                                    "N/A"}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-blue-600 text-sm">
                                                Email:
                                            </span>
                                            <div className="text-blue-800 font-semibold text-xs break-all">
                                                {request.commercials
                                                    .additionalApproverEmail ||
                                                    "N/A"}
                                            </div>
                                        </div>
                                        {request.commercials
                                            .additionalApproverProof &&
                                            request.commercials
                                                .additionalApproverProof
                                                .length > 0 && (
                                                <div className="mt-2">
                                                    <span className="text-blue-600 text-sm">
                                                        Proof Documents:
                                                    </span>
                                                    <div className="flex gap-2 mt-1">
                                                        {request.commercials.additionalApproverProof.map(
                                                            (
                                                                proofUrl,
                                                                index
                                                            ) => (
                                                                <button
                                                                    key={index}
                                                                    onClick={() =>
                                                                        handleShowFile(
                                                                            proofUrl
                                                                        )
                                                                    }
                                                                    className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                                                                >
                                                                    <FileText className="w-3 h-3 mr-1" />
                                                                    Proof{" "}
                                                                    {index + 1}
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-6 rounded-lg w-full">
                                <span className="text-gray-600 font-medium">
                                    Bill To
                                </span>
                                <div className="text-gray-800 font-semibold mt-1 whitespace-pre-line">
                                    {request.commercials.billTo}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg w-full">
                                <span className="text-gray-600 font-medium">
                                    Ship To
                                </span>
                                <div className="text-gray-800 font-semibold mt-1 whitespace-pre-line">
                                    {request.commercials.shipTo}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {request.commercials?.paymentTerms?.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold text-primary mb-4">
                        Payment Terms
                    </h3>
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-primary/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-primary font-semibold">
                                        Percentage
                                    </th>
                                    <th className="px-6 py-4 text-left text-primary font-semibold">
                                        Payment Term
                                    </th>
                                    <th className="px-6 py-4 text-left text-primary font-semibold">
                                        Type
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {request.commercials.paymentTerms.map(
                                    (term, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-left font-medium">
                                                {term.percentageTerm}%
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 capitalize">
                                                {term.paymentTerm?.toLowerCase()}
                                                {term.customPaymentTerm
                                                    ? ` - ${term.customPaymentTerm.toLowerCase()}`
                                                    : ""}
                                            </td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 capitalize">
                                                {term.paymentType?.toLowerCase()}
                                                {term.customPaymentType
                                                    ? ` - ${term.customPaymentType.toLowerCase()}`
                                                    : ""}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommericalMainComponentSection;
