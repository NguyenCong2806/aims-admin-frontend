/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseFormSetError, UseFormClearErrors } from "react-hook-form";

// Helper chuyển mọi kiểu dữ liệu (Date, string "DD/MM/YYYY", string ISO) về timestamp
const toTimestamp = (val: any): number | null => {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val.getTime();
  if (Array.isArray(val) && val[0] instanceof Date) return val[0].getTime();

  if (typeof val === "string") {
    const parts = val.trim().split(/[/.-]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d.getTime();
    }
    const fallback = new Date(val);
    if (!isNaN(fallback.getTime())) return fallback.getTime();
  }
  return null;
};

export const checkDateValidity = (
  startDateRaw: any,
  expiryDateRaw: any,
  setError: UseFormSetError<any>,
  clearErrors: UseFormClearErrors<any>
): boolean => {
  const startTime = toTimestamp(startDateRaw);
  const expiryTime = toTimestamp(expiryDateRaw);

  // Chỉ so sánh khi cả 2 ngày đều đã có giá trị
  if (startTime !== null && expiryTime !== null) {
    if (expiryTime <= startTime) {
      setError("expirydate", {
        type: "manual",
        message: "Ngày hết hạn phải sau ngày mua / bắt đầu.",
      });
      return false;
    } else {
      clearErrors("expirydate");
      return true;
    }
  }

  return true;
};