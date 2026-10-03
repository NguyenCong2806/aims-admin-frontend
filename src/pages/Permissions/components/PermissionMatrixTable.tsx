import React, { useState, useMemo } from "react";
import {
  AppRole,
  PermissionModuleGroup,
  PermissionAction,
} from "../../../models/Permission/permissionModel";
import { PERMISSION_ACTION_META } from "../permissionHelper";

interface PermissionMatrixTableProps {
  roles: AppRole[];
  modules: PermissionModuleGroup[];
  onTogglePermission: (roleId: string, permissionId: string) => void;
  onToggleModulePermissions: (roleId: string, moduleKey: string, grantAll: boolean) => void;
  onInspectMembers: (role: AppRole) => void;
  onEditRole: (role: AppRole) => void;
  keyword: string;
  selectedModuleKey?: string;
}

export const PermissionMatrixTable: React.FC<PermissionMatrixTableProps> = ({
  roles,
  modules,
  onTogglePermission,
  onToggleModulePermissions,
  onInspectMembers,
  onEditRole,
  keyword,
  selectedModuleKey,
}) => {
  // Trạng thái đóng/mở các module accordion
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [filterAction, setFilterAction] = useState<PermissionAction | "ALL">("ALL");

  // Tổng số quyền trong hệ thống
  const totalPermissionsCount = useMemo(() => {
    return modules.reduce((sum, m) => sum + m.permissions.length, 0);
  }, [modules]);

  // Lọc module & permission theo từ khóa và moduleKey được chọn từ tree
  const filteredModules = useMemo(() => {
    return modules
      .filter((mod) => {
        if (selectedModuleKey && selectedModuleKey !== "all") {
          return mod.moduleKey === selectedModuleKey;
        }
        return true;
      })
      .map((mod) => {
        const matchingPerms = mod.permissions.filter((perm) => {
          // Lọc theo Action
          if (filterAction !== "ALL" && perm.action !== filterAction) {
            return false;
          }
          // Lọc theo keyword
          if (keyword.trim()) {
            const q = keyword.toLowerCase().trim();
            const matchName = perm.name.toLowerCase().includes(q);
            const matchCode = perm.code.toLowerCase().includes(q);
            const matchDesc = perm.description.toLowerCase().includes(q);
            return matchName || matchCode || matchDesc;
          }
          return true;
        });

        return {
          ...mod,
          permissions: matchingPerms,
        };
      })
      .filter((mod) => mod.permissions.length > 0 || !keyword.trim());
  }, [modules, keyword, selectedModuleKey, filterAction]);

  const toggleModuleAccordion = (moduleKey: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [moduleKey]: !prev[moduleKey],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedModules({});
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    modules.forEach((m) => {
      allCollapsed[m.moduleKey] = true;
    });
    setCollapsedModules(allCollapsed);
  };

  return (
    <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
      {/* Action Filters Bar */}
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
          <span className="font-semibold text-gray-500 dark:text-gray-400 mr-1 shrink-0">
            Lọc theo thao tác:
          </span>
          <button
            onClick={() => setFilterAction("ALL")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              filterAction === "ALL"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Tất cả ({totalPermissionsCount})
          </button>
          {(
            [
              "VIEW",
              "CREATE",
              "UPDATE",
              "DELETE",
              "EXPORT",
              "APPROVE",
              "AUDIT",
            ] as PermissionAction[]
          ).map((action) => {
            const meta = PERMISSION_ACTION_META[action];
            return (
              <button
                key={action}
                onClick={() => setFilterAction(action)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                  filterAction === action
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExpandAll}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Mở rộng tất cả
          </button>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <button
            onClick={handleCollapseAll}
            className="text-xs text-gray-500 dark:text-gray-400 hover:underline font-medium"
          >
            Thu gọn tất cả
          </button>
        </div>
      </div>

      {/* 2D Matrix Table Container */}
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse min-w-[950px]">
          {/* Table Header: Roles */}
          <thead>
            <tr className="bg-slate-100/80 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
              {/* Sticky Top-Left Corner */}
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 w-80 min-w-[320px] sticky left-0 z-30 bg-slate-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span>Phân hệ & Danh mục Quyền</span>
                  <span className="text-[10px] lowercase font-normal px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {totalPermissionsCount} quyền
                  </span>
                </div>
              </th>

              {/* Columns for each Role */}
              {roles.map((role) => {
                const assignedCount = role.permissions.length;
                const percent = Math.round((assignedCount / totalPermissionsCount) * 100);

                return (
                  <th
                    key={role.id}
                    className="p-3.5 text-center min-w-[140px] max-w-[170px] border-r border-gray-200 dark:border-gray-700 last:border-r-0 align-top"
                  >
                    <div className="flex flex-col items-center">
                      {/* Role Badge & Color Dot */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[130px] title={role.name}">
                          {role.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mb-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${role.badgeClass}`}
                        >
                          {role.code}
                        </span>
                        {role.isSystem && (
                          <span
                            className="text-[10px] text-gray-400"
                            title="Vai trò hệ thống mặc định"
                          >
                            🔒
                          </span>
                        )}
                      </div>

                      {/* Percentage Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: role.color,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between w-full text-[10px] text-gray-500 dark:text-gray-400 font-mono mb-2">
                        <span>{assignedCount}/{totalPermissionsCount}</span>
                        <span className="font-semibold">{percent}%</span>
                      </div>

                      {/* Action buttons on role header */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onInspectMembers(role)}
                          className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-2xs"
                          title={`Xem danh sách người dùng thuộc vai trò ${role.name}`}
                        >
                          👥 {role.usersCount}
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditRole(role)}
                          className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          title="Chỉnh sửa thông tin vai trò"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body: Modules & Permissions */}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredModules.length === 0 ? (
              <tr>
                <td
                  colSpan={roles.length + 1}
                  className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm"
                >
                  <p className="font-semibold">Không tìm thấy quyền hạn phù hợp</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Hãy thử xóa từ khóa tìm kiếm hoặc chọn phân hệ khác.
                  </p>
                </td>
              </tr>
            ) : (
              filteredModules.map((mod) => {
                const isCollapsed = !!collapsedModules[mod.moduleKey];

                return (
                  <React.Fragment key={mod.moduleKey}>
                    {/* Module Accordion Header Row */}
                    <tr className="bg-slate-50/90 dark:bg-gray-900/60 font-medium">
                      {/* Sticky Module Name */}
                      <td className="p-3 sticky left-0 z-10 bg-slate-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
                        <div
                          className="flex items-center justify-between cursor-pointer select-none"
                          onClick={() => toggleModuleAccordion(mod.moduleKey)}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{mod.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                  {mod.moduleName}
                                </span>
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                  {mod.permissions.length} quyền
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-normal line-clamp-1">
                                {mod.description}
                              </p>
                            </div>
                          </div>

                          <span className="text-gray-400 p-1">
                            <svg
                              className={`w-4 h-4 transform transition-transform duration-200 ${
                                isCollapsed ? "-rotate-90" : "rotate-0"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </div>
                      </td>

                      {/* Module bulk grant/revoke cell for each role */}
                      {roles.map((role) => {
                        const modulePermIds = mod.permissions.map((p) => p.id);
                        const grantedInModule = modulePermIds.filter((id) =>
                          role.permissions.includes(id)
                        ).length;
                        const isAllGranted =
                          mod.permissions.length > 0 &&
                          grantedInModule === mod.permissions.length;
                        const isSomeGranted =
                          grantedInModule > 0 && grantedInModule < mod.permissions.length;

                        return (
                          <td
                            key={role.id}
                            className="p-2 text-center border-r border-gray-200 dark:border-gray-800 last:border-r-0"
                          >
                            <button
                              type="button"
                              disabled={role.code === "SUPER_ADMIN"}
                              onClick={() =>
                                onToggleModulePermissions(
                                  role.id,
                                  mod.moduleKey,
                                  !isAllGranted
                                )
                              }
                              className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all inline-flex items-center gap-1 ${
                                role.code === "SUPER_ADMIN"
                                  ? "opacity-50 cursor-not-allowed text-gray-400"
                                  : isAllGranted
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200"
                                  : isSomeGranted
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                              }`}
                              title={
                                role.code === "SUPER_ADMIN"
                                  ? "Vai trò Super Admin luôn có toàn quyền"
                                  : isAllGranted
                                  ? "Bỏ chọn tất cả quyền trong phân hệ này"
                                  : "Cấp toàn bộ quyền trong phân hệ này"
                              }
                            >
                              <span>
                                {isAllGranted ? "✓ Đủ" : isSomeGranted ? `~ ${grantedInModule}/${mod.permissions.length}` : "○ Bật"}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Permissions list (when not collapsed) */}
                    {!isCollapsed &&
                      mod.permissions.map((perm) => {
                        const actionMeta = PERMISSION_ACTION_META[perm.action];

                        return (
                          <tr
                            key={perm.id}
                            className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/15 transition-colors"
                          >
                            {/* Sticky Left: Permission details */}
                            <td className="p-3 pl-8 sticky left-0 z-10 bg-white dark:bg-gray-850 border-r border-gray-200 dark:border-gray-800">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${actionMeta.badgeClass}`}
                                    >
                                      {actionMeta.label}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                      {perm.name}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {perm.description}
                                  </p>
                                </div>
                                <span className="text-[10px] font-mono text-gray-400 shrink-0">
                                  {perm.code}
                                </span>
                              </div>
                            </td>

                            {/* Checkbox cell for each Role */}
                            {roles.map((role) => {
                              const isChecked = role.permissions.includes(perm.id);
                              const isSuperAdmin = role.code === "SUPER_ADMIN";

                              return (
                                <td
                                  key={role.id}
                                  className="p-3 text-center border-r border-gray-200 dark:border-gray-800 last:border-r-0 align-middle"
                                >
                                  <div className="flex items-center justify-center">
                                    <label
                                      className={`relative inline-flex items-center justify-center w-6 h-6 rounded-lg cursor-pointer transition-all ${
                                        isSuperAdmin
                                          ? "cursor-not-allowed opacity-90"
                                          : "hover:scale-110 active:scale-95"
                                      }`}
                                      title={
                                        isSuperAdmin
                                          ? "Vai trò Super Admin luôn giữ quyền này"
                                          : isChecked
                                          ? `Bấm để thu hồi [${perm.name}] khỏi ${role.name}`
                                          : `Bấm để cấp [${perm.name}] cho ${role.name}`
                                      }
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isSuperAdmin}
                                        onChange={() =>
                                          onTogglePermission(role.id, perm.id)
                                        }
                                        className="sr-only"
                                      />
                                      <div
                                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                          isChecked
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-indigo-400"
                                        }`}
                                      >
                                        {isChecked && (
                                          <svg
                                            className="w-3.5 h-3.5 stroke-current stroke-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                    </label>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Notes & Security Banner */}
      <div className="p-3 bg-gray-50/60 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            Đã cấp quyền
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
            Chưa cấp quyền
          </span>
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            🔒 SUPER_ADMIN mặc định giữ 100% quyền hạn
          </span>
        </div>
        <div>
          <span>Các thay đổi trên ma trận được lưu tự động theo thời gian thực</span>
        </div>
      </div>
    </div>
  );
};
