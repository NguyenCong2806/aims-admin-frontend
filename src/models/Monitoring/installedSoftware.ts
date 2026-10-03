// Model quản lý danh mục phần mềm cài đặt trên máy trạm (Workstation Installed Software Inventory)

export type SoftwareCategory =
  | "Office"
  | "Development"
  | "Security"
  | "System"
  | "Utility"
  | "Design"
  | "Communication"
  | "Other";

export type SoftwareLicenseType =
  | "Commercial"
  | "Free / OpenSource"
  | "Subscription"
  | "Unlicensed"
  | "Unknown";

export type SoftwareComplianceStatus =
  | "Approved"      // Đã được phê duyệt theo chính sách IT Security
  | "UnderReview"   // Đang trong quá trình rà soát bảo mật / giấy phép
  | "Prohibited"    // Nghiêm cấm sử dụng (Shadow IT, Crack, P2P, rủi ro mã độc)
  | "Unlicensed";   // Thiếu license hoặc vi phạm chính sách bản quyền

export interface InstalledSoftware {
  id: string;
  workstationId: string;           // Khóa ngoại liên kết tới WorkstationMonitoring.id
  workstationHostName: string;      // Tên máy trạm (VD: DESKTOP-IT-HOANG)
  assetId?: string | null;          // Mã tài sản (VD: IT-PC-0021)
  displayName: string;              // Tên hiển thị của phần mềm
  displayVersion: string;           // Phiên bản cài đặt
  publisher: string;                // Nhà phát hành (Microsoft, Google, Adobe...)
  installDate: string;              // Ngày cài đặt (YYYY-MM-DD)
  estimatedSizeMB: number;          // Dung lượng ước tính chiếm dụng (MB)
  installLocation?: string;         // Đường dẫn thư mục cài đặt
  uninstallString?: string;         // Lệnh gỡ cài đặt từ Registry
  category: SoftwareCategory;       // Phân nhóm chức năng
  licenseType: SoftwareLicenseType; // Hình thức bản quyền
  complianceStatus: SoftwareComplianceStatus; // Trạng thái kiểm soát bảo mật
  architecture: "64-bit" | "32-bit"; // Kiến trúc nhị phân
  lastUsedAt?: string;              // Thời gian mở ứng dụng lần cuối
  iconUrl?: string;                 // URL hoặc biểu tượng
}

export interface SoftwareInventoryFilter {
  workstationId?: string;
  keyword?: string;
  category?: string;
  complianceStatus?: string;
  licenseType?: string;
  publisher?: string;
}
