import React from "react";
import { Navigate, useLocation, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../models/User/userAccount";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRoles?: (UserRole | string)[];
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  requiredPermission,
}) => {
  const { isAuthenticated, isInitializing, user, hasAnyRole, hasPermission } = useAuth();
  const location = useLocation();

  // 1. Trong lúc ứng dụng đang chạy Silent Refresh (kiểm tra HttpOnly Cookie)
  if (isInitializing) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-[#090d16] text-gray-900 dark:text-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 shadow-xl shadow-brand-500/20 animate-pulse">
            <svg
              className="w-8 h-8 text-white animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-gray-900 dark:text-white">
              AIMS Enterprise
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Đang xác thực bảo mật và khôi phục phiên làm việc...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Chưa xác thực: Chuyển hướng về trang Đăng nhập kèm đường dẫn đích
  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/signin?redirect=${redirectUrl}`} replace />;
  }

  // 3. Kiểm tra phân quyền Vai trò (RBAC)
  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl mb-4">
          ⛔
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Không có quyền truy cập (403 Forbidden)
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
          Tài khoản <span className="font-semibold text-gray-700 dark:text-gray-200">@{user?.username}</span> không có quyền hạn truy cập chức năng này.
          Yêu cầu vai trò: <span className="font-mono text-xs font-semibold text-brand-600">{requiredRoles.join(", ")}</span>.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
        >
          &larr; Quay lại trang trước
        </button>
      </div>
    );
  }

  // 4. Kiểm tra Permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-3xl mb-4">
          🔒
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Hạn chế quyền thao tác
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
          Bạn cần quyền <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{requiredPermission}</code> để sử dụng tính năng này.
        </p>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
