import React, { useState, useMemo } from "react";
import { AppRole } from "../../../models/Permission/permissionModel";
import { permissionService } from "../../../services/Permission/permissionService";
import { USER_STATUS_META, getInitials, getAvatarColor } from "../../Users/userHelper";

interface RoleMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: AppRole | null;
}

export const RoleMembersModal: React.FC<RoleMembersModalProps> = ({
  isOpen,
  onClose,
  role,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const members = useMemo(() => {
    if (!role) return [];
    return permissionService.getRoleMembers(role.code);
  }, [role]);

  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return members;
    const q = searchTerm.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.departmentName && m.departmentName.toLowerCase().includes(q))
    );
  }, [members, searchTerm]);

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-slate-50/50 dark:bg-gray-850/50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
              style={{ backgroundColor: role.color }}
            >
              👥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Thành viên vai trò: {role.name}
                </h3>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${role.badgeClass}`}
                >
                  {role.code}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {role.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search & Statistics Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-white dark:bg-gray-900">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Tìm theo tên, username, email, phòng ban..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl whitespace-nowrap">
            Tổng cộng: <strong className="text-gray-900 dark:text-white">{filteredMembers.length}</strong> / {members.length} nhân sự
          </div>
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-gray-100 dark:divide-gray-800">
          {filteredMembers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Chưa có tài khoản nào được gán vai trò này
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Bạn có thể gán vai trò cho nhân viên trong màn hình quản trị Tài khoản người dùng.
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const statusMeta = USER_STATUS_META[member.status] || {
                label: member.status,
                badgeClass: "bg-gray-100 text-gray-600",
                dotClass: "bg-gray-400",
              };
              return (
                <div
                  key={member.id}
                  className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-2.5 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${getAvatarColor(
                        member.username
                      )}`}
                    >
                      {getInitials(member.fullName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {member.fullName}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          @{member.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <span>{member.departmentName || "Phòng ban IT"}</span>
                        <span>•</span>
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusMeta.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {role.isSystem ? "🔒 Vai trò hệ thống mặc định" : "✨ Vai trò tùy biến của doanh nghiệp"}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
