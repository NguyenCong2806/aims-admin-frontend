/**
 * DTO Thông tin chung của thiết bị phần cứng
 * Khớp chính xác 1:1 với class HardwareAssetDto trong Backend .NET / C#
 */
export interface HardwareAssetDto {
  /**
   * Khóa chính duy nhất (Guid)
   */
  id?: string;

  /**
   * Mã tài sản quản lý nội bộ
   * VD: SW-CORE-08, CAM-MAIN-07, NAS-STORE-01
   */
  assetCode: string;

  /**
   * Phân loại con thiết bị phần cứng
   * SWITCH, CAMERA, NAS, DISPLAY, PRINTER
   */
  assetSubType: string;

  /**
   * Tên thiết bị
   */
  name: string;

  /**
   * Mã Model
   */
  model?: string | null;

  /**
   * Số Serial / Service Tag
   */
  serialNumber?: string | null;

  /**
   * Mã vạch / QR Code quản lý kho
   */
  barcode?: string | null;

  // =========================
  // Foreign Keys (Khóa ngoại danh mục - Lấy từ select-list dạng { Key: id, Value: name })
  // Backend SQL format: SELECT id AS Key, name AS Value FROM ...
  // =========================

  /**
   * ID loại tài sản (Lấy từ Key của /asset-categories/select-list)
   */
  categoryId?: number | null;

  /**
   * ID trạng thái tài sản (Lấy từ Key của /asset-status/select-list)
   */
  statusId?: number | null;

  /**
   * ID thương hiệu (Lấy từ Key của /brands/select-list)
   */
  brandId?: number | null;

  /**
   * ID nhà cung cấp (Lấy từ Key của /suppliers/select-list)
   */
  supplierId?: number | null;

  /**
   * ID vị trí (Lấy từ Key của /location/select-list)
   */
  locationId?: number | null;

  /**
   * ID phòng ban (Lấy từ Key của /department/select-list)
   */
  departmentId?: number | null;

  // =========================
  // Financial & Warranty (Tài chính & Bảo hành)
  // =========================

  /**
   * Giá vốn (VND)
   */
  purchasePrice?: number | null;

  /**
   * Ngày mua
   */
  purchaseDate?: string | Date | null;

  /**
   * Ngày hiệu lực
   */
  effectiveDate?: string | Date | null;

  /**
   * Thời gian bảo hành (tháng)
   */
  warrantyMonths?: number | null;

  // =========================
  // Description & Audit (Mô tả / Ghi chú)
  // =========================

  /**
   * Mô tả / Ghi chú
   */
  description?: string | null;
}

/**
 * Interface phản ánh dữ liệu phần tử trong mảng items trả về từ API:
 * /hardware_assets/get-hardware-assets-paged
 */
export interface HardwareAssetPagedItem {
  id: string;
  asset_code: string;
  asset_sub_type?: string | null;
  name: string;
  model?: string | null;
  serial_number?: string | null;
  barcode?: string | null;

  category_id?: number | null;
  category_name?: string | null;

  status_id?: number | null;
  status_name?: string | null;

  brand_id?: number | null;
  brand_name?: string | null;

  supplier_id?: number | null;
  supplier_name?: string | null;

  location_id?: number | null;
  location_name?: string | null;

  department_id?: number | null;
  department_name?: string | null;

  purchase_price?: number | null;
  purchase_date?: string | null;
  effective_date?: string | null;
  warranty_months?: number | null;
  description?: string | null;
  total_count?: number;

  // Hỗ trợ camelCase tương thích
  assetCode?: string;
  assetSubType?: string | null;
  serialNumber?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  statusId?: number | null;
  statusName?: string | null;
  brandId?: number | null;
  brandName?: string | null;
  supplierId?: number | null;
  supplierName?: string | null;
  locationId?: number | null;
  locationName?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  purchasePrice?: number | null;
  purchaseDate?: string | null;
  effectiveDate?: string | null;
  warrantyMonths?: number | null;
}

export interface AssetSpecNasStorageDto {
  id?: string;
  hardwareAssetId?: string;
  deviceType?: string;
  cpuProcessor?: string;
  installedRamGb?: number;
  maxRamSupportedGb?: number;
  installedCapacityTb?: number;
  maxSingleVolumeSizeTb?: number;
  cacheSlots?: string;
  powerRatingVa?: number;

