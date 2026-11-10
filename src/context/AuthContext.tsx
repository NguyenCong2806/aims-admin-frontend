/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { toast } from "sonner";
import { APP_MESSAGES } from "../common/AppMessages";
import { extractApiErrorMessage } from "../common/httpErrorHelper";
import { login as apiLogin, logout as apiLogout, refreshSession as apiRefresh, getMyPermissions } from "../api/auth.api";
import { registerAuthCallbacks, setAccessToken } from "../library/axios";
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredPermissions,
  getStoredTokenExpiresAt,
  getStoredUser,
  getTokenExpiresAtIso,
  isTokenValid,
  parseJwtPayload,
  saveAuthSession,
  saveStoredPermissions,
} from "../library/tokenHelper";
import { AuthContextValue, AuthResponse, AuthState, LoginCredentials } from "../types/auth";
import { UserRole } from "../modules/Users/models/userAccount";
import { CurrentPermissions, hasPermission as hasPermissionHelper } from "../modules/Permissions/models/permissionModel";
import { queryClient } from "../library/queryClient";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    currentPermissions: null,
    isAuthenticated: false,
    isLoading: false,
    isInitializing: true, // Đang kiểm tra token khi tải app
    error: null,
  });

  // Guard tránh gọi kép initializeAuth trong React 18+ StrictMode
  const hasInitializedRef = useRef(false);
  const hasHadSessionRef = useRef(false);
  const isLoggingOutRef = useRef(false);

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
              hasHadSessionRef.current = true;
              setState((prev) => ({
                ...prev,
                accessToken: res.accessToken,
                user: res.user || prev.user,
              }));
              scheduleProactiveRefresh(res.accessTokenExpiresAt);
            }
          } catch (err: unknown) {
            console.warn("[Auth Proactive]: Gia hạn chủ động không thành công:", err);
            // Nếu backend trả về 401 (e.g. phiên bị thay thế bởi thiết bị khác hoặc token bị thu hồi)
            if (axios.isAxiosError(err) && err.response?.status === 401) {
              const msg =
                extractApiErrorMessage(err) ||
                APP_MESSAGES.HTTP_STATUS[401];
              handleSessionExpired(msg);
            }
          }
        }, refreshDelayMs);
      }
    } catch (err) {
      console.error("[Auth Proactive Timer Error]:", err);
    }
  }, []);

  /**
   * Xử lý khi phiên làm việc hết hạn hoặc bị hủy (đặc biệt khi session bị thay thế bởi thiết bị khác):
   * - Xóa AccessToken khỏi local storage / state management.
   * - Xóa thông tin user trong state.
   * - Dừng retry tự động.
   * - Hiển thị toast thông báo lỗi rõ ràng.
   * - Chuyển về trang login.
   */
  const handleSessionExpired = useCallback((customMessage?: string) => {
    // Nếu người dùng đang chủ động bấm Đăng xuất, tuyệt đối không báo lỗi phiên hết hạn
    if (isLoggingOutRef.current) {
      return;
    }

    clearProactiveTimer();
    setAccessToken(null);
    clearAuthSession();
    queryClient.clear();

    const messageToShow = customMessage || APP_MESSAGES.HTTP_STATUS[401];

    setState((prev) => {
      if (prev.isAuthenticated || hasHadSessionRef.current) {
        hasHadSessionRef.current = false;
        toast.error(messageToShow, { id: "auth-session-expired" });
      }
      return {
        user: null,
        accessToken: null,
        currentPermissions: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
        error: messageToShow,
      };
    });
  }, [clearProactiveTimer]);

  // Đăng ký callbacks với Axios Interceptor & sự kiện hệ thống
  useEffect(() => {
    registerAuthCallbacks({
      onSessionExpired: handleSessionExpired,
      onTokenRefreshed: (newToken) => {
        setState((prev) => ({ ...prev, accessToken: newToken }));
      },
    });

    const handleAuthExpiredEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ message?: string }>;
      const msg = customEvent.detail?.message;
      handleSessionExpired(msg);
    };
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
              currentPermissions: null,
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
      const storedPermissions = getStoredPermissions();

      // Trường hợp: Không có AccessToken -> hiển thị login
      if (!storedToken) {
        clearAuthSession();
        setState((prev) => ({
          ...prev,
          isInitializing: false,
          isAuthenticated: false,
          user: null,
          accessToken: null,
          currentPermissions: null,
        }));
        return;
      }

      // Trường hợp: Có AccessToken -> Kiểm tra hạn sử dụng
      if (isTokenValid(storedToken, storedExp)) {
        // • CÒN HẠN: Dùng tiếp AccessToken hiện tại, KHÔNG gọi /auth/refresh bắt buộc
        setAccessToken(storedToken, storedExp);
        hasHadSessionRef.current = true;

        let effectivePermissions = storedPermissions;
        if (!effectivePermissions && storedToken) {
          const jwtPayload = parseJwtPayload<Record<string, unknown>>(storedToken);
          if (jwtPayload) {
            const jwtPerms =
              (jwtPayload.permission as string[] | string) ||
              (jwtPayload.permissions as string[] | string);
            if (jwtPerms) {
              const rawRoles = storedUser?.roles || [];
              effectivePermissions = {
                roles: Array.isArray(rawRoles) ? (rawRoles as string[]) : [String(rawRoles)],
                permissionCodes: Array.isArray(jwtPerms) ? jwtPerms : [jwtPerms],
                modules: [],
              };
            }
          }
        }

        setState({
          user: storedUser,
          accessToken: storedToken,
          currentPermissions: effectivePermissions,
          isAuthenticated: true,
          isLoading: false,
          isInitializing: false,
          error: null,
        });

        // Đồng bộ quyền mới nhất từ máy chủ (GET /api/v1/permissions/me)
        getMyPermissions()
          .then((fresh) => {
            if (fresh) {
              saveStoredPermissions(fresh);
              setState((prev) => ({ ...prev, currentPermissions: fresh }));
            }
          })
          .catch((err) => {
            console.warn("[Auth]: Không thể nạp quyền từ /permissions/me khi khởi động:", err);
          });

        // Lên lịch gia hạn chủ động trước khi token hết hạn
        scheduleProactiveRefresh(storedExp || getTokenExpiresAtIso(storedToken) || undefined);
      } else {
        // • HẾT HẠN: Gửi Access Token hiện tại lên /auth/refresh để làm mới phiên nếu cookie còn hiệu lực
        (async () => {
          try {
            console.log("[Auth]: AccessToken đã hết hạn khi mở app. Đang gửi AccessToken hiện tại để làm mới phiên...");
            setAccessToken(storedToken, storedExp);
            const res = await apiRefresh();
            if (res?.accessToken) {
              hasHadSessionRef.current = true;
              let refreshedPerms: CurrentPermissions | null = storedPermissions;
              try {
                refreshedPerms = await getMyPermissions();
                if (refreshedPerms) {
                  saveStoredPermissions(refreshedPerms);
                }
              } catch {
                // Ignore
              }

              setState({
                user: res.user || storedUser,
                accessToken: res.accessToken,
                currentPermissions: refreshedPerms,
                isAuthenticated: true,
                isLoading: false,
                isInitializing: false,
                error: null,
              });
              scheduleProactiveRefresh(res.accessTokenExpiresAt);
              return;
            }
          } catch (err: unknown) {
            console.warn("[Auth]: Không thể làm mới phiên từ backend:", err);
            if (axios.isAxiosError(err) && err.response?.status === 401) {
              const msg =
                extractApiErrorMessage(err) ||
                APP_MESSAGES.HTTP_STATUS[401];
              toast.error(msg);
            }
          }
          clearAuthSession();
          setAccessToken(null);
          setState((prev) => ({
            ...prev,
            isInitializing: false,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            currentPermissions: null,
          }));
        })();
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

        // 1.5. Trích xuất thông tin roles & permissions từ JWT payload làm fallback tức thì
        const jwtPayload = parseJwtPayload<Record<string, unknown>>(res.accessToken);
        if (jwtPayload) {
          const jwtRoles =
            (jwtPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string[] | string) ||
            (jwtPayload.role as string[] | string) ||
            (jwtPayload.roles as string[] | string);
          if (jwtRoles && (!res.user.roles || res.user.roles.length === 0)) {
            res.user.roles = Array.isArray(jwtRoles) ? jwtRoles : [jwtRoles];
          }

          const jwtPerms =
            (jwtPayload.permission as string[] | string) ||
            (jwtPayload.permissions as string[] | string);
          if (jwtPerms) {
            res.user.permissions = Array.isArray(jwtPerms) ? jwtPerms : [jwtPerms];
          }
        }

        // 2. Tự động lấy danh sách quyền hạn hiện tại (GET /api/v1/permissions/me)
        let currentPermissions: CurrentPermissions | null = null;
        try {
          currentPermissions = await getMyPermissions();
          if (currentPermissions) {
            saveStoredPermissions(currentPermissions);
          }
        } catch (permErr) {
          console.warn("[Auth]: Không thể nạp quyền từ /permissions/me sau khi đăng nhập:", permErr);
        }

        // Nếu /permissions/me chưa nạp được, sử dụng permissions và roles từ JWT token
        if (!currentPermissions && jwtPayload) {
          const jwtPerms =
            (jwtPayload.permission as string[] | string) ||
            (jwtPayload.permissions as string[] | string);
          if (jwtPerms) {
            const rawRoles = res.user.roles || [];
            currentPermissions = {
              roles: Array.isArray(rawRoles) ? (rawRoles as string[]) : [String(rawRoles)],
              permissionCodes: Array.isArray(jwtPerms) ? jwtPerms : [jwtPerms],
              modules: [],
            };
            saveStoredPermissions(currentPermissions);
          }
        }

        saveAuthSession(res.accessToken, res.accessTokenExpiresAt, res.user, currentPermissions);
        setAccessToken(res.accessToken, res.accessTokenExpiresAt);
        hasHadSessionRef.current = true;

        setState({
          user: res.user,
          accessToken: res.accessToken,
          currentPermissions,
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
          currentPermissions: null,
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
    isLoggingOutRef.current = true;
    setState((prev) => ({ ...prev, isLoading: true }));
    clearProactiveTimer();
    hasHadSessionRef.current = false;

    try {
      await apiLogout();
    } catch (err) {
      console.warn("[Auth]: Backend logout error (safely ignored):", err);
    } finally {
      clearAuthSession();
      setAccessToken(null);
      queryClient.clear();
      setState({
        user: null,
        accessToken: null,
        currentPermissions: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
        error: null,
      });

      // Tắt triệt để toast cảnh báo phiên và hiển thị toast đăng xuất thành công
      toast.dismiss("auth-session-expired");
      toast.success("Đã đăng xuất an toàn khỏi hệ thống.");

      setTimeout(() => {
        isLoggingOutRef.current = false;
      }, 500);
    }
  }, [clearProactiveTimer]);

  // Hàm làm mới phiên thủ công (chỉ hoạt động khi AccessToken còn hạn)
  const refreshSession = useCallback(async (): Promise<AuthResponse | null> => {
    try {
      const res = await apiRefresh();
      if (res?.accessToken) {
        saveAuthSession(res.accessToken, res.accessTokenExpiresAt, res.user);
        setAccessToken(res.accessToken, res.accessTokenExpiresAt);

        // Đồng bộ quyền mới nhất sau khi làm mới token
        getMyPermissions()
          .then((fresh) => {
            if (fresh) {
              saveStoredPermissions(fresh);
              setState((prev) => ({ ...prev, currentPermissions: fresh }));
            }
          })
          .catch((e) => console.warn("[Auth]: Không thể cập nhật quyền khi refresh:", e));

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
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.status === 401
          ? extractApiErrorMessage(err) || APP_MESSAGES.HTTP_STATUS[401]
          : undefined;
      handleSessionExpired(msg);
      return null;
    }
  }, [scheduleProactiveRefresh, handleSessionExpired]);

  // Helper kiểm tra quyền vai trò
  const hasRole = useCallback(
    (role: UserRole | string): boolean => {
      if (!state.user?.roles) return false;
      const roles = state.user.roles as (UserRole | string)[];
      if (roles.includes("SuperAdmin") || roles.includes("SUPER_ADMIN")) return true;
      return roles.includes(role);
    },
    [state.user]
  );

  const hasAnyRole = useCallback(
    (targetRoles: (UserRole | string)[]): boolean => {
      if (!state.user?.roles) return false;
      const roles = state.user.roles as (UserRole | string)[];
      if (roles.includes("SuperAdmin") || roles.includes("SUPER_ADMIN")) return true;
      return targetRoles.some((r) => roles.includes(r));
    },
    [state.user]
  );

  /**
   * Kiểm tra quyền theo chuẩn định dạng {module_key}.{action}
   * Ví dụ: hasPermission("units.view"), hasPermission("units.create")
   * SUPER_ADMIN luôn được toàn quyền.
   */
  const hasPermission = useCallback(
    (code: string): boolean => {
      // 1. Kiểm tra qua CurrentPermissions từ /permissions/me
      if (hasPermissionHelper(state.currentPermissions, code)) {
        return true;
      }
      // 2. Fallback kiểm tra qua user.permissions nếu có
      if (state.user?.permissions) {
        if (state.user.permissions.includes("*")) return true;
        if (state.user.permissions.includes(code)) return true;
      }
      // 3. Fallback cho vai trò SuperAdmin
      if (state.user?.roles?.some((r) => String(r).toUpperCase().includes("ADMIN"))) {
        return true;
      }
      return false;
    },
    [state.currentPermissions, state.user]
  );

  /**
   * Gọi lại GET /api/v1/permissions/me để cập nhật trạng thái hiển thị frontend
   */
  const fetchCurrentPermissions = useCallback(async (): Promise<CurrentPermissions | null> => {
    try {
      const perms = await getMyPermissions();
      if (perms) {
        saveStoredPermissions(perms);
        setState((prev) => ({ ...prev, currentPermissions: perms }));
        return perms;
      }
      return null;
    } catch (err) {
      console.warn("[Auth]: fetchCurrentPermissions failed:", err);
      return null;
    }
  }, []);

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
    fetchCurrentPermissions,
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
