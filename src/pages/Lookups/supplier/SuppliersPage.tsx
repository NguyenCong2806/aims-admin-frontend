import React, { useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { PencilIcon, PlusIcon, TrashBinIcon } from "../../../icons";
import Pagination from "../../../components/ui/pagination";
import SearchInput from "../../../components/ui/search/SearchInput";
import { PaginationFilter } from "../../../models/base/PaginationFilter";
import { createsupplier, supplier, updatesupplier } from "../../../models/Lookup/supplier/supplier";
import { SupplierFormData } from "../../../validations/supplier.schema";
import SupplierModal from "./SupplierModal";
import { useCreateSupplier, usePrefetchSupplierPage, useRemoveSupplier, useSupplierById, useSupplierParams, useUpdateSupplier } from "../../../query/suppliers/suppliersQuery";

const SuppliersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const filter: PaginationFilter = { MaxPageSize: 100, PageIndex: pageIndex, PageSize: pageSize, Keyword: keyword };
  const { data, isPending, isFetching, isError, error } = useSupplierParams(filter);
  const { data: detail, isLoading: isLoadingDetail } = useSupplierById(supplierId);
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useRemoveSupplier();
  const prefetchPage = usePrefetchSupplierPage();
  const items = (data?.items ?? []) as supplier[];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const closeModal = () => { setIsModalOpen(false); setSupplierId(null); };
  const submit = async (formData: SupplierFormData) => {
    try {
      if (supplierId === null) await createMutation.mutateAsync({ id: 0, ...formData } as createsupplier);
      else await updateMutation.mutateAsync({ id: supplierId, params: { id: supplierId, ...formData } as updatesupplier });
      closeModal();
    } catch (err) { toast.error(`Lưu thông tin thất bại: ${err instanceof Error ? err.message : "Đã có lỗi xảy ra."}`); }
  };
  const remove = async (id: number) => {
    try { await deleteMutation.mutateAsync(id); if (items.length === 1 && pageIndex > 1) setPageIndex((current) => current - 1); }
    catch (err) { toast.error(`Xóa thất bại: ${err instanceof Error ? err.message : "Không thể xóa nhà cung cấp."}`); }
  };
  if (isPending) return <div className="flex min-h-[350px] items-center justify-center text-sm text-gray-500">Đang tải dữ liệu...</div>;
  if (isError) return <div className="flex min-h-[300px] items-center justify-center text-sm text-red-500">{error instanceof Error ? error.message : "Không thể tải danh sách nhà cung cấp."}</div>;
  return <>
    <SearchInput initialValue={keyword} onSearch={(value) => { setKeyword(value); setPageIndex(1); }} placeholder="Tìm nhà cung cấp..." className="mb-4" />
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"><div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]"><div><h2 className="text-lg font-semibold text-gray-800 dark:text-white">Nhà cung cấp</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Quản lý danh sách nhà cung cấp</p></div>{isFetching && <span className="size-2 animate-ping rounded-full bg-brand-500" title="Đang đồng bộ..." />}<Button size="sm" variant="primary" onClick={() => { setSupplierId(null); setIsModalOpen(true); }}><PlusIcon fontSize={18} />Thêm mới</Button></div>
      <div className="max-w-full overflow-x-auto"><Table><TableHeader><TableRow><TableCell isHeader className="px-5 py-3 text-start">Nhà cung cấp</TableCell><TableCell isHeader className="px-5 py-3 text-start">Mã</TableCell><TableCell isHeader className="px-5 py-3 text-start">Mã số thuế</TableCell><TableCell isHeader className="px-5 py-3 text-start">Người liên hệ</TableCell><TableCell isHeader className="px-5 py-3 text-start">Điện thoại</TableCell><TableCell isHeader className="px-5 py-3 text-start">Email</TableCell><TableCell isHeader className="px-5 py-3 text-center">Chức năng</TableCell></TableRow></TableHeader><TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">{items.length ? items.map((item) => <TableRow key={item.id}><TableCell className="px-5 py-4">{item.name}</TableCell><TableCell className="px-5 py-4 text-gray-500">{item.code}</TableCell><TableCell className="px-5 py-4">{item.taxCode ?? "-"}</TableCell><TableCell className="px-5 py-4">{item.contactPerson ?? "-"}</TableCell><TableCell className="px-5 py-4">{item.phone ?? "-"}</TableCell><TableCell className="px-5 py-4">{item.email ?? "-"}</TableCell><TableCell className="px-5 py-4"><div className="flex justify-center gap-2"><Button size="sm" variant="primary" className="!size-9 !rounded-full !p-0" onClick={() => { setSupplierId(item.id!); setIsModalOpen(true); }}><PencilIcon fontSize={18} /></Button><Button size="sm" variant="outline" disabled={deleteMutation.isPending} className="!size-9 !rounded-full !border-red-500 !p-0 !text-red-500" onClick={() => remove(item.id!)}><TrashBinIcon fontSize={18} /></Button></div></TableCell></TableRow>) : <TableRow><TableCell colSpan={7} className="px-5 py-12 text-center text-sm text-gray-500">Chưa có nhà cung cấp nào.</TableCell></TableRow>}</TableBody></Table></div></div>
    <Pagination page={pageIndex} pageSize={pageSize} totalCount={data?.pagination?.totalRecords ?? 0} totalPages={data?.pagination?.totalPages ?? 0} onPageChange={setPageIndex} onPageSizeChange={setPageSize} onPageHover={(page) => prefetchPage(page, { MaxPageSize: 100, PageSize: pageSize, Keyword: keyword })} />
    <SupplierModal isOpen={isModalOpen} onClose={closeModal} supplier={supplierId !== null ? detail?.data ?? null : null} isLoading={isLoadingDetail || isSubmitting} onSubmit={submit} />
  </>;
};

export default SuppliersPage;