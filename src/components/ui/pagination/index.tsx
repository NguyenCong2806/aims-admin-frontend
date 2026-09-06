import React from "react";

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onPageHover?: (page: number) => void; // Hỗ trợ Prefetch khi hover
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  totalCount,
  totalPages,
  pageSizeOptions = [5, 10, 15, 20, 25, 50, 75, 100],
  onPageChange,
  onPageSizeChange,
  onPageHover,
}) => {
  if (totalCount === 0) {
    return null;
  }

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  const handlePageSizeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    onPageSizeChange(newSize);
    onPageChange(1);
  };

  // Thuật toán tính danh sách hiển thị có dấu ba chấm (...)
  const getPageNumbers = () => {
    const delta = 2; // Số trang hiển thị cạnh trang hiện tại
    const range: (number | string)[] = [];
    const rangeWithDots: (number | string)[] = [];
    let prev: number | null = null;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (typeof i === "number") {
        if (prev !== null) {
          if (i - prev === 2) {
            rangeWithDots.push(prev + 1);
          } else if (i - prev !== 1) {
            rangeWithDots.push("...");
          }
        }
        rangeWithDots.push(i);
        prev = i;
      }
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

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
          <div className="relative">
            <select
              id="page-size-select"
              value={pageSize}
              onChange={handlePageSizeSelect}
              className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-700 outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Điều hướng chuyển trang */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Nút Trước */}
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            onMouseEnter={() => page > 1 && onPageHover?.(page - 1)}
            aria-label="Trang trước"
            className="flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/[0.05]"
          >
            ‹
          </button>

          {/* Danh sách các nút số trang */}
          {pages.map((item, index) => {
            if (item === "...") {
              return (
                <span
                  key={`dots-${index}`}
                  className="flex size-9 items-center justify-center text-sm text-gray-400"
                >
                  …
                </span>
              );
            }

            const pageNumber = item as number;
            const isActive = pageNumber === page;

            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                onMouseEnter={() => onPageHover?.(pageNumber)}
                className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.05]"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          {/* Nút Sau */}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            onMouseEnter={() => page < totalPages && onPageHover?.(page + 1)}
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