import { useState } from "react";
import { useNavigate } from "react-router";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuth } from "../../context/AuthContext";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = async () => {
    closeDropdown();
    await logout();
    navigate("/signin", { replace: true });
  };

  const displayName = user?.fullName || user?.username || "Vũ Hoàng Long";
  const displayEmail = user?.email || "admin@aims.vn";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400 cursor-pointer"
      >
        <span className="mr-3 overflow-hidden rounded-full h-10 w-10 bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Fallback nếu ảnh không tải được
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <span>{userInitial}</span>
          )}
        </span>

        <div className="text-left hidden sm:block mr-2">
          <span className="block font-semibold text-xs text-gray-800 dark:text-gray-200 leading-tight">
            {displayName}
          </span>
          <span className="block text-[10px] text-gray-400 font-mono">
            {user?.roles?.[0] || "Quản trị viên"}
          </span>
        </div>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="16"
          height="16"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3.5 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="block font-bold text-gray-900 text-theme-sm dark:text-white truncate">
              {displayName}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300">
              {user?.roles?.[0] || "User"}
            </span>
          </div>
          <span className="block text-theme-xs text-gray-500 dark:text-gray-400 truncate">
            {displayEmail}
          </span>
          {user?.departmentName && (
            <span className="block text-[11px] text-gray-400 mt-0.5">
              🏢 {user.departmentName}
            </span>
          )}
        </div>

        <ul className="flex flex-col gap-1 pt-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/tai-khoan"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5Z"
                  fill="currentColor"
                />
              </svg>
              Tài khoản & Phân quyền
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/cau-hinh-he-thong"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 8a4 4 0 100 8 4 4 0 000-8zm-2 4a2 2 0 114 0 2 2 0 01-4 0z"
                  fill="currentColor"
                />
              </svg>
              Cấu hình hệ thống
            </DropdownItem>
          </li>
        </ul>

        {/* Nút Đăng xuất an toàn qua HttpOnly Cookie & In-Memory Purge */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 mt-2 font-semibold text-rose-600 dark:text-rose-400 rounded-lg group text-theme-sm hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors w-full cursor-pointer text-left"
        >
          <svg
            className="fill-rose-500 group-hover:fill-rose-700 dark:group-hover:fill-rose-300"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
              fill="currentColor"
            />
          </svg>
          Đăng xuất an toàn
        </button>
      </Dropdown>
    </div>
  );
}
