import React from "react";
import { Navigate, useSearchParams, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface PublicOnlyRouteProps {
  children?: React.ReactNode;
}

export const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuth();
  const [searchParams] = useSearchParams();

  // Đang kiểm tra cookie khôi phục phiên (Silent Refresh)
  if (isInitializing) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-[#090d16]">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Nếu người dùng đã đăng nhập -> Chuyển hướng vào trang nội bộ
  if (isAuthenticated) {
    const rawRedirect = searchParams.get("redirect");
    const targetUrl = rawRedirect ? decodeURIComponent(rawRedirect) : "/";
    return <Navigate to={targetUrl} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PublicOnlyRoute;
