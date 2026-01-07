type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Tính toán các trang hiển thị xung quanh trang hiện tại (tối đa 3 trang)
  const getVisiblePages = () => {
    const pages: number[] = [];

    // Luôn hiển thị trang 1
    if (totalPages > 1) pages.push(1);

    // Nếu trang hiện tại xa trang 1, thêm dấu ...
    if (currentPage > 3) {
      pages.push(-1); // -1 đại diện cho ...
    }

    // Các trang xung quanh trang hiện tại
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Nếu trang hiện tại xa trang cuối, thêm dấu ...
    if (currentPage < totalPages - 2) {
      pages.push(-2); // -2 đại diện cho ...
    }

    // Luôn hiển thị trang cuối (nếu có nhiều hơn 1 trang)
    if (totalPages > 1 && totalPages !== pages[pages.length - 1]) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center gap-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
      >
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {visiblePages.map((page, index) => {
          if (page < 0) {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all
                ${
                  currentPage === page
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-gray-700 hover:bg-blue-500/[0.08] hover:text-brand-500 dark:text-gray-300 dark:hover:bg-white/[0.05] dark:hover:text-brand-500"
                }
              `}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;