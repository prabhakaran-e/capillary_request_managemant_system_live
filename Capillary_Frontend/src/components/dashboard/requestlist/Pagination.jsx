import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  handlePageChange,
  itemsPerPage,
  totalItems 
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginationButtonStyle =
    "flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors duration-200";
  const paginationActiveStyle = "bg-primary text-white hover:bg-primary/90";
  const paginationInactiveStyle = "text-gray-500 hover:bg-gray-100";
  const paginationDisabledStyle =
    "text-gray-300 cursor-not-allowed hover:bg-transparent";

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span>Showing</span>
        <span className="font-medium">{startIndex + 1}</span>
        <span>to</span>
        <span className="font-medium">{endIndex}</span>
        <span>of</span>
        <span className="font-medium">{totalItems}</span>
        <span>entries</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className={`${paginationButtonStyle} rounded-l-lg ${
            currentPage === 1 ? paginationDisabledStyle : paginationInactiveStyle
          }`}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${paginationButtonStyle} ${
            currentPage === 1 ? paginationDisabledStyle : paginationInactiveStyle
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && handlePageChange(page)}
              className={`${paginationButtonStyle} ${
                page === currentPage
                  ? paginationActiveStyle
                  : typeof page === "number"
                  ? paginationInactiveStyle
                  : paginationDisabledStyle
              }`}
              disabled={typeof page !== "number"}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${paginationButtonStyle} ${
            currentPage === totalPages ? paginationDisabledStyle : paginationInactiveStyle
          }`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${paginationButtonStyle} rounded-r-lg ${
            currentPage === totalPages ? paginationDisabledStyle : paginationInactiveStyle
          }`}
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
