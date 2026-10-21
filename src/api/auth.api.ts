import axios from "axios";
import { API_ENDPOINTS } from "../common/apiEndpoints";
import { ENV } from "../config/env";
import { api, setAccessToken } from "../library/axios";
import { AuthResponse, AuthUser, LoginCredentials } from "../types/auth";

// Tài khoản giả lập phục vụ chế độ phát triển (khi máy chủ backend local chưa bật)
const DEMO_ACCOUNTS: Record<string, AuthUser> = {
  admin: {
    id: 1,
    username: "admin",
    email: "admin@aims.vn",
    fullName: "Vũ Hoàng Long (Super Admin)",
    avatarUrl: "/images/user/owner.jpg",
    roles: ["SuperAdmin", "AssetManager"],
    permissions: ["*"],
    departmentName: "Ban Giám Đốc",
  },
  "hoang.it": {
    id: 2,
    username: "hoang.it",
    email: "hoang.it@aims.vn",
    fullName: "Nguyễn Huy Hoàng (IT Admin)",
    avatarUrl: "/images/user/user-01.jpg",
    roles: ["AssetManager", "ITSupport"],
    permissions: ["assets:*"],
    departmentName: "Phòng Công nghệ Thông tin",
  },
  "lan.hr": {
    id: 3,
    username: "lan.hr",
    email: "lan.hr@aims.vn",
    fullName: "Trần Thị Lan (HR Manager)",
    avatarUrl: "/images/user/user-02.jpg",
    roles: ["DepartmentHead"],
    permissions: ["users:read", "assets:read"],
    departmentName: "Phòng Hành chính Nhân sự",
  },
  staff: {
    id: 4,
    username: "staff",
    email: "staff@aims.vn",
    fullName: "Lê Văn Hùng (Nhân viên)",
    avatarUrl: "/images/user/user-03.jpg",
    roles: ["Staff"],
    permissions: ["assets:read"],
    departmentName: "Phòng Kinh doanh",
  },
};

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
 * - Trả về Access Token (In-Memory) trong JSON Response.
 * - Tự động thiết lập Refresh Token trong HttpOnly Cookie:
 *   Set-Cookie: refresh_token=...; Path=/api/v1/auth; HttpOnly; Secure; SameSite=Strict
 */
export async function login(payload: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      username: payload.username,
      password: payload.password,
    });

    const data = extractAuthResponse(response.data);

    // 1. Kiểm tra tính hợp lệ của phản hồi từ máy chủ:
    // Nếu isSuccess là false HOẶC isError là true HOẶC không có accessToken
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

    setAccessToken(data.accessToken);
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

    // 4. Fallback chỉ kích hoạt khi máy chủ offline hoàn toàn (Network Error) VÀ dùng tài khoản demo
    const isNetworkError =
      axios.isAxiosError(error) &&
      (!error.response || error.code === "ERR_NETWORK" || error.message.includes("Network Error"));

    if (isNetworkError) {
      const normalizedUser = payload.username.toLowerCase();
      if (DEMO_ACCOUNTS[normalizedUser]) {
        console.warn(
          "[Auth Offline Demo]: Không thể kết nối tới máy chủ backend tại " +
            ENV.API_URL +
            ". Kích hoạt tài khoản mẫu offline: " +
            payload.username
        );
        const demoUser = DEMO_ACCOUNTS[normalizedUser];
        const mockResponse: AuthResponse = {
          accessToken: `mock_jwt_access_token_${Date.now()}`,
          accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          user: demoUser,
          isSuccess: true,
          isError: false,
          errorMessage: "",
          errorCode: 200,
        };
        setAccessToken(mockResponse.accessToken);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("aims_demo_session", JSON.stringify(mockResponse.user));
          localStorage.setItem("aims_has_session", "true");
        }
        return mockResponse;
      }

      throw new Error("Không thể kết nối đến máy chủ backend. Vui lòng kiểm tra lại dịch vụ backend.");
    }

    throw error;
  }
}

/**
 * Khôi phục phiên làm việc (POST /auth/refresh - Silent Refresh)
 * Trình duyệt tự động gửi HttpOnly Cookie `refresh_token` kèm theo request.
 * Nếu hợp lệ, Backend trả về Access Token mới và thông tin người dùng.
 */
export async function refreshSession(): Promise<AuthResponse> {
  // 1. Nếu đang có phiên Demo, khôi phục tức thì mà không gửi request lên Backend (tránh sinh lỗi 401 giả)
  if (typeof window !== "undefined") {
    const demoUserStr = sessionStorage.getItem("aims_demo_session");
    if (demoUserStr) {
      try {
        const demoUser: AuthUser = JSON.parse(demoUserStr);
        const mockResponse: AuthResponse = {
          accessToken: `mock_refreshed_token_${Date.now()}`,
          accessTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          user: demoUser,
          isSuccess: true,
          isError: false,
          errorMessage: "",
          errorCode: 200,
        };
        setAccessToken(mockResponse.accessToken);
        return mockResponse;
      } catch {
        sessionStorage.removeItem("aims_demo_session");
      }
    }
  }

  // 2. Phiên thật: Gửi yêu cầu Silent Refresh tới Backend để đọc HttpOnly Cookie
  try {
    const response = await api.post(API_ENDPOINTS.AUTH.REFRESH);
    const data = extractAuthResponse(response.data);

    if (
      !data ||
      data.isSuccess === false ||
      data.isError === true ||
      !data.accessToken ||
      data.accessToken.trim() === ""
    ) {
      setAccessToken(null);
      throw new Error(data?.errorMessage || "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
    }

    setAccessToken(data.accessToken);
    return data;
  } catch (error) {
    setAccessToken(null);
    throw error;
  }
}

/**
 * Đăng xuất an toàn (POST /auth/logout)
 * Máy chủ sẽ:
 * - Hủy Refresh Token trong Database / Redis.
 * - Xóa HttpOnly Cookie trên trình duyệt:
 *   Set-Cookie: refresh_token=; Path=/api/v1/auth; Max-Age=0; HttpOnly
 * Phía Frontend:
 * - Xóa sạch Access Token trong Memory và giải phóng session state.
 */
export async function logout(): Promise<void> {
  try {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (err) {
    console.warn("[Auth]: Backend logout request failed, clearing local memory session.", err);
  } finally {
    setAccessToken(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("aims_demo_session");
      localStorage.removeItem("aims_has_session");
    }
  }
}

/**
 * Lấy thông tin tài khoản hiện tại (GET /auth/me)
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>(API_ENDPOINTS.AUTH.ME);
  return data;
}