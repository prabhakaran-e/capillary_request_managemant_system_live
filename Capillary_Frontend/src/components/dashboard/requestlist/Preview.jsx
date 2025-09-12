import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import pfdIcon from "../../../assets/images/pdfIcon.png";
import { formatDateToDDMMYY } from "../../../utils/dateFormat";
import { getAllCurrencyData } from "../../../api/service/adminServices";
import CommercialSection from "./reqpreviewcomponents/CommercialSection";
import ProcurementsSection from "./reqpreviewcomponents/ProcurementsSection";
import SuppliesSection from "./reqpreviewcomponents/SuppliesSection";
import CompliencesSection from "./reqpreviewcomponents/CompliencesSection";
import ApproverSection from "./reqpreviewcomponents/ApproverSection";

const Preview = ({ formData, onSubmit, onBack }) => {
    console.log("FORMDATA", formData);
    const [showDialog, setShowDialog] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: "",
        description: "",
    });
    const [currencies, setCurrencies] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getAllCurrencyData();
            if (response.status === 200) {
                setCurrencies(response.data.data);
            }
        };
        fetchData();
    }, []);

    const openInfoModal = (question, description) => {
        setModalContent({
            title: question,
            description:
                description ||
                "No additional information available for this question.",
        });
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
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
        <div className="w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="space-y-6 p-4 sm:p-6">
                {/* Commercials Section */}
                <CommercialSection formData={formData} />

                {/* Procurements Section */}

                <ProcurementsSection
                    formData={formData}
                    formatDateToDDMMYY={formatDateToDDMMYY}
                    renderUploadedFiles={renderUploadedFiles}
                />

                {/* Product/Services Section */}

                <SuppliesSection
                    formData={formData}
                    parseFloat={parseFloat}
                    formatCurrency={formatCurrency}
                />

                {/* Compliances Section */}

                <CompliencesSection
                    formData={formData}
                    openInfoModal={openInfoModal}
                />
                <ApproverSection formData={formData} />
            </div>

            {/* Footer Actions */}
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t mt-6 sm:mt-8">
                <div></div>
                <button
                    onClick={() => setShowDialog(true)}
                    className="w-full sm:w-auto flex items-center justify-center bg-primary text-white px-4 sm:px-6 py-2 rounded-md hover:bg-primary-dark transition-colors duration-300"
                >
                    <Save className="mr-2" size={20} />
                    Submit
                </button>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {modalContent.title}
                        </h3>

                        <p className="text-gray-600">
                            {modalContent.description}
                        </p>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-xs sm:max-w-sm">
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                            Confirm Submission
                        </h3>
                        <p className="mb-4 sm:mb-6 text-sm sm:text-base">
                            Are you sure you want to submit this form?
                        </p>

                        <div className="flex flex-col sm:flex-row-reverse justify-end gap-3 sm:gap-4">
                            <button
                                onClick={() => {
                                    onSubmit();
                                    setShowDialog(false);
                                }}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary w-full sm:w-auto"
                            >
                                Submit Request
                            </button>

                            <button
                                onClick={() => setShowDialog(false)}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-100 w-full sm:w-auto mt-2 sm:mt-0"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Preview;
