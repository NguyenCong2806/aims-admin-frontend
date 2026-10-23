import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { createmaintenancetype, maintenancetype, updatemaintenancetype } from "../models";
import { Service } from "../../base/Service";
import { IMaintenanceTypeService } from "./IMaintenanceTypeService";

export class MaintenanceTypeService
  extends Service<maintenancetype, createmaintenancetype, updatemaintenancetype, number>
  implements IMaintenanceTypeService<maintenancetype, createmaintenancetype, updatemaintenancetype, number> {
  constructor(endpoint = API_ENDPOINTS.LOOKUPS.MAINTENANCE_TYPES) {
    super(endpoint);
  }
}