import { AssetCategoryService } from "../services/AssetCategory/AssetCategorySerice";
import { BrandService } from "../services/Brand/BrandSerice";

export class ServiceContainer {
  public readonly brand: BrandService;
  public readonly assetCategory: AssetCategoryService;

  constructor() {
    this.brand = new BrandService();
    this.assetCategory = new AssetCategoryService();

  }
}

export const services = new ServiceContainer();