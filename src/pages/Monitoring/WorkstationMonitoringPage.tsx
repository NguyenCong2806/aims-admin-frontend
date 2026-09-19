import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../components/aims";
import PageMeta from "../../components/common/PageMeta";
import { WorkstationMonitoring } from "../../models/Monitoring/workstationMonitoring";

// Mock dữ liệu ban đầu phản ánh các kịch bản thực tế của doanh nghiệp
const INITIAL_WORKSTATIONS: WorkstationMonitoring[] = [
  {
    id: "e1a90c54-46c7-4632-9c16-2bc5566f1001",
    assetId: "IT-PC-0021",
    collectedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 phút trước
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    hostName: "DESKTOP-IT-HOANG",
    userName: "hoang.it",
    domainOrWorkgroup: "CORP.AIMS.VN",
    osName: "Windows 11 Pro 64-bit",
    osBuildNumber: 22631,
    osLicenseStatus: "Licensed",
    osLicenseType: "OEM:DM",
    osPartialProductKey: "3V66T",
    osOemKeyInBios: "NKJFK-GHP2W-D8269-XXXXX-3V66T",
    officeProductName: "Microsoft 365 Apps for enterprise",
    officeLicenseStatus: "Licensed",
    officeLicenseType: "Subscription",
    officePartialProductKey: "HFT79",
    mbManufacturer: "ASUSTeK COMPUTER INC.",
    mbProduct: "TUF GAMING B660M-PLUS WIFI",
    mbSerialNumber: "220501838400192",
    mbBiosVersion: "1620 (08/12/2023)",
    cpuName: "12th Gen Intel(R) Core(TM) i7-12700",
    cpuCores: 12,
    cpuLogicals: 20,
    cpuMaxClockSpeedMHz: 4900,
    ramTotalGB: 32.0,
    ramUsedGB: 19.2,
    ramFreeGB: 12.8,
    ramUsagePercent: 60.0,
  },
  {
    id: "b452e89d-21df-4fc3-b714-f463c2398002",
    assetId: "IT-PC-0088",
    collectedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 phút trước
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    hostName: "DESKTOP-HR-LAN",
    userName: "lan.hr",
    domainOrWorkgroup: "CORP.AIMS.VN",
    osName: "Windows 11 Pro 64-bit",
    osBuildNumber: 22631,
    osLicenseStatus: "Licensed",
    osLicenseType: "Retail",
    osPartialProductKey: "8HVX7",
    osOemKeyInBios: "F3B8G-72NPQ-XXXXX-XXXXX-8HVX7",
    officeProductName: "Microsoft Office Home and Business 2021",
    officeLicenseStatus: "Licensed",
    officeLicenseType: "Retail",
    officePartialProductKey: "2K4MT",
    mbManufacturer: "Dell Inc.",
    mbProduct: "OptiPlex 7000 Micro",
    mbSerialNumber: "9FC4KL3",
    mbBiosVersion: "1.18.0",
    cpuName: "12th Gen Intel(R) Core(TM) i5-12500",
    cpuCores: 6,
    cpuLogicals: 12,
    cpuMaxClockSpeedMHz: 4600,
    ramTotalGB: 16.0,
    ramUsedGB: 9.6,
    ramFreeGB: 6.4,
    ramUsagePercent: 60.0,
  },
  {
    id: "f3c2b1a0-9876-4321-abcd-ef0123456003",
    assetId: null, // Chưa map tài sản
    collectedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 giờ trước
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    hostName: "DESKTOP-ACC-THAO",
    userName: "thao.ketoan",
    domainOrWorkgroup: "WORKGROUP",
    osName: "Windows 10 Pro 64-bit",
    osBuildNumber: 19045,
    osLicenseStatus: "Notification", // Cảnh báo bản quyền
    osLicenseType: "Volume:MAK",
    osPartialProductKey: "T83GX",
    osOemKeyInBios: "",
    officeProductName: "Microsoft Office Professional Plus 2019",
    officeLicenseStatus: "Unlicensed", // Office chưa kích hoạt
    officeLicenseType: "Volume:KMS",
    officePartialProductKey: "WFG78",
    mbManufacturer: "HP Inc.",
    mbProduct: "HP ProDesk 400 G6 MT",
    mbSerialNumber: "CNU12048X9",
    mbBiosVersion: "F.24",
    cpuName: "Intel(R) Core(TM) i5-10500 CPU @ 3.10GHz",
    cpuCores: 6,
    cpuLogicals: 12,
    cpuMaxClockSpeedMHz: 4500,
    ramTotalGB: 8.0,
    ramUsedGB: 7.3,
    ramFreeGB: 0.7,
    ramUsagePercent: 91.25, // Cảnh báo tràn RAM
  },
  {
    id: "a7d8c9e0-1234-5678-90ab-cdef12345004",
    assetId: "IT-LAP-0015",
    collectedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 giờ trước
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    hostName: "LAPTOP-DEV-QUAN",
    userName: "quan.dev",
    domainOrWorkgroup: "CORP.AIMS.VN",
    osName: "Windows 11 Pro 64-bit",
    osBuildNumber: 26100,
    osLicenseStatus: "Licensed",
    osLicenseType: "OEM:DM",
    osPartialProductKey: "4Q8W2",
    osOemKeyInBios: "XXXXX-XXXXX-XXXXX-XXXXX-4Q8W2",
    officeProductName: "Microsoft 365 Apps for enterprise",
    officeLicenseStatus: "Licensed",
    officeLicenseType: "Subscription",
    officePartialProductKey: "HFT79",
    mbManufacturer: "Lenovo",
    mbProduct: "ThinkPad T14 Gen 3",
    mbSerialNumber: "PF3G9K12",
    mbBiosVersion: "N3MET09W (1.09)",
    cpuName: "AMD Ryzen 7 PRO 6850U with Radeon Graphics",
    cpuCores: 8,
    cpuLogicals: 16,
    cpuMaxClockSpeedMHz: 4700,
    ramTotalGB: 32.0,
    ramUsedGB: 22.4,
    ramFreeGB: 9.6,
    ramUsagePercent: 70.0,
  },
  {
    id: "99e8d7c6-b5a4-3210-9876-fedcba987005",
    assetId: null, // Chưa map tài sản
    collectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 ngày trước (Mất kết nối)
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    hostName: "PC-KHO-HAI",
    userName: "hai.kho",
    domainOrWorkgroup: "WORKGROUP",
    osName: "Windows 10 Enterprise LTSC 2021",
    osBuildNumber: 19044,
    osLicenseStatus: "Licensed",
    osLicenseType: "Volume:MAK",
    osPartialProductKey: "C82P4",
    osOemKeyInBios: "",
    officeProductName: "Microsoft Office Standard 2016",
    officeLicenseStatus: "Licensed",
    officeLicenseType: "Volume:MAK",
    officePartialProductKey: "R88XY",
    mbManufacturer: "Gigabyte Technology Co., Ltd.",
    mbProduct: "H410M H",
    mbSerialNumber: "SN210250014298",
    mbBiosVersion: "F6",
    cpuName: "Intel(R) Core(TM) i3-10100 CPU @ 3.60GHz",
    cpuCores: 4,
    cpuLogicals: 8,
    cpuMaxClockSpeedMHz: 4300,
    ramTotalGB: 8.0,
    ramUsedGB: 4.8,
    ramFreeGB: 3.2,
    ramUsagePercent: 60.0,
  },
];

