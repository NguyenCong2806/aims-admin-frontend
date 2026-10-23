import React, { useState } from "react";
import {
  formatFileSize,
  getFileCategory,
  getFileCategoryColorStyle,
  getFileCategoryEmoji,
  isImageFile,
  resolveFileUrl,
} from "../../../helpper/fileHelper";
import { FileUploadResult, UploadedFileItem } from "../../../modules/System/models/file";
import {
  TrashBinIcon,
  DownloadIcon,
  EyeIcon,
  CheckCircleIcon,
  AlertIcon,
} from "../../../icons";
import { services } from "../../../di/ServiceContainer";
import { FilePreviewModal } from "./FilePreviewModal";

export interface FilePreviewItemProps {
  file: UploadedFileItem | FileUploadResult;
  onRemove?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  compact?: boolean;
}

export const FilePreviewItem: React.FC<FilePreviewItemProps> = ({
  file,
  onRemove,
  disabled = false,
  readOnly = false,
  compact = false,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fileName = file.fileName || "Tệp tin";
  const relativeUrl = file.relativeUrl || "";
  const fullUrl = resolveFileUrl(relativeUrl);
  const sizeBytes = "fileSizeBytes" in file ? file.fileSizeBytes : 0;
  const isImage = isImageFile(fileName);
  const category = getFileCategory(fileName);
  const colorStyle = getFileCategoryColorStyle(category);

  // Trạng thái upload
  const isUploading = "status" in file && file.status === "uploading";
  const isError = "status" in file && file.status === "error";
  const progress = "progress" in file ? file.progress ?? 0 : 100;
  const errorMessage = "error" in file ? file.error : undefined;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (relativeUrl) {
      services.file.downloadFile(relativeUrl, fileName);
    } else if (fullUrl) {
      window.open(fullUrl, "_blank");
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove && !disabled && !readOnly) {
      onRemove();
    }
  };

  // Thumbnail hình ảnh (nếu có URL hoặc blob)
  const imagePreviewSrc =
    isImage && fullUrl
      ? fullUrl
      : "rawFile" in file && file.rawFile && isImage
      ? URL.createObjectURL(file.rawFile)
      : null;

  return (
    <>
      <div
        className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden ${
          isError
            ? "border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20"
            : isUploading
            ? "border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/10"
            : "border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/90 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm"
        } ${compact ? "p-2.5" : "p-3.5"}`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Cột trái: Icon / Thumbnail + Tên file */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Thumbnail hoặc Icon */}
            <div
              className={`shrink-0 rounded-xl flex items-center justify-center font-bold text-lg overflow-hidden border ${
                compact ? "w-10 h-10" : "w-12 h-12"
              } ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`}
            >
              {imagePreviewSrc ? (
                <img
                  src={imagePreviewSrc}
                  alt={fileName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span>{getFileCategoryEmoji(category)}</span>
              )}
            </div>

            {/* Thông tin tên file và dung lượng */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h5
                  className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                  onClick={() => setIsPreviewOpen(true)}
                  title={fileName}
                >
                  {fileName}
                </h5>

                {/* Badge trạng thái */}
                {isUploading ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                    Đang tải {progress}%
                  </span>
                ) : isError ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                    <AlertIcon className="w-3 h-3 text-red-500" />
                    Lỗi
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <CheckCircleIcon className="w-2.5 h-2.5 text-emerald-500" />
                    Hoàn tất
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                <span>{formatFileSize(sizeBytes)}</span>
                {category !== "other" && (
                  <>
                    <span>•</span>
                    <span className="uppercase text-[10px] font-mono tracking-wider text-gray-500 dark:text-gray-400">
                      {category}
                    </span>
                  </>
                )}
                {errorMessage && (
                  <>
                    <span>•</span>
                    <span className="text-red-500 truncate max-w-xs" title={errorMessage}>
                      {errorMessage}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: Các nút hành động */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Nút xem chi tiết / preview */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              title="Xem tệp tin"
            >
              <EyeIcon className="w-4 h-4" />
            </button>

            {/* Nút tải về máy */}
            {(relativeUrl || fullUrl) && !isUploading && !isError && (
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                title="Tải tệp về máy"
              >
                <DownloadIcon className="w-4 h-4" />
              </button>
            )}

            {/* Nút xóa / gỡ bỏ file */}
            {onRemove && !disabled && !readOnly && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                title="Xóa tệp đính kèm"
              >
                <TrashBinIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Thanh tiến trình Progress Bar khi đang upload */}
        {isUploading && (
          <div className="mt-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Modal xem trước */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        file={file}
      />
    </>
  );
};
