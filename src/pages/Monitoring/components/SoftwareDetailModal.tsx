import React, { useState } from "react";
import { toast } from "sonner";
import {
  InstalledSoftware,
  SoftwareComplianceStatus,
} from "../../../models/Monitoring/installedSoftware";
import {
  CATEGORY_META,
  LICENSE_TYPE_META,
  SoftwareComplianceBadge,
  formatSizeMB,
} from "../installedSoftwareHelper";

interface SoftwareDetailModalProps {
  software: InstalledSoftware | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: SoftwareComplianceStatus) => void;
}

export const SoftwareDetailModal: React.FC<SoftwareDetailModalProps> = ({
  software,
  onClose,
  onUpdateStatus,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<SoftwareComplianceStatus | null>(null);

  if (!software) return null;

  const currentStatus = selectedStatus ?? software.complianceStatus;
  const categoryMeta = CATEGORY_META[software.category] || CATEGORY_META.Other;
  const licenseMeta = LICENSE_TYPE_META[software.licenseType] || LICENSE_TYPE_META.Unknown;

  const handleSaveStatus = (status: SoftwareComplianceStatus) => {
    setSelectedStatus(status);
    onUpdateStatus(software.id, status);
    toast.success(`Đã cập nhật trạng thái kiểm soát thành: ${status}`);
  };

  const handleCopyUninstall = () => {
    if (software.uninstallString) {
      navigator.clipboard.writeText(software.uninstallString);
      toast.success("Đã sao chép lệnh gỡ cài đặt vào bộ nhớ tạm!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-4 dark:border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-2xl shrink-0">
              {categoryMeta.icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate" title={software.displayName}>
                {software.displayName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  v{software.displayVersion} ({software.architecture})
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {software.publisher}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Khối 1: Thông tin máy cài đặt & Trạng thái tuân thủ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-gray-400 block mb-0.5">Máy trạm cài đặt</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              💻 {software.workstationHostName}
              {software.assetId && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {software.assetId}
                </span>
              )}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block mb-0.5">Trạng thái bảo mật IT</span>
            <SoftwareComplianceBadge status={currentStatus} />
          </div>

          <div>
            <span className="text-gray-400 block mb-0.5">Phân nhóm phần mềm</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium ${categoryMeta.color}`}>
              <span>{categoryMeta.icon}</span>
              <span>{categoryMeta.label}</span>
            </span>
          </div>

          <div>
            <span className="text-gray-400 block mb-0.5">Hình thức bản quyền</span>
            <span className={`inline-block px-2 py-0.5 rounded font-medium ${licenseMeta.badgeClass}`}>
              {licenseMeta.label}
            </span>
          </div>
        </div>

        {/* Khối 2: Chi tiết cài đặt & dung lượng */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Thông số kỹ thuật & Vị trí cài đặt
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <span className="text-gray-400 block">Dung lượng ước tính</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                {formatSizeMB(software.estimatedSizeMB)}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <span className="text-gray-400 block">Ngày ghi nhận cài đặt</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {new Date(software.installDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <span className="text-gray-400 block">Sử dụng lần cuối</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {software.lastUsedAt ? new Date(software.lastUsedAt).toLocaleDateString("vi-VN") : "Chưa có telemetry"}
              </span>
            </div>
          </div>

          {software.installLocation && (
            <div className="text-xs bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
              <span className="text-gray-400 block mb-1">Thư mục cài đặt (Install Directory):</span>
              <code className="font-mono text-gray-800 dark:text-gray-200 select-all break-all">
                {software.installLocation}
              </code>
            </div>
          )}

          {software.uninstallString && (
            <div className="text-xs bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400">Lệnh gỡ cài đặt từ Registry (Uninstall String):</span>
                <button
                  onClick={handleCopyUninstall}
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold cursor-pointer"
                >
                  Sao chép lệnh
                </button>
              </div>
              <code className="font-mono text-gray-800 dark:text-gray-200 select-all break-all block bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                {software.uninstallString}
              </code>
            </div>
          )}
        </div>

        {/* Khối 3: Thao tác thẩm định tuân thủ bảo mật */}
        <div className="pt-2 border-t dark:border-gray-800">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            Điều chỉnh chính sách tuân thủ cho phần mềm này:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSaveStatus("Approved")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                currentStatus === "Approved"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-emerald-50"
              }`}
            >
              ✓ Phê duyệt sử dụng
            </button>
            <button
              onClick={() => handleSaveStatus("UnderReview")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                currentStatus === "UnderReview"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-amber-50"
              }`}
            >
              ⚠️ Chờ rà soát
            </button>
            <button
              onClick={() => handleSaveStatus("Prohibited")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                currentStatus === "Prohibited"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-rose-50"
              }`}
            >
              ⛔ Nghiêm cấm (Shadow IT)
            </button>
            <button
              onClick={() => handleSaveStatus("Unlicensed")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                currentStatus === "Unlicensed"
                  ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-purple-50"
              }`}
            >
              🔑 Chưa có bản quyền
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t dark:border-gray-800">
          <button
            onClick={() => {
              toast.info(
                `Đã gửi yêu cầu gỡ cài đặt từ xa cho [${software.displayName}] qua AIMS Agent trên máy [${software.workstationHostName}]`
              );
              onClose();
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
          >
            🗑️ Yêu cầu Agent gỡ cài đặt từ xa
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
