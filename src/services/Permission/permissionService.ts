import {
  AppRole,
  PermissionModuleGroup,
} from "../../models/Permission/permissionModel";
import {
  INITIAL_APP_ROLES,
  PERMISSION_MODULES,
} from "./permissionMockData";
import { INITIAL_USER_ACCOUNTS } from "../Users/userMockData";
import { UserRole } from "../../models/User/userAccount";

class PermissionService {
  private roles: AppRole[] = [...INITIAL_APP_ROLES];
  private modules: PermissionModuleGroup[] = [...PERMISSION_MODULES];

  async getRoles(): Promise<AppRole[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return [...this.roles];
  }

  async getModules(): Promise<PermissionModuleGroup[]> {
    return [...this.modules];
  }

  async getRoleById(roleId: string): Promise<AppRole | null> {
    const role = this.roles.find((r) => r.id === roleId);
    return role ? { ...role } : null;
  }

  /**
   * Cập nhật danh sách quyền cho vai trò
   */
  async updateRolePermissions(roleId: string, permissions: string[]): Promise<AppRole> {
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
  async togglePermission(roleId: string, permissionId: string): Promise<AppRole> {
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

    const modulePermIds = mod.permissions.map((p) => p.id);
    let updatedPermissions: string[];

    if (grantAll) {
      updatedPermissions = Array.from(new Set([...role.permissions, ...modulePermIds]));
    } else {
      updatedPermissions = role.permissions.filter((p) => !modulePermIds.includes(p));
    }

    return this.updateRolePermissions(roleId, updatedPermissions);
  }

  /**
   * Tạo vai trò tùy biến mới
   */
  async createRole(data: Omit<AppRole, "id" | "isSystem" | "usersCount" | "createdAt" | "updatedAt">): Promise<AppRole> {
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
   */
  async deleteRole(roleId: string): Promise<boolean> {
    const role = this.roles.find((r) => r.id === roleId);
    if (role?.isSystem) {
      throw new Error("Không thể xóa vai trò mặc định của hệ thống!");
    }
    const prevLen = this.roles.length;
    this.roles = this.roles.filter((r) => r.id !== roleId);
    return this.roles.length < prevLen;
  }

  /**
   * Lấy danh sách thành viên thuộc vai trò
   */
  getRoleMembers(roleCode: string) {
    return INITIAL_USER_ACCOUNTS.filter((u) => u.roles.includes(roleCode as UserRole));
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
        const row = [
          `"${mod.moduleKey}"`,
          `"${mod.moduleName}"`,
          `"${perm.id}"`,
          `"${perm.name}"`,
          ...roles.map((r) => (r.permissions.includes(perm.id) ? '"Có (1)"' : '"Không (0)"')),
        ];
        rows.push(row);
      });
    });

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

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
