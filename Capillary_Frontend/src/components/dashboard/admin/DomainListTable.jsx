import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { deleteDomain, listDomains } from "../../../api/service/adminServices";

const DomainListTable = () => {
  const [domains, setDomains] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [domainsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await listDomains();
        if (Array.isArray(response?.data?.data)) {
          setDomains(response?.data?.data); 
        } else {
          toast.error("Invalid data structure returned from the API");
        }
      } catch (err) {
        console.error("Error fetching domains:", err);
        toast.error("Failed to fetch domains");
      }
    };

    fetchDomains();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await deleteDomain(id);
      console.log(response)
      if (response?.data?.message) {
        toast.success(response.data?.message);
      } else {
        toast.success("Domain deleted successfully");
      }
      setDomains(domains?.filter((domain) => domain?._id !== id));
    } catch (err) {
      console.error("Error deleting domain:", err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete domain. Please try again later."
      );
    }
  };

  const handleAddDomain = () => {
    navigate("/admin/domain");
  };

  // Get current domains to display based on pagination
  const indexOfLastDomain = currentPage * domainsPerPage;
  const indexOfFirstDomain = indexOfLastDomain - domainsPerPage;
  const currentDomains = domains?.slice(indexOfFirstDomain, indexOfLastDomain);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Pagination logic
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(domains.length / domainsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Allowed Domains</h2>
        <button
          onClick={handleAddDomain}
          className="px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:outline-none transition-all"
        >
          Add Domain
        </button>
      </div>
      <table className="table-auto w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-primary text-white">
            <th className="border p-2">Sl. No</th>
            <th className="border p-2">Domain Name</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentDomains?.length === 0 ? (
            <tr>
              <td colSpan="3" className="border p-2 text-center">
                No domains found.
              </td>
            </tr>
          ) : (
            currentDomains?.map((domain, index) => (
              <tr key={domain?._id}>
                <td className="border p-2 text-center">
                  {index + 1 + (currentPage - 1) * domainsPerPage}
                </td>
                <td className="border p-2">{domain?.domain}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDelete(domain?._id)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <ul className="flex list-none">
          {pageNumbers.map((number) => (
            <li key={number} className="mx-1">
              <button
                onClick={() => paginate(number)}
                className={`px-4 py-2 border rounded-md ${
                  number === currentPage
                    ? "bg-primary text-white"
                    : "bg-white text-primary border-primary"
                } hover:bg-primary hover:text-white transition-all`}
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
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

export default DomainListTable;
