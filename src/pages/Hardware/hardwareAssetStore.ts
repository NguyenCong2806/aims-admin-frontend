import { HardwareAsset } from "../../models/Hardware/hardwareAsset";

export const INITIAL_HARDWARE_ASSETS: HardwareAsset[] = [
  {
    id: "h1-0001-4444-9999-111111111111",
    assetCode: "HW-PC-0021",
    name: "Máy trạm thiết kế đồ họa & phát triển",
    model: "TUF Gaming Station B660M",
    serialNumber: "220501838400192",
    barcode: "893850100210",
    categoryId: 1,
    categoryName: "Máy trạm để bàn (Workstation)",
    statusId: 1,
    statusName: "Đang sử dụng",
    brandId: 1,
    brandName: "ASUS",
    supplierId: 1,
    supplierName: "Công ty Cổ phần Tin học Phong Vũ",
    locationId: 1,
    locationName: "Tòa nhà A - Tầng 4 (Phòng Dev)",
    departmentId: 1,
    departmentName: "Phòng Công nghệ & IT",
    purchasePrice: 28500000,
    purchaseDate: "2023-08-15T00:00:00Z",
    effectiveDate: "2023-08-18T00:00:00Z",
    warrantyMonths: 36,
    description: "Cấu hình Intel Core i7-12700, 32GB RAM, 1TB NVMe, RTX 3060 12GB phục vụ dự án AIMS.",
    createdAt: "2023-08-15T08:30:00Z",
    updatedAt: "2024-01-10T14:20:00Z",
    specs: {
      cpu: "Intel Core i7-12700",
      ram: "32GB DDR4 3200MHz",
      storage: "1TB NVMe PCIe 4.0 SSD",
      gpu: "NVIDIA RTX 3060 12GB",
      os: "Windows 11 Pro 64-bit",
    },
    customAttributes: [
      { id: "ca-1", name: "Địa chỉ MAC LAN", value: "D8:BB:C1:24:99:A1" },
      { id: "ca-2", name: "Màn hình đi kèm", value: "Dell UltraSharp U2723QE" },
    ],
  },
  {
    id: "h1-0002-4444-9999-222222222222",
    assetCode: "HW-PC-0088",
    name: "Máy vi tính văn phòng nhân sự",
    model: "OptiPlex 7000 Micro Form",
    serialNumber: "9FC4KL3",
    barcode: "893850100880",
    categoryId: 1,
    categoryName: "Máy trạm để bàn (Workstation)",
    statusId: 1,
    statusName: "Đang sử dụng",
    brandId: 2,
    brandName: "Dell Inc.",
    supplierId: 2,
    supplierName: "Công ty TNHH Thiết bị Sao Mai",
    locationId: 1,
    locationName: "Tòa nhà A - Tầng 2 (Phòng HCNS)",
    departmentId: 2,
    departmentName: "Phòng Hành chính - Nhân sự",
    purchasePrice: 16800000,
    purchaseDate: "2023-11-20T00:00:00Z",
    effectiveDate: "2023-11-22T00:00:00Z",
    warrantyMonths: 36,
    description: "Máy tính micro gọn nhẹ trang bị Core i5-12500, 16GB RAM cho bộ phận tuyển dụng và nhân sự.",
    createdAt: "2023-11-20T09:00:00Z",
    updatedAt: "2024-02-15T11:00:00Z",
    specs: {
      cpu: "Intel Core i5-12500",
      ram: "16GB DDR4",
      storage: "512GB NVMe SSD",
      os: "Windows 11 Home",
    },
  },
  {
    id: "h1-0003-4444-9999-333333333333",
    assetCode: "HW-LAP-0015",
    name: "Laptop doanh nhân ThinkPad T14",
    model: "ThinkPad T14 Gen 3 (21CF)",
    serialNumber: "PF3G9K12",
    barcode: "893850100155",
    categoryId: 2,
    categoryName: "Máy tính xách tay (Laptop)",
    statusId: 1,
    statusName: "Đang sử dụng",
    brandId: 3,
    brandName: "Lenovo",
    supplierId: 1,
    supplierName: "Công ty Cổ phần Tin học Phong Vũ",
    locationId: 1,
    locationName: "Tòa nhà A - Tầng 4",
    departmentId: 1,
    departmentName: "Phòng Công nghệ & IT",
    purchasePrice: 32000000,
    purchaseDate: "2023-05-10T00:00:00Z",
    effectiveDate: "2023-05-12T00:00:00Z",
    warrantyMonths: 36,
    description: "Cấp phát cho Trưởng nhóm phát triển phần mềm di động, AMD Ryzen 7 PRO 6850U, 32GB RAM.",
    createdAt: "2023-05-10T10:15:00Z",
    updatedAt: "2024-03-01T16:45:00Z",
    specs: {
      cpu: "AMD Ryzen 7 PRO 6850U",
      ram: "32GB LPDDR5",
      storage: "1TB PCIe Gen 4",
      screenSize: "14 inch WUXGA IPS",
      os: "Windows 11 Pro",
    },
    customAttributes: [
      { id: "ca-3", name: "Sạc kèm theo", value: "Lenovo 65W GaN Type-C" },
    ],
  },
  {
    id: "h1-0004-4444-9999-444444444444",
    assetCode: "HW-MON-0042",
    name: "Màn hình đồ họa UltraSharp 27 inch 4K",
    model: "Dell UltraSharp U2723QE",
    serialNumber: "CN-0F142D-74445",
    barcode: "893850100421",
    categoryId: 3,
    categoryName: "Màn hình hiển thị (Monitor)",
    statusId: 2,
    statusName: "Sẵn sàng cấp phát",
    brandId: 2,
    brandName: "Dell Inc.",
    supplierId: 3,
    supplierName: "Hanoicomputer (HACOM)",
    locationId: 2,
    locationName: "Kho Tổng IT - Tầng hầm B1",
    departmentId: null,
    departmentName: "Chưa phân bổ",
    purchasePrice: 12500000,
    purchaseDate: "2024-01-05T00:00:00Z",
    effectiveDate: "2024-01-08T00:00:00Z",
    warrantyMonths: 36,
    description: "Màn hình IPS Black 4K USB-C Hub dự phòng cho khối thiết kế UI/UX.",
    createdAt: "2024-01-05T14:00:00Z",
    updatedAt: "2024-01-08T09:30:00Z",
    specs: {
      screenSize: "27 inch",
      resolution: "4K UHD (3840 x 2160)",
      refreshRate: "60Hz IPS Black",
    },
  },
  {
    id: "h1-0005-4444-9999-555555555555",
    assetCode: "HW-SRV-0002",
    name: "Máy chủ lưu trữ & ảo hóa ProLiant",
    model: "HPE ProLiant DL380 Gen10 Plus",
    serialNumber: "SGH219V47K",
    barcode: "893850100029",
    categoryId: 4,
    categoryName: "Máy chủ & Hạ tầng mạng (Server)",
    statusId: 1,
    statusName: "Đang sử dụng",
    brandId: 4,
    brandName: "HP Inc. (HPE)",
    supplierId: 4,
    supplierName: "Tập đoàn Công nghệ CMC",
    locationId: 3,
    locationName: "Phòng Data Center (DC-RACK-03)",
    departmentId: 1,
    departmentName: "Phòng Công nghệ & IT",
    purchasePrice: 145000000,
    purchaseDate: "2022-10-12T00:00:00Z",
    effectiveDate: "2022-10-20T00:00:00Z",
    warrantyMonths: 60,
    description: "Dual Intel Xeon Silver 4314, 128GB ECC RAM, 8x 1.92TB SSD SAS RAID-10 chạy cụm ảo hóa Proxmox.",
    createdAt: "2022-10-12T08:00:00Z",
    updatedAt: "2023-12-20T17:00:00Z",
    specs: {
      cpu: "Dual Intel Xeon Silver 4314",
      ram: "128GB ECC Registered",
      storage: "8x 1.92TB SAS SSD (RAID-10)",
      rackLocation: "Rack R03 - U10-U12 (Tầng 2 DC)",
      powerSupply: "Dual 800W Redundant Platinum",
    },
    customAttributes: [
      { id: "ca-4", name: "iLO 5 IP Address", value: "10.0.10.25" },
    ],
  },
  {
    id: "h1-0006-4444-9999-666666666666",
    assetCode: "HW-PRN-0005",
    name: "Máy in Laser đa năng đen trắng",
    model: "HP LaserJet Pro MFP M428fdw",
    serialNumber: "VNB3K19248",
    barcode: "893850100055",
    categoryId: 5,
    categoryName: "Máy in & Thiết bị số hóa (Printer)",
    statusId: 3,
    statusName: "Đang bảo trì / Sửa chữa",
    brandId: 4,
    brandName: "HP Inc.",
    supplierId: 2,
    supplierName: "Công ty TNHH Thiết bị Sao Mai",
    locationId: 1,
    locationName: "Tòa nhà A - Tầng 3 (Kế toán)",
    departmentId: 3,
    departmentName: "Phòng Kế toán - Tài chính",
    purchasePrice: 9800000,
    purchaseDate: "2021-04-10T00:00:00Z",
    effectiveDate: "2021-04-12T00:00:00Z",
    warrantyMonths: 24,
    description: "Máy in đa chức năng (In, Scan, Copy, Fax qua WiFi). Đang gửi hãng thay cụm sấy (Fuser).",
    createdAt: "2021-04-10T09:00:00Z",
    updatedAt: "2024-03-12T10:15:00Z",
    specs: {
      printTechnology: "Laser đơn sắc",
      paperSizes: "A4, A5, Letter",
      duplex: true,
    },
  },
  {
    id: "h1-0007-4444-9999-777777777777",
    assetCode: "HW-CAM-0012",
    name: "Camera an ninh AI giám sát hành lang",
    model: "Hikvision DS-2CD2143G2-I",
    serialNumber: "D92847192",
    barcode: "893850100128",
    categoryId: 6,
    categoryName: "Thiết bị an ninh & Giám sát (Security)",
    statusId: 1,
    statusName: "Đang sử dụng",
    brandId: 5,
    brandName: "Hikvision",
    supplierId: 3,
    supplierName: "Hanoicomputer (HACOM)",
    locationId: 1,
    locationName: "Hành lang Tầng 2 & 3",
    departmentId: 2,
    departmentName: "Phòng Hành chính - Nhân sự",
    purchasePrice: 2450000,
    purchaseDate: "2023-02-18T00:00:00Z",
    effectiveDate: "2023-02-20T00:00:00Z",
    warrantyMonths: 24,
    description: "Camera IP hồng ngoại 4MP AcuSense nhận diện người & phương tiện kết nối NVR tập trung.",
    createdAt: "2023-02-18T15:30:00Z",
    updatedAt: "2023-06-05T09:00:00Z",
  },
];

