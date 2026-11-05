/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { toast } from "sonner";
import { login as apiLogin, logout as apiLogout, refreshSession as apiRefresh } from "../api/auth.api";
import { registerAuthCallbacks, setAccessToken } from "../library/axios";
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredTokenExpiresAt,
  getStoredUser,
  getTokenExpiresAtIso,
  isTokenValid,
  saveAuthSession,
} from "../library/tokenHelper";
import { AuthContextValue, AuthResponse, AuthState, LoginCredentials } from "../types/auth";
import { UserRole } from "../modules/Users/models/userAccount";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    isInitializing: true, // Đang kiểm tra token khi tải app
    error: null,
  });

  // Guard tránh gọi kép initializeAuth trong React 18+ StrictMode
  const hasInitializedRef = useRef(false);

  // Timer tự động gia hạn token trước khi hết hạn (Proactive Refresh)
  const proactiveRefreshTimerRef = useRef<number | null>(null);

  const clearProactiveTimer = () => {
    if (proactiveRefreshTimerRef.current) {
      window.clearTimeout(proactiveRefreshTimerRef.current);
      proactiveRefreshTimerRef.current = null;
    }
  };

  /**
   * Lên lịch tự động làm mới token trước khi hết hạn
   * [Lưu ý quan trọng]: Chỉ thực hiện khi AccessToken VẪN CÒN HẠN.
   */
  const scheduleProactiveRefresh = useCallback((expiresAtIso?: string) => {
    clearProactiveTimer();

    if (!expiresAtIso) return;

    try {
      const expiresTime = new Date(expiresAtIso).getTime();
      const now = Date.now();
      const timeRemainingMs = expiresTime - now;

      // Chỉ lên lịch nếu còn hạn ít nhất 10 giây
      if (timeRemainingMs > 10000) {
        // Làm mới trước khi hết hạn 60 giây (hoặc giữa chừng nếu thời hạn còn ít)
        const refreshDelayMs =
          timeRemainingMs > 90000
            ? timeRemainingMs - 60000
            : Math.max(Math.floor(timeRemainingMs * 0.7), 5000);

        proactiveRefreshTimerRef.current = window.setTimeout(async () => {
          try {
            console.log("[Auth Proactive]: Đang tự động làm mới token trước khi hết hạn...");
            const res = await apiRefresh();
            if (res?.accessToken) {
              setState((prev) => ({
                ...prev,
                accessToken: res.accessToken,
                user: res.user || prev.user,
              }));
              scheduleProactiveRefresh(res.accessTokenExpiresAt);
            }
          } catch (err) {
            console.warn("[Auth Proactive]: Gia hạn chủ động không thành công, phiên sẽ được kiểm soát bởi interceptor.", err);
          }
        }, refreshDelayMs);
      }
    } catch (err) {
      console.error("[Auth Proactive Timer Error]:", err);
    }
  }, []);

  /**
   * [Nguyên tắc 3]: Xử lý khi phiên làm việc hết hạn hoặc bị hủy:
   * - Xóa AccessToken khỏi local storage / state management.
   * - Xóa thông tin user trong state.
   * - Dừng retry tự động.
   * - Chuyển về trang login.
   */
  const handleSessionExpired = useCallback(() => {
    clearProactiveTimer();
    setAccessToken(null);
    clearAuthSession();

    setState((prev) => {
      if (prev.isAuthenticated) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.");
      }
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
        error: "Session expired",
      };
    });
  }, []);

  // Đăng ký callbacks với Axios Interceptor & sự kiện hệ thống
  useEffect(() => {
    registerAuthCallbacks({
      onSessionExpired: handleSessionExpired,
      onTokenRefreshed: (newToken) => {
        setState((prev) => ({ ...prev, accessToken: newToken }));
      },
    });

    const handleAuthExpiredEvent = () => handleSessionExpired();
    window.addEventListener("aims:auth-expired", handleAuthExpiredEvent);

    return () => {
      clearProactiveTimer();
      window.removeEventListener("aims:auth-expired", handleAuthExpiredEvent);
    };
  }, [handleSessionExpired]);

  /**
   * [Nguyên tắc 1]: Khi khởi động ứng dụng
   * Front-end đọc AccessToken đã lưu:
   * • Nếu AccessToken vẫn còn hạn:
   *   - Dùng tiếp AccessToken hiện tại.
   *   - KHÔNG gọi /auth/refresh bắt buộc.
   *   - Sử dụng bình thường.
   * • Nếu AccessToken đã hết hạn:
   *   - KHÔNG cố refresh bằng cookie.
   *   - Xóa AccessToken đã lưu.
   *   - Chuyển người dùng về màn hình login.
   * • Nếu không có AccessToken:
   *   - Hiển thị màn hình login.
   */
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const initializeAuth = () => {
      // 1. Kiểm tra tài khoản Demo phát triển (nếu đang bật)
      if (typeof window !== "undefined") {
        const demoUserStr = sessionStorage.getItem("aims_demo_session");
        if (demoUserStr) {
          try {
            const demoUser = JSON.parse(demoUserStr);
            setState({
              user: demoUser,
              accessToken: "mock_demo_session_token",
              isAuthenticated: true,
              isLoading: false,
              isInitializing: false,
              error: null,
            });
            return;
          } catch {
            sessionStorage.removeItem("aims_demo_session");
          }
        }
      }

      // 2. Đọc AccessToken và dữ liệu xác thực đã lưu
      const storedToken = getStoredAccessToken();
      const storedExp = getStoredTokenExpiresAt();
      const storedUser = getStoredUser();

      // Trường hợp: Không có AccessToken -> hiển thị login
      if (!storedToken) {
        clearAuthSession();
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          isAuthenticated: false,
          user: null,
          accessToken: null,
        }));
        return;
      }

      // Trường hợp: Có AccessToken -> Kiểm tra hạn sử dụng
      if (isTokenValid(storedToken, storedExp)) {
        // • CÒN HẠN: Dùng tiếp AccessToken hiện tại, KHÔNG gọi /auth/refresh bắt buộc
        setAccessToken(storedToken, storedExp);
        setState({
          user: storedUser,
          accessToken: storedToken,
          isAuthenticated: true,
          isLoading: false,
          isInitializing: false,
          error: null,
        });

        // Lên lịch gia hạn chủ động trước khi token hết hạn
        scheduleProactiveRefresh(storedExp || getTokenExpiresAtIso(storedToken) || undefined);
      } else {
        // • HẾT HẠN: Không cố refresh bằng cookie, xóa token và yêu cầu login lại
        console.warn("[Auth]: AccessToken đã hết hạn khi mở ứng dụng. Chuyển về màn hình đăng nhập.");
        clearAuthSession();
        setAccessToken(null);
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          isAuthenticated: false,
          user: null,
          accessToken: null,
        }));
      }
    };

    initializeAuth();
  }, [scheduleProactiveRefresh]);

  // Hàm Đăng nhập
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const res = await apiLogin(credentials);

        if (
          !res ||
          res.isSuccess === false ||
          res.isError === true ||
          !res.accessToken ||
          res.accessToken.trim() === ""
        ) {
          const errMsg =
            res?.errorMessage ||
            (res?.errorCode === 401
              ? "The username or password does not exist."
              : "Đăng nhập thất bại. Tên đăng nhập hoặc mật khẩu không chính xác.");
          throw new Error(errMsg);
        }

        if (
          !res.user ||
          (res.user.id === 0 && (!res.user.username || res.user.username.trim() === ""))
        ) {
          const errMsg =
            res.errorMessage ||
            "Không nhận được thông tin người dùng hợp lệ từ máy chủ.";
          throw new Error(errMsg);
        }

        saveAuthSession(res.accessToken, res.accessTokenExpiresAt, res.user);
        setAccessToken(res.accessToken, res.accessTokenExpiresAt);

        setState({
          user: res.user,
          accessToken: res.accessToken,
          isAuthenticated: true,
          isLoading: false,
          isInitializing: false,
          error: null,
        });

        scheduleProactiveRefresh(res.accessTokenExpiresAt);
        return res;
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu.";

        setAccessToken(null);
        clearAuthSession();

        setState((prev) => ({
          ...prev,
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMsg,
        }));
        throw err;
      }
    },
    [scheduleProactiveRefresh]
  );

  // Hàm Đăng xuất
  const logout = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    clearProactiveTimer();
    clearAuthSession();
    setAccessToken(null);

    try {
      await apiLogout();
    } finally {
      setState({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
        error: null,
      });
      toast.success("Đã đăng xuất an toàn khỏi hệ thống.");
    }
  }, []);

  // Hàm làm mới phiên thủ công (chỉ hoạt động khi AccessToken còn hạn)
  const refreshSession = useCallback(async (): Promise<AuthResponse | null> => {
    try {
      const res = await apiRefresh();
      if (res?.accessToken) {
        saveAuthSession(res.accessToken, res.accessTokenExpiresAt, res.user);
        setAccessToken(res.accessToken, res.accessTokenExpiresAt);

        setState((prev) => ({
          ...prev,
          user: res.user || prev.user,
          accessToken: res.accessToken,
          isAuthenticated: true,
        }));
        scheduleProactiveRefresh(res.accessTokenExpiresAt);
        return res;
      }
      return null;
    } catch {
      handleSessionExpired();
      return null;
    }
  }, [scheduleProactiveRefresh, handleSessionExpired]);

  // Helper kiểm tra quyền vai trò
  const hasRole = useCallback(
    (role: UserRole | string): boolean => {
      if (!state.user?.roles) return false;
      if (state.user.roles.includes("SuperAdmin")) return true;
      return state.user.roles.includes(role as UserRole);
    },
    [state.user]
  );

  const hasAnyRole = useCallback(
    (roles: (UserRole | string)[]): boolean => {
      if (!state.user?.roles) return false;
      if (state.user.roles.includes("SuperAdmin")) return true;
      return roles.some((r) => state.user?.roles?.includes(r as UserRole));
    },
    [state.user]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!state.user?.permissions) return false;
      if (state.user.permissions.includes("*")) return true;
      return state.user.permissions.includes(permission);
    },
    [state.user]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshSession,
    hasRole,
    hasAnyRole,
    hasPermission,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
