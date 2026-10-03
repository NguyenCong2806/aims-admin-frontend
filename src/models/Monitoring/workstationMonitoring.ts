// Model phản chiếu chính xác thực thể C# WorkstationTelemetry/WorkstationMonitoring

export type LicenseStatus = 'Licensed' | 'Unlicensed' | 'Notification' | 'OOBGrace' | 'NonGenuineGrace' | string;

export interface WorkstationMonitoring {
  id: string;                    // Guid
  assetId?: string | null;       // Liên kết tài sản phần cứng (nếu đã map)
  collectedAt: string;           // DateTime thu thập
  createdAt: string;             // DateTime tạo bản ghi

  // --- OS Info ---
  hostName: string;              // Tên máy trạm
  osName: string;                // Tên HĐH (VD: Windows 11 Pro)
  osBuildNumber: number;         // Build number (VD: 22631)
  osLicenseStatus: LicenseStatus;// Trạng thái bản quyền OS
  osLicenseType: string;         // Loại giấy phép (OEM, Retail, Volume,...)
  osPartialProductKey: string;   // 5 ký tự cuối của Product Key
  osOemKeyInBios?: string;       // Key nhúng BIOS (nếu có)
  userName: string;              // Tên tài khoản đăng nhập máy
  domainOrWorkgroup: string;     // Tên Domain hoặc Workgroup

  // --- Office Info ---
  officeProductName: string;     // Tên bộ Office (VD: Microsoft 365, Office 2021)
  officeLicenseStatus: LicenseStatus; // Trạng thái bản quyền Office
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
}
