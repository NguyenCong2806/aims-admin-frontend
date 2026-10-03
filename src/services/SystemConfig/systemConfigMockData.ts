import { SystemConfigFull } from "../../models/SystemConfig/systemConfigModel";

export const INITIAL_SYSTEM_CONFIG: SystemConfigFull = {
  general: {
    organizationName: "TẬP ĐOÀN CÔNG NGHỆ VÀ TRUYỀN THÔNG AIMS",
    taxId: "0109887766",
    hotline: "1900 6868 (Ext: 102 - Phòng IT)",
    supportEmail: "it-support@aims.vn",
    currency: "VND",
    dateFormat: "DD/MM/YYYY",
    timezone: "Asia/Ho_Chi_Minh (UTC+07:00)",
    language: "vi",
    assetPrefixHardware: "HW-",
    assetPrefixDigital: "DG-",
    assetPrefixLicense: "LIC-",
    autoGenerateAssetCode: true,
    depreciationMethodDefault: "STRAIGHT_LINE",
    defaultUsefulLifeMonths: 36, // 3 năm
    maxUploadFileSizeMb: 25,
  },

  printTemplates: {
    barcodeType: "QR_CODE",
    labelPaperSize: "50x30mm",
    showCompanyNameOnLabel: true,
    showSerialNumberOnLabel: true,
    showCategoryOnLabel: true,
    qrCodeUrlPrefix: "https://aims.company.vn/scan/asset/",

    handoverTitle: "BIÊN BẢN BÀN GIAO THIẾT BỊ CÔNG NGHỆ THÔNG TIN",
    handoverHeaderNote:
      "Căn cứ Quy chế quản lý và sử dụng tài sản CNTT của Tập đoàn AIMS; Hôm nay hai bên tiến hành bàn giao thiết bị phục vụ công việc với các thông số chi tiết dưới đây:",
    handoverTerms:
      "1. Người nhận cam kết bảo quản tài sản cẩn thận, chỉ phục vụ mục đích công việc của Công ty.\n2. Không tự ý tháo dỡ linh kiện, can thiệp phần cứng hoặc cài đặt phần mềm độc hại không có bản quyền.\n3. Khi thôi việc hoặc điều chuyển vị trí, phải hoàn trả lại đầy đủ thiết bị và phụ kiện cho Bộ phận IT.",
    receiverSignTitle: "CÁN BỘ TIẾP NHẬN SỬ DỤNG",
    delivererSignTitle: "ĐẠI DIỆN BỘ PHẬN IT / QUẢN LÝ TÀI SẢN",
    managerSignTitle: "XÁC NHẬN CỦA TRƯỞNG PHÒNG BAN",
    footerNote:
      "Biên bản được lập thành 02 bản có giá trị pháp lý như nhau, Bên giao giữ 01 bản, Bên nhận giữ 01 bản để theo dõi.",
  },

  notifications: {
    warrantyExpiringDays: 30,
    licenseExpiringDays: 15,
    maintenanceDueDays: 7,
    cpuRamAlertThresholdPercent: 90,

    enableEmailNotification: true,
    enableTelegramWebhook: true,
    enableSlackWebhook: false,
    enableInAppNotification: true,

    smtpHost: "smtp.office365.com",
    smtpPort: 587,
    smtpEncryption: "TLS",
    smtpUser: "notifications@aims.vn",
    smtpSenderName: "Hệ thống Quản trị Tài sản AIMS",
    smtpPasswordMasked: "••••••••••••",

    telegramBotToken: "6789012345:AAH7xYz_aimsBotSecurityToken",
    telegramChatId: "-1001988223344",
    slackWebhookUrl: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
  },

  security: {
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpireDays: 90,
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 60,
    require2FAForAdmins: true,
    require2FAForAllUsers: false,
    enableGoogleSso: true,
    enableMicrosoftSso: true,
    allowedIpWhitelist: "",
  },

  backup: {
    autoBackupDaily: true,
    backupTime: "02:30",
    retentionDays: 30,
    storageLocation: "LOCAL",
    telemetryHeartbeatMinutes: 15,
    autoCleanAuditLogsAfterMonths: 12,
    recentBackups: [
      {
        id: "bk-20260928",
        fileName: "aims_db_backup_20260928_023000.sql.gz",
        fileSizeBytes: 48920112, // ~46.6 MB
        createdAt: "2026-09-28T02:30:00Z",
        type: "AUTO",
        status: "SUCCESS",
        checksum: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      },
      {
        id: "bk-20260927",
        fileName: "aims_db_backup_20260927_023000.sql.gz",
        fileSizeBytes: 48450123,
        createdAt: "2026-09-27T02:30:00Z",
        type: "AUTO",
        status: "SUCCESS",
        checksum: "sha256:6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
      },
      {
        id: "bk-20260926",
        fileName: "aims_db_backup_20260926_023000.sql.gz",
        fileSizeBytes: 47910400,
        createdAt: "2026-09-26T02:30:00Z",
        type: "AUTO",
        status: "SUCCESS",
        checksum: "sha256:d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
      },
      {
        id: "bk-20260925-manual",
        fileName: "aims_db_backup_manual_before_upgrade.sql.gz",
        fileSizeBytes: 47800000,
        createdAt: "2026-09-25T14:10:00Z",
        type: "MANUAL",
        status: "SUCCESS",
        checksum: "sha256:4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
      },
    ],
  },

  lastSavedAt: "2026-09-28T16:00:00Z",
  lastSavedBy: "Nguyễn Văn An (SuperAdmin)",
};
