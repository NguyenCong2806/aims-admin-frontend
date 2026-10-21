import React from "react";

export interface HardwareFormSpecs {
  id?: string;
  hardwareAssetId?: string;
  // Thiết bị mạng (AssetSpecNetworkDeviceDto)
  deviceType?: string;
  firewallThroughput?: string;
  ipsThroughput?: string;
  vpnThroughput?: string;
  concurrentSessions?: number | null;
  portCount?: number | string | null;
  portSpeed?: string;
  uplinkPorts?: string;
  antennaSpec?: string;
  concurrentUsersLimit?: number | null;
  maxVlans?: number | null;
  isPoeSupported?: boolean;
  powerConsumptionW?: number | null;

  // Legacy / Bổ trợ cho mạng
  managementLayer?: string;
  networkSpeed?: string;
  poeBudget?: string;
  rackLocation?: string;
  powerSupply?: string;

  // Camera & NVR (AssetSpecCameraNvrDto)
  resolution?: string;
  sensorSize?: string;
  lensSize?: string;
  irDistanceMeters?: number | null;
  compressionStandard?: string;
  hasTwoWayAudio?: boolean;
  hasWdr?: boolean;
  channelCount?: number | null;
  maxStorageTb?: number | null;
  inputBandwidthMbps?: number | null;
  outputBandwidthMbps?: number | null;

  // NAS Storage (AssetSpecNasStorageDto)
  driveBays?: string;
  installedCapacity?: string | number | null;
  maxCapacity?: string | number | null;
  raidType?: string;
  cpuRam?: string;
  installedRamGb?: number | null;
  maxRamSupportedGb?: number | null;
  maxSingleVolumeSizeTb?: number | null;
  cacheSlots?: string;
  powerRatingVa?: number | null;
  networkPorts?: string;
  redundantPower?: boolean;

  // Màn hình & Máy chiếu (AssetSpecDisplayProjectorDto)
  screenSize?: string | number | null;
  refreshRate?: string | number | null;
  panelType?: string;
  operatingSystem?: string;
  brightnessLumens?: string | number | null;
  contrastRatio?: string;
  lampLifeHours?: number | null;
  projectionRatio?: string;
  ports?: string;

  // Máy in & Photocopy (AssetSpecPrinterCopierDto)
  printTechnology?: string;
  paperSizes?: string;
  printSpeed?: string | number | null;
  printResolution?: string;
  inkCartridgeType?: string;
  drumLifePages?: number | null;
  lastInkRefillDate?: string | null;
  lastCleaningDate?: string | null;
  shredStyle?: string;
  shredCapacitySheets?: number | null;
  binCapacityLiters?: number | null;
  ipSetup?: string;
  duplex?: boolean;
  colorPrinting?: boolean;
  connectivity?: string;
  functions?: string;
  [key: string]: any;
}

export const HARDWARE_CATEGORY_SUBTYPES: Record<string, { value: string; label: string }[]> = {
  network_device: [
    { value: "SWITCH", label: "SWITCH - Thiết bị chuyển mạch (Switch)" },
    { value: "ROUTER", label: "ROUTER - Bộ định tuyến (Router)" },
    { value: "FIREWALL", label: "FIREWALL - Tường lửa bảo mật (Firewall)" },
    { value: "ACCESS_POINT", label: "ACCESS_POINT - Điểm phát sóng Wi-Fi (AP)" },
  ],
  camera_nvr: [
    { value: "CAMERA", label: "CAMERA - Camera an ninh giám sát" },
    { value: "NVR", label: "NVR - Đầu ghi hình mạng (Network Video Recorder)" },
    { value: "DVR", label: "DVR - Đầu ghi hình kỹ thuật số (Digital Video Recorder)" },
  ],
  nas_storage: [
    { value: "NAS", label: "NAS - Thiết bị lưu trữ qua mạng (NAS / SAN)" },
    { value: "UPS", label: "UPS - Bộ lưu điện dự phòng (UPS)" },
    { value: "EXTERNAL_HDD", label: "EXTERNAL_HDD - Ổ cứng ngoài / Box di động" },
  ],
  display_projector: [
    { value: "PC_MONITOR", label: "PC_MONITOR - Màn hình máy tính (PC Monitor)" },
    { value: "TV", label: "TV - Màn hình Tivi / Trình chiếu" },
    { value: "PROJECTOR", label: "PROJECTOR - Máy chiếu hội trường / văn phòng" },
  ],
  printer_copier: [
    { value: "PRINTER", label: "PRINTER - Máy in laser / Máy in phun" },
    { value: "COPIER_MULTIFUNCTION", label: "COPIER_MULTIFUNCTION - Máy photocopy / in đa chức năng" },
    { value: "SHREDDER", label: "SHREDDER - Máy hủy tài liệu văn phòng" },
  ],
};

