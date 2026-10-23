import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";

interface SearchableItem {
  name: string;
  path: string;
  category: string;
  keywords?: string;
  badge?: string;
}

const SEARCHABLE_MODULES: SearchableItem[] = [
  // Tài sản IT
  { name: "Thiết bị phần cứng", path: "/thiet-bi-phan-cung", category: "Tài sản IT", keywords: "hardware laptop pc server may tinh phan cung", badge: "Chính" },
  { name: "Thêm mới thiết bị phần cứng", path: "/thiet-bi-phan-cung/tao-moi", category: "Tài sản IT", keywords: "tao moi hardware create device" },
  { name: "Tài nguyên số & Cloud", path: "/tai-nguyen-so", category: "Tài sản IT", keywords: "digital asset cloud domain ssl license ip", badge: "Cloud" },
  { name: "Thêm tài nguyên số mới", path: "/tai-nguyen-so/tao-moi", category: "Tài sản IT", keywords: "tao moi digital asset cloud" },
  { name: "Giám sát máy trạm", path: "/giam-sat-may-tram", category: "Giám sát IT", keywords: "workstation agent ram cpu disk online offline", badge: "Live" },
  { name: "Phần mềm cài đặt máy trạm", path: "/giam-sat-may-tram/phan-mem", category: "Giám sát IT", keywords: "installed software audit agent app" },
  
  // Vận hành & Bảo trì
  { name: "Hợp đồng & Bảo hành", path: "/hop-dong-bao-hanh", category: "Vận hành", keywords: "contracts warranty bao hanh hop dong ncc", badge: "Hợp đồng" },
  { name: "Lịch bảo trì & Kiểm định", path: "/lich-bao-tri", category: "Vận hành", keywords: "maintenance schedule lich bao tri ke hoach", badge: "Lịch" },
  { name: "Báo cáo & Thống kê", path: "/line-chart", category: "Báo cáo", keywords: "analytics reports dashboard chart thong ke", badge: "BI" },

  // Danh mục tham chiếu
  { name: "Phòng ban", path: "/phong-ban", category: "Tổ chức", keywords: "department phong ban don vi" },
  { name: "Chức vụ", path: "/chuc-vu", category: "Tổ chức", keywords: "position chuc vu vai tro" },
  { name: "Địa điểm & Tòa nhà", path: "/dia-diem", category: "Tổ chức", keywords: "location dia diem chi nhanh kho tang" },
  { name: "Trung tâm chi phí", path: "/trung-tam-chi-phi", category: "Tổ chức", keywords: "cost center trung tam chi phi ngan sach" },
  { name: "Hãng sản xuất", path: "/hang-san-xuat", category: "Danh mục", keywords: "brand hang san xuat dell apple lenovo hp" },
  { name: "Danh mục sản phẩm", path: "/danh-muc-san-pham", category: "Danh mục", keywords: "category danh muc loai" },
  { name: "Loại tài sản", path: "/loai-tai-san", category: "Danh mục", keywords: "asset type loai tai san" },
  { name: "Trạng thái tài sản", path: "/trang-thai-tai-san", category: "Danh mục", keywords: "asset status trang thai su dung hong thanh ly" },
  { name: "Loại giấy phép", path: "/loai-giay-phep", category: "Danh mục", keywords: "license type loai giay phep ban quyen" },
  { name: "Loại bảo trì", path: "/loai-bao-tri", category: "Danh mục", keywords: "maintenance type loai bao tri dinh ky sua chua" },
  { name: "Đơn vị tính", path: "/don-vi", category: "Danh mục", keywords: "unit don vi tinh cai bo may" },
  { name: "Nhà cung cấp", path: "/nha-cung-cap", category: "Đối tác", keywords: "supplier nha cung cap phong vu fpt cmc" },

  // Hệ thống & Quản trị
  { name: "Tài khoản người dùng", path: "/tai-khoan", category: "Hệ thống", keywords: "users account nguoi dung nhan vien" },
  { name: "Phân quyền & Vai trò", path: "/phan-quyen", category: "Hệ thống", keywords: "permissions roles ma tran phan quyen rbac" },
  { name: "Nhật ký hệ thống (Audit Trail)", path: "/nhat-ky-he-thong", category: "Hệ thống", keywords: "system logs audit trail nhat ky hoat dong" },
  { name: "Cấu hình hệ thống", path: "/cau-hinh-he-thong", category: "Hệ thống", keywords: "system settings cau hinh backup security" },
];

