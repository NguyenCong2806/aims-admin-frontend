import { Computeraudit } from "../models/monitoring";
import { IService } from "../../base/IService";

export interface IMonitoringService
  extends IService<Computeraudit, Partial<Computeraudit>, Partial<Computeraudit>, number> {
  getSystemAuditByCode(assetCode: string): Promise<unknown>;
}
