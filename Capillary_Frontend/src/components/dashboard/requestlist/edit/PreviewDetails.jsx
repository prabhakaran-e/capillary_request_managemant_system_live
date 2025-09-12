import { useState } from "react";
import {
    CheckCircle2,
    Package,
    DollarSign,
    ClipboardList,
    FileText,
    ArrowLeft,
    Save,
    FileIcon,
    User,
} from "lucide-react";
import pfdIcon from "../../../../assets/images/pdfIcon.png";
import { formatDateToDDMMYY } from "../../../../utils/dateFormat";

const currencies = [
    { code: "USD", symbol: "$", locale: "en-US" },
    { code: "EUR", symbol: "€", locale: "de-DE" },
    { code: "GBP", symbol: "£", locale: "en-GB" },
    { code: "INR", symbol: "₹", locale: "en-IN" },
    { code: "AED", symbol: "د.إ", locale: "ar-AE" },
    { code: "IDR", symbol: "Rp", locale: "id-ID" },
    { code: "MYR", symbol: "RM", locale: "ms-MY" },
    { code: "SGD", symbol: "S$", locale: "en-SG" },
    { code: "PHP", symbol: "₱", locale: "fil-PH" },
];

const Preview = ({ formData, onSubmit, onBack }) => {
    console.log("Preview formData", formData);
    const [showDialog, setShowDialog] = useState(false);
    const formatCurrency = (value) => {
        const currency = currencies.find(
            (c) => c.code === formData.supplies.selectedCurrency
        );
        if (!currency || !value) return "N/A";

        return new Intl.NumberFormat(currency.locale, {
            style: "currency",
            currency: currency.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const renderUploadedFiles = (uploadedFiles) => {
        if (!uploadedFiles || Object.keys(uploadedFiles)?.length === 0) {
            return <div className="text-gray-500">No files uploaded</div>;
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(uploadedFiles).map(
                    ([key, files]) =>
                        files &&
                        files.length > 0 && (
                            <div
                                key={key}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                            >
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 capitalize border-b pb-2">
                                    {key
                                        .replace(/([A-Z])/g, " $1")
                                        .toLowerCase()}
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center bg-gray-50 rounded p-2"
                                        >
                                            <a
                                                href={file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-800 truncate max-w-full text-center"
                                            >
                                                {" "}
                                                <img
                                                    src={pfdIcon}
                                                    alt={`Icon ${index + 1}`}
                                                    className="w-10 h-10 object-cover mb-2"
                                                />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                )}
            </div>
        );
    };

    return (
        <div className="max-w-8xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="space-y-8 p-6">
                {/* Commercials Section */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-2 text-primary">
                        <DollarSign size={24} />
                        <h2 className="text-2xl font-bold border-b pb-3">
                            Commercials Details
                        </h2>
                    </div>

                    {formData.commercials &&
                        Object.values(formData.commercials).some(
                            (value) => value
                        ) && (
                            <div className="grid gap-6 p-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Business Unit
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.businessUnit}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Entity
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.entity}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            City
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.city}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Site
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.site}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Cost Centre
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.costCentre}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Department
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.department}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Head of Department
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.hod}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-4 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Payment Mode
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.paymentMode}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Credit Card Selected
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials
                                                .isCreditCardSelected
                                                ? "Yes"
                                                : "No"}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Bill To
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.billTo}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <span className="text-gray-600 font-medium">
                                            Ship To
                                        </span>
                                        <div className="text-gray-800 font-semibold mt-1">
                                            {formData.commercials.shipTo}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    {formData.commercials?.paymentTerms?.length > 0 && (
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
                                        {formData.commercials.paymentTerms.map(
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

                {/* Procurements Section */}
                <div className="space-y-6 mt-8">
                    <div className="flex items-center space-x-2 text-primary">
                        <Package size={24} />
                        <h2 className="text-2xl font-bold border-b pb-3">
                            Procurements Details
                        </h2>
                    </div>

                    {formData.procurements &&
                        Object.values(formData.procurements).some(
                            (value) => value
                        ) && (
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    {
                                        label: "Vendor ID",
                                        value: formData.procurements.vendor,
                                    },
                                    {
                                        label: "Vendor Name",
                                        value: formData.procurements.vendorName,
                                    },
                                    {
                                        label: "Quotation Number",
                                        value: formData.procurements
                                            .quotationNumber,
                                    },
                                    {
                                        label: "Quotation Date",
                                        value: formData.procurements
                                            .quotationDate
                                            ? formatDateToDDMMYY(
                                                  formData.procurements
                                                      .quotationDate
                                              )
                                            : null,
                                    },
                                    {
                                        label: "Service Period",
                                        value: formData.procurements
                                            .servicePeriod,
                                    },
                                    {
                                        label: "PO Valid From",
                                        value: formData.procurements.poValidFrom
                                            ? formatDateToDDMMYY(
                                                  formData.procurements
                                                      .poValidFrom
                                              )
                                            : null,
                                    },
                                    {
                                        label: "PO Valid To",
                                        value: formData.procurements.poValidTo
                                            ? formatDateToDDMMYY(
                                                  formData.procurements
                                                      .poValidTo
                                              )
                                            : null,
                                    },
                                ]
                                    .filter((item) => item.value)
                                    .map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-gray-600 font-medium">
                                                {item.label}
                                            </span>
                                            <span className="text-gray-800 font-semibold">
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}

                    {formData.procurements?.uploadedFiles && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-primary mb-4">
                                Uploaded Files
                            </h3>
                            <div className="bg-white shadow-md rounded-lg p-4">
                                {Object.keys(
                                    formData.procurements.uploadedFiles
                                ).length > 0 ? (
                                    <div className="text-green-600 flex items-center mb-4">
                                        <CheckCircle2
                                            className="mr-2"
                                            size={20}
                                        />
                                        Files uploaded successfully
                                    </div>
                                ) : (
                                    <div className="text-gray-500 flex items-center">
                                        No files uploaded
                                    </div>
                                )}
                                {renderUploadedFiles(
                                    formData.procurements.uploadedFiles
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Product/Services Section */}
                {/* <div className="space-y-6 mt-8">
                    <div className="flex items-center space-x-2 text-primary">
                        <ClipboardList size={24} />
                        <h2 className="text-2xl font-bold border-b pb-3">
                            Product/Services Details
                        </h2>
                    </div>

                    {formData.supplies?.services?.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-primary mb-4">
                                Services
                            </h3>
                            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-primary/10">
                                        <tr>
                                            <th className="p-3 text-left text-primary">
                                                Product Names
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Description
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Quantity
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Price
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Tax (%)
                                            </th>
                                            <th className="p-3 text-left text-primary">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.supplies.services.map(
                                            (service, index) => {
                                                const quantity =
                                                    parseFloat(
                                                        service.quantity
                                                    ) || 0;
                                                const price =
                                                    parseFloat(service.price) ||
                                                    0;
                                                const tax =
                                                    parseFloat(service.tax) ||
                                                    0;
                                                const total =
                                                    quantity *
                                                    price *
                                                    (1 + tax / 100);

                                                return (
                                                    <tr
                                                        key={index}
                                                        className="border-b hover:bg-gray-50"
                                                    >
                                                        <td className="p-3">
                                                            {service.productName ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-3">
                                                            {service.productDescription ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-3">
                                                            {service.quantity}
                                                        </td>
                                                        <td className="p-3">
                                                            {formatCurrency(
                                                                service.price
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {service.tax ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-3 font-semibold">
                                                            {formatCurrency(
                                                                total
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {formData.supplies?.totalValue !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                            <span className="text-gray-600 font-medium">
                                Total Value
                            </span>
                            <span className="text-gray-800 font-semibold">
                                {formatCurrency(formData.supplies.totalValue)}
                            </span>
                        </div>
                    )}

                    {formData.supplies?.remarks && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-primary mb-4">
                                Remarks
                            </h3>
                            <p className="bg-gray-50 p-4 rounded-lg">
                                {formData.supplies.remarks}
                            </p>
                        </div>
                    )}
                </div> */}

                <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold text-primary border-b pb-3">
                        Product/Services Details
                    </h2>
                    {formData.supplies?.services?.length > 0 && (
                        <div className="mt-6">
                            <div className="overflow-x-auto w-full">
                                <table className="min-w-full bg-white shadow-md rounded-lg">
                                    <thead className="bg-primary/10">
                                        <tr>
                                            <th className="p-3 text-left text-primary min-w-40">
                                                Product Names
                                            </th>
                                            <th className="p-3 text-left text-primary min-w-48">
                                                Description
                                            </th>
                                            <th className="p-3 text-left text-primary min-w-40">
                                                Purpose
                                            </th>
                                            <th className="p-3 text-left text-primary min-w-24">
                                                Quantity
                                            </th>
                                            <th className="p-3 text-left text-primary min-w-24">
                                                Price
                                            </th>
                                            <th className="p-3 text-left text-primary min-w-20">
                                                Tax (%)
                                            </th>
                                            <th className="p-3 text-left text-primary min-w-24">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.supplies.services.map(
                                            (service, index) => {
                                                const quantity =
                                                    parseFloat(
                                                        service.quantity
                                                    ) || 0;
                                                const price =
                                                    parseFloat(service.price) ||
                                                    0;
                                                const tax =
                                                    parseFloat(service.tax) ||
                                                    0;
                                                const total =
                                                    quantity *
                                                    price *
                                                    (1 + tax / 100);

                                                return (
                                                    <tr
                                                        key={index}
                                                        className="border-b hover:bg-gray-50"
                                                    >
                                                        <td className="p-3">
                                                            <div className="whitespace-normal break-words max-w-40">
                                                                {service.productName ||
                                                                    "N/A"}
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="whitespace-normal break-words max-w-48">
                                                                {service.productDescription ||
                                                                    "N/A"}
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="whitespace-normal break-words max-w-40">
                                                                {service.productPurpose ||
                                                                    "N/A"}
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            {service.quantity}
                                                        </td>
                                                        <td className="p-3">
                                                            {formatCurrency(
                                                                service.price
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {service.tax ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="p-3 font-semibold">
                                                            {formatCurrency(
                                                                total
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {formData.supplies?.totalValue !== undefined && (
                        <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                            <span className="text-gray-600 font-medium">
                                Total Value
                            </span>
                            <span className="text-gray-800 font-semibold">
                                {formatCurrency(formData.supplies.totalValue)}
                            </span>
                        </div>
                    )}

                    {formData.supplies?.remarks && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold text-primary mb-4">
                                Remarks
                            </h3>
                            <p>{formData.supplies.remarks}</p>
                        </div>
                    )}
                </div>

                {/* Compliances Section */}
                <div className="space-y-6 mt-8">
                    <div className="flex items-center space-x-2 text-primary">
                        <FileText size={24} />
                        <h2 className="text-2xl font-bold border-b pb-3">
                            Compliances Details
                        </h2>
                    </div>

                    {formData.complinces && formData?.complinces ? (
                        <div className="space-y-4">
                            {Object.keys(formData?.complinces)?.length > 0 ? (
                                Object.entries(formData?.complinces)?.map(
                                    ([questionId, compliance], index) => (
                                        <div
                                            key={questionId}
                                            className={`p-4 rounded-lg ${
                                                compliance.expectedAnswer !==
                                                compliance.answer
                                                    ? "bg-red-50 border border-red-200"
                                                    : "bg-green-50 border border-green-200"
                                            }`}
                                        >
                                            <h3
                                                className={`text-lg font-semibold ${
                                                    compliance.expectedAnswer !==
                                                    compliance.answer
                                                        ? "text-red-800"
                                                        : "text-green-800"
                                                }`}
                                            >
                                                {compliance.question}
                                            </h3>
                                            <p
                                                className={`mt-2 font-medium ${
                                                    compliance.expectedAnswer !==
                                                    compliance.answer
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                {compliance.answer
                                                    ? "Yes"
                                                    : "No"}
                                            </p>
                                            {compliance.department && (
                                                <p className="mt-2 text-sm text-gray-600">
                                                    <strong>Department:</strong>{" "}
                                                    {compliance.department}
                                                </p>
                                            )}
                                            {compliance.deviation &&
                                                compliance.expectedAnswer !==
                                                    compliance.answer && (
                                                    <div className="mt-2 p-3 bg-red-100 rounded">
                                                        <p className="text-sm text-red-700">
                                                            <strong>
                                                                Deviation
                                                                Reason:
                                                            </strong>{" "}
                                                            {
                                                                compliance
                                                                    .deviation
                                                                    .reason
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                            {compliance?.deviation?.attachments
                                                ?.length > 0 && (
                                                <div className="mt-4">
                                                    <strong className="text-red-700">
                                                        Attachments:
                                                    </strong>
                                                    <ul className="list-disc pl-6 mt-2">
                                                        {compliance?.deviation?.attachments.map(
                                                            (attachment, i) => (
                                                                <li key={i}>
                                                                    <a
                                                                        href={
                                                                            attachment
                                                                        }
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-red-600 hover:text-red-800 underline"
                                                                    >
                                                                        Attachment{" "}
                                                                        {i + 1}
                                                                    </a>
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

                <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
                    <div className="flex items-center gap-3 mb-6">
                        <User className="w-8 h-8 text-blue-600" />
                        <h3 className="font-semibold text-2xl">Approver</h3>
                    </div>

                    <div className="flex items-center gap-8 p-4">
                        <div>
                            <div className="text-gray-600 text-sm">
                                Department
                            </div>
                            <div className="font-medium">
                                {formData.commercials.department}
                            </div>
                        </div>

                        <div>
                            <div className="text-gray-600 text-sm">
                                Head of Department
                            </div>
                            <div className="font-medium">
                                {formData.commercials.hod || "No HOD found"}
                            </div>
                        </div>

                        <div>
                            <div className="text-gray-600 text-sm">
                                HOD Email
                            </div>
                            <div className="font-medium">
                                {formData?.commercials?.hodEmail ||
                                    "No email found"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 flex justify-between items-center border-t mt-8">
                {/* <button
                    onClick={onBack}
                    className="px-4 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary transition duration-300 ease-in-out flex items-center gap-2"
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back
                </button> */}
                <div></div>
                <button
                    onClick={() => setShowDialog(true)}
                    className="flex items-center bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors duration-300"
                >
                    <Save className="mr-2" size={20} />
                    Submit
                </button>
            </div>
            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-xl font-semibold mb-4">
                            Confirm Submission
                        </h3>
                        <p className="mb-6">
                            Are you sure you want to submit this form?
                        </p>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDialog(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onSubmit();

                                    setShowDialog(false);
                                }}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Preview;
