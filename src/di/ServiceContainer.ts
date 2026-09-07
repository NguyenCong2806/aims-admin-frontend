import { AssetCategoryService } from "../services/AssetCategory/AssetCategorySerice";
import { AssetStatusService } from "../services/AssetStatus/AssetStatusSerice";
import { AssetTypeService } from "../services/AssetType/AssetTypeSerice";
import { BrandService } from "../services/Brand/BrandSerice";
export class ServiceContainer {
  public readonly brand: BrandService;
  public readonly assetCategory: AssetCategoryService;
  public readonly assetType: AssetTypeService;
  public readonly assetStatus: AssetStatusService;
  constructor() {
    this.brand = new BrandService();
    this.assetCategory = new AssetCategoryService();
    this.assetType = new AssetTypeService();
    this.assetStatus = new AssetStatusService();
  }
}

export const services = new ServiceContainer();