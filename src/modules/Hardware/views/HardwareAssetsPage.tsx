import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../../components/aims";
import PageMeta from "../../../components/common/PageMeta";
import { PaginationFilter } from "../../base/models/PaginationFilter";
import { useHardwareParams, useRemoveHardware } from "../queries/hardwareQuery";
import { formatCurrency, getWarrantyInfo, getStatusBadge } from "../../../helpper";
import { HardwareAsset } from "../models/hardwareAsset";
import {
  useAssetCategorySelectList,
  useAssetStatusSelectList,
  useBrandSelectList,
  useDepartmentSelectList,
  useLocationSelectList,
  useSupplierSelectList,
} from "../../Lookups/queries";

export const HardwareAssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState<string>("");
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<HardwareAsset | null>(null);

  const filter: PaginationFilter = {
    MaxPageSize: 100,
    PageIndex: pageIndex,
    PageSize: pageSize,
    Keyword: keyword,
  };

  const { data, isPending, isFetching, isError, error } = useHardwareParams(filter);
  const deleteMutation = useRemoveHardware();

  // Load danh mục lookups để hiển thị tên nếu API chỉ trả ID số
  const { data: categorySelectList } = useAssetCategorySelectList();
  const { data: brandSelectList } = useBrandSelectList();
  const { data: statusSelectList } = useAssetStatusSelectList();
  const { data: departmentSelectList } = useDepartmentSelectList();
  const { data: locationSelectList } = useLocationSelectList();
  const { data: supplierSelectList } = useSupplierSelectList();

  const categoryMap = useMemo(() => new Map(categorySelectList?.map((i) => [String(i.key), i.value])), [categorySelectList]);
  const brandMap = useMemo(() => new Map(brandSelectList?.map((i) => [String(i.key), i.value])), [brandSelectList]);
  const statusMap = useMemo(() => new Map(statusSelectList?.map((i) => [String(i.key), i.value])), [statusSelectList]);
  const departmentMap = useMemo(() => new Map(departmentSelectList?.map((i) => [String(i.key), i.value])), [departmentSelectList]);
  const locationMap = useMemo(() => new Map(locationSelectList?.map((i) => [String(i.key), i.value])), [locationSelectList]);
  const supplierMap = useMemo(() => new Map(supplierSelectList?.map((i) => [String(i.key), i.value])), [supplierSelectList]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawItems = (data?.items ?? []) as Array<any>;
  const totalRecords = data?.pagination?.totalRecords ?? rawItems.length;

  const items: HardwareAsset[] = useMemo(() => {
    return rawItems.map((it) => {
      const catId = it.categoryId !== undefined ? String(it.categoryId) : "";
      const brId = it.brandId !== undefined ? String(it.brandId) : "";
      const stId = it.statusId !== undefined ? String(it.statusId) : "";
      const depId = it.departmentId !== undefined ? String(it.departmentId) : "";
      const locId = it.locationId !== undefined ? String(it.locationId) : "";
      const supId = it.supplierId !== undefined ? String(it.supplierId) : "";

      return {
        id: it.id,
        assetCode: it.assetCode || it.assetcode || "",
        assetSubType: it.assetSubType || it.assetsubtype || "",
        name: it.name || "",
        model: it.model || "",
        serialNumber: it.serialNumber || it.serialnumber || "",
        barcode: it.barcode || "",
        categoryId: it.categoryId,
        categoryName: it.categoryName || categoryMap.get(catId) || "Khác",
        statusId: it.statusId,
        statusName: it.statusName || statusMap.get(stId) || "Sẵn sàng sử dụng",
        brandId: it.brandId,
        brandName: it.brandName || brandMap.get(brId) || "N/A",
        supplierId: it.supplierId,
        supplierName: it.supplierName || supplierMap.get(supId) || "Chưa cập nhật",
        locationId: it.locationId,
        locationName: it.locationName || locationMap.get(locId) || "Chưa xác định",
        departmentId: it.departmentId,
        departmentName: it.departmentName || departmentMap.get(depId) || "Chưa phân bổ",
        purchasePrice: it.purchasePrice !== undefined ? Number(it.purchasePrice) : 0,
        purchaseDate: it.purchaseDate || it.purchasedate,
        effectiveDate: it.effectiveDate || it.effectivedate,
        warrantyMonths: it.warrantyMonths !== undefined ? Number(it.warrantyMonths) : 0,
        description: it.description || "",
        specs: it.specs,
        customAttributes: it.customAttributes,
      };
    });
  }, [rawItems, categoryMap, brandMap, statusMap, departmentMap, locationMap, supplierMap]);

  // Cấu hình Cây phân cấp bộ lọc (AimsTreeFilter)
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    // 1. Nhóm theo trạng thái
    const statusCounts: Record<string, number> = {};
    items.forEach((it) => {
      const s = it.statusName || "Khác";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // 2. Nhóm theo danh mục
    const catCounts: Record<string, number> = {};
    items.forEach((it) => {
      const c = it.categoryName || "Khác";
      catCounts[c] = (catCounts[c] || 0) + 1;
    });

    // 3. Nhóm theo phòng ban
    const deptCounts: Record<string, number> = {};
    items.forEach((it) => {
      const d = it.departmentName || "Chưa phân bổ";
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    });

    return [
      {
        id: "status_group",
        title: "TRẠNG THÁI HOẠT ĐỘNG",
        items: [
          { id: "all", label: "Tất cả thiết bị phần cứng", count: items.length },
          ...Object.entries(statusCounts).map(([status, count]) => ({
            id: `status_${status}`,
            label: status,
            count,
          })),
        ],
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
        title: "PHÒNG BAN SỬ DỤNG",
        items: Object.entries(deptCounts).map(([dept, count]) => ({
          id: `dept_${dept}`,
          label: dept,
          count,
        })),
      },
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!selectedFilter || selectedFilter === "all") return items;

    const filterStr = String(selectedFilter);
    if (filterStr.startsWith("status_")) {
      const target = filterStr.replace("status_", "");
      return items.filter((it) => (it.statusName || "Khác") === target);
    }
    if (filterStr.startsWith("cat_")) {
      const target = filterStr.replace("cat_", "");
      return items.filter((it) => (it.categoryName || "Khác") === target);
    }
    if (filterStr.startsWith("dept_")) {
      const target = filterStr.replace("dept_", "");
      return items.filter((it) => (it.departmentName || "Chưa phân bổ") === target);
    }
    return items;
  }, [items, selectedFilter]);

  // Thao tác điều hướng và CRUD
  const handleAddNew = () => {
    navigate("/thiet-bi-phan-cung/tao-moi");
  };

  const handleEdit = (item: HardwareAsset) => {
    navigate(`/thiet-bi-phan-cung/${item.id}/chinh-sua`);
  };

  const handleDelete = (id: string, code: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.success(`Đã xóa thiết bị [${code}] thành công`);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        toast.error(err?.message || "Không thể xóa thiết bị");
      },
    });
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    for (const id of Array.from(selectedIds)) {
      await deleteMutation.mutateAsync(id);
    }
    setSelectedIds(new Set());
    toast.success("Đã hoàn tất xử lý xóa các thiết bị đã chọn!");
  };

  return (
    <>
      <PageMeta
        title="Thiết bị phần cứng | AIMS Enterprise"
        description="Quản lý hồ sơ thiết bị phần cứng, máy tính, laptop, máy chủ, serial tag, bảo hành & kiểm kê kho"
      />

      <AimsBasePageLayout
        moduleName="Quản lý Tài sản IT"
        moduleIcon={
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        moduleTabs={[
          { name: "Thiết bị phần cứng", path: "/thiet-bi-phan-cung", badge: totalRecords },
          { name: "Thêm mới thiết bị", path: "/thiet-bi-phan-cung/tao-moi" },
          { name: "Giám sát máy trạm", path: "/giam-sat-may-tram" },
          { name: "Tài nguyên số", path: "/tai-nguyen-so" },
        ]}
        title="Thiết bị phần cứng"
        subtitle="Hồ sơ thiết bị phần cứng: Máy tính, Laptop, Máy chủ, Màn hình, Serial, Barcode & Bảo hành"
        totalRecords={totalRecords}
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
      >
        {(currentViewMode) => {
          if (isError) {
            const is403 =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (error as any)?.response?.status === 403 ||
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (error as any)?.status === 403 ||
              (error instanceof Error && (error.message.includes("403") || error.message.toLowerCase().includes("quyền")));

            return (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-900">
                <span className="text-4xl mb-2">{is403 ? "🚫" : "⚠️"}</span>
                <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                  {is403 ? "Bạn không có quyền thực hiện chức năng này (403 Forbidden)" : "Không thể tải danh sách thiết bị phần cứng"}
                </p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  {is403
                    ? "Tài khoản của bạn chưa được cấp quyền xem dữ liệu tài sản phần cứng. Vui lòng liên hệ Quản trị viên để được phân quyền."
                    : (error as any)?.message || "Vui lòng kiểm tra lại kết nối"}
                </p>
              </div>
            );
          }

          if (isPending) {
            return (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-900">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Đang tải dữ liệu thiết bị...</p>
              </div>
            );
          }

          return currentViewMode === "list" ? (
            /* ==================== 1. LIST VIEW (DATA TABLE) ==================== */
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-xs z-10 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 select-none">
                  <tr>
                    <th className="w-10 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.size > 0 && selectedIds.size === filteredItems.length}
                        onChange={() => {
                          if (selectedIds.size === filteredItems.length) setSelectedIds(new Set());
                          else setSelectedIds(new Set(filteredItems.map((r) => r.id)));
                        }}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                        title="Chọn tất cả"
                      />
                    </th>
                    <th className="px-4 py-3">Mã tài sản & Barcode</th>
                    <th className="px-4 py-3">Tên thiết bị & Model</th>
                    <th className="px-4 py-3">Hãng & Serial Tag</th>
                    <th className="px-4 py-3">Danh mục & Trạng thái</th>
                    <th className="px-4 py-3">Phòng ban & Vị trí</th>
                    <th className="px-4 py-3">Giá vốn & Bảo hành</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs sm:text-sm">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      const warranty = getWarrantyInfo(item.purchaseDate, item.warrantyMonths);

                      return (
                        <tr
                          key={item.id}
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
                                const next = new Set(selectedIds);
                                if (next.has(item.id)) next.delete(item.id);
                                else next.add(item.id);
                                setSelectedIds(next);
                              }}
                              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                          </td>

                          {/* Mã tài sản & Barcode */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                                {item.assetCode}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-gray-400 mt-1 flex items-center gap-1">
                              <span>|||</span>
                              <span>{item.barcode || "Chưa có barcode"}</span>
                            </div>
                          </td>

                          {/* Tên thiết bị & Model */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <span>{item.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Model: <span className="font-medium text-gray-700 dark:text-gray-300">{item.model || "N/A"}</span>
                            </div>
                          </td>

                          {/* Hãng & Serial Tag */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                              {item.brandName || "N/A"}
                            </div>
                            <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                              S/N: <span className="text-gray-600 dark:text-gray-300 font-semibold">{item.serialNumber || "N/A"}</span>
                            </div>
                          </td>

                          {/* Danh mục & Trạng thái */}
                          <td className="px-4 py-3.5">
                            <div className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                              {item.categoryName || "Khác"}
                            </div>
                            <div className="mt-1">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(item.statusName)}`}>
                                {item.statusName}
                              </span>
                            </div>
                          </td>

                          {/* Phòng ban & Vị trí */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[170px]">
                              {item.departmentName || "Chưa phân bổ"}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate max-w-[170px] mt-0.5" title={item.locationName || ""}>
                              📍 {item.locationName || "Chưa xác định"}
                            </div>
                          </td>

                          {/* Giá vốn & Bảo hành */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                              {formatCurrency(item.purchasePrice)}
                            </div>
                            <div className={`text-[11px] mt-0.5 ${warranty.labelColor}`}>
                              {warranty.text}
                            </div>
                          </td>

                          {/* Thao tác */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedItemForDetail(item)}
                                className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                title="Xem chi tiết thiết bị"
                              >
                                Chi tiết
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                                title="Chỉnh sửa thông tin"
                              >
                                ✏️
                              </button>
                              <button
                                disabled={deleteMutation.isPending}
                                onClick={() => handleDelete(item.id, item.assetCode)}
                                className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-3xl">📦</span>
                          <span className="text-sm font-medium">Không tìm thấy thiết bị phần cứng phù hợp</span>
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
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const warranty = getWarrantyInfo(item.purchaseDate, item.warrantyMonths);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemForDetail(item)}
                      className={`p-4 rounded-xl border bg-white dark:bg-gray-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-gray-200 dark:border-gray-700/80"
                        }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {item.assetCode}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(item.statusName)}`}>
                            {item.statusName}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-gray-900 dark:text-white mt-3 text-sm line-clamp-1" title={item.name}>
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.brandName} • {item.model || "N/A"}
                        </p>

                        {/* Details */}
                        <div className="space-y-1.5 mt-3 text-xs">
                          <div className="flex justify-between text-gray-500">
                            <span>Serial Tag:</span>
                            <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{item.serialNumber || "N/A"}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Phòng ban:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                              {item.departmentName || "Chưa phân bổ"}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Giá vốn:</span>
                            <span className="font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(item.purchasePrice)}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Bảo hành:</span>
                            <span className={warranty.labelColor}>{warranty.text}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-gray-400 truncate max-w-[150px]">📍 {item.locationName || "Chưa có vị trí"}</span>
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
          );
        }}
      </AimsBasePageLayout>

      {/* ==================== 3. MODAL CHI TIẾT THIẾT BỊ PHẦN CỨNG ==================== */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-xl">
                  🖥️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{selectedItemForDetail.name}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {selectedItemForDetail.assetCode}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Model: {selectedItemForDetail.model || "N/A"} | S/N: {selectedItemForDetail.serialNumber || "N/A"}
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

            {/* Thông tin chính */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
              <div>
                <span className="text-gray-400 block">Danh mục thiết bị</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.categoryName}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Trạng thái vận hành</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedItemForDetail.statusName}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Hãng sản xuất (Brand)</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.brandName}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Mã vạch / QR Barcode</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.barcode || "Chưa dán barcode"}</span>
              </div>
            </div>

            {/* Tài chính & Bảo hành */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
              <div>
                <span className="text-gray-400 block">Giá vốn thiết bị</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(selectedItemForDetail.purchasePrice)}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Ngày mua / Ngày hiệu lực</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.purchaseDate ? new Date(selectedItemForDetail.purchaseDate).toLocaleDateString("vi-VN") : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Thời gian bảo hành</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedItemForDetail.warrantyMonths ? `${selectedItemForDetail.warrantyMonths} tháng` : "Không có"}
                </span>
              </div>
            </div>

            {/* Phân bổ & Vị trí */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
              <div>
                <span className="text-gray-400 block">Phòng ban sử dụng</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.departmentName || "Chưa phân bổ"}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Địa điểm đặt thiết bị</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.locationName || "Chưa xác định"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block">Nhà cung cấp</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.supplierName || "Chưa cập nhật"}</span>
              </div>
              {selectedItemForDetail.description && (
                <div className="col-span-2">
                  <span className="text-gray-400 block">Ghi chú / Cấu hình bổ sung</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5">{selectedItemForDetail.description}</p>
                </div>
              )}

              {/* Thông số kỹ thuật chuyên sâu */}
              {selectedItemForDetail.specs && Object.keys(selectedItemForDetail.specs).length > 0 && (
                <div className="col-span-2 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-3 rounded-xl space-y-1.5">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300 block">Thông số kỹ thuật phần cứng:</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700 dark:text-gray-300">
                    {selectedItemForDetail.specs.cpu && <div><span className="text-gray-400">CPU:</span> {selectedItemForDetail.specs.cpu}</div>}
                    {selectedItemForDetail.specs.ram && <div><span className="text-gray-400">RAM:</span> {selectedItemForDetail.specs.ram}</div>}
                    {selectedItemForDetail.specs.storage && <div><span className="text-gray-400">Ổ cứng:</span> {selectedItemForDetail.specs.storage}</div>}
                    {selectedItemForDetail.specs.gpu && <div><span className="text-gray-400">Card đồ họa:</span> {selectedItemForDetail.specs.gpu}</div>}
                    {selectedItemForDetail.specs.os && <div><span className="text-gray-400">HĐH:</span> {selectedItemForDetail.specs.os}</div>}
                    {selectedItemForDetail.specs.screenSize && <div><span className="text-gray-400">Màn hình:</span> {selectedItemForDetail.specs.screenSize}</div>}
                    {selectedItemForDetail.specs.resolution && <div><span className="text-gray-400">Độ phân giải:</span> {selectedItemForDetail.specs.resolution}</div>}
                    {selectedItemForDetail.specs.printTechnology && <div><span className="text-gray-400">Công nghệ in:</span> {selectedItemForDetail.specs.printTechnology}</div>}
                    {selectedItemForDetail.specs.portCount && <div><span className="text-gray-400">Số cổng:</span> {selectedItemForDetail.specs.portCount}</div>}
                    {selectedItemForDetail.specs.networkSpeed && <div><span className="text-gray-400">Tốc độ mạng:</span> {selectedItemForDetail.specs.networkSpeed}</div>}
                    {selectedItemForDetail.specs.rackLocation && <div><span className="text-gray-400">Vị trí Rack:</span> {selectedItemForDetail.specs.rackLocation}</div>}
                    {selectedItemForDetail.specs.powerSupply && <div><span className="text-gray-400">Nguồn điện:</span> {selectedItemForDetail.specs.powerSupply}</div>}
                  </div>
                </div>
              )}

              {/* Thuộc tính mở rộng đặc thù */}
              {selectedItemForDetail.customAttributes && selectedItemForDetail.customAttributes.length > 0 && (
                <div className="col-span-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-3 rounded-xl space-y-1.5">
                  <span className="font-semibold text-amber-700 dark:text-amber-300 block">Thuộc tính tùy biến bổ sung:</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700 dark:text-gray-300">
                    {selectedItemForDetail.customAttributes.map((attr, idx) => (
                      <div key={idx}><span className="text-gray-400">{attr.name}:</span> <span className="font-semibold">{attr.value}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-800">
              <button
                onClick={() => {
                  const it = selectedItemForDetail;
                  setSelectedItemForDetail(null);
                  handleEdit(it);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                ✏️ Chỉnh sửa thông tin
              </button>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
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
