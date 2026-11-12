import axios from "axios";
import { API_ENDPOINTS } from "../common/ApiEndpoints";
import { ENV } from "../config/env";
import { extractApiErrorMessage } from "../common/httpErrorHelper";
import { api, getAccessToken, setAccessToken } from "../library/axios";
import {
  clearAuthSession,
  getStoredAccessToken,
  saveAuthSession,
} from "../library/tokenHelper";
import { AuthResponse, AuthUser, LoginCredentials } from "../types/auth";
import type { CurrentPermissions } from "../modules/Permissions/models/permissionModel";

// Helper giải mã cấu trúc trả về từ backend (hỗ trợ cả Result<AuthResponse> và AuthResponse trực tiếp)
function extractAuthResponse(raw: unknown): AuthResponse {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (obj.data && typeof obj.data === "object" && "accessToken" in (obj.data as Record<string, unknown>)) {
      return obj.data as AuthResponse;
    }
  }
  return raw as AuthResponse;
}

/**
 * Đăng nhập hệ thống (POST /auth/login)
 * Máy chủ sẽ:
 * - Trả về Access Token trong JSON Response cùng thời gian hết hạn accessTokenExpiresAt.
 * - Tự động thiết lập Refresh Token trong HttpOnly Cookie:
 *   Set-Cookie: refresh_token=...; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict
 * Phía Client:
 * - Lưu Access Token và User vào localStorage & in-memory.
 */
export async function login(payload: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      username: payload.username,
      password: payload.password,
    });

    const data = extractAuthResponse(response.data);

    // 1. Kiểm tra tính hợp lệ của phản hồi từ máy chủ:
    if (
      data.isSuccess === false ||
      data.isError === true ||
      !data.accessToken ||
      data.accessToken.trim() === ""
    ) {
      const errorMsg =
        data.errorMessage ||
        (data.errorCode === 401
          ? "The username or password does not exist."
          : "Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản và mật khẩu.");
      const error = new Error(errorMsg);
      (error as unknown as { response: { data: AuthResponse } }).response = { data };
      throw error;
    }

    setAccessToken(data.accessToken, data.accessTokenExpiresAt);
    saveAuthSession(data.accessToken, data.accessTokenExpiresAt, data.user);
    return data;
  } catch (error: unknown) {
    // 2. Nếu có phản hồi lỗi từ máy chủ (HTTP 400, 401, 500,...)
    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data as
        | (Partial<AuthResponse> & { message?: string; title?: string })
        | undefined;
      const errorMsg =
        responseData?.errorMessage ||
        responseData?.message ||
        responseData?.title ||
        (error.response.status === 401
          ? "The username or password does not exist."
          : "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.");

      const err = new Error(errorMsg);
      (err as unknown as { response: unknown }).response = error.response;
      throw err;
    }

    // 3. Nếu lỗi do chính chúng ta ném ra từ việc kiểm tra data.isSuccess === false
    if (error instanceof Error && error.message) {
      if (!error.message.includes("Network Error") && !error.message.includes("ERR_NETWORK")) {
        throw error;
      }
    }

    // 4. Mất kết nối máy chủ hoàn toàn (Network Error)
    const isNetworkError =
      axios.isAxiosError(error) &&
      (!error.response || error.code === "ERR_NETWORK" || error.message.includes("Network Error"));

    if (isNetworkError) {
      throw new Error("Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra lại dịch vụ backend.");
    }

    throw error;
  }
}

/**
 * Khôi phục phiên làm việc (POST /auth/refresh)
 * [Nguyên tắc 1]: Gửi Access Token hiện tại trong request body: { accessToken: currentToken }
 * [Nguyên tắc 2]: Gửi kèm Authorization: Bearer <current-access-token>, withCredentials: true.
 * [Nguyên tắc 3]: Nếu backend trả về 401 (token hết hạn, session bị thay thế bởi thiết bị khác):
 *                 Xóa token, xóa state, chuyển về trang login.
 * [Nguyên tắc 4]: Cập nhật AccessToken và accessTokenExpiresAt mới sau khi refresh thành công.
 */
export async function refreshSession(): Promise<AuthResponse> {
  // Lấy Access Token hiện tại (kể cả đã hết hạn) để gửi lên backend làm mới
  const currentToken = getAccessToken() || getStoredAccessToken();

  if (!currentToken || currentToken.trim() === "") {
    setAccessToken(null);
    clearAuthSession();
    throw new Error("Không tìm thấy Access Token hiện tại để làm mới phiên. Vui lòng đăng nhập lại.");
  }

  try {
    // Backend yêu cầu gửi Access Token hiện tại trong body và header
    const response = await axios.post(
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

    const data = extractAuthResponse(response.data);

    if (
      !data ||
      data.isSuccess === false ||
      data.isError === true ||
      !data.accessToken ||
      data.accessToken.trim() === ""
    ) {
      setAccessToken(null);
      clearAuthSession();
      throw new Error(data?.errorMessage || "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
    }

    // Cập nhật AccessToken và thời gian hết hạn mới
    setAccessToken(data.accessToken, data.accessTokenExpiresAt);
    saveAuthSession(data.accessToken, data.accessTokenExpiresAt, data.user);
    return data;
  } catch (error) {
    // Khi refresh thất bại (401 - e.g. session bị thay thế bởi thiết bị khác, cookie hết hạn):
    // Xóa toàn bộ token & session
    setAccessToken(null);
    clearAuthSession();
    if (axios.isAxiosError(error)) {
      const msg = extractApiErrorMessage(error);
      error.message = msg;
    }
    throw error;
  }
}

/**
 * Đăng xuất an toàn (POST /auth/logout)
 * Máy chủ sẽ:
 * - Hủy Refresh Token trong Database / Redis.
 * - Xóa HttpOnly Cookie trên trình duyệt.
 * Phía Frontend:
 * - Xóa sạch Access Token, User và thời gian hết hạn khỏi localStorage & Memory.
 */
export async function logout(): Promise<void> {
  try {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (err) {
    console.warn("[Auth]: Backend logout request failed, clearing local session.", err);
  } finally {
    setAccessToken(null);
    clearAuthSession();
  }
}

/**
 * Lấy thông tin tài khoản hiện tại (GET /auth/me)
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>(API_ENDPOINTS.AUTH.ME);
  return data;
}

/**
 * Lấy toàn bộ quyền của tài khoản hiện tại (GET /api/v1/permissions/me)
 */
export async function getMyPermissions(): Promise<CurrentPermissions> {
  const response = await api.get<{
    isSuccess?: boolean;
    isError?: boolean;
    errorMessage?: string;
    data?: CurrentPermissions;
  } | CurrentPermissions>(API_ENDPOINTS.PERMISSIONS.ME);

  const raw = response.data;
  if (raw && typeof raw === "object" && "data" in raw && raw.data) {
    return raw.data as CurrentPermissions;
  }
  return raw as CurrentPermissions;
}
