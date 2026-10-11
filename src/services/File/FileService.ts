import { api } from "../../library/axios";
import { API_ENDPOINTS, getFullApiUrl } from "../../common/apiEndpoints";
import { ENV } from "../../config/env";
import { FileUploadResult, UploadOptions } from "../../models/File/file";
import { IFileService } from "./IFileService";
import Swal from "sweetalert2";
import { toast } from "sonner";

export class FileService implements IFileService {
  constructor(
    private readonly uploadEndpoint: string = API_ENDPOINTS.FILES.UPLOAD,
    private readonly uploadMultipleEndpoint: string = API_ENDPOINTS.FILES.UPLOAD_MULTIPLE,
    private readonly downloadEndpoint: string = API_ENDPOINTS.FILES.DOWNLOAD,
    private readonly deleteEndpoint: string = API_ENDPOINTS.FILES.DELETE
  ) {}

  /**
   * Chuyển đổi relativeUrl thành đường dẫn đầy đủ có thể truy cập trực tiếp
   */
  getFileUrl(relativeUrl?: string | null): string {
    if (!relativeUrl) return "";
    if (
      relativeUrl.startsWith("http://") ||
      relativeUrl.startsWith("https://") ||
      relativeUrl.startsWith("blob:") ||
      relativeUrl.startsWith("data:")
    ) {
      return relativeUrl;
    }

    const cleanPath = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
    return `${ENV.BACKEND_TARGET}${cleanPath}`;
  }

  /**
   * Lấy URL gọi trực tiếp tới endpoint /files/download để tải xuống trên trình duyệt
   */
  getDownloadUrl(fileUrl: string, fileName?: string): string {
    if (!fileUrl) return "";
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }
    const cleanFileName = fileName || fileUrl.split("/").pop() || "download";
    const endpointUrl = getFullApiUrl(this.downloadEndpoint);
    const params = new URLSearchParams({
      fileUrl,
      fileName: cleanFileName,
    });
    return `${endpointUrl}?${params.toString()}`;
  }

  /**
   * Tải lên 1 file đơn lẻ (/files/upload)
   */
  async uploadFile(file: File, options?: UploadOptions): Promise<FileUploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<any>(this.uploadEndpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal: options?.signal,
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          options.onProgress(percentCompleted);
        }
      },
    });

    // Linh hoạt tương thích nếu backend bọc kết quả trong Result<FileUploadResult> hoặc trả về trực tiếp
    const rawData = response.data;
    if (rawData && typeof rawData === "object" && "data" in rawData && rawData.data) {
      return rawData.data as FileUploadResult;
    }

    return rawData as FileUploadResult;
  }

  /**
   * Tải lên nhiều file cùng lúc (/files/upload-multiple)
   */
  async uploadMultipleFiles(
    files: File[],
    options?: UploadOptions
  ): Promise<FileUploadResult[]> {
    if (!files || files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post<any>(this.uploadMultipleEndpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      signal: options?.signal,
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          options.onProgress(percentCompleted);
        }
      },
    });

    // Tương thích Result<FileUploadResult[]> hoặc FileUploadResult[]
    const rawData = response.data;
    if (rawData && typeof rawData === "object" && "data" in rawData && Array.isArray(rawData.data)) {
      return rawData.data as FileUploadResult[];
    }

    if (Array.isArray(rawData)) {
      return rawData as FileUploadResult[];
    }

    // Nếu trả về single object
    if (rawData && typeof rawData === "object" && "fileName" in rawData) {
      return [rawData as FileUploadResult];
    }

    return [];
  }

  /**
   * Tải tệp xuống máy khách dưới dạng file blob thông qua /files/download
   */
  async downloadFile(fileUrl: string, fileName?: string): Promise<Blob> {
    if (!fileUrl) {
      throw new Error("Đường dẫn file không hợp lệ để tải xuống.");
    }
    const cleanFileName = fileName || fileUrl.split("/").pop() || "download";
    let blobData: Blob;

    try {
      // 1. Ưu tiên gọi API backend /files/download để tải xuống file vật lý
      const response = await api.get<Blob>(this.downloadEndpoint, {
        params: {
          fileUrl,
          filePath: fileUrl,
          path: fileUrl,
          fileName: cleanFileName,
        },
        responseType: "blob",
      });
      blobData = response.data;
    } catch (err) {
      // 2. Dự phòng: nếu backend phục vụ static file trực tiếp hoặc route cần URL tĩnh
      try {
        const fullUrl = this.getFileUrl(fileUrl);
        const response = await api.get<Blob>(fullUrl, {
          responseType: "blob",
        });
        blobData = response.data;
      } catch (fallbackErr) {
        toast.error(`Không thể tải xuống tệp: ${cleanFileName}`);
        throw err;
      }
    }

    const blobUrl = window.URL.createObjectURL(blobData);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = cleanFileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    toast.success(`Đang tải xuống: ${cleanFileName}`);
    return blobData;
  }

  /**
   * Xóa file vật lý trên máy chủ backend (/files/delete)
   * @param fileUrl Đường dẫn tương đối hoặc tên file cần xóa
   * @param options Tùy chọn hỏi xác nhận người dùng trước khi xóa (confirm)
   */
  async deleteFile(fileUrl: string, options?: { confirm?: boolean }): Promise<boolean> {
    if (!fileUrl) return false;

    const extractedName = fileUrl.split("/").pop() || fileUrl;

    if (options?.confirm) {
      const confirmResult = await Swal.fire({
        title: "Xác nhận xóa tệp tin?",
        html: `Bạn có chắc muốn xóa vĩnh viễn tệp <b class="font-mono text-rose-600">${extractedName}</b> khỏi máy chủ?<br><span class="text-xs text-gray-500">Hành động này sẽ xóa file vật lý và không thể khôi phục.</span>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa vĩnh viễn",
        cancelButtonText: "Hủy bỏ",
        confirmButtonColor: "#e11d48",
        cancelButtonColor: "#64748b",
        reverseButtons: true,
      });

      if (!confirmResult.isConfirmed) {
        return false;
      }
    }

    const payload = {
      fileUrl,
      path: fileUrl,
      filePath: fileUrl,
      fileName: extractedName,
    };

    try {
      // 1. Thử gọi HTTP DELETE với cả query params và JSON body để tương thích mọi cấu hình controller
      await api.delete<any>(this.deleteEndpoint, {
        params: payload,
        data: payload,
      });
      toast.success(`Đã xóa tệp vật lý "${extractedName}" thành công!`);
      return true;
    } catch (err: any) {
      // 2. Dự phòng: Nếu server chỉ chấp nhận POST cho action delete
      if (err?.response?.status === 405) {
        try {
          await api.post<any>(this.deleteEndpoint, payload);
          toast.success(`Đã xóa tệp vật lý "${extractedName}" thành công!`);
          return true;
        } catch (postErr: any) {
          toast.error(postErr?.response?.data?.message || "Không thể xóa file trên máy chủ.");
          throw postErr;
        }
      }

      toast.error(err?.response?.data?.message || "Không thể xóa file vật lý trên máy chủ.");
      throw err;
    }
  }
}

export const fileService = new FileService();
