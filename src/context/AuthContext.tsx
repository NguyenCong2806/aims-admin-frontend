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
import { AuthContextValue, AuthResponse, AuthState, LoginCredentials } from "../types/auth";
import { UserRole } from "../models/User/userAccount";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    isInitializing: true, // Đang chạy Silent Refresh khi tải app
    error: null,
  });

  // Timer tự động gia hạn token trước khi hết hạn (Proactive Refresh)
  const proactiveRefreshTimerRef = useRef<number | null>(null);

  const clearProactiveTimer = () => {
    if (proactiveRefreshTimerRef.current) {
      window.clearTimeout(proactiveRefreshTimerRef.current);
      proactiveRefreshTimerRef.current = null;
    }
  };

  // Lên lịch tự động làm mới token trước khi hết hạn 1 phút (hoặc sau 80% thời gian sống)
  const scheduleProactiveRefresh = useCallback((expiresAtIso?: string) => {
    clearProactiveTimer();

    if (!expiresAtIso) return;

    try {
      const expiresTime = new Date(expiresAtIso).getTime();
      const now = Date.now();
      const timeRemainingMs = expiresTime - now;

      // Gia hạn trước 60 giây (hoặc tối thiểu sau 5 giây nếu thời gian ngắn)
      const refreshDelayMs = Math.max(timeRemainingMs - 60 * 1000, 5000);

      if (timeRemainingMs > 10000) {
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
            console.warn("[Auth Proactive]: Gia hạn chủ động không thành công, sẽ chờ interceptor.", err);
          }
        }, refreshDelayMs);
      }
    } catch (err) {
      console.error("[Auth Proactive Timer Error]:", err);
    }
  }, []);

  // Xử lý khi phiên làm việc hết hạn từ Axios Interceptor (401 không thể refresh)
  const handleSessionExpired = useCallback(() => {
    clearProactiveTimer();
    setAccessToken(null);
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

  // Đăng ký callbacks với Axios Interceptor
  useEffect(() => {
    registerAuthCallbacks({
      onSessionExpired: handleSessionExpired,
      onTokenRefreshed: (_newToken) => {
        setState((prev) => ({ ...prev, accessToken: _newToken }));
      },
    });

    const handleAuthExpiredEvent = () => handleSessionExpired();
    window.addEventListener("aims:auth-expired", handleAuthExpiredEvent);

    return () => {
      clearProactiveTimer();
      window.removeEventListener("aims:auth-expired", handleAuthExpiredEvent);
    };
  }, [handleSessionExpired]);

  // Khởi tạo: Silent Refresh khi người dùng mở trang hoặc F5
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Gọi /auth/refresh với withCredentials = true để kiểm tra HttpOnly Cookie
        const res = await apiRefresh();
        if (isMounted && res?.accessToken) {
          setState({
            user: res.user,
            accessToken: res.accessToken,
            isAuthenticated: true,
            isLoading: false,
            isInitializing: false,
            error: null,
          });
          scheduleProactiveRefresh(res.accessTokenExpiresAt);
        }
      } catch {
        // Không có cookie hoặc cookie hết hạn: ở trạng thái unauthenticated bình thường
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isInitializing: false,
            isAuthenticated: false,
            user: null,
            accessToken: null,
          }));
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [scheduleProactiveRefresh]);

  // Hàm Đăng nhập
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResponse> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const res = await apiLogin(credentials);

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
        setState((prev) => ({
          ...prev,
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

  // Hàm làm mới phiên thủ công
  const refreshSession = useCallback(async (): Promise<AuthResponse | null> => {
    try {
      const res = await apiRefresh();
      if (res?.accessToken) {
        setState((prev) => ({
          ...prev,
          user: res.user,
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
      if (state.user.roles.includes("SuperAdmin")) return true; // SuperAdmin có mọi quyền
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
