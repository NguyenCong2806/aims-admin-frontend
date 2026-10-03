import React, { useState } from "react";
import { toast } from "sonner";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import { PaginationFilter } from "../../../models/base/PaginationFilter";
import { department } from "../../../models/Lookup/department/department";
import { createposition, position, updateposition } from "../../../models/Lookup/position/position";
import { PositionFormData } from "../../../validations/position.schema";
import PositionModal from "./PositionModal";
import { useDepartmentAll } from "../../../query/departments/departmentsQuery";
import {
  useCreatePosition,
  usePositionById,
  usePositionParams,
  useRemovePosition,
  useUpdatePosition,
} from "../../../query/positions/positionsQuery";
import { AimsBasePageLayout, ViewMode } from "../../../components/aims";

const PositionsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [positionId, setPositionId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filter: PaginationFilter = {
    MaxPageSize: 100,
    PageIndex: pageIndex,
    PageSize: pageSize,
    Keyword: keyword,
  };

  const { data, isPending, isFetching, isError, error } = usePositionParams(filter);
  const { data: allDepartments = [] } = useDepartmentAll();
  const { data: detail, isLoading: isLoadingDetail } = usePositionById(positionId);

  const createMutation = useCreatePosition();
  const updateMutation = useUpdatePosition();
  const deleteMutation = useRemovePosition();

  const items = (data?.items ?? []) as position[];
  const departments = allDepartments as department[];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const closeModal = () => {
    setIsModalOpen(false);
    setPositionId(null);
  };

  const submit = async (formData: PositionFormData) => {
    try {
      if (positionId === null) {
        await createMutation.mutateAsync({ id: 0, ...formData } as createposition);
        toast.success("Thêm mới chức vụ thành công!");
      } else {
        await updateMutation.mutateAsync({
          id: positionId,
          params: { id: positionId, ...formData } as updateposition,
        });
        toast.success("Cập nhật chức vụ thành công!");
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
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Xóa chức vụ thành công!");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (items.length === 1 && pageIndex > 1) setPageIndex((current) => current - 1);
    } catch (err) {
      toast.error(
        `Xóa thất bại: ${
          err instanceof Error ? err.message : "Không thể xóa chức vụ."
        }`
      );
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      toast.success(`Đã xóa ${selectedIds.size} chức vụ thành công!`);
      setSelectedIds(new Set());
    } catch {
      toast.error("Xảy ra lỗi trong quá trình xóa hàng loạt.");
    }
  };

  const departmentName = (departmentId?: number) =>
    departments.find((item) => item.id === departmentId)?.name ?? "-";

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
        // Phân hệ Tổ chức & Địa điểm
        moduleName="Tổ chức & Địa điểm"
        moduleIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        moduleTabs={[
          { name: "Phòng ban", path: "/phong-ban" },
          { name: "Chức vụ", path: "/chuc-vu", badge: items.length },
          { name: "Địa điểm", path: "/dia-diem" },
          { name: "Trung tâm chi phí", path: "/trung-tam-chi-phi" },
        ]}
        title="Chức vụ"
        subtitle="Quản lý danh sách chức danh & vị trí công việc"
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
          setPositionId(null);
          setIsModalOpen(true);
        }}
        onExportExcel={() => toast.success("Đang xuất dữ liệu chức vụ ra file Excel...")}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBatchDelete={handleBatchDelete}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFetching={isFetching}
        isLoading={isPending}
        loadingMessage="Đang tải danh sách chức vụ..."
        error={isError ? (error instanceof Error ? error.message : "Không thể tải danh sách chức vụ.") : null}
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
                    <th className="px-4 py-3">Tên chức vụ</th>
                    <th className="px-4 py-3">Mã chức vụ</th>
                    <th className="px-4 py-3">Phòng ban</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs sm:text-sm">
                  {items.length ? (
                    items.map((item) => {
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
                              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

                          <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">
                            {(item as position & { department?: { name?: string } }).department?.name ?? departmentName(item.departmentId)}
                          </td>

                          <td
                            className="px-4 py-3.5 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setPositionId(item.id!);
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
                      <td colSpan={5} className="px-4 py-16 text-center text-sm text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Không tìm thấy chức vụ nào phù hợp.</span>
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
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                            <span>Vị trí</span>
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                              {(item as position & { department?: { name?: string } }).department?.name ?? departmentName(item.departmentId)}
                            </span>
                          </div>
                        </div>

                        <div
                          className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setPositionId(item.id!);
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
                    Không tìm thấy chức vụ nào phù hợp.
                  </div>
                )}
              </div>
            </div>
          )
        }
      </AimsBasePageLayout>

      <PositionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        position={positionId !== null ? detail?.data ?? null : null}
        departments={departments}
        isLoading={isLoadingDetail || isSubmitting}
        onSubmit={submit}
      />
    </>
  );
};

export default PositionsPage;