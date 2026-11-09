import React, { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../../components/aims";
import PageMeta from "../../../components/common/PageMeta";
import { UserAccount, UserRole, UserStatus } from "../models/userAccount";
import { useAuth } from "../../../context/AuthContext";
import { userService } from "../services/UserService";
import {
  useUserAccountsPaged,
  useCreateUserAccount,
  useUpdateUserAccount,
  useToggleLockUserAccount,
  useDeleteUserAccount,
  useChangePassword,
} from "../queries/userAccountQuery";
import { UserDetailModal } from "./components/UserDetailModal";
import { UserFormModal } from "./components/UserFormModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import {
  USER_STATUS_META,
  getInitials,
  getAvatarColor,
  getRoleMeta,
} from "./userHelper";

export const UserAccountsPage: React.FC = () => {
  const { user: currentUser, logout, hasPermission } = useAuth();
  const canView = hasPermission("accounts.view") || hasPermission("users.view");
  const canCreate = canView && (hasPermission("accounts.create") || hasPermission("users.create"));
  const canUpdate = canView && (hasPermission("accounts.update") || hasPermission("users.update"));
  const canDelete = canView && (hasPermission("accounts.delete") || hasPermission("users.delete"));

  const [keyword, setKeyword] = useState<string>("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Modals state
  const [inspectingUser, setInspectingUser] = useState<UserAccount | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formInitialData, setFormInitialData] = useState<UserAccount | null>(null);

  // Reset password state
  const [resetModalUser, setResetModalUser] = useState<UserAccount | null>(null);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);

  // Debounce tìm kiếm từ khóa
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
      setPageIndex(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [keyword]);

  // 1. Gọi API phân trang thật từ Backend: GET /api/v1/accounts/paged-db
  const {
    data: pagedData,
    isLoading,
    isError,
    error,
    refetch,
  } = useUserAccountsPaged({
    PageIndex: pageIndex,
    PageSize: pageSize,
    MaxPageSize: 100,
    Keyword: debouncedKeyword || undefined,
  });

  const is403 =
    !canView ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error as any)?.response?.status === 403 ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error as any)?.status === 403 ||
    (error instanceof Error && (error.message.includes("403") || error.message.toLowerCase().includes("quyền")));

  const users: UserAccount[] = useMemo(() => {
    if (isError || is403) return [];
    return pagedData?.items || [];
  }, [pagedData, isError, is403]);

  const totalRecords: number = isError || is403 ? 0 : (pagedData?.pagination?.totalRecords ?? users.length);

  // React Query Mutations
  const createMutation = useCreateUserAccount();
  const updateMutation = useUpdateUserAccount();
  const toggleLockMutation = useToggleLockUserAccount();
  const deleteMutation = useDeleteUserAccount();
  const changePasswordMutation = useChangePassword();

  // 2. Thống kê KPI từ dữ liệu thật
  const stats = useMemo(() => {
    const total = totalRecords;
    const active = users.filter((u) => u.isActive || u.status === "ACTIVE").length;
    const managers = users.filter((u) =>
      (u.roles || []).some((r) => r === "SuperAdmin" || r === "AssetManager")
    ).length;
    const locked = users.filter((u) => u.status === "LOCKED" || (!u.isActive && u.status !== "ACTIVE")).length;

    return { total, active, managers, locked };
  }, [users, totalRecords]);

  // 3. Cây bộ lọc phân cấp (AimsTreeFilter)
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    const activeCount = users.filter((u) => u.isActive || u.status === "ACTIVE").length;
    const lockedCount = users.filter((u) => u.status === "LOCKED" || (!u.isActive && u.status !== "ACTIVE")).length;
    const pendingCount = users.filter((u) => u.status === "PENDING").length;

    const superAdminCount = users.filter((u) => (u.roles || []).includes("SuperAdmin")).length;
    const assetManagerCount = users.filter((u) => (u.roles || []).includes("AssetManager")).length;
    const itSupportCount = users.filter((u) => (u.roles || []).includes("ITSupport")).length;
    const auditorCount = users.filter((u) => (u.roles || []).includes("Auditor")).length;
    const staffCount = users.filter((u) => (u.roles || []).includes("Staff")).length;

    // Đếm theo phòng ban
    const deptCounts: Record<string, number> = {};
    users.forEach((u) => {
      const d = u.departmentName || "Khác";
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    });

    return [
      {
        id: "status",
        title: "TRẠNG THÁI TÀI KHOẢN",
        items: [
          { id: "all", label: "Tất cả tài khoản", count: totalRecords },
          { id: "st_ACTIVE", label: "Đang hoạt động", count: activeCount },
          { id: "st_LOCKED", label: "Đã khóa bảo mật", count: lockedCount },
          { id: "st_PENDING", label: "Chờ kích hoạt", count: pendingCount },
        ],
      },
      {
        id: "roles",
        title: "VAI TRÒ HỆ THỐNG (RBAC)",
        items: [
          { id: "rl_SuperAdmin", label: "Quản trị tối cao", count: superAdminCount },
          { id: "rl_AssetManager", label: "Quản lý Tài sản", count: assetManagerCount },
          { id: "rl_ITSupport", label: "Kỹ thuật IT / Helpdesk", count: itSupportCount },
          { id: "rl_Auditor", label: "Kiểm toán & Kế toán", count: auditorCount },
          { id: "rl_Staff", label: "Nhân viên", count: staffCount },
        ],
      },
      {
        id: "departments",
        title: "PHÒNG BAN TRỰC THUỘC",
        items: Object.entries(deptCounts).map(([dept, count]) => ({
          id: `dp_${dept}`,
          label: dept,
          count,
        })),
      },
    ];
  }, [users, totalRecords]);

  // 4. Lọc phụ trợ client-side nếu người dùng chọn nhánh trong cây bộ lọc
  const filteredUsers = useMemo(() => {
    if (!selectedFilter || selectedFilter === "all") return users;
    const filterStr = String(selectedFilter);

    // Theo trạng thái
    if (filterStr.startsWith("st_")) {
      const st = filterStr.replace("st_", "");
      return users.filter((u) => {
        const statusKey = u.status || (u.isActive ? "ACTIVE" : "INACTIVE");
        return statusKey === st;
      });
    }

    // Theo vai trò
    if (filterStr.startsWith("rl_")) {
      const rl = filterStr.replace("rl_", "");
      return users.filter((u) => (u.roles || []).includes(rl as UserRole));
    }

    // Theo phòng ban
    if (filterStr.startsWith("dp_")) {
      const dp = filterStr.replace("dp_", "");
      return users.filter((u) => u.departmentName === dp);
    }

    return users;
  }, [users, selectedFilter]);

  // 5. Thao tác CRUD & Bảo mật
  const handleOpenDetail = (user: UserAccount) => {
    setInspectingUser(user);
    setIsDetailOpen(true);
  };

  const handleAddNew = () => {
    setFormInitialData(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: UserAccount) => {
    setFormInitialData(user);
    setIsFormOpen(true);
  };

  const handleSaveForm = async (userData: Partial<UserAccount>) => {
    try {
      if (userData.id) {
        await updateMutation.mutateAsync({
          id: userData.id,
          dto: {
            username: userData.username || "",
            fullName: userData.fullName || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || userData.phone || null,
            phonennumber: userData.phoneNumber || userData.phone || null,
            avatarUrl: userData.avatarUrl || null,
            avatarurl: userData.avatarUrl || null,
            departmentid: userData.departmentid ?? userData.departmentId ?? undefined,
            positionid: userData.positionid ?? userData.positionId ?? null,
            isActive: userData.status !== undefined ? userData.status === "ACTIVE" : (userData.isActive ?? true),
            roleids: userData.roleids && userData.roleids.length > 0 ? userData.roleids : [1],
          },
        });
        toast.success(`Đã cập nhật thông tin tài khoản [${userData.username}]`);
      } else {
        await createMutation.mutateAsync({
          username: userData.username || "",
          email: userData.email || "",
          fullName: userData.fullName || "",
          passwordhash: userData.passwordhash || userData.password || "P@ssword123",
          phoneNumber: userData.phoneNumber || userData.phone || null,
          phonennumber: userData.phoneNumber || userData.phone || null,
          avatarUrl: userData.avatarUrl || null,
          avatarurl: userData.avatarUrl || null,
          departmentid: userData.departmentid ?? userData.departmentId ?? 1,
          positionid: userData.positionid ?? userData.positionId ?? null,
          isActive: userData.status !== undefined ? userData.status === "ACTIVE" : (userData.isActive ?? true),
          roleids: userData.roleids && userData.roleids.length > 0 ? userData.roleids : [1],
        });
        toast.success(`Đã tạo mới tài khoản [${userData.username}] thành công!`);
      }
      setIsFormOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lưu tài khoản thất bại!");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteMutation.mutateAsync(id);
      if (res !== null) {
        setIsDetailOpen(false);
        refetch();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Xóa tài khoản không thành công!");
    }
  };

  const handleToggleLock = async (id: number) => {
    const targetUser = users.find((u) => u.id === id);
    const isCurrentlyActive = targetUser?.isActive ?? (targetUser?.status === "ACTIVE");

    const confirmResult = await Swal.fire({
      title: isCurrentlyActive ? "Khóa tài khoản?" : "Mở khóa tài khoản?",
      text: isCurrentlyActive
        ? `Tài khoản [@${targetUser?.username || id}] sẽ bị khóa ngay lập tức và người dùng sẽ bị đăng xuất khỏi hệ thống.`
        : `Tài khoản [@${targetUser?.username || id}] sẽ được mở khóa để có thể đăng nhập bình thường.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isCurrentlyActive ? "Khóa tài khoản" : "Mở khóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: isCurrentlyActive ? "#d97706" : "#10b981",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await toggleLockMutation.mutateAsync(id);
      toast.success(
        isCurrentlyActive
          ? `Đã khóa tài khoản [@${targetUser?.username || id}] thành công!`
          : `Đã mở khóa tài khoản [@${targetUser?.username || id}] thành công!`
      );
      refetch();

      // Nếu tài khoản vừa bị khóa chính là tài khoản đang đăng nhập -> Đăng xuất ngay lập tức!
      const isCurrentAccount =
        currentUser &&
        (Number(currentUser.id) === id ||
          (targetUser &&
            currentUser.username?.toLowerCase() === targetUser.username?.toLowerCase()));

      if (isCurrentAccount && isCurrentlyActive) {
        toast.error("Tài khoản của bạn đã bị khóa! Đang đăng xuất khỏi hệ thống...");
        setTimeout(() => {
          logout();
        }, 1000);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Thao tác khóa/mở khóa tài khoản thất bại!");
    }
  };

  const handleResetPassword = (id: number) => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;
    setResetModalUser(targetUser);
    setIsResetOpen(true);
  };

  const handleConfirmChangePassword = async (newPassword: string) => {
    if (!resetModalUser) return;
    await changePasswordMutation.mutateAsync({
      id: resetModalUser.id,
      newPassword,
    });
    refetch();
  };

  const handleExport = () => {
    const toExport =
      selectedIds.size > 0
        ? users.filter((u) => selectedIds.has(u.id))
        : filteredUsers;
    userService.exportToCsv(toExport);
    toast.success(`Đã xuất ${toExport.length} tài khoản người dùng ra file CSV!`);
  };

  return (
    <>
      <PageMeta
        title="Tài khoản người dùng | AIMS Enterprise"
        description="Quản trị người dùng, vai trò phân quyền RBAC, kiểm toán đăng nhập và danh mục tài sản cấp phát"
      />

      <AimsBasePageLayout
        moduleName="Người dùng & Bảo mật"
        moduleIcon={
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
        moduleTabs={[
          { name: "Tài khoản", path: "/tai-khoan", badge: totalRecords, permission: "accounts.view" },
          { name: "Phân quyền (RBAC)", path: "/phan-quyen", permission: "roles.view" },
          { name: "Cấu hình hệ thống", path: "/cau-hinh-he-thong", permission: "settings.view" },
        ]}
        title="Tài khoản người dùng"
        subtitle="Quản lý danh sách tài khoản nhân viên, thiết lập vai trò phân quyền (RBAC) và theo dõi tài sản CNTT bàn giao"
        totalRecords={totalRecords}
        error={
          !canView || is403
            ? "Bạn không có quyền thực hiện chức năng này (403 Forbidden)"
            : isError
              ? (error as any)
              : null
        }
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onAddNew={canCreate ? handleAddNew : undefined}
        addNewLabel={canCreate ? "+ Thêm tài khoản" : undefined}
        onExportExcel={handleExport}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFilter}
        onSelectTreeFilter={(val) => {
          setSelectedFilter(val);
          setPageIndex(1);
        }}
      >
        {/* KPI OVERVIEW METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Tổng tài khoản</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.total}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              👥
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Đang hoạt động</p>
              <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">{stats.active}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
              🟢
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Quản trị viên & QL</p>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-300 mt-0.5">{stats.managers}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
              🛡️
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">Tài khoản bị khóa</p>
              <p className="text-xl font-bold text-rose-800 dark:text-rose-300 mt-0.5">{stats.locked}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold">
              🔒
            </div>
          </div>
        </div>

        {/* 1. LIST DATA TABLE VIEW */}
        {viewMode === "list" && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-800/80 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredUsers.length > 0 &&
                          filteredUsers.every((u) => selectedIds.has(u.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(new Set(filteredUsers.map((u) => u.id)));
                          else setSelectedIds(new Set());
                        }}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-4 py-3.5">Người dùng & Tài khoản</th>
                    <th className="px-4 py-3.5">Email & Số điện thoại</th>
                    <th className="px-4 py-3.5">Phòng ban & Vị trí</th>
                    <th className="px-4 py-3.5">Vai trò (Roles)</th>
                    <th className="px-4 py-3.5 text-center">Tài sản đang giữ</th>
                    <th className="px-4 py-3.5">Trạng thái</th>
                    <th className="px-4 py-3.5">Đăng nhập cuối</th>
                    <th className="px-4 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {isLoading && users.length === 0 ? (
                    // SKELETON LOADING STATE
                    [...Array(5)].map((_, idx) => (
                      <tr key={`sk-${idx}`} className="animate-pulse">
                        <td className="px-4 py-4 w-10"><div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                        <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700"></div><div className="space-y-1.5"><div className="w-24 h-3.5 bg-gray-200 dark:bg-gray-700 rounded"></div><div className="w-16 h-2.5 bg-gray-200 dark:bg-gray-700 rounded"></div></div></div></td>
                        <td className="px-4 py-4"><div className="w-32 h-3.5 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                        <td className="px-4 py-4"><div className="w-28 h-3.5 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                        <td className="px-4 py-4"><div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded-md"></div></td>
                        <td className="px-4 py-4 text-center"><div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div></td>
                        <td className="px-4 py-4"><div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div></td>
                        <td className="px-4 py-4"><div className="w-20 h-3.5 bg-gray-200 dark:bg-gray-700 rounded"></div></td>
                        <td className="px-4 py-4 text-right"><div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400 dark:text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-3xl mb-2">👤</span>
                          <p className="text-base font-medium">
                            {users.length === 0 ? "Chưa có tài khoản người dùng nào từ máy chủ" : "Không tìm thấy tài khoản người dùng phù hợp"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {users.length === 0 ? "Hãy bấm \"Thêm tài khoản mới\" để bắt đầu" : "Hãy thử xóa bộ lọc hoặc tìm kiếm từ khóa khác"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSelected = selectedIds.has(user.id);
                      const isAct = user.isActive ?? (user.status === "ACTIVE");
                      const statusKey: UserStatus = user.status || (isAct ? "ACTIVE" : "INACTIVE");
                      const statusMeta = USER_STATUS_META[statusKey] || USER_STATUS_META.ACTIVE;
                      const assetsCount = (user.assignedAssets || []).length;
                      const phoneDisplay = user.phoneNumber || user.phone || "-";

                      return (
                        <tr
                          key={user.id}
                          className={`transition hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                            isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                          }`}
                        >
                          {/* CHECKBOX */}
                          <td className="px-4 py-3.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedIds((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(user.id)) next.delete(user.id);
                                  else next.add(user.id);
                                  return next;
                                });
                              }}
                              className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                          </td>

                          {/* AVATAR & NAME */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarColor(
                                  user.fullName || user.username
                                )} text-white flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0`}
                              >
                                {getInitials(user.fullName || user.username)}
                              </div>
                              <div>
                                <p
                                  onClick={() => handleOpenDetail(user)}
                                  className="text-xs font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                                >
                                  {user.fullName || user.username}
                                </p>
                                <p className="text-[11px] font-mono text-gray-400">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* EMAIL & PHONE */}
                          <td className="px-4 py-3.5 text-xs">
                            <p className="text-gray-900 dark:text-white font-medium">{user.email || "-"}</p>
                            <p className="text-[11px] text-gray-400">{phoneDisplay}</p>
                          </td>

                          {/* DEPARTMENT & POSITION */}
                          <td className="px-4 py-3.5 text-xs">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              {user.departmentName || "-"}
                            </p>
                            <p className="text-[11px] text-gray-400">{user.positionName || "-"}</p>
                          </td>

                          {/* ROLES */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {(user.roles || []).length > 0 ? (
                                user.roles!.map((r) => {
                                  const rMeta = getRoleMeta(r);
                                  return (
                                    <span
                                      key={r}
                                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${rMeta.badgeClass}`}
                                    >
                                      {rMeta.label}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium border bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                                  {user.positionName || "Nhân viên"}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* ASSIGNED ASSETS */}
                          <td className="px-4 py-3.5 text-center">
                            <button
                              onClick={() => handleOpenDetail(user)}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${
                                assetsCount > 0
                                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                              }`}
                              title="Click xem danh sách thiết bị bàn giao"
                            >
                              💻 {assetsCount} máy
                            </button>
                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`}></span>
                              {isAct ? "Đang hoạt động" : "Đã khóa / Ngừng"}
                            </span>
                          </td>

                          {/* LAST LOGIN */}
                          <td className="px-4 py-3.5 text-xs">
                            {user.lastLoginAt ? (
                              <div>
                                <p className="text-gray-800 dark:text-gray-200 font-medium">
                                  {new Date(user.lastLoginAt).toLocaleDateString("vi-VN")}
                                </p>
                                <p className="text-[10px] text-gray-400 font-mono">
                                  {user.lastLoginIp || ""}
                                </p>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">Chưa đăng nhập</span>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenDetail(user)}
                                className="px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition"
                              >
                                Xem
                              </button>
                              {canUpdate && (
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="p-1 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                  title="Chỉnh sửa"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                              )}
                              {canUpdate && (
                                <button
                                  onClick={() => handleToggleLock(user.id)}
                                  className={`p-1 rounded-lg transition ${
                                    !isAct
                                      ? "text-emerald-600 hover:bg-emerald-50"
                                      : "text-amber-600 hover:bg-amber-50"
                                  }`}
                                  title={!isAct ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                >
                                  {!isAct ? "🔓" : "🔒"}
                                </button>
                              )}
                              {canUpdate && (
                                <button
                                  onClick={() => handleResetPassword(user.id)}
                                  className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                  title="Đặt lại mật khẩu"
                                >
                                  🔑
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => handleDelete(user.id)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                                  title="Xóa tài khoản"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. PROFILE CARDS GRID VIEW */}
        {viewMode === "kanban" && (
          filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800">
              <span className="text-3xl mb-2 block">👤</span>
              <p className="text-base font-medium">
                {users.length === 0 ? "Chưa có tài khoản người dùng nào từ máy chủ" : "Không tìm thấy tài khoản người dùng phù hợp"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {users.length === 0 ? "Hãy bấm \"Thêm tài khoản mới\" để bắt đầu" : "Hãy thử xóa bộ lọc hoặc tìm kiếm từ khóa khác"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                const isAct = user.isActive ?? (user.status === "ACTIVE");
                const statusKey: UserStatus = user.status || (isAct ? "ACTIVE" : "INACTIVE");
                const statusMeta = USER_STATUS_META[statusKey] || USER_STATUS_META.ACTIVE;
                const assetsCount = (user.assignedAssets || []).length;

                return (
                  <div
                    key={user.id}
                    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getAvatarColor(
                            user.fullName || user.username
                          )} text-white flex items-center justify-center text-base font-bold shadow-md flex-shrink-0`}
                        >
                          {getInitials(user.fullName || user.username)}
                        </div>
                        <div className="min-w-0">
                          <h4
                            onClick={() => handleOpenDetail(user)}
                            className="font-bold text-sm text-gray-900 dark:text-white hover:text-indigo-600 cursor-pointer truncate"
                          >
                            {user.fullName || user.username}
                          </h4>
                          <p className="text-xs font-mono text-gray-400">@{user.username}</p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
                            {user.positionName || "Nhân viên"}
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}>
                        {isAct ? "Hoạt động" : "Đã khóa"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <span>🏢</span>
                        <span className="truncate">{user.departmentName || "Chưa phân bổ"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>✉️</span>
                        <span className="truncate">{user.email || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📱</span>
                        <span className="truncate">{user.phoneNumber || user.phone || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💻</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {assetsCount} thiết bị IT đang giữ
                        </span>
                      </div>
                    </div>

                    {/* ROLES BADGES */}
                    <div className="flex flex-wrap gap-1">
                      {(user.roles || []).length > 0 ? (
                        user.roles!.map((r) => {
                          const rMeta = getRoleMeta(r);
                          return (
                            <span
                              key={r}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${rMeta.badgeClass}`}
                            >
                              {rMeta.label}
                            </span>
                          );
                        })
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold border bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                          {user.positionName || "Nhân viên"}
                        </span>
                      )}
                    </div>

                    {/* CARD ACTIONS */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      {canUpdate ? (
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                        >
                          🔑 Reset MK
                        </button>
                      ) : (
                        <span />
                      )}
                      <div className="flex items-center gap-1.5">
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(user)}
                            className="px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-lg transition"
                          >
                            Sửa
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenDetail(user)}
                          className="px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition"
                        >
                          Chi tiết →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* MODAL CHI TIẾT */}
        <UserDetailModal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setInspectingUser(null);
          }}
          user={inspectingUser}
          onEdit={handleEdit}
          onToggleLock={handleToggleLock}
          onResetPassword={handleResetPassword}
          onDelete={handleDelete}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />

        {/* MODAL FORM TẠO MỚI / SỬA */}
        <UserFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setFormInitialData(null);
          }}
          initialData={formInitialData}
          onSave={handleSaveForm}
        />

        {/* MODAL RESET / ĐỔI MẬT KHẨU */}
        <ResetPasswordModal
          isOpen={isResetOpen}
          onClose={() => {
            setIsResetOpen(false);
            setResetModalUser(null);
          }}
          user={resetModalUser}
          onConfirm={handleConfirmChangePassword}
        />
      </AimsBasePageLayout>
    </>
  );
};

export default UserAccountsPage;
