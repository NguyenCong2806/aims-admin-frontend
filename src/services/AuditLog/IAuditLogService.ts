import { AuditLogDto, AuditLogFilter } from "../../models/AuditLog/AuditLogDto";
import { PagedResult } from "../../models/base/PagedResult";
import { IService } from "../IService";

export interface IAuditLogService extends IService<AuditLogDto, Partial<AuditLogDto>, Partial<AuditLogDto>, string> {
  getPaged(filter?: AuditLogFilter): Promise<PagedResult<AuditLogDto>>;
  exportToCsv(items: AuditLogDto[]): void;
}
