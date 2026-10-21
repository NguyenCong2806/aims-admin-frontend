import { IService } from "../IService";

export interface IUnitService<unit, createunit = Partial<unit>, updatedunit = Partial<unit>, TId = number>
  extends IService<unit, createunit, updatedunit, TId> {
  batchImport(data: File | FormData | Record<string, unknown>[]): Promise<unknown>;
}