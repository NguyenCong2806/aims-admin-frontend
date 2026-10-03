// Định nghĩa kiểu dữ liệu cho hệ thống Authentication & Authorization an toàn
import { UserRole } from "../models/User/userAccount";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  roles: UserRole[] | string[];
  permissions?: string[];
  departmentName?: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string; // ISO 8601 string hoặc Unix timestamp
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;       // Đang thực hiện login/logout
  isInitializing: boolean;  // Đang kiểm tra khôi phục phiên (Silent Refresh) lần đầu tải app
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthResponse | null>;
  hasRole: (role: UserRole | string) => boolean;
  hasAnyRole: (roles: (UserRole | string)[]) => boolean;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
}
