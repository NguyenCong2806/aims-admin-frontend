import type {
  DiskDto,
  DisplayDto,
  NetworkDto,
  SoftwareDto,
} from "../ComputerAudit/ComputerAuditDetailDto";

export interface DeviceSystemAuditDto {
  id: string;                    // Guid / SerialNumber / Hostname
  assetId?: string | null;       // Liên kết tài sản phần cứng (nếu đã map)
  collectedAt: string;           // DateTime thu thập
  createdAt: string;             // DateTime tạo bản ghi

  // --- OS Info ---
  hostName: string;              // Tên máy trạm
  osName: string;                // Tên HĐH (VD: Windows 11 Pro)
  osBuildNumber: number;         // Build number (VD: 22631)
  osLicenseStatus: string;       // Trạng thái bản quyền OS
  osLicenseType: string;         // Loại giấy phép (OEM, Retail, Volume,...)
  osPartialProductKey: string;   // 5 ký tự cuối của Product Key
  osOemKeyInBios?: string;       // Key nhúng BIOS (nếu có)
  userName: string;              // Tên tài khoản đăng nhập máy
  domainOrWorkgroup: string;     // Tên Domain hoặc Workgroup

  // --- Office Info ---
  officeProductName: string;     // Tên bộ Office (VD: Microsoft 365, Office 2021)
  officeLicenseStatus: string;   // Trạng thái bản quyền Office
  officeLicenseType: string;     // Loại giấy phép Office
  officePartialProductKey: string; // 5 ký tự cuối của key Office

  // --- Motherboard Info ---
  mbManufacturer: string;        // Hãng bo mạch chủ (ASUS, Dell, HP,...)
  mbProduct: string;             // Model bo mạch chủ
  mbSerialNumber: string;        // Serial number bo mạch chủ
  mbBiosVersion: string;         // Phiên bản BIOS

  // --- CPU Info ---
  cpuName: string;               // Tên chip vi xử lý
  cpuCores: number;              // Số nhân vật lý
  cpuLogicals: number;           // Số luồng xử lý (Logical cores)
  cpuMaxClockSpeedMHz: number;   // Xung nhịp tối đa (MHz)

  // --- RAM Info ---
  ramTotalGB: number;            // Tổng dung lượng RAM (GB)
  ramUsedGB: number;             // RAM đang sử dụng (GB)
  ramFreeGB: number;             // RAM còn trống (GB)
  ramUsagePercent: number;       // Tỷ lệ sử dụng RAM (%)

  // --- Mở rộng chi tiết phần cứng (khi nạp từ API detail hoặc liên kết) ---
  disks?: DiskDto[];
  displays?: DisplayDto[];
  networks?: NetworkDto[];
  softwares?: SoftwareDto[];
  rawAudit?: any;
}

// Alias định danh tương thích ngược
export type WorkstationMonitoring = DeviceSystemAuditDto;

// Kiểm tra bản quyền OS (hỗ trợ cả chuỗi tiếng Anh lẫn tiếng Việt từ Agent thu thập)
export function isOsLicensed(status?: string): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s.includes("licensed") || s.includes("đã kích hoạt") || s.includes("bản quyền");
}

// Kiểm tra bản quyền Office
export function isOfficeLicensed(status?: string): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  if (s.includes("chưa kích hoạt") || s.includes("không tìm thấy") || s.includes("unlicensed") || s.includes("n/a")) {
    return false;
  }
  return s.includes("licensed") || s.includes("bản quyền") || s.includes("đã kích hoạt");
}

/**
 * Phân bổ chính xác danh sách phân vùng (C:\, D:\, G:\...) về đúng ổ đĩa vật lý tương ứng.
 */
export function distributePartitionsToDisks(rawDisks: any[]): DiskDto[] {
  if (!rawDisks || rawDisks.length === 0) return [];

  const allPartitionsMap = new Map<string, any>();

  rawDisks.forEach((d: any) => {
    if (Array.isArray(d.partitions)) {
      d.partitions.forEach((p: any) => {
        const key = (p?.label || p?.drive_letter || p?.driveLetter || "").trim().toUpperCase();
        if (key) {
          allPartitionsMap.set(key, p);
        }
      });
    }

    if (typeof d.disk_type === "string" && d.disk_type.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(d.disk_type);
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            const key = (p?.label || p?.drive_letter || p?.driveLetter || "").trim().toUpperCase();
            if (key) {
              allPartitionsMap.set(key, p);
            }
          });
        }
      } catch {
        // ignore
      }
    }
  });

  const allPartitions = Array.from(allPartitionsMap.values());

  if (allPartitions.length === 0) {
    return rawDisks;
  }

  const diskInfos = rawDisks.map((d, index) => {
    const driveLetterStr = (d.drive_letter ?? d.driveLetter ?? "").trim();
    const totalCap = Number(d.total_gb ?? d.totalGB ?? d.totalGb ?? 0);

    const sizeMatches: number[] = [];
    const regex = /(\d+(?:\.\d+)?)\s*GB/gi;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(driveLetterStr)) !== null) {
      if (match[1]) {
        sizeMatches.push(parseFloat(match[1]));
      }
    }

    return {
      index,
      disk: d,
      driveLetterStr,
      totalCap,
      sizes: sizeMatches,
      matchedPartitions: [] as any[],
    };
  });

  const unassignedPartitions: any[] = [];

  allPartitions.forEach((p) => {
    const pTotalGB = Number(p.totalGB ?? p.total_gb ?? (p.usedGB && p.freeGB ? p.usedGB + p.freeGB : 0));
    const pLabelLetter = (p.label || p.drive_letter || p.driveLetter || "").replace(/[^a-zA-Z]/g, "").toUpperCase();

    let bestDiskIndex = -1;

    if (pTotalGB > 0) {
      for (const info of diskInfos) {
        const hasMatchingSize = info.sizes.some(
          (size) => Math.abs(size - pTotalGB) < 1.0 || Math.abs(size - pTotalGB) / pTotalGB < 0.05
        );
        if (hasMatchingSize) {
          bestDiskIndex = info.index;
          break;
        }
      }
    }

    if (bestDiskIndex === -1 && pLabelLetter) {
      for (const info of diskInfos) {
        const dStr = info.driveLetterStr.toUpperCase();
        if (dStr.includes(pLabelLetter + ":") || dStr.includes(pLabelLetter + "\\")) {
          bestDiskIndex = info.index;
          break;
        }
      }
    }

    if (bestDiskIndex === -1 && pTotalGB > 0) {
      for (const info of diskInfos) {
        if (info.totalCap >= pTotalGB * 0.95) {
          bestDiskIndex = info.index;
          break;
        }
      }
    }

    if (bestDiskIndex !== -1) {
      diskInfos[bestDiskIndex].matchedPartitions.push(p);
    } else {
      unassignedPartitions.push(p);
    }
  });

  if (unassignedPartitions.length > 0 && diskInfos.length > 0) {
    unassignedPartitions.forEach((p) => {
      diskInfos[0].matchedPartitions.push(p);
    });
  }

  return diskInfos.map((info) => {
    const isSsd =
      (info.disk.model || "").toUpperCase().includes("SSD") ||
      (typeof info.disk.disk_type === "string" && info.disk.disk_type.toUpperCase().includes("SSD"));

    let cleanDiskType = info.disk.disk_type;
    if (typeof cleanDiskType === "string" && cleanDiskType.trim().startsWith("[")) {
      cleanDiskType = isSsd ? "SATA SSD" : "Physical Disk";
    }

    return {
      ...info.disk,
      disk_type: cleanDiskType,
      partitions: info.matchedPartitions,
    };
  });
}