export const WorkstationMonitoringPage: React.FC = () => {
  const [records, setRecords] = useState<WorkstationMonitoring[]>(INITIAL_WORKSTATIONS);
  const [keyword, setKeyword] = useState<string>("");
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<WorkstationMonitoring | null>(null);
  const [mappingModalItem, setMappingModalItem] = useState<WorkstationMonitoring | null>(null);
  const [inputAssetCode, setInputAssetCode] = useState<string>("");

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

  // Cấu hình Cây lọc phân cấp (Tree Facet Groups)
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    const totalCount = records.length;
    const mappedCount = records.filter((r) => !!r.assetId).length;
    const unmappedCount = records.filter((r) => !r.assetId).length;

    const licOkCount = records.filter((r) => r.osLicenseStatus === "Licensed").length;
    const licWarningCount = records.filter((r) => r.osLicenseStatus !== "Licensed").length;

    const officeUnlicCount = records.filter((r) => r.officeLicenseStatus !== "Licensed").length;
    const ramCriticalCount = records.filter((r) => r.ramUsagePercent > 85).length;
    const offlineCount = records.filter((r) => {
      const diffDays = (Date.now() - new Date(r.collectedAt).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 7;
    }).length;

    return [
      {
        id: "status_mapping",
        title: "LIÊN KẾT TÀI SẢN PHẦN CỨNG",
        items: [
          { id: "all", label: "Tất cả máy trạm", count: totalCount },
          { id: "mapped", label: "Đã map vào kho tài sản", count: mappedCount },
          { id: "unmapped", label: "Chưa liên kết tài sản", count: unmappedCount },
        ],
      },
      {
        id: "status_licensing",
        title: "BẢN QUYỀN HỆ ĐIỀU HÀNH & OFFICE",
        items: [
          { id: "os_licensed", label: "Windows đã kích hoạt", count: licOkCount },
          { id: "os_warning", label: "Cảnh báo bản quyền Windows", count: licWarningCount },
          { id: "office_warning", label: "Office chưa kích hoạt", count: officeUnlicCount },
        ],
      },
      {
        id: "status_health",
        title: "TÌNH TRẠNG PHẦN CỨNG & KẾT NỐI",
        items: [
          { id: "ram_critical", label: "Cảnh báo tràn RAM (> 85%)", count: ramCriticalCount },
          { id: "offline_long", label: "Mất tín hiệu (> 7 ngày)", count: offlineCount },
        ],
      },
    ];
  }, [records]);

  // Lọc dữ liệu hiển thị
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 1. Tìm kiếm theo từ khóa
      if (keyword.trim()) {
        const kw = keyword.toLowerCase().trim();
        const matchHost = rec.hostName.toLowerCase().includes(kw);
        const matchUser = rec.userName.toLowerCase().includes(kw);
        const matchAsset = rec.assetId ? rec.assetId.toLowerCase().includes(kw) : false;
        const matchCpu = rec.cpuName.toLowerCase().includes(kw);
        const matchOs = rec.osName.toLowerCase().includes(kw);
        const matchSerial = rec.mbSerialNumber.toLowerCase().includes(kw);
        if (!matchHost && !matchUser && !matchAsset && !matchCpu && !matchOs && !matchSerial) {
          return false;
        }
      }

      // 2. Lọc theo cây phân cấp
      if (selectedFilter === "mapped") return !!rec.assetId;
      if (selectedFilter === "unmapped") return !rec.assetId;
      if (selectedFilter === "os_licensed") return rec.osLicenseStatus === "Licensed";
      if (selectedFilter === "os_warning") return rec.osLicenseStatus !== "Licensed";
      if (selectedFilter === "office_warning") return rec.officeLicenseStatus !== "Licensed";
      if (selectedFilter === "ram_critical") return rec.ramUsagePercent > 85;
      if (selectedFilter === "offline_long") {
        const diffDays = (Date.now() - new Date(rec.collectedAt).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 7;
      }

      return true;
    });
  }, [records, keyword, selectedFilter]);

  // Phân trang
  const paginatedRecords = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, pageIndex, pageSize]);

  // Xử lý liên kết tài sản
  const handleOpenMappingModal = (item: WorkstationMonitoring) => {
    setMappingModalItem(item);
    setInputAssetCode(item.assetId || `IT-PC-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSaveMapping = () => {
    if (!mappingModalItem) return;
    if (!inputAssetCode.trim()) {
      toast.error("Vui lòng nhập mã tài sản phần cứng!");
      return;
    }

    setRecords((prev) =>
      prev.map((r) => (r.id === mappingModalItem.id ? { ...r, assetId: inputAssetCode.trim().toUpperCase() } : r))
    );
    toast.success(`Đã liên kết máy [${mappingModalItem.hostName}] với tài sản [${inputAssetCode.trim().toUpperCase()}] thành công!`);
    setMappingModalItem(null);
  };

  // Xóa telemetry
  const handleDelete = (id: string, hostName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bản ghi telemetry của máy [${hostName}]?`)) return;
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success(`Đã xóa telemetry máy trạm [${hostName}]`);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} bản ghi telemetry đã chọn?`)) return;
    setRecords((prev) => prev.filter((r) => !selectedIds.has(r.id)));
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
          { name: "Thiết bị phần cứng", path: "/tai-nguyen-so" },
          { name: "Giám sát máy trạm", path: "/giam-sat-may-tram", badge: records.length },
          { name: "Tài nguyên số", path: "/tai-nguyen-so" },
        ]}
        title="Giám sát máy trạm"
        subtitle="Dữ liệu phần cứng, bản quyền Windows/Office & hiệu năng thu thập tự động qua AIMS Agent"
        totalRecords={filteredRecords.length}
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
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFilter}
        onSelectTreeFilter={setSelectedFilter}
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
                        checked={selectedIds.size > 0 && selectedIds.size === paginatedRecords.length}
                        onChange={() => {
                          if (selectedIds.size === paginatedRecords.length) setSelectedIds(new Set());
                          else setSelectedIds(new Set(paginatedRecords.map((r) => r.id)));
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
                  {paginatedRecords.length > 0 ? (
                    paginatedRecords.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      const conn = getConnectionStatus(item.collectedAt);
                      const isRamCritical = item.ramUsagePercent > 85;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedItemForDetail(item)}
                          className={`transition-colors group cursor-pointer ${
                            isSelected
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
                          <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                            {item.assetId ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                                  {item.assetId}
                                </span>
                                <button
                                  onClick={() => handleOpenMappingModal(item)}
                                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                                  title="Đổi mã liên kết tài sản"
                                >
                                  ✏️
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenMappingModal(item)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 transition-colors cursor-pointer"
                              >
                                <span>+</span>
                                <span>Map tài sản</span>
                              </button>
                            )}
                          </td>

                          {/* Hệ điều hành & Bản quyền */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>{item.osName}</span>
                              <span className="text-[10px] font-mono text-gray-400">b.{item.osBuildNumber}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  item.osLicenseStatus === "Licensed"
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60"
                                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60"
                                }`}
                              >
                                {item.osLicenseStatus === "Licensed" ? "Đã kích hoạt" : item.osLicenseStatus}
                              </span>
                              <span className="text-xs font-mono text-gray-500">
                                Key: ***-{item.osPartialProductKey}
                              </span>
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
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                    item.officeLicenseStatus === "Licensed"
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60"
                                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60"
                                  }`}
                                >
                                  {item.officeLicenseStatus === "Licensed" ? "Bản quyền" : item.officeLicenseStatus}
                                </span>
                                <span className="text-xs font-mono text-gray-500">
                                  Key: ***-{item.officePartialProductKey}
                                </span>
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
                                  className={`h-full rounded-full transition-all ${
                                    isRamCritical
                                      ? "bg-rose-500"
                                      : item.ramUsagePercent > 70
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.min(item.ramUsagePercent, 100)}%` }}
                                />
                              </div>
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
                              <button
                                onClick={() => setSelectedItemForDetail(item)}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                title="Xem đầy đủ thông số"
                              >
                                Chi tiết
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item.hostName)}
                                className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Xóa bản ghi telemetry"
                              >
                                🗑️
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
                          <span className="text-sm font-medium">Không tìm thấy máy trạm phù hợp với bộ lọc</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* ==================== 2. KANBAN / CARD VIEW ==================== */
            <div className="flex-1 overflow-auto p-4 bg-gray-50/50 dark:bg-gray-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedRecords.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const conn = getConnectionStatus(item.collectedAt);
                  const isRamCritical = item.ramUsagePercent > 85;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemForDetail(item)}
                      className={`p-4 rounded-xl border bg-white dark:bg-gray-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected ? "border-brand-500 ring-2 ring-brand-500/20" : "border-gray-200 dark:border-gray-700/80"
                      }`}
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${conn.color}`} />
                            <div className="font-mono font-bold text-sm text-gray-900 dark:text-white truncate">
                              {item.hostName}
                            </div>
                          </div>
                          {item.assetId ? (
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                              {item.assetId}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                              Chưa map
                            </span>
                          )}
                        </div>

                        {/* Card Specs */}
                        <div className="space-y-2 mt-3 text-xs">
                          <div className="text-gray-500 dark:text-gray-400 flex justify-between">
                            <span>Người dùng:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 font-mono">
                              {item.userName || "N/A"}
                            </span>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 flex justify-between">
                            <span>HĐH:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]">
                              {item.osName}
                            </span>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 flex justify-between items-center">
                            <span>Bản quyền Windows:</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                item.osLicenseStatus === "Licensed"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {item.osLicenseStatus}
                            </span>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 flex justify-between items-center">
                            <span>CPU:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]">
                              {item.cpuName.replace(/\(R\)|\(TM\)/g, "")}
                            </span>
                          </div>

                          {/* RAM Progress */}
                          <div className="pt-1">
                            <div className="flex justify-between text-[11px] text-gray-500 mb-0.5">
                              <span>RAM: {item.ramUsedGB.toFixed(1)} / {item.ramTotalGB.toFixed(0)} GB</span>
                              <span className={isRamCritical ? "font-bold text-rose-600" : ""}>{item.ramUsagePercent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isRamCritical ? "bg-rose-500" : item.ramUsagePercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(item.ramUsagePercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Thu thập: {formatTimeAgo(item.collectedAt)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForDetail(item);
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
          )
        }
      </AimsBasePageLayout>

      {/* ==================== 3. MODAL CHI TIẾT CẤU HÌNH MÁY TRẠM ==================== */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-3 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center text-xl">
                  💻
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="font-mono">{selectedItemForDetail.hostName}</span>
                    {selectedItemForDetail.assetId && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {selectedItemForDetail.assetId}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Thu thập lúc: {new Date(selectedItemForDetail.collectedAt).toLocaleString()} ({formatTimeAgo(selectedItemForDetail.collectedAt)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Khối 1: Hệ điều hành & Bản quyền */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                1. Hệ điều hành & Khóa kích hoạt Windows
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
                <div>
                  <span className="text-gray-400 block">Tên hệ điều hành</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.osName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Build Number</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.osBuildNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Trạng thái bản quyền</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedItemForDetail.osLicenseStatus} ({selectedItemForDetail.osLicenseType})</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Partial Product Key</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">***-{selectedItemForDetail.osPartialProductKey}</span>
                </div>
                {selectedItemForDetail.osOemKeyInBios && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block">OEM Key nhúng trong BIOS</span>
                    <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{selectedItemForDetail.osOemKeyInBios}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Khối 2: Microsoft Office */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                2. Bộ ứng dụng văn phòng Microsoft Office
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
                <div>
                  <span className="text-gray-400 block">Tên sản phẩm Office</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.officeProductName || "Chưa cài đặt"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Bản quyền & Loại license</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.officeLicenseStatus} ({selectedItemForDetail.officeLicenseType || "N/A"})</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Partial Key Office</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.officePartialProductKey ? `***-${selectedItemForDetail.officePartialProductKey}` : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Khối 3: Cấu hình phần cứng (CPU, RAM, Motherboard) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                3. Chi tiết Cấu hình phần cứng & Bo mạch chủ
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
                <div>
                  <span className="text-gray-400 block">Bộ vi xử lý (CPU)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.cpuName}</span>
                  <div className="text-gray-500 mt-0.5">
                    {selectedItemForDetail.cpuCores} Cores, {selectedItemForDetail.cpuLogicals} Threads, Max {selectedItemForDetail.cpuMaxClockSpeedMHz} MHz
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block">Bộ nhớ RAM</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedItemForDetail.ramTotalGB} GB (Dùng: {selectedItemForDetail.ramUsedGB} GB, Trống: {selectedItemForDetail.ramFreeGB} GB)
                  </span>
                  <div className="text-gray-500 mt-0.5">Tỷ lệ sử dụng: {selectedItemForDetail.ramUsagePercent.toFixed(1)}%</div>
                </div>
                <div>
                  <span className="text-gray-400 block">Bo mạch chủ (Motherboard)</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.mbManufacturer} {selectedItemForDetail.mbProduct}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Serial Number & BIOS</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">
                    S/N: {selectedItemForDetail.mbSerialNumber || "N/A"} | BIOS: {selectedItemForDetail.mbBiosVersion}
                  </span>
                </div>
              </div>
            </div>

            {/* Khối 4: Mạng & Người dùng */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                4. Thông tin tài khoản & Mạng
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
                <div>
                  <span className="text-gray-400 block">Tài khoản đăng nhập</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.userName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Domain / Workgroup</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.domainOrWorkgroup || "WORKGROUP"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Ngày ghi nhận lần đầu</span>
                  <span className="text-gray-600 dark:text-gray-300">{new Date(selectedItemForDetail.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-3 border-t dark:border-gray-800">
              {!selectedItemForDetail.assetId ? (
                <button
                  onClick={() => {
                    const item = selectedItemForDetail;
                    setSelectedItemForDetail(null);
                    handleOpenMappingModal(item);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white cursor-pointer"
                >
                  🔗 Liên kết vào kho tài sản IT
                </button>
              ) : (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  ✓ Đã map với tài sản {selectedItemForDetail.assetId}
                </span>
              )}

              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. MODAL LIÊN KẾT MÃ TÀI SẢN PHẦN CỨNG ==================== */}
      {mappingModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              🔗 Liên kết mã tài sản phần cứng
            </h3>
            <p className="text-xs text-gray-500">
              Ghép máy trạm <strong className="font-mono text-gray-800 dark:text-gray-200">{mappingModalItem.hostName}</strong> (S/N: {mappingModalItem.mbSerialNumber || "N/A"}) vào hồ sơ thiết bị phần cứng trong AIMS:
            </p>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Mã tài sản phần cứng (Asset ID / Asset Code)
              </label>
              <input
                type="text"
                value={inputAssetCode}
                onChange={(e) => setInputAssetCode(e.target.value)}
                placeholder="VD: IT-PC-0042"
                className="w-full px-3 py-2 text-sm font-mono border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setMappingModalItem(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveMapping}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white cursor-pointer"
              >
                Xác nhận liên kết
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkstationMonitoringPage;
