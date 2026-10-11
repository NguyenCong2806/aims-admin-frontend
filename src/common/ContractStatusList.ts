// Danh sách trạng thái hợp đồng
export const contractStatusList = [
  {
    value: "ACTIVE",
    label: "Đang hiệu lực",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    value: "EXPIRING_SOON",
    label: "Sắp hết hạn (<30 ngày)",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    value: "EXPIRED",
    label: "Đã hết hạn",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  },
  {
    value: "DRAFT",
    label: "Bản nháp",
    badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  {
    value: "TERMINATED",
    label: "Đã thanh lý",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  },
];

export const CONTRACT_STATUSES = contractStatusList;

// Map cấu hình badge & dot trạng thái cho Bảng, Card & Filter
export const STATUS_CONFIG: Record<string, { label: string; bg: string; dot: string }> = {
  ACTIVE: {
    label: "Đang hiệu lực",
    bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
  },
  EXPIRING_SOON: {
    label: "Sắp hết hạn (<30N)",
    bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500 animate-pulse",
  },
  EXPIRED: {
    label: "Đã hết hạn",
    bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500",
  },
  DRAFT: {
    label: "Bản nháp",
    bg: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    dot: "bg-gray-400",
  },
  TERMINATED: {
    label: "Đã thanh lý",
    bg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    dot: "bg-indigo-500",
  },
};
