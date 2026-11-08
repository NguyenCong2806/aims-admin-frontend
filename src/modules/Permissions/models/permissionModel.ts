// Model dữ liệu Phân quyền & Vai trò người dùng (RBAC - Role-Based Access Control)

export type PermissionAction =
  | "VIEW"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "EXPORT"
  | "APPROVE"
  | "AUDIT"
  | string;

export interface PermissionDefinition {
  permissionId?: number;
  id: string; // VD: "hardware.view"
  code: string; // "hardware.view"
  name: string; // "Xem danh sách thiết bị"
  description: string;
  module?: string; // Tên hiển thị module, VD: "Quản lý Thiết bị phần cứng"
  moduleKey: string; // Khóa định danh module, VD: "hardware"
  action: PermissionAction;
  displayOrder?: number;
  isActive?: boolean;
}

export interface PermissionModuleGroup {
  moduleKey: string;
  moduleName: string;
  icon: string;
  description: string;
  permissions: PermissionDefinition[];
}

export interface AppRole {
  id: string;
  code: string; // SUPER_ADMIN, ASSET_MANAGER...
  name: string; // "Quản trị tối cao", "Quản lý Tài sản IT"...
  description: string;
  badgeClass: string;
  color: string;
  isSystem: boolean; // Vai trò hệ thống không được xóa
  usersCount: number; // Số lượng người dùng đang có vai trò này
  permissions: string[]; // Danh sách ID các quyền được gán
  createdAt: string;
  updatedAt: string;
}

export interface RoleMember {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  departmentName: string;
  assignedAt: string;
}

/**
 * DTO Quan hệ Phân quyền Vai trò (Bảng trung gian RolePermissions)
 */
export interface RolePermissionDto {
  roleId: string; // Guid / string
  permissionCode: string; // VD: "hardware.create"
  grantedAt?: string; // DateTime ISO
  grantedBy?: number | null; // UserId người cấp
}

/**
 * Request DTO khi cập nhật danh sách quyền cho vai trò
 */
export interface UpdateRolePermissionsRequest {
  roleId: string;
  permissionCodes: string[];
  permissions?: string[];
}

/**
 * Request DTO khi bật / tắt một quyền riêng lẻ cho vai trò
 * Endpoint: POST /api/v1/roles/{roleId}/toggle-permission
 */
export interface TogglePermissionRequest {
  permissionCode: string;
  code?: string;
  permissionId?: number | string;
  isGranted?: boolean;
}

/**
 * DTO cập nhật thông tin quyền hạn
 * Endpoint: PUT /api/v1/permissions/{permissionId}
 */
export interface UpdatePermissionDto {
  name: string;
  description?: string;
  action?: PermissionAction;
  displayOrder?: number;
  isActive?: boolean;
  moduleKey?: string;
  module?: string;
  code?: string;
}

export type RoleDto = AppRole;
export type Role = AppRole;
export type PermissionDto = PermissionDefinition;
export type Permission = PermissionDefinition;
export type PermissionModule = PermissionModuleGroup;

/**
 * Cấu trúc quyền của tài khoản hiện tại trả về từ GET /api/v1/permissions/me
 */
export interface CurrentPermissions {
  roles: string[];
  permissionCodes: string[];
  modules: PermissionModule[];
}

/**
 * Hàm kiểm tra quyền hạn của người dùng hiện tại
 * @param permissions Toàn bộ quyền của tài khoản (CurrentPermissions)
 * @param code Mã quyền cần kiểm tra (Ví dụ: "units.view", "hardware_assets.create")
 * @returns boolean True nếu có quyền hoặc là SUPER_ADMIN
 */
export function hasPermission(
  permissions: CurrentPermissions | null | undefined,
  code: string
): boolean {
  if (!permissions) return false;

  // SUPER_ADMIN được backend cho phép toàn quyền.
  if (
    permissions.roles.some((r) => {
      const upper = String(r).toUpperCase();
      return upper === "SUPER_ADMIN" || upper === "SUPERADMIN" || upper === "ADMIN";
    })
  ) {
    return true;
  }

  const targetCode = code.toLowerCase().trim();
  return (
    permissions.permissionCodes.includes(code) ||
    permissions.permissionCodes.some((c) => c.toLowerCase().trim() === targetCode)
  );
}
