import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { PencilIcon, TrashBinIcon } from "../../../icons";
import { PaginationFilter } from "../../../models/base/PaginationFilter";
import {
  createdepartment,
  department,
  updatedepartment,
} from "../../../models/Lookup/department/department";
import { DepartmentFormData } from "../../../validations/department.schema";
import DepartmentModal from "./DepartmentModal";
import {
  useCreateDepartment,
  useDepartmentAll,
  useDepartmentById,
  useDepartmentParams,
  useRemoveDepartment,
  useUpdateDepartment,
} from "../../../query/departments/departmentsQuery";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../../components/aims";

const DepartmentsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
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

  const { data, isPending, isFetching, isError, error } = useDepartmentParams(filter);
  const { data: allDepartments = [] } = useDepartmentAll();
  const { data: detail, isLoading: isLoadingDetail } = useDepartmentById(departmentId);

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useRemoveDepartment();

  const items = (data?.items ?? []) as department[];
  const departments = allDepartments as department[];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const closeModal = () => {
    setIsModalOpen(false);
    setDepartmentId(null);
  };

  const submit = async (formData: DepartmentFormData) => {
    try {
      if (departmentId === null) {
        await createMutation.mutateAsync({ id: 0, ...formData } as createdepartment);
        toast.success("Thêm mới phòng ban thành công!");
      } else {
        await updateMutation.mutateAsync({
          id: departmentId,
          params: { id: departmentId, ...formData } as updatedepartment,
        });
        toast.success("Cập nhật phòng ban thành công!");
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
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng ban này không?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Xóa phòng ban thành công!");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (items.length === 1 && pageIndex > 1) setPageIndex((current) => current - 1);
    } catch (err) {
      toast.error(
        `Xóa thất bại: ${
          err instanceof Error ? err.message : "Không thể xóa phòng ban."
        }`
      );
    }
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa ${selectedIds.size} phòng ban đã chọn?`
      )
    )
      return;

    try {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      toast.success(`Đã xóa ${selectedIds.size} phòng ban thành công!`);
      setSelectedIds(new Set());
    } catch {
      toast.error("Xảy ra lỗi trong quá trình xóa hàng loạt.");
    }
  };

  const parentName = (parentId?: number) =>
    departments.find((item) => item.id === parentId)?.name ?? "-";

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

  // Build tree filter groups for departments
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    const rootDepts = departments.filter((d) => !d.parentId);
    const childDepts = departments.filter((d) => !!d.parentId);

    const deptTreeItems = rootDepts.map((root) => {
      const children = departments.filter((c) => c.parentId === root.id);
      return {
        id: `dept_${root.id}`,
        label: root.name,
        count: children.length + 1,
        children: children.map((ch) => ({
          id: `dept_${ch.id}`,
          label: ch.name,
          count: 1,
        })),
      };
    });

    return [
      {
        id: "departments",
        title: "CÂY PHÒNG BAN (DEPARTMENTS)",
        items: [
          {
            id: "all",
            label: "Tất cả phòng ban",
            count: departments.length,
          },
          ...deptTreeItems,
        ],
      },
      {
        id: "dept_types",
        title: "CƠ CẤU TỔ CHỨC",
        items: [
          {
            id: "root_only",
            label: "Khối / Phòng ban gốc",
            count: rootDepts.length,
          },
          {
            id: "sub_only",
            label: "Bộ phận trực thuộc",
            count: childDepts.length,
          },
        ],
      },
    ];
  }, [departments]);

  // Apply tree filter to items
  const filteredItems = useMemo(() => {
    if (!selectedTreeFilter || selectedTreeFilter === "all") return items;

    if (String(selectedTreeFilter).startsWith("dept_")) {
      const deptId = Number(String(selectedTreeFilter).replace("dept_", ""));
      return items.filter((it) => it.id === deptId || it.parentId === deptId);
    }

    if (selectedTreeFilter === "root_only") {
      return items.filter((it) => !it.parentId);
    }

    if (selectedTreeFilter === "sub_only") {
      return items.filter((it) => !!it.parentId);
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
          { name: "Phòng ban", path: "/phong-ban", badge: departments.length },
          { name: "Chức vụ", path: "/chuc-vu" },
          { name: "Địa điểm", path: "/dia-diem" },
          { name: "Trung tâm chi phí", path: "/trung-tam-chi-phi" },
        ]}
        // 2. Control Panel
        title="Phòng ban"
        subtitle="Quản lý cơ cấu phòng ban và đơn vị tổ chức"
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
          setDepartmentId(null);
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
        // 4. Status
        isLoading={isPending}
        loadingMessage="Đang tải danh sách phòng ban..."
        error={isError ? (error instanceof Error ? error.message : "Không thể tải danh sách phòng ban.") : null}
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
                    <th className="px-4 py-3">Tên phòng ban</th>
                    <th className="px-4 py-3">Mã phòng ban</th>
                    <th className="px-4 py-3">Phòng ban cha</th>
                    <th className="px-4 py-3">Người quản lý</th>
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
                          {/* Checkbox */}
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

                          {/* Tên */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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

                          {/* Phòng ban cha */}
                          <td className="px-4 py-3.5">
                            {item.parentId ? (
                              <span className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium">
                                <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                {item.parentDepartment?.name ?? parentName(item.parentId)}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                                Phòng ban gốc
                              </span>
                            )}
                          </td>

                          {/* Người quản lý */}
                          <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">
                            {item.managerName || "-"}
                          </td>

                          {/* Thao tác */}
                          <td
                            className="px-4 py-3.5 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setDepartmentId(item.id!);
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
                        colSpan={6}
                        className="px-4 py-16 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>Không tìm thấy phòng ban nào phù hợp.</span>
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
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span>Bộ phận</span>
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
                              {item.parentId ? parentName(item.parentId) : "Phòng ban gốc"}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 pt-1">
                            Quản lý: {item.managerName || "Chưa phân công"}
                          </p>
                        </div>

                        <div
                          className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setDepartmentId(item.id!);
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
                    Không tìm thấy phòng ban nào phù hợp.
                  </div>
                )}
              </div>
            </div>
          )
        }
      </AimsBasePageLayout>

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        department={departmentId !== null ? detail?.data ?? null : null}
        departments={departments}
        isLoading={isLoadingDetail || isSubmitting}
        onSubmit={submit}
      />
    </>
  );
};

export default DepartmentsPage;