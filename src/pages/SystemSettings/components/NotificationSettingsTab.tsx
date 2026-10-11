import React, { useState } from "react";
import { NotificationAlertConfig } from "../../../models/SystemConfig/systemConfigModel";
import { systemConfigService } from "../../../services/SystemConfig/systemConfigService";
import { toast } from "sonner";

interface NotificationSettingsTabProps {
  data: NotificationAlertConfig;
  onChange: (updated: NotificationAlertConfig) => void;
}

export const NotificationSettingsTab: React.FC<NotificationSettingsTabProps> = ({
  data,
  onChange,
}) => {
  const [testingSmtp, setTestingSmtp] = useState<boolean>(false);
  const [testingTelegram, setTestingTelegram] = useState<boolean>(false);

  const handleChange = <K extends keyof NotificationAlertConfig>(
    field: K,
    value: NotificationAlertConfig[K]
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    try {
      const res = await systemConfigService.testSmtpConnection(
        data.smtpHost,
        data.smtpPort,
        data.smtpUser
      );
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ SMTP");
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    try {
      const res = await systemConfigService.testTelegramWebhook(
        data.telegramBotToken,
        data.telegramChatId
      );
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Lỗi gửi webhook Telegram");
    } finally {
      setTestingTelegram(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Ngưỡng Cảnh báo Tự động (Alert Thresholds) */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg">
            🔔
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Quy tắc Ngưỡng Cảnh báo Sớm (Early Alerts)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Hệ thống tự động quét và gửi cảnh báo trước thời điểm xảy ra sự kiện
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Bảo hành phần cứng sắp hết hạn
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={180}
                value={data.warrantyExpiringDays}
                onChange={(e) => handleChange("warrantyExpiringDays", Number(e.target.value))}
                className="w-24 px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">ngày trước</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Áp dụng cho Laptop, PC, Máy chủ</p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Bản quyền / SSL / Domain hết hạn
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={90}
                value={data.licenseExpiringDays}
                onChange={(e) => handleChange("licenseExpiringDays", Number(e.target.value))}
                className="w-24 px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">ngày trước</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Để kịp thời làm thủ tục gia hạn</p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Lịch bảo trì định kỳ sắp tới
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={30}
                value={data.maintenanceDueDays}
                onChange={(e) => handleChange("maintenanceDueDays", Number(e.target.value))}
                className="w-24 px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">ngày trước</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Nhắc nhở kỹ thuật viên chuẩn bị</p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Ngưỡng cảnh báo quá tải RAM/CPU
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={50}
                max={99}
                value={data.cpuRamAlertThresholdPercent}
                onChange={(e) => handleChange("cpuRamAlertThresholdPercent", Number(e.target.value))}
                className="w-24 px-3 py-1.5 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">% tải</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Thu thập qua Telemetry Agent</p>
          </div>
        </div>
      </div>

      {/* 2. Kênh Thông báo (Channels) */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
          Kênh Gửi Thông báo
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">✉️</span>
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">Email (SMTP)</span>
                <p className="text-[10px] text-gray-400">Gửi mail tự động</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data.enableEmailNotification}
              onChange={(e) => handleChange("enableEmailNotification", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">✈️</span>
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">Telegram Bot</span>
                <p className="text-[10px] text-gray-400">Nhóm hỗ trợ IT</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data.enableTelegramWebhook}
              onChange={(e) => handleChange("enableTelegramWebhook", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">💬</span>
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">Slack Webhook</span>
                <p className="text-[10px] text-gray-400">Kênh #it-alerts</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data.enableSlackWebhook}
              onChange={(e) => handleChange("enableSlackWebhook", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🔔</span>
              <div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">In-App Alerts</span>
                <p className="text-[10px] text-gray-400">Chuông thông báo</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={data.enableInAppNotification}
              onChange={(e) => handleChange("enableInAppNotification", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>
        </div>
      </div>

      {/* 3. Cấu hình Máy chủ Email (SMTP) & Kiểm tra kết nối */}
      {data.enableEmailNotification && (
        <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Thông số Máy chủ SMTP Email
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cấu hình tài khoản dịch vụ gửi mail hệ thống (Microsoft 365, Google Workspace, SendGrid)
              </p>
            </div>
            <button
              type="button"
              disabled={testingSmtp}
              onClick={handleTestSmtp}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors disabled:opacity-50"
            >
              {testingSmtp ? "Đang kiểm tra kết nối..." : "⚡ Gửi email thử nghiệm"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                SMTP Host
              </label>
              <input
                type="text"
                value={data.smtpHost}
                onChange={(e) => handleChange("smtpHost", e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                SMTP Port
              </label>
              <input
                type="number"
                value={data.smtpPort}
                onChange={(e) => handleChange("smtpPort", Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Mã hóa (Encryption)
              </label>
              <select
                value={data.smtpEncryption}
                onChange={(e) => handleChange("smtpEncryption", e.target.value as NotificationAlertConfig["smtpEncryption"])}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="TLS">STARTTLS (Khuyên dùng - Port 587)</option>
                <option value="SSL">SSL / TLS (Port 465)</option>
                <option value="NONE">Không mã hóa (Plaintext - Port 25)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tài khoản gửi (Username / Email)
              </label>
              <input
                type="text"
                value={data.smtpUser}
                onChange={(e) => handleChange("smtpUser", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Tên người gửi (Sender Display Name)
              </label>
              <input
                type="text"
                value={data.smtpSenderName}
                onChange={(e) => handleChange("smtpSenderName", e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Mật khẩu ứng dụng (App Password)
              </label>
              <input
                type="password"
                value={data.smtpPasswordMasked}
                onChange={(e) => handleChange("smtpPasswordMasked", e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Cấu hình Telegram Webhook */}
      {data.enableTelegramWebhook && (
        <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Thông số Telegram Bot Webhook
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Bắn tin nhắn thông báo tức thì vào nhóm Telegram của đội ngũ Quản trị IT
              </p>
            </div>
            <button
              type="button"
              disabled={testingTelegram}
              onClick={handleTestTelegram}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 border border-cyan-200 dark:border-cyan-800 transition-colors disabled:opacity-50"
            >
              {testingTelegram ? "Đang gửi..." : "✈️ Bắn tin thử nghiệm"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Bot API Token
              </label>
              <input
                type="password"
                value={data.telegramBotToken}
                onChange={(e) => handleChange("telegramBotToken", e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Chat ID / Group Channel ID
              </label>
              <input
                type="text"
                value={data.telegramChatId}
                onChange={(e) => handleChange("telegramChatId", e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
