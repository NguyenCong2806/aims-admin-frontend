import { SystemLogFieldDiff } from "../../models/SystemLog/systemLog";

/**
 * Từ điển tên bảng thân thiện tiếng Việt & màu sắc
 */
export const TABLE_METADATA: Record<
  string,
  { label: string; module: string; color: string; bg: string }
> = {
  hardware_assets: {
    label: "Thiết bị phần cứng",
    module: "Tài sản IT",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  },
  digital_assets: {
    label: "Tài nguyên số",
    module: "Tài sản IT",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
  },
  workstation_monitoring: {
    label: "Giám sát máy trạm",
    module: "Tài sản IT",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  },
  brands: {
    label: "Hãng sản xuất",
    module: "Danh mục",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  },
  departments: {
    label: "Phòng ban",
    module: "Tổ chức",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  },
  users: {
    label: "Tài khoản người dùng",
    module: "Hệ thống",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
  suppliers: {
    label: "Nhà cung cấp",
    module: "Đối tác",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  },
  locations: {
    label: "Địa điểm & Vị trí",
    module: "Tổ chức",
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  },
  cost_centers: {
    label: "Trung tâm chi phí",
    module: "Tổ chức",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  },
  asset_categories: {
    label: "Danh mục tài sản",
    module: "Danh mục",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
  },
  asset_statuses: {
    label: "Trạng thái tài sản",
    module: "Danh mục",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  },
};

/**
 * Từ điển tên trường thân thiện tiếng Việt
 */
export const FIELD_LABELS: Record<string, string> = {
  id: "ID Bản ghi",
  assetCode: "Mã tài sản",
  name: "Tên tài sản / Tên đối tượng",
  model: "Mã Model",
  serialNumber: "Số Serial / Service Tag",
  barcode: "Mã vạch Barcode",
  categoryId: "ID Danh mục",
  categoryName: "Tên danh mục",
  statusId: "ID Trạng thái",
  statusName: "Trạng thái",
  brandId: "ID Hãng",
  brandName: "Hãng sản xuất",
  supplierId: "ID Nhà cung cấp",
  supplierName: "Nhà cung cấp",
  locationId: "ID Địa điểm",
  locationName: "Vị trí / Địa điểm",
  departmentId: "ID Phòng ban",
  departmentName: "Phòng ban sử dụng",
  purchasePrice: "Giá mua (VNĐ)",
  purchaseDate: "Ngày mua",
  effectiveDate: "Ngày bắt đầu sử dụng",
  warrantyMonths: "Thời gian bảo hành (tháng)",
  description: "Mô tả / Ghi chú",
  cpuName: "Vi xử lý (CPU)",
  ramTotalGB: "Tổng dung lượng RAM (GB)",
  ramUsedGB: "RAM đã sử dụng (GB)",
  osName: "Hệ điều hành (OS)",
  osLicenseStatus: "Bản quyền OS",
  userName: "Tên đăng nhập",
  email: "Địa chỉ Email",
  role: "Vai trò / Quyền",
  code: "Mã định danh",
  createdAt: "Thời điểm tạo",
  updatedAt: "Thời điểm cập nhật",
};

/**
 * Trả về thông tin hiển thị của bảng
 */
export function getTableInfo(tableName: string) {
  const normalized = tableName.toLowerCase().trim();
  return (
    TABLE_METADATA[normalized] || {
      label: tableName,
      module: "Khác",
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    }
  );
}

/**
 * Lấy nhãn tiếng Việt cho field
 */
export function getFieldLabel(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  // Chuyển camelCase sang Text dễ nhìn
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

/**
 * Safe parse JSON string
 */
export function safeParseJson(jsonString?: string | null): Record<string, unknown> | null {
  if (!jsonString) return null;
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Format giá trị để hiển thị
 */
export function formatValueForDisplay(val: unknown): string {
  if (val === null || val === undefined) return "(Trống)";
  if (typeof val === "boolean") return val ? "Có (True)" : "Không (False)";
  if (typeof val === "number") {
    // Nếu là giá tiền lớn
    if (val >= 100000 && val % 1000 === 0) {
      return `${val.toLocaleString("vi-VN")} đ`;
    }
    return val.toLocaleString("vi-VN");
  }
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

/**
 * So sánh oldData và newData để trích xuất danh sách FieldDiff
 */
export function computeFieldDiffs(
  oldDataJson?: string | null,
  newDataJson?: string | null,
  action: string = "UPDATE"
): SystemLogFieldDiff[] {
  const oldObj = safeParseJson(oldDataJson) || {};
  const newObj = safeParseJson(newDataJson) || {};

  const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));
  const diffs: SystemLogFieldDiff[] = [];

  for (const key of allKeys) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    let type: "added" | "removed" | "modified" | "unchanged" = "unchanged";
    let isChanged = false;

    if (action === "INSERT") {
      type = "added";
      isChanged = true;
    } else if (action === "DELETE") {
      type = "removed";
      isChanged = true;
    } else {
      // UPDATE
      const oldStr = JSON.stringify(oldVal ?? null);
      const newStr = JSON.stringify(newVal ?? null);

      if (!(key in oldObj) && key in newObj) {
        type = "added";
        isChanged = true;
      } else if (key in oldObj && !(key in newObj)) {
        type = "removed";
        isChanged = true;
      } else if (oldStr !== newStr) {
        type = "modified";
        isChanged = true;
      }
    }

    diffs.push({
      field: key,
      fieldLabel: getFieldLabel(key),
      oldValue: oldVal,
      newValue: newVal,
      isChanged,
      type,
    });
  }

  // Đưa các trường bị thay đổi lên đầu
  return diffs.sort((a, b) => {
    if (a.isChanged && !b.isChanged) return -1;
    if (!a.isChanged && b.isChanged) return 1;
    return a.field.localeCompare(b.field);
  });
}

/**
 * Tạo câu tóm tắt ngắn gọn sự thay đổi
 */
export function getChangeSummary(
  action: string,
  oldDataJson?: string | null,
  newDataJson?: string | null
): string {
  const upperAction = action.toUpperCase();
  if (upperAction === "INSERT") {
    const newObj = safeParseJson(newDataJson);
    const count = newObj ? Object.keys(newObj).length : 0;
    return `Tạo mới bản ghi (${count} thuộc tính)`;
  }
  if (upperAction === "DELETE") {
    const oldObj = safeParseJson(oldDataJson);
    const name = oldObj?.name || oldObj?.assetCode || oldObj?.code;
    return name ? `Xóa bản ghi "${name}"` : "Đã xóa toàn bộ bản ghi khỏi hệ thống";
  }

  // UPDATE
  const diffs = computeFieldDiffs(oldDataJson, newDataJson, "UPDATE");
  const changed = diffs.filter((d) => d.isChanged);

  if (changed.length === 0) {
    return "Không có trường nào thay đổi giá trị";
  }

  const topChangedNames = changed
    .slice(0, 3)
    .map((c) => c.fieldLabel)
    .join(", ");

  const remaining = changed.length - 3;
  if (remaining > 0) {
    return `Sửa ${changed.length} trường: ${topChangedNames} (+${remaining} trường khác)`;
  }
  return `Sửa ${changed.length} trường: ${topChangedNames}`;
}

/**
 * Format thời gian đẹp mắt (vừa hiển thị tương đối vừa có format chuẩn)
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay === 1) return "Hôm qua";
    if (diffDay < 7) return `${diffDay} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}
