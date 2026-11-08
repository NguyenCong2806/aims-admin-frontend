import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { ENV } from "../config/env";
import { API_ENDPOINTS } from "../common/ApiEndpoints";
import { APP_MESSAGES } from "../common/AppMessages";
import { extractApiErrorMessage } from "../common/httpErrorHelper";
import {
  getStoredAccessToken,
  getStoredTokenExpiresAt,
  saveAuthSession,
  clearAuthSession,
  getTokenExpiresAtIso,
} from "./tokenHelper";

/**
 * =========================================================================
 * BẢO MẬT ACCESS TOKEN VÀ REFRESH TOKEN THEO QUY CHUẨN BACKEND AIMS
 * =========================================================================
 * 1. ACCESS TOKEN:
 *    - Được lưu trữ đồng bộ in-memory và localStorage để duy trì phiên khi F5.
 *
 * 2. REFRESH TOKEN (/auth/refresh):
 *    - Bắt buộc gửi Access Token hiện tại trong request body: { accessToken: currentToken }
 *    - Bắt buộc gửi kèm header: Authorization: Bearer <current-access-token>
 *    - Bắt buộc kèm withCredentials: true để gửi HttpOnly cookie refresh_token.
 *
 * 3. 401 INTERCEPTOR & XỬ LÝ ĐĂNG XUẤT:
 *    - Request chỉ được retry tối đa 1 lần (_retry = true).
 *    - KHÔNG retry chính request /auth/refresh, /auth/login, /auth/logout.
 *    - Nếu tài khoản bị khóa, token bị thu hồi hoặc phiên bị thay thế bởi thiết bị khác:
 *      -> Đăng xuất ngay lập tức, không cố gọi refresh.
 *    - Nếu nhận 401 thông thường: Gọi /auth/refresh gửi kèm Access Token hiện tại.
 *    - Nếu /auth/refresh thất bại với 401: Xóa toàn bộ token & user, thông báo và đưa về trang login.
 * =========================================================================
 */

// 1. Quản lý Access Token trong In-Memory & Storage
let inMemoryAccessToken: string | null = null;
let inMemoryExpiresAt: string | null = null;

// Khởi tạo từ Storage
if (typeof window !== "undefined") {
  const storedToken = getStoredAccessToken();
  const storedExp = getStoredTokenExpiresAt();
  if (storedToken) {
    inMemoryAccessToken = storedToken;
    inMemoryExpiresAt = storedExp || getTokenExpiresAtIso(storedToken);
  }
}

// Callbacks thông báo cho tầng UI / AuthContext
type AuthEventCallback = () => void;
let sessionExpiredCallback: AuthEventCallback | null = null;
let tokenRefreshedCallback: ((newToken: string) => void) | null = null;

export const setAccessToken = (token: string | null, expiresAtIso?: string | null) => {
  inMemoryAccessToken = token;
  inMemoryExpiresAt = token ? getTokenExpiresAtIso(token, expiresAtIso) : null;
  if (token) {
    saveAuthSession(token, inMemoryExpiresAt);
  } else {
    clearAuthSession();
  }
};

export const getAccessToken = (): string | null => {
  if (!inMemoryAccessToken && typeof window !== "undefined") {
    const storedToken = getStoredAccessToken();
    if (storedToken) {
      inMemoryAccessToken = storedToken;
      inMemoryExpiresAt = getStoredTokenExpiresAt() || getTokenExpiresAtIso(storedToken);
    }
  }
  return inMemoryAccessToken;
};

export const getAccessTokenExpiresAt = (): string | null => {
  if (!inMemoryExpiresAt && typeof window !== "undefined") {
    inMemoryExpiresAt = getStoredTokenExpiresAt();
  }
  return inMemoryExpiresAt;
};

export const registerAuthCallbacks = (callbacks: {
  onSessionExpired?: AuthEventCallback;
  onTokenRefreshed?: (newToken: string) => void;
}) => {
  if (callbacks.onSessionExpired) sessionExpiredCallback = callbacks.onSessionExpired;
  if (callbacks.onTokenRefreshed) tokenRefreshedCallback = callbacks.onTokenRefreshed;
};

// 2. Khởi tạo Axios Instance chính
export const api = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true, // Gửi kèm HttpOnly cookie
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", // Bảo vệ bổ sung chống CSRF
  },
  timeout: 30000,
});

