import { AuditLogDto, AuditLogFilter } from "../models/AuditLogDto";
import { PagedResult } from "../../base/models/PagedResult";
import { IService } from "../../base/IService";

export interface IAuditLogService extends IService<AuditLogDto, Partial<AuditLogDto>, Partial<AuditLogDto>, string> {
  getPaged(filter?: AuditLogFilter): Promise<PagedResult<AuditLogDto>>;
  exportToCsv(items: AuditLogDto[]): void;
}
