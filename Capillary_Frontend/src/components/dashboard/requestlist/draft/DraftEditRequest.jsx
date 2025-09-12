import { useState } from "react";
import { FileText, Truck, CreditCard, Check, Loader2 } from "lucide-react";
import Supplies from "./Supplies";
import Procurements from "./Procurements";
import Commercials from "./Commercials";
import Preview from "./Preview";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { createNewRequest } from "../../../api/service/adminServices";
import AgreementCompliences from "./AgreementCompliences";

const DraftEditRequest = () => {
    const navigate = useNavigate();
    const empId = localStorage.getItem("capEmpId");
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        commercials: {},
        procurements: {},
        supplies: [],
        remarks: "",
        complinces: [],
    });

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
                        deviation: compliance.deviation
                            ? {
                                  reason: compliance.deviation.reason,
                                  attachments: compliance.deviation.attachments,
                              }
                            : null,
                    })
                ),
            };

            const response = await createNewRequest(empId, transformedData);
            console.log(response);
            if (response.status === 201) {
                toast.success("New Request is created");
                setTimeout(() => {
                    navigate("/req-list-table");
                }, 1500);
            }
        } catch (err) {
            console.log("Error in submit req", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        {
            title: "Commercials",
            icon: FileText,
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
                />
            ),
        },
        {
            title: "Procurements",
            icon: CreditCard,
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
                    onBack={() => setCurrentStep(0)}
                />
            ),
        },
        {
            title: "Supplies",
            icon: Truck,
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
                    onBack={() => setCurrentStep(1)}
                    onNext={() => handleStepComplete(2)}
                />
            ),
        },
        {
            title: "Agreement Compliance",
            icon: FileText,
            content: (
                <AgreementCompliences
                    formData={formData}
                    setFormData={setFormData}
                    onBack={() => setCurrentStep(2)}
                    onNext={() => handleStepComplete(3)}
                />
            ),
        },
        {
            title: "Preview",
            icon: Check,
            content: (
                <Preview
                    formData={formData}
                    onSubmit={handleSubmit}
                    onBack={() => setCurrentStep(3)}
                    isSubmitting={isSubmitting}
                />
            ),
        },
    ];

    const handleStepComplete = (stepIndex) => {
        console.log(formData);
        if (!completedSteps.includes(stepIndex)) {
            setCompletedSteps([...completedSteps, stepIndex]);
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    return (
        <div className="w-full mx-auto bg-gray-50 p-6">
            {isSubmitting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-gray-700">
                            Creating request...
                        </span>
                    </div>
                </div>
            )}
            {/* Stepper */}
            <div className="flex justify-between items-center mb-6">
                {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === index;
                    const isCompleted = completedSteps.includes(index);

                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center relative"
                        >
                            {index < steps.length - 1 && (
                                <div
                                    className={`absolute top-1/2 left-full w-full h-0.5 transform -translate-y-1/2 -z-10 
                    ${
                        isCompleted || isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                                    style={{ width: "50px" }} // Adjust for space between steps
                                />
                            )}
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2
                  ${
                      isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : isCompleted
                          ? "border-green-500 bg-green-50 text-green-500"
                          : "border-gray-300 bg-gray-100 text-gray-400"
                  }
                  transition-all duration-300`}
                            >
                                {isCompleted && !isActive ? (
                                    <Check className="w-6 h-6" />
                                ) : (
                                    <StepIcon className="w-6 h-6" />
                                )}
                            </div>
                            <h3
                                className={`text-center font-semibold text-sm
                  ${
                      isActive
                          ? "text-primary"
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-500"
                  }
                  transition-colors duration-300`}
                            >
                                {step.title}
                            </h3>
                        </div>
                    );
                })}
            </div>

            {/* Step Content */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                pauseOnFocusLoss
            />
            <div className="mt-6">{steps[currentStep].content}</div>
        </div>
    );
};

export default DraftEditRequest;
