// Chi tiết CPU thu thập được từ máy trạm
export interface DeviceCpuAudit {
  cores: number;
  logicals: number;
  maxClockSpeedMHz: number;
  name: string;
}

// Chi tiết bo mạch chủ (Motherboard)
export interface DeviceMotherboardAudit {
  biosVersion: string;
  manufacturer: string;
  product: string;
  serialNumber: string;
}

// Chi tiết bộ nhớ RAM
export interface DeviceRamAudit {
  freeGB: number;
  totalGB: number;
  usagePercent: number;
  usedGB: number;
}

// Chi tiết Hệ điều hành & Bản quyền
export interface DeviceOsAudit {
  buildNumber: number;
  domainOrWorkgroup: string;
  hostname: string;
  licenseStatus: string;
  licenseType: string;
  oemKeyInBios: string;
  osName: string;
  partialProductKey: string;
  userName: string;
}

// Chi tiết bộ Microsoft Office & Bản quyền
export interface DeviceOfficeAudit {
  licenseStatus: string;
  licenseType: string;
  partialProductKey: string;
  productName: string;
}

// Phân vùng ổ đĩa (Disk Partitions)
export interface DeviceDiskPartitionAudit {
  label: string;
  totalGB: number;
  usedGB: number;
  freeGB: number;
}

// Ổ đĩa lưu trữ (Disks)
export interface DeviceDiskAudit {
  model?: string;
  total_gb?: number | null;
  totalGB?: number | null;
  totalGb?: number | null;
  drive_letter?: string | null;
  driveLetter?: string | null;
  disk_type?: string | null;
  diskType?: string | null;
  partitions?: DeviceDiskPartitionAudit[];
  [key: string]: any;
}

// Màn hình (Displays)
export interface DeviceDisplayAudit {
  deviceName?: string;
  name?: string;
  physicalSizeInch?: string;
  resolution?: string;
  [key: string]: any;
}

// Card mạng (Networks)
export interface DeviceNetworkAudit {
  name: string;
  macAddress: string;
  ipAddress?: string;
  [key: string]: any;
}

// Phần mềm cài đặt (Softwares)
export interface DeviceSoftwareAudit {
  name: string;
  version: string;
  installType?: "Admin" | "Non-Admin" | string;
  [key: string]: any;
}

// Model chính phản chiếu chuỗi JSON thực tế từ API
export interface DeviceSystemAudit {
  id?: string;
  assetId?: string | null;
  asset_id?: string | null;
  collectedAt: string;
  createdAt?: string;
  cpu: DeviceCpuAudit;
  disks?: DeviceDiskAudit[];
  displays?: DeviceDisplayAudit[];
  motherboard: DeviceMotherboardAudit;
  networks?: DeviceNetworkAudit[];
  office: DeviceOfficeAudit;
  os: DeviceOsAudit;
  ram: DeviceRamAudit;
  softwares?: DeviceSoftwareAudit[];
  software?: DeviceSoftwareAudit[];
}

export type CreateDeviceSystemAudit = Partial<DeviceSystemAudit>;

// Payload khi cập nhật (PUT / PATCH)
export interface UpdateDeviceSystemAudit extends Partial<CreateDeviceSystemAudit> {
  id: string;
}