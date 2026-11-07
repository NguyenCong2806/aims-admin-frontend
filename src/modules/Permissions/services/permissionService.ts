import { api } from "../../../library/axios";
import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import {
  AppRole,
  PermissionModuleGroup,
  RoleMember,
  UpdateRolePermissionsRequest,
} from "../models/permissionModel";

const DEFAULT_SYSTEM_ROLES: AppRole[] = [
  {
    id: "1",
    code: "SUPER_ADMIN",
    name: "Quản trị tối cao",
    description: "Toàn quyền cấu hình hệ thống, quản trị người dùng, phân quyền và kiểm toán",
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800",
    color: "#ef4444",
    isSystem: true,
    usersCount: 1,
    permissions: [],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-03-01T00:00:00Z",
  },
  {
    id: "2",
    code: "ASSET_MANAGER",
    name: "Quản lý Tài sản IT",
    description: "Quản lý vòng đời phần cứng, tài nguyên số, cấp phát, điều chuyển và thanh lý",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    color: "#6366f1",
    isSystem: true,
    usersCount: 2,
    permissions: [],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-02-15T00:00:00Z",
  },
  {
    id: "3",
    code: "IT_SUPPORT",
    name: "Kỹ thuật IT / Helpdesk",
    description: "Tiếp nhận bảo trì, sửa chữa phần cứng, đo kiểm thiết bị và hỗ trợ người dùng",
    badgeClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    color: "#06b6d4",
    isSystem: true,
    usersCount: 1,
    permissions: [],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "4",
    code: "AUDITOR",
    name: "Kiểm toán & Kế toán",
    description: "Đối soát tài sản, báo cáo chi phí, khấu hao và kiểm tra nhật ký thay đổi",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    color: "#a855f7",
    isSystem: true,
    usersCount: 1,
    permissions: [],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "5",
    code: "DEPT_HEAD",
    name: "Trưởng phòng ban",
    description: "Theo dõi tài sản phân bổ cho phòng ban và phê duyệt kế hoạch bảo trì",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    color: "#f59e0b",
    isSystem: true,
    usersCount: 2,
    permissions: [],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "6",
    code: "STAFF",
    name: "Nhân viên thông thường",
    description: "Xem thông tin máy tính được cấp phát và yêu cầu sửa chữa cơ bản",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    color: "#64748b",
    isSystem: true,
    usersCount: 3,
    permissions: [],
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export class PermissionService {
  private roles: AppRole[] = [...DEFAULT_SYSTEM_ROLES];
  private modules: PermissionModuleGroup[] = [];

  /**
   * Lấy danh sách toàn bộ Vai trò (Roles) từ máy chủ backend
   * Endpoint: GET /api/v1/roles
   */
  async getRoles(): Promise<AppRole[]> {
    try {
      const response = await api.get<
        AppRole[] | { data?: AppRole[]; items?: AppRole[] }
      >(API_ENDPOINTS.ROLES.BASE);
      const raw = response.data;
      let rolesList: AppRole[] = [];

      if (Array.isArray(raw)) {
        rolesList = raw;
      } else if (raw && typeof raw === "object") {
        if ("data" in raw && Array.isArray(raw.data)) {
          rolesList = raw.data;
        } else if ("items" in raw && Array.isArray(raw.items)) {
          rolesList = raw.items;
        }
      }

      if (rolesList.length > 0) {
        this.roles = rolesList;
        return rolesList;
      }
    } catch (error) {
      console.warn("Không thể tải vai trò từ máy chủ (GET /roles), sử dụng cấu hình mặc định:", error);
    }
    return [...this.roles];
  }

  /**
   * Lấy danh sách toàn bộ Phân hệ và Quyền hạn từ máy chủ backend
   * Endpoint: GET /api/v1/permissions/modules
   */
  async getModules(): Promise<PermissionModuleGroup[]> {
    try {
      const response = await api.get<{
        data?: PermissionModuleGroup[];
        isSuccess?: boolean;
        message?: string;
        statusCode?: number;
      } | PermissionModuleGroup[]>(API_ENDPOINTS.PERMISSIONS.MODULES);

      const raw = response.data;
      let modulesList: PermissionModuleGroup[] = [];

      if (Array.isArray(raw)) {
        modulesList = raw;
      } else if (raw && typeof raw === "object" && "data" in raw && Array.isArray(raw.data)) {
        modulesList = raw.data;
      }

      this.modules = modulesList;
      return modulesList;
    } catch (error) {
      console.error("Lỗi khi tải danh sách phân hệ quyền từ backend:", error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết 1 vai trò
   * Endpoint: GET /api/v1/roles/{id}
   */
  async getRoleById(roleId: string): Promise<AppRole | null> {
    try {
      const response = await api.get<AppRole | { data?: AppRole }>(
        `${API_ENDPOINTS.ROLES.BASE}/${roleId}`
      );
      const raw = response.data;
      const data =
        raw && typeof raw === "object" && "data" in raw && raw.data
          ? raw.data
          : raw;
      if (data && typeof data === "object") return data as AppRole;
    } catch {
      // Fallback
    }
    const role = this.roles.find((r) => r.id === roleId);
    return role ? { ...role } : null;
  }

  /**
   * Cập nhật danh sách quyền cho vai trò (Gán / Thu hồi quyền)
   * Endpoint: PUT /api/v1/roles/{roleId}/permissions
   */
  async updateRolePermissions(
    roleId: string,
    permissions: string[]
  ): Promise<AppRole> {
    try {
      const payload: UpdateRolePermissionsRequest = {
        roleId,
        permissionCodes: permissions,
      };
      const response = await api.put<AppRole | { data?: AppRole }>(
        API_ENDPOINTS.ROLES.PERMISSIONS(roleId),
        payload
      );
      const raw = response.data;
      const data =
        raw && typeof raw === "object" && "data" in raw && raw.data
          ? (raw.data as AppRole)
          : (raw as AppRole);
      if (data && typeof data === "object" && data.id) {
        const idx = this.roles.findIndex((r) => r.id === roleId);
        if (idx !== -1) this.roles[idx] = data;
        return data;
      }
    } catch (e) {
      console.warn("Update role permissions API fallback to local state:", e);
    }

    const index = this.roles.findIndex((r) => r.id === roleId);
    if (index === -1) throw new Error("Không tìm thấy vai trò");

    this.roles[index] = {
      ...this.roles[index],
      permissions,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.roles[index] };
  }

  /**
   * Bật/Tắt 1 quyền đơn lẻ cho 1 vai trò
   */
  async togglePermission(
    roleId: string,
    permissionId: string
  ): Promise<AppRole> {
    const role = this.roles.find((r) => r.id === roleId);
    if (!role) throw new Error("Không tìm thấy vai trò");

    let updatedPermissions: string[];
    if (role.permissions.includes(permissionId)) {
      updatedPermissions = role.permissions.filter((p) => p !== permissionId);
    } else {
      updatedPermissions = [...role.permissions, permissionId];
    }

    return this.updateRolePermissions(roleId, updatedPermissions);
  }

  /**
   * Bật hoặc tắt toàn bộ quyền trong 1 phân hệ cho vai trò
   */
  async toggleModulePermissions(
    roleId: string,
    moduleKey: string,
    grantAll: boolean
  ): Promise<AppRole> {
    const role = this.roles.find((r) => r.id === roleId);
    if (!role) throw new Error("Không tìm thấy vai trò");

    const mod = this.modules.find((m) => m.moduleKey === moduleKey);
    if (!mod) throw new Error("Không tìm thấy phân hệ");

    const modulePermIds = mod.permissions.map((p) => p.id || p.code);
    let updatedPermissions: string[];

    if (grantAll) {
      updatedPermissions = Array.from(
        new Set([...role.permissions, ...modulePermIds])
      );
    } else {
      updatedPermissions = role.permissions.filter(
        (p) => !modulePermIds.includes(p)
      );
    }

    return this.updateRolePermissions(roleId, updatedPermissions);
  }

  /**
   * Tạo vai trò tùy biến mới
   * Endpoint: POST /api/v1/roles
   */
  async createRole(
    data: Omit<
      AppRole,
      "id" | "isSystem" | "usersCount" | "createdAt" | "updatedAt"
    >
  ): Promise<AppRole> {
    try {
      const response = await api.post<AppRole | { data?: AppRole }>(
        API_ENDPOINTS.ROLES.BASE,
        data
      );
      const raw = response.data;
      const resData =
        raw && typeof raw === "object" && "data" in raw && raw.data
          ? (raw.data as AppRole)
          : (raw as AppRole);
      if (resData && typeof resData === "object" && resData.id) {
        this.roles.push(resData);
        return resData;
      }
    } catch {
      // Fallback
    }

    const newRole: AppRole = {
      ...data,
      id: `role-${Date.now()}`,
      isSystem: false,
      usersCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.roles.push(newRole);
    return newRole;
  }

  /**
   * Xóa vai trò tùy biến
   * Endpoint: DELETE /api/v1/roles/{id}
   */
  async deleteRole(roleId: string): Promise<boolean> {
    const role = this.roles.find((r) => r.id === roleId);
    if (role?.isSystem) {
      throw new Error("Không thể xóa vai trò mặc định của hệ thống!");
    }

    try {
      await api.delete(`${API_ENDPOINTS.ROLES.BASE}/${roleId}`);
    } catch {
      // Fallback
    }

    const prevLen = this.roles.length;
    this.roles = this.roles.filter((r) => r.id !== roleId);
    return this.roles.length < prevLen;
  }

  /**
   * Lấy danh sách thành viên thuộc vai trò
   * Endpoint: GET /api/v1/roles/{id}/members
   */
  async getRoleMembers(roleIdOrCode: string | number): Promise<RoleMember[]> {
    try {
      const response = await api.get<RoleMember[] | { data?: RoleMember[] }>(
        API_ENDPOINTS.ROLES.MEMBERS(roleIdOrCode)
      );
      const raw = response.data;
      if (Array.isArray(raw)) return raw;
      if (
        raw &&
        typeof raw === "object" &&
        "data" in raw &&
        Array.isArray(raw.data)
      ) {
        return raw.data;
      }
    } catch {
      // Fallback
    }
    return [];
  }

  /**
   * Xuất ma trận phân quyền ra file CSV
   */
  exportMatrixCsv(roles: AppRole[]) {
    const headers = [
      "Mã phân hệ",
      "Tên phân hệ",
      "Mã quyền",
      "Tên quyền hạn",
      ...roles.map((r) => `"${r.name} (${r.code})"`),
    ];

    const rows: string[][] = [];

    this.modules.forEach((mod) => {
      mod.permissions.forEach((perm) => {
        const permKey = perm.id || perm.code;
        const row = [
          `"${mod.moduleKey}"`,
          `"${mod.moduleName}"`,
          `"${permKey}"`,
          `"${perm.name}"`,
          ...roles.map((r) =>
            r.permissions.includes(permKey) ? '"Có (1)"' : '"Không (0)"'
          ),
        ];
        rows.push(row);
      });
    });

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Ma_tran_Phan_quyen_RBAC_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const permissionService = new PermissionService();
