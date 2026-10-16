import React, { useEffect, useCallback, useMemo } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { toast } from "sonner";
import {
  FileAcceptPreset,
  FileUploadResult,
  UploadedFileItem,
} from "../../../models/File/file";
import {
  formatFileSize,
  resolveAcceptString,
  resolveFileUrl,
} from "../../../helpper/fileHelper";
import { useFileUpload } from "../../../hooks/useFileUpload";
import { FilePreviewItem } from "./FilePreviewItem";
import {
  FileIcon,
  PlusIcon,
  TrashBinIcon,
} from "../../../icons";
import { services } from "../../../di/ServiceContainer";

export type FileUploadVariant = "dropzone" | "compact" | "button" | "avatar";

export interface FileUploadProps {
  /**
   * Chế độ tải nhiều file cùng lúc (dùng /files/upload-multiple)
   * hay tải 1 file đơn lẻ (dùng /files/upload)
   */
  multiple?: boolean;
  /**
   * Giá trị tệp tin đang được chọn (hỗ trợ Controlled Component với form)
   */
  value?: FileUploadResult | FileUploadResult[] | string | string[] | null;
  /**
   * Callback khi giá trị tệp tin thay đổi (thêm, upload xong, xóa)
   */
  onChange?: (value: FileUploadResult | FileUploadResult[] | null) => void;
  /**
   * Kiểu giao diện hiển thị: dropzone (mặc định), compact, button, avatar
   */
  variant?: FileUploadVariant;
  /**
   * Định dạng file cho phép: preset hoặc chuỗi mở rộng như ".pdf,.docx,.xlsx"
   */
  accept?: string | FileAcceptPreset;
  /**
   * Dung lượng tối đa mỗi file tính theo MB (mặc định 25MB)
   */
  maxSizeMB?: number;
  /**
   * Số lượng file tối đa khi multiple = true
   */
  maxFiles?: number;
  /**
   * Tự động gửi request upload lên máy chủ ngay khi người dùng chọn file (mặc định true)
   */
  autoUpload?: boolean;
  /**
   * Nhãn tiêu đề phía trên khung upload
   */
  label?: string;
  /**
   * Dòng mô tả hướng dẫn hoặc gợi ý dưới nhãn
   */
  hint?: string;
  /**
   * Thông báo lỗi validation
   */
  error?: string;
  /**
   * Đánh dấu trường bắt buộc
   */
  required?: boolean;
  /**
   * Vô hiệu hóa tính năng upload
   */
  disabled?: boolean;
  /**
   * Chế độ chỉ đọc (xem file đính kèm, không thể tải thêm hoặc xóa)
   */
  readOnly?: boolean;
  /**
   * Hiển thị danh sách file đã tải lên bên dưới khung (mặc định true)
   */
  showPreviewList?: boolean;
  /**
   * Văn bản hiển thị trên nút chọn file
   */
  buttonText?: string;
  /**
   * Callback thông báo khi trạng thái uploading thay đổi (true/false)
   */
  onUploadingChange?: (isUploading: boolean) => void;
  /**
   * Callback kích hoạt khi upload thành công
   */
  onUploadSuccess?: (result: FileUploadResult | FileUploadResult[]) => void;
  /**
   * Callback kích hoạt khi upload thất bại
   */
  onUploadError?: (error: Error) => void;
  /**
   * Callback kích hoạt khi người dùng bấm xóa file
   */
  onRemove?: (removedItem: FileUploadResult | UploadedFileItem) => void;
  /**
   * Tự động gửi API xóa file vật lý trên server (/files/delete) khi người dùng bấm xóa (mặc định false)
   */
  deletePhysicalOnRemove?: boolean;
  /**
   * Class tùy biến container ngoài cùng
   */
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  multiple = false,
  value,
  onChange,
  variant = "dropzone",
  accept = "all",
  maxSizeMB = 25,
  maxFiles = 10,
  autoUpload = true,
  label,
  hint,
  error: customError,
  required = false,
  disabled = false,
  readOnly = false,
  showPreviewList = true,
  buttonText,
  onUploadingChange,
  onUploadSuccess,
  onUploadError,
  onRemove,
  deletePhysicalOnRemove = false,
  className = "",
}) => {
  // Hook xử lý upload file tập trung
  const {
    fileList,
    setFileList,
    isUploading,
    uploadProgress,
    uploadSingle,
    uploadMultiple,
    removeFile,
  } = useFileUpload({
    multiple,
    validation: {
      maxSizeMB,
      accept,
      maxFiles,
    },
    onSuccess: (results) => {
      if (multiple) {
        onUploadSuccess?.(results);
      } else if (results.length > 0) {
        onUploadSuccess?.(results[0]);
      }
    },
    onError: (err) => {
      onUploadError?.(err);
    },
  });

  // Thông báo trạng thái uploading ra ngoài cho form cha
  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  // Đồng bộ prop `value` bên ngoài vào local `fileList`
  useEffect(() => {
    if (value === undefined || value === null) {
      setFileList((prev) => (prev.length > 0 ? [] : prev));
      return;
    }

    // Trường hợp value là chuỗi URL hoặc mảng URL
    if (typeof value === "string") {
      const fileName = value.split("/").pop() || "Tệp tin";
      setFileList([
        {
          id: `val-${value}`,
          fileName,
          relativeUrl: value,
          fileSizeBytes: 0,
          status: "success",
          progress: 100,
        },
      ]);
      return;
    }

    if (Array.isArray(value)) {
      const mapped: UploadedFileItem[] = value.map((item, idx) => {
        if (typeof item === "string") {
          return {
            id: `val-${idx}-${item}`,
            fileName: item.split("/").pop() || `Tệp ${idx + 1}`,
            relativeUrl: item,
            fileSizeBytes: 0,
            status: "success",
            progress: 100,
          };
        }
        return {
          id: `val-${idx}-${item.fileName}`,
          fileName: item.fileName,
          storedFileName: item.storedFileName,
          relativeUrl: item.relativeUrl,
          fileSizeBytes: item.fileSizeBytes,
          contentType: item.contentType,
          status: "success",
          progress: 100,
        };
      });
      setFileList(mapped);
      return;
    }

    // Trường hợp value là object FileUploadResult đơn lẻ
    if (typeof value === "object" && "fileName" in value) {
      setFileList([
        {
          id: `val-${value.fileName}`,
          fileName: value.fileName,
          storedFileName: value.storedFileName,
          relativeUrl: value.relativeUrl,
          fileSizeBytes: value.fileSizeBytes,
          contentType: value.contentType,
          status: "success",
          progress: 100,
        },
      ]);
    }
  }, [value, setFileList]);

  // Thông báo thay đổi ra ngoài khi fileList thay đổi do upload hoàn tất
  const notifyChange = useCallback(
    (newItems: UploadedFileItem[]) => {
      if (!onChange) return;

      const successfulFiles: FileUploadResult[] = newItems
        .filter((item) => item.status === "success" && item.relativeUrl)
        .map((item) => ({
          fileName: item.fileName,
          storedFileName: item.storedFileName || item.fileName,
          relativeUrl: item.relativeUrl,
          fileSizeBytes: item.fileSizeBytes,
          contentType: item.contentType || "",
        }));

      if (multiple) {
        onChange(successfulFiles);
      } else {
        onChange(successfulFiles.length > 0 ? successfulFiles[0] : null);
      }
    },
    [multiple, onChange]
  );

  // Xử lý khi chọn/kéo file vào Dropzone
  const handleFilesSelected = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || readOnly || acceptedFiles.length === 0) return;

      if (!autoUpload) {
        // Chế độ Stage cục bộ không gọi API ngay
        const newStaged: UploadedFileItem[] = acceptedFiles.map((file, idx) => ({
          id: `staged-${Date.now()}-${idx}`,
          fileName: file.name,
          relativeUrl: "",
          fileSizeBytes: file.size,
          contentType: file.type,
          rawFile: file,
          status: "idle",
        }));
        const updated = multiple ? [...fileList, ...newStaged] : newStaged;
        setFileList(updated);
        notifyChange(updated);
        return;
      }

      if (multiple) {
        const results = await uploadMultiple(acceptedFiles);
        if (results.length > 0 && onChange) {
          const existingSuccess: FileUploadResult[] = fileList
            .filter((f) => f.status === "success" && f.relativeUrl)
            .map((f) => ({
              fileName: f.fileName,
              storedFileName: f.storedFileName || f.fileName,
              relativeUrl: f.relativeUrl,
              fileSizeBytes: f.fileSizeBytes,
              contentType: f.contentType || "",
            }));
          const combined: FileUploadResult[] = [
            ...existingSuccess,
            ...results,
          ];
          onChange(combined);
        }
      } else {
        const firstFile = acceptedFiles[0];
        const result = await uploadSingle(firstFile);
        if (result && onChange) {
          onChange(result);
        }
      }
    },
    [autoUpload, disabled, fileList, multiple, notifyChange, onChange, readOnly, uploadMultiple, uploadSingle, setFileList]
  );

  // Xử lý xóa tệp
  const handleRemoveFile = useCallback(
    async (item: UploadedFileItem) => {
      if (disabled || readOnly) return;

      // Nếu bật tùy chọn xóa vật lý trên server và file đã có URL
      if (deletePhysicalOnRemove && item.relativeUrl) {
        try {
          const confirmedOrSuccess = await services.file.deleteFile(item.relativeUrl, { confirm: true });
          if (!confirmedOrSuccess) return; // Người dùng hủy trên hộp thoại xác nhận
        } catch (err) {
          console.error("Xóa file vật lý thất bại:", err);
          return;
        }
      }

      removeFile(item.id);
      const remaining = fileList.filter((f) => f.id !== item.id);
      notifyChange(remaining);

      if (onRemove) {
        const fileResult: FileUploadResult = {
          fileName: item.fileName,
          storedFileName: item.storedFileName || item.fileName,
          relativeUrl: item.relativeUrl,
          fileSizeBytes: item.fileSizeBytes,
          contentType: item.contentType || "",
        };
        onRemove(fileResult);
      }
    },
    [deletePhysicalOnRemove, disabled, fileList, notifyChange, onRemove, readOnly, removeFile]
  );

  // Cấu hình định dạng accept cho react-dropzone
  const dropzoneAccept: Accept | undefined = useMemo(() => {
    if (!accept || accept === "all") return undefined;

    const acceptString = resolveAcceptString(accept);
    const extensions = acceptString.split(",").map((s) => s.trim().toLowerCase());

    const result: Accept = {};
    extensions.forEach((ext) => {
      if (ext.startsWith(".")) {
        // react-dropzone hỗ trợ MIME -> array extensions
        if (ext === ".pdf") result["application/pdf"] = [".pdf"];
        else if (ext === ".png") result["image/png"] = [".png"];
        else if (ext === ".jpg" || ext === ".jpeg") result["image/jpeg"] = [".jpg", ".jpeg"];
        else if (ext === ".webp") result["image/webp"] = [".webp"];
        else if (ext === ".svg") result["image/svg+xml"] = [".svg"];
        else if (ext === ".xlsx") result["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"] = [".xlsx"];
        else if (ext === ".xls") result["application/vnd.ms-excel"] = [".xls"];
        else if (ext === ".csv") result["text/csv"] = [".csv"];
        else if (ext === ".docx") result["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] = [".docx"];
        else if (ext === ".doc") result["application/msword"] = [".doc"];
        else if (ext === ".zip") result["application/zip"] = [".zip"];
        else {
          result["application/octet-stream"] = [...(result["application/octet-stream"] || []), ext];
        }
      }
    });

    return Object.keys(result).length > 0 ? result : undefined;
  }, [accept]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop: handleFilesSelected,
      disabled: disabled || readOnly || isUploading,
      multiple,
      accept: dropzoneAccept,
      maxSize: maxSizeMB * 1024 * 1024,
      onDropRejected: (rejections) => {
        rejections.forEach((rej) => {
          rej.errors.forEach((err) => {
            if (err.code === "file-too-large") {
              toast.error(
                `Tệp "${rej.file.name}" quá lớn (${formatFileSize(
                  rej.file.size
                )}). Giới hạn tối đa: ${maxSizeMB}MB`
              );
            } else if (err.code === "file-invalid-type") {
              toast.error(
                `Định dạng tệp "${rej.file.name}" không phù hợp!`
              );
            } else {
              toast.error(err.message);
            }
          });
        });
      },
    });

  // Văn bản hướng dẫn định dạng
  const acceptedGuideText = useMemo(() => {
    if (hint) return hint;
    if (accept === "all") {
      return `Hỗ trợ mọi định dạng tệp (Tối đa ${maxSizeMB}MB)`;
    }
    if (accept === "image") {
      return `Hỗ trợ hình ảnh PNG, JPG, JPEG, WebP, SVG (Tối đa ${maxSizeMB}MB)`;
    }
    if (accept === "document") {
      return `Hỗ trợ tài liệu PDF, DOCX, XLSX, TXT (Tối đa ${maxSizeMB}MB)`;
    }
    if (accept === "spreadsheet") {
      return `Hỗ trợ bảng tính Excel (.xlsx, .xls, .csv) tối đa ${maxSizeMB}MB`;
    }
    if (accept === "pdf") {
      return `Hỗ trợ tệp PDF bản quét ký kết (Tối đa ${maxSizeMB}MB)`;
    }
    return `Định dạng cho phép: ${resolveAcceptString(accept)} (Tối đa ${maxSizeMB}MB)`;
  }, [accept, hint, maxSizeMB]);

  // =========================================================================
  // Giao diện biến thể 1: AVATAR / LOGO (User profile, Supplier logo, Brand icon)
  // =========================================================================
  if (variant === "avatar") {
    const currentItem = fileList[0];
    const previewUrl = currentItem
      ? currentItem.rawFile
        ? URL.createObjectURL(currentItem.rawFile)
        : resolveFileUrl(currentItem.relativeUrl)
      : null;

    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="flex items-center gap-4">
          <div
            {...getRootProps()}
            className={`relative group w-24 h-24 rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center cursor-pointer transition-all ${
              isDragActive
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                : "border-gray-300 dark:border-gray-700 hover:border-indigo-500 bg-gray-50 dark:bg-gray-800"
            } ${disabled || readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />

            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
                {!readOnly && !disabled && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs">
                    <span className="text-lg">📷</span>
                    <span>Thay đổi</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-indigo-600 transition-colors p-2 text-center">
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-2xl mb-1">🖼️</span>
                    <span className="text-[10px] font-medium leading-tight">Tải ảnh</span>
                  </>
                )}
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 flex-1 text-xs">
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              {currentItem ? currentItem.fileName : "Chưa chọn ảnh đại diện"}
            </p>
            <p className="text-gray-400 text-[11px]">{acceptedGuideText}</p>
            {currentItem && !readOnly && !disabled && (
              <button
                type="button"
                onClick={() => handleRemoveFile(currentItem)}
                className="inline-flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 font-semibold cursor-pointer"
              >
                <TrashBinIcon className="w-3.5 h-3.5" />
                Gỡ ảnh
              </button>
            )}
          </div>
        </div>

        {customError && <p className="text-xs text-red-500 mt-1">{customError}</p>}
      </div>
    );
  }

  // =========================================================================
  // Giao diện biến thể 2: BUTTON COMPACT (Nút bấm gọn gàng)
  // =========================================================================
  if (variant === "button") {
    return (
      <div className={`space-y-3 ${className}`}>
        {label && (
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="flex items-center gap-3">
          <div {...getRootProps()}>
            <input {...getInputProps()} />
            <button
              type="button"
              disabled={disabled || readOnly || isUploading}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-2xs ${
                disabled || readOnly
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-98"
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải lên ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  <span>{buttonText || (multiple ? "Tải lên tệp tin" : "Chọn tệp đính kèm")}</span>
                </>
              )}
            </button>
          </div>

          <span className="text-xs text-gray-400">{acceptedGuideText}</span>
        </div>

        {/* Danh sách file hiển thị */}
        {showPreviewList && fileList.length > 0 && (
          <div className="space-y-2 mt-3">
            {fileList.map((item) => (
              <FilePreviewItem
                key={item.id}
                file={item}
                disabled={disabled}
                readOnly={readOnly}
                compact
                onRemove={() => handleRemoveFile(item)}
              />
            ))}
          </div>
        )}

        {customError && <p className="text-xs text-red-500 mt-1">{customError}</p>}
      </div>
    );
  }

  // =========================================================================
  // Giao diện biến thể 3: COMPACT ROW (Dải ngang tiết kiệm diện tích)
  // =========================================================================
  if (variant === "compact") {
    return (
      <div className={`space-y-2.5 ${className}`}>
        {label && (
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div
          {...getRootProps()}
          className={`flex items-center justify-between p-3 rounded-xl border border-dashed transition-all cursor-pointer ${
            isDragActive
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30"
              : "border-gray-300 dark:border-gray-700 hover:border-indigo-400 bg-gray-50/70 dark:bg-gray-800/40"
          } ${disabled || readOnly ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />

          <div className="flex items-center gap-2.5 text-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center">
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileIcon className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {isDragActive
                  ? "Thả file vào đây..."
                  : isUploading
                  ? `Đang tải lên (${uploadProgress}%)...`
                  : buttonText || "Nhấn hoặc kéo thả file vào đây"}
              </p>
              <p className="text-[11px] text-gray-400">{acceptedGuideText}</p>
            </div>
          </div>

          <span className="px-3 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 shrink-0">
            Duyệt file
          </span>
        </div>

        {/* Danh sách file hiển thị */}
        {showPreviewList && fileList.length > 0 && (
          <div className="space-y-2 mt-2">
            {fileList.map((item) => (
              <FilePreviewItem
                key={item.id}
                file={item}
                disabled={disabled}
                readOnly={readOnly}
                compact
                onRemove={() => handleRemoveFile(item)}
              />
            ))}
          </div>
        )}

        {customError && <p className="text-xs text-red-500 mt-1">{customError}</p>}
      </div>
    );
  }

  // =========================================================================
  // Giao diện biến thể 4: DROPZONE (Chuẩn Enterprise hiện đại, rộng rãi)
  // =========================================================================
  const hasFiles = fileList.length > 0;
  const isSingleAndHasFile = !multiple && hasFiles;

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {multiple && hasFiles && (
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full">
              Đã đính kèm {fileList.length} tệp
            </span>
          )}
        </div>
      )}

      {/* Khung Drag & Dropzone: Ẩn nếu là chế độ đơn lẻ và đã có file tải lên */}
      {!isSingleAndHasFile && !readOnly && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-3xl p-7 text-center transition-all cursor-pointer group ${
            isDragReject
              ? "border-red-400 bg-red-50/50 dark:bg-red-950/20"
              : isDragActive
              ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-4 ring-indigo-500/10 scale-[1.01]"
              : "border-gray-300 dark:border-gray-700/80 hover:border-indigo-500 dark:hover:border-indigo-400 bg-gray-50/60 dark:bg-gray-850/40 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center space-y-3">
            {/* Vùng icon động */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                isDragActive
                  ? "bg-indigo-600 text-white scale-110 shadow-indigo-500/25"
                  : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-108 group-hover:bg-indigo-600 group-hover:text-white shadow-indigo-500/10"
              }`}
            >
              {isUploading ? (
                <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileIcon className="w-7 h-7" />
              )}
            </div>

            {/* Văn bản hướng dẫn */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {isUploading
                  ? `Đang tải tệp lên máy chủ (${uploadProgress}%)...`
                  : isDragActive
                  ? multiple
                    ? "Thả các tệp vào đây ngay!"
                    : "Thả tệp vào đây ngay!"
                  : multiple
                  ? "Kéo & thả nhiều tệp vào đây, hoặc nhấn để chọn"
                  : "Kéo & thả tệp vào đây, hoặc nhấn để chọn"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                {acceptedGuideText}
              </p>
            </div>

            {/* Nút giả lập để kích thích người dùng click */}
            <button
              type="button"
              disabled={disabled || isUploading}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 dark:group-hover:text-white transition-all pointer-events-none"
            >
              {buttonText || (multiple ? "Chọn tệp từ thiết bị" : "Chọn tệp từ máy tính")}
            </button>
          </div>
        </div>
      )}

      {/* Danh sách các file đã tải lên */}
      {showPreviewList && hasFiles && (
        <div className="space-y-2.5">
          {fileList.map((item) => (
            <FilePreviewItem
              key={item.id}
              file={item}
              disabled={disabled}
              readOnly={readOnly}
              onRemove={() => handleRemoveFile(item)}
            />
          ))}
        </div>
      )}

      {customError && <p className="text-xs text-red-500 mt-1">{customError}</p>}
    </div>
  );
};
