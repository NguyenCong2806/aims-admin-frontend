import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../components/aims";
import PageMeta from "../../components/common/PageMeta";
import {
  AppRole,
  PermissionModuleGroup,
} from "../../models/Permission/permissionModel";
import {
  INITIAL_APP_ROLES,
  PERMISSION_MODULES,
} from "../../services/Permission/permissionMockData";
import { permissionService } from "../../services/Permission/permissionService";
import { PermissionMatrixTable } from "./components/PermissionMatrixTable";
import { RoleCardsView } from "./components/RoleCardsView";
import { RoleFormModal } from "./components/RoleFormModal";
import { RoleMembersModal } from "./components/RoleMembersModal";

export const PermissionsPage: React.FC = () => {
  const [roles, setRoles] = useState<AppRole[]>(INITIAL_APP_ROLES);
  const [modules] = useState<PermissionModuleGroup[]>(PERMISSION_MODULES);
  const [keyword, setKeyword] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list"); // 'list' = Matrix, 'grid' = Cards

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<AppRole | null>(null);

  const [inspectingRole, setInspectingRole] = useState<AppRole | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState<boolean>(false);

  // 1. Thống kê KPI tổng quan
  const stats = useMemo(() => {
    const totalRoles = roles.length;
    const systemRoles = roles.filter((r) => r.isSystem).length;
    const customRoles = roles.filter((r) => !r.isSystem).length;
    const totalPermissions = modules.reduce((sum, m) => sum + m.permissions.length, 0);
    const totalAssignments = roles.reduce((sum, r) => sum + r.usersCount, 0);

    // Tính tỷ lệ trung bình cấp quyền trên các vai trò
    const avgCoverage = Math.round(
      roles.reduce((sum, r) => sum + (r.permissions.length / totalPermissions) * 100, 0) /
        (roles.length || 1)
    );

    return {
      totalRoles,
      systemRoles,
      customRoles,
      totalPermissions,
      totalAssignments,
      avgCoverage,
    };
  }, [roles, modules]);

  // 2. Tree Filter
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    const moduleItems = modules.map((m) => ({
      id: `mod_${m.moduleKey}`,
      label: m.moduleName,
      count: m.permissions.length,
    }));

    return [
      {
        id: "modules",
        title: "PHÂN HỆ HỆ THỐNG",
        items: [
          { id: "all", label: "Tất cả phân hệ", count: stats.totalPermissions },
          ...moduleItems,
        ],
      },
      {
        id: "roles",
        title: "LOẠI VAI TRÒ (RBAC)",
        items: [
          { id: "rl_all", label: "Tất cả vai trò", count: roles.length },
          { id: "rl_system", label: "Vai trò hệ thống mặc định", count: stats.systemRoles },
          { id: "rl_custom", label: "Vai trò tùy biến doanh nghiệp", count: stats.customRoles },
        ],
      },
    ];
  }, [modules, roles, stats]);

  // 3. Xử lý bộ lọc phân hệ
  const activeModuleKey = useMemo(() => {
    if (selectedFilter && String(selectedFilter).startsWith("mod_")) {
      return String(selectedFilter).replace("mod_", "");
    }
    return undefined;
  }, [selectedFilter]);

  // Lọc vai trò theo tree filter nếu người dùng chọn nhóm vai trò
  const filteredRoles = useMemo(() => {
    if (selectedFilter === "rl_system") {
      return roles.filter((r) => r.isSystem);
    }
    if (selectedFilter === "rl_custom") {
      return roles.filter((r) => !r.isSystem);
    }
    return roles;
  }, [roles, selectedFilter]);

  // 4. Các thao tác phân quyền (Matrix interactions)
  const handleTogglePermission = async (roleId: string, permissionId: string) => {
    try {
      const updatedRole = await permissionService.togglePermission(roleId, permissionId);
      setRoles((prev) => prev.map((r) => (r.id === roleId ? updatedRole : r)));

      const isNowGranted = updatedRole.permissions.includes(permissionId);
      if (isNowGranted) {
        toast.success(`Đã cấp quyền cho vai trò ${updatedRole.name}`);
      } else {
        toast.info(`Đã thu hồi quyền khỏi vai trò ${updatedRole.name}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi cập nhật quyền hạn");
    }
  };

  const handleToggleModulePermissions = async (
    roleId: string,
    moduleKey: string,
    grantAll: boolean
  ) => {
    try {
      const updatedRole = await permissionService.toggleModulePermissions(
        roleId,
        moduleKey,
        grantAll
      );
      setRoles((prev) => prev.map((r) => (r.id === roleId ? updatedRole : r)));

      const targetMod = modules.find((m) => m.moduleKey === moduleKey);
      if (grantAll) {
        toast.success(
          `Đã cấp toàn bộ quyền phân hệ [${targetMod?.moduleName}] cho vai trò ${updatedRole.name}`
        );
      } else {
        toast.info(
          `Đã thu hồi quyền phân hệ [${targetMod?.moduleName}] khỏi vai trò ${updatedRole.name}`
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi cập nhật quyền hạn phân hệ");
    }
  };

  // 5. Thao tác CRUD Vai trò
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleOpenEditRole = (role: AppRole) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleSaveRole = async (roleData: Partial<AppRole>) => {
    try {
      if (roleData.id) {
        // Cập nhật
        setRoles((prev) =>
          prev.map((r) =>
            r.id === roleData.id
              ? ({
                  ...r,
                  ...roleData,
                  updatedAt: new Date().toISOString(),
                } as AppRole)
              : r
          )
        );
        toast.success(`Cập nhật vai trò [${roleData.name}] thành công!`);
      } else {
        // Tạo mới
        const newRole = await permissionService.createRole({
          name: roleData.name || "Vai trò mới",
          code: roleData.code || "CUSTOM_ROLE",
          description: roleData.description || "",
          color: roleData.color || "#6366f1",
          badgeClass: roleData.badgeClass || "bg-indigo-50 text-indigo-700",
          permissions: roleData.permissions || [],
        });
        setRoles((prev) => [...prev, newRole]);
        toast.success(`Đã tạo mới vai trò [${newRole.name}]!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi lưu thông tin vai trò");
    }
  };

  const handleDeleteRole = async (role: AppRole) => {
    if (role.isSystem) {
      toast.error("Không thể xóa vai trò mặc định của hệ thống!");
      return;
    }

    try {
      await permissionService.deleteRole(role.id);
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      toast.success(`Đã xóa vai trò [${role.name}] thành công!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi xóa vai trò");
    }
  };

  // 6. Xem danh sách thành viên thuộc vai trò
  const handleInspectMembers = (role: AppRole) => {
    setInspectingRole(role);
    setIsMembersModalOpen(true);
  };

  // 7. Xuất file CSV ma trận quyền
  const handleExportCsv = () => {
    try {
      permissionService.exportMatrixCsv(roles);
      toast.success("Đã xuất ma trận phân quyền ra file CSV thành công!");
    } catch {
      toast.error("Không thể xuất file CSV");
    }
  };

  return (
    <>
      <PageMeta
        title="Bảng phân quyền (RBAC) - Hệ thống Quản trị Tài sản AIMS"
        description="Ma trận phân quyền chi tiết, quản trị vai trò người dùng, cấp phát và thu hồi quyền hạn cho từng module hệ thống AIMS"
      />

      <AimsBasePageLayout
        moduleName="Người dùng & Bảo mật"
        moduleIcon={
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
        moduleTabs={[
          { name: "Tài khoản", path: "/tai-khoan" },
          { name: "Phân quyền (RBAC)", path: "/phan-quyen", badge: roles.length },
          { name: "Cấu hình hệ thống", path: "/cau-hinh-he-thong" },
        ]}
        title="Ma trận Phân quyền & Vai trò (RBAC)"
        subtitle="Quản trị vai trò người dùng, cấu hình ma trận phân quyền chi tiết theo từng hành động Xem, Tạo, Sửa, Xóa, Xuất dữ liệu và Nghiệm thu"
        totalRecords={roles.length}
        searchTerm={keyword}
        onSearchChange={setKeyword}
        onAddNew={handleOpenCreateRole}
        addNewLabel="+ Thêm vai trò mới"
        onExportExcel={handleExportCsv}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFilter}
        onSelectTreeFilter={setSelectedFilter}
      >
        {/* KPI OVERVIEW METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tổng quyền hạn</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.totalPermissions}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              🔑
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Vai trò hệ thống</p>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-300 mt-0.5">
                {stats.systemRoles}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
              🔒
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">Vai trò tùy biến</p>
              <p className="text-xl font-bold text-purple-800 dark:text-purple-300 mt-0.5">
                {stats.customRoles}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold">
              ✨
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Lượt gán quyền</p>
              <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">
                {stats.totalAssignments}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
              👥
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Độ phủ bình quân</p>
              <p className="text-xl font-bold text-amber-800 dark:text-amber-300 mt-0.5">
                {stats.avgCoverage}%
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold">
              📊
            </div>
          </div>
        </div>

        {/* VIEW CONTENT: MATRIX TABLE OR CARDS */}
        {viewMode === "list" ? (
          <PermissionMatrixTable
            roles={filteredRoles}
            modules={modules}
            onTogglePermission={handleTogglePermission}
            onToggleModulePermissions={handleToggleModulePermissions}
            onInspectMembers={handleInspectMembers}
            onEditRole={handleOpenEditRole}
            keyword={keyword}
            selectedModuleKey={activeModuleKey}
          />
        ) : (
          <RoleCardsView
            roles={filteredRoles}
            modules={modules}
            onInspectMembers={handleInspectMembers}
            onEditRole={handleOpenEditRole}
            onDeleteRole={handleDeleteRole}
            onSelectRoleInMatrix={() => setViewMode("list")}
            keyword={keyword}
          />
        )}
      </AimsBasePageLayout>

      {/* MODAL THÊM / SỬA VAI TRÒ */}
      <RoleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveRole}
        initialRole={editingRole}
        existingRoles={roles}
      />

      {/* MODAL XEM THÀNH VIÊN THUỘC VAI TRÒ */}
      <RoleMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        role={inspectingRole}
      />
    </>
  );
};

export default PermissionsPage;
