import { IService } from "../../base/IService";
import { hardwareassetobject, hardwareassetviewdto } from "../models/hardwareAsset";
import { PaginationFilter } from "../../base/models/PaginationFilter";
import { PagedResult } from "../../base/models/PagedResult";

export interface IHardwareService
  extends IService<hardwareassetviewdto, hardwareassetobject, hardwareassetobject, string> {
  generateAssetCode(categoryName: string): string;
  getHardwareAssetsByParams(params?: PaginationFilter): Promise<PagedResult<hardwareassetviewdto>>;

}
