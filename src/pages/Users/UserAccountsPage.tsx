import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../components/aims";
import PageMeta from "../../components/common/PageMeta";
import { UserAccount, UserRole } from "../../models/User/userAccount";
import { userService } from "../../services/Users/userService";
import { INITIAL_USER_ACCOUNTS } from "../../services/Users/userMockData";
import { UserDetailModal } from "./components/UserDetailModal";
import { UserFormModal } from "./components/UserFormModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import {
  USER_ROLE_META,
  USER_STATUS_META,
  getInitials,
  getAvatarColor,
} from "./userHelper";

export const UserAccountsPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USER_ACCOUNTS);
  const [keyword, setKeyword] = useState<string>("");
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
  const [resetTempPassword, setResetTempPassword] = useState<string>("");
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);

  // 1. Thống kê KPI
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const managers = users.filter(
      (u) => u.roles.includes("SuperAdmin") || u.roles.includes("AssetManager")
    ).length;
    const locked = users.filter((u) => u.status === "LOCKED").length;
    const mfa = users.filter((u) => u.mfaEnabled).length;

    return { total, active, managers, locked, mfa };
  }, [users]);

  // 2. Cây bộ lọc phân cấp (AimsTreeFilter)
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    const activeCount = users.filter((u) => u.status === "ACTIVE").length;
    const lockedCount = users.filter((u) => u.status === "LOCKED").length;
    const pendingCount = users.filter((u) => u.status === "PENDING").length;

    const superAdminCount = users.filter((u) => u.roles.includes("SuperAdmin")).length;
    const assetManagerCount = users.filter((u) => u.roles.includes("AssetManager")).length;
    const itSupportCount = users.filter((u) => u.roles.includes("ITSupport")).length;
    const auditorCount = users.filter((u) => u.roles.includes("Auditor")).length;
    const staffCount = users.filter((u) => u.roles.includes("Staff")).length;

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
          { id: "all", label: "Tất cả tài khoản", count: users.length },
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
  }, [users]);

  // 3. Lọc danh sách theo từ khóa & Tree filter
  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchUser = item.username.toLowerCase().includes(q);
        const matchName = item.fullName.toLowerCase().includes(q);
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchPhone = item.phone ? item.phone.includes(q) : false;
        const matchDept = item.departmentName ? item.departmentName.toLowerCase().includes(q) : false;
        const matchPos = item.positionName ? item.positionName.toLowerCase().includes(q) : false;

        if (!matchUser && !matchName && !matchEmail && !matchPhone && !matchDept && !matchPos) {
          return false;
        }
      }

      if (selectedFilter && selectedFilter !== "all") {
        const filterStr = String(selectedFilter);

        // Theo trạng thái
        if (filterStr.startsWith("st_")) {
          const st = filterStr.replace("st_", "");
          if (item.status !== st) return false;
        }

        // Theo vai trò
        if (filterStr.startsWith("rl_")) {
          const rl = filterStr.replace("rl_", "");
          if (!item.roles.includes(rl as UserRole)) return false;
        }

        // Theo phòng ban
        if (filterStr.startsWith("dp_")) {
          const dp = filterStr.replace("dp_", "");
          if (item.departmentName !== dp) return false;
        }
      }

      return true;
    });
  }, [users, keyword, selectedFilter]);

  // 4. Phân trang
  const paginatedUsers = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, pageIndex, pageSize]);

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

  const handleSaveForm = (userData: Partial<UserAccount>) => {
    if (userData.id) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userData.id ? ({ ...u, ...userData } as UserAccount) : u))
      );
      toast.success(`Đã cập nhật thông tin tài khoản [${userData.username}]`);
    } else {
      const newUser: UserAccount = {
        id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
        username: userData.username || "",
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        departmentName: userData.departmentName || "Phòng Công nghệ & IT",
        positionName: userData.positionName || "Nhân viên",
        roles: userData.roles || ["Staff"],
        status: userData.status || "ACTIVE",
        mfaEnabled: userData.mfaEnabled || false,
        assignedAssets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      toast.success(`Đã tạo mới tài khoản: @${newUser.username}`);
    }
  };

  const handleToggleLock = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const newStatus = u.status === "LOCKED" ? "ACTIVE" : "LOCKED";
        return { ...u, status: newStatus, updatedAt: new Date().toISOString() };
      })
    );
    if (inspectingUser && inspectingUser.id === id) {
      setInspectingUser((prev) =>
        prev ? { ...prev, status: prev.status === "LOCKED" ? "ACTIVE" : "LOCKED" } : null
      );
    }
  };

  const handleResetPassword = async (id: number) => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;

    const res = await userService.resetPassword(id);
    setResetModalUser(targetUser);
    setResetTempPassword(res.tempPassword);
    setIsResetOpen(true);
  };

  const handleDelete = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
          { name: "Tài khoản", path: "/tai-khoan", badge: filteredUsers.length },
          { name: "Phân quyền (RBAC)", path: "/phan-quyen" },
          { name: "Cấu hình hệ thống", path: "/cau-hinh-he-thong" },
        ]}
        title="Tài khoản người dùng"
        subtitle="Quản lý danh sách tài khoản nhân viên, thiết lập vai trò phân quyền (RBAC) và theo dõi tài sản CNTT bàn giao"
        totalRecords={filteredUsers.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onAddNew={handleAddNew}
        addNewLabel="+ Thêm tài khoản"
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
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

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/40 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">Bảo mật 2FA</p>
              <p className="text-xl font-bold text-cyan-800 dark:text-cyan-300 mt-0.5">
                {stats.mfa}/{stats.total}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-bold">
              ⚡
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
                          paginatedUsers.length > 0 &&
                          paginatedUsers.every((u) => selectedIds.has(u.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(new Set(paginatedUsers.map((u) => u.id)));
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
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-gray-400 dark:text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-3xl mb-2">👤</span>
                          <p className="text-base font-medium">Không tìm thấy tài khoản người dùng phù hợp</p>
                          <p className="text-xs text-gray-400 mt-1">Hãy thử xóa bộ lọc hoặc tìm kiếm từ khóa khác</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => {
                      const isSelected = selectedIds.has(user.id);
                      const statusMeta = USER_STATUS_META[user.status] || USER_STATUS_META.ACTIVE;
                      const assetsCount = (user.assignedAssets || []).length;

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
                                  user.fullName
                                )} text-white flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0`}
                              >
                                {getInitials(user.fullName)}
                              </div>
                              <div>
                                <p
                                  onClick={() => handleOpenDetail(user)}
                                  className="text-xs font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                                >
                                  {user.fullName}
                                </p>
                                <p className="text-[11px] font-mono text-gray-400">
                                  @{user.username}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* EMAIL & PHONE */}
                          <td className="px-4 py-3.5 text-xs">
                            <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                            <p className="text-[11px] text-gray-400">{user.phone || "-"}</p>
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
                              {user.roles.map((r) => {
                                const rMeta = USER_ROLE_META[r] || USER_ROLE_META.Staff;
                                return (
                                  <span
                                    key={r}
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${rMeta.badgeClass}`}
                                  >
                                    {rMeta.label}
                                  </span>
                                );
                              })}
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
                              {statusMeta.label}
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
                              <button
                                onClick={() => handleEdit(user)}
                                className="p-1 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                title="Chỉnh sửa"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleToggleLock(user.id)}
                                className={`p-1 rounded-lg transition ${
                                  user.status === "LOCKED"
                                    ? "text-emerald-600 hover:bg-emerald-50"
                                    : "text-amber-600 hover:bg-amber-50"
                                }`}
                                title={user.status === "LOCKED" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                              >
                                {user.status === "LOCKED" ? "🔓" : "🔒"}
                              </button>
                              <button
                                onClick={() => handleResetPassword(user.id)}
                                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Đặt lại mật khẩu"
                              >
                                🔑
                              </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedUsers.map((user) => {
              const statusMeta = USER_STATUS_META[user.status] || USER_STATUS_META.ACTIVE;
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
                          user.fullName
                        )} text-white flex items-center justify-center text-base font-bold shadow-md flex-shrink-0`}
                      >
                        {getInitials(user.fullName)}
                      </div>
                      <div className="min-w-0">
                        <h4
                          onClick={() => handleOpenDetail(user)}
                          className="font-bold text-sm text-gray-900 dark:text-white hover:text-indigo-600 cursor-pointer truncate"
                        >
                          {user.fullName}
                        </h4>
                        <p className="text-xs font-mono text-gray-400">@{user.username}</p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
                          {user.positionName || "Nhân viên"}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <span>🏢</span>
                      <span className="truncate">{user.departmentName || "Chưa phân bổ"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✉️</span>
                      <span className="truncate">{user.email}</span>
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
                    {user.roles.map((r) => {
                      const rMeta = USER_ROLE_META[r] || USER_ROLE_META.Staff;
                      return (
                        <span
                          key={r}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${rMeta.badgeClass}`}
                        >
                          {rMeta.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* CARD ACTIONS */}
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                    >
                      🔑 Reset MK
                    </button>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-lg transition"
                      >
                        Sửa
                      </button>
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

        {/* MODAL RESET MẬT KHẨU */}
        <ResetPasswordModal
          isOpen={isResetOpen}
          onClose={() => {
            setIsResetOpen(false);
            setResetModalUser(null);
            setResetTempPassword("");
          }}
          user={resetModalUser}
          tempPassword={resetTempPassword}
        />
      </AimsBasePageLayout>
    </>
  );
};

export default UserAccountsPage;
