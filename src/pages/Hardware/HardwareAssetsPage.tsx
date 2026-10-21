import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../components/aims";
import PageMeta from "../../components/common/PageMeta";
import { PaginationFilter } from "../../models/base/PaginationFilter";
import {
  useHardwareAssetsPaged,
  useDeleteHardwareAsset,
  useHardwareAssetById,
} from "../../query/hardwareassets/hardwareAssetsQuery";
import { HardwareAssetPagedItem } from "../../models/Hardware/hardwareAsset";

export const HardwareAssetsPage: React.FC = () => {
  const navigate = useNavigate();

  // State bộ lọc và phân trang
  const [keyword, setKeyword] = useState<string>("");
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal xem chi tiết thiết bị
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<HardwareAssetPagedItem | null>(null);

  // Lấy chi tiết thiết bị bao gồm các DTO thông số kỹ thuật chuyên dụng
  const { data: detailAssetResult, isLoading: isDetailAssetLoading } = useHardwareAssetById(
    selectedItemForDetail?.id || null
  );

  const fullDetail = (detailAssetResult as any)?.data?.data || (detailAssetResult as any)?.data || detailAssetResult;
  const netSpec =
    fullDetail?.assetSpecNetworkDeviceDto ||
    fullDetail?.AssetSpecNetworkDeviceDto ||
    fullDetail?.asset_spec_network_device_dto ||
    fullDetail?.hardwareAssetDto?.assetSpecNetworkDeviceDto ||
    fullDetail?.hardwareAssetDto?.AssetSpecNetworkDeviceDto;
  const cameraSpec =
    fullDetail?.assetSpecCameraNvrDto ||
    fullDetail?.AssetSpecCameraNvrDto ||
    fullDetail?.asset_spec_camera_nvr_dto ||
    fullDetail?.hardwareAssetDto?.assetSpecCameraNvrDto ||
    fullDetail?.hardwareAssetDto?.AssetSpecCameraNvrDto;
  const nasSpec =
    fullDetail?.assetSpecNasStorageDto ||
    fullDetail?.AssetSpecNasStorageDto ||
    fullDetail?.asset_spec_nas_storage_dto ||
    fullDetail?.hardwareAssetDto?.assetSpecNasStorageDto ||
    fullDetail?.hardwareAssetDto?.AssetSpecNasStorageDto;
  const displaySpec =
    fullDetail?.assetSpecDisplayProjectorDto ||
    fullDetail?.AssetSpecDisplayProjectorDto ||
    fullDetail?.asset_spec_display_projector_dto ||
    fullDetail?.hardwareAssetDto?.assetSpecDisplayProjectorDto ||
    fullDetail?.hardwareAssetDto?.AssetSpecDisplayProjectorDto;
  const printerSpec =
    fullDetail?.assetSpecPrinterCopierDto ||
    fullDetail?.AssetSpecPrinterCopierDto ||
    fullDetail?.asset_spec_printer_copier_dto ||
    fullDetail?.hardwareAssetDto?.assetSpecPrinterCopierDto ||
    fullDetail?.hardwareAssetDto?.AssetSpecPrinterCopierDto;

  // Hook Mutation xóa
  const deleteMutation = useDeleteHardwareAsset();

  // Tạo tham số filter gửi lên API /hardware_assets/get-hardware-assets-paged
  const filter: PaginationFilter = useMemo(
    () => ({
      MaxPageSize: 100,
      PageIndex: pageIndex,
      PageSize: pageSize,
      Keyword: keyword.trim() || undefined,
    }),
    [pageIndex, pageSize, keyword]
  );

  // Gọi React Query gọi API backend
  const { data, isPending, isFetching, refetch } = useHardwareAssetsPaged(filter);

  // Danh sách items: lấy trực tiếp từ API /hardware_assets/get-hardware-assets-paged
  const items: HardwareAssetPagedItem[] = useMemo(() => {
    if (data?.items && data.items.length > 0) {
      return data.items;
    }
    return [];
  }, [data?.items]);

  // Tổng số lượng bản ghi (từ API pagination hoặc fallback local)
  const totalRecordsCount = data?.pagination?.totalRecords ?? items.length;

  // Helper định dạng tiền tệ VNĐ
  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return "Chưa cập nhật";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  // Helper hiển thị badge phân loại thiết bị (asset_sub_type) theo 5 Stored Procedures
  const getSubtypeBadge = (subType?: string | null) => {
    const t = (subType || "").toUpperCase();
    if (
      t.includes("SWITCH") ||
      t.includes("ROUTER") ||
      t.includes("NETWORK") ||
      t.includes("FIREWALL") ||
      t.includes("ACCESS_POINT") ||
      t.includes("AP")
    ) {
      return {
        label: t === "SWITCH" ? "SWITCH" : t === "ROUTER" ? "ROUTER" : t === "FIREWALL" ? "FIREWALL" : t === "ACCESS_POINT" ? "ACCESS POINT" : "MẠNG",
        color: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60",
        icon: "🔀",
      };
    }
    if (t.includes("CAMERA") || t.includes("CAM") || t.includes("NVR") || t.includes("DVR")) {
      return {
        label: t === "NVR" ? "NVR" : t === "DVR" ? "DVR" : "CAMERA",
        color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60",
        icon: "📹",
      };
    }
    if (t.includes("NAS") || t.includes("SAN") || t.includes("STORAGE") || t.includes("UPS") || t.includes("EXTERNAL_HDD") || t.includes("HDD")) {
      return {
        label: t === "UPS" ? "UPS" : t === "EXTERNAL_HDD" ? "Ổ CỨNG NGOÀI" : "NAS / SAN",
        color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60",
        icon: "💾",
      };
    }
    if (t.includes("PC_MONITOR") || t.includes("MONITOR") || t.includes("PROJECTOR") || t.includes("TV") || t.includes("DISPLAY") || t.includes("MÀN HÌNH")) {
      return {
        label: t === "PC_MONITOR" ? "MÀN HÌNH PC" : t === "TV" ? "TIVI" : t === "PROJECTOR" ? "MÁY CHIẾU" : "MÀN HÌNH",
        color: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/60",
        icon: "🖥️",
      };
    }
    if (t.includes("PRINTER") || t.includes("COPIER") || t.includes("SHREDDER") || t.includes("MÁY IN") || t.includes("PHOTO")) {
      return {
        label: t === "SHREDDER" ? "MÁY HỦY TÀI LIỆU" : t.includes("COPIER") ? "PHOTOCOPY" : "MÁY IN",
        color: "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/60",
        icon: "🖨️",
      };
    }
    return {
      label: subType || "THIẾT BỊ",
      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200/80 dark:border-gray-700/60",
      icon: "⚙️",
    };
  };

  // Helper màu sắc trạng thái
  const getStatusBadge = (statusName?: string | null) => {
    const s = statusName || "Chưa xác định";
    if (s.includes("Đang sử dụng")) {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60";
    }
    if (s.includes("Sẵn sàng")) {
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/60";
    }
    if (s.includes("bảo trì") || s.includes("Sửa chữa")) {
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60";
    }
    if (s.includes("thanh lý") || s.includes("Hỏng")) {
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/60";
    }
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200/60";
  };

  // Cấu hình Cây phân cấp bộ lọc (AimsTreeFilter)
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    // 1. Nhóm theo phân loại con (asset_sub_type: SWITCH, CAMERA, PC...)
    const subTypeCounts: Record<string, number> = {};
    items.forEach((it) => {
      const t = it.asset_sub_type || it.assetSubType || "Khác";
      subTypeCounts[t] = (subTypeCounts[t] || 0) + 1;
    });

    // 2. Nhóm theo trạng thái
    const statusCounts: Record<string, number> = {};
    items.forEach((it) => {
      const s = it.status_name || it.statusName || "Khác";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // 3. Nhóm theo danh mục
    const catCounts: Record<string, number> = {};
    items.forEach((it) => {
      const c = it.category_name || it.categoryName || "Khác";
      catCounts[c] = (catCounts[c] || 0) + 1;
    });

    // 4. Nhóm theo phòng ban
    const deptCounts: Record<string, number> = {};
    items.forEach((it) => {
      const d = it.department_name || it.departmentName || "Chưa phân bổ";
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    });

    // 5. Nhóm theo vị trí
    const locationCounts: Record<string, number> = {};
    items.forEach((it) => {
      const l = it.location_name || it.locationName || "Chưa xác định";
      locationCounts[l] = (locationCounts[l] || 0) + 1;
    });

    return [
      {
        id: "subtype_group",
        title: "PHÂN LOẠI THIẾT BỊ",
        items: [
          { id: "all", label: "Tất cả thiết bị phần cứng", count: items.length },
          ...Object.entries(subTypeCounts).map(([type, count]) => ({
            id: `subtype_${type}`,
            label: type,
            count,
          })),
        ],
      },
      {
        id: "status_group",
        title: "TRẠNG THÁI HOẠT ĐỘNG",
        items: Object.entries(statusCounts).map(([status, count]) => ({
          id: `status_${status}`,
          label: status,
          count,
        })),
      },
      {
        id: "category_group",
        title: "DANH MỤC PHẦN CỨNG",
        items: Object.entries(catCounts).map(([cat, count]) => ({
          id: `cat_${cat}`,
          label: cat,
          count,
        })),
      },
      {
        id: "department_group",
        title: "PHÒNG BAN QUẢN LÝ",
        items: Object.entries(deptCounts).map(([dept, count]) => ({
          id: `dept_${dept}`,
          label: dept,
          count,
        })),
      },
      {
        id: "location_group",
        title: "KHU VỰC / VỊ TRÍ",
        items: Object.entries(locationCounts).map(([loc, count]) => ({
          id: `loc_${loc}`,
          label: loc,
          count,
        })),
      },
    ];
  }, [items]);

  // Lọc theo cây phân cấp
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (selectedFilter && selectedFilter !== "all") {
        const filterStr = String(selectedFilter);
        if (filterStr.startsWith("subtype_")) {
          const targetType = filterStr.replace("subtype_", "");
          return (it.asset_sub_type || it.assetSubType || "Khác") === targetType;
        }
        if (filterStr.startsWith("status_")) {
          const targetStatus = filterStr.replace("status_", "");
          return (it.status_name || it.statusName || "Khác") === targetStatus;
        }
        if (filterStr.startsWith("cat_")) {
          const targetCat = filterStr.replace("cat_", "");
          return (it.category_name || it.categoryName || "Khác") === targetCat;
        }
        if (filterStr.startsWith("dept_")) {
          const targetDept = filterStr.replace("dept_", "");
          return (it.department_name || it.departmentName || "Chưa phân bổ") === targetDept;
        }
        if (filterStr.startsWith("loc_")) {
          const targetLoc = filterStr.replace("loc_", "");
          return (it.location_name || it.locationName || "Chưa xác định") === targetLoc;
        }
      }
      return true;
    });
  }, [items, selectedFilter]);

  // Nếu API đã phân trang thì danh sách filteredItems chính là items hiện tại,
  // nếu filter trên client hoặc local mock thì phân trang:
  const paginatedItems = useMemo(() => {
    if (data?.pagination) {
      // Backend đã phân trang
      return filteredItems;
    }
    const start = (pageIndex - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [data?.pagination, filteredItems, pageIndex, pageSize]);

  // Thao tác điều hướng và CRUD
  const handleAddNew = () => {
    navigate("/thiet-bi-phan-cung/tao-moi");
  };

  const handleEdit = (item: HardwareAssetPagedItem) => {
    navigate(`/thiet-bi-phan-cung/${item.id}/chinh-sua`);
  };

  const handleDelete = async (id: string, code: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success(`Đã xóa thiết bị [${code}] thành công`);
      refetch();
    } catch {
      toast.error(`Không thể xóa thiết bị [${code}]`);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      setSelectedIds(new Set());
      toast.success("Đã xóa các thiết bị đã chọn thành công!");
      refetch();
    } catch {
      toast.error("Có lỗi xảy ra khi xóa dữ liệu");
    }
  };

  return (
    <>
      <PageMeta
        title="Thiết bị phần cứng | AIMS Enterprise"
        description="Quản lý hồ sơ thiết bị phần cứng: Thiết bị mạng, Camera & NVR, Lưu trữ NAS & SAN, Màn hình & Máy chiếu, Máy in & Photocopy"
      />

      <AimsBasePageLayout
        moduleName="Quản lý Tài sản IT"
        moduleIcon={
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        moduleTabs={[
          { name: "Thiết bị phần cứng", path: "/thiet-bi-phan-cung", badge: totalRecordsCount },
          { name: "Thêm mới thiết bị", path: "/thiet-bi-phan-cung/tao-moi" },
          { name: "Giám sát máy trạm", path: "/giam-sat-may-tram" },
          { name: "Tài nguyên số", path: "/tai-nguyen-so" },
        ]}
        title="Thiết bị phần cứng"
        subtitle="Hồ sơ thiết bị phần cứng chuyên dụng: Thiết bị mạng, Camera & NVR, Lưu trữ NAS & SAN, Màn hình & Máy chiếu, Máy in & Photocopy"
        totalRecords={totalRecordsCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onAddNew={handleAddNew}
        addNewLabel="Thêm thiết bị"
        onExportExcel={() => toast.success("Đang xuất danh sách thiết bị phần cứng ra file Excel...")}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBatchDelete={handleBatchDelete}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFilter}
        onSelectTreeFilter={setSelectedFilter}
        isFetching={isFetching}
        isLoading={isPending && items.length === 0}
      >
        {(currentViewMode) =>
          currentViewMode === "list" ? (
            /* ==================== 1. LIST VIEW (DATA TABLE) ==================== */
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-xs z-10 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 select-none">
                  <tr>
                    <th className="w-10 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.size > 0 && selectedIds.size === paginatedItems.length}
                        onChange={() => {
                          if (selectedIds.size === paginatedItems.length) setSelectedIds(new Set());
                          else {
                            const ids = paginatedItems.map((r) => r.id).filter((id): id is string => Boolean(id));
                            setSelectedIds(new Set(ids));
                          }
                        }}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                        title="Chọn tất cả"
                      />
                    </th>
                    <th className="px-4 py-3">Mã tài sản & Phân loại</th>
                    <th className="px-4 py-3">Tên thiết bị & Model</th>
                    <th className="px-4 py-3">Hãng SX & Serial Tag</th>
                    <th className="px-4 py-3">Danh mục & Trạng thái</th>
                    <th className="px-4 py-3">Phòng ban & Vị trí</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs sm:text-sm">
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => {
                      const isSelected = item.id ? selectedIds.has(item.id) : false;
                      const subTypeBadge = getSubtypeBadge(item.asset_sub_type || item.assetSubType);
                      const code = item.asset_code || item.assetCode;
                      const statusName = item.status_name || item.statusName;
                      const catName = item.category_name || item.categoryName;
                      const brandName = item.brand_name || item.brandName;
                      const serial = item.serial_number || item.serialNumber;
                      const deptName = item.department_name || item.departmentName;
                      const locName = item.location_name || item.locationName;
                      const supplierName = item.supplier_name || item.supplierName;

                      return (
                        <tr
                          key={item.id || code}
                          onClick={() => setSelectedItemForDetail(item)}
                          className={`transition-colors group cursor-pointer ${isSelected
                            ? "bg-indigo-50/80 dark:bg-indigo-950/40 font-medium text-indigo-950 dark:text-indigo-100"
                            : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300"
                            }`}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (!item.id) return;
                                const next = new Set(selectedIds);
                                if (next.has(item.id)) next.delete(item.id);
                                else next.add(item.id);
                                setSelectedIds(next);
                              }}
                              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                          </td>

                          {/* Cột 1: Mã tài sản & Phân loại con (asset_sub_type) */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 text-xs">
                                {code}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${subTypeBadge.color}`}
                                title={`Loại phần cứng: ${subTypeBadge.label}`}
                              >
                                <span>{subTypeBadge.icon}</span>
                                <span>{subTypeBadge.label}</span>
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-gray-400 mt-1 flex items-center gap-1.5">
                              <span className="opacity-60">BARCODE:</span>
                              <span>{item.barcode || "Chưa gắn mã vạch"}</span>
                            </div>
                          </td>

                          {/* Cột 2: Tên thiết bị & Model */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>{item.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Model: <span className="font-medium text-gray-700 dark:text-gray-300">{item.model || "-"}</span>
                            </div>
                          </td>

                          {/* Cột 3: Hãng SX & Serial Tag */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                              {brandName || "Chưa cập nhật"}
                            </div>
                            <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                              S/N: <span className="font-semibold text-gray-700 dark:text-gray-300">{serial || "-"}</span>
                            </div>
                          </td>

                          {/* Cột 4: Danh mục & Trạng thái */}
                          <td className="px-4 py-3.5">
                            <div className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                              {catName || "Thiết bị khác"}
                            </div>
                            <div className="mt-1">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(statusName)}`}>
                                {statusName || "Chưa xác định"}
                              </span>
                            </div>
                          </td>

                          {/* Cột 5: Phòng ban & Vị trí */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                              <span>🏢</span>
                              <span className="truncate max-w-[170px]">{deptName || "Chưa phân bổ"}</span>
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[170px] mt-0.5 flex items-center gap-1" title={locName || ""}>
                              <span>📍</span>
                              <span>{locName || "Chưa xác định"}</span>
                            </div>
                            {supplierName && (
                              <div className="text-[10px] text-gray-400 truncate max-w-[170px] mt-0.5">
                                📦 {supplierName}
                              </div>
                            )}
                          </td>

                          {/* Cột 6: Thao tác */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedItemForDetail(item)}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors cursor-pointer"
                                title="Xem chi tiết thiết bị"
                              >
                                Chi tiết
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                                title="Chỉnh sửa thông tin"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => item.id && handleDelete(item.id, code || "")}
                                className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Xóa thiết bị"
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
                      <td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-4xl">📦</span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Không tìm thấy thiết bị phần cứng phù hợp
                          </span>
                          <span className="text-xs text-gray-400">
                            Thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại bộ lọc phân cấp
                          </span>
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
                {paginatedItems.map((item) => {
                  const isSelected = item.id ? selectedIds.has(item.id) : false;
                  const subTypeBadge = getSubtypeBadge(item.asset_sub_type || item.assetSubType);
                  const code = item.asset_code || item.assetCode;
                  const statusName = item.status_name || item.statusName;
                  const catName = item.category_name || item.categoryName;
                  const brandName = item.brand_name || item.brandName;
                  const serial = item.serial_number || item.serialNumber;
                  const deptName = item.department_name || item.departmentName;
                  const locName = item.location_name || item.locationName;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemForDetail(item)}
                      className={`p-4 rounded-xl border bg-white dark:bg-gray-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-gray-200 dark:border-gray-700/80"
                        }`}
                    >
                      <div>
                        {/* Header card */}
                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                              {code}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${subTypeBadge.color}`}>
                              <span>{subTypeBadge.icon}</span>
                              <span>{subTypeBadge.label}</span>
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(statusName)}`}>
                            {statusName}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-gray-900 dark:text-white mt-3 text-sm line-clamp-1" title={item.name}>
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {brandName || "Hãng: N/A"} • Model: {item.model || "N/A"}
                        </p>

                        {/* Details */}
                        <div className="space-y-1.5 mt-3 text-xs">
                          <div className="flex justify-between text-gray-500">
                            <span>Serial Tag:</span>
                            <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{serial || "-"}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Danh mục:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">{catName || "Thiết bị khác"}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Phòng ban:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">{deptName || "Chưa phân bổ"}</span>
                          </div>
                          {item.purchasePrice ? (
                            <div className="flex justify-between text-gray-500">
                              <span>Giá vốn:</span>
                              <span className="font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(item.purchasePrice)}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-gray-400 truncate max-w-[170px]">📍 {locName || "Chưa có vị trí"}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForDetail(item);
                          }}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
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

      {/* ==================== 3. MODAL CHI TIẾT THIẾT BỊ PHẦN CỨNG ==================== */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b pb-3 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-2xl border border-indigo-200/50">
                  {getSubtypeBadge(selectedItemForDetail.asset_sub_type || selectedItemForDetail.assetSubType).icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{selectedItemForDetail.name}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {selectedItemForDetail.asset_code || selectedItemForDetail.assetCode}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSubtypeBadge(selectedItemForDetail.asset_sub_type || selectedItemForDetail.assetSubType).color}`}>
                      {getSubtypeBadge(selectedItemForDetail.asset_sub_type || selectedItemForDetail.assetSubType).label}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Model: {selectedItemForDetail.model || "Chưa cập nhật"} | S/N: {selectedItemForDetail.serial_number || selectedItemForDetail.serialNumber || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Khối 1: Định danh thiết bị & Phân loại */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl">
              <div>
                <span className="text-gray-400 block">Mã tài sản:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedItemForDetail.asset_code || selectedItemForDetail.assetCode}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Phân loại phụ (Sub-Type):</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.asset_sub_type || selectedItemForDetail.assetSubType || "Chưa phân loại"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Trạng thái vận hành:</span>
                <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] border mt-0.5 ${getStatusBadge(selectedItemForDetail.status_name || selectedItemForDetail.statusName)}`}>
                  {selectedItemForDetail.status_name || selectedItemForDetail.statusName || "Chưa xác định"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Danh mục phần cứng:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.category_name || selectedItemForDetail.categoryName || "Khác"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Hãng sản xuất (Brand):</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.brand_name || selectedItemForDetail.brandName || "Chưa cập nhật"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Mã vạch / Barcode:</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.barcode || "Chưa gắn barcode"}
                </span>
              </div>
            </div>

            {/* Khối 2: Phân bổ phòng ban & Vị trí */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl">
              <div>
                <span className="text-gray-400 block">Phòng ban quản lý:</span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  🏢 {selectedItemForDetail.department_name || selectedItemForDetail.departmentName || "Chưa phân bổ"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Khu vực / Địa điểm lắp đặt:</span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  📍 {selectedItemForDetail.location_name || selectedItemForDetail.locationName || "Chưa xác định"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block">Nhà cung cấp / Đối tác thiết bị:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  📦 {selectedItemForDetail.supplier_name || selectedItemForDetail.supplierName || "Chưa có thông tin nhà cung cấp"}
                </span>
              </div>
              {selectedItemForDetail.description && (
                <div className="col-span-2 mt-1">
                  <span className="text-gray-400 block">Mô tả / Ghi chú kỹ thuật:</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5">{selectedItemForDetail.description}</p>
                </div>
              )}
            </div>

            {/* Khối 3: Tài chính & Thời hạn bảo hành */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl">
              <div>
                <span className="text-gray-400 block">Giá vốn đầu tư:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {formatCurrency(selectedItemForDetail.purchasePrice)}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Ngày mua / Ngày hiệu lực:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.purchaseDate
                    ? new Date(selectedItemForDetail.purchaseDate).toLocaleDateString("vi-VN")
                    : "Chưa cập nhật"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Thời gian bảo hành:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedItemForDetail.warrantyMonths ? `${selectedItemForDetail.warrantyMonths} tháng` : "Không có"}
                </span>
              </div>
            </div>

            {/* Khối 4: Cấu hình kỹ thuật chuyên sâu (Specs) */}
            {isDetailAssetLoading ? (
              <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 text-center text-xs text-gray-500 animate-pulse">
                Đang tải thông số kỹ thuật chi tiết...
              </div>
            ) : netSpec ? (
              <div className="bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/50 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-purple-200/60 dark:border-purple-900/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-2">
                    <span>🔀</span>
                    <span>Thông số kỹ thuật thiết bị mạng (Network Device Specs)</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold">
                    {netSpec.deviceType || netSpec.devicetype || "Core Switch Layer 3"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Số cổng kết nối:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {netSpec.portCount ?? netSpec.portcount ?? 0} Ports
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Tốc độ cổng mạng:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {netSpec.portSpeed || netSpec.portspeed || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Cổng Uplink:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {netSpec.uplinkPorts || netSpec.uplinkports || "Không có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Hỗ trợ cấp nguồn PoE:</span>
                    <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[10px] mt-0.5 ${
                      (netSpec.isPoeSupported ?? netSpec.ispoesupported)
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {(netSpec.isPoeSupported ?? netSpec.ispoesupported) ? "⚡ Có hỗ trợ PoE" : "Không hỗ trợ"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Công suất tiêu thụ:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {netSpec.powerConsumptionW ?? netSpec.powerconsumptionw ?? 0} W
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Số VLAN tối đa:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {netSpec.maxVlans ?? netSpec.maxvlans ?? 0} VLANs
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Phiên đồng thời:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {(netSpec.concurrentSessions ?? netSpec.concurrentsessions ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Giới hạn người dùng:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {(netSpec.concurrentUsersLimit ?? netSpec.concurrentuserslimit ?? 0).toLocaleString()} Users
                    </span>
                  </div>
                  {(netSpec.firewallThroughput || netSpec.firewallthroughput) && (
                    <div>
                      <span className="text-gray-400 block">Băng thông Firewall:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {netSpec.firewallThroughput || netSpec.firewallthroughput}
                      </span>
                    </div>
                  )}
                  {(netSpec.ipsThroughput || netSpec.ipsthroughput) && (
                    <div>
                      <span className="text-gray-400 block">Băng thông IPS:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {netSpec.ipsThroughput || netSpec.ipsthroughput}
                      </span>
                    </div>
                  )}
                  {(netSpec.vpnThroughput || netSpec.vpnthroughput) && (
                    <div>
                      <span className="text-gray-400 block">Băng thông VPN:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {netSpec.vpnThroughput || netSpec.vpnthroughput}
                      </span>
                    </div>
                  )}
                  {(netSpec.antennaSpec || netSpec.antennaspec) && (
                    <div className="col-span-2">
                      <span className="text-gray-400 block">Thông số Anten Wi-Fi:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {netSpec.antennaSpec || netSpec.antennaspec}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : cameraSpec ? (
              <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 dark:border-amber-900/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <span>📹</span>
                    <span>Thông số kỹ thuật Camera & Đầu ghi (Camera / NVR Specs)</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold">
                    {cameraSpec.deviceType || cameraSpec.devicetype || "CAMERA"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Độ phân giải:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cameraSpec.resolution || "Chưa cập nhật"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Kích thước cảm biến:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cameraSpec.sensorSize || cameraSpec.sensorsize || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Ống kính (Lens):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cameraSpec.lensSize || cameraSpec.lenssize || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Tầm xa hồng ngoại:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cameraSpec.irDistanceMeters ?? cameraSpec.irdistancemeters ?? 0} m</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Chuẩn nén:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cameraSpec.compressionStandard || cameraSpec.compressionstandard || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Số kênh đầu ghi:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cameraSpec.channelCount ?? cameraSpec.channelcount ?? 0} Kênh</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Dung lượng tối đa:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{cameraSpec.maxStorageTb ?? cameraSpec.maxstoragetb ?? 0} TB</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Băng thông Vào/Ra:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {cameraSpec.inputBandwidthMbps ?? cameraSpec.inputbandwidthmbps ?? 0} / {cameraSpec.outputBandwidthMbps ?? cameraSpec.outputbandwidthmbps ?? 0} Mbps
                    </span>
                  </div>
                </div>
              </div>
            ) : nasSpec ? (
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 dark:border-emerald-900/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <span>💾</span>
                    <span>Thông số kỹ thuật lưu trữ (NAS / SAN Specs)</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold">
                    {nasSpec.deviceType || nasSpec.devicetype || "NAS"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="col-span-2">
                    <span className="text-gray-400 block">CPU & RAM xử lý:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{nasSpec.cpuProcessor || nasSpec.cpuprocessor || "Chưa cập nhật"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">RAM đã cài đặt:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{nasSpec.installedRamGb ?? nasSpec.installedramgb ?? 0} GB</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">RAM tối đa:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{nasSpec.maxRamSupportedGb ?? nasSpec.maxramsupportedgb ?? 0} GB</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Dung lượng cài đặt:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{nasSpec.installedCapacityTb ?? nasSpec.installedcapacitytb ?? 0} TB</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Âm lượng volume tối đa:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{nasSpec.maxSingleVolumeSizeTb ?? nasSpec.maxsinglevolumesizetb ?? 0} TB</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Cache Slots:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{nasSpec.cacheSlots || nasSpec.cacheslots || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Công suất nguồn:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{nasSpec.powerRatingVa ?? nasSpec.powerratingva ?? 0} VA</span>
                  </div>
                </div>
              </div>
            ) : displaySpec ? (
              <div className="bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/50 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-teal-200/60 dark:border-teal-900/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-2">
                    <span>🖥️</span>
                    <span>Thông số hiển thị (Display / Projector Specs)</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold">
                    {displaySpec.deviceType || displaySpec.devicetype || "DISPLAY"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Kích thước màn:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{displaySpec.screenSizeInches ?? displaySpec.screensizeinches ?? 0} inch</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Độ phân giải:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{displaySpec.resolution || "Chưa cập nhật"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Tần số quét:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{displaySpec.refreshRateHz ?? displaySpec.refreshratehz ?? 0} Hz</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Độ sáng (Brightness):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{displaySpec.brightnessAnsiLumens ?? displaySpec.brightnessansilumens ?? 0} Lumens</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Độ tương phản:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{displaySpec.contrastRatio || displaySpec.contrastratio || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Tuổi thọ bóng chiếu:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{displaySpec.lampLifeHours ?? displaySpec.lamplifehours ?? 0} Giờ</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block">Cổng kết nối hỗ trợ:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{displaySpec.supportedPorts || displaySpec.supportedports || "-"}</span>
                  </div>
                </div>
              </div>
            ) : printerSpec ? (
              <div className="bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/50 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-orange-200/60 dark:border-orange-900/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300 flex items-center gap-2">
                    <span>🖨️</span>
                    <span>Thông số in ấn / Photocopy (Printer / Copier Specs)</span>
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-bold">
                    {printerSpec.deviceType || printerSpec.devicetype || "PRINTER"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Khổ giấy tối đa:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{printerSpec.maxPaperSize || printerSpec.maxpapersize || "A4"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Tốc độ in (PPM):</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{printerSpec.printSpeedPpm ?? printerSpec.printspeedppm ?? 0} ppm</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Độ phân giải in:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{printerSpec.printResolution || printerSpec.printresolution || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Mã hộp mực:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{printerSpec.inkCartridgeType || printerSpec.inkcartridgetype || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Tuổi thọ trống Drum:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{printerSpec.drumLifePages ?? printerSpec.drumlifepages ?? 0} trang</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Kiểu hủy tài liệu:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{printerSpec.shredStyle || printerSpec.shredstyle || "-"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Công suất hủy:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{printerSpec.shredCapacitySheets ?? printerSpec.shredcapacitysheets ?? 0} tờ</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Dung tích thùng chứa:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{printerSpec.binCapacityLiters ?? printerSpec.bincapacityliters ?? 0} lít</span>
                  </div>
                </div>
              </div>
            ) : null}
            <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-800">
              <button
                onClick={() => {
                  const it = selectedItemForDetail;
                  setSelectedItemForDetail(null);
                  handleEdit(it);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer transition-colors"
              >
                ✏️ Chỉnh sửa thông tin
              </button>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HardwareAssetsPage;
