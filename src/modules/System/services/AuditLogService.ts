import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { api } from "../../../library/axios";
import { AuditLogDto, AuditLogFilter } from "../models/AuditLogDto";
import { PagedResult } from "../../base/models/PagedResult";
import { Service } from "../../base/Service";
import { IAuditLogService } from "./IAuditLogService";
import { INITIAL_SYSTEM_LOGS } from "./systemLogMockData";

export class AuditLogService
  extends Service<AuditLogDto, Partial<AuditLogDto>, Partial<AuditLogDto>, string>
  implements IAuditLogService {
  constructor(endpoint = API_ENDPOINTS.AUDIT_LOGS.BASE) {
    super(endpoint);
  }

  /**
   * Lấy danh sách kiểm toán hệ thống theo bộ lọc phân trang
   * Gọi API: GET /audit-logs/paged (hoặc /audit-logs?...)
   */
  async getPaged(filter?: AuditLogFilter): Promise<PagedResult<AuditLogDto>> {
    try {
      const pageIndex = filter?.PageIndex ?? filter?.pageIndex ?? 1;
      const pageSize = filter?.PageSize ?? filter?.pageSize ?? 10;
      const keyword = filter?.Keyword ?? filter?.keyword;

      const params: Record<string, unknown> = {
        ...filter,
        PageIndex: pageIndex,
        PageSize: pageSize,
        pageIndex,
        pageSize,
      };
      if (keyword) {
        params.Keyword = keyword;
        params.keyword = keyword;
      }

      const response = await api.get<PagedResult<AuditLogDto> | AuditLogDto[] | { data?: PagedResult<AuditLogDto> }>(
        `${this.endpoint}/paged`,
        { params }
      );


      const resData = response.data;

      // Nếu API trả về dạng mảng thuần túy
      if (Array.isArray(resData)) {
        return {
          items: resData,
          pagination: {
            pageIndex,
            pageSize,
            totalRecords: resData.length,
            totalPages: Math.ceil(resData.length / pageSize) || 1,
            hasPreviousPage: pageIndex > 1,
            hasNextPage: pageIndex * pageSize < resData.length,
          },
        };
      }

      // Trả về nếu dữ liệu chuẩn PagedResult { items, pagination }
      if (resData && typeof resData === "object" && "items" in resData && Array.isArray(resData.items)) {
        return resData as PagedResult<AuditLogDto>;
      }

      if (resData && typeof resData === "object" && "data" in resData && resData.data) {
        return resData.data as PagedResult<AuditLogDto>;
      }

      return resData as PagedResult<AuditLogDto>;
    } catch (error) {
      console.warn("Audit logs API call fallback to local dataset:", error);
      return this.getLocalMockPaged(filter);
    }
  }

  /**
   * Bộ lọc dự phòng cục bộ khi backend đang khởi động hoặc chưa có seed data
   */
  private getLocalMockPaged(filter?: AuditLogFilter): PagedResult<AuditLogDto> {
    let list: AuditLogDto[] = [...INITIAL_SYSTEM_LOGS];

    const keyword = filter?.Keyword || filter?.keyword;
    if (keyword) {
      const q = keyword.toLowerCase().trim();
      list = list.filter(
        (it) =>
          it.action.toLowerCase().includes(q) ||
          it.tableName.toLowerCase().includes(q) ||
          (it.recordId && it.recordId.toLowerCase().includes(q)) ||
          (it.userName && it.userName.toLowerCase().includes(q)) ||
          (it.ipAddress && it.ipAddress.toLowerCase().includes(q))
      );
    }

    if (filter?.action && filter.action !== "all") {
      list = list.filter((it) => it.action.toUpperCase() === filter.action?.toUpperCase());
    }

    if (filter?.tableName && filter.tableName !== "all") {
      list = list.filter((it) => it.tableName.toLowerCase() === filter.tableName?.toLowerCase());
    }

    if (filter?.userName && filter.userName !== "all") {
      list = list.filter((it) => it.userName === filter.userName);
    }

    if (filter?.dateRange && filter.dateRange !== "all") {
      const now = Date.now();
      list = list.filter((it) => {
        const diffDays = (now - new Date(it.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (filter.dateRange === "today") return diffDays <= 1;
        if (filter.dateRange === "week") return diffDays <= 7;
        if (filter.dateRange === "month") return diffDays <= 30;
        return true;
      });
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const pageIndex = filter?.PageIndex ?? filter?.pageIndex ?? 1;
    const pageSize = filter?.PageSize ?? filter?.pageSize ?? 10;
    const totalRecords = list.length;
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;
    const start = (pageIndex - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return {
      items,
      pagination: {
        pageIndex,
        pageSize,
        totalRecords,
        totalPages,
        hasPreviousPage: pageIndex > 1,
        hasNextPage: pageIndex < totalPages,
      },
    };
  }

  /**
   * Xuất danh sách nhật ký kiểm toán ra tệp CSV (chuẩn UTF-8 BOM cho Excel)
   */
  exportToCsv(items: AuditLogDto[]) {
    const headers = [
      "ID (Guid)",
      "Thời gian (UTC)",
      "Hành động",
      "Bảng dữ liệu",
      "Mã bản ghi (RecordId)",
      "Người thực hiện",
      "User ID",
      "Địa chỉ IP",
      "Dữ liệu cũ (OldData)",
      "Dữ liệu mới (NewData)",
    ];

    const rows = items.map((it) => [
      `"${it.id}"`,
      `"${it.createdAt}"`,
      `"${it.action}"`,
      `"${it.tableName}"`,
      `"${it.recordId || ""}"`,
      `"${it.userName || ""}"`,
      `"${it.userId || ""}"`,
      `"${it.ipAddress || ""}"`,
      `"${(it.oldData || "").replace(/"/g, '""')}"`,
      `"${(it.newData || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Nhat_ky_he_thong_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const auditLogService = new AuditLogService();
