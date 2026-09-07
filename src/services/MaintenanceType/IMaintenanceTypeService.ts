/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../IService";

export interface IMaintenanceTypeService<maintenancetype, createmaintenancetype = Partial<maintenancetype>, updatedmaintenancetype = Partial<maintenancetype>, TId = number>
  extends IService<maintenancetype, createmaintenancetype, updatedmaintenancetype, TId> {}