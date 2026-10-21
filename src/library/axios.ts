import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { ENV } from "../config/env";
import { API_ENDPOINTS } from "../common/apiEndpoints";

/**
 * =========================================================================
 * BẢO MẬT ACCESS TOKEN VÀ REFRESH TOKEN VỚI HTTPONLY COOKIE
 * =========================================================================
 * 1. ACCESS TOKEN:
 *    - Được lưu trữ IN-MEMORY (biến cục bộ JS trong bộ nhớ runtime).
 *    - TUYỆT ĐỐI KHÔNG lưu vào localStorage hay sessionStorage để triệt tiêu
 *      nguy cơ bị đánh cắp bởi mã độc XSS (Cross-Site Scripting).
 *
 * 2. REFRESH TOKEN:
 *    - Được lưu trữ hoàn toàn trong HTTPONLY COOKIE do máy chủ cấp phát.
 *    - Trình duyệt KHÔNG CHO PHÉP bất kỳ mã JavaScript nào đọc cookie này.
 *    - Axios với `withCredentials: true` sẽ tự động đính kèm cookie mỗi khi gọi
 *      yêu cầu tới backend (đặc biệt là endpoint /auth/refresh).
 *
 * 3. BẢO VỆ CHỐNG TẤN CÔNG CSRF (Cross-Site Request Forgery):
 *    - Tự động gắn header `X-Requested-With: XMLHttpRequest` cho mọi request.
 *    - Trình duyệt sẽ chặn cross-site request tùy tiện thiếu header này qua CORS Preflight.
 * =========================================================================
 */

// 1. Lưu trữ Access Token hoàn toàn trong In-Memory
let inMemoryAccessToken: string | null = null;

// Callbacks thông báo cho tầng UI/AuthContext
type AuthEventCallback = () => void;
let sessionExpiredCallback: AuthEventCallback | null = null;
let tokenRefreshedCallback: ((newToken: string) => void) | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = (): string | null => inMemoryAccessToken;

export const registerAuthCallbacks = (callbacks: {
  onSessionExpired?: AuthEventCallback;
  onTokenRefreshed?: (newToken: string) => void;
}) => {
  if (callbacks.onSessionExpired) sessionExpiredCallback = callbacks.onSessionExpired;
  if (callbacks.onTokenRefreshed) tokenRefreshedCallback = callbacks.onTokenRefreshed;
};

// 2. Khởi tạo Axios Instance với withCredentials = true để tự động gửi HttpOnly Cookie
export const api = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true, // BẮT BUỘC: Cho phép gửi/nhận HttpOnly Cookie (Refresh Token)
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", // Bảo vệ bổ sung chống CSRF
  },
  timeout: 30000,
});

// 3. Request Interceptor: Tự động gắn Bearer Token nếu có trong memory
api.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Request Queuing & Concurrency Mutex cho 401 Unauthorized
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

// 5. Response Interceptor: Tự động phục hồi phiên bằng HttpOnly Cookie khi gặp 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    // Không xử lý nếu không có config hoặc lỗi không phải 401
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Không retry nếu chính endpoint Refresh, Login hoặc Logout bị 401 để tránh vòng lặp vô tận
    const isAuthEndpoint =
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH) ||
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGOUT);

    if (isAuthEndpoint) {
      setAccessToken(null);
      return Promise.reject(error);
    }

    // Nếu request này đã từng thử retry 1 lần mà vẫn 401 -> Session thực sự hết hạn
    if (originalRequest._retry) {
      setAccessToken(null);
      if (sessionExpiredCallback) sessionExpiredCallback();
      return Promise.reject(error);
    }

    // Nếu đang có 1 tiến trình refresh token khác đang chạy -> Đẩy request hiện tại vào hàng đợi (Queue)
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

    // Đánh dấu bắt đầu tiến trình Refresh Token duy nhất (Single-Flight Mutex)
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      /**
       * Gửi yêu cầu POST tới endpoint Refresh.
       * Lưu ý: KHÔNG cần đính kèm body chứa refresh token, vì trình duyệt
       * sẽ tự động đính kèm HttpOnly Cookie `refresh_token` qua `withCredentials: true`.
       */
      const { data } = await api.post<{ accessToken: string; accessTokenExpiresAt?: string }>(
        API_ENDPOINTS.AUTH.REFRESH
      );

      const newAccessToken = data.accessToken;
      setAccessToken(newAccessToken);

      if (tokenRefreshedCallback) {
        tokenRefreshedCallback(newAccessToken);
      }

      // Xử lý và giải phóng toàn bộ các request đang chờ trong hàng đợi
      processQueue(null, newAccessToken);

      // Thực thi lại request gốc ban đầu với token mới
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh thất bại (Refresh Token trong HttpOnly Cookie đã hết hạn hoặc bị thu hồi)
      processQueue(refreshError, null);
      setAccessToken(null);

      // Kích hoạt callback thông báo phiên đăng nhập kết thúc
      if (sessionExpiredCallback) {
        sessionExpiredCallback();
      }

      // Phát sự kiện toàn cục để ứng dụng React cập nhật
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("aims:auth-expired"));
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);