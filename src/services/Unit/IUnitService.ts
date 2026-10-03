/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../IService";

export interface IUnitService<unit, createunit = Partial<unit>, updatedunit = Partial<unit>, TId = number>
  extends IService<unit, createunit, updatedunit, TId> {}