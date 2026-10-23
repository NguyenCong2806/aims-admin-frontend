import { PagedResult } from "../../base/models/PagedResult";
import { PaginationFilter } from "../../base/models/PaginationFilter";
import { ComputerAuditDetailDto, SoftwareDto } from "../models/ComputerAuditDetailDto";
import { IService } from "../../base/IService";

export interface IComputerAuditService<DeviceSystemAuditDto, CreateDeviceSystemAudit, UpdateDeviceSystemAudit, TId = string>
    extends IService<DeviceSystemAuditDto, CreateDeviceSystemAudit, UpdateDeviceSystemAudit, TId> {
    getAllParams(params?: PaginationFilter): Promise<PagedResult<DeviceSystemAuditDto>>;
    getByDetail(id: string): Promise<ComputerAuditDetailDto>;
    getListInstalledSoftware(id: string): Promise<SoftwareDto[]>;
}