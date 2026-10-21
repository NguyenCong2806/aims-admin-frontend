import React from "react";
import { Link, useLocation } from "react-router";

export interface NavTabItem {
  name: string;
  path: string;
  badge?: number | string;
}

interface AimsModuleNavProps {
  moduleName: string;
  moduleIcon?: React.ReactNode;
  tabs?: NavTabItem[];
}

export const AimsModuleNav: React.FC<AimsModuleNavProps> = ({
  moduleName,
  moduleIcon,
  tabs = [],
}) => {
  const location = useLocation();

  if (!tabs.length && !moduleName) return null;

  return (
    <div className="flex items-center justify-between border-b border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xs px-4 sm:px-6 py-2 transition-colors">
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none">
        {/* Module Title & Icon */}
        <div className="flex items-center gap-2.5 shrink-0 pr-3 border-r border-gray-200 dark:border-gray-800">
          {moduleIcon && (
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
              {moduleIcon}
            </div>
          )}
          <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {moduleName}
          </span>
        </div>

        {/* Module Tabs */}
        {tabs.length > 0 && (
          <nav className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/50 font-semibold shadow-2xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <span>{tab.name}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                        isActive
                          ? "bg-brand-600 text-white dark:bg-brand-400 dark:text-gray-900"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-2 left-3 right-3 h-[2px] bg-brand-600 dark:bg-brand-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
};

export default AimsModuleNav;
