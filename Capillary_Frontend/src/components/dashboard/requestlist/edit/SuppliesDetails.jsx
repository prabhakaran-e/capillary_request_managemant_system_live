import { useState } from "react";
import { Trash2, PlusCircle, CheckCircle2 } from "lucide-react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { saveSuppliesData } from "../../../../api/service/adminServices";

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

const Supplies = ({
    formData,
    setFormData,
    onBack,
    onSubmit,
    onNext,
    reqId,
}) => {
   
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
        formData?.selectedCurrency || "INR"
    );

    const formatCurrency = (value) => {
        const currency = currencies.find((c) => c.code === selectedCurrency);
        return new Intl.NumberFormat(currency.locale, {
            style: "currency",
            currency: currency.code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
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
        <div className="mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary p-6">
            <h2 className="text-3xl font-extrabold text-white text-center">
                Product/Services
            </h2>
        </div>

        <div className="p-8 space-y-6">
            <div className="overflow-x-auto">
                {/* Desktop Table */}
                <table className="w-full border-collapse hidden md:table">
                    <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-56">
                                Product / Service Name
                                <span className="text-red-500">*</span>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-56">
                                Product / Service Description
                                <span className="text-red-500">*</span>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-56">
                                Product / Service Purpose
                                <span className="text-red-500">*</span>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">
                                Quantity
                                <span className="text-red-500">*</span>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-2">
                                Price<span className="text-red-500">*</span>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                                Tax (%)
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
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
                                <td className="px-4 w-24">
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
                                <td className="px-3 py-5 w-56">
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
                                <td className="px-3 py-4 w-56">
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
                                <td className="px-3 py-4 w-28">
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
                                <td className="px-3 py-4 w-48">
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
                                <td className="px-3 py-4 w-28">
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
                                <td className="px-3 py-4 w-52">
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
                    <tfoot>
                        <tr className="bg-gray-100">
                            <td
                                colSpan="4"
                                className="px-4 py-3 font-bold text-gray-700"
                            >
                                Total Amount:
                            </td>
                            <td className="px-4 py-3">
                                <select
                                    value={selectedCurrency}
                                    onChange={handleCurrencyChange}
                                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
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
                            </td>
                            <td className="px-4 py-3 font-bold text-blue-600">
                                {formatCurrency(totalValue)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {services?.map((service, index) => (
                        <div 
                            key={index} 
                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Product Name
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
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Quantity
                                        <span className="text-red-500">*</span>
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
                            </div>

                            <div className="mt-4">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Description
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
                                    rows={3}
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Product Purpose
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
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                                        Price
                                        <span className="text-red-500">*</span>
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
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
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
                            </div>

                            <div className="mt-4 flex justify-between items-center">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">
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
                        </div>
                    ))}
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
            <div className="mt-4 md:hidden">
                <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                    <span className="font-bold text-gray-700">Total Amount:</span>
                    <div className="flex items-center space-x-2">
                        <select
                            value={selectedCurrency}
                            onChange={handleCurrencyChange}
                            className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
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
                        <span className="font-bold text-blue-600">
                            {formatCurrency(totalValue)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Remarks
                </label>
                <textarea
                    name="remarks"
                    value={formData?.remarks}
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

            <div className="mt-8 flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                {/* <button
                    onClick={onBack}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary transition duration-300 ease-in-out"
                >
                    Back
                </button> */}
                <div></div>
                <button
                    onClick={handleSubmit}
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary transition-colors flex items-center justify-center"
                >
                    <CheckCircle2 className="mr-2" /> Next
                </button>
            </div>

            
        </div>
    </div>
    );
};

export default Supplies;
