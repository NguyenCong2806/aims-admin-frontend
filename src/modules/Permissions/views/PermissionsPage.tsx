import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../../components/aims";
import PageMeta from "../../../components/common/PageMeta";
import {
  AppRole,
  PermissionModuleGroup,
  PermissionDefinition,
  UpdatePermissionDto,
} from "../models/permissionModel";
import { permissionService } from "../services/permissionService";
import {
  usePermissionModules,
  useRoles,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from "../queries/roleQuery";
import { PermissionMatrixTable } from "./components/PermissionMatrixTable";
import { PermissionEditModal } from "./components/PermissionEditModal";
import { RoleCardsView } from "./components/RoleCardsView";
import { RoleFormModal } from "./components/RoleFormModal";
import { RoleMembersModal } from "./components/RoleMembersModal";

export const PermissionsPage: React.FC = () => {
  const {
    data: fetchedModules,
    isLoading: isLoadingModules,
    isFetching: isFetchingModules,
    refetch: refetchModules,
  } = usePermissionModules();

  const {
    data: fetchedRoles,
    isLoading: isLoadingRoles,
    isFetching: isFetchingRoles,
    refetch: refetchRoles,
  } = useRoles();

  const [roles, setRoles] = useState<AppRole[]>([]);
  const modules: PermissionModuleGroup[] = useMemo(
    () => (Array.isArray(fetchedModules) ? fetchedModules : []),
    [fetchedModules]
  );

  useEffect(() => {
    if (fetchedRoles && fetchedRoles.length > 0) {
      setRoles(fetchedRoles);
    }
  }, [fetchedRoles]);

  const [keyword, setKeyword] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list"); // 'list' = Matrix, 'grid' = Cards

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<AppRole | null>(null);

  const [inspectingRole, setInspectingRole] = useState<AppRole | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState<boolean>(false);

  // Permission Edit Modal state
  const [editingPermission, setEditingPermission] = useState<PermissionDefinition | null>(null);
  const [isPermissionEditModalOpen, setIsPermissionEditModalOpen] = useState<boolean>(false);

  // Mutations
  const updatePermissionMutation = useUpdatePermissionMutation();
  const deletePermissionMutation = useDeletePermissionMutation();

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

  // 8. Làm mới dữ liệu từ máy chủ
  const handleRefresh = async () => {
    try {
      await Promise.all([refetchModules(), refetchRoles()]);
      toast.success("Đã làm mới dữ liệu ma trận phân quyền!");
    } catch {
      toast.error("Không thể làm mới dữ liệu từ máy chủ");
    }
  };

  // 9. Thao tác Sửa / Xóa Quyền hạn (Permission)
  const handleEditPermission = (perm: PermissionDefinition) => {
    setEditingPermission(perm);
    setIsPermissionEditModalOpen(true);
  };

  const handleSavePermission = async (
    permissionId: string | number,
    dto: UpdatePermissionDto
  ) => {
    try {
      await updatePermissionMutation.mutateAsync({ permissionId, dto });
      toast.success(`Đã cập nhật thông tin quyền [${dto.name}] thành công!`);
      setIsPermissionEditModalOpen(false);
      refetchModules();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Cập nhật quyền hạn thất bại!"
      );
    }
  };

  const handleDeletePermission = async (perm: PermissionDefinition) => {
    const permId = perm.permissionId ?? perm.id;
    const result = await Swal.fire({
      title: "Xác nhận xóa quyền hạn?",
      text: `Quyền [${perm.name}] (${perm.code}) sẽ bị xóa vĩnh viễn khỏi toàn bộ vai trò trong hệ thống.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận xóa",
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deletePermissionMutation.mutateAsync(permId);
      toast.success(`Đã xóa quyền [${perm.name}] thành công!`);
      refetchModules();
      refetchRoles();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Xóa quyền hạn thất bại!"
      );
    }
  };

  const isInitialLoading =
    (isLoadingModules && modules.length === 0) ||
    (isLoadingRoles && roles.length === 0);

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
        isFetching={isFetchingModules || isFetchingRoles}
      >
        {/* HEADER TOOLBAR & KPI OVERVIEW */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dữ liệu phân hệ và quyền hạn đồng bộ thời gian thực từ API.
          </p>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-all"
            title="Tải lại ma trận phân quyền từ máy chủ backend"
          >
            <svg className={`w-3.5 h-3.5 ${isFetchingModules || isFetchingRoles ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới ma trận
          </button>
        </div>

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
        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
            <svg className="w-8 h-8 animate-spin text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-medium">Đang tải dữ liệu phân hệ quyền từ máy chủ...</p>
          </div>
        ) : viewMode === "list" ? (
          <PermissionMatrixTable
            roles={filteredRoles}
            modules={modules}
            onTogglePermission={handleTogglePermission}
            onToggleModulePermissions={handleToggleModulePermissions}
            onInspectMembers={handleInspectMembers}
            onEditRole={handleOpenEditRole}
            onEditPermission={handleEditPermission}
            onDeletePermission={handleDeletePermission}
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

      {/* MODAL CẬP NHẬT QUYỀN HẠN (PUT /api/v1/permissions/{id}) */}
      <PermissionEditModal
        isOpen={isPermissionEditModalOpen}
        onClose={() => setIsPermissionEditModalOpen(false)}
        permission={editingPermission}
        onSave={handleSavePermission}
      />

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
