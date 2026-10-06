import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../components/aims";
import PageMeta from "../../components/common/PageMeta";
import { DeviceSystemAuditDto } from "../../models/Monitoring/DeviceSystemAuditDto";
import { SoftwareDetailModal } from "./components/SoftwareDetailModal";
import {
  SoftwareDto,
  InstallTypeBadge,
  detectSoftwareIcon,
  exportSoftwareToCsv,
} from "./installedSoftwareHelper";
import {
  usecomputerauditsParams,
  usecomputerauditsofware,
} from "../../query/computeraudits/computerauditsQuery";

export const WorkstationInstalledSoftwarePage: React.FC = () => {
  const { id: routeWorkstationId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Gọi API lấy danh sách máy trạm từ backend để hiển thị dropdown chuyển đổi máy trạm
  const { data: auditData, isLoading: isLoadingAudits } = usecomputerauditsParams({
    MaxPageSize: 100,
    PageIndex: 1,
    PageSize: 100,
  });

  const workstations = useMemo<DeviceSystemAuditDto[]>(() => {
    if (!auditData?.items || !Array.isArray(auditData.items)) return [];
    return auditData.items;
  }, [auditData?.items]);

  // ID máy trạm đang chọn
  const [selectedWorkstationId, setSelectedWorkstationId] = useState<string>(routeWorkstationId || "");

  // Đồng bộ chọn máy trạm khi danh sách máy trạm hoặc route param thay đổi
  useEffect(() => {
    if (workstations.length > 0) {
      if (routeWorkstationId) {
        const matched = workstations.find(
          (w) => w.id === routeWorkstationId || w.assetId === routeWorkstationId
        );
        if (matched) {
          setSelectedWorkstationId(matched.id);
          return;
        }
      }
      if (!selectedWorkstationId || !workstations.some((w) => w.id === selectedWorkstationId)) {
        setSelectedWorkstationId(workstations[0].id);
      }
    }
  }, [routeWorkstationId, workstations, selectedWorkstationId]);

  const currentWorkstation: DeviceSystemAuditDto | undefined = useMemo(() => {
    return workstations.find((w) => w.id === selectedWorkstationId) || workstations[0];
  }, [workstations, selectedWorkstationId]);

  // Target ID để gọi API lấy danh sách phần mềm cài đặt: /detail_softwares/{id}
  const targetAuditId = useMemo(() => {
    return currentWorkstation?.id || routeWorkstationId || null;
  }, [currentWorkstation, routeWorkstationId]);

  // State tìm kiếm & bộ lọc
  const [keyword, setKeyword] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(15);
  const [selectedSoftwareNames, setSelectedSoftwareNames] = useState<Set<string>>(new Set());

  // Modal chi tiết phần mềm
  const [inspectingSoftware, setInspectingSoftware] = useState<SoftwareDto | null>(null);

  // Gọi API lấy danh sách phần mềm cài đặt từ endpoint /detail_softwares/{id}
  const {
    data: softwareListData,
    isLoading: isLoadingSoftwares,
    isError,
    refetch,
  } = usecomputerauditsofware(targetAuditId);

  // Danh sách phần mềm gốc từ API backend
  const softwareList: SoftwareDto[] = useMemo(() => {
    if (!softwareListData || !Array.isArray(softwareListData)) return [];
    return softwareListData;
  }, [softwareListData]);

  const isLoading = isLoadingAudits || (Boolean(targetAuditId) && isLoadingSoftwares);

  // Thống kê số lượng phần mềm thực tế
  const stats = useMemo(() => {
    const total = softwareList.length;
    const adminCount = softwareList.filter((s) =>
      (s.installType || "").toLowerCase().includes("admin") &&
      !(s.installType || "").toLowerCase().includes("non-admin")
    ).length;
    const nonAdminCount = softwareList.filter(
      (s) =>
        (s.installType || "").toLowerCase().includes("non-admin") ||
        (s.installType || "").toLowerCase().includes("user")
    ).length;
    const otherCount = total - adminCount - nonAdminCount;

    return { total, adminCount, nonAdminCount, otherCount };
  }, [softwareList]);

  // Cây phân cấp bộ lọc (AimsTreeFilter) theo quyền cài đặt thực tế
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    return [
      {
        id: "installTypeGroup",
        title: "QUYỀN CÀI ĐẶT (INSTALL TYPE)",
        items: [
          { id: "all", label: "Tất cả phần mềm", count: stats.total },
          { id: "type_Admin", label: "🛡️ Quản trị viên (Admin)", count: stats.adminCount },
          { id: "type_Non-Admin", label: "👤 Người dùng (Non-Admin)", count: stats.nonAdminCount },
        ],
      },
    ];
  }, [stats]);

  // Lọc dữ liệu theo từ khóa tìm kiếm & bộ lọc
  const filteredSoftware = useMemo(() => {
    return softwareList.filter((item) => {
      // 1. Keyword search (theo tên phần mềm hoặc phiên bản)
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchVer = (item.version || "").toLowerCase().includes(q);
        if (!matchName && !matchVer) return false;
      }

      // 2. Tree filter (theo installType)
      if (selectedFilter && selectedFilter !== "all") {
        const filterStr = String(selectedFilter);
        if (filterStr === "type_Admin") {
          const isAdm =
            (item.installType || "").toLowerCase().includes("admin") &&
            !(item.installType || "").toLowerCase().includes("non-admin");
          if (!isAdm) return false;
        } else if (filterStr === "type_Non-Admin") {
          const isNonAdm =
            (item.installType || "").toLowerCase().includes("non-admin") ||
            (item.installType || "").toLowerCase().includes("user");
          if (!isNonAdm) return false;
        }
      }

      return true;
    });
  }, [softwareList, keyword, selectedFilter]);

  // Phân trang danh sách phần mềm
  const paginatedSoftware = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredSoftware.slice(start, start + pageSize);
  }, [filteredSoftware, pageIndex, pageSize]);

  // Multi-select
  const toggleSelectAll = () => {
    if (selectedSoftwareNames.size === filteredSoftware.length && filteredSoftware.length > 0) {
      setSelectedSoftwareNames(new Set());
    } else {
      setSelectedSoftwareNames(new Set(filteredSoftware.map((s) => s.name)));
    }
  };

  const toggleSelectOne = (name: string) => {
    setSelectedSoftwareNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Xuất file CSV
  const handleExportCsv = () => {
    if (filteredSoftware.length === 0) {
      toast.error("Không có phần mềm nào để xuất file!");
      return;
    }
    try {
      exportSoftwareToCsv(currentWorkstation, filteredSoftware);
      toast.success(
        `Đã xuất ${filteredSoftware.length} phần mềm của máy [${currentWorkstation?.hostName || "thiết bị"}] ra file CSV!`
      );
    } catch {
      toast.error("Không thể xuất file kiểm kê phần mềm");
    }
  };

  // Chuyển đổi máy trạm
  const handleSwitchWorkstation = (newId: string) => {
    setSelectedWorkstationId(newId);
    setSelectedSoftwareNames(new Set());
    setPageIndex(1);
    navigate(`/giam-sat-may-tram/phan-mem/${newId}`);
  };

  return (
    <>
      <PageMeta
        title={`Phần mềm máy trạm: ${currentWorkstation?.hostName || "AIMS"} | AIMS Enterprise`}
        description="Kiểm kê danh mục phần mềm cài đặt trên máy trạm từ hệ thống AIMS Agent"
      />

      {/* ================= 1. KHỐI CHỌN MÁY TRẠM & TỔNG QUAN ================= */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white p-4 border-b border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Workstation Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💻</span>
              <div>
                <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Đang kiểm kê phần mềm máy trạm:
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                  <select
                    value={selectedWorkstationId}
                    onChange={(e) => handleSwitchWorkstation(e.target.value)}
                    disabled={workstations.length === 0}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer disabled:opacity-50"
                  >
                    {workstations.length > 0 ? (
                      workstations.map((w) => (
                        <option key={w.id} value={w.id} className="text-gray-900 bg-white">
                          {w.hostName} {w.assetId ? `(${w.assetId})` : ""} - {w.userName || "N/A"}
                        </option>
                      ))
                    ) : (
                      <option value="" className="text-gray-900 bg-white">
                        Chưa có máy trạm nào
                      </option>
                    )}
                  </select>
                  {currentWorkstation?.assetId && (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Mã tài sản: {currentWorkstation.assetId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick KPIs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] uppercase text-indigo-200 block font-semibold">Tổng phần mềm</span>
              <span className="text-base font-extrabold text-white">{stats.total}</span>
            </div>

            <div className="bg-purple-950/40 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-purple-500/30 text-center">
              <span className="text-[10px] uppercase text-purple-300 block font-semibold">Quyền Admin</span>
              <span className="text-base font-extrabold text-purple-300">{stats.adminCount}</span>
            </div>

            <div className="bg-blue-950/40 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-blue-500/30 text-center">
              <span className="text-[10px] uppercase text-blue-300 block font-semibold">Quyền Người dùng</span>
              <span className="text-base font-extrabold text-blue-300">{stats.nonAdminCount}</span>
            </div>

            <button
              onClick={() => {
                refetch();
                toast.success("Đang làm mới danh mục phần mềm từ server...");
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Làm mới danh sách phần mềm"
            >
              <span>🔄</span>
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. BỐ CỤC CHÍNH (AimsBasePageLayout) ================= */}
      <AimsBasePageLayout
        moduleName="Quản lý Tài sản IT"
        moduleIcon={
          <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        moduleTabs={[
          { name: "Thiết bị phần cứng", path: "/thiet-bi-phan-cung" },
          { name: "Giám sát máy trạm", path: "/giam-sat-may-tram" },
          {
            name: "Phần mềm theo máy",
            path: selectedWorkstationId ? `/giam-sat-may-tram/phan-mem/${selectedWorkstationId}` : `/giam-sat-may-tram/phan-mem`,
            badge: stats.total,
          },
          { name: "Tài nguyên số", path: "/tai-nguyen-so" },
        ]}
        title={`Danh mục phần mềm: ${currentWorkstation?.hostName || ""}`}
        subtitle={`Dữ liệu cài đặt thực tế - Người dùng: ${currentWorkstation?.userName || "N/A"} | HĐH: ${currentWorkstation?.osName || "N/A"}`}
        totalRecords={filteredSoftware.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onExportExcel={handleExportCsv}
        selectedCount={selectedSoftwareNames.size}
        onClearSelection={() => setSelectedSoftwareNames(new Set())}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFilter}
        onSelectTreeFilter={(val) => {
          setSelectedFilter(val);
          setPageIndex(1);
        }}
        isLoading={isLoading}
      >
        {isError ? (
          <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
            <span className="text-rose-500 text-sm font-semibold">
              Không thể tải danh sách phần mềm từ API hệ thống!
            </span>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* ==================== BẢNG DANH SÁCH (TABLE) ==================== */
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-800/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedSoftwareNames.size === filteredSoftware.length &&
                        filteredSoftware.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="px-4 py-3">Tên phần mềm</th>
                  <th className="px-4 py-3">Phiên bản</th>
                  <th className="px-4 py-3">Quyền cài đặt (Install Type)</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                {paginatedSoftware.length > 0 ? (
                  paginatedSoftware.map((item, idx) => {
                    const isSelected = selectedSoftwareNames.has(item.name);
                    const icon = detectSoftwareIcon(item.name);
                    const rowNumber = (pageIndex - 1) * pageSize + idx + 1;

                    return (
                      <tr
                        key={`${item.name}-${idx}`}
                        onClick={() => setInspectingSoftware(item)}
                        className={`group hover:bg-brand-50/40 dark:hover:bg-brand-950/20 transition-colors cursor-pointer ${
                          isSelected ? "bg-brand-50/70 dark:bg-brand-950/40" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(item.name)}
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          />
                        </td>

                        {/* STT */}
                        <td className="py-3.5 px-3 text-center font-mono text-gray-400">
                          {rowNumber}
                        </td>

                        {/* Tên phần mềm */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="text-xl shrink-0 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                              {icon}
                            </span>
                            <div className="min-w-0">
                              <div
                                className="font-semibold text-gray-900 dark:text-white truncate max-w-[420px]"
                                title={item.name}
                              >
                                {item.name}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phiên bản */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {item.version || "N/A"}
                          </span>
                        </td>

                        {/* Quyền cài đặt */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <InstallTypeBadge installType={item.installType} />
                        </td>

                        {/* Thao tác */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setInspectingSoftware(item)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-3xl">🔍</span>
                        <span className="text-sm font-medium">Không tìm thấy phần mềm nào phù hợp</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ==================== CARD VIEW ==================== */
          <div className="flex-1 overflow-auto p-4 bg-gray-50/50 dark:bg-gray-900">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedSoftware.map((item, idx) => {
                const isSelected = selectedSoftwareNames.has(item.name);
                const icon = detectSoftwareIcon(item.name);

                return (
                  <div
                    key={`${item.name}-${idx}`}
                    onClick={() => setInspectingSoftware(item)}
                    className={`p-4 rounded-xl border bg-white dark:bg-gray-800 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-brand-500 ring-2 ring-brand-500/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-2xl p-2 rounded-xl bg-gray-100 dark:bg-gray-700/60">
                          {icon}
                        </span>
                        <InstallTypeBadge installType={item.installType} />
                      </div>

                      <div className="font-bold text-gray-900 dark:text-white text-xs line-clamp-2" title={item.name}>
                        {item.name}
                      </div>

                      <div className="mt-2 text-[11px] font-mono text-gray-500">
                        Phiên bản: <span className="font-semibold text-gray-700 dark:text-gray-300">{item.version || "N/A"}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
                      <span className="text-gray-400 text-[11px]">Thông tin chi tiết</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingSoftware(item);
                        }}
                        className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                      >
                        Xem &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </AimsBasePageLayout>

      {/* Modal xem chi tiết phần mềm */}
      {inspectingSoftware && (
        <SoftwareDetailModal
          software={inspectingSoftware}
          workstationHostName={currentWorkstation?.hostName}
          assetId={currentWorkstation?.assetId}
          onClose={() => setInspectingSoftware(null)}
        />
      )}
    </>
  );
};

export default WorkstationInstalledSoftwarePage;
