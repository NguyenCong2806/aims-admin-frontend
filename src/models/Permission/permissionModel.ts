// Model dữ liệu Phân quyền & Vai trò người dùng (RBAC - Role-Based Access Control)

export type PermissionAction = "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "EXPORT" | "APPROVE" | "AUDIT";

export interface PermissionDefinition {
  id: string; // VD: "hardware.view"
  code: string; // "hardware.view"
  name: string; // "Xem danh sách thiết bị"
  module: string; // "Thiết bị phần cứng"
  moduleKey: string; // "hardware"
  action: PermissionAction;
  description: string;
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
