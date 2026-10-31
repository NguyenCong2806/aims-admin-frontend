import { PagedResult, PaginationFilter } from "../../base";
import { IService } from "../../base/IService";
import { DigitalAssetObject, DigitalAssetViewdDto } from "../models/digitalAsset";

export interface IDigitalAssetService
  extends IService<DigitalAssetViewdDto, DigitalAssetObject, DigitalAssetObject, string> {
  generateAssetCode(categoryOrSubType?: string): string;
  getDigitalAssetsByParams(params?: PaginationFilter): Promise<PagedResult<DigitalAssetViewdDto>>;
}