const AppHeader: React.FC = () => {
  const navigate = useNavigate();

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Widget popups
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);

  // Multi-tenant Company state
  const [companyName, setCompanyName] = useState<string>(() => {
    return localStorage.getItem("aims_current_company") || "AIMS Enterprise (Hà Nội)";
  });
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  const supportRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);

  // Filter search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return SEARCHABLE_MODULES.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.keywords && m.keywords.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [searchTerm]);

  // Global Keyboard Shortcuts (Ctrl+K or / to focus search, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsSupportOpen(false);
        setIsChatOpen(false);
        setIsActivitiesOpen(false);
        setIsCompanyDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      if (supportRef.current && !supportRef.current.contains(target)) {
        setIsSupportOpen(false);
      }
      if (chatRef.current && !chatRef.current.contains(target)) {
        setIsChatOpen(false);
      }
      if (activitiesRef.current && !activitiesRef.current.contains(target)) {
        setIsActivitiesOpen(false);
      }
      if (companyRef.current && !companyRef.current.contains(target)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectModule = (path: string) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchResults.length > 0) {
        handleSelectModule(searchResults[0].path);
      } else if (searchTerm.trim()) {
        navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
        setIsSearchOpen(false);
      }
    }
  };

  const handleSelectCompany = (comp: string) => {
    setCompanyName(comp);
    localStorage.setItem("aims_current_company", comp);
    setIsCompanyDropdownOpen(false);
    toast.success(`Đã chuyển sang chi nhánh: ${comp}`);
  };

  return (
    <header className="sticky top-0 z-40 flex w-full border-b border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md bg-white/80 dark:bg-gray-900/80 transition-colors shadow-2xs">
      <div className="flex items-center justify-between w-full px-4 py-2.5 sm:px-6 md:px-8 gap-4">
        
        {/* Left: Brand Logo & Global Live Search */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
          
          {/* System Logo / App Launcher Button */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 group"
            title="Trang chủ AIMS ERP (App Launcher)"
            aria-label="AIMS ERP Home"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold tracking-tight text-gray-900 dark:text-white leading-none">
                AIMS ERP
              </h1>
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mt-0.5">
                Asset Management
              </span>
            </div>
          </Link>

          {/* Live Search Input Bar */}
          <div className="relative flex-1" ref={searchContainerRef}>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Tìm kiếm ứng dụng, chức năng... (phím / hoặc Ctrl+K)"
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white/70 dark:bg-gray-800/70 border border-gray-200/80 dark:border-gray-700/80 rounded-xl shadow-xs backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:bg-white dark:focus:bg-gray-800 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setIsSearchOpen(false);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                aria-label="Xóa tìm kiếm"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}

            {/* Quick Search Dropdown Results */}
            {isSearchOpen && searchTerm.trim() && (
              <div className="absolute left-0 mt-2 w-full min-w-[280px] sm:min-w-[360px] max-h-[70vh] overflow-y-auto p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Kết quả tìm kiếm ({searchResults.length})</span>
                  <span className="text-[10px] lowercase font-normal">Nhấn Enter để mở</span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleSelectModule(item.path)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors hover:bg-brand-50 dark:hover:bg-brand-950/40 text-gray-800 dark:text-gray-200 hover:text-brand-700 dark:hover:text-brand-300 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 opacity-60 group-hover:opacity-100" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                              {item.badge}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {item.category}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
                    Không tìm thấy ứng dụng phù hợp với &ldquo;{searchTerm}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Status, Quick Tools, Multi-Tenant, Notifications & User */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          
          {/* Live System Status Dot */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-medium cursor-default shadow-2xs"
            title="Hệ thống trực tuyến ổn định • Server DC Hà Nội"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden xl:inline">Sẵn sàng</span>
          </div>

          {/* Support Hotline / Phone Icon */}
          <div className="relative" ref={supportRef}>
            <button
              onClick={() => setIsSupportOpen(!isSupportOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Trung tâm hỗ trợ kỹ thuật AIMS"
              aria-label="Support Hotline"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>

            {isSupportOpen && (
              <div className="absolute right-0 mt-2 w-72 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">Trung tâm hỗ trợ kỹ thuật</span>
                  <button onClick={() => setIsSupportOpen(false)} className="text-xs text-brand-600 hover:underline cursor-pointer">
                    Đóng
                  </button>
                </div>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <span className="font-semibold">📞 Hotline:</span>
                    <span className="font-mono font-bold text-brand-600 dark:text-brand-400">1900-8888</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <span className="font-semibold">✉️ Email:</span>
                    <span>support@aims.vn</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <span className="font-semibold">⏰ Làm việc:</span>
                    <span>8:00 - 18:00 (Thứ 2 - Thứ 6)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat / Messages with unread badge 7 */}
          <div className="relative" ref={chatRef}>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Tin nhắn & Trao đổi nội bộ"
              aria-label="Messages"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-xs ring-2 ring-white dark:ring-gray-900">
                7
              </span>
            </button>

            {isChatOpen && (
              <div className="absolute right-0 mt-2 w-80 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">Tin nhắn nội bộ (7)</span>
                  <button onClick={() => setIsChatOpen(false)} className="text-xs text-brand-600 hover:underline cursor-pointer">
                    Đóng
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Kế toán IT: Bàn giao máy chủ mới</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">Vừa nhận được 5 biên bản từ phòng Kho...</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <p className="font-medium text-gray-800 dark:text-gray-200">Phòng Hành chính: Yêu cầu License</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">Cần cấp thêm 10 key Adobe Photoshop...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activities / Schedule clock with badge 32 */}
          <div className="relative" ref={activitiesRef}>
            <button
              onClick={() => setIsActivitiesOpen(!isActivitiesOpen)}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Hoạt động & Công việc cần xử lý"
              aria-label="Activities"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-xs ring-2 ring-white dark:ring-gray-900">
                32
              </span>
            </button>

            {isActivitiesOpen && (
              <div className="absolute right-0 mt-2 w-80 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">Công việc cần xử lý (32)</span>
                  <button onClick={() => setIsActivitiesOpen(false)} className="text-xs text-brand-600 hover:underline cursor-pointer">
                    Đóng
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
                    <span>12 Tài sản đến hạn bảo trì định kỳ</span>
                    <span className="font-bold">Hôm nay</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                    <span>8 Giấy phép sắp hết hạn (30 ngày)</span>
                    <span className="font-bold">Gấp</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                    <span>12 Yêu cầu cấp phát máy trạm</span>
                    <span className="font-bold">Đang chờ</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Branch Quick Switch / Sync Icon */}
          <button
            onClick={() => toast.success("Đang kết nối: Production Server (DC Hà Nội)\nTrạng thái: Đồng bộ dữ liệu thời gian thực")}
            className="hidden sm:flex p-2 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Nhánh dữ liệu & Đồng bộ thời gian thực"
            aria-label="Branch"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>

          {/* Company / Multi-Tenant Selector Dropdown */}
          <div className="relative hidden md:block" ref={companyRef}>
            <button
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{companyName}</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isCompanyDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 py-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Chọn chi nhánh / Đơn vị
                </div>
                {[
                  "AIMS Enterprise (Hà Nội)",
                  "AIMS Chi nhánh TP. Hồ Chí Minh",
                  "AIMS Chi nhánh Đà Nẵng",
                  "Trung tâm Dữ liệu & Nghiên cứu AI",
                ].map((comp) => (
                  <button
                    key={comp}
                    onClick={() => handleSelectCompany(comp)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      companyName === comp
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <span>{comp}</span>
                    {companyName === comp && (
                      <svg className="w-4 h-4 text-brand-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell Dropdown */}
          <NotificationDropdown />

          {/* User Profile Avatar & Menu */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
