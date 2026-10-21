import {
  MaintenanceType,
  MaintenanceStatus,
  MaintenancePriority,
} from "../../models/Maintenance/maintenancePlan";

/**
 * Metadata cho Loại bảo trì
 */
export const MAINTENANCE_TYPE_META: Record<
  MaintenanceType,
  { label: string; badgeClass: string; borderClass: string; icon: string; color: string }
> = {
  PREVENTIVE: {
    label: "Bảo trì định kỳ",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    borderClass: "border-blue-500",
    icon: "🔄",
    color: "#3b82f6",
  },
  CORRECTIVE: {
    label: "Sửa chữa sự cố",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    borderClass: "border-amber-500",
    icon: "🔧",
    color: "#f59e0b",
  },
  UPGRADE: {
    label: "Nâng cấp phần cứng",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    borderClass: "border-purple-500",
    icon: "⚡",
    color: "#8b5cf6",
  },
  WARRANTY: {
    label: "Bảo hành chính hãng",
    badgeClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    borderClass: "border-cyan-500",
    icon: "🛡️",
    color: "#06b6d4",
  },
  INSPECTION: {
    label: "Kiểm định & Kiểm kê",
    badgeClass: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800",
    borderClass: "border-teal-500",
    icon: "📋",
    color: "#14b8a6",
  },
};

/**
 * Metadata cho Trạng thái bảo trì
 */
export const MAINTENANCE_STATUS_META: Record<
  MaintenanceStatus,
  { label: string; badgeClass: string; dotClass: string; columnBg: string }
> = {
  SCHEDULED: {
    label: "Chờ thực hiện",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    dotClass: "bg-indigo-500",
    columnBg: "bg-indigo-50/40 dark:bg-indigo-950/10",
  },
  IN_PROGRESS: {
    label: "Đang tiến hành",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    dotClass: "bg-amber-500",
    columnBg: "bg-amber-50/40 dark:bg-amber-950/10",
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dotClass: "bg-emerald-500",
    columnBg: "bg-emerald-50/40 dark:bg-emerald-950/10",
  },
  OVERDUE: {
    label: "Quá hạn xử lý",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    dotClass: "bg-rose-500 animate-pulse",
    columnBg: "bg-rose-50/40 dark:bg-rose-950/10",
  },
  CANCELLED: {
    label: "Đã hủy / Hoãn",
    badgeClass: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    dotClass: "bg-gray-400",
    columnBg: "bg-gray-50 dark:bg-gray-900/40",
  },
};

/**
 * Metadata cho Mức độ ưu tiên
 */
export const MAINTENANCE_PRIORITY_META: Record<
  MaintenancePriority,
  { label: string; badgeClass: string; iconColor: string }
> = {
  LOW: {
    label: "Thấp",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    iconColor: "text-slate-400",
  },
  MEDIUM: {
    label: "Trung bình",
    badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-500",
  },
  HIGH: {
    label: "Cao",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800 font-semibold",
    iconColor: "text-orange-500",
  },
  CRITICAL: {
    label: "Khẩn cấp",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold animate-pulse",
    iconColor: "text-rose-600",
  },
};

/**
 * Format giá tiền VNĐ
 */
export function formatVND(amount?: number | null): string {
  if (amount === undefined || amount === null) return "0 đ";
  return `${amount.toLocaleString("vi-VN")} đ`;
}

/**
 * Format ngày hiển thị DD/MM/YYYY
 */
export function formatDateDisplay(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  } catch {
    return dateStr;
  }
}
