/* eslint-disable @typescript-eslint/no-empty-object-type */
import { PagedResult } from "../../models/base/PagedResult";
import { PaginationFilter } from "../../models/base/PaginationFilter";
import { ComputerAuditDetailDto, SoftwareDto } from "../../models/ComputerAudit/ComputerAuditDetailDto";
import { IService } from "../IService";

export interface IComputerAuditService<DeviceSystemAuditDto, CreateDeviceSystemAudit, UpdateDeviceSystemAudit, TId = string>
    extends IService<DeviceSystemAuditDto, CreateDeviceSystemAudit, UpdateDeviceSystemAudit, TId> {
    getAllParams(params?: PaginationFilter): Promise<PagedResult<DeviceSystemAuditDto>>;
    getByDetail(id: string): Promise<ComputerAuditDetailDto>;
    getListInstalledSoftware(id: string): Promise<SoftwareDto[]>;
}