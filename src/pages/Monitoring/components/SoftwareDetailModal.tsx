import React from "react";
import { toast } from "sonner";
import type { SoftwareDto } from "../installedSoftwareHelper";
import {
  InstallTypeBadge,
  detectSoftwareIcon,
} from "../installedSoftwareHelper";

export interface SoftwareDetailModalProps {
  software: SoftwareDto | null;
  workstationHostName?: string;
  assetId?: string | null;
  onClose: () => void;
}

export const SoftwareDetailModal: React.FC<SoftwareDetailModalProps> = ({
  software,
  workstationHostName,
  assetId,
  onClose,
}) => {
  if (!software) return null;

  const icon = detectSoftwareIcon(software.name);

  const handleCopyText = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label} vào bộ nhớ tạm!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* ==================== 1. MODAL HEADER ==================== */}
        <div className="flex items-start justify-between border-b pb-4 dark:border-gray-800">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center text-2xl shrink-0 shadow-2xs border border-purple-100 dark:border-purple-900/40">
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 dark:text-white truncate" title={software.name}>
                {software.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Thông số phần mềm từ API hệ thống telemetry máy trạm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold cursor-pointer"
            aria-label="Đóng modal"
          >
            ✕
          </button>
        </div>

        {/* ==================== 2. THÔNG SỐ CHI TIẾT ==================== */}
        <div className="space-y-3.5 text-xs">
          {/* Tên phần mềm */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/60 flex items-center justify-between gap-2">
            <div>
              <span className="text-gray-400 text-[11px] block">Tên ứng dụng / Gói phần mềm:</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm break-all">
                {software.name}
              </span>
            </div>
            <button
              onClick={() => handleCopyText(software.name, "tên phần mềm")}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700 cursor-pointer"
              title="Sao chép tên phần mềm"
            >
              📋
            </button>
          </div>

          {/* Phiên bản & Quyền cài đặt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/60">
              <span className="text-gray-400 text-[11px] block">Phiên bản (Version):</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                  {software.version || "Không xác định"}
                </span>
                {software.version && (
                  <button
                    onClick={() => handleCopyText(software.version, "phiên bản")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-pointer"
                    title="Sao chép phiên bản"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/60">
              <span className="text-gray-400 text-[11px] block">Quyền cài đặt (Install Type):</span>
              <div className="mt-1 flex items-center gap-1.5">
                <InstallTypeBadge installType={software.installType} />
              </div>
            </div>
          </div>

          {/* Máy trạm đang cài */}
          {(workstationHostName || assetId) && (
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/60 flex items-center justify-between">
              <div>
                <span className="text-gray-400 text-[11px] block">Máy trạm cài đặt:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  💻 {workstationHostName || "Máy trạm"}
                </span>
              </div>
              {assetId && (
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60">
                  {assetId}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ==================== 3. MODAL FOOTER ==================== */}
        <div className="flex justify-end pt-3 border-t dark:border-gray-800">
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

export default SoftwareDetailModal;