  // Lowercase compatibility
  hardwareassetid?: string;
  devicetype?: string;
  cpuprocessor?: string;
  installedramgb?: number;
  maxramsupportedgb?: number;
  installedcapacitytb?: number;
  maxsinglevolumesizetb?: number;
  cacheslots?: string;
  powerratingva?: number;
}

export interface AssetSpecDisplayProjectorDto {
  id?: string;
  hardwareAssetId?: string;
  deviceType?: string;
  displayType?: string;
  screenSizeInches?: number;
  resolution?: string;
  refreshRateHz?: number;
  operatingSystem?: string;
  brightnessAnsiLumens?: number;
  contrastRatio?: string;
  lampLifeHours?: number;
  supportedPorts?: string;

  // Lowercase compatibility
  hardwareassetid?: string;
  devicetype?: string;
  displaytype?: string;
  screensizeinches?: number;
  refreshratehz?: number;
  operatingsystem?: string;
  brightnessansilumens?: number;
  contrastratio?: string;
  lamplifehours?: number;
  supportedports?: string;
}

export interface AssetSpecNetworkDeviceDto {
  id?: string;
  hardwareAssetId?: string;
  deviceType?: string;
  firewallThroughput?: string;
  ipsThroughput?: string;
  vpnThroughput?: string;
  concurrentSessions?: number;
  portCount?: number;
  portSpeed?: string;
  uplinkPorts?: string;
  antennaSpec?: string;
  concurrentUsersLimit?: number;
  maxVlans?: number;
  isPoeSupported?: boolean;
  powerConsumptionW?: number;

  // Lowercase compatibility
  hardwareassetid?: string;
  devicetype?: string;
  firewallthroughput?: string;
  ipsthroughput?: string;
  vpnthroughput?: string;
  concurrentsessions?: number;
  portcount?: number;
  portspeed?: string;
  uplinkports?: string;
  antennaspec?: string;
  concurrentuserslimit?: number;
  maxvlans?: number;
  ispoesupported?: boolean;
  powerconsumptionw?: number;
}

export interface AssetSpecCameraNvrDto {
  id?: string;
  hardwareAssetId?: string;
  deviceType?: string;
  resolution?: string;
  sensorSize?: string;
  lensSize?: string;
  irDistanceMeters?: number;
  compressionStandard?: string;
  hasTwoWayAudio?: boolean;
  hasWdr?: boolean;
  channelCount?: number;
  maxStorageTb?: number;
  inputBandwidthMbps?: number;
  outputBandwidthMbps?: number;

  // Lowercase compatibility
  hardwareassetid?: string;
  devicetype?: string;
  sensorsize?: string;
  lenssize?: string;
  irdistancemeters?: number;
  compressionstandard?: string;
  hastwowaudaio?: boolean;
  haswdr?: boolean;
  channelcount?: number;
  maxstoragetb?: number;
  inputbandwidthmbps?: number;
  outputbandwidthmbps?: number;
}

export interface AssetSpecPrinterCopierDto {
  id?: string;
  hardwareAssetId?: string;
  deviceType?: string;
  ipSetup?: string;
  maxPaperSize?: string;
  printSpeedPpm?: number;
  printResolution?: string;
  inkCartridgeType?: string;
  drumLifePages?: number;
  lastInkRefillDate?: string | null;
  lastCleaningDate?: string | null;
  shredStyle?: string;
  shredCapacitySheets?: number;
  binCapacityLiters?: number;

  // Lowercase compatibility
  hardwareassetid?: string;
  devicetype?: string;
  ipsetup?: string;
  maxpapersize?: string;
  printspeedppm?: number;
  printresolution?: string;
  inkcartridgetype?: string;
  drumlifepages?: number;
  lastinkrefilldate?: string | null;
  lastcleaningdate?: string | null;
  shredstyle?: string;
  shredcapacitysheets?: number;
  bincapacityliters?: number;
}

export interface HardwareAssetObject {
  hardwareAssetDto: HardwareAssetDto;
  assetSpecNasStorageDto?: AssetSpecNasStorageDto | null;
  assetSpecDisplayProjectorDto?: AssetSpecDisplayProjectorDto | null;
  assetSpecNetworkDeviceDto?: AssetSpecNetworkDeviceDto | null;
  assetSpecCameraNvrDto?: AssetSpecCameraNvrDto | null;
  assetSpecPrinterCopierDto?: AssetSpecPrinterCopierDto | null;
}