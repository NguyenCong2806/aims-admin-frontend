import { PaginationFilter } from "../base/PaginationFilter";

/**
 * DTO Nhật ký kiểm toán hệ thống (AuditLog / SystemLog)
 * Phản chiếu trực tiếp từ class C# AuditLogDto:
 * 
 * public class AuditLogDto
 * {
 *     public Guid Id { get; set; }
 *     public string Action { get; set; } = string.Empty;
 *     public string TableName { get; set; } = string.Empty;
 *     public string? RecordId { get; set; }
 *     public string? OldData { get; set; }
 *     public string? NewData { get; set; }
 *     public long? UserId { get; set; }
 *     public string? UserName { get; set; }
 *     public string? IpAddress { get; set; }
 *     public DateTime CreatedAt { get; set; }
 * }
 */
export interface AuditLogDto {
  id: string; // Guid
  action: string; // Hành động (INSERT, UPDATE, DELETE, BATCH_IMPORT...)
  tableName: string; // Tên bảng dữ liệu phát sinh thay đổi
  recordId?: string | null; // Khóa chính / ID bản ghi bị tác động
  oldData?: string | null; // JSON dữ liệu trước khi thay đổi
  newData?: string | null; // JSON dữ liệu sau khi thay đổi
  userId?: number | null; // Mã định danh tài khoản thực hiện (long)
  userName?: string | null; // Tên tài khoản thực hiện
  ipAddress?: string | null; // Địa chỉ IP thực hiện thao tác
  createdAt: string; // Thời điểm phát sinh (DateTime UTC ISO 8601)
}

export type AuditLog = AuditLogDto;

export interface AuditLogFilter extends Partial<PaginationFilter> {
  pageIndex?: number;
  pageSize?: number;
  keyword?: string;
  action?: string;
  tableName?: string;
  userName?: string;
  recordId?: string;
  fromDate?: string;
  toDate?: string;
  dateRange?: "all" | "today" | "week" | "month";
}

