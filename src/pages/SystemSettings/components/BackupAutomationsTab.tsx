import React, { useState } from "react";
import {
  BackupAutomationConfig,
  BackupHistoryItem,
} from "../../../models/SystemConfig/systemConfigModel";
import { systemConfigService } from "../../../services/SystemConfig/systemConfigService";
import { toast } from "sonner";

interface BackupAutomationsTabProps {
  data: BackupAutomationConfig;
  onChange: (updated: BackupAutomationConfig) => void;
}

export const BackupAutomationsTab: React.FC<BackupAutomationsTabProps> = ({
  data,
  onChange,
}) => {
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);

  const handleChange = <K extends keyof BackupAutomationConfig>(
    field: K,
    value: BackupAutomationConfig[K]
  ) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    try {
      const newBackup = await systemConfigService.createImmediateBackup();
      onChange({
        ...data,
        recentBackups: [newBackup, ...data.recentBackups],
      });
      toast.success(`Đã tạo bản sao lưu thành công: ${newBackup.fileName}`);
    } catch {
      toast.error("Không thể tạo bản sao lưu!");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownload = (backup: BackupHistoryItem) => {
    systemConfigService.downloadBackupFile(backup);
    toast.info(`Đang tải tệp sao lưu: ${backup.fileName}`);
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Kế hoạch Sao lưu Cơ sở dữ liệu tự động */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
              💾
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Sao lưu Dữ liệu Tự động & Chu kỳ Đồng bộ
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Lên lịch snapshot cơ sở dữ liệu định kỳ chống rủi ro ransomware và sự cố phần cứng
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isBackingUp}
            onClick={handleBackupNow}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50"
          >
            {isBackingUp ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Đang sao lưu hệ thống...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Tạo bản sao lưu ngay</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                Tự động sao lưu hàng ngày
              </span>
              <p className="text-[10px] text-gray-400">Lúc 02:30 AM đêm</p>
            </div>
            <input
              type="checkbox"
              checked={data.autoBackupDaily}
              onChange={(e) => handleChange("autoBackupDaily", e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Thời gian lưu trữ tệp sao lưu (Retention)
            </label>
            <select
              value={data.retentionDays}
              onChange={(e) => handleChange("retentionDays", Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={7}>7 ngày gần nhất</option>
              <option value={15}>15 ngày gần nhất</option>
              <option value={30}>30 ngày (Khuyên dùng)</option>
              <option value={90}>90 ngày (3 tháng)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Chu kỳ Heartbeat Agent máy trạm
            </label>
            <select
              value={data.telemetryHeartbeatMinutes}
              onChange={(e) => handleChange("telemetryHeartbeatMinutes", Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={5}>5 phút / lần (Độ trễ thấp)</option>
              <option value={15}>15 phút / lần (Khuyên dùng)</option>
              <option value={30}>30 phút / lần (Tiết kiệm băng thông)</option>
              <option value={60}>60 phút / lần</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nén & Lưu trữ Nhật ký Audit sau
            </label>
            <select
              value={data.autoCleanAuditLogsAfterMonths}
              onChange={(e) => handleChange("autoCleanAuditLogsAfterMonths", Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value={6}>6 tháng</option>
              <option value={12}>12 tháng (Chuẩn SOC 2)</option>
              <option value={24}>24 tháng (2 năm)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Danh sách các bản Sao lưu gần nhất */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Lịch sử Bản sao lưu gần đây ({data.recentBackups.length} tệp)
          </h4>
          <span className="text-[11px] text-gray-400">
            Được mã hóa AES-256 và kèm chữ ký số SHA-256 toàn vẹn dữ liệu
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-semibold">
                <th className="p-3">Tên tệp tin sao lưu</th>
                <th className="p-3">Dung lượng</th>
                <th className="p-3">Thời gian tạo</th>
                <th className="p-3">Loại sao lưu</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.recentBackups.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="p-3 font-mono font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🗄️</span>
                    <span>{item.fileName}</span>
                  </td>
                  <td className="p-3 font-mono text-gray-600 dark:text-gray-300">
                    {formatFileSize(item.fileSizeBytes)}
                  </td>
                  <td className="p-3 text-gray-500 dark:text-gray-400">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.type === "AUTO"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          : "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                      }`}
                    >
                      {item.type === "AUTO" ? "Tự động" : "Thủ công"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Hoàn thành
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>📥</span>
                      <span>Tải về</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
