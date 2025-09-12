import { useEffect, useState } from "react";
import {
    FileText,
    Truck,
    CreditCard,
    Check,
    Loader2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
    fetchIndividualReq,
    updateRequest,
} from "../../../../api/service/adminServices";
import CommercialsDetails from "./CommercialsDetails";
import ProcurementsDetails from "./ProcurementsDetails";
import SuppliesDetails from "./SuppliesDetails";
import AggrementDetails from "./AggrementDetails";
import PreviewDetails from "./PreviewDetails";

const EditRequestForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const empId = localStorage.getItem("capEmpId");

    const [completedSteps, setCompletedSteps] = useState([]);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expandedSteps, setExpandedSteps] = useState([0, 1, 2, 3, 4]); // All steps expanded by default
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResponse = async () => {
            try {
                setIsLoading(true);
                const response = await fetchIndividualReq(id);
                console.log("response.data.data", response.data.data);
                if (response.status === 200) {
                    setFormData(response.data.data);
                    // Mark all steps as completed since we have existing data
                    setCompletedSteps([0, 1, 2, 3, 4]);
                }
            } catch (error) {
                console.error("Error fetching request data:", error);
                toast.error("Failed to load request data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchResponse();
    }, [id]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            console.log("Form Submitted:", formData);
            const response = await updateRequest(empId, formData);
            console.log("response updated", response);
            if (response.status === 200) {
                toast.success("Request is updated");
                setTimeout(() => {
                    navigate(`/req-list-table/preview-one-req/${id}`);
                }, 1500);
            }
        } catch (err) {
            console.log("Error in submit req", err);
            toast.error("Failed to update request");
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        {
            title: "Commercials",
            icon: FileText,
            description: "Edit commercial details and information",
            content: (
                <CommercialsDetails
                    formData={formData?.commercials}
                    setFormData={(data) =>
                        setFormData((prev) => ({
                            ...prev,
                            commercials:
                                typeof data === "function"
                                    ? data(prev?.commercials)
                                    : data,
                        }))
                    }
                    onNext={() => handleStepComplete(0)}
                    reqId={id}
                />
            ),
        },
        {
            title: "Procurements",
            icon: CreditCard,
            description: "Edit procurement details and requirements",
            content: (
                <ProcurementsDetails
                    formData={formData?.procurements}
                    setFormData={(data) =>
                        setFormData((prev) => ({
                            ...prev,
                            procurements:
                                typeof data === "function"
                                    ? data(prev?.procurements)
                                    : data,
                        }))
                    }
                    onNext={() => handleStepComplete(1)}
                    onBack={() => {}}
                    reqId={formData.reqid}
                />
            ),
        },
        {
            title: "Supplies",
            icon: Truck,
            description: "Edit supply items and logistics information",
            content: (
                <SuppliesDetails
                    formData={formData?.supplies}
                    setFormData={(data) =>
                        setFormData((prev) => ({
                            ...prev,
                            supplies:
                                typeof data === "function"
                                    ? data(prev?.supplies)
                                    : data,
                        }))
                    }
                    remarks={formData?.remarks}
                    onBack={() => {}}
                    onNext={() => handleStepComplete(2)}
                    reqId={formData.reqid}
                />
            ),
        },
        {
            title: "Agreement Compliances",
            icon: FileText,
            description: "Edit compliance requirements",
            content: (
                <AggrementDetails
                    formData={formData}
                    setFormData={(data) =>
                        setFormData((prev) => {
                            const newData =
                                typeof data === "function" ? data(prev) : data;
                            return {
                                ...prev,
                                complinces: Array.isArray(newData.complinces)
                                    ? newData.complinces
                                    : prev.complinces || [],
                            };
                        })
                    }
                    onSubmit={handleSubmit}
                    onBack={() => {}}
                    onNext={() => handleStepComplete(3)}
                    reqId={formData.reqid}
                />
            ),
        },
        {
            title: "Preview",
            icon: Check,
            description: "Review all changes before updating",
            content: (
                <PreviewDetails
                    formData={formData}
                    onSubmit={handleSubmit}
                    onBack={() => {}}
                    isSubmitting={isSubmitting}
                />
            ),
        },
    ];

    const handleStepComplete = (stepIndex) => {
        console.log("Step completed:", stepIndex, formData);
        if (!completedSteps.includes(stepIndex)) {
            setCompletedSteps([...completedSteps, stepIndex]);
        }
    };

    const toggleStepExpansion = (stepIndex) => {
        setExpandedSteps((prev) => {
            if (prev.includes(stepIndex)) {
                return prev.filter((index) => index !== stepIndex);
            } else {
                return [...prev, stepIndex];
            }
        });
    };

    // Show loading state while fetching data
    if (isLoading) {
        return (
            <div className="w-full mx-auto bg-gray-50 p-4 sm:p-6 flex items-center justify-center min-h-64">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-gray-700">
                        Loading request data...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto bg-gray-50 p-2 sm:p-4 md:p-6">
            {isSubmitting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-gray-700">
                            Updating request...
                        </span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Edit Request #{formData?.reqid}
                </h1>
                <p className="text-gray-600">
                    Modify the sections below as needed. All sections are loaded
                    with existing data.
                </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Sections Loaded</span>
                    <span>
                        {completedSteps.length} of {steps.length} sections
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${
                                (completedSteps.length / steps.length) * 100
                            }%`,
                        }}
                    />
                </div>
            </div>

            {/* All Steps Displayed Vertically */}
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = completedSteps.includes(index);
                    const isExpanded = expandedSteps.includes(index);

                    return (
                        <div
                            key={index}
                            id={`step-${index}`}
                            className={`bg-white rounded-lg border transition-all duration-200 ${
                                isCompleted
                                    ? "border-green-300 shadow-md"
                                    : isExpanded
                                    ? "border-primary shadow-lg"
                                    : "border-gray-200 shadow-sm"
                            }`}
                        >
                            {/* Step Header */}
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleStepExpansion(index)}
                            >
                                <div className="flex items-center space-x-4">
                                    {/* Step Icon */}
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                                            isCompleted
                                                ? "border-green-500 bg-green-500 text-white"
                                                : isExpanded
                                                ? "border-primary bg-primary text-white"
                                                : "border-gray-300 bg-gray-100 text-gray-400"
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-6 h-6" />
                                        ) : (
                                            <StepIcon className="w-6 h-6" />
                                        )}
                                    </div>

                                    {/* Step Info */}
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3
                                                className={`font-semibold text-lg ${
                                                    isCompleted
                                                        ? "text-green-700"
                                                        : isExpanded
                                                        ? "text-primary"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {index + 1}. {step.title}
                                            </h3>
                                            {isCompleted && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                    Loaded
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Expand/Collapse Icon */}
                                <div className="flex-shrink-0">
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>

                            {/* Step Content */}
                            {isExpanded && (
                                <div className="px-4 pb-4">
                                    <div className="border-t border-gray-200 pt-4">
                                        {step.content}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                pauseOnFocusLoss
            />
        </div>
    );
};

export default EditRequestForm;