export const resolveValidSubType = (specType: string, currentSubType?: string | null): string => {
  const list = HARDWARE_CATEGORY_SUBTYPES[specType];
  if (!list || list.length === 0) return "SWITCH";
  const found = list.find((item) => item.value === currentSubType);
  return found ? found.value : list[0].value;
};

export interface HardwareDeviceTypeItem {
  id: string;
  subType: string;
  categoryName: string;
  spName: string;
  label: string;
  sublabel: string;
  prefix: string;
  icon: React.ReactNode;
  color: string;
}

export const HARDWARE_DEVICE_TYPES: HardwareDeviceTypeItem[] = [
  {
    id: "network_device",
    subType: "SWITCH",
    categoryName: "Thiết bị mạng (Switch / Router / AP)",
    spName: "sp_save_asset_spec_network_device",
    label: "Thiết bị mạng (Network)",
    sublabel: "Switch, Router, Firewall, AP",
    prefix: "SW",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/60",
  },
  {
    id: "camera_nvr",
    subType: "CAMERA",
    categoryName: "Camera & Đầu ghi (Camera / NVR)",
    spName: "sp_save_asset_spec_camera_nvr",
    label: "Camera & Đầu ghi NVR",
    sublabel: "Camera, NVR, DVR",
    prefix: "CAM",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/60",
  },
  {
    id: "nas_storage",
    subType: "NAS",
    categoryName: "Lưu trữ NAS & SAN (NAS / Storage)",
    spName: "sp_save_asset_spec_nas_storage",
    label: "Ổ lưu trữ NAS & SAN",
    sublabel: "NAS, UPS, External HDD",
    prefix: "NAS",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/60",
  },
  {
    id: "display_projector",
    subType: "PC_MONITOR",
    categoryName: "Màn hình & Máy chiếu (Display / Projector)",
    spName: "sp_save_asset_spec_display_projector",
    label: "Màn hình & Máy chiếu",
    sublabel: "PC Monitor, TV, Projector",
    prefix: "MON",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-900/60",
  },
  {
    id: "printer_copier",
    subType: "PRINTER",
    categoryName: "Máy in & Photocopy (Printer / Copier)",
    spName: "sp_save_asset_spec_printer_copier",
    label: "Máy in & Photocopy",
    sublabel: "Printer, Copier, Shredder",
    prefix: "PRN",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    ),
    color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900/60",
  },
];

export const ALL_CATEGORY_OPTIONS = [
  "Thiết bị mạng (Switch / Router / AP)",
  "Camera & Đầu ghi (Camera / NVR)",
  "Lưu trữ NAS & SAN (NAS / Storage)",
  "Màn hình & Máy chiếu (Display / Projector)",
  "Máy in & Photocopy (Printer / Copier)",
  "Khác",
];

export const BRAND_OPTIONS = [
  "Dell Inc.",
  "HP Inc. (HPE)",
  "ASUS",
  "Lenovo",
  "Apple Inc.",
  "Cisco Systems",
  "Hikvision",
  "TP-Link",
  "Brother",
  "Canon",
  "Epson",
  "Khác",
];

export const STATUS_OPTIONS = [
  "Đang sử dụng",
  "Sẵn sàng cấp phát",
  "Đang bảo trì / Sửa chữa",
  "Đã thanh lý",
  "Dự phòng kho IT",
];

export const DEPARTMENT_OPTIONS = [
  "Phòng Công nghệ & IT",
  "Phòng Hành chính - Nhân sự",
  "Phòng Kế toán - Tài chính",
  "Khối Kinh doanh & Marketing",
  "Ban Giám đốc",
  "Chưa phân bổ",
];

export const LOCATION_OPTIONS = [
  "Tòa nhà A - Tầng 4 (Phòng Dev)",
  "Tòa nhà A - Tầng 2 (Phòng HCNS)",
  "Tòa nhà A - Tầng 3 (Kế toán)",
  "Kho Tổng IT - Tầng hầm B1",
  "Phòng Data Center (DC-RACK-03)",
  "Chi nhánh TP. Hồ Chí Minh",
];

export const SUPPLIER_OPTIONS = [
  "Công ty Cổ phần Tin học Phong Vũ",
  "Công ty TNHH Thiết bị Sao Mai",
  "Hanoicomputer (HACOM)",
  "Tập đoàn Công nghệ CMC",
  "FPT Information System",
  "Khác",
];

