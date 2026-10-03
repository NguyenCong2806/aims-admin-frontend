import React from "react";
import {
  AppRole,
  PermissionModuleGroup,
} from "../../../models/Permission/permissionModel";

interface RoleCardsViewProps {
  roles: AppRole[];
  modules: PermissionModuleGroup[];
  onInspectMembers: (role: AppRole) => void;
  onEditRole: (role: AppRole) => void;
  onDeleteRole: (role: AppRole) => void;
  onSelectRoleInMatrix: (roleId: string) => void;
  keyword: string;
}

export const RoleCardsView: React.FC<RoleCardsViewProps> = ({
  roles,
  modules,
  onInspectMembers,
  onEditRole,
  onDeleteRole,
  onSelectRoleInMatrix,
  keyword,
}) => {
  const totalPermissionsCount = modules.reduce((sum, m) => sum + m.permissions.length, 0);

  const filteredRoles = roles.filter((role) => {
    if (!keyword.trim()) return true;
    const q = keyword.toLowerCase().trim();
    return (
      role.name.toLowerCase().includes(q) ||
      role.code.toLowerCase().includes(q) ||
      role.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredRoles.length === 0 ? (
        <div className="col-span-full py-12 text-center bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Không tìm thấy vai trò nào phù hợp với từ khóa
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Vui lòng thử lại với từ khóa khác hoặc tạo vai trò mới.
          </p>
        </div>
      ) : (
        filteredRoles.map((role) => {
          const assignedCount = role.permissions.length;
          const percent = Math.round((assignedCount / totalPermissionsCount) * 100);

          return (
            <div
              key={role.id}
              className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                      style={{ backgroundColor: role.color }}
                    >
                      🛡️
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {role.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${role.badgeClass}`}
                        >
                          {role.code}
                        </span>
                        {role.isSystem ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-medium">
                            Hệ thống
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 font-medium">
                            Tùy biến
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown / Quick Edit */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditRole(role)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Chỉnh sửa vai trò"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {!role.isSystem && (
                      <button
                        type="button"
                        onClick={() => onDeleteRole(role)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Xóa vai trò tùy biến này"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[36px] mb-4">
                  {role.description}
                </p>

                {/* Permissions Progress */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-800 mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Độ phủ quyền hạn
                    </span>
                    <span className="font-mono font-bold" style={{ color: role.color }}>
                      {assignedCount} / {totalPermissionsCount} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: role.color,
                      }}
                    />
                  </div>

                  {/* Modules mini distribution */}
                  <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-gray-200/60 dark:border-gray-700/60">
                    {modules.slice(0, 4).map((mod) => {
                      const granted = mod.permissions.filter((p) =>
                        role.permissions.includes(p.id)
                      ).length;
                      return (
                        <div key={mod.moduleKey} className="text-center">
                          <span className="text-[11px] block">{mod.icon}</span>
                          <span className="text-[9px] text-gray-500 dark:text-gray-400 font-mono">
                            {granted}/{mod.permissions.length}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onInspectMembers(role)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
                >
                  <span>👥</span>
                  <span>{role.usersCount} thành viên</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectRoleInMatrix(role.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Ma trận quyền →
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
