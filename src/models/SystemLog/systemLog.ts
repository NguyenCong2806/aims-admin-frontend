// Interface phản chiếu thực thể C# SystemLog / AuditLog (Nhật ký hệ thống)

export type SystemLogAction = "INSERT" | "UPDATE" | "DELETE" | string;

export interface SystemLog {
  id: string; // Guid
  action: SystemLogAction; // INSERT / UPDATE / DELETE
  tableName: string; // Tên bảng bị thay đổi (VD: hardware_assets, digital_assets)
  recordId?: string | null; // ID của record bị thay đổi
  oldData?: string | null; // Dữ liệu JSON trước khi thay đổi
  newData?: string | null; // Dữ liệu JSON sau khi thay đổi
  userId?: number | null; // User thực hiện thao tác
  userName?: string | null; // Tên người dùng thực hiện
  ipAddress?: string | null; // IP / Client
  createdAt: string; // DateTime UTC (ISO 8601)
}

export interface SystemLogFilter {
  pageIndex: number;
  pageSize: number;
  keyword?: string;
  action?: string;
  tableName?: string;
  userName?: string;
  dateRange?: "all" | "today" | "week" | "month";
}

export interface SystemLogFieldDiff {
  field: string;
  fieldLabel: string;
  oldValue: unknown;
  newValue: unknown;
  isChanged: boolean;
  type: "added" | "removed" | "modified" | "unchanged";
}
