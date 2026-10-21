import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";

interface ModuleQuickLink {
  name: string;
  path: string;
  category: string;
}

const quickModules: ModuleQuickLink[] = [
  { name: "Tài nguyên số", path: "/tai-nguyen-so", category: "Tài sản IT" },
  { name: "Thiết bị phần cứng", path: "/thiet-bi-phan-cung", category: "Tài sản IT" },
  { name: "Giám sát máy trạm", path: "/giam-sat-may-tram", category: "Tài sản IT" },
  { name: "Phòng ban", path: "/phong-ban", category: "Tổ chức" },
  { name: "Chức vụ", path: "/chuc-vu", category: "Tổ chức" },
  { name: "Địa điểm", path: "/dia-diem", category: "Tổ chức" },
  { name: "Trung tâm chi phí", path: "/trung-tam-chi-phi", category: "Tổ chức" },
  { name: "Danh mục sản phẩm", path: "/danh-muc-san-pham", category: "Danh mục" },
  { name: "Hãng sản xuất", path: "/hang-san-xuat", category: "Danh mục" },
  { name: "Loại tài sản", path: "/loai-tai-san", category: "Danh mục" },
  { name: "Trạng thái tài sản", path: "/trang-thai-tai-san", category: "Danh mục" },
  { name: "Loại giấy phép", path: "/loai-giay-phep", category: "Phần mềm" },
  { name: "Loại bảo trì", path: "/loai-bao-tri", category: "Vận hành" },
  { name: "Đơn vị tính", path: "/don-vi", category: "Vận hành" },
  { name: "Nhà cung cấp", path: "/nha-cung-cap", category: "Đối tác" },
  { name: "Báo cáo & Thống kê", path: "/line-chart", category: "Báo cáo" },
];

const AppHeader: React.FC = () => {
  const [isModuleDropdownOpen, setIsModuleDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Identify current module name based on current path
  const currentModule = quickModules.find((m) => m.path === location.pathname) || {
    name: "Phân hệ quản trị",
    category: "AIMS",
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModuleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-40 transition-colors">
      <div className="flex items-center justify-between w-full px-4 py-2.5 sm:px-6">
        
        {/* Left Section: AIMS App Launcher Icon + Brand + Quick Module Switcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* 9-dot App Launcher Button */}
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 dark:text-gray-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 dark:hover:text-brand-400 border border-gray-200/80 dark:border-gray-700/80 transition-all shadow-2xs hover:shadow-xs group"
            title="Trang chủ ứng dụng (App Launcher)"
            aria-label="App Launcher"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="transition-transform group-hover:scale-110"
            >
              <rect x="2" y="2" width="4.2" height="4.2" rx="1.2" />
              <rect x="7.9" y="2" width="4.2" height="4.2" rx="1.2" />
              <rect x="13.8" y="2" width="4.2" height="4.2" rx="1.2" />
              <rect x="2" y="7.9" width="4.2" height="4.2" rx="1.2" />
              <rect x="7.9" y="7.9" width="4.2" height="4.2" rx="1.2" />
              <rect x="13.8" y="7.9" width="4.2" height="4.2" rx="1.2" />
              <rect x="2" y="13.8" width="4.2" height="4.2" rx="1.2" />
              <rect x="7.9" y="13.8" width="4.2" height="4.2" rx="1.2" />
              <rect x="13.8" y="13.8" width="4.2" height="4.2" rx="1.2" />
            </svg>
          </Link>

          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-xs">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <span className="hidden sm:inline font-bold text-gray-900 dark:text-white tracking-tight">
              AIMS
            </span>
          </Link>

          <span className="hidden sm:inline text-gray-300 dark:text-gray-700">/</span>

          {/* Quick Module Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsModuleDropdownOpen(!isModuleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 rounded-xl transition-all border border-gray-200/60 dark:border-gray-700/60"
            >
              <span>{currentModule.name}</span>
              <svg
                className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                  isModuleDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isModuleDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 max-h-[70vh] overflow-y-auto p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Chuyển nhanh phân hệ
                </div>
                <div className="space-y-1">
                  {quickModules.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsModuleDropdownOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${
                        location.pathname === item.path
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{item.category}</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <Link
                    to="/"
                    onClick={() => setIsModuleDropdownOpen(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-xl transition-colors"
                  >
                    <span>Xem tất cả ứng dụng trên Trang chủ</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Theme Toggle, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggleButton />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
