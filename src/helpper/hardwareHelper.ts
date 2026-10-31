export interface WarrantyInfo {
  text: string;
  isExpired: boolean;
  labelColor: string;
}

/**
 * Helper tính thời hạn bảo hành thiết bị
 */
export const getWarrantyInfo = (
  purchaseDateStr?: string | Date | null,
  warrantyMonths?: number | null
): WarrantyInfo => {
  if (!purchaseDateStr || !warrantyMonths) {
    return { text: "Không có BH", isExpired: true, labelColor: "text-gray-400" };
  }
  const pDate = new Date(purchaseDateStr);
  if (isNaN(pDate.getTime())) {
    return { text: "Không có BH", isExpired: true, labelColor: "text-gray-400" };
  }
  const expDate = new Date(pDate.setMonth(pDate.getMonth() + warrantyMonths));
  const now = new Date();
  const diffMonths = Math.round(
    (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  if (expDate < now) {
    return {
      text: "Đã hết hạn BH",
      isExpired: true,
      labelColor: "text-rose-600 dark:text-rose-400 font-semibold",
    };
  }
  return {
    text: `Còn ${diffMonths} tháng (${expDate.toLocaleDateString("vi-VN")})`,
    isExpired: false,
    labelColor: "text-emerald-600 dark:text-emerald-400 font-medium",
  };
};

/**
 * Helper màu sắc trạng thái thiết bị
 */
export const getStatusBadge = (statusName?: string | null): string => {
  const s = statusName || "Chưa xác định";
  if (s.includes("Đang sử dụng")) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60";
  }
  if (s.includes("Sẵn sàng")) {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/60";
  }
  if (s.includes("bảo trì") || s.includes("Sửa chữa")) {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60";
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200/60";
};

/**
 * Helper sinh mã GUID (UUID v4)
 */
export const generateGuid = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

