/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IService } from "../IService";

export interface ISupplierService<supplier, createsupplier = Partial<supplier>, updatedsupplier = Partial<supplier>, TId = number>
  extends IService<supplier, createsupplier, updatedsupplier, TId> {}