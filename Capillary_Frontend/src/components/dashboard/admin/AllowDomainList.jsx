import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { allowedDomain } from "../../../api/service/adminServices";

const AllowDomainList = () => {
  const navigate = useNavigate();
  const [domain, setDomain] = useState("");

  const handleDomainSubmit = async (domain) => {
    try {
      console.log("Domain submitted:", domain);

      const response = await allowedDomain(domain);

      if (response.status === 201) {
        toast.success(response?.data?.message || "Domain added successfully!");
        setTimeout(() => {
          navigate("/admin/domain-table");
        }, 1500);
      } else {
        const errorMessage =
          response?.data?.message ||
          "Domain already exists in the allowed list";
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Error in allowing domain:", err);

      const errorMessage =
        err?.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (domain.trim()) {
      handleDomainSubmit(domain);
      setDomain("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
          Allow Domain
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="domain"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Domain Name
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter a valid domain (e.g., example.com)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:outline-none transition-all"
          >
            Submit Domain
          </button>
        </form>
      </div>
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

export default AllowDomainList;
