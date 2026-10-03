// Model thông tin Tài khoản người dùng (User Account & Permissions)

export type UserRole =
  | "SuperAdmin"       // Quản trị viên tối cao
  | "AssetManager"     // Quản lý tài sản IT
  | "ITSupport"        // Kỹ thuật viên IT / Helpdesk
  | "Auditor"          // Kiểm toán & Kế toán
  | "DepartmentHead"   // Trưởng phòng ban
  | "Staff";           // Nhân viên

export type UserStatus =
  | "ACTIVE"    // Đang hoạt động
  | "LOCKED"    // Đã khóa bảo mật
  | "INACTIVE"  // Ngừng hoạt động
  | "PENDING";  // Chờ kích hoạt

export interface AssignedAssetSummary {
  assetId: string;
  assetCode: string;
  assetName: string;
  categoryName: string;
  assignedDate: string;
}

export interface UserAccount {
  id: number;
  username: string; // Tên đăng nhập (VD: hoang.it, lan.hr)
  fullName: string; // Họ và tên đầy đủ
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;

  // Phòng ban & Vị trí
  departmentId?: number | null;
  departmentName?: string | null;
  positionId?: number | null;
  positionName?: string | null;

  // Vai trò & Phân quyền
  roles: UserRole[];

  // Trạng thái & Bảo mật
  status: UserStatus;
  mfaEnabled: boolean; // Xác thực 2 yếu tố (2FA)

  // Kiểm toán đăng nhập
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;

  // Danh mục tài sản đang được cấp phát sử dụng
  assignedAssets?: AssignedAssetSummary[];

  createdAt: string;
  updatedAt: string;
}

export interface UserAccountFilter {
  keyword?: string;
  role?: string;
  status?: string;
  department?: string;
  mfa?: "all" | "enabled" | "disabled";
}
