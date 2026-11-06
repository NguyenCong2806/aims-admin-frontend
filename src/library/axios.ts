import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { ENV } from "../config/env";
import { API_ENDPOINTS } from "../common/ApiEndpoints";
import { extractApiErrorMessage } from "../common/httpErrorHelper";
import {
  getStoredAccessToken,
  getStoredTokenExpiresAt,
  saveAuthSession,
  clearAuthSession,
  isTokenValid,
  getTokenExpiresAtIso,
} from "./tokenHelper";

/**
 * =========================================================================
 * BẢO MẬT ACCESS TOKEN VÀ REFRESH TOKEN THEO QUY CHUẨN BACKEND AIMS
 * =========================================================================
 * 1. ACCESS TOKEN:
 *    - Được lưu trữ đồng bộ in-memory và localStorage để duy trì phiên khi F5.
 *    - Kiểm tra thời gian hết hạn (AccessTokenExpiresAt hoặc claim JWT `exp`).
 *    - Khi AccessToken đã hết hạn: KHÔNG cố gọi /auth/refresh bằng cookie,
 *      xóa AccessToken và chuyển người dùng về trang login.
 *
 * 2. REFRESH TOKEN (/auth/refresh):
 *    - Chỉ được phép gọi khi AccessToken CÒN HẠN (gia hạn chủ động / sliding session).
 *    - Bắt buộc gửi header: `Authorization: Bearer <current-access-token>`
 *    - Bắt buộc kèm `withCredentials: true` để gửi HttpOnly cookie refresh_token.
 *    - Body yêu cầu là `null`.
 *
 * 3. 401 INTERCEPTOR & CHỐNG LẶP VÔ HẠN:
 *    - Request chỉ được retry tối đa 1 lần (`_retry = true`).
 *    - KHÔNG retry chính request /auth/refresh, /auth/login, /auth/logout.
 *    - KHÔNG tự động refresh nếu AccessToken đã hết hạn.
 *    - Nếu refresh thất bại với 401: Xóa toàn bộ token & user, dừng retry, logout.
 * =========================================================================
 */

// 1. Quản lý Access Token trong In-Memory & Storage
let inMemoryAccessToken: string | null = null;
let inMemoryExpiresAt: string | null = null;

// Khởi tạo từ Storage nếu còn hạn
if (typeof window !== "undefined") {
  const storedToken = getStoredAccessToken();
  const storedExp = getStoredTokenExpiresAt();
  if (storedToken && isTokenValid(storedToken, storedExp)) {
    inMemoryAccessToken = storedToken;
    inMemoryExpiresAt = storedExp || getTokenExpiresAtIso(storedToken);
  } else if (storedToken) {
    clearAuthSession();
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
    const storedExp = getStoredTokenExpiresAt();
    if (storedToken && isTokenValid(storedToken, storedExp)) {
      inMemoryAccessToken = storedToken;
      inMemoryExpiresAt = storedExp || getTokenExpiresAtIso(storedToken);
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

    const originalRequest = error.config as RetryConfig | undefined;

    // Không xử lý nếu không có config hoặc lỗi không phải 401
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // [Nguyên tắc 5]: Không retry nếu chính endpoint Refresh, Login hoặc Logout bị 401
    const isAuthEndpoint =
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH) ||
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGOUT);

    if (isAuthEndpoint) {
      setAccessToken(null);
      if (sessionExpiredCallback) sessionExpiredCallback();
      return Promise.reject(error);
    }

    // [Nguyên tắc 5]: Chỉ retry request tối đa một lần
    if (originalRequest._retry) {
      setAccessToken(null);
      if (sessionExpiredCallback) sessionExpiredCallback();
      return Promise.reject(error);
    }

    // [Nguyên tắc 1 & 5]: Không tự động refresh nếu AccessToken đã hết hạn
    const currentToken = getAccessToken();
    const currentExp = getAccessTokenExpiresAt();

    if (!currentToken || !isTokenValid(currentToken, currentExp)) {
      // AccessToken đã hết hạn: Không cố refresh bằng cookie. Xóa token và yêu cầu login lại
      setAccessToken(null);
      if (sessionExpiredCallback) sessionExpiredCallback();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("aims:auth-expired"));
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
       * [Nguyên tắc 2]: Gọi POST /auth/refresh khi AccessToken còn hạn
       * Gửi cả Authorization: Bearer <current-access-token>
       * withCredentials: true (để gửi kèm HttpOnly refresh cookie)
       * Body: null
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
        null,
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
      const newAccessToken =
        resData?.accessToken || resData?.data?.accessToken;
      const newExpiresAt =
        resData?.accessTokenExpiresAt || resData?.data?.accessTokenExpiresAt;

      if (!newAccessToken) {
        throw new Error("Không nhận được token mới từ phản hồi máy chủ");
      }

      // [Nguyên tắc 4]: Cập nhật AccessToken và thời gian hết hạn sau khi refresh
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
      // [Nguyên tắc 3]: Khi /auth/refresh trả về 401 hoặc lỗi:
      // Xóa AccessToken, xóa state, dừng retry tự động, đăng xuất
      processQueue(refreshError, null);
      setAccessToken(null);

      if (sessionExpiredCallback) {
        sessionExpiredCallback();
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("aims:auth-expired"));
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
