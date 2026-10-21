/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../IService";

export interface ILicenseTypeService<licensetype, createlicensetype = Partial<licensetype>, updatedlicensetype = Partial<licensetype>, TId = number>
  extends IService<licensetype, createlicensetype, updatedlicensetype, TId> {}