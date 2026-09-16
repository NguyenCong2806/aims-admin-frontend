import React, { useState, useRef, useEffect } from "react";

export type ViewMode = "list" | "kanban";

export interface AimsControlPanelProps {
  title: string;
  subtitle?: string;
  totalRecords: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  onExportExcel?: () => void;
  selectedCount?: number;
  onClearSelection?: () => void;
  onBatchDelete?: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  isFetching?: boolean;
}

export const AimsControlPanel: React.FC<AimsControlPanelProps> = ({
  title,
  subtitle,
  totalRecords,
  pageIndex,
  pageSize,
  onPageChange,
  searchTerm,
  onSearchChange,
  onAddNew,
  addNewLabel = "Thêm mới",
  onExportExcel,
  selectedCount = 0,
  onClearSelection,
  onBatchDelete,
  viewMode = "list",
  onViewModeChange,
  isFetching = false,
}) => {
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  const startItem = totalRecords === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endItem = Math.min(pageIndex * pageSize, totalRecords);
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        actionsDropdownRef.current &&
        !actionsDropdownRef.current.contains(e.target as Node)
      ) {
        setIsActionsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800 px-4 sm:px-6 py-2.5 transition-colors shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left: Action Buttons + Selection + Title */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Primary Action Button (AIMS Royal Indigo Gradient) */}
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 active:scale-95 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{addNewLabel}</span>
            </button>
          )}

          {/* Export Excel (Secondary Action) */}
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-300/80 dark:border-gray-700 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Xuất Excel</span>
            </button>
          )}

          {/* Title & Live sync indicator */}
          <div className="flex items-center gap-2 pl-1 border-l border-gray-200 dark:border-gray-700">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-none">
              {title}
            </h1>
            {subtitle && (
              <span className="hidden md:inline text-xs text-gray-500 dark:text-gray-400">
                ({subtitle})
              </span>
            )}
            {isFetching && (
              <span
                className="w-2 h-2 rounded-full bg-brand-500 animate-ping"
                title="Đang cập nhật..."
              />
            )}
          </div>

          {/* Batch Selection Action Bar */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-brand-800 dark:text-brand-200 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 rounded-lg">
                <span>{selectedCount} đã chọn</span>
                {onClearSelection && (
                  <button
                    onClick={onClearSelection}
                    className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                    title="Bỏ chọn tất cả"
                  >
                    ✕
                  </button>
                )}
              </span>

              {/* Actions Dropdown */}
              <div className="relative" ref={actionsDropdownRef}>
                <button
                  onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-gray-300/80 dark:border-gray-600 transition-colors cursor-pointer"
                >
                  <span>⚙ Tác vụ</span>
                  <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {isActionsDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-44 py-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in duration-100">
                    {onBatchDelete && (
                      <button
                        onClick={() => {
                          setIsActionsDropdownOpen(false);
                          onBatchDelete();
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-left transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Xóa các mục đã chọn</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsActionsDropdownOpen(false);
                        onClearSelection?.();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Bỏ chọn</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Search + Compact Pagination + View Switcher */}
        <div className="flex items-center gap-3 self-end lg:self-auto w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60 max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:bg-white dark:focus:bg-gray-900 transition-all placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Compact Pagination: < 1-10 / 25 > */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 select-none">
            <span className="whitespace-nowrap">
              {startItem}-{endItem} / {totalRecords}
            </span>
            <div className="flex items-center">
              <button
                disabled={pageIndex <= 1}
                onClick={() => onPageChange(pageIndex - 1)}
                className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="Trang trước"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                disabled={pageIndex >= totalPages}
                onClick={() => onPageChange(pageIndex + 1)}
                className="p-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="Trang sau"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* View Switcher: List [≡] and Grid/Kanban [⊞] */}
          {onViewModeChange && (
            <div className="flex items-center p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-2xs font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                }`}
                title="Xem dạng Danh sách (List View)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
              <button
                onClick={() => onViewModeChange("kanban")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  viewMode === "kanban"
                    ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-2xs font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                }`}
                title="Xem dạng Thẻ (Grid View)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AimsControlPanel;
