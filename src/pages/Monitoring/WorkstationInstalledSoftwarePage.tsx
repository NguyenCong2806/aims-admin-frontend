import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../components/aims";
import PageMeta from "../../components/common/PageMeta";
import {
  InstalledSoftware,
  SoftwareComplianceStatus,
} from "../../models/Monitoring/installedSoftware";
import { WorkstationMonitoring } from "../../models/Monitoring/workstationMonitoring";
import { INITIAL_WORKSTATIONS } from "../../services/Monitoring/workstationMockData";
import { installedSoftwareService } from "../../services/Monitoring/installedSoftwareService";
import { SoftwareDetailModal } from "./components/SoftwareDetailModal";
import {
  CATEGORY_META,
  LICENSE_TYPE_META,
  SoftwareComplianceBadge,
  formatSizeMB,
} from "./installedSoftwareHelper";

export const WorkstationInstalledSoftwarePage: React.FC = () => {
  const { id: routeWorkstationId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  // Danh sách máy trạm để chuyển đổi
  const workstations = INITIAL_WORKSTATIONS;

  // Xác định máy trạm đang được chọn
  const [selectedWorkstationId, setSelectedWorkstationId] = useState<string>(() => {
    if (routeWorkstationId) {
      const matched = workstations.find(
        (w) => w.id === routeWorkstationId || w.assetId === routeWorkstationId
      );
      if (matched) return matched.id;
    }
    return workstations[0]?.id || "";
  });

  // Khi param trên URL thay đổi
  useEffect(() => {
    if (routeWorkstationId) {
      const matched = workstations.find(
        (w) => w.id === routeWorkstationId || w.assetId === routeWorkstationId
      );
      if (matched && matched.id !== selectedWorkstationId) {
        setSelectedWorkstationId(matched.id);
      }
    }
  }, [routeWorkstationId, workstations, selectedWorkstationId]);

  const currentWorkstation: WorkstationMonitoring | undefined = useMemo(() => {
    return workstations.find((w) => w.id === selectedWorkstationId) || workstations[0];
  }, [workstations, selectedWorkstationId]);

  // State danh mục phần mềm
  const [softwareList, setSoftwareList] = useState<InstalledSoftware[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(12);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal chi tiết
  const [inspectingSoftware, setInspectingSoftware] = useState<InstalledSoftware | null>(null);

  // Tải danh sách phần mềm theo máy trạm
  useEffect(() => {
    if (!selectedWorkstationId) return;
    setIsLoading(true);
    installedSoftwareService
      .getByWorkstationId(selectedWorkstationId)
      .then((data) => {
        setSoftwareList(data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Không thể tải danh sách phần mềm của máy trạm");
        setIsLoading(false);
      });
  }, [selectedWorkstationId]);

  // Thống kê nhanh theo máy trạm
  const stats = useMemo(() => {
    const total = softwareList.length;
    const totalSizeMB = softwareList.reduce((acc, s) => acc + s.estimatedSizeMB, 0);
    const approved = softwareList.filter((s) => s.complianceStatus === "Approved").length;
    const underReview = softwareList.filter((s) => s.complianceStatus === "UnderReview").length;
    const prohibited = softwareList.filter((s) => s.complianceStatus === "Prohibited").length;
    const unlicensed = softwareList.filter((s) => s.complianceStatus === "Unlicensed").length;

    return { total, totalSizeMB, approved, underReview, prohibited, unlicensed };
  }, [softwareList]);

  // Cây phân cấp bộ lọc (AimsTreeFilter)
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    // 1. Phân nhóm danh mục
    const catCounts: Record<string, number> = {};
    softwareList.forEach((s) => {
      catCounts[s.category] = (catCounts[s.category] || 0) + 1;
    });

    // 2. Nhà phát hành
    const pubCounts: Record<string, number> = {};
    softwareList.forEach((s) => {
      pubCounts[s.publisher] = (pubCounts[s.publisher] || 0) + 1;
    });

    return [
      {
        id: "compliance",
        title: "KIỂM SOÁT TUÂN THỦ (SHADOW IT)",
        items: [
          { id: "all", label: "Tất cả phần mềm", count: softwareList.length },
          { id: "comp_Approved", label: "Đã phê duyệt (Approved)", count: stats.approved },
          { id: "comp_UnderReview", label: "Cần rà soát (Under Review)", count: stats.underReview },
          { id: "comp_Prohibited", label: "Nghiêm cấm / Rủi ro cao", count: stats.prohibited },
          { id: "comp_Unlicensed", label: "Chưa kích hoạt license", count: stats.unlicensed },
        ],
      },
      {
        id: "categories",
        title: "PHÂN NHÓM CHỨC NĂNG",
        items: Object.entries(catCounts).map(([cat, count]) => {
          const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META] || CATEGORY_META.Other;
          return {
            id: `cat_${cat}`,
            label: `${meta.icon} ${meta.label}`,
            count,
          };
        }),
      },
      {
        id: "licenses",
        title: "HÌNH THỨC BẢN QUYỀN",
        items: [
          {
            id: "lic_Free / OpenSource",
            label: "Miễn phí / Mã nguồn mở",
            count: softwareList.filter((s) => s.licenseType === "Free / OpenSource").length,
          },
          {
            id: "lic_Commercial",
            label: "Bản quyền vĩnh viễn",
            count: softwareList.filter((s) => s.licenseType === "Commercial").length,
          },
          {
            id: "lic_Subscription",
            label: "Thuê bao (Subscription)",
            count: softwareList.filter((s) => s.licenseType === "Subscription").length,
          },
        ],
      },
      {
        id: "publishers",
        title: "NHÀ PHÁT HÀNH",
        items: Object.entries(pubCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([pub, count]) => ({
            id: `pub_${pub}`,
            label: pub,
            count,
          })),
      },
    ];
  }, [softwareList, stats]);

  // Bộ lọc dữ liệu theo từ khóa & Tree filter
  const filteredSoftware = useMemo(() => {
    return softwareList.filter((item) => {
      // 1. Keyword search
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchName = item.displayName.toLowerCase().includes(q);
        const matchPub = item.publisher.toLowerCase().includes(q);
        const matchVer = item.displayVersion.toLowerCase().includes(q);
        if (!matchName && !matchPub && !matchVer) return false;
      }

      // 2. Tree filter
      if (selectedFilter && selectedFilter !== "all") {
        const filterStr = String(selectedFilter);

        if (filterStr.startsWith("comp_")) {
          const comp = filterStr.replace("comp_", "");
          if (item.complianceStatus !== comp) return false;
        }

        if (filterStr.startsWith("cat_")) {
          const cat = filterStr.replace("cat_", "");
          if (item.category !== cat) return false;
        }

        if (filterStr.startsWith("lic_")) {
          const lic = filterStr.replace("lic_", "");
          if (item.licenseType !== lic) return false;
        }

        if (filterStr.startsWith("pub_")) {
          const pub = filterStr.replace("pub_", "");
          if (item.publisher.toLowerCase() !== pub.toLowerCase()) return false;
        }
      }

      return true;
    });
  }, [softwareList, keyword, selectedFilter]);

  // Phân trang
  const paginatedSoftware = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredSoftware.slice(start, start + pageSize);
  }, [filteredSoftware, pageIndex, pageSize]);

  // Multi-select
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredSoftware.length && filteredSoftware.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredSoftware.map((s) => s.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Cập nhật trạng thái
  const handleUpdateStatus = async (id: string, status: SoftwareComplianceStatus) => {
    await installedSoftwareService.updateComplianceStatus(id, status);
    setSoftwareList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, complianceStatus: status } : s))
    );
  };

  // Thao tác hàng loạt (Batch approval)
  const handleBatchApprove = () => {
    if (selectedIds.size === 0) return;
    setSoftwareList((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, complianceStatus: "Approved" } : s))
    );
    toast.success(`Đã phê duyệt ${selectedIds.size} phần mềm được chọn!`);
    setSelectedIds(new Set());
  };

  const handleBatchProhibit = () => {
    if (selectedIds.size === 0) return;
    setSoftwareList((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, complianceStatus: "Prohibited" } : s))
    );
    toast.error(`Đã đưa ${selectedIds.size} phần mềm vào danh mục Cấm sử dụng!`);
    setSelectedIds(new Set());
  };

  // Xuất file CSV
  const handleExportCsv = () => {
    if (!currentWorkstation) return;
    try {
      installedSoftwareService.exportCsv(currentWorkstation, filteredSoftware);
      toast.success(
        `Đã xuất ${filteredSoftware.length} phần mềm của máy [${currentWorkstation.hostName}] ra file CSV!`
      );
    } catch {
      toast.error("Không thể xuất file kiểm kê phần mềm");
    }
  };

  // Đổi máy trạm
  const handleSwitchWorkstation = (newId: string) => {
    setSelectedWorkstationId(newId);
    setSelectedIds(new Set());
    setPageIndex(1);
    navigate(`/giam-sat-may-tram/${newId}/phan-mem`);
  };

  return (
    <>
      <PageMeta
        title={`Phần mềm máy trạm: ${currentWorkstation?.hostName || "AIMS"} | AIMS Enterprise`}
        description="Kiểm kê danh mục phần mềm cài đặt trên máy trạm, phát hiện Shadow IT và giám sát bản quyền doanh nghiệp"
      />

      {/* ================= 1. KHỐI CHỌN MÁY TRẠM & TÓM TẮT THIẾT BỊ ================= */}
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
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                  >
                    {workstations.map((w) => (
                      <option key={w.id} value={w.id} className="text-gray-900 bg-white">
                        {w.hostName} {w.assetId ? `(${w.assetId})` : "(Chưa map)"} - {w.userName || "N/A"}
                      </option>
                    ))}
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

          {/* Quick KPIs for the selected machine */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] uppercase text-indigo-200 block font-semibold">Tổng phần mềm</span>
              <span className="text-base font-extrabold text-white">{stats.total}</span>
            </div>

            <div className="bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] uppercase text-indigo-200 block font-semibold">Chiếm dung lượng</span>
              <span className="text-base font-extrabold text-white font-mono">{formatSizeMB(stats.totalSizeMB)}</span>
            </div>

            <div className="bg-emerald-950/40 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-emerald-500/30 text-center">
              <span className="text-[10px] uppercase text-emerald-300 block font-semibold">Đã duyệt</span>
              <span className="text-base font-extrabold text-emerald-400">{stats.approved}</span>
            </div>

            {(stats.underReview > 0 || stats.prohibited > 0) && (
              <div className="bg-rose-950/40 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-rose-500/40 text-center animate-pulse">
                <span className="text-[10px] uppercase text-rose-300 block font-semibold">Cảnh báo Shadow IT</span>
                <span className="text-base font-extrabold text-rose-400">
                  {stats.underReview + stats.prohibited}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                toast.info(`AIMS Agent: Đang gửi lệnh quét lại phần mềm trên máy trạm [${currentWorkstation?.hostName}]...`);
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Kích hoạt AIMS Agent quét lại phần mềm"
            >
              <span>🔄</span>
              <span>Quét lại</span>
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
            path: `/giam-sat-may-tram/${selectedWorkstationId}/phan-mem`,
            badge: stats.total,
          },
          { name: "Tài nguyên số", path: "/tai-nguyen-so" },
        ]}
        title={`Danh mục phần mềm: ${currentWorkstation?.hostName || ""}`}
        subtitle={`Kiểm kê tự động qua AIMS Agent - Người dùng: ${currentWorkstation?.userName || "Chưa xác định"} | HĐH: ${currentWorkstation?.osName || "N/A"}`}
        totalRecords={filteredSoftware.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onAddNew={() => {
          toast.info("AIMS Agent tự động đồng bộ danh sách phần mềm từ Windows Registry định kỳ 15 phút/lần.");
        }}
        addNewLabel="Chính sách phần mềm"
        onExportExcel={handleExportCsv}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBatchDelete={handleBatchProhibit}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFilter}
        onSelectTreeFilter={(f) => {
          setSelectedFilter(f);
          setPageIndex(1);
        }}
        isLoading={isLoading}
      >
        {(currentViewMode) => (
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900">
            {/* Batch actions bar if items are selected */}
            {selectedIds.size > 0 && (
              <div className="bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  Đã chọn {selectedIds.size} ứng dụng
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBatchApprove}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  >
                    ✓ Đánh dấu Phê duyệt
                  </button>
                  <button
                    onClick={handleBatchProhibit}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                  >
                    ⛔ Đưa vào DS Cấm
                  </button>
                </div>
              </div>
            )}

            {currentViewMode === "list" ? (
              /* ==================== TABLE LIST VIEW ==================== */
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200/80 dark:border-gray-800 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/50 dark:bg-gray-800/30">
                      <th className="py-3 px-4 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.size === filteredSoftware.length &&
                            filteredSoftware.length > 0
                          }
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-4 py-3 min-w-[240px]">Tên phần mềm & Phiên bản</th>
                      <th className="px-4 py-3">Nhà phát hành</th>
                      <th className="px-4 py-3">Phân loại</th>
                      <th className="px-4 py-3">Bản quyền</th>
                      <th className="px-4 py-3 text-right">Dung lượng</th>
                      <th className="px-4 py-3">Ngày cài đặt</th>
                      <th className="px-4 py-3 text-center">Kiểm soát IT</th>
                      <th className="px-4 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs">
                    {paginatedSoftware.length > 0 ? (
                      paginatedSoftware.map((item) => {
                        const isSelected = selectedIds.has(item.id);
                        const catMeta = CATEGORY_META[item.category] || CATEGORY_META.Other;
                        const licMeta = LICENSE_TYPE_META[item.licenseType] || LICENSE_TYPE_META.Unknown;

                        return (
                          <tr
                            key={item.id}
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
                                onChange={() => toggleSelectOne(item.id)}
                                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                              />
                            </td>

                            {/* Tên phần mềm */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl shrink-0 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
                                  {catMeta.icon}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[280px]" title={item.displayName}>
                                    {item.displayName}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
                                      v{item.displayVersion}
                                    </span>
                                    <span className="text-[10px] font-mono px-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-400">
                                      {item.architecture}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Nhà phát hành */}
                            <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 font-medium truncate max-w-[160px]" title={item.publisher}>
                              {item.publisher}
                            </td>

                            {/* Phân nhóm */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${catMeta.color}`}>
                                <span>{catMeta.icon}</span>
                                <span>{catMeta.label}</span>
                              </span>
                            </td>

                            {/* Loại license */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${licMeta.badgeClass}`}>
                                {item.licenseType}
                              </span>
                            </td>

                            {/* Dung lượng */}
                            <td className="px-4 py-3.5 text-right font-mono font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                              {formatSizeMB(item.estimatedSizeMB)}
                            </td>

                            {/* Ngày cài */}
                            <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                              {new Date(item.installDate).toLocaleDateString("vi-VN")}
                            </td>

                            {/* Trạng thái tuân thủ */}
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                              <SoftwareComplianceBadge status={item.complianceStatus} />
                            </td>

                            {/* Thao tác */}
                            <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setInspectingSoftware(item)}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                                <button
                                  onClick={() => {
                                    handleUpdateStatus(
                                      item.id,
                                      item.complianceStatus === "Approved" ? "Prohibited" : "Approved"
                                    );
                                  }}
                                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                                  title={item.complianceStatus === "Approved" ? "Chuyển sang Cấm" : "Phê duyệt phần mềm"}
                                >
                                  {item.complianceStatus === "Approved" ? "⛔" : "✓"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="text-3xl">🔍</span>
                            <span className="text-sm font-medium">Không tìm thấy phần mềm phù hợp</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ==================== KANBAN / CARD VIEW ==================== */
              <div className="flex-1 overflow-auto p-4 bg-gray-50/50 dark:bg-gray-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedSoftware.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    const catMeta = CATEGORY_META[item.category] || CATEGORY_META.Other;
                    const licMeta = LICENSE_TYPE_META[item.licenseType] || LICENSE_TYPE_META.Unknown;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setInspectingSoftware(item)}
                        className={`p-4 rounded-2xl border bg-white dark:bg-gray-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-brand-500 ring-2 ring-brand-500/20"
                            : "border-gray-200 dark:border-gray-700/80"
                        }`}
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-2xl p-2 rounded-xl bg-gray-50 dark:bg-gray-900">
                                {catMeta.icon}
                              </span>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate" title={item.displayName}>
                                  {item.displayName}
                                </h4>
                                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                  v{item.displayVersion} ({item.architecture})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Details */}
                          <div className="space-y-2 mt-3 text-xs">
                            <div className="flex justify-between text-gray-500">
                              <span>Nhà phát hành:</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                                {item.publisher}
                              </span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Dung lượng:</span>
                              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                                {formatSizeMB(item.estimatedSizeMB)}
                              </span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                              <span>Bản quyền:</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${licMeta.badgeClass}`}>
                                {item.licenseType}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-gray-500 pt-1">
                              <span>Tuân thủ:</span>
                              <SoftwareComplianceBadge status={item.complianceStatus} />
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400">
                          <span>Cài ngày: {new Date(item.installDate).toLocaleDateString("vi-VN")}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingSoftware(item);
                            }}
                            className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                          >
                            Chi tiết &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </AimsBasePageLayout>

      {/* ================= 3. MODAL CHI TIẾT ỨNG DỤNG ================= */}
      {inspectingSoftware && (
        <SoftwareDetailModal
          software={inspectingSoftware}
          onClose={() => setInspectingSoftware(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </>
  );
};

export default WorkstationInstalledSoftwarePage;
