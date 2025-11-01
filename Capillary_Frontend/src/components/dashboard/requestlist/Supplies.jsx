import { useEffect, useState } from "react";
import { Trash2, PlusCircle, CheckCircle2 } from "lucide-react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import {
    getAllCurrencyData,
    saveSuppliesData,
} from "../../../api/service/adminServices";

const validationSchema = Yup.object().shape({
    services: Yup.array().of(
        Yup.object().shape({
            productName: Yup.string().required("Product Name is required"),
            productDescription: Yup.string().required(
                "Product Description is required"
            ),
            quantity: Yup.number()
                .typeError("Quantity must be a number")
                .required("Quantity is required")
                .min(1, "Quantity must be at least 1"),
            price: Yup.number()
                .typeError("Price must be a number")
                .required("Price is required")
                .min(0, "Price cannot be negative"),
        })
    ),
});

const Supplies = ({
    formData,
    setFormData,
    onBack,
    onSubmit,
    handleSubmited,
    onNext,
    reqId,
}) => {
    console.log("reqId", reqId);
    const initialService = {
        productName: "",
        productDescription: "",
        quantity: "",
        price: "",
        tax: "",
    };
    const [services, setServices] = useState(
        formData?.services || [initialService]
    );
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(
        formData.selectedCurrency || "INR"
    );
    const [currencies, setCurrencies] = useState([]);
    const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoadingCurrencies(true);
                const response = await getAllCurrencyData();
                if (response.status === 200) {
                    const currencyData = response.data.data;
                    setCurrencies(currencyData);

                    // Ensure selected currency exists in the fetched data
                    const currencyExists = currencyData.some(
                        (c) => c.code === selectedCurrency
                    );
                    if (!currencyExists && currencyData.length > 0) {
                        const defaultCurrency = currencyData[0].code;
                        setSelectedCurrency(defaultCurrency);
                        setFormData((prevData) => ({
                            ...prevData,
                            selectedCurrency: defaultCurrency,
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching currencies:", error);
            } finally {
                setIsLoadingCurrencies(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (value) => {
        // Safety check for invalid values
        if (isNaN(value) || value === null || value === undefined) {
            value = 0;
        }

        const currency = currencies.find((c) => c.code === selectedCurrency);

        // Add safety checks for currency object
        if (!currency || !currency.locale || !currency.code) {
            // Return simple format if currency data not available
            return `${selectedCurrency} ${value.toFixed(2)}`;
        }

        try {
            return new Intl.NumberFormat(currency.locale, {
                style: "currency",
                currency: currency.code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
        } catch (error) {
            // Fallback if Intl.NumberFormat fails
            console.error("Currency formatting error:", error);
            return `${currency.symbol || currency.code}${value.toFixed(2)}`;
        }
    };

    const handleCurrencyChange = (e) => {
        const newCurrency = e.target.value;
        setSelectedCurrency(newCurrency);
        // Update the parent formData
        setFormData((prevData) => ({
            ...prevData,
            selectedCurrency: newCurrency,
        }));
    };

    const handleServiceChange = (e, index) => {
        const { name, value } = e.target;
        const updatedServices = [...services];
        updatedServices[index][name] = value;
        setServices(updatedServices);
    };

    const handleAddService = () => {
        setServices([...services, { ...initialService }]);
    };

    const handleRemoveService = (index) => {
        if (services.length > 1) {
            const updatedServices = services.filter((_, i) => i !== index);
            setServices(updatedServices);
        }
    };

    const calculateRowTotal = (service) => {
        const quantity = parseFloat(service.quantity || 0);
        const price = parseFloat(service.price || 0);
        const tax = parseFloat(service.tax || 0);
        return Number((quantity * price * (1 + tax / 100)).toFixed(2));
    };

    const totalValue = services.reduce(
        (acc, service) => acc + calculateRowTotal(service),
        0
    );

    const handleSubmit = async () => {
        const submissionData = {
            ...formData,
            services,
            totalValue,
            selectedCurrency,
        };

        try {
            await validationSchema.validate(
                { services },
                { abortEarly: false }
            );
            setFormData((prevFormData) => ({
                ...prevFormData,
                ...submissionData,
            }));
            setIsSubmitted(true);
            if (onSubmit) {
                onSubmit(submissionData);
            }
            const response = await saveSuppliesData(submissionData, reqId);
            console.log("Supplies", response);
            if (response.status === 200) {
                onNext();
            }
        } catch (err) {
            if (err.inner) {
                const errorMessages = err.inner
                    .map((e) => e.message)
                    .join("\n");
                toast.error(errorMessages);
                return;
            }
        }
    };

    return (
        <div className="mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden max-w-full">
            <div className="bg-gradient-to-r from-primary to-primary p-6">
                <h2 className="text-3xl font-extrabold text-white text-center">
                    Product/Services
                </h2>
            </div>

            <div className="p-4 md:p-8 space-y-6">
                {/* Mobile Card View (for small screens) */}
                <div className="lg:hidden space-y-4">
                    {services?.map((service, index) => (
                        <div
                            key={index}
                            className="border rounded-lg p-4 shadow-sm bg-white space-y-3"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-700">
                                    Item {index + 1}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveService(index)}
                                    className={`text-red-500 hover:text-red-700 transition duration-300 ${
                                        services.length === 1
                                            ? "cursor-not-allowed opacity-50"
                                            : ""
                                    }`}
                                    disabled={services.length === 1}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                        Product / Service Name{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="productName"
                                        value={service?.productName}
                                        onChange={(e) =>
                                            handleServiceChange(e, index)
                                        }
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                        placeholder="Product Name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                        Description{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="productDescription"
                                        value={service?.productDescription}
                                        onChange={(e) =>
                                            handleServiceChange(e, index)
                                        }
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 resize-y"
                                        placeholder="Description"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                        Purpose{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="productPurpose"
                                        value={service?.productPurpose}
                                        onChange={(e) =>
                                            handleServiceChange(e, index)
                                        }
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 resize-y"
                                        placeholder="Product Purpose"
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                            Quantity{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={service?.quantity}
                                            onChange={(e) =>
                                                handleServiceChange(e, index)
                                            }
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                            placeholder="Quantity"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                            Price{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={service?.price}
                                            onChange={(e) =>
                                                handleServiceChange(e, index)
                                            }
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                            placeholder="Price"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                            Tax (%)
                                        </label>
                                        <input
                                            type="number"
                                            name="tax"
                                            value={service?.tax}
                                            onChange={(e) =>
                                                handleServiceChange(e, index)
                                            }
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                            placeholder="Tax (%)"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                                            Row Total
                                        </label>
                                        <input
                                            type="text"
                                            value={formatCurrency(
                                                calculateRowTotal(service)
                                            )}
                                            readOnly
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                            placeholder="Row Total"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View (for larger screens) */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b-2 border-gray-200">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Product / Service Name
                                    <span className="text-red-500">*</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Description
                                    <span className="text-red-500">*</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Purpose
                                    <span className="text-red-500">*</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Quantity
                                    <span className="text-red-500">*</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Price<span className="text-red-500">*</span>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tax (%)
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Row Total
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {services?.map((service, index) => (
                                <tr
                                    key={index}
                                    className="border-b hover:bg-gray-50 transition duration-200"
                                >
                                    <td className="px-4 py-4">
                                        <input
                                            type="text"
                                            name="productName"
                                            value={service?.productName}
                                            onChange={(e) =>
                                                handleServiceChange(e, index)
                                            }
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                            placeholder="Product Name"
                                        />
                                    </td>
                                    <td className="px-3 py-4">
                                        <textarea
                                            name="productDescription"
                                            value={service?.productDescription}
                                            onChange={(e) =>
                                                handleServiceChange(e, index)
                                            }
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 resize-y"
                                            placeholder="Description"
                                            rows={3}
                                        />
                                    </td>
                                    <td className="px-3 py-4">
                                        <textarea
                                            name="productPurpose"
                                            value={service?.productPurpose}
                                            onChange={(e) =>
                                                handleServiceChange(e, index)
                                            }
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 resize-y"
                                            placeholder="Product Purpose"
                                            rows={3}
                                        />
                                    </td>
                                    <td className="px-3 py-4">
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={service?.quantity}
                                            onChange={(e) =>
                                                handleServiceChange(e, index)
                                            }
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                            placeholder="Quantity"
                                            min="0"
                                        />
                                    </td>
                                    <td className="px-3 py-4">
                                        <input
                                            type="number"
                                            name="price"
                                            value={service?.price}
                                            onChange={(e) =>
                                                handleServiceChange(e, index)
                                            }
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                            placeholder="Price"
                                            min="0"
                                            step="0.01"
                                        />
                                    </td>
                                    <td className="px-3 py-4">
                                        <input
                                            type="number"
                                            name="tax"
                                            value={service?.tax}
                                            onChange={(e) =>
                                                handleServiceChange(e, index)
                                            }
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                            placeholder="Tax (%)"
                                            min="0"
                                            step="0.01"
                                        />
                                    </td>
                                    <td className="px-3 py-4">
                                        <input
                                            type="text"
                                            value={formatCurrency(
                                                calculateRowTotal(service)
                                            )}
                                            readOnly
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                            placeholder="Row Total"
                                        />
                                    </td>
                                    <td className="px-3 py-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveService(index)
                                            }
                                            className={`text-red-500 hover:text-red-700 transition duration-300 ${
                                                services.length === 1
                                                    ? "cursor-not-allowed opacity-50"
                                                    : ""
                                            }`}
                                            disabled={services.length === 1}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section - Responsive for all screens */}
                <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="font-bold text-gray-700">
                            Total Amount:
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            {isLoadingCurrencies ? (
                                <div className="px-3 py-2 text-gray-500">
                                    Loading currencies...
                                </div>
                            ) : currencies.length > 0 ? (
                                <select
                                    value={selectedCurrency}
                                    onChange={handleCurrencyChange}
                                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 w-full sm:w-auto"
                                >
                                    {currencies.map((currency) => (
                                        <option
                                            key={currency.code}
                                            value={currency.code}
                                        >
                                            {currency.code} ({currency.symbol})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="px-3 py-2 text-red-500">
                                    Error loading currencies
                                </div>
                            )}
                            <div className="font-bold text-blue-600 text-lg">
                                {formatCurrency(totalValue)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <button
                        type="button"
                        onClick={handleAddService}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition duration-300 shadow-md hover:shadow-lg"
                    >
                        <PlusCircle className="w-5 h-5" />
                        Add Product/Service
                    </button>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Remarks
                    </label>
                    <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                remarks: e.target.value,
                            })
                        }
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-300"
                        placeholder="Enter additional remarks or notes here..."
                    />
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                    <div></div>
                    <button
                        onClick={handleSubmit}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary transition-colors flex items-center justify-center order-1 sm:order-2"
                    >
                        <CheckCircle2 className="mr-2" /> Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Supplies;
