import { FileUploadResult, UploadOptions } from "../models/file";

export interface IFileService {
  /**
   * Tải lên 1 tập tin đơn lẻ lên máy chủ backend (/files/upload)
   */
  uploadFile(file: File, options?: UploadOptions): Promise<FileUploadResult>;

  /**
   * Tải lên danh sách nhiều tập tin cùng lúc (/files/upload-multiple)
   */
  uploadMultipleFiles(files: File[], options?: UploadOptions): Promise<FileUploadResult[]>;

  /**
   * Tải tập tin về máy tính người dùng qua endpoint backend (/files/download)
   */
  downloadFile(fileUrl: string, fileName?: string): Promise<Blob>;

  /**
   * Xóa file vật lý trên máy chủ backend (/files/delete)
   * @param fileUrl Đường dẫn tương đối hoặc tên file cần xóa
   * @param options Tùy chọn hỏi xác nhận người dùng trước khi xóa (confirm)
   */
  deleteFile(fileUrl: string, options?: { confirm?: boolean }): Promise<boolean>;

  /**
   * Lấy URL gọi trực tiếp tới endpoint /files/download để tải xuống trên trình duyệt
   */
  getDownloadUrl(fileUrl: string, fileName?: string): string;

  /**
   * Chuyển đổi relativeUrl thành đường dẫn đầy đủ có thể truy cập trực tiếp
   */
  getFileUrl(relativeUrl?: string | null): string;
}
