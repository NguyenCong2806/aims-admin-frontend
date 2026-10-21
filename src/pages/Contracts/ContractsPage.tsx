import { useState, useMemo } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import PageMeta from "../../components/common/PageMeta";
import { AimsBasePageLayout, TreeFilterGroup, ViewMode } from "../../components/aims";
import { PaginationFilter } from "../../models/base/PaginationFilter";
import { contract, createcontract, updatecontract } from "../../models/Contract/contract";
import {
  useContractParams,
  useCreateContract,
  useRemoveContract,
  useUpdateContract,
} from "../../query/contracts/contractsQuery";
import ContractModal from "./ContractModal";
import { services } from "../../di/ServiceContainer";
import {
  PencilIcon,
  TrashBinIcon,
  DownloadIcon,
  DocsIcon,
  FileIcon,
} from "../../icons";

import { CONTRACT_TYPE_LABELS } from "../../common/ContractTypeList";
import { STATUS_CONFIG } from "../../common/ContractStatusList";

export default function ContractsPage() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedFacet, setSelectedFacet] = useState<string | number | null>("all");
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<contract | null>(null);

  const filter: PaginationFilter = {
    MaxPageSize: 100,
    PageIndex: pageIndex,
    PageSize: pageSize,
    Keyword: keyword,
  };

  const { data, isPending, isFetching } = useContractParams(filter);
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();
  const deleteMutation = useRemoveContract();

  const rawItems = (data?.items ?? []) as contract[];
  const totalCount = data?.pagination?.totalRecords ?? rawItems.length;

  // Lọc dữ liệu theo Left Facet Tree
  const items = useMemo(() => {
    if (!selectedFacet || selectedFacet === "all") return rawItems;

    // Lọc theo trạng thái
    if (["ACTIVE", "EXPIRING_SOON", "EXPIRED", "DRAFT", "TERMINATED"].includes(String(selectedFacet))) {
      return rawItems.filter((item) => String(item.status) === String(selectedFacet));
    }

    // Lọc theo loại hợp đồng
    if (Object.keys(CONTRACT_TYPE_LABELS).includes(String(selectedFacet))) {
      return rawItems.filter((item) => String(item.contractType) === String(selectedFacet));
    }

    // Lọc theo bảo hành
    if (selectedFacet === "warranty_active") {
      return rawItems.filter((item) => (item.warrantyMonths ?? 0) > 0);
    }
    if (selectedFacet === "has_file") {
      return rawItems.filter((item) => Boolean(item.documentFileUrl || item.fileUrl));
    }

    return rawItems;
  }, [rawItems, selectedFacet]);

  // Thống kê nhanh KPI
  const stats = useMemo(() => {
    const totalVal = rawItems.reduce((acc, cur) => acc + (cur.totalValue || 0), 0);
    const activeCount = rawItems.filter((c) => c.status === "ACTIVE").length;
    const expiringCount = rawItems.filter((c) => c.status === "EXPIRING_SOON").length;
    const warrantyCount = rawItems.filter((c) => (c.warrantyMonths ?? 0) > 0).length;

    return { totalVal, activeCount, expiringCount, warrantyCount };
  }, [rawItems]);

  // Cấu hình cây phân cấp bên trái (Left Tree Facets)
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    let withFileCount = 0;

    rawItems.forEach((c) => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      typeCounts[c.contractType] = (typeCounts[c.contractType] || 0) + 1;
      if (c.documentFileUrl || c.fileUrl) withFileCount++;
    });

    return [
      {
        id: "status_group",
        title: "Trạng thái hợp đồng",
        items: [
          { id: "all", label: "Tất cả hợp đồng", count: rawItems.length, icon: "📁" },
          { id: "ACTIVE", label: "Đang hiệu lực", count: statusCounts["ACTIVE"] || 0, icon: "🟢" },
          { id: "EXPIRING_SOON", label: "Sắp hết hạn", count: statusCounts["EXPIRING_SOON"] || 0, icon: "⚠️" },
          { id: "EXPIRED", label: "Đã hết hạn", count: statusCounts["EXPIRED"] || 0, icon: "🔴" },
          { id: "DRAFT", label: "Bản nháp", count: statusCounts["DRAFT"] || 0, icon: "📝" },
          { id: "TERMINATED", label: "Đã thanh lý", count: statusCounts["TERMINATED"] || 0, icon: "📦" },
        ],
      },
      {
        id: "type_group",
        title: "Loại hợp đồng CNTT",
        items: [
          { id: "IT_HARDWARE", label: "Thiết bị phần cứng", count: typeCounts["IT_HARDWARE"] || 0, icon: "🖥️" },
          { id: "SOFTWARE_LICENSE", label: "Bản quyền & SaaS", count: typeCounts["SOFTWARE_LICENSE"] || 0, icon: "🔑" },
          { id: "MAINTENANCE_SLA", label: "Bảo trì & SLA", count: typeCounts["MAINTENANCE_SLA"] || 0, icon: "🛠️" },
          { id: "INTERNET_TELECOM", label: "Kênh truyền Internet", count: typeCounts["INTERNET_TELECOM"] || 0, icon: "🌐" },
          { id: "CLOUD_HOSTING", label: "Cloud & Server", count: typeCounts["CLOUD_HOSTING"] || 0, icon: "☁️" },
          { id: "CONSULTING_OUTSOURCE", label: "Tư vấn & Triển khai", count: typeCounts["CONSULTING_OUTSOURCE"] || 0, icon: "💼" },
        ],
      },
      {
        id: "doc_group",
        title: "Hồ sơ & Tài liệu",
        items: [
          { id: "has_file", label: "Có file đính kèm", count: withFileCount, icon: "📎" },
          { id: "warranty_active", label: "Có điều khoản bảo hành", count: stats.warrantyCount, icon: "🛡️" },
        ],
      },
    ];
  }, [rawItems, stats.warrantyCount]);

  // Xử lý Xóa hợp đồng đơn lẻ
  const handleDelete = async (id: number) => {
    const target = rawItems.find((c) => c.id === id);
    const result = await Swal.fire({
      title: "Xác nhận xóa hợp đồng?",
      html: `Bạn có chắc muốn xóa hợp đồng <b class="text-rose-600 font-mono">${target?.contractNumber || target?.contractCode}</b> (${target?.title})?<br><span class="text-xs text-gray-500">Hành động này sẽ không thể khôi phục.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Đã xóa hợp đồng thành công!");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      toast.error(`Xóa thất bại: ${err instanceof Error ? err.message : "Đã xảy ra lỗi"}`);
    }
  };

  // Xóa hàng loạt
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    const result = await Swal.fire({
      title: `Xác nhận xóa ${selectedIds.size} hợp đồng?`,
      text: "Toàn bộ hồ sơ hợp đồng được chọn sẽ bị gỡ bỏ khỏi hệ thống.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Xóa ${selectedIds.size} mục`,
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      toast.success(`Đã xóa thành công ${selectedIds.size} hợp đồng!`);
      setSelectedIds(new Set());
    } catch {
      toast.error("Đã xảy ra lỗi khi xóa hàng loạt.");
    }
  };

  // Checkbox Selection
  const handleToggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  };

  const handleToggleSelectItem = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Xuất file CSV / Excel
  const handleExportExcel = () => {
    if (items.length === 0) {
      toast.info("Không có dữ liệu để xuất.");
      return;
    }

    const headers = [
      "ID",
      "Số HĐ",
      "Tên hợp đồng",
      "Loại hợp đồng",
      "Nhà cung cấp",
      "Giá trị (VND)",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Bảo hành (tháng)",
      "Trạng thái",
      "File đính kèm",
    ];

    const rows = items.map((c) => [
      c.id,
      `"${c.contractNumber || c.contractCode || ""}"`,
      `"${c.title}"`,
      `"${CONTRACT_TYPE_LABELS[c.contractType]?.label || c.contractType}"`,
      `"${c.supplier?.name || c.supplierName || ""}"`,
      c.totalValue,
      c.effectiveDate || c.startDate || "",
      c.expiryDate || c.endDate || "",
      c.warrantyMonths || 0,
      `"${STATUS_CONFIG[c.status]?.label || c.status}"`,
      `"${c.documentFileUrl || c.fileUrl || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DanhSach_HopDong_BaoHanh_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Đã xuất danh sách hợp đồng thành công!");
  };

  // Cấu hình các cột nhập liệu từ Excel cho Hợp đồng
  const CONTRACT_IMPORT_COLUMNS = [
    { key: "contractNumber", label: "Số hợp đồng", sample: "HD-2026-8899", required: true },
    { key: "title", label: "Tên hợp đồng", sample: "Mua sắm Máy chủ Dell PowerEdge R750", required: true },
    { key: "contractType", label: "Loại hợp đồng", sample: "SERVICE_MAINTENANCE", description: "SERVICE_MAINTENANCE, IT_HARDWARE, SOFTWARE_LICENSE, CLOUD_HOSTING..." },
    { key: "totalValue", label: "Giá trị (VND)", sample: 450000000 },
    { key: "currency", label: "Loại tiền", sample: "VND" },
    { key: "effectiveDate", label: "Ngày hiệu lực", sample: "2026-01-01" },
    { key: "expiryDate", label: "Ngày hết hạn", sample: "2027-01-01" },
    { key: "status", label: "Trạng thái", sample: "ACTIVE", description: "ACTIVE, DRAFT, EXPIRING_SOON, EXPIRED, TERMINATED" },
    { key: "paymentTerms", label: "Điều khoản thanh toán", sample: "Đợt 1: 30%, Đợt 2: 70%" },
    { key: "documentFileUrl", label: "URL file tài liệu", sample: "/files/upload/hd.pdf" },
    { key: "notes", label: "Ghi chú", sample: "Nhập khẩu từ file Excel" },
  ];

  // Xử lý nhập hợp đồng từ file Excel
  const handleImportContracts = async (rows: Record<string, unknown>[]) => {
    let successCount = 0;
    for (const r of rows) {
      const code = String(r.contractNumber || r.contractCode || r["Mã hợp đồng"] || r["Số HĐ"] || r["Số hợp đồng"] || "").trim();
      const titleStr = String(r.title || r["Tên hợp đồng"] || "").trim();
      if (!titleStr) continue;

      const eff = String(r.effectiveDate || r.startDate || r["Ngày bắt đầu"] || r["Ngày hiệu lực"] || new Date().toISOString().split("T")[0]);
      const exp = String(r.expiryDate || r.endDate || r["Ngày kết thúc"] || r["Ngày hết hạn"] || new Date().toISOString().split("T")[0]);
      const paymentTermsVal = r.paymentTerms || r["Điều khoản thanh toán"];
      const docUrlVal = r.documentFileUrl || r.fileUrl;

      const newContract: createcontract = {
        contractNumber: code || `HD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        title: titleStr,
        contractType: String(r.contractType || r["Loại hợp đồng"] || "SERVICE_MAINTENANCE").trim(),
        totalValue: Number(r.totalValue || r["Giá trị (VND)"] || r["Giá trị"] || 0),
        currency: String(r.currency || r["Loại tiền"] || "VND").trim(),
        effectiveDate: new Date(eff).toISOString(),
        expiryDate: new Date(exp).toISOString(),
        status: String(r.status || r["Trạng thái"] || "ACTIVE").trim(),
        paymentTerms: paymentTermsVal ? String(paymentTermsVal) : null,
        documentFileUrl: docUrlVal ? String(docUrlVal) : null,
        notes: String(r.notes || r["Ghi chú"] || "Nhập từ file Excel").trim(),

        contractCode: code,
        startDate: eff,
        endDate: exp,
      };

      try {
        await createMutation.mutateAsync(newContract);
        successCount++;
      } catch (err) {
        console.warn("Lỗi import dòng hợp đồng:", r, err);
      }
    }

    if (successCount > 0) {
      toast.success(`Đã thêm thành công ${successCount}/${rows.length} hợp đồng từ file Excel!`);
    } else {
      toast.error("Không có dòng hợp đồng nào được thêm hợp lệ.");
    }
  };

  // Lưu form Thêm mới / Cập nhật
  const handleFormSubmit = async (formData: createcontract | updatecontract) => {
    try {
      if ("id" in formData && formData.id) {
        await updateMutation.mutateAsync({
          id: formData.id,
          params: formData as updatecontract,
        });
        toast.success("Cập nhật hợp đồng thành công!");
      } else {
        await createMutation.mutateAsync(formData as createcontract);
        toast.success("Thêm mới hợp đồng thành công!");
      }
      setIsModalOpen(false);
      setEditingContract(null);
    } catch (err) {
      toast.error(`Lưu hợp đồng thất bại: ${err instanceof Error ? err.message : "Đã có lỗi xảy ra."}`);
    }
  };

  // Tính phần trăm thời hạn hợp đồng đã trôi qua
  const calculateProgress = (startStr: string, endStr: string): number => {
    try {
      const start = new Date(startStr).getTime();
      const end = new Date(endStr).getTime();
      const now = Date.now();
      if (isNaN(start) || isNaN(end) || end <= start) return 0;
      if (now <= start) return 0;
      if (now >= end) return 100;
      return Math.round(((now - start) / (end - start)) * 100);
    } catch {
      return 0;
    }
  };

  return (
    <>
      <PageMeta
        title="Quản lý Hợp đồng & Bảo hành | AIMS Enterprise"
        description="Quản lý danh sách hợp đồng mua sắm, hồ sơ bảo hành thiết bị và cam kết mức độ dịch vụ SLA"
      />

      <AimsBasePageLayout
        moduleName="Hợp đồng & Đối tác"
        moduleIcon={<DocsIcon className="w-5 h-5 text-indigo-500" />}
        moduleTabs={[
          {
            name: "Hợp đồng & Bảo hành",
            path: "/hop-dong-bao-hanh",
            badge: totalCount,
          },
          {
            name: "Nhà cung cấp",
            path: "/nha-cung-cap",
          },
        ]}
        title="Quản lý Hợp đồng & Bảo hành"
        subtitle="Quản lý vòng đời hợp đồng CNTT, lưu trữ file đính kèm, theo dõi thời hạn bảo hành thiết bị & cam kết SLA"
        totalRecords={totalCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={setKeyword}
        onAddNew={() => {
          setEditingContract(null);
          setIsModalOpen(true);
        }}
        addNewLabel="Thêm mới hợp đồng"
        onExportExcel={handleExportExcel}
        templateFileName="Mau_Nhap_HopDong.xlsx"
        templateUrl="/templates/Mau_Nhap_HopDong.xlsx"
        importTemplateColumns={CONTRACT_IMPORT_COLUMNS}
        onImportData={handleImportContracts}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBatchDelete={handleBatchDelete}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFetching={isFetching}
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFacet}
        onSelectTreeFilter={setSelectedFacet}
        isTreeCollapsed={isTreeCollapsed}
        onToggleTreeCollapse={() => setIsTreeCollapsed(!isTreeCollapsed)}
        isLoading={isPending}
      >
        {/* ================= 4 THẺ KPI TỔNG QUAN TRÊN CÙNG ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tổng giá trị cam kết
              </p>
              <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mt-1 font-mono">
                {stats.totalVal.toLocaleString("vi-VN")} <span className="text-xs font-normal">đ</span>
              </h3>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                {rawItems.length} hợp đồng trong hệ thống
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl shadow-sm">
              💰
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Đang có hiệu lực
              </p>
              <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {stats.activeCount} <span className="text-xs font-normal text-gray-500">hợp đồng</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Vận hành bình thường
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-sm">
              ✅
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sắp hết hạn (&lt;30 ngày)
              </p>
              <h3 className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                {stats.expiringCount} <span className="text-xs font-normal text-gray-500">hợp đồng</span>
              </h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                Cần liên hệ gia hạn SLA
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shadow-sm">
              ⚠️
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bảo hành & Cam kết SLA
              </p>
              <h3 className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 mt-1 font-mono">
                {stats.warrantyCount} <span className="text-xs font-normal text-gray-500">hợp đồng</span>
              </h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
                Có điều khoản bảo hành
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-2xl shadow-sm">
              🛡️
            </div>
          </div>
        </div>

        {/* ================= CHẾ ĐỘ HIỂN THỊ DANH SÁCH (TABLE VIEW) ================= */}
        {viewMode === "list" ? (
          <div className="overflow-x-auto rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white dark:bg-gray-900/80 shadow-2xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-750 bg-gray-50/70 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && selectedIds.size === items.length}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Số hiệu & Tên hợp đồng</th>
                  <th className="py-3 px-4">Loại hợp đồng</th>
                  <th className="py-3 px-4">Đối tác / Nhà cung cấp</th>
                  <th className="py-3 px-4 text-right">Giá trị hợp đồng</th>
                  <th className="py-3 px-4">Thời hạn hiệu lực</th>
                  <th className="py-3 px-4">Bảo hành</th>
                  <th className="py-3 px-4">File đính kèm</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="text-4xl">📄</span>
                        <p className="font-semibold text-gray-600 dark:text-gray-300">
                          Chưa có hợp đồng nào phù hợp với bộ lọc
                        </p>
                        <p className="text-xs text-gray-400 max-w-sm">
                          Nhấn nút &quot;Thêm mới hợp đồng&quot; ở trên để tạo hồ sơ hợp đồng và tải file đính kèm lên hệ thống.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const typeConfig = CONTRACT_TYPE_LABELS[item.contractType] || CONTRACT_TYPE_LABELS["OTHER"];
                    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG["ACTIVE"];
                    const isSelected = selectedIds.has(item.id);
                    const effDate = item.effectiveDate ? item.effectiveDate.split("T")[0] : (item.startDate || "");
                    const expDate = item.expiryDate ? item.expiryDate.split("T")[0] : (item.endDate || "");
                    const progress = calculateProgress(effDate, expDate);
                    const docUrl = item.documentFileUrl || item.fileUrl;
                    const docName = item.fileName || (docUrl ? docUrl.split("/").pop() : "Tài liệu");

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors ${
                          isSelected ? "bg-indigo-50/50 dark:bg-indigo-950/30" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectItem(item.id)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                          />
                        </td>

                        {/* Số hiệu & Tên hợp đồng */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                              {item.contractNumber || item.contractCode}
                            </span>
                            <h4
                              onClick={() => {
                                setEditingContract(item);
                                setIsModalOpen(true);
                              }}
                              className="font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-xs sm:text-sm line-clamp-1"
                              title={item.title}
                            >
                              {item.title}
                            </h4>
                          </div>
                        </td>

                        {/* Loại hợp đồng */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${typeConfig.color}`}
                          >
                            <span>{typeConfig.icon}</span>
                            <span>{typeConfig.label}</span>
                          </span>
                        </td>

                        {/* Đối tác / Nhà cung cấp */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.supplier?.name || item.supplierName ? (
                            <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-medium">
                              <span className="text-base">🏢</span>
                              <span className="truncate max-w-[180px]" title={(item.supplier?.name || item.supplierName) ?? undefined}>
                                {item.supplier?.name || item.supplierName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Chưa gán</span>
                          )}
                        </td>

                        {/* Giá trị hợp đồng */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-gray-900 dark:text-emerald-400 text-xs sm:text-sm">
                            {Number(item.totalValue).toLocaleString("vi-VN")}{" "}
                            <span className="text-[10px] text-gray-500 font-normal">đ</span>
                          </span>
                        </td>

                        {/* Thời hạn hiệu lực */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-[11px] text-gray-600 dark:text-gray-300 font-mono">
                              {effDate} &rarr; {expDate}
                            </div>
                            {/* Progress bar */}
                            <div className="w-28 bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  progress >= 100
                                    ? "bg-rose-500"
                                    : progress >= 80
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Bảo hành */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.paymentTerms ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate max-w-[140px]" title={item.paymentTerms}>
                              💳 {item.paymentTerms}
                            </span>
                          ) : item.warrantyMonths ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                              🛡️ {item.warrantyMonths} tháng
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>

                        {/* File đính kèm */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {docUrl ? (
                            <button
                              type="button"
                              onClick={() => services.file.downloadFile(docUrl, docName)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 transition-colors group cursor-pointer max-w-[150px]"
                              title={`Tải xuống tài liệu qua /files/download: ${docName}`}
                            >
                              <FileIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate text-[11px]">{docName}</span>
                              <DownloadIcon className="w-3 h-3 text-gray-400 group-hover:text-indigo-600 shrink-0" />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[11px] italic">Chưa đính kèm</span>
                          )}
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusCfg.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            <span>{statusCfg.label}</span>
                          </span>
                        </td>

                        {/* Thao tác */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingContract(item);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa hợp đồng"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Xóa hợp đồng"
                            >
                              <TrashBinIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ================= CHẾ ĐỘ KANBAN / CARD VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const typeConfig = CONTRACT_TYPE_LABELS[item.contractType] || CONTRACT_TYPE_LABELS["OTHER"];
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG["ACTIVE"];
              const effDate = (item.effectiveDate || item.startDate || "").split("T")[0];
              const expDate = (item.expiryDate || item.endDate || "").split("T")[0];
              const progress = calculateProgress(effDate, expDate);
              const contractNum = item.contractNumber || item.contractCode || `HD-${item.id}`;
              const supplierTitle = item.supplier?.name || item.supplierName || "—";
              const docUrl = item.documentFileUrl || item.fileUrl;
              const docName = item.fileName || (docUrl ? docUrl.split("/").pop() : "Tài liệu");

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-700/80 shadow-2xs hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                        {contractNum}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        <span>{statusCfg.label}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => {
                        setEditingContract(item);
                        setIsModalOpen(true);
                      }}
                      className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 hover:text-indigo-600 cursor-pointer mb-2"
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    {/* Type Badge */}
                    <div className="mb-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${typeConfig.color}`}
                      >
                        <span>{typeConfig.icon}</span>
                        <span>{typeConfig.label}</span>
                      </span>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700/60 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Đối tác:</span>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                          {supplierTitle}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Giá trị:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {Number(item.totalValue).toLocaleString("vi-VN")} {item.currency || "VND"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Điều khoản TT:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[160px]" title={item.paymentTerms || ""}>
                          {item.paymentTerms ? `💳 ${item.paymentTerms}` : item.warrantyMonths ? `🛡️ ${item.warrantyMonths} tháng` : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Timeline bar */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1 font-mono">
                        <span>{effDate || "—"}</span>
                        <span>{expDate || "—"}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            progress >= 100
                              ? "bg-rose-500"
                              : progress >= 80
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                    <div>
                      {docUrl ? (
                        <button
                          type="button"
                          onClick={() => services.file.downloadFile(docUrl, docName)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline max-w-[160px] cursor-pointer"
                          title={`Tải xuống tài liệu qua /files/download: ${docName}`}
                        >
                          <FileIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{docName}</span>
                          <DownloadIcon className="w-3 h-3 text-gray-400 shrink-0" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">Chưa có file</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingContract(item);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <TrashBinIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AimsBasePageLayout>

      {/* Modal Thêm mới / Chỉnh sửa hợp đồng */}
      <ContractModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContract(null);
        }}
        contract={editingContract}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
