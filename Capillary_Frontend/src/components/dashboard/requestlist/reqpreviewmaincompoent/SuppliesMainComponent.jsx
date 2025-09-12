import React from "react";

const SuppliesMainComponent = ({request,parseFloat,formatCurrency}) => {
    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-primary border-b pb-3">
                Product/Services Details
            </h2>
            {request.supplies?.services?.length > 0 && (
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
                                {request.supplies.services.map(
                                    (service, index) => {
                                        const quantity =
                                            parseFloat(service.quantity) || 0;
                                        const price =
                                            parseFloat(service.price) || 0;
                                        const tax =
                                            parseFloat(service.tax) || 0;
                                        const total =
                                            quantity * price * (1 + tax / 100);

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
                                                    {service.tax || "N/A"}
                                                </td>
                                                <td className="p-3 font-semibold">
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
            )}

            {request.supplies?.totalValue !== undefined && (
                <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                    <span className="text-gray-600 font-medium">
                        Total Value
                    </span>
                    <span className="text-gray-800 font-semibold">
                        {formatCurrency(request.supplies.totalValue)}
                    </span>
                </div>
            )}

            {request.supplies?.remarks && (
                <div className="mt-6">
                    <h3 className="text-xl font-semibold text-primary mb-4">
                        Remarks
                    </h3>
                    <p>{request.supplies.remarks}</p>
                </div>
            )}
        </div>
    );
};

export default SuppliesMainComponent;
