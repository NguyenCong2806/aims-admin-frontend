import { API_ENDPOINTS } from "../../common/apiEndpoints";
import { Service } from "../Service";
import { IComputerAuditService } from "./IComputerAuditSerice";
import { CreateDeviceSystemAudit, UpdateDeviceSystemAudit } from "../../models/ComputerAudit/Computeraudit";
import { PagedResult } from "../../models/base/PagedResult";
import { PaginationFilter } from "../../models/base/PaginationFilter";
import { api } from "../../library/axios";
import { ComputerAuditDetailDto, SoftwareDto } from "../../models/ComputerAudit/ComputerAuditDetailDto";
import { DeviceSystemAuditDto } from "../../models/Monitoring/DeviceSystemAuditDto";

export class ComputerAuditService extends Service<DeviceSystemAuditDto, CreateDeviceSystemAudit, UpdateDeviceSystemAudit, string>
    implements IComputerAuditService<DeviceSystemAuditDto, CreateDeviceSystemAudit, UpdateDeviceSystemAudit, string> {

    constructor(endpoint: string = API_ENDPOINTS.DEVICE.COMPUTER_AUDIT) {
        super(endpoint);
    }
    async getByDetail(id: string): Promise<ComputerAuditDetailDto> {
        const response = await api.get<any>(
            `${this.endpoint}/details/${id}`
        );
        return response.data?.data ?? response.data;
    }
    async getListInstalledSoftware(id: string): Promise<SoftwareDto[]> {
        const response = await api.get<any>(
            `${this.endpoint}/detail_softwares/${id}`
        );
        return response.data?.data ?? response.data;
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