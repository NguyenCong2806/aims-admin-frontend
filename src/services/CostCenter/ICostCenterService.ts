/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../IService";

export interface ICostCenterService<costcenter, createcostcenter = Partial<costcenter>, updatecostcenter = Partial<costcenter>, TId = number>
  extends IService<costcenter, createcostcenter, updatecostcenter, TId> {}