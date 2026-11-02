/**
 * Helper định dạng tiền tệ VNĐ (hoặc loại tiền tệ tuỳ chọn)
 */
export const formatCurrency = (
  amount?: number | string | null,
  currency: string = "VND"
): string => {
  if (amount === undefined || amount === null || amount === "") return "Chưa cập nhật";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Chưa cập nhật";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(num);
};

