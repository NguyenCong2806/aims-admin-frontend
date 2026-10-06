import React from "react";
import { toast } from "sonner";
import { usecomputerauditsByDetail } from "../../../query/computeraudits/computerauditsQuery";
import { distributePartitionsToDisks } from "../../../models/Monitoring/DeviceSystemAuditDto";
import type {
  ComputerAuditDetailDto,
  DiskDto,
  DisplayDto,
  NetworkDto,
} from "../../../models/ComputerAudit/ComputerAuditDetailDto";

export interface WorkstationDetailModalProps {
  id: string | null;
  onClose: () => void;
}

export const WorkstationDetailModal: React.FC<WorkstationDetailModalProps> = ({
  id,
  onClose,
}) => {
  // Gọi API lấy thông số phần cứng chi tiết theo ID
  const { data: detailData, isLoading, isError, refetch } = usecomputerauditsByDetail(id);

  if (!id) return null;

  // Hỗ trợ cả trường hợp API trả về Result wrapper { data: { ... } } hoặc trực tiếp { ... }
  const detail: ComputerAuditDetailDto | null =
    (detailData as any)?.data ?? detailData ?? null;

  const rawDisks: DiskDto[] = detail?.disks || [];
  const disks = distributePartitionsToDisks(rawDisks as any[]);
  const displays: DisplayDto[] = detail?.displays || [];
  const networks: NetworkDto[] = detail?.networks || [];
  const assetId = detail?.asset_id || detail?.assetId || id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* ==================== 1. MODAL HEADER ==================== */}
        <div className="flex items-start justify-between border-b pb-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-xl">
              💻
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Chi tiết phần cứng máy trạm
                </h3>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60">
                  ID: {assetId}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Dữ liệu phần cứng (Ổ đĩa, Màn hình, Card mạng) từ AIMS Agent
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

        {/* ==================== 2. MODAL BODY ==================== */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-2">
            <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs text-gray-500 font-medium">Đang tải thông số chi tiết từ server...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
            <span className="text-rose-500 text-sm font-medium">Không thể tải dữ liệu chi tiết máy trạm!</span>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-semibold cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : (
          /* ==================== CHI TIẾT PHẦN CỨNG ==================== */
          <div className="space-y-5">
            {/* KHỐI 1: Ổ ĐĨA & PHÂN VÙNG (DISKS) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <span>💾</span>
                  <span>1. Ổ đĩa lưu trữ & Phân vùng ({disks.length})</span>
                </h4>
                <span className="text-[11px] font-mono text-gray-400">
                  Tổng: {disks.reduce((acc, d) => acc + (d.total_gb ?? d.totalGB ?? 0), 0).toFixed(1)} GB
                </span>
              </div>

              {disks.length > 0 ? (
                <div className="space-y-3">
                  {disks.map((d: any, idx: number) => {
                    const totalGb = Number(d.total_gb ?? d.totalGB ?? 0);
                    const partitions = Array.isArray(d.partitions) ? d.partitions : [];
                    const isSsd =
                      (d.model || "").toUpperCase().includes("SSD") ||
                      (d.disk_type || "").toUpperCase().includes("SSD");

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 space-y-2.5"
                      >
                        {/* Header ổ đĩa */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{isSsd ? "⚡" : "💽"}</span>
                            <div>
                              <div className="font-semibold text-xs text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                <span>{d.model || `Ổ đĩa #${idx}`}</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60">
                                  {d.disk_type && !d.disk_type.startsWith("[") ? d.disk_type : isSsd ? "SATA SSD" : "Physical Disk"}
                                </span>
                              </div>
                              {d.drive_letter && (
                                <p className="text-[11px] font-mono text-gray-400 mt-0.5 truncate max-w-[550px]" title={d.drive_letter}>
                                  {d.drive_letter}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                              {totalGb > 0 ? `${totalGb.toFixed(1)} GB` : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Danh sách phân vùng */}
                        {partitions.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                            {partitions.map((part: any, pIdx: number) => {
                              const pTotal = Number(part.totalGB ?? part.total_gb ?? 0);
                              const pFree = Number(part.freeGB ?? part.free_gb ?? 0);
                              const pUsed = Number(
                                part.usedGB ?? part.used_gb ?? (pTotal >= pFree ? pTotal - pFree : 0)
                              );
                              const usagePercent = pTotal > 0 ? Math.round((pUsed / pTotal) * 100) : 0;
                              const isNearFull = usagePercent > 85;
                              const partLabel =
                                part.drive_letter || part.driveLetter || part.label || `Part #${pIdx + 1}`;

                              return (
                                <div
                                  key={pIdx}
                                  className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-1.5 shadow-2xs"
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-gray-900 dark:text-white font-mono flex items-center gap-1">
                                      <span>📁</span>
                                      <span>{partLabel}</span>
                                    </span>
                                    <span className={`text-[10px] font-mono font-semibold ${isNearFull ? "text-rose-600" : "text-gray-500"}`}>
                                      {usagePercent}%
                                    </span>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        isNearFull ? "bg-rose-500" : usagePercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                                      }`}
                                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                    />
                                  </div>

                                  <div className="flex justify-between text-[10px] font-mono text-gray-400">
                                    <span>Đã dùng: {pUsed.toFixed(1)} GB</span>
                                    <span>Trống: {pFree.toFixed(1)} GB</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-400 italic pt-1">
                            Ổ cứng lưu trữ vật lý (Chưa phân chia phân vùng logic hoặc dùng cho dữ liệu phụ)
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-xs bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                  Chưa có thông tin ổ đĩa lưu trữ.
                </div>
              )}
            </div>

            {/* KHỐI 2: MÀN HÌNH HIỂN THỊ (DISPLAYS) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5 flex items-center gap-1.5">
                <span>🖥️</span>
                <span>2. Màn hình hiển thị ({displays.length})</span>
              </h4>

              {displays.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {displays.map((disp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-sm font-bold shrink-0">
                          🖥️
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-gray-900 dark:text-white truncate" title={disp.deviceName || disp.name}>
                            {disp.deviceName || disp.name || `Màn hình ${idx + 1}`}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Kích thước:{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {disp.physicalSizeInch || disp.resolution || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-xs bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                  Chưa có thông tin màn hình.
                </div>
              )}
            </div>

            {/* KHỐI 3: CARD MẠNG (NETWORKS) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5 flex items-center gap-1.5">
                <span>🌐</span>
                <span>3. Card mạng & Địa chỉ MAC ({networks.length})</span>
              </h4>

              {networks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {networks.map((net, idx) => {
                    const isBluetooth = (net.name || "").toLowerCase().includes("bluetooth");
                    const isVpn =
                      (net.name || "").toLowerCase().includes("vpn") ||
                      (net.name || "").toLowerCase().includes("fortinet");
                    const isWireless =
                      (net.name || "").toLowerCase().includes("wi-fi") ||
                      (net.name || "").toLowerCase().includes("wireless");

                    const icon = isBluetooth ? "🦷" : isVpn ? "🔒" : isWireless ? "📶" : "🖧";
                    const typeLabel = isBluetooth
                      ? "Bluetooth"
                      : isVpn
                      ? "VPN / Virtual"
                      : isWireless
                      ? "Wi-Fi"
                      : "Ethernet / LAN";

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base shrink-0">{icon}</span>
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-gray-900 dark:text-white truncate" title={net.name}>
                              {net.name}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                              <span className="font-semibold text-gray-600 dark:text-gray-400">{typeLabel}</span>
                              {net.ipAddress && <span>• IP: {net.ipAddress}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(net.macAddress);
                              toast.success(`Đã sao chép MAC: ${net.macAddress}`);
                            }}
                            className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Bấm để sao chép địa chỉ MAC"
                          >
                            <span>{net.macAddress}</span>
                            <span className="text-[9px]">📋</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400 text-xs bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                  Chưa có thông tin card mạng.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkstationDetailModal;
