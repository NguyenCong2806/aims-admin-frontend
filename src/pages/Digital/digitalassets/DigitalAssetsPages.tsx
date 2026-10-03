import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import PageMeta from "../../../components/common/PageMeta";
import { toast } from "sonner";
import { PaginationFilter } from "../../../models/base/PaginationFilter";
import {
  useDigitalAssetParams,
  useRemoveDigitalAsset,
} from "../../../query/digitalasset/digitalassetQuery";
import type { DigitalAsset } from "../../../models/DigitalAsset/digitalasset/digitalasset";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../../components/aims";

const DigitalAssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [keyword, setKeyword] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [isTreeCollapsed, setIsTreeCollapsed] = useState(false);

  const filter: PaginationFilter = {
    MaxPageSize: 100,
    PageIndex: pageIndex,
    PageSize: pageSize,
    Keyword: keyword,
  };

  const { data, isPending, isFetching, isError, error } = useDigitalAssetParams(filter);
  const deleteAsset = useRemoveDigitalAsset();

  const rawItems = (data?.items ?? []) as unknown as DigitalAsset[];
  const totalCount = data?.pagination?.totalRecords ?? 0;

  const handleDelete = async (id: number) => {
    try {
      await deleteAsset.mutateAsync(id);
      toast.success("Xóa tài nguyên số thành công!");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (rawItems.length === 1 && pageIndex > 1) {
        setPageIndex((prev) => prev - 1);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể xóa tài sản.";
      toast.error(`Xóa thất bại: ${message}`);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      for (const id of selectedIds) {
        await deleteAsset.mutateAsync(id);
      }
      toast.success(`Đã xóa ${selectedIds.size} tài nguyên số thành công!`);
      setSelectedIds(new Set());
    } catch {
      toast.error("Xảy ra lỗi trong quá trình xóa hàng loạt.");
    }
  };

  // Filter items based on facet tree filter
  const items = useMemo(() => {
    if (!selectedFilter || selectedFilter === "all") return rawItems;
    return rawItems.filter((item) => String(item.assetSubType || "").toLowerCase() === String(selectedFilter).toLowerCase());
  }, [rawItems, selectedFilter]);

  // Build facet groups
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    const subTypeCounts: Record<string, number> = {};
    rawItems.forEach((item) => {
      const type = item.assetSubType || "Khác";
      subTypeCounts[type] = (subTypeCounts[type] || 0) + 1;
    });

    const typeItems = Object.entries(subTypeCounts).map(([type, count]) => ({
      id: type,
      label: type,
      count,
    }));

    return [
      {
        id: "types",
        title: "PHÂN LOẠI TÀI NGUYÊN",
        items: [
          {
            id: "all",
            label: "Tất cả tài nguyên",
            count: rawItems.length,
          },
          ...typeItems,
        ],
      },
    ];
  }, [rawItems]);

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
      <PageMeta
        title="Tài nguyên số | AIMS Enterprise"
        description="Quản lý tài sản số, domain, máy chủ cloud, bản quyền phần mềm và đường truyền internet"
      />

      <AimsBasePageLayout
        moduleName="Tài nguyên số"
        moduleIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        }
        moduleTabs={[
          { name: "Tất cả tài nguyên", path: "/tai-nguyen-so", badge: rawItems.length },
          { name: "Thêm mới", path: "/tai-nguyen-so/tao-moi" },
        ]}
        title="Tài nguyên số"
        subtitle="Quản lý hạ tầng số: Domain SSL, Cloud, SaaS, License & Đường truyền"
        totalRecords={totalCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onAddNew={() => navigate("/tai-nguyen-so/tao-moi")}
        addNewLabel="Tạo mới"
        onExportExcel={() => toast.success("Đang xuất dữ liệu tài nguyên số ra file Excel...")}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBatchDelete={handleBatchDelete}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFetching={isFetching}
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFilter}
        onSelectTreeFilter={setSelectedFilter}
        isTreeCollapsed={isTreeCollapsed}
        onToggleTreeCollapse={() => setIsTreeCollapsed(!isTreeCollapsed)}
        isLoading={isPending}
        loadingMessage="Đang tải danh sách tài nguyên số..."
        error={isError ? (error instanceof Error ? error.message : "Không thể tải danh sách tài nguyên số.") : null}
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
                    <th className="px-4 py-3">Mã tài sản</th>
                    <th className="px-4 py-3">Tên tài sản</th>
                    <th className="px-4 py-3">Phân loại</th>
                    <th className="px-4 py-3">Nhà cung cấp</th>
                    <th className="px-4 py-3">Chi phí / Chu kỳ</th>
                    <th className="px-4 py-3">Ngày hết hạn</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs sm:text-sm">
                  {items.length ? (
                    items.map((item) => {
                      const isSelected = item.id ? selectedIds.has(item.id) : false;
                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors group cursor-pointer ${
                            isSelected
                              ? "bg-cyan-50/80 dark:bg-cyan-950/40 font-medium text-cyan-950 dark:text-cyan-100"
                              : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300"
                          }`}
                          onClick={() => item.id && toggleSelectRow(item.id)}
                        >
                          <td
                            className="px-4 py-3.5 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => item.id && toggleSelectRow(item.id)}
                              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {item.assetCode || "-"}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                                </svg>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {item.name}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                              {item.assetSubType || "-"}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">
                            {item.supplierName || "-"}
                          </td>

                          <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 font-medium">
                            {item.costAmount
                              ? `${item.costAmount.toLocaleString("vi-VN")} ${item.currency || "₫"} / ${item.billingCycle || "kỳ"}`
                              : "-"}
                          </td>

                          <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">
                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("vi-VN") : "-"}
                          </td>

                          <td
                            className="px-4 py-3.5 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => item.id && navigate(`/tai-nguyen-so/${item.id}/chinh-sua`)}
                                className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <PencilIcon fontSize={16} />
                              </button>
                              <button
                                disabled={deleteAsset.isPending}
                                onClick={() => item.id && handleDelete(item.id)}
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
                      <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                          <span>Không tìm thấy tài nguyên số nào phù hợp.</span>
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
                {items.length ? (
                  items.map((item) => {
                    const isSelected = item.id ? selectedIds.has(item.id) : false;
                    return (
                      <div
                        key={item.id}
                        onClick={() => item.id && toggleSelectRow(item.id)}
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
                            onChange={() => item.id && toggleSelectRow(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                          />
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                            <span>{item.assetSubType || "Digital"}</span>
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                              </svg>
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {item.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-mono font-semibold px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-800">
                              {item.assetCode}
                            </span>
                            <span>•</span>
                            <span className="truncate">{item.supplierName || "Nội bộ"}</span>
                          </div>

                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                            {item.costAmount
                              ? `${item.costAmount.toLocaleString("vi-VN")} ${item.currency || "₫"} / ${item.billingCycle || "kỳ"}`
                              : "Không có chi phí"}
                          </p>
                        </div>

                        <div
                          className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => item.id && navigate(`/tai-nguyen-so/${item.id}/chinh-sua`)}
                            className="px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <PencilIcon fontSize={14} />
                            <span>Sửa</span>
                          </button>
                          <button
                            disabled={deleteAsset.isPending}
                            onClick={() => item.id && handleDelete(item.id)}
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
                    Không tìm thấy tài nguyên số nào phù hợp.
                  </div>
                )}
              </div>
            </div>
          )
        }
      </AimsBasePageLayout>
    </>
  );
};

export default DigitalAssetsPage;
