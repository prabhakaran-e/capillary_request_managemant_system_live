import React, { useEffect, useState } from "react";
import {
    FileText,
    Truck,
    CreditCard,
    Check,
    Loader2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import Supplies from "./Supplies";
import Procurements from "./Procurements";
import Commercials from "./Commercials";
import Preview from "./Preview";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
    createNewRequest,
    updateRequest,
    // getRequestById,
    getNewReqId,
} from "../../../api/service/adminServices";
import AgreementCompliences from "./AgreementCompliences";

const CreateEditRequest = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const empId = localStorage.getItem("capEmpId");
    
    const [completedSteps, setCompletedSteps] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [reqId, setReqId] = useState(id || null);
    const [expandedSteps, setExpandedSteps] = useState([0]);
    const [isEditMode, setIsEditMode] = useState(!!id);

    const [formData, setFormData] = useState({
        commercials: {},
        procurements: {},
        supplies: [],
        remarks: "",
        complinces: [],
    });

    // Load existing request data if in edit mode
    useEffect(() => {
        const loadRequestData = async () => {
            if (id) {
                setIsLoading(true);
                try {
                    const response = await getRequestById(id);
                    if (response.status === 200 && response.data) {
                        const requestData = response.data;
                        
                        // Transform the data to match your form structure
                        setFormData({
                            commercials: requestData.commercials || {},
                            procurements: requestData.procurements || {},
                            supplies: requestData.supplies || [],
                            remarks: requestData.remarks || "",
                            complinces: requestData.complinces || [],
                        });

                        // If editing, mark all steps as completed initially
                        // or determine completion based on data availability
                        const completedStepIndices = [];
                        if (requestData.commercials && Object.keys(requestData.commercials).length > 0) {
                            completedStepIndices.push(0);
                        }
                        if (requestData.procurements && Object.keys(requestData.procurements).length > 0) {
                            completedStepIndices.push(1);
                        }
                        if (requestData.supplies && requestData.supplies.length > 0) {
                            completedStepIndices.push(2);
                        }
                        if (requestData.complinces && requestData.complinces.length > 0) {
                            completedStepIndices.push(3);
                        }
                        
                        setCompletedSteps(completedStepIndices);
                        setReqId(id);
                    }
                } catch (error) {
                    console.error("Error loading request data:", error);
                    toast.error("Failed to load request data");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadRequestData();
    }, [id]);

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const transformedData = {
                ...formData,
                complinces: Object.values(formData.complinces).map(
                    (compliance) => ({
                        questionId: compliance.questionId,
                        question: compliance.question,
                        answer: compliance.answer,
                        department: compliance.department,
                        expectedAnswer: compliance.expectedAnswer,
                        deviation: compliance.deviation
                            ? {
                                  reason: compliance.deviation.reason,
                                  attachments: compliance.deviation.attachments,
                              }
                            : null,
                    })
                ),
            };

            let response;
            if (isEditMode) {
                // Update existing request
                response = await updateRequest(id, empId, transformedData);
                if (response.status === 200) {
                    toast.success("Request updated successfully");
                    setTimeout(() => {
                        navigate("/req-list-table");
                    }, 1500);
                }
            } else {
                // Create new request
                response = await createNewRequest(
                    empId,
                    transformedData,
                    transformedData?.commercials?.newReqId
                );
                if (response.status === 200) {
                    toast.success("New Request created successfully");
                    setTimeout(() => {
                        navigate("/req-list-table");
                    }, 1500);
                }
            }
        } catch (err) {
            console.error("Error in submit req", err);
            toast.error(isEditMode ? "Failed to update request" : "Failed to create request");
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        {
            title: "Commercials",
            icon: FileText,
            description: "Enter commercial details and information",
            content: (
                <Commercials
                    formData={formData.commercials}
                    setFormData={(data) =>
                        setFormData((prev) => ({
                            ...prev,
                            commercials:
                                typeof data === "function"
                                    ? data(prev.commercials)
                                    : data,
                        }))
                    }
                    onNext={() => handleStepComplete(0)}
                    setReqId={setReqId}
                    reqId={reqId}
                    isEditMode={isEditMode}
                />
            ),
        },
        {
            title: "Procurements",
            icon: CreditCard,
            description: "Manage procurement details and requirements",
            content: (
                <Procurements
                    formData={formData.procurements}
                    setFormData={(data) =>
                        setFormData((prev) => ({
                            ...prev,
                            procurements:
                                typeof data === "function"
                                    ? data(prev.procurements)
                                    : data,
                        }))
                    }
                    onNext={() => handleStepComplete(1)}
                    onBack={() => {}}
                    reqId={reqId}
                    isEditMode={isEditMode}
                />
            ),
        },
        {
            title: "Supplies",
            icon: Truck,
            description: "Add supply items and logistics information",
            content: (
                <Supplies
                    formData={formData.supplies}
                    setFormData={(data) =>
                        setFormData((prev) => ({
                            ...prev,
                            supplies:
                                typeof data === "function"
                                    ? data(prev.supplies)
                                    : data,
                        }))
                    }
                    remarks={formData.remarks}
                    onBack={() => {}}
                    onNext={() => handleStepComplete(2)}
                    reqId={reqId}
                    isEditMode={isEditMode}
                />
            ),
        },
        {
            title: "Agreement Compliance",
            icon: FileText,
            description: "Review and complete compliance requirements",
            content: (
                <AgreementCompliences
                    formData={formData}
                    setFormData={setFormData}
                    onBack={() => {}}
                    onNext={() => handleStepComplete(3)}
                    reqId={reqId}
                    isEditMode={isEditMode}
                />
            ),
        },
        {
            title: "Preview",
            icon: Check,
            description: "Review all information before submission",
            content: (
                <Preview
                    formData={formData}
                    onSubmit={handleSubmit}
                    onBack={() => {}}
                    isEditMode={isEditMode}
                />
            ),
        },
    ];

    const handleStepComplete = (stepIndex) => {
        console.log("formData", formData, reqId);
        if (!completedSteps.includes(stepIndex)) {
            setCompletedSteps([...completedSteps, stepIndex]);
        }

        // Auto-expand next step when current step is completed
        if (stepIndex + 1 < steps.length) {
            toggleStepExpansion(stepIndex + 1);
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

    const isStepAccessible = (stepIndex) => {
        if (stepIndex === 0) return true;
        // In edit mode, allow access to all steps
        if (isEditMode) return true;
        return completedSteps.includes(stepIndex - 1);
    };

    // Show loading spinner while fetching data
    if (isLoading) {
        return (
            <div className="w-full mx-auto bg-gray-50 p-2 sm:p-4 md:p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-gray-700">Loading request data...</span>
                    </div>
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
                            {isEditMode ? "Updating request..." : "Creating request..."}
                        </span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {isEditMode ? `Edit Request ${reqId}` : "Create Request"}
                </h1>
                <p className="text-gray-600">
                    {isEditMode 
                        ? "Modify the information below to update your request."
                        : "Complete all steps below to create your request. Click on each step to expand and fill the required information."
                    }
                </p>
            </div>

            {/* All Steps Displayed Vertically */}
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = completedSteps.includes(index);
                    const isExpanded = expandedSteps.includes(index);
                    const isAccessible = isStepAccessible(index);

                    return (
                        <div
                            key={index}
                            className={`bg-white rounded-lg border transition-all duration-200 ${
                                isCompleted
                                    ? "border-green-300 shadow-md"
                                    : isExpanded
                                    ? "border-primary shadow-lg"
                                    : "border-gray-200 shadow-sm"
                            } ${!isAccessible ? "opacity-60" : ""}`}
                        >
                            {/* Step Header */}
                            <div
                                className={`flex items-center justify-between p-4 cursor-pointer ${
                                    isAccessible
                                        ? "hover:bg-gray-50"
                                        : "cursor-not-allowed"
                                }`}
                                onClick={() =>
                                    isAccessible && toggleStepExpansion(index)
                                }
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
                                                    Completed
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Expand/Collapse Icon */}
                                {isAccessible && (
                                    <div className="flex-shrink-0">
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Step Content */}
                            {isExpanded && isAccessible && (
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

export default CreateEditRequest;