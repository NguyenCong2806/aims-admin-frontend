import { AssetCategoryService } from "../services/AssetCategory/AssetCategorySerice";
import { AssetStatusService } from "../services/AssetStatus/AssetStatusSerice";
import { AssetTypeService } from "../services/AssetType/AssetTypeSerice";
import { CostCenterService } from "../services/CostCenter/CostCenterService";
import { BrandService } from "../services/Brand/BrandSerice";
import { DepartmentService } from "../services/Department/DepartmentService";
import { LicenseTypeService } from "../services/LicenseType/LicenseTypeService";
import { LocationService } from "../services/Location/LocationService";
import { MaintenanceTypeService } from "../services/MaintenanceType/MaintenanceTypeService";
import { PositionService } from "../services/Position/PositionService";
import { SupplierService } from "../services/Supplier/SupplierService";
import { UnitService } from "../services/Unit/UnitService";
export class ServiceContainer {
  public readonly brand: BrandService;
  public readonly assetCategory: AssetCategoryService;
  public readonly assetType: AssetTypeService;
  public readonly costCenter: CostCenterService;
  public readonly assetStatus: AssetStatusService;
  public readonly department: DepartmentService;
  public readonly licenseType: LicenseTypeService;
  public readonly location: LocationService;
  public readonly maintenanceType: MaintenanceTypeService;
  public readonly position: PositionService;
  public readonly supplier: SupplierService;
  public readonly unit: UnitService;
  constructor() {
    this.brand = new BrandService();
    this.assetCategory = new AssetCategoryService();
    this.assetType = new AssetTypeService();
    this.costCenter = new CostCenterService();
    this.assetStatus = new AssetStatusService();
    this.department = new DepartmentService();
    this.licenseType = new LicenseTypeService();
    this.location = new LocationService();
    this.maintenanceType = new MaintenanceTypeService();
    this.position = new PositionService();
    this.supplier = new SupplierService();
    this.unit = new UnitService();
  }
}

export const services = new ServiceContainer();