// 3. Request Interceptor: Tự động gắn Bearer Token nếu có
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Request Queuing & Concurrency Mutex khi xử lý làm mới token
type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// 5. Response Interceptor: Chuẩn hóa mã lỗi HTTP & xử lý Refresh Token 401
api.interceptors.response.use(
  (response) => {
    // Với mã 200, 201, 204: Thành công, trả về dữ liệu bình thường, không xử lý lỗi
    return response;
  },
  async (error: AxiosError) => {
    // Chuẩn hóa thông điệp lỗi tiếng Việt theo bảng mã lỗi (400, 401, 403, 404, 409, 500)
    // Đối với mã 200, 201, 204: Thành công, bỏ qua không xử lý
    if (error.response) {
      const status = error.response.status;
      if (status !== 200 && status !== 201 && status !== 204) {
        const friendlyMessage = extractApiErrorMessage(error);
        if (friendlyMessage) {
          error.message = friendlyMessage;
          (error as unknown as Record<string, unknown>).userFriendlyMessage = friendlyMessage;
        }
      }
    } else if (!error.response) {
      const friendlyMessage = extractApiErrorMessage(error);
      error.message = friendlyMessage;
      (error as unknown as Record<string, unknown>).userFriendlyMessage = friendlyMessage;
    }

    // Xử lý thông điệp lỗi 403 Forbidden: Hiển thị toast thông báo không có quyền
    if (error.response?.status === 403) {
      const forbiddenMessage =
        extractApiErrorMessage(error) || "Bạn không có quyền thực hiện chức năng này (403 Forbidden).";
      if (typeof window !== "undefined") {
        toast.error(forbiddenMessage, {
          id: "http-403-forbidden",
          duration: 4000,
        });
      }
    }

    const originalRequest = error.config as RetryConfig | undefined;

    // Không xử lý nếu không có config hoặc lỗi không phải 401
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Kiểm tra nếu tài khoản bị khóa, token bị thu hồi hoặc phiên bị thay thế bởi thiết bị khác -> Đăng xuất ngay, không thử refresh
    const errorData = error.response?.data as Record<string, unknown> | string | undefined;
    const errorDetail = typeof errorData === "string"
      ? errorData
      : (errorData?.message || errorData?.errorMessage || errorData?.detail || "") as string;
    const isSessionTerminated = /khóa|lock|thu hồi|revoked|vô hiệu|thiết bị khác|another device|session.*(replaced|terminated|superseded)|thay thế/i.test(errorDetail);

    if (isSessionTerminated) {
      setAccessToken(null);
      clearAuthSession();
      if (sessionExpiredCallback) sessionExpiredCallback();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("aims:auth-expired", {
            detail: { message: error.message || APP_MESSAGES.HTTP_STATUS[401] },
          })
        );
      }
      return Promise.reject(error);
    }

    // [Nguyên tắc 5]: Không retry nếu chính endpoint Refresh, Login hoặc Logout bị 401
    const isAuthEndpoint =
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH) ||
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGOUT);

    if (isAuthEndpoint) {
      setAccessToken(null);
      clearAuthSession();
      if (sessionExpiredCallback) sessionExpiredCallback();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("aims:auth-expired", {
            detail: { message: error.message || APP_MESSAGES.HTTP_STATUS[401] },
          })
        );
      }
      return Promise.reject(error);
    }

    // [Nguyên tắc 5]: Chỉ retry request tối đa một lần
    if (originalRequest._retry) {
      setAccessToken(null);
      clearAuthSession();
      if (sessionExpiredCallback) sessionExpiredCallback();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("aims:auth-expired", {
            detail: { message: error.message || APP_MESSAGES.HTTP_STATUS[401] },
          })
        );
      }
      return Promise.reject(error);
    }

    // Lấy Access Token hiện tại để gửi lên backend làm mới
    const currentToken = getAccessToken();

    if (!currentToken || currentToken.trim() === "") {
      setAccessToken(null);
      clearAuthSession();
      if (sessionExpiredCallback) sessionExpiredCallback();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("aims:auth-expired", {
            detail: { message: error.message || APP_MESSAGES.HTTP_STATUS[401] },
          })
        );
      }
      return Promise.reject(error);
    }

    // Nếu đang có tiến trình refresh token khác đang chạy -> xếp hàng chờ
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Đánh dấu bắt đầu tiến trình Refresh Token duy nhất (Mutex)
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      /**
       * Backend yêu cầu gửi Access Token hiện tại khi làm mới phiên:
       * - Request body: { accessToken: currentToken }
       * - Request header: Authorization: Bearer <currentToken>
       * - withCredentials: true (để trình duyệt gửi kèm HttpOnly refresh cookie)
       */
      const response = await axios.post<{
        accessToken?: string;
        accessTokenExpiresAt?: string;
        data?: {
          accessToken?: string;
          accessTokenExpiresAt?: string;
        };
        isSuccess?: boolean;
        isError?: boolean;
      }>(
        `${ENV.API_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        {
          accessToken: currentToken,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      const resData = response.data;
      const dataObj =
        resData && typeof resData === "object" && "data" in resData && (resData as { data?: { accessToken?: string; accessTokenExpiresAt?: string } }).data
          ? (resData as { data: { accessToken?: string; accessTokenExpiresAt?: string } }).data
          : (resData as { accessToken?: string; accessTokenExpiresAt?: string });

      const newAccessToken =
        dataObj?.accessToken || resData?.accessToken;
      const newExpiresAt =
        dataObj?.accessTokenExpiresAt || resData?.accessTokenExpiresAt;

      if (!newAccessToken) {
        throw new Error("Không nhận được token mới từ phản hồi máy chủ");
      }

      // Cập nhật AccessToken và thời gian hết hạn sau khi refresh
      setAccessToken(newAccessToken, newExpiresAt);

      if (tokenRefreshedCallback) {
        tokenRefreshedCallback(newAccessToken);
      }

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      if (axios.isAxiosError(refreshError)) {
        refreshError.message = extractApiErrorMessage(refreshError);
      }
      // Khi /auth/refresh trả về 401 hoặc lỗi (e.g. phiên bị thay thế bởi thiết bị khác):
      // Xóa toàn bộ token, dừng retry tự động, đăng xuất
      processQueue(refreshError, null);
      setAccessToken(null);
      clearAuthSession();

      if (sessionExpiredCallback) {
        sessionExpiredCallback();
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("aims:auth-expired", {
            detail: {
              message:
                refreshError instanceof Error && refreshError.message
                  ? refreshError.message
                  : APP_MESSAGES.HTTP_STATUS[401],
            },
          })
        );
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
