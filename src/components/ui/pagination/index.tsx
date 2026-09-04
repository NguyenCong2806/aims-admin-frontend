import React from "react";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalCount,
  totalPages,
  pageSizeOptions = [5, 10, 15, 20, 25, 50,75, 100],
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalCount === 0) {
    return null;
  }

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  const handlePageSizeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    onPageSizeChange(newSize);
    // Khi đổi số lượng bản ghi hiển thị, nên đưa về trang 1
    onPageChange(1);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 dark:border-white/[0.05]">
      {/* Thông tin hiển thị & Bộ chọn pageSize */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div>
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

        {/* Lựa chọn số lượng hiển thị mỗi trang */}
        <div className="flex items-center gap-2">
          <label htmlFor="page-size-select" className="text-xs">
            Mỗi trang:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={handlePageSizeSelect}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-700 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 dark:border-gray-700 
            dark:bg-gray-800 dark:text-gray-300 appearance-none" 
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / trang
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Điều hướng chuyển trang */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Trang trước"
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
            aria-label="Trang sau"
            className="flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.05]"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;