import axios from "axios";
import { APP_MESSAGES } from "./AppMessages";

/**
 * Danh mục chuẩn hóa các mã lỗi HTTP theo quy định hệ thống AIMS
 * Lưu ý: Mã 200 và 201 là thành công, không xử lý lỗi.
 */
export const HTTP_STATUS_ERRORS = {
  400: APP_MESSAGES.HTTP_STATUS[400], // "Dữ liệu không hợp lệ"
  401: APP_MESSAGES.HTTP_STATUS[401], // "Chưa đăng nhập/ token không hợp lệ"
  403: APP_MESSAGES.HTTP_STATUS[403], // "Đã đăng nhập nhưng không có quyền"
  404: APP_MESSAGES.HTTP_STATUS[404], // "Không tìm thấy dữ liệu"
  409: APP_MESSAGES.HTTP_STATUS[409], // "Trùng dữ liệu"
  500: APP_MESSAGES.HTTP_STATUS[500], // "Lỗi hệ thống"
} as const;

export type HttpErrorCode = keyof typeof HTTP_STATUS_ERRORS;

/**
 * Kiểm tra xem một mã HTTP status có phải là mã lỗi cần xử lý không (bỏ qua 200, 201, 204)
 */
export const isHttpErrorStatus = (status: number): boolean => {
  return status !== 200 && status !== 201 && status !== 204 && status >= 400;
};

/**
 * Trích xuất và định dạng thông điệp lỗi thân thiện bằng tiếng Việt
 * Kết hợp thông điệp chuẩn hóa theo mã HTTP và chi tiết lỗi thực tế từ Backend (nếu có)
 */
export function extractApiErrorMessage(error: unknown, defaultFallback?: string): string {
  if (!error) return defaultFallback || APP_MESSAGES.COMMON.ERROR_OCCURRED;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    // Bỏ qua mã 200, 201, 204 vì đây là thành công
    if (status === 200 || status === 201 || status === 204) {
      return "";
    }

    const data = error.response?.data as Record<string, unknown> | string | undefined;
    let detail = "";

    if (typeof data === "string" && data.trim()) {
      detail = data.trim();
    } else if (data && typeof data === "object") {
      if (typeof data.message === "string" && data.message.trim()) {
        detail = data.message.trim();
      } else if (typeof data.errorMessage === "string" && data.errorMessage.trim()) {
        detail = data.errorMessage.trim();
      } else if (typeof data.title === "string" && data.title.trim()) {
        detail = data.title.trim();
      } else if (typeof data.detail === "string" && data.detail.trim()) {
        detail = data.detail.trim();
      }

      // Xử lý chi tiết lỗi validation (ASP.NET ProblemDetails / ValidationProblemDetails)
      if (data.errors) {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          const list = data.errors
            .map((e: unknown) => (typeof e === "string" ? e : JSON.stringify(e)))
            .filter(Boolean);
          if (list.length > 0) {
            detail = detail ? `${detail}: ${list.join("; ")}` : list.join("; ");
          }
        } else if (typeof data.errors === "object" && data.errors !== null) {
          const errorList = Object.entries(data.errors as Record<string, unknown>)
            .map(([field, errs]) => {
              const msgs = Array.isArray(errs) ? errs.join(", ") : String(errs);
              return `${field}: ${msgs}`;
            })
            .filter(Boolean);
          if (errorList.length > 0) {
            detail = detail ? `${detail} (${errorList.join("; ")})` : errorList.join("; ");
          }
        }
      }
    }

    // Nếu mã HTTP nằm trong bảng chuẩn (400, 401, 403, 404, 409, 500)
    if (status && status in HTTP_STATUS_ERRORS) {
      const standardText = HTTP_STATUS_ERRORS[status as HttpErrorCode];

      // Nếu có chi tiết nghiệp vụ cụ thể từ backend
      if (detail && detail !== standardText && !detail.toLowerCase().includes("request failed")) {
        return `${standardText} (${detail})`;
      }
      return standardText;
    }

    // Nếu có chi tiết từ backend nhưng mã status khác
    if (detail && !detail.toLowerCase().includes("request failed")) {
      return detail;
    }

    // Lỗi không có response từ máy chủ (Network error / Timeout)
    if (!error.response) {
      return APP_MESSAGES.COMMON.NETWORK_ERROR;
    }
  }

  if (error instanceof Error) {
    if (!error.message.toLowerCase().includes("request failed")) {
      return error.message;
    }
  }

  return defaultFallback || APP_MESSAGES.COMMON.ERROR_OCCURRED;
}

