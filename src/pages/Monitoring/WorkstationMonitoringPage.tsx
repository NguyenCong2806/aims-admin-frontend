import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode } from "../../components/aims";
import PageMeta from "../../components/common/PageMeta";
import { PaginationFilter } from "../../models/base/PaginationFilter";
import { usecomputerauditsParams } from "../../query/computeraudits/computerauditsQuery";
import { WorkstationDetailModal } from "./components/WorkstationDetailModal";
import {
  DeviceSystemAuditDto,
  isOsLicensed,
  isOfficeLicensed,
} from "../../models/Monitoring/DeviceSystemAuditDto";

export const WorkstationMonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState<string>("");
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal State - Chi tiết phần cứng máy trạm
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  // Gọi API lấy dữ liệu Telemetry từ backend (đã phân trang & tìm kiếm theo keyword phía server)
  const filter: PaginationFilter = useMemo(
    () => ({
      MaxPageSize: 100,
      PageIndex: pageIndex,
      PageSize: pageSize,
      Keyword: keyword.trim() || undefined,
    }),
    [pageIndex, pageSize, keyword]
  );

  const { data, isPending, isFetching, isError, refetch } = usecomputerauditsParams(filter);

  // Hiển thị trực tiếp danh sách máy trạm từ backend
  const items: DeviceSystemAuditDto[] = data?.items || [];
  const totalRecordsCount = data?.pagination?.totalRecords ?? items.length;

  // Helper tính thời gian tương đối & trạng thái online
  const getConnectionStatus = (collectedAtIso: string) => {
    const diffHours = (Date.now() - new Date(collectedAtIso).getTime()) / (1000 * 60 * 60);
    if (diffHours < 2) return { label: "Trực tuyến", color: "bg-emerald-500", ping: true };
    if (diffHours < 24) return { label: "Hôm nay", color: "bg-amber-500", ping: false };
    return { label: "Ngoại tuyến", color: "bg-gray-400", ping: false };
  };

  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  // Helper chuẩn hóa hiển thị Product Key (ví dụ: XXXXX-XXXXX-...-3V66T -> ***-3V66T, N/A -> N/A)
  const formatProductKey = (key?: string) => {
    if (!key || key === "N/A" || key.trim() === "") return "N/A";
    if (key.includes("XXXXX")) {
      const parts = key.split("-").filter(Boolean);
      const lastPart = parts[parts.length - 1];
      return `***-${lastPart || key}`;
    }
    return key.startsWith("***") ? key : `***-${key}`;
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    setSelectedIds(new Set());
    toast.success("Đã xóa các bản ghi telemetry đã chọn!");
  };

  return (
    <>
      <PageMeta
        title="Giám sát máy trạm | AIMS Enterprise"
        description="Theo dõi telemetry phần cứng, bản quyền Windows & Office, tài nguyên RAM CPU của các máy trạm tự động"
      />

      <AimsBasePageLayout
        moduleName="Quản lý Tài sản IT"
        moduleIcon={
          <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        moduleTabs={[
          { name: "Thiết bị phần cứng", path: "/thiet-bi-phan-cung" },
          { name: "Giám sát máy trạm", path: "/giam-sat-may-tram", badge: totalRecordsCount },
          { name: "Phần mềm theo máy", path: "/giam-sat-may-tram/phan-mem" },
          { name: "Tài nguyên số", path: "/tai-nguyen-so" },
        ]}
        title="Giám sát máy trạm"
        subtitle="Dữ liệu phần cứng, bản quyền Windows/Office & hiệu năng thu thập tự động qua AIMS Agent"
        isFetching={isFetching}
        totalRecords={totalRecordsCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onAddNew={() => {
          toast.info("AIMS Agent: Tải file chạy telemetry `aims-agent-setup.exe` để thu thập dữ liệu máy trạm tự động.");
        }}
        addNewLabel="Tải AIMS Agent"
        onExportExcel={() => toast.success("Đang xuất báo cáo kiểm kê máy trạm ra Excel...")}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBatchDelete={handleBatchDelete}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      >
        {(currentViewMode) =>
          currentViewMode === "list" ? (
            /* ==================== 1. LIST VIEW (DATA TABLE) ==================== */
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-xs z-10 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 select-none">
                  <tr>
                    <th className="w-10 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.size > 0 && selectedIds.size === items.length}
                        onChange={() => {
                          if (selectedIds.size === items.length) setSelectedIds(new Set());
                          else setSelectedIds(new Set(items.map((r) => r.id)));
                        }}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                        title="Chọn tất cả trên trang"
                      />
                    </th>
                    <th className="px-4 py-3">Máy trạm & Người dùng</th>
                    <th className="px-4 py-3">Tài sản liên kết</th>
                    <th className="px-4 py-3">Hệ điều hành & Key</th>
                    <th className="px-4 py-3">Microsoft Office</th>
                    <th className="px-4 py-3">Phần cứng (CPU & Tải RAM)</th>
                    <th className="px-4 py-3">Bo mạch chủ</th>
                    <th className="px-4 py-3">Thu thập</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs sm:text-sm">
                  {items.length > 0 ? (
                    items.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      const conn = getConnectionStatus(item.collectedAt);
                      const isRamCritical = item.ramUsagePercent > 85;
                      const osLic = isOsLicensed(item.osLicenseStatus);
                      const officeLic = isOfficeLicensed(item.officeLicenseStatus);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedAuditId(item.id)}
                          className={`transition-colors group cursor-pointer ${isSelected
                            ? "bg-brand-50/80 dark:bg-brand-950/40 font-medium text-brand-950 dark:text-brand-100"
                            : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300"
                            }`}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const next = new Set(selectedIds);
                                if (next.has(item.id)) next.delete(item.id);
                                else next.add(item.id);
                                setSelectedIds(next);
                              }}
                              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                          </td>

                          {/* Máy trạm & Người dùng */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              {/* Pulse Status */}
                              <span className="relative flex h-2.5 w-2.5 shrink-0" title={conn.label}>
                                {conn.ping && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${conn.color}`}></span>
                              </span>

                              <div>
                                <div className="font-mono font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                  <span>{item.hostName}</span>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                                  <span>👤 {item.userName || "N/A"}</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[120px]">{item.domainOrWorkgroup}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Tài sản liên kết */}
                          <td className="px-4 py-3.5">
                            {item.assetId ? (
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                                {item.assetId}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Chưa liên kết</span>
                            )}
                          </td>

                          {/* Hệ điều hành & Bản quyền */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>{item.osName}</span>
                              {item.osBuildNumber > 0 && (
                                <span className="text-[10px] font-mono text-gray-400">b.{item.osBuildNumber}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${osLic
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60"
                                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60"
                                  }`}
                              >
                                {osLic ? "Đã kích hoạt" : item.osLicenseStatus}
                              </span>
                              {item.osPartialProductKey && item.osPartialProductKey !== "N/A" && (
                                <span className="text-xs font-mono text-gray-500">
                                  Key: {formatProductKey(item.osPartialProductKey)}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Microsoft Office */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-900 dark:text-white truncate max-w-[190px]" title={item.officeProductName}>
                              {item.officeProductName || "Chưa cài đặt"}
                            </div>
                            {item.officeProductName ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${officeLic
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60"
                                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60"
                                    }`}
                                >
                                  {officeLic ? "Bản quyền" : item.officeLicenseStatus || "Chưa kích hoạt"}
                                </span>
                                {item.officePartialProductKey && item.officePartialProductKey !== "N/A" && (
                                  <span className="text-xs font-mono text-gray-500">
                                    Key: {formatProductKey(item.officePartialProductKey)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>

                          {/* Phần cứng: CPU & RAM */}
                          <td className="px-4 py-3.5 min-w-[200px]">
                            <div className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate max-w-[210px]" title={item.cpuName}>
                              {item.cpuName.replace(/\(R\)|\(TM\)/g, "")}
                            </div>
                            {/* RAM Progress Bar */}
                            <div className="mt-1.5">
                              <div className="flex justify-between text-[11px] text-gray-500 mb-0.5">
                                <span>RAM: {item.ramUsedGB.toFixed(1)} / {item.ramTotalGB.toFixed(0)} GB</span>
                                <span className={isRamCritical ? "font-bold text-rose-600 dark:text-rose-400" : ""}>
                                  {item.ramUsagePercent.toFixed(0)}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${isRamCritical
                                    ? "bg-rose-500"
                                    : item.ramUsagePercent > 70
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                    }`}
                                  style={{ width: `${Math.min(item.ramUsagePercent, 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Badges thông số phần cứng (Ổ đĩa, Màn hình, Mạng) */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedAuditId(item.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 transition-colors cursor-pointer"
                                title="Xem thông số ổ đĩa & phân vùng"
                              >
                                <span>💾</span>
                                <span>{item.disks?.length || 0} Ổ đĩa</span>
                              </button>
                              <button
                                onClick={() => setSelectedAuditId(item.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50/90 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 transition-colors cursor-pointer"
                                title="Xem thông số màn hình hiển thị"
                              >
                                <span>🖥️</span>
                                <span>{item.displays?.length || 0} Màn hình</span>
                              </button>
                              <button
                                onClick={() => setSelectedAuditId(item.id)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-50/90 hover:bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/40 transition-colors cursor-pointer"
                                title="Xem thông số card mạng & địa chỉ MAC"
                              >
                                <span>🌐</span>
                                <span>{item.networks?.length || 0} Mạng</span>
                              </button>
                            </div>
                          </td>

                          {/* Bo mạch chủ */}
                          <td className="px-4 py-3.5">
                            <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]" title={`${item.mbManufacturer} ${item.mbProduct}`}>
                              {item.mbManufacturer} {item.mbProduct}
                            </div>
                            <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                              S/N: {item.mbSerialNumber || "N/A"}
                            </div>
                          </td>

                          {/* Thời gian thu thập */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400" title={new Date(item.collectedAt).toLocaleString()}>
                            {formatTimeAgo(item.collectedAt)}
                          </td>

                          {/* Thao tác */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Nút Xem Chi Tiết Phần Cứng */}
                              <button
                                onClick={() => setSelectedAuditId(item.id)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="Xem chi tiết thông số phần cứng: Ổ đĩa, Màn hình, Card mạng"
                              >
                                <span>⚙️</span>
                                <span>Chi tiết</span>
                              </button>

                              {/* Nút Xem Phần Mềm */}
                              <button
                                onClick={() => navigate(`/giam-sat-may-tram/phan-mem/${item.id}`)}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/60 text-brand-600 dark:text-brand-400 transition-colors cursor-pointer flex items-center gap-1"
                                title="Xem danh sách phần mềm cài đặt trên máy trạm này"
                              >
                                <span>📦</span>
                                <span>Phần mềm</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                        {isPending ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <svg className="animate-spin h-6 w-6 text-brand-600" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-xs text-gray-500">Đang tải dữ liệu telemetry từ hệ thống...</span>
                          </div>
                        ) : isError ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="text-rose-500 text-sm">Không thể kết nối đến API máy trạm!</span>
                            <button
                              onClick={() => refetch()}
                              className="px-3 py-1 text-xs bg-brand-50 text-brand-600 rounded-md hover:bg-brand-100 cursor-pointer"
                            >
                              Thử lại
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center gap-1">
                            <span className="text-2xl">💻</span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Không tìm thấy máy trạm nào phù hợp</span>
                            <span className="text-xs text-gray-400">Hãy thử đổi từ khóa tìm kiếm hoặc kiểm tra trạng thái AIMS Agent</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* ==================== 2. GRID / CARDS VIEW ==================== */
            <div className="flex-1 overflow-auto p-4 bg-gray-50/60 dark:bg-gray-950/40">
              {items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const conn = getConnectionStatus(item.collectedAt);
                  const isRamCritical = item.ramUsagePercent > 85;
                  const osLic = isOsLicensed(item.osLicenseStatus);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAuditId(item.id)}
                      className={`p-4 rounded-xl border bg-white dark:bg-gray-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${isSelected ? "border-brand-500 ring-2 ring-brand-500/20" : "border-gray-200 dark:border-gray-700/80"
                        }`}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5 shrink-0" title={conn.label}>
                              {conn.ping && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              )}
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${conn.color}`}></span>
                            </span>
                            <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                              {item.hostName}
                            </span>
                          </div>

                          {item.assetId ? (
                            <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60">
                              {item.assetId}
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                              Chưa map
                            </span>
                          )}
                        </div>

                        {/* User & Domain */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                          <span>👤 {item.userName || "N/A"}</span>
                          <span>•</span>
                          <span className="truncate">{item.domainOrWorkgroup}</span>
                        </div>

                        {/* Specs overview */}
                        <div className="mt-3.5 space-y-2 text-xs">
                          <div className="text-gray-500 dark:text-gray-400 flex justify-between items-center">
                            <span>Bản quyền Windows:</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${osLic
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                                }`}
                            >
                              {osLic ? "Đã kích hoạt" : item.osLicenseStatus}
                            </span>
                          </div>

                          <div className="text-gray-500 dark:text-gray-400 truncate" title={item.cpuName}>
                            CPU: <span className="text-gray-800 dark:text-gray-200 font-medium">{item.cpuName.replace(/\(R\)|\(TM\)/g, "")}</span>
                          </div>

                          {/* RAM Mini bar */}
                          <div className="pt-1">
                            <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                              <span>RAM: {item.ramUsedGB.toFixed(1)} / {item.ramTotalGB.toFixed(0)} GB</span>
                              <span className={isRamCritical ? "font-bold text-rose-500" : ""}>{item.ramUsagePercent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isRamCritical ? "bg-rose-500" : item.ramUsagePercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                style={{ width: `${Math.min(item.ramUsagePercent, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Hardware peripherals chips */}
                          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-500">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAuditId(item.id);
                              }}
                              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-medium"
                              title="Bấm để xem thông số ổ đĩa & phân vùng"
                            >
                              <span>💾</span>
                              <span><b className="font-semibold text-gray-700 dark:text-gray-300">{item.disks?.length || 1}</b> ổ đĩa</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAuditId(item.id);
                              }}
                              className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer font-medium"
                              title="Bấm để xem thông số màn hình"
                            >
                              <span>🖥️</span>
                              <span><b className="font-semibold text-gray-700 dark:text-gray-300">{item.displays?.length || 1}</b> màn hình</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAuditId(item.id);
                              }}
                              className="flex items-center gap-1 hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer font-medium"
                              title="Bấm để xem thông số card mạng & MAC"
                            >
                              <span>🌐</span>
                              <span><b className="font-semibold text-gray-700 dark:text-gray-300">{item.networks?.length || 1}</b> mạng</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                        <span>{formatTimeAgo(item.collectedAt)}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAuditId(item.id);
                            }}
                            className="px-2 py-1 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 transition-colors cursor-pointer flex items-center gap-1"
                            title="Xem chi tiết thông số phần cứng"
                          >
                            <span>⚙️</span>
                            <span>Chi tiết</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/giam-sat-may-tram/phan-mem/${item.id}`);
                            }}
                            className="px-2 py-1 text-xs font-medium rounded-lg text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/40 cursor-pointer flex items-center gap-1"
                            title="Xem phần mềm cài đặt"
                          >
                            <span>📦</span>
                            <span>Phần mềm</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
                <span className="text-3xl mb-2">💻</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Không tìm thấy máy trạm nào</span>
                <span className="text-xs text-gray-400 mt-1">Dữ liệu telemetry máy trạm sẽ tự động hiển thị khi AIMS Agent gửi báo cáo</span>
              </div>
            )}
          </div>
        )
        }
      </AimsBasePageLayout>

      {/* ==================== 3. MODAL CHI TIẾT CẤU HÌNH PHẦN CỨNG ==================== */}
      {selectedAuditId && (
        <WorkstationDetailModal
          id={selectedAuditId}
          onClose={() => setSelectedAuditId(null)}
        />
      )}
    </>
  );
};

export default WorkstationMonitoringPage;
