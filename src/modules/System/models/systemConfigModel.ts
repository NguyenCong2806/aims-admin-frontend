// Model Cấu hình & Thiết lập hệ thống AIMS (System Configuration & Settings)

export interface GeneralConfig {
  organizationName: string; // Tên công ty / tập đoàn
  taxId: string; // Mã số thuế
  hotline: string; // Hotline IT Helpdesk
  supportEmail: string; // Email hỗ trợ kỹ thuật
  currency: "VND" | "USD" | "EUR"; // Tiền tệ mặc định
  dateFormat: "DD/MM/YYYY" | "YYYY-MM-DD" | "MM/DD/YYYY"; // Định dạng ngày
  timezone: string; // Múi giờ, VD: "Asia/Ho_Chi_Minh (UTC+07:00)"
  language: "vi" | "en";
  assetPrefixHardware: string; // Tiền tố mã phần cứng: "HW-"
  assetPrefixDigital: string; // Tiền tố mã tài nguyên số: "DG-"
  assetPrefixLicense: string; // Tiền tố mã bản quyền phần mềm: "LIC-"
  autoGenerateAssetCode: boolean; // Tự động sinh mã tài sản tăng dần
  depreciationMethodDefault: "STRAIGHT_LINE" | "DECLINING_BALANCE"; // Phương pháp khấu hao mặc định
  defaultUsefulLifeMonths: number; // Thời gian khấu hao mặc định (tháng, VD: 36)
  maxUploadFileSizeMb: number; // Giới hạn kích thước file đính kèm (MB)
}

export interface PrintTemplateConfig {
  // Cấu hình nhãn Barcode / QR Code dán thiết bị
  barcodeType: "QR_CODE" | "CODE_128";
  labelPaperSize: "50x30mm" | "70x40mm" | "100x60mm" | "A4_DECALS";
  showCompanyNameOnLabel: boolean;
  showSerialNumberOnLabel: boolean;
  showCategoryOnLabel: boolean;
  qrCodeUrlPrefix: string; // VD: "https://aims.company.vn/scan/"

  // Mẫu biên bản bàn giao & thu hồi
  handoverTitle: string; // "BIÊN BẢN BÀN GIAO THIẾT BỊ CÔNG NGHỆ THÔNG TIN"
  handoverHeaderNote: string; // Đoạn trích dẫn quyết định / quy định công ty
  handoverTerms: string; // Điều khoản cam kết bảo quản tài sản
  receiverSignTitle: string; // "BÊN NHẬN (CÁN BỘ SỬ DỤNG)"
  delivererSignTitle: string; // "BÊN GIAO (BỘ PHẬN IT / QUẢN LÝ TÀI SẢN)"
  managerSignTitle: string; // "XÁC NHẬN CỦA TRƯỞNG BỘ PHẬN"
  footerNote: string; // "Biên bản được lập thành 02 bản, mỗi bên giữ 01 bản..."
}

export interface NotificationAlertConfig {
  // Ngưỡng cảnh báo tự động (ngày)
  warrantyExpiringDays: number; // Cảnh báo trước khi bảo hành hết hạn (ngày, VD: 30)
  licenseExpiringDays: number; // Cảnh báo bản quyền/SSL/Domain sắp hết hạn (ngày, VD: 15)
  maintenanceDueDays: number; // Cảnh báo bảo dưỡng định kỳ sắp đến (ngày, VD: 7)
  cpuRamAlertThresholdPercent: number; // Ngưỡng CPU/RAM máy trạm vượt mức (%, VD: 90)

  // Kênh thông báo
  enableEmailNotification: boolean;
  enableTelegramWebhook: boolean;
  enableSlackWebhook: boolean;
  enableInAppNotification: boolean;

  // Cấu hình SMTP
  smtpHost: string; // "smtp.gmail.com"
  smtpPort: number; // 587
  smtpEncryption: "TLS" | "SSL" | "NONE";
  smtpUser: string;
  smtpSenderName: string; // "AIMS IT Notification"
  smtpPasswordMasked: string; // "••••••••"

  // Webhook URLs
  telegramBotToken: string;
  telegramChatId: string;
  slackWebhookUrl: string;
}

export interface SecurityPolicyConfig {
  minPasswordLength: number; // Độ dài mật khẩu tối thiểu (VD: 8)
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpireDays: number; // Thời hạn mật khẩu (ngày, 0 = không bao giờ)
  maxLoginAttempts: number; // Số lần đăng nhập sai tối đa trước khi khóa (VD: 5)
  sessionTimeoutMinutes: number; // Thời gian timeout phiên không hoạt động (phút, VD: 60)
  require2FAForAdmins: boolean; // Bắt buộc 2FA cho Quản trị viên
  require2FAForAllUsers: boolean; // Bắt buộc 2FA cho tất cả người dùng
  enableGoogleSso: boolean;
  enableMicrosoftSso: boolean;
  allowedIpWhitelist: string; // Danh sách IP cho phép truy cập trang quản trị (để trống = all)
}

export interface BackupHistoryItem {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  createdAt: string;
  type: "AUTO" | "MANUAL";
  status: "SUCCESS" | "FAILED";
  checksum: string;
}

export interface BackupAutomationConfig {
  autoBackupDaily: boolean;
  backupTime: string; // "02:00"
  retentionDays: number; // Lưu trữ 30 ngày
  storageLocation: "LOCAL" | "S3_BUCKET" | "GOOGLE_DRIVE";
  telemetryHeartbeatMinutes: number; // Chu kỳ nhận telemetry máy trạm (VD: 15 phút)
  autoCleanAuditLogsAfterMonths: number; // Tự động nén/lưu trữ nhật ký sau (tháng, VD: 12)
  recentBackups: BackupHistoryItem[];
}

export interface SystemConfigFull {
  general: GeneralConfig;
  printTemplates: PrintTemplateConfig;
  notifications: NotificationAlertConfig;
  security: SecurityPolicyConfig;
  backup: BackupAutomationConfig;
  lastSavedAt: string;
  lastSavedBy: string;
}
