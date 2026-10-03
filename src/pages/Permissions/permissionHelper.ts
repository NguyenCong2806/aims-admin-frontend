import { PermissionAction } from "../../models/Permission/permissionModel";

export interface ActionMeta {
  label: string;
  badgeClass: string;
  icon: string;
}

export const PERMISSION_ACTION_META: Record<PermissionAction, ActionMeta> = {
  VIEW: {
    label: "XEM DỮ LIỆU",
    badgeClass: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
    icon: "👁️",
  },
  CREATE: {
    label: "TẠO MỚI",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    icon: "➕",
  },
  UPDATE: {
    label: "CHỈNH SỬA",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    icon: "✏️",
  },
  DELETE: {
    label: "XÓA / HỦY",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    icon: "🗑️",
  },
  EXPORT: {
    label: "XUẤT DỮ LIỆU",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    icon: "📤",
  },
  APPROVE: {
    label: "PHÊ DUYỆT",
    badgeClass: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    icon: "✅",
  },
  AUDIT: {
    label: "KIỂM TOÁN",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    icon: "📜",
  },
};

export interface RoleColorOption {
  color: string;
  badgeClass: string;
  label: string;
}

export const ROLE_COLOR_PRESETS: RoleColorOption[] = [
  {
    color: "#ef4444",
    badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800",
    label: "Đỏ bảo mật (Red)",
  },
  {
    color: "#6366f1",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    label: "Chàm công nghệ (Indigo)",
  },
  {
    color: "#06b6d4",
    badgeClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    label: "Xanh ngọc IT (Cyan)",
  },
  {
    color: "#a855f7",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    label: "Tím kiểm toán (Purple)",
  },
  {
    color: "#f59e0b",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    label: "Hổ phách quản lý (Amber)",
  },
  {
    color: "#10b981",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    label: "Lục vận hành (Emerald)",
  },
  {
    color: "#64748b",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    label: "Xám tiêu chuẩn (Slate)",
  },
];
