import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { Service } from "../../base/Service";
import { IComputerAuditService } from "./IComputerAuditSerice";
import { CreateDeviceSystemAudit, UpdateDeviceSystemAudit } from "../models/Computeraudit";
import { PagedResult } from "../../base/models/PagedResult";
import { PaginationFilter } from "../../base/models/PaginationFilter";
import { api } from "../../../library/axios";
import { ComputerAuditDetailDto, SoftwareDto } from "../models/ComputerAuditDetailDto";
import { DeviceSystemAuditDto } from "../models/DeviceSystemAuditDto";

export class ComputerAuditService extends Service<DeviceSystemAuditDto, CreateDeviceSystemAudit, UpdateDeviceSystemAudit, string>
    implements IComputerAuditService<DeviceSystemAuditDto, CreateDeviceSystemAudit, UpdateDeviceSystemAudit, string> {

    constructor(endpoint: string = API_ENDPOINTS.DEVICE.COMPUTER_AUDIT) {
        super(endpoint);
    }
    async getByDetail(id: string): Promise<ComputerAuditDetailDto> {
        const response = await api.get<ComputerAuditDetailDto | { data?: ComputerAuditDetailDto }>(
            `${this.endpoint}/details/${id}`
        );
        const data = response.data;
        if (data && typeof data === "object" && "data" in data) {
            return (data as { data: ComputerAuditDetailDto }).data;
        }
        return data as ComputerAuditDetailDto;
    }
    async getListInstalledSoftware(id: string): Promise<SoftwareDto[]> {
        const response = await api.get<SoftwareDto[] | { data?: SoftwareDto[] }>(
            `${this.endpoint}/detail_softwares/${id}`
        );
        const data = response.data;
        if (data && typeof data === "object" && "data" in data) {
            return (data as { data: SoftwareDto[] }).data;
        }
        return data as SoftwareDto[];
    }

    async getAllParams(
        params?: PaginationFilter
    ): Promise<PagedResult<DeviceSystemAuditDto>> {
        const response = await api.get<PagedResult<DeviceSystemAuditDto>>(
            `${this.endpoint}/pageds`,
            { params }
        );

        return response.data;
    }
}