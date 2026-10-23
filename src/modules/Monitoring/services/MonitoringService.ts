import { Service } from "../../base/Service";
import { Computeraudit } from "../models/monitoring";
import { IMonitoringService } from "./IMonitoringService";
import { API_ENDPOINTS } from "../../../common/ApiEndpoints";

export class MonitoringService
  extends Service<Computeraudit, Partial<Computeraudit>, Partial<Computeraudit>, number>
  implements IMonitoringService
{
  constructor(endpoint: string = API_ENDPOINTS.DEVICE.COMPUTER_AUDIT) {
    super(endpoint);
  }

  async getSystemAuditByCode(_assetCode: string): Promise<unknown> {
    return null;
  }
}

export const monitoringService = new MonitoringService();
