import {
  SystemConfigFull,
  BackupHistoryItem,
} from "../../models/SystemConfig/systemConfigModel";
import { INITIAL_SYSTEM_CONFIG } from "./systemConfigMockData";

class SystemConfigService {
  private config: SystemConfigFull = JSON.parse(JSON.stringify(INITIAL_SYSTEM_CONFIG));

  async getConfig(): Promise<SystemConfigFull> {
    await new Promise((resolve) => setTimeout(resolve, 60));
    return JSON.parse(JSON.stringify(this.config));
  }

  async saveConfig(newConfig: SystemConfigFull): Promise<SystemConfigFull> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    this.config = {
      ...newConfig,
      lastSavedAt: new Date().toISOString(),
      lastSavedBy: "Nguyễn Văn An (SuperAdmin)",
    };
    return JSON.parse(JSON.stringify(this.config));
  }

  async testSmtpConnection(
    host: string,
    port: number,
    user: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!host || !port || !user) {
      return {
        success: false,
        message: "Vui lòng điền đầy đủ Host, Port và Email người gửi để kiểm tra!",
      };
    }
    return {
      success: true,
      message: `Kết nối thành công đến máy chủ SMTP ${host}:${port}. Đã gửi email xác thực mẫu!`,
    };
  }

  async testTelegramWebhook(
    token: string,
    chatId: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!token || !chatId) {
      return {
        success: false,
        message: "Vui lòng nhập Bot Token và Chat ID của kênh Telegram!",
      };
    }
    return {
      success: true,
      message: "Gửi bản tin thử nghiệm tới nhóm Telegram thành công!",
    };
  }

  async createImmediateBackup(): Promise<BackupHistoryItem> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T]/g, "").slice(0, 14);

    const newBackup: BackupHistoryItem = {
      id: `bk-${Date.now()}`,
      fileName: `aims_db_backup_manual_${dateStr}.sql.gz`,
      fileSizeBytes: Math.floor(48000000 + Math.random() * 2000000),
      createdAt: now.toISOString(),
      type: "MANUAL",
      status: "SUCCESS",
      checksum: `sha256:${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")}`,
    };

    this.config.backup.recentBackups = [
      newBackup,
      ...this.config.backup.recentBackups,
    ];

    return newBackup;
  }

  downloadBackupFile(backup: BackupHistoryItem) {
    const dummyContent = `-- AIMS IT Asset Management Database Backup
-- Generated: ${backup.createdAt}
-- Checksum: ${backup.checksum}
-- File: ${backup.fileName}
-- Total Tables: 28 (hardware_assets, digital_assets, maintenance_plans, system_logs...)
`;
    const blob = new Blob([dummyContent], { type: "application/gzip" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = backup.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const systemConfigService = new SystemConfigService();
