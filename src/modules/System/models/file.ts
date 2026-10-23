import { FileUploadResult } from "../../base/models/FileUploadResult";

export type { FileUploadResult };

/**
 * Trạng thái của file trong quá trình upload hoặc quản lý
 */
export type FileUploadStatus = "idle" | "uploading" | "success" | "error";

/**
 * Đối tượng tệp tin được quản lý đồng nhất trên UI (gồm metadata và trạng thái)
 */
export interface UploadedFileItem {
  id: string;
  fileName: string;
  storedFileName?: string;
  relativeUrl: string;
  fileSizeBytes: number;
  contentType?: string;
  rawFile?: File;
  status: FileUploadStatus;
  progress?: number;
  error?: string;
  uploadedAt?: string;
}

/**
 * Tùy chọn cấu hình khi gọi API upload
 */
export interface UploadOptions {
  /**
   * Callback nhận tiến độ upload từ 0 đến 100%
   */
  onProgress?: (percent: number) => void;
  /**
   * Signal hủy request
   */
  signal?: AbortSignal;
}

/**
 * Nhóm các định dạng file phổ biến
 */
export type FileAcceptPreset =
  | "all"
  | "document"
  | "image"
  | "pdf"
  | "spreadsheet"
  | "archive"
  | "media";

/**
 * Quy chuẩn kiểm tra tính hợp lệ của file tải lên
 */
export interface FileValidationRule {
  /**
   * Dung lượng tối đa mỗi file tính theo Megabytes (mặc định 25MB)
   */
  maxSizeMB?: number;
  /**
   * Các định dạng cho phép: có thể là preset hoặc chuỗi mở rộng như ".pdf,.docx,.xlsx"
   */
  accept?: string | FileAcceptPreset;
  /**
   * Số lượng file tối đa khi tải nhiều file
   */
  maxFiles?: number;
}
