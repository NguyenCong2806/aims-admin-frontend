import React from "react";
import { Outlet, useLocation } from "react-router";
import { SidebarProvider } from "../context/SidebarContext";
import { SearchProvider } from "../context/SearchContext";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";

const LayoutContent: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isHomePage
          ? "bg-gradient-to-br from-[#f3eff8] via-[#e8e4f5] to-[#d8d3ec] dark:from-[#0b0f19] dark:via-[#111827] dark:to-[#0d121f] text-gray-800 dark:text-gray-100"
          : "bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100"
      }`}
    >
      {/* DUY NHẤT 1 HEADER TRÊN TOÀN HỆ THỐNG */}
      <AppHeader />

      {/* NỘI DUNG CHÍNH (OUTLET) */}
      <main className="flex-1 flex flex-col w-full relative">
        <Outlet />
      </main>

      {/* DUY NHẤT 1 FOOTER TRÊN TOÀN HỆ THỐNG */}
      <AppFooter />
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SearchProvider>
      <SidebarProvider>
        <LayoutContent />
      </SidebarProvider>
    </SearchProvider>
  );
};

export default AppLayout;
