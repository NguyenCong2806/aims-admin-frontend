import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import { PaginationFilter } from "../../../models/base/PaginationFilter";
import { createlocation, location, updatelocation } from "../../../models/Lookup/location/location";
import { LocationFormData } from "../../../validations/location.schema";
import LocationModal from "./LocationModal";
import {
  useCreateLocation,
  useLocationAll,
  useLocationById,
  useLocationParams,
  useRemoveLocation,
  useUpdateLocation,
} from "../../../query/locations/locationsQuery";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../../components/aims";

const LocationsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [locationId, setLocationId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedTreeFilter, setSelectedTreeFilter] = useState<string | number | null>("all");
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);

  const filter: PaginationFilter = {
    MaxPageSize: 100,
    PageIndex: pageIndex,
    PageSize: pageSize,
    Keyword: keyword,
  };

  const { data, isPending, isFetching, isError, error } = useLocationParams(filter);
  const { data: allLocations = [] } = useLocationAll();
  const { data: detail, isLoading: isLoadingDetail } = useLocationById(locationId);

  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useRemoveLocation();

  const items = (data?.items ?? []) as location[];
  const locations = allLocations as location[];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const closeModal = () => {
    setIsModalOpen(false);
    setLocationId(null);
  };

  const submit = async (formData: LocationFormData) => {
    try {
      if (locationId === null) {
        await createMutation.mutateAsync({ id: 0, ...formData } as createlocation);
        toast.success("Thêm mới địa điểm thành công!");
      } else {
        await updateMutation.mutateAsync({
          id: locationId,
          params: { id: locationId, ...formData } as updatelocation,
        });
        toast.success("Cập nhật địa điểm thành công!");
      }
      closeModal();
    } catch (err) {
      toast.error(
        `Lưu thông tin thất bại: ${
          err instanceof Error ? err.message : "Đã có lỗi xảy ra."
        }`
      );
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa điểm này không?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Xóa địa điểm thành công!");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (items.length === 1 && pageIndex > 1) setPageIndex((current) => current - 1);
    } catch (err) {
      toast.error(
        `Xóa thất bại: ${
          err instanceof Error ? err.message : "Không thể xóa địa điểm."
        }`
      );
    }
  };

  // Batch delete selected items
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedIds.size} địa điểm đã chọn?`
      )
    )
      return;

    try {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      toast.success(`Đã xóa ${selectedIds.size} địa điểm thành công!`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error("Xảy ra lỗi trong quá trình xóa hàng loạt.");
    }
  };

  const parentName = (parentId?: number) =>
    locations.find((item) => item.id === parentId)?.name ?? "-";

  // Multi-select toggle
  const toggleSelectAll = () => {
    if (selectedIds.size === items.length && items.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((it) => it.id!).filter(Boolean)));
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Build tree filter groups matching AIMS hierarchy
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    const rootLocations = locations.filter((loc) => !loc.parentId);
    const childLocations = locations.filter((loc) => !!loc.parentId);
    const withAddress = locations.filter((loc) => !!loc.address && loc.address.trim().length > 0);

    const locationTreeItems = rootLocations.map((root) => {
      const children = locations.filter((c) => c.parentId === root.id);
      return {
        id: `loc_${root.id}`,
        label: root.name,
        count: children.length + 1,
        children: children.map((ch) => ({
          id: `loc_${ch.id}`,
          label: ch.name,
          count: 1,
        })),
      };
    });

    return [
      {
        id: "locations",
        title: "CÂY ĐỊA ĐIỂM (LOCATIONS)",
        items: [
          {
            id: "all",
            label: "Tất cả địa điểm",
            count: locations.length,
          },
          ...locationTreeItems,
        ],
      },
      {
        id: "filters",
        title: "PHÂN LOẠI VỊ TRÍ",
        items: [
          {
            id: "root_only",
            label: "Địa điểm gốc (Root)",
            count: rootLocations.length,
          },
          {
            id: "sub_only",
            label: "Địa điểm trực thuộc",
            count: childLocations.length,
          },
          {
            id: "has_address",
            label: "Có địa chỉ đầy đủ",
            count: withAddress.length,
          },
        ],
      },
    ];
  }, [locations]);

  // Apply tree filter to items on frontend if active
  const filteredItems = useMemo(() => {
    if (!selectedTreeFilter || selectedTreeFilter === "all") return items;

    if (String(selectedTreeFilter).startsWith("loc_")) {
      const locId = Number(String(selectedTreeFilter).replace("loc_", ""));
      return items.filter((it) => it.id === locId || it.parentId === locId);
    }

    if (selectedTreeFilter === "root_only") {
      return items.filter((it) => !it.parentId);
    }

    if (selectedTreeFilter === "sub_only") {
      return items.filter((it) => !!it.parentId);
    }

    if (selectedTreeFilter === "has_address") {
      return items.filter((it) => !!it.address && it.address.trim().length > 0);
    }

    return items;
  }, [items, selectedTreeFilter]);

  const isAllSelected =
    filteredItems.length > 0 &&
    filteredItems.every((it) => selectedIds.has(it.id!));

  return (
    <>
      <AimsBasePageLayout
        // 1. Phân hệ Tổ chức & Địa điểm
        moduleName="Tổ chức & Địa điểm"
        moduleIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        moduleTabs={[
          { name: "Phòng ban", path: "/phong-ban" },
          { name: "Chức vụ", path: "/chuc-vu" },
          { name: "Địa điểm", path: "/dia-diem", badge: locations.length },
          { name: "Trung tâm chi phí", path: "/trung-tam-chi-phi" },
        ]}
        // 2. Control Panel
        title="Địa điểm"
        subtitle="Quản lý danh sách địa điểm & kho"
        totalRecords={data?.pagination?.totalRecords ?? 0}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onAddNew={() => {
          setLocationId(null);
          setIsModalOpen(true);
        }}
        onExportExcel={() => toast.success("Đang xuất dữ liệu ra file Excel...")}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBatchDelete={handleBatchDelete}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFetching={isFetching}
        // 3. Tree Filter
        treeGroups={treeGroups}
        selectedTreeFilter={selectedTreeFilter}
        onSelectTreeFilter={setSelectedTreeFilter}
        isTreeCollapsed={isTreeCollapsed}
        onToggleTreeCollapse={() => setIsTreeCollapsed(!isTreeCollapsed)}
        // 4. Loading & Error
        isLoading={isPending}
        loadingMessage="Đang tải danh sách địa điểm..."
        error={isError ? (error instanceof Error ? error.message : "Không thể tải danh sách địa điểm.") : null}
      >
        {(currentViewMode) =>
          currentViewMode === "list" ? (
            /* LIST VIEW (Table chuẩn AIMS Enterprise) */
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-xs z-10 border-b border-gray-200 dark:border-gray-800">
                  <tr className="text-xs font-semibold text-gray-600 dark:text-gray-300 select-none">
                    <th className="w-12 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                        title="Chọn tất cả"
                      />
                    </th>
                    <th className="px-4 py-3">Tên địa điểm</th>
                    <th className="px-4 py-3">Mã địa điểm</th>
                    <th className="px-4 py-3">Địa điểm cha</th>
                    <th className="px-4 py-3">Địa chỉ</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs sm:text-sm">
                  {filteredItems.length ? (
                    filteredItems.map((item) => {
                      const isSelected = selectedIds.has(item.id!);
                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors group cursor-pointer ${
                            isSelected
                              ? "bg-cyan-50/80 dark:bg-cyan-950/40 font-medium text-cyan-950 dark:text-cyan-100"
                              : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300"
                          }`}
                          onClick={() => toggleSelectRow(item.id!)}
                        >
                          {/* Row Checkbox */}
                          <td
                            className="px-4 py-3.5 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(item.id!)}
                              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                          </td>

                          {/* Tên địa điểm */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {item.name}
                              </span>
                            </div>
                          </td>

                          {/* Mã */}
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {item.code || "-"}
                            </span>
                          </td>

                          {/* Địa điểm cha */}
                          <td className="px-4 py-3.5">
                            {item.parentId ? (
                              <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium">
                                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                {parentName(item.parentId)}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                                Địa điểm gốc
                              </span>
                            )}
                          </td>

                          {/* Địa chỉ */}
                          <td className="px-4 py-3.5 max-w-xs truncate text-gray-600 dark:text-gray-400">
                            {item.address || "-"}
                          </td>

                          {/* Trạng thái */}
                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Hoạt động</span>
                            </span>
                          </td>

                          {/* Thao tác */}
                          <td
                            className="px-4 py-3.5 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setLocationId(item.id!);
                                  setIsModalOpen(true);
                                }}
                                className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <PencilIcon fontSize={16} />
                              </button>
                              <button
                                disabled={deleteMutation.isPending}
                                onClick={() => remove(item.id!)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Xóa"
                              >
                                <TrashBinIcon fontSize={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-16 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>Không tìm thấy địa điểm nào phù hợp.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* KANBAN VIEW (Chế độ xem Thẻ AIMS Enterprise) */
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-950/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.length ? (
                  filteredItems.map((item) => {
                    const isSelected = selectedIds.has(item.id!);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelectRow(item.id!)}
                        className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                          isSelected
                            ? "bg-cyan-50/90 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-700 shadow-sm"
                            : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md hover:border-brand-300"
                        }`}
                      >
                        {/* Top Row: Checkbox + Status */}
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(item.id!)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                          />
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Hoạt động</span>
                          </span>
                        </div>

                        {/* Content */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {item.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-mono font-semibold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800">
                              {item.code}
                            </span>
                            <span>•</span>
                            <span className="truncate">
                              {item.parentId ? parentName(item.parentId) : "Địa điểm gốc"}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 pt-1">
                            {item.address || "Chưa có địa chỉ chi tiết"}
                          </p>
                        </div>

                        {/* Bottom Actions */}
                        <div
                          className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setLocationId(item.id!);
                              setIsModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <PencilIcon fontSize={14} />
                            <span>Sửa</span>
                          </button>
                          <button
                            disabled={deleteMutation.isPending}
                            onClick={() => remove(item.id!)}
                            className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <TrashBinIcon fontSize={14} />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-16 text-center text-sm text-gray-500">
                    Không tìm thấy địa điểm nào phù hợp.
                  </div>
                )}
              </div>
            </div>
          )
        }
      </AimsBasePageLayout>

      {/* Modal Thêm / Chỉnh sửa */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        location={locationId !== null ? detail?.data ?? null : null}
        locations={locations}
        isLoading={isLoadingDetail || isSubmitting}
        onSubmit={submit}
      />
    </>
  );
};

export default LocationsPage;