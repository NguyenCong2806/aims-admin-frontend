import { IService } from "../IService";

export interface ISupplierService<supplier, createsupplier = Partial<supplier>, updatedsupplier = Partial<supplier>, TId = number>
  extends IService<supplier, createsupplier, updatedsupplier, TId> {
  batchImport(data: File | FormData | Record<string, unknown>[]): Promise<unknown>;
}