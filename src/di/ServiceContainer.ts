import { AssetCategoryService } from "../services/AssetCategory/AssetCategorySerice";
import { AssetTypeService } from "../services/AssetType/AssetTypeSerice";
import { BrandService } from "../services/Brand/BrandSerice";
export class ServiceContainer {
  public readonly brand: BrandService;
  public readonly assetCategory: AssetCategoryService;
  public readonly assetType: AssetTypeService;
  constructor() {
    this.brand = new BrandService();
    this.assetCategory = new AssetCategoryService();
    this.assetType = new AssetTypeService();
  }
}

export const services = new ServiceContainer();