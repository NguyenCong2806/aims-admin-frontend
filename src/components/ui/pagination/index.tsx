import React from "react";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages:number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 dark:border-white/[0.05]">
      {/* Total */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Hiển thị{" "}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {startItem}
        </span>{" "}
        -{" "}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {endItem}
        </span>{" "}
        trong{" "}
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {totalCount}
        </span>{" "}
        bản ghi
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.05]"
        >
          ‹
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className={`flex size-9 items-center justify-center rounded-lg text-sm transition ${
                pageNumber === page
                  ? "bg-brand-500 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
              }`}
            >
              {pageNumber}
            </button>
          )
        )}

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.05]"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;