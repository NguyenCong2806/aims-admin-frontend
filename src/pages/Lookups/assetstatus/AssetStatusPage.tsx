import React, { useState } from "react";
import { toast } from "sonner";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import { PaginationFilter } from "../../../models/base/PaginationFilter";
import {
  useAssetStatusById,
  useAssetStatusParams,
  useCreateAssetStatus,
  useRemoveAssetStatus,
  useUpdateAssetStatus,
} from "../../../query/assetstatus/assetstatusQuery";
import AssetStatusModal from "./AssetStatusModal";
import {
  assetstatus,
  createassetstatus,
  updateassetstatus,
} from "../../../models/Lookup/assetstatus/assetstatus";
import { AssetStatusFormData } from "../../../validations/assetstatuse.schema";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../../components/aims";
import { useMemo } from "react";

const AssetStatusPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [keyword, setKeyword] = useState<string>("");
  const [assetStatusId, setAssetStatusId] = useState<number | null>(null);
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

  const { data, isPending, isFetching, isError, error } = useAssetStatusParams(filter);
  const { data: assetStatusDetail, isLoading: isLoadingDetail } = useAssetStatusById(assetStatusId);

  const createAssetStatus = useCreateAssetStatus();
  const updateAssetStatus = useUpdateAssetStatus();
  const deleteAssetStatus = useRemoveAssetStatus();

  const isSubmitting = createAssetStatus.isPending || updateAssetStatus.isPending;
  const items = (data?.items ?? []) as Array<assetstatus>;

  // Build tree filter groups for Asset Status
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    const statusItems = items.map((st) => ({
      id: `status_${st.id}`,
      label: st.name || `Trạng thái #${st.id}`,
      count: 1,
    }));

    return [
      {
        id: "asset_statuses",
        title: "CÂY TRẠNG THÁI (ASSET STATUS)",
        items: [
          {
            id: "all",
            label: "Tất cả trạng thái",
            count: data?.pagination?.totalRecords ?? items.length,
          },
          ...statusItems,
        ],
      },
      {
        id: "related_categories",
        title: "DANH MỤC LIÊN KẾT",
        items: [
          { id: "tab_/hang-san-xuat", label: "Hãng sản xuất" },
          { id: "tab_/loai-tai-san", label: "Loại tài sản" },
          { id: "tab_/danh-muc-san-pham", label: "Nhóm danh mục" },
          { id: "tab_/don-vi", label: "Đơn vị tính" },
          { id: "tab_/nha-cung-cap", label: "Nhà cung cấp" },
        ],
      },
    ];
  }, [items, data?.pagination?.totalRecords]);

  // Filter items based on selected tree filter
  const filteredItems = useMemo(() => {
    if (!selectedTreeFilter || selectedTreeFilter === "all") return items;
    if (typeof selectedTreeFilter === "string" && selectedTreeFilter.startsWith("status_")) {
      const targetId = Number(selectedTreeFilter.replace("status_", ""));
      return items.filter((it) => it.id === targetId);
    }
    return items;
  }, [items, selectedTreeFilter]);

  const handleAdd = () => {
    setAssetStatusId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: number) => {
    setAssetStatusId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAssetStatusId(null);
  };

  const handleSubmit = async (formData: AssetStatusFormData) => {
    try {
      if (assetStatusId === null) {
        const payload: createassetstatus = {
          name: formData.name,
          code: formData.code,
          id: 0,
        };
        await createAssetStatus.mutateAsync(payload);
        toast.success("Thêm mới trạng thái tài sản thành công!");
      } else {
        const payload: updateassetstatus = {
          name: formData.name,
          code: formData.code,
          id: assetStatusId,
        };
        await updateAssetStatus.mutateAsync({
          id: assetStatusId,
          params: payload,
        });
        toast.success("Cập nhật trạng thái tài sản thành công!");
      }

      handleCloseModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
      toast.error(`Lưu thông tin thất bại: ${message}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAssetStatus.mutateAsync(id);
      toast.success("Xóa trạng thái tài sản thành công!");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (items.length === 1 && pageIndex > 1) {
        setPageIndex((prev) => prev - 1);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể xóa trạng thái tài sản.";
      toast.error(`Xóa thất bại: ${message}`);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      for (const id of selectedIds) {
        await deleteAssetStatus.mutateAsync(id);
      }
      toast.success(`Đã xóa ${selectedIds.size} trạng thái tài sản thành công!`);
      setSelectedIds(new Set());
    } catch {
      toast.error("Xảy ra lỗi trong quá trình xóa hàng loạt.");
    }
  };

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

  const isAllSelected = items.length > 0 && items.every((it) => selectedIds.has(it.id!));

  return (
    <>
      <AimsBasePageLayout
        moduleName="Danh mục tài sản"
        moduleIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        }
        moduleTabs={[
          { name: "Hãng sản xuất", path: "/hang-san-xuat" },
          { name: "Loại tài sản", path: "/loai-tai-san" },
          { name: "Nhóm danh mục", path: "/danh-muc-san-pham" },
          { name: "Đơn vị tính", path: "/don-vi" },
          { name: "Trạng thái", path: "/trang-thai-tai-san", badge: items.length },
          { name: "Nhà cung cấp", path: "/nha-cung-cap" },
        ]}
        title="Trạng thái tài sản"
        subtitle="Quản lý các trạng thái vòng đời trang thiết bị (Sẵn sàng, Đang sử dụng, Sửa chữa...)"
        totalRecords={data?.pagination?.totalRecords ?? 0}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onAddNew={handleAdd}
        addNewLabel="Thêm mới"
        onExportExcel={() => toast.success("Đang xuất dữ liệu trạng thái tài sản ra file Excel...")}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBatchDelete={handleBatchDelete}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFetching={isFetching}
        // Tree Filter
        treeGroups={treeGroups}
        selectedTreeFilter={selectedTreeFilter}
        onSelectTreeFilter={setSelectedTreeFilter}
        isTreeCollapsed={isTreeCollapsed}
        onToggleTreeCollapse={() => setIsTreeCollapsed(!isTreeCollapsed)}
        isLoading={isPending}
        loadingMessage="Đang tải danh sách trạng thái tài sản..."
        error={isError ? (error instanceof Error ? error.message : "Không thể tải danh sách trạng thái tài sản.") : null}
      >
        {(currentViewMode) =>
          currentViewMode === "list" ? (
            /* LIST VIEW */
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
                    <th className="px-4 py-3">Tên trạng thái</th>
                    <th className="px-4 py-3">Mã trạng thái</th>
                    <th className="px-4 py-3">Trạng thái đại diện</th>
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

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {item.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {item.code || "-"}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{item.name}</span>
                            </span>
                          </td>

                          <td
                            className="px-4 py-3.5 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleEdit(item.id!)}
                                className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <PencilIcon fontSize={16} />
                              </button>
                              <button
                                disabled={deleteAssetStatus.isPending}
                                onClick={() => handleDelete(item.id!)}
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
                      <td colSpan={5} className="px-4 py-16 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Không tìm thấy trạng thái tài sản nào.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* KANBAN VIEW */
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
                            <span>Vòng đời</span>
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                          </div>
                        </div>

                        <div
                          className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleEdit(item.id!)}
                            className="px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <PencilIcon fontSize={14} />
                            <span>Sửa</span>
                          </button>
                          <button
                            disabled={deleteAssetStatus.isPending}
                            onClick={() => handleDelete(item.id!)}
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
                    Không tìm thấy trạng thái tài sản nào phù hợp.
                  </div>
                )}
              </div>
            </div>
          )
        }
      </AimsBasePageLayout>

      <AssetStatusModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        assetStatus={assetStatusId !== null ? assetStatusDetail?.data ?? null : null}
        isLoading={isLoadingDetail || isSubmitting}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default AssetStatusPage;