/**
 * Hàm nhận diện mẫu thông số kỹ thuật (Stored Procedure) chuẩn:
 * Ưu tiên nhận diện theo:
 * 1. AssetSubType từ CSDL backend (SWITCH, CAMERA, NAS, DISPLAY, PRINTER...)
 * 2. Tên danh mục (hỗ trợ cả các tên đặc thù như 'Thiết bị work', 'Hạ tầng mạng', ...)
 */
export const inferHardwareType = (subType?: string | null, catName?: string | null): string => {
  const s = (subType || "").trim().toUpperCase();
  const c = (catName || "").trim().toLowerCase();

  // 1. Nhận diện chuẩn xác theo AssetSubType khớp với CASE của Stored Procedure:
  if (
    s === "CAMERA" ||
    s === "NVR" ||
    s === "DVR" ||
    s.includes("CAMERA") ||
    s.includes("CAM") ||
    s.includes("NVR") ||
    s.includes("DVR") ||
    s.includes("DOME") ||
    s.includes("BULLET") ||
    s.includes("PTZ")
  ) {
    return "camera_nvr";
  }

  if (
    s === "TV" ||
    s === "PC_MONITOR" ||
    s === "PROJECTOR" ||
    s.includes("PC_MONITOR") ||
    s.includes("DISPLAY") ||
    s.includes("MONITOR") ||
    s.includes("PROJECTOR") ||
    s.includes("SCREEN") ||
    s.includes("TV")
  ) {
    return "display_projector";
  }

  if (
    s === "NAS" ||
    s === "UPS" ||
    s === "EXTERNAL_HDD" ||
    s.includes("NAS") ||
    s.includes("UPS") ||
    s.includes("EXTERNAL_HDD") ||
    s.includes("HDD") ||
    s.includes("SAN") ||
    s.includes("STORAGE")
  ) {
    return "nas_storage";
  }

  if (
    s === "FIREWALL" ||
    s === "ROUTER" ||
    s === "SWITCH" ||
    s === "ACCESS_POINT" ||
    s.includes("SWITCH") ||
    s.includes("ROUTER") ||
    s.includes("FIREWALL") ||
    s.includes("ACCESS_POINT") ||
    s.includes("AP") ||
    s.includes("NETWORK") ||
    s.includes("GATEWAY")
  ) {
    return "network_device";
  }

  if (
    s === "PRINTER" ||
    s === "COPIER_MULTIFUNCTION" ||
    s === "SHREDDER" ||
    s.includes("PRINTER") ||
    s.includes("COPIER") ||
    s.includes("SHREDDER") ||
    s.includes("SCANNER") ||
    s.includes("PHOTO")
  ) {
    return "printer_copier";
  }

  // 2. Nhận diện theo tên Category Name trong CSDL
  if (
    c.includes("mạng") ||
    c.includes("switch") ||
    c.includes("router") ||
    c.includes("network") ||
    c.includes("firewall") ||
    c.includes("ap") ||
    c.includes("work") ||
    c.includes("hạ tầng")
  ) {
    return "network_device";
  }
  if (
    c.includes("camera") ||
    c.includes("nvr") ||
    c.includes("dvr") ||
    c.includes("đầu ghi") ||
    c.includes("an ninh") ||
    c.includes("cctv")
  ) {
    return "camera_nvr";
  }
  if (c.includes("nas") || c.includes("san") || c.includes("lưu trữ") || c.includes("storage")) {
    return "nas_storage";
  }
  if (
    c.includes("màn hình") ||
    c.includes("máy chiếu") ||
    c.includes("display") ||
    c.includes("projector") ||
    c.includes("monitor")
  ) {
    return "display_projector";
  }
  if (
    c.includes("máy in") ||
    c.includes("photocopy") ||
    c.includes("printer") ||
    c.includes("copier") ||
    c.includes("in ấn")
  ) {
    return "printer_copier";
  }

  return "network_device";
};

export const FieldLabel: React.FC<{
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  htmlFor?: string;
  className?: string;
}> = ({ children, rightAction, htmlFor, className = "" }) => (
  <div className={`min-h-[20px] flex items-center justify-between gap-1 mb-1.5 ${className}`}>
    <label
      htmlFor={htmlFor}
      className="text-xs font-semibold text-gray-700 dark:text-gray-300 tracking-wide leading-tight"
      title={typeof children === "string" ? children : undefined}
    >
      {children}
    </label>
    {rightAction}
  </div>
);

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
};
