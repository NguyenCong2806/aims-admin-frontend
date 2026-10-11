import React, { useState } from "react";
import { toast } from "sonner";
import { UserAccount } from "../../../models/User/userAccount";
import { USER_ROLE_META, USER_STATUS_META, getInitials, getAvatarColor } from "../userHelper";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onEdit: (user: UserAccount) => void;
  onToggleLock: (id: number) => void;
  onResetPassword: (id: number) => void;
  onDelete: (id: number) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  onEdit,
  onToggleLock,
  onResetPassword,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "assets" | "security">("profile");

  if (!isOpen || !user) return null;

  const statusMeta = USER_STATUS_META[user.status] || USER_STATUS_META.ACTIVE;
  const assignedAssets = user.assignedAssets || [];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER HERO */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${getAvatarColor(
                user.fullName
              )} text-white flex items-center justify-center text-xl font-bold shadow-lg ring-4 ring-white/10 flex-shrink-0`}
            >
              {getInitials(user.fullName)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold truncate">{user.fullName}</h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`}></span>
                  {statusMeta.label}
                </span>
                {user.mfaEnabled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🔒 2FA Bật
                  </span>
                )}
              </div>

              <p className="text-sm text-indigo-200 mt-1 flex items-center gap-2 flex-wrap">
                <span>@{user.username}</span>
                <span>•</span>
                <span>{user.positionName || "Chưa có chức vụ"}</span>
                <span>•</span>
                <span>{user.departmentName || "Chưa phân bổ"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="px-6 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-850 flex items-center gap-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "profile"
                ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-gray-700"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            👤 Thông tin Hồ sơ
          </button>
          <button
            onClick={() => setActiveTab("assets")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === "assets"
                ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-gray-700"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            💻 Tài sản đang bàn giao
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
              {assignedAssets.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "security"
                ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-200 dark:border-gray-700"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            🛡️ Bảo mật & Phân quyền
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin liên hệ</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-gray-800">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{user.email}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-gray-800">
                      <span className="text-gray-500">Số điện thoại:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{user.phone || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Mã User ID:</span>
                      <span className="font-mono text-xs text-indigo-600 font-bold">#{user.id}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tổ chức & Vị trí</h4>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-gray-800">
                      <span className="text-gray-500">Phòng ban:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{user.departmentName || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200/60 dark:border-gray-800">
                      <span className="text-gray-500">Chức vụ:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{user.positionName || "-"}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Ngày tạo tài khoản:</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROLES BADGES */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                  Các vai trò đã được cấp quyền (Roles)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => {
                    const roleMeta = USER_ROLE_META[role] || USER_ROLE_META.Staff;
                    return (
                      <div
                        key={role}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${roleMeta.badgeClass}`}
                      >
                        <span>{roleMeta.icon}</span>
                        <div>
                          <p className="font-bold">{roleMeta.label}</p>
                          <p className="text-[10px] opacity-75">{roleMeta.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNED ASSETS */}
          {activeTab === "assets" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Danh mục tài sản CNTT đang cấp phát cho nhân viên
                </h4>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  Tổng số: {assignedAssets.length} thiết bị
                </span>
              </div>

              {assignedAssets.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-400">
                  <p className="text-sm">Nhân viên này hiện chưa được bàn giao thiết bị nào.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {assignedAssets.map((asset) => (
                    <div
                      key={asset.assetId}
                      className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 hover:border-indigo-400 dark:hover:border-indigo-600 transition flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {asset.assetCode}
                            </span>
                            <span className="text-xs font-semibold text-gray-900 dark:text-white">
                              {asset.assetName}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Loại: {asset.categoryName} • Ngày bàn giao: {asset.assignedDate}
                          </p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Đang sử dụng
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850 space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Trạng thái An toàn & Kiểm toán Đăng nhập
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-gray-500">Xác thực 2 yếu tố (2FA / MFA):</span>
                    <span className={`font-semibold ${user.mfaEnabled ? "text-emerald-600" : "text-amber-600"}`}>
                      {user.mfaEnabled ? "Đã bật (Bảo mật cao)" : "Chưa kích hoạt"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-gray-500">Lần đăng nhập gần nhất:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("vi-VN") : "Chưa từng đăng nhập"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-500">Địa chỉ IP đăng nhập cuối:</span>
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {user.lastLoginIp || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECURITY ACTIONS */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h5 className="text-sm font-bold text-gray-900 dark:text-white">Đặt lại mật khẩu</h5>
                  <p className="text-xs text-gray-500 mt-0.5">Sinh mật khẩu ngẫu nhiên tạm thời cho nhân viên</p>
                </div>
                <button
                  onClick={() => onResetPassword(user.id)}
                  className="px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 rounded-xl border border-indigo-200 dark:border-indigo-800 transition"
                >
                  Cấp lại mật khẩu mới
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDelete(user.id);
                onClose();
                toast.success("Đã xóa tài khoản người dùng");
              }}
              className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              Xóa tài khoản
            </button>
            <button
              onClick={() => {
                onToggleLock(user.id);
                toast.success(
                  user.status === "LOCKED"
                    ? `Đã mở khóa tài khoản [${user.username}]`
                    : `Đã khóa tài khoản [${user.username}]`
                );
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                user.status === "LOCKED"
                  ? "text-emerald-600 hover:bg-emerald-50"
                  : "text-amber-600 hover:bg-amber-50"
              }`}
            >
              {user.status === "LOCKED" ? "🔓 Mở khóa tài khoản" : "🔒 Khóa tài khoản"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEdit(user);
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition"
            >
              Chỉnh sửa thông tin
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 rounded-xl transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
