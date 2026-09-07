import { createmaintenancetype, maintenancetype, updatemaintenancetype } from "../../models/Lookup/maintenancetype/maintenancetype";
import { Service } from "../Service";
import { IMaintenanceTypeService } from "./IMaintenanceTypeService";

export class MaintenanceTypeService
  extends Service<maintenancetype, createmaintenancetype, updatemaintenancetype, number>
  implements IMaintenanceTypeService<maintenancetype, createmaintenancetype, updatemaintenancetype, number>
{
  constructor(endpoint = "/maintenance-type") {
    super(endpoint);
  }
}