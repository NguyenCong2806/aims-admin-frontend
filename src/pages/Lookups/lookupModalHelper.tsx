import React from "react";
import Button from "../../components/ui/button/Button";

export const FIELD_LABEL_CLASS =
  "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

export const getInputClass = (hasError = false, isCode = false) => {
  const base =
    "w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all";
  const errorStyles = hasError
    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
    : "border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20";
  const codeStyles = isCode ? "font-mono uppercase font-bold text-indigo-600 dark:text-indigo-400" : "";

  return `${base} ${errorStyles} ${codeStyles}`.trim();
};

export const LookupModalLoading: React.FC = () => (
  <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 py-6">
    <div className="w-8 h-8 animate-spin rounded-full border-3 border-gray-200 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-400" />
    <span className="text-xs text-gray-500 dark:text-gray-400">Đang tải thông tin chi tiết...</span>
  </div>
);

interface LookupModalFooterProps {
  onClose: () => void;
  isSubmitting: boolean;
  isEdit: boolean;
}

export const LookupModalFooter: React.FC<LookupModalFooterProps> = ({
  onClose,
  isSubmitting,
  isEdit,
}) => (
  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
    <Button
      type="button"
      variant="outline"
      onClick={onClose}
      disabled={isSubmitting}
      className="px-4 py-2 text-xs font-semibold rounded-xl"
    >
      Hủy bỏ
    </Button>
    <Button
      type="submit"
      disabled={isSubmitting}
      className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-none transition-all"
    >
      {isSubmitting ? (
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Đang lưu...</span>
        </span>
      ) : isEdit ? (
        "Cập nhật"
      ) : (
        "Thêm mới"
      )}
    </Button>
  </div>
);