const STORAGE_KEY = "aims_hardware_assets_data";

export const getStoredHardwareAssets = (): HardwareAsset[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_HARDWARE_ASSETS;
};

export const saveStoredHardwareAssets = (items: HardwareAsset[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("aims_hardware_assets_updated"));
  } catch {
    // ignore
  }
};

export const getHardwareAssetById = (id?: string | null): HardwareAsset | null => {
  if (!id) return null;
  const list = getStoredHardwareAssets();
  return list.find((item) => item.id === id) || null;
};

export const upsertHardwareAsset = (asset: Partial<HardwareAsset>): HardwareAsset => {
  const list = getStoredHardwareAssets();
  const now = new Date().toISOString();
  
  if (asset.id) {
    const index = list.findIndex((it) => it.id === asset.id);
    if (index !== -1) {
      const updated: HardwareAsset = {
        ...list[index],
        ...asset,
        updatedAt: now,
      } as HardwareAsset;
      list[index] = updated;
      saveStoredHardwareAssets(list);
      return updated;
    }
  }

  // Create new
  const newItem: HardwareAsset = {
    id: asset.id || `hw-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    assetCode: asset.assetCode || `HW-GEN-${Math.floor(100 + Math.random() * 900)}`,
    name: asset.name || "Thiết bị mới",
    model: asset.model || "",
    serialNumber: asset.serialNumber || "",
    barcode: asset.barcode || "",
    categoryId: asset.categoryId ?? 1,
    categoryName: asset.categoryName || "Máy trạm để bàn (Workstation)",
    statusId: asset.statusId ?? 1,
    statusName: asset.statusName || "Sẵn sàng cấp phát",
    brandId: asset.brandId ?? 1,
    brandName: asset.brandName || "ASUS",
    supplierId: asset.supplierId ?? 1,
    supplierName: asset.supplierName || "Công ty Cổ phần Tin học Phong Vũ",
    locationId: asset.locationId ?? 1,
    locationName: asset.locationName || "Kho Tổng IT",
    departmentId: asset.departmentId ?? null,
    departmentName: asset.departmentName || "Chưa phân bổ",
    purchasePrice: asset.purchasePrice ?? 0,
    purchaseDate: asset.purchaseDate || now,
    effectiveDate: asset.effectiveDate || now,
    warrantyMonths: asset.warrantyMonths ?? 24,
    description: asset.description || "",
    createdAt: now,
    updatedAt: now,
    assignedToUser: asset.assignedToUser || null,
    specs: asset.specs || null,
    customAttributes: asset.customAttributes || null,
  };

  list.unshift(newItem);
  saveStoredHardwareAssets(list);
  return newItem;
};

export const deleteHardwareAssetById = (id: string): void => {
  const list = getStoredHardwareAssets();
  const next = list.filter((it) => it.id !== id);
  saveStoredHardwareAssets(next);
};
