import React from "react";
import { Modal } from "../../ui/modal";
import {
  formatFileSize,
  getFileCategory,
  getFileCategoryEmoji,
  isImageFile,
  resolveFileUrl,
} from "../../../helpper/fileHelper";
import { FileUploadResult, UploadedFileItem } from "../../../models/File/file";
import { DownloadIcon, EyeIcon } from "../../../icons";
import { services } from "../../../di/ServiceContainer";

export interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: UploadedFileItem | FileUploadResult | null;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  if (!file) return null;

  const fileName = file.fileName || "Tệp tin";
  const relativeUrl = file.relativeUrl || "";
  const fullUrl = resolveFileUrl(relativeUrl);
  const sizeBytes = "fileSizeBytes" in file ? file.fileSizeBytes : 0;
  const isImage = isImageFile(fileName) || ("contentType" in file && file.contentType?.startsWith("image/"));
  const isPdf = fileName.toLowerCase().endsWith(".pdf");
  const category = getFileCategory(fileName);

  const handleDownload = () => {
    if (relativeUrl) {
      services.file.downloadFile(relativeUrl, fileName);
    } else if (fullUrl) {
      window.open(fullUrl, "_blank");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết tệp đính kèm"
      className="max-w-2xl w-full"
    >
      <div className="space-y-4">
        {/* Khu vực xem trước tệp (Preview area) */}
        <div className="w-full min-h-[220px] max-h-[480px] rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-center p-4 overflow-hidden relative">
          {isImage && fullUrl ? (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <img
                src={fullUrl}
                alt={fileName}
                className="max-h-[420px] w-auto max-w-full rounded-xl object-contain shadow-sm"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          ) : isPdf && fullUrl ? (
            <div className="w-full flex flex-col items-center justify-center py-8 text-center space-y-3">
              <div className="text-5xl">📕</div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Tài liệu PDF: {fileName}
              </p>
              <p className="text-xs text-gray-500 max-w-md">
                Bạn có thể mở tài liệu này trong tab mới để xem toàn màn hình hoặc tải trực tiếp về thiết bị.
              </p>
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all"
              >
                <EyeIcon className="w-4 h-4" />
                Mở tài liệu PDF trong tab mới
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <div className="text-5xl">{getFileCategoryEmoji(category)}</div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {fileName}
              </p>
              <p className="text-xs text-gray-500">
                Định dạng này không hỗ trợ xem trước trực tiếp. Vui lòng tải về máy tính để mở.
              </p>
            </div>
          )}
        </div>

        {/* Thông tin chi tiết tệp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50/70 dark:bg-gray-850/60 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-gray-400 block mb-0.5">Tên tệp:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200 break-all">
              {fileName}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Dung lượng:</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {formatFileSize(sizeBytes)}
            </span>
          </div>
          {"contentType" in file && file.contentType && (
            <div>
              <span className="text-gray-400 block mb-0.5">Loại nội dung:</span>
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {file.contentType}
              </span>
            </div>
          )}
          {relativeUrl && (
            <div>
              <span className="text-gray-400 block mb-0.5">Đường dẫn máy chủ:</span>
              <span className="font-mono text-[11px] text-gray-500 truncate block" title={relativeUrl}>
                {relativeUrl}
              </span>
            </div>
          )}
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          {fullUrl && (
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-2xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            >
              <EyeIcon className="w-3.5 h-3.5" />
              Xem trong tab mới
            </a>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            Tải tệp về máy
          </button>
        </div>
      </div>
    </Modal>
  );
};
