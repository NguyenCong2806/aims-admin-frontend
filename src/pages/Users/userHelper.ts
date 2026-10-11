import { UserRole, UserStatus } from "../../models/User/userAccount";

/**
 * Metadata cho Vai trò người dùng (Roles)
 */
export const USER_ROLE_META: Record<
  UserRole,
  { label: string; badgeClass: string; icon: string; description: string }
> = {
  SuperAdmin: {
    label: "Quản trị tối cao",
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800",
    icon: "🛡️",
    description: "Toàn quyền hệ thống, cấu hình và kiểm toán bảo mật",
  },
  AssetManager: {
    label: "Quản lý Tài sản",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    icon: "📦",
    description: "Nhập xuất, cấp phát, điều chuyển và thanh lý tài sản",
  },
  ITSupport: {
    label: "Kỹ thuật IT / Helpdesk",
    badgeClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    icon: "💻",
    description: "Tiếp nhận bảo trì, giám sát máy trạm và hỗ trợ kỹ thuật",
  },
  Auditor: {
    label: "Kiểm toán & Kế toán",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    icon: "📊",
    description: "Xem nhật ký kiểm toán, báo cáo tài chính và khấu hao",
  },
  DepartmentHead: {
    label: "Trưởng phòng ban",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    icon: "👔",
    description: "Phê duyệt yêu cầu tài sản và quản lý tài sản phòng ban",
  },
  Staff: {
    label: "Nhân viên",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    icon: "👤",
    description: "Nhận bàn giao tài sản và gửi yêu cầu cấp phát",
  },
};

/**
 * Metadata cho Trạng thái tài khoản
 */
export const USER_STATUS_META: Record<
  UserStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  ACTIVE: {
    label: "Đang hoạt động",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
  },
  LOCKED: {
    label: "Đã khóa bảo mật",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-semibold",
    dotClass: "bg-rose-500",
  },
  INACTIVE: {
    label: "Ngừng hoạt động",
    badgeClass: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    dotClass: "bg-gray-400",
  },
  PENDING: {
    label: "Chờ kích hoạt",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    dotClass: "bg-amber-500 animate-pulse",
  },
};

/**
 * Lấy chữ cái viết tắt đại diện cho avatar
 */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Tạo màu gradient ngẫu nhiên cố định theo tên
 */
export function getAvatarColor(name: string): string {
  const colors = [
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-violet-500 to-fuchsia-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
