import { IService } from "../IService";
import { PaginationFilter } from "../../models/base/PaginationFilter";
import { PagedResult } from "../../models/base/PagedResult";
import { Result } from "../../models/base/Result";
import { HardwareAssetObject, HardwareAssetPagedItem } from "../../models/Hardware/hardwareAsset";

export interface IHardwareAssetService<
  TEntity = HardwareAssetObject,
  TCreate = Partial<HardwareAssetObject>,
  TUpdate = Partial<HardwareAssetObject>,
  TId = string
> extends IService<TEntity, TCreate, TUpdate, TId> {
  getPaged(params?: PaginationFilter): Promise<PagedResult<HardwareAssetPagedItem>>;
  createHardwareAsset(request: TCreate): Promise<Result<TEntity>>;
}
