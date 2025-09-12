import React, { useEffect, useState } from "react";
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  Info,
  X,
  Trash2,
  Menu,
} from "lucide-react";
import {
  addNewQuestion,
  changeQuestionVisibility,
  fetchAllQuestions,
  fetchMyQuestions,
  deleteQuestion,
} from "../../api/service/adminServices";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";

const InfoPopup = ({ isOpen, onClose, title, description }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 relative">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 line-clamp-1">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
        <div className="flex justify-end p-4 sm:p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const LegalQuestionModal = ({ isOpen, onClose, onSubmit }) => {
  const [questionDetails, setQuestionDetails] = useState({
    question: "",
    description: "",
    expectedAnswer: true,
  });

  const handleSubmit = () => {
    if (questionDetails.question.trim()) {
      onSubmit({
        question: questionDetails.question,
        status: false,
        description: questionDetails.description,
        expectedAnswer: questionDetails.expectedAnswer,
      });
      setQuestionDetails({
        question: "",
        description: "",
        expectedAnswer: true,
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
            <Plus className="mr-2 sm:mr-3 text-primary" size={18} />
            Add Legal Question
          </h2>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={questionDetails.question}
              onChange={(e) =>
                setQuestionDetails((prev) => ({
                  ...prev,
                  question: e.target.value,
                }))
              }
              placeholder="Enter your legal question"
              className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
              Description
            </label>
            <textarea
              value={questionDetails.description}
              onChange={(e) =>
                setQuestionDetails((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Provide additional context or explanation"
              rows={4}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-base sm:text-lg font-medium text-gray-700 mb-1 sm:mb-2">
              Expected Answer
            </label>
            <div
              className="flex items-center cursor-pointer"
              onClick={() =>
                setQuestionDetails((prev) => ({
                  ...prev,
                  expectedAnswer: !prev.expectedAnswer,
                }))
              }
            >
              {questionDetails.expectedAnswer ? (
                <ToggleRight className="text-primary w-10 h-6 sm:w-14 sm:h-8" />
              ) : (
                <ToggleLeft className="text-gray-400 w-10 h-6 sm:w-14 sm:h-8" />
              )}
              <span className="ml-2 sm:ml-3 text-sm sm:text-lg">
                {questionDetails.expectedAnswer ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 flex justify-end space-x-3 sm:space-x-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-medium text-white bg-primary rounded-lg hover:bg-primary/90"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const LegalQuestions = () => {
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infoPopup, setInfoPopup] = useState({
    isOpen: false,
    title: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Check screen size on component mount and window resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      let response;
      if (role === "Admin") {
        response = await fetchAllQuestions();
      } else {
        response = await fetchMyQuestions(userId, role);
      }

      if (response?.status === 200 && response?.data?.data) {
        setQuestions(response.data.data);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to fetch questions");
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [userId]);

  const handleAddQuestion = async (newQuestion) => {
    try {
      setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
      const response = await addNewQuestion(userId, newQuestion, role);
      if (response?.status === 200) {
        toast.success("Question added successfully");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error(`Error: ${error.message || "Something went wrong!"}`);
      fetchQuestions();
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteQuestion(questionId);
        if (response?.status === 200) {
          setQuestions(questions.filter((q) => q._id !== questionId));
          toast.success("Question deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("Failed to delete question");
      }
    }
  };

  const toggleQuestionStatus = async (questionId) => {
    const question = questions.find((q) => q._id === questionId);
    const action = question.status ? "disable" : "enable";

    const confirmUpdate = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${action} this question?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: "No, cancel!",
    });

    if (confirmUpdate.isConfirmed) {
      setQuestions(
        questions.map((question) =>
          question._id === questionId
            ? { ...question, status: !question.status }
            : question
        )
      );

      const response = await changeQuestionVisibility(questionId);

      if (response.status === 200) {
        Swal.fire("Updated!", `The question has been ${action}d.`, "success");
      } else {
        Swal.fire("Error!", `Failed to ${action} the question.`, "error");
        fetchQuestions();
      }
    } else {
      Swal.fire("Cancelled", "The status update was cancelled.", "info");
    }
  };

  const showInfo = (question, description) => {
    setInfoPopup({
      isOpen: true,
      title: question,
      description: description,
    });
  };

  const renderMobileCard = (item) => (
    <div key={item._id} className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-2">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {item.question}
          </p>
          {item.description && (
            <button
              onClick={() => showInfo(item.question, item.description)}
              className="text-gray-400 hover:text-primary transition-colors"
            >
              <Info size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div>
          <span className="text-xs font-medium text-gray-500 mr-2">
            Expected:
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              item.expectedAnswer
                ? "bg-blue-50 text-blue-700"
                : "bg-orange-50 text-orange-700"
            }`}
          >
            {item.expectedAnswer ? "Yes" : "No"}
          </span>
        </div>

        <div>
          <span className="text-xs font-medium text-gray-500 mr-2">
            Status:
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              item.status
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {item.status ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => toggleQuestionStatus(item._id)}
          className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
            item.status
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          } transition-colors`}
        >
          {item.status ? "Disable" : "Enable"}
        </button>

        {role === "Admin" && (
          <button
            onClick={() => handleDeleteQuestion(item._id)}
            className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            <Trash2 size={12} className="mr-1" />
            Delete
          </button>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-6 sm:p-8">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!questions || questions.length === 0) {
      return (
        <div className="p-6 sm:p-12 text-center">
          <div className="text-gray-400 text-base sm:text-xl mb-4">
            No questions found
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
          >
            <Plus className="mr-1 sm:mr-2" size={15} />
            Add Your First Question
          </button>
        </div>
      );
    }

    if (isSmallScreen) {
      return (
        <div className="p-4">
          {questions.map((item) => renderMobileCard(item))}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Question
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">
                Expected
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {questions.map((item) => (
              <tr
                key={item._id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 max-w-xs sm:max-w-xl">
                    <span className="text-xs sm:text-sm text-gray-900 line-clamp-2">
                      {item.question}
                    </span>
                    {item.description && (
                      <button
                        onClick={() =>
                          showInfo(item.question, item.description)
                        }
                        className="flex-shrink-0 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Info size={16} />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                        item.expectedAnswer
                          ? "bg-blue-50 text-blue-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {item.expectedAnswer ? "Yes" : "No"}
                    </span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                        item.status
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {item.status ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex justify-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => toggleQuestionStatus(item._id)}
                      className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs font-medium ${
                        item.status
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      } transition-colors`}
                    >
                      {item.status ? "Disable" : "Enable"}
                    </button>
                    {role === "Admin" && (
                      <button
                        onClick={() => handleDeleteQuestion(item._id)}
                        className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={12} className="mr-1" />
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      <div className="flex justify-between items-center border-b pb-4 sm:pb-6">
        <h2 className="text-xl sm:text-3xl font-bold text-primary">
          Legal Questions
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-primary text-white px-2 py-1 text-sm sm:text-lg rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="mr-1 sm:mr-2" size={14} />
          <span className="hidden sm:inline">Add New Question</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {renderContent()}
      </div>

      <LegalQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddQuestion}
      />

      <InfoPopup
        isOpen={infoPopup.isOpen}
        onClose={() => setInfoPopup((prev) => ({ ...prev, isOpen: false }))}
        title={infoPopup.title}
        description={infoPopup.description}
      />

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

export default LegalQuestions;
