import { ClipboardList } from "lucide-react";
import React from "react";

const SuppliesSection = ({formData,parseFloat,formatCurrency}) => {
    return (
        <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
            <div className="flex items-center space-x-2 text-primary">
                <ClipboardList size={24} />
                <h2 className="text-xl sm:text-2xl font-bold border-b pb-3">
                    Product/Services Details
                </h2>
            </div>

            {formData.supplies?.services?.length > 0 && (
                <div className="mt-4 sm:mt-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-4">
                        Services
                    </h3>
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-primary/10">
                                    <tr>
                                        <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                            Product Names
                                        </th>
                                        <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                            Description
                                        </th>
                                        <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                            Purpose
                                        </th>
                                        <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                            Quantity
                                        </th>
                                        <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                            Price
                                        </th>
                                        <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                            Tax (%)
                                        </th>
                                        <th className="p-2 sm:p-3 text-left text-primary text-sm sm:text-base">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.supplies.services.map(
                                        (service, index) => {
                                            const quantity =
                                                parseFloat(service.quantity) ||
                                                0;
                                            const price =
                                                parseFloat(service.price) || 0;
                                            const tax =
                                                parseFloat(service.tax) || 0;
                                            const total =
                                                quantity *
                                                price *
                                                (1 + tax / 100);

                                            return (
                                                <tr
                                                    key={index}
                                                    className="border-b hover:bg-gray-50"
                                                >
                                                    <td className="p-2 sm:p-3 text-sm">
                                                        {service.productName ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="p-2 sm:p-3 text-sm">
                                                        {service.productDescription ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="p-2 sm:p-3 text-sm">
                                                        {service.productPurpose ||
                                                            "N/A"}
                                                    </td>
                                                    <td className="p-2 sm:p-3 text-sm">
                                                        {service.quantity}
                                                    </td>
                                                    <td className="p-2 sm:p-3 text-sm">
                                                        {formatCurrency(
                                                            service.price
                                                        )}
                                                    </td>
                                                    <td className="p-2 sm:p-3 text-sm">
                                                        {service.tax || "N/A"}
                                                    </td>
                                                    <td className="p-2 sm:p-3 text-sm font-semibold">
                                                        {formatCurrency(total)}
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {formData.supplies?.totalValue !== undefined && (
                <div className="p-3 bg-gray-50 rounded-lg flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-gray-600 font-medium mb-1 sm:mb-0">
                        Total Value
                    </span>
                    <span className="text-gray-800 font-semibold">
                        {formatCurrency(formData.supplies.totalValue)}
                    </span>
                </div>
            )}

            {formData.supplies?.remarks && (
                <div className="mt-4 sm:mt-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-4">
                        Remarks
                    </h3>
                    <p className="bg-gray-50 p-4 rounded-lg text-sm sm:text-base">
                        {formData.supplies.remarks}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SuppliesSection;
