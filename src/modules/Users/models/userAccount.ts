// Model thông tin Tài khoản người dùng (User Account & Permissions)

export type UserRole =
  | "SuperAdmin"
  | "SUPER_ADMIN"
  | "AssetManager"
  | "ASSET_MANAGER"
  | "ITSupport"
  | "IT_SUPPORT"
  | "Auditor"
  | "AUDITOR"
  | "DepartmentHead"
  | "DEPARTMENT_HEAD"
  | "Staff"
  | "STAFF"
  | string;

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
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  password?: string;
  passwordhash?: string;

  // Phòng ban & Vị trí
  departmentId?: number | null;
  departmentid?: number | null;
  departmentName?: string | null;
  positionId?: number | null;
  positionid?: number | null;
  positionName?: string | null;

  // Vai trò & Phân quyền
  roles?: UserRole[];
  rolenames?: string[];
  roleids?: number[];

  // Trạng thái & Bảo mật
  status?: UserStatus;
  isActive?: boolean;
  mfaEnabled?: boolean; // Xác thực 2 yếu tố (2FA)

  // Kiểm toán đăng nhập
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;

  // Danh mục tài sản đang được cấp phát sử dụng
  assignedAssets?: AssignedAssetSummary[];

  createdAt?: string;
  updatedAt?: string;
  totalCount?: number;
}

export interface CreateUserAccountDto {
  username: string; // Tên đăng nhập (VD: hoang.it, lan.hr)
  fullName: string; // Họ và tên đầy đủ
  email: string;
  passwordhash: string;
  phoneNumber?: string | null;
  phonennumber?: string | null;
  avatarUrl?: string | null;
  avatarurl?: string | null;
  // Phòng ban & Vị trí
  departmentid?: number;
  positionid?: number | null;
  // Vai trò & Phân quyền
  isActive: boolean;
  roleids: number[];
}

export interface UserAccountFilter {
  keyword?: string;
  role?: string;
  status?: string;
  department?: string;
  mfa?: "all" | "enabled" | "disabled";
}

export interface UpdateUserAccountDto {
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  phonennumber?: string | null;
  avatarUrl?: string | null;
  avatarurl?: string | null;
  passwordhash?: string;
  // Phòng ban & Vị trí
  departmentid?: number;
  positionid?: number | null;
  // Vai trò & Phân quyền
  isActive: boolean;
  roleids: number[];
}

export interface UserAccountView {
  username: string;
  fullName: string;
  email: string;
  phonennumber?: string | null;
  avatarurl?: string | null;
  // Phòng ban & Vị trí
  departmentname?: string;
  positionname?: string;
  // Vai trò & Phân quyền
  isActive: boolean;
  rolenames: Array<string>[];
}

export interface UserChangePassword {
  passwordhash: string;
}

export interface ChangeAccountPasswordDto {
  newPassword: string;
  NewPassword?: string;
}
