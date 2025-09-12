import React from "react";
import { DollarSign } from "lucide-react";
import pfdIcon from "../../../../assets/images/pdfIcon.png";


const CommercialSection = ({formData}) => {
    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-2 text-primary">
                <DollarSign size={24} />
                <h2 className="text-xl sm:text-2xl font-bold border-b pb-3">
                    Commercials Details
                </h2>
            </div>

            {formData.commercials &&
                Object.values(formData.commercials).some((value) => value) && (
                    <div className="grid gap-4 sm:gap-6 p-2 sm:p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    Business Unit
                                </span>
                                <div className="text-gray-800 font-semibold mt-1">
                                    {formData.commercials.businessUnit}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    Entity
                                </span>
                                <div className="text-gray-800 font-semibold mt-1">
                                    {formData.commercials.entity}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    City
                                </span>
                                <div className="text-gray-800 font-semibold mt-1">
                                    {formData.commercials.city}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    Site
                                </span>
                                <div className="text-gray-800 font-semibold mt-1">
                                    {formData.commercials.site}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    Requestor Details
                                </span>
                                <div className="mt-2 space-y-1">
                                    <div>
                                        <span className="text-gray-500 text-sm">
                                            Name:
                                        </span>
                                        <div className="text-gray-800 font-semibold">
                                            {formData.commercials.userName ||
                                                "N/A"}
                                        </div>
                                    </div>
                                    {formData.commercials.userIdd && (
                                        <div>
                                            <span className="text-gray-500 text-sm">
                                                ID:
                                            </span>
                                            <div className="text-gray-800 font-semibold">
                                                {formData.commercials.userIdd}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500 text-sm">
                                            Department:
                                        </span>
                                        <div className="text-gray-800 font-semibold">
                                            {formData.commercials
                                                .empDepartment || "N/A"}
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
                                            {formData.commercials.hod || "N/A"}
                                        </div>
                                    </div>
                                    {formData.commercials.hodId && (
                                        <div>
                                            <span className="text-gray-500 text-sm">
                                                ID:
                                            </span>
                                            <div className="text-gray-800 font-semibold">
                                                {formData.commercials.hodId}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500 text-sm">
                                            Email:
                                        </span>
                                        <div className="text-gray-800 font-semibold break-words">
                                            {formData.commercials.hodEmail ||
                                                "N/A"}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-sm">
                                            Department:
                                        </span>
                                        <div className="text-gray-800 font-semibold">
                                            {formData.commercials.department ||
                                                "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FIXED: Additional Approver Section with all details */}
                        {(formData.commercials.additionalApprover ||
                            formData.commercials.additionalApproverName ||
                            formData.commercials.additionalApproverEmail) && (
                            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                                <span className="text-gray-600 font-medium">
                                    Additional Approver Details
                                </span>
                                <div className="mt-2 space-y-2">
                                    {formData.commercials
                                        .additionalApproverName && (
                                        <div>
                                            <span className="text-gray-500 text-sm">
                                                Name:
                                            </span>
                                            <div className="text-gray-800 font-semibold">
                                                {
                                                    formData.commercials
                                                        .additionalApproverName
                                                }
                                            </div>
                                        </div>
                                    )}
                                    {formData.commercials
                                        .additionalApprover && (
                                        <div>
                                            <span className="text-gray-500 text-sm">
                                                ID:
                                            </span>
                                            <div className="text-gray-800 font-semibold">
                                                {
                                                    formData.commercials
                                                        .additionalApprover
                                                }
                                            </div>
                                        </div>
                                    )}
                                    {formData.commercials
                                        .additionalApproverEmail && (
                                        <div>
                                            <span className="text-gray-500 text-sm">
                                                Email:
                                            </span>
                                            <div className="text-gray-800 font-semibold break-words">
                                                {
                                                    formData.commercials
                                                        .additionalApproverEmail
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {formData.commercials.additionalApproverProof &&
                                    formData.commercials.additionalApproverProof
                                        .length > 0 && (
                                        <div className="mt-3">
                                            <span className="text-gray-500 text-sm">
                                                Additional Approver Proof:
                                            </span>
                                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {formData.commercials.additionalApproverProof.map(
                                                    (file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex flex-col items-center bg-white rounded p-2 border"
                                                        >
                                                            <a
                                                                href={file}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-600 hover:text-blue-800 truncate max-w-full text-center"
                                                            >
                                                                <img
                                                                    src={
                                                                        pfdIcon
                                                                    }
                                                                    alt={`Proof ${
                                                                        index +
                                                                        1
                                                                    }`}
                                                                    className="w-8 h-8 object-cover mb-1"
                                                                />
                                                                <span>
                                                                    Document{" "}
                                                                    {index + 1}
                                                                </span>
                                                            </a>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        )}

                        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg w-full">
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-4">
                                {/* Bill To Column */}
                                <div className="w-full lg:w-1/2 lg:pr-4">
                                    <span className="text-gray-600 font-medium">
                                        Bill To
                                    </span>
                                    <div className="text-gray-800 font-semibold mt-1">
                                        {formData.commercials.billTo
                                            .split("Tax ID:")[0]
                                            .trim()}
                                    </div>
                                    <div className="text-gray-500 mt-1">
                                        Tax ID:{" "}
                                        {formData.commercials.billTo
                                            .split("Tax ID:")[1]
                                            ?.split("Tax Type:")[0]
                                            .trim()}
                                    </div>
                                    <div className="text-gray-500 mt-1">
                                        Tax Type:{" "}
                                        {formData.commercials.billTo
                                            .split("Tax Type:")[1]
                                            ?.trim()}
                                    </div>
                                </div>

                                {/* Ship To Column */}
                                <div className="w-full lg:w-1/2 lg:pl-4 mt-4 lg:mt-0">
                                    <span className="text-gray-600 font-medium">
                                        Ship To
                                    </span>
                                    <div className="text-gray-800 font-semibold mt-1">
                                        {formData.commercials.shipTo
                                            .split("Tax ID:")[0]
                                            .trim()}
                                    </div>
                                    <div className="text-gray-500 mt-1">
                                        Tax ID:{" "}
                                        {formData.commercials.shipTo
                                            .split("Tax ID:")[1]
                                            ?.split("Tax Type:")[0]
                                            .trim()}
                                    </div>
                                    <div className="text-gray-500 mt-1">
                                        Tax Type:{" "}
                                        {formData.commercials.shipTo
                                            .split("Tax Type:")[1]
                                            ?.trim()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {formData.commercials?.paymentTerms?.length > 0 && (
                <div className="mt-4 sm:mt-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-4">
                        Payment Terms
                    </h3>
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-primary/10">
                                    <tr>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-primary font-semibold">
                                            Percentage
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-primary font-semibold">
                                            Payment Term
                                        </th>
                                        <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-primary font-semibold">
                                            Type
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {formData.commercials.paymentTerms.map(
                                        (term, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-3 sm:px-6 py-3 sm:py-4 text-left font-medium">
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
                </div>
            )}
        </div>
    );
};

export default CommercialSection;
