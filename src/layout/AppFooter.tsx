import React from "react";
import { useLocation } from "react-router";

export interface AppFooterProps {
  className?: string;
}

const AppFooter: React.FC<AppFooterProps> = ({ className = "" }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const containerBg = isHomePage
    ? "backdrop-blur-md bg-white/40 dark:bg-gray-900/40 border-t border-black/[0.04] dark:border-white/[0.06]"
    : "backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-t border-black/[0.06] dark:border-white/[0.08]";

  return (
    <footer className={`w-full transition-colors ${containerBg} ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8 text-xs text-gray-500 dark:text-gray-400">
        
        {/* Left: System Status & Version */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            AIMS Enterprise ERP
          </span>
          <span className="hidden sm:inline text-gray-400 dark:text-gray-600">•</span>
          <span className="hidden sm:inline">
            Hệ thống Quản lý Tài sản Doanh nghiệp (v2.3.0)
          </span>
        </div>

        {/* Right: Copyright */}
        <div className="text-[11px] text-gray-400 dark:text-gray-500 text-center sm:text-right">
          © 2026 AIMS Enterprise. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
