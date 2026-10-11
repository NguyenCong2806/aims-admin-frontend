import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import PageMeta from "../../components/common/PageMeta";
import { SystemConfigFull } from "../../models/SystemConfig/systemConfigModel";
import { INITIAL_SYSTEM_CONFIG } from "../../services/SystemConfig/systemConfigMockData";
import { systemConfigService } from "../../services/SystemConfig/systemConfigService";
import { GeneralSettingsTab } from "./components/GeneralSettingsTab";
import { PrintTemplatesTab } from "./components/PrintTemplatesTab";
import { NotificationSettingsTab } from "./components/NotificationSettingsTab";
import { SecurityPolicyTab } from "./components/SecurityPolicyTab";
import { BackupAutomationsTab } from "./components/BackupAutomationsTab";

export type SettingsTabKey = "general" | "templates" | "notifications" | "security" | "backup";

export const SystemSettingsPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfigFull>(INITIAL_SYSTEM_CONFIG);
  const [initialConfig, setInitialConfig] = useState<SystemConfigFull>(INITIAL_SYSTEM_CONFIG);
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("general");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    systemConfigService.getConfig().then((res) => {
      setConfig(res);
      setInitialConfig(res);
    });
  }, []);

  // Kiểm tra trạng thái đã thay đổi dữ liệu chưa
  const hasChanges = JSON.stringify(config) !== JSON.stringify(initialConfig);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await systemConfigService.saveConfig(config);
      setConfig(saved);
      setInitialConfig(saved);
      toast.success("Đã lưu toàn bộ cấu hình hệ thống thành công!");
    } catch {
      toast.error("Không thể lưu cấu hình!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy bỏ các thay đổi chưa lưu?")) {
      setConfig(JSON.parse(JSON.stringify(initialConfig)));
      toast.info("Đã khôi phục lại cấu hình ban đầu.");
    }
  };

  return (
    <>
      <PageMeta
        title="Cấu hình hệ thống - Hệ thống Quản trị Tài sản AIMS"
        description="Thiết lập tham số chung, quy tắc sinh mã tài sản, mẫu in tem QR/Barcode, biên bản bàn giao, cảnh báo sớm và bảo mật hệ thống AIMS"
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Module Level Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
          <Link
            to="/tai-khoan"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span>👥</span>
            <span>Tài khoản người dùng</span>
          </Link>
          <Link
            to="/phan-quyen"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span>🛡️</span>
            <span>Phân quyền (RBAC)</span>
          </Link>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
            <span>⚙️</span>
            <span>Cấu hình hệ thống</span>
          </div>
        </div>

        {/* Header Bar */}
        <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-2xl shadow-sm shrink-0">
                ⚙️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    Cấu hình hệ thống
                  </h1>
                  {hasChanges && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                      ● Có thay đổi chưa lưu
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Thiết lập tham số chung, mẫu in ấn, cảnh báo sớm, chính sách bảo mật và sao lưu dữ liệu
                </p>
              </div>
            </div>

            {/* Action Save/Undo buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              {hasChanges && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Hủy thay đổi
                </button>
              )}
              <button
                type="button"
                disabled={isSaving || !hasChanges}
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Lưu cấu hình</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/50">
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Tiền tố mã</span>
              <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                {config.general.assetPrefixHardware} | {config.general.assetPrefixDigital} | {config.general.assetPrefixLicense}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/50">
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Định dạng tem</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {config.printTemplates.barcodeType} ({config.printTemplates.labelPaperSize})
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/50">
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Xác thực 2FA</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {config.security.require2FAForAdmins ? "✓ Bắt buộc cho Quản trị" : "Tùy chọn"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-gray-800/50">
              <span className="text-[10px] text-gray-400 font-semibold uppercase block">Sao lưu tự động</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {config.backup.autoBackupDaily ? `Hàng ngày (${config.backup.backupTime})` : "Tắt"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto pb-1">
          {[
            { key: "general", label: "Cấu hình chung", icon: "🏢" },
            { key: "templates", label: "Mẫu in & Biên bản", icon: "🏷️" },
            { key: "notifications", label: "Thông báo & Cảnh báo", icon: "🔔" },
            { key: "security", label: "Chính sách Bảo mật", icon: "🔐" },
            { key: "backup", label: "Sao lưu & Tự động hóa", icon: "💾" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as SettingsTabKey)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200 dark:shadow-none"
                  : "bg-white dark:bg-gray-850 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-800"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Active Tab View */}
        <div>
          {activeTab === "general" && (
            <GeneralSettingsTab
              data={config.general}
              onChange={(updated) => setConfig({ ...config, general: updated })}
            />
          )}

          {activeTab === "templates" && (
            <PrintTemplatesTab
              data={config.printTemplates}
              organizationName={config.general.organizationName}
              onChange={(updated) => setConfig({ ...config, printTemplates: updated })}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationSettingsTab
              data={config.notifications}
              onChange={(updated) => setConfig({ ...config, notifications: updated })}
            />
          )}

          {activeTab === "security" && (
            <SecurityPolicyTab
              data={config.security}
              onChange={(updated) => setConfig({ ...config, security: updated })}
            />
          )}

          {activeTab === "backup" && (
            <BackupAutomationsTab
              data={config.backup}
              onChange={(updated) => setConfig({ ...config, backup: updated })}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default SystemSettingsPage;
