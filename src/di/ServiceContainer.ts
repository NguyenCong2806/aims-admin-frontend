import {
  AssetCategoryService,
  AssetStatusService,
  AssetTypeService,
  CostCenterService,
  BrandService,
  DepartmentService,
  LicenseTypeService,
  LocationService,
  MaintenanceTypeService,
  PositionService,
  SupplierService,
  UnitService,
} from "../modules/Lookups/services";

import {
  DigitalAssetService,
} from "../modules/DigitalAsset/services";

import { ComputerAuditService } from "../modules/Monitoring/services";

import {
  ContractService,
  ContractAddendumService,
} from "../modules/Contract/services";

import {
  FileService,
  AuditLogService,
} from "../modules/System/services";

import { PermissionService } from "../modules/Permissions/services";
import { UserService } from "../modules/Users/services";
import { HardwareService } from "../modules/Hardware/services";

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
  public readonly digitalAsset: DigitalAssetService;
  public readonly computerAudit: ComputerAuditService;
  public readonly contract: ContractService;
  public readonly contractAddendum: ContractAddendumService;
  public readonly file: FileService;
  public readonly auditLog: AuditLogService;
  public readonly permission: PermissionService;
  public readonly hardware: HardwareService;
  public readonly user: UserService;

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
    this.digitalAsset = new DigitalAssetService();
    this.computerAudit = new ComputerAuditService();
    this.contract = new ContractService();
    this.contractAddendum = new ContractAddendumService();
    this.file = new FileService();
    this.auditLog = new AuditLogService();
    this.permission = new PermissionService();
    this.hardware = new HardwareService();
    this.user = new UserService();
  }
}

export const services = new ServiceContainer();