import React, { useState } from "react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import { PencilIcon, PlusIcon, TrashBinIcon } from "../../../icons";
import Pagination from "../../../components/ui/pagination";
import SearchInput from "../../../components/ui/search/SearchInput";
import { PaginationFilter } from "../../../models/base/PaginationFilter";
import { createlicensetype, licensetype, updatelicensetype } from "../../../models/Lookup/licensetype/licensetype";
import { LicenseTypeFormData } from "../../../validations/licensetype.schema";
import LicenseTypeModal from "./LicenseTypeModal";
import { useCreateLicenseType, useLicenseTypeById, useLicenseTypeParams, usePrefetchLicenseTypePage, useRemoveLicenseType, useUpdateLicenseType } from "../../../query/licensetypes/licensetypesQuery";

const LicenseTypesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [licenseTypeId, setLicenseTypeId] = useState<number | null>(null);
  const filter: PaginationFilter = { MaxPageSize: 100, PageIndex: pageIndex, PageSize: pageSize, Keyword: keyword };
  const { data, isPending, isFetching, isError, error } = useLicenseTypeParams(filter);
  const { data: detail, isLoading: isLoadingDetail } = useLicenseTypeById(licenseTypeId);
  const createMutation = useCreateLicenseType();
  const updateMutation = useUpdateLicenseType();
  const deleteMutation = useRemoveLicenseType();
  const prefetchPage = usePrefetchLicenseTypePage();
  const items = (data?.items ?? []) as licensetype[];
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const closeModal = () => { setIsModalOpen(false); setLicenseTypeId(null); };
  const submit = async (formData: LicenseTypeFormData) => {
    try {
      if (licenseTypeId === null) await createMutation.mutateAsync({ id: 0, ...formData } as createlicensetype);
      else await updateMutation.mutateAsync({ id: licenseTypeId, params: { id: licenseTypeId, ...formData } as updatelicensetype });
      closeModal();
    } catch (err) { toast.error(`Lưu thông tin thất bại: ${err instanceof Error ? err.message : "Đã có lỗi xảy ra."}`); }
  };
  const remove = async (id: number) => {
    try { await deleteMutation.mutateAsync(id); if (items.length === 1 && pageIndex > 1) setPageIndex((current) => current - 1); }
    catch (err) { toast.error(`Xóa thất bại: ${err instanceof Error ? err.message : "Không thể xóa loại giấy phép."}`); }
  };
  if (isPending) return <div className="flex min-h-[350px] items-center justify-center text-sm text-gray-500">Đang tải dữ liệu...</div>;
  if (isError) return <div className="flex min-h-[300px] items-center justify-center text-sm text-red-500">{error instanceof Error ? error.message : "Không thể tải danh sách loại giấy phép."}</div>;
  return <>
    <SearchInput initialValue={keyword} onSearch={(value) => { setKeyword(value); setPageIndex(1); }} placeholder="Tìm loại giấy phép..." className="mb-4" />
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"><div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]"><div><h2 className="text-lg font-semibold text-gray-800 dark:text-white">Loại giấy phép</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Quản lý danh sách loại giấy phép</p></div>{isFetching && <span className="size-2 animate-ping rounded-full bg-brand-500" title="Đang đồng bộ..." />}<Button size="sm" variant="primary" onClick={() => { setLicenseTypeId(null); setIsModalOpen(true); }}><PlusIcon fontSize={18} />Thêm mới</Button></div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader className="px-5 py-3 text-start">
                Tên loại giấy phép</TableCell>
              <TableCell isHeader className="px-5 py-3 text-start">
                Mã</TableCell>
              <TableCell isHeader className="px-5 py-3 text-center">
                Gia hạn định kỳ</TableCell><TableCell isHeader className="px-5 py-3 text-center">Chức năng</TableCell></TableRow></TableHeader><TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">{items.length ? items.map((item) => <TableRow key={item.id}><TableCell className="px-5 py-4">{item.name}</TableCell><TableCell className="px-5 py-4 text-gray-500">{item.code}</TableCell><TableCell className="px-5 py-4 text-center">{item.isSubscription ? "Có" : "Không"}</TableCell><TableCell className="px-5 py-4"><div className="flex justify-center gap-2"><Button size="sm" variant="primary" className="!size-9 !rounded-full !p-0" onClick={() => { setLicenseTypeId(item.id!); setIsModalOpen(true); }}><PencilIcon fontSize={18} /></Button><Button size="sm" variant="outline" disabled={deleteMutation.isPending} className="!size-9 !rounded-full !border-red-500 !p-0 !text-red-500" onClick={() => remove(item.id!)}><TrashBinIcon fontSize={18} /></Button></div></TableCell></TableRow>) : <TableRow><TableCell colSpan={4} className="px-5 py-12 text-center text-sm text-gray-500">Chưa có loại giấy phép nào.</TableCell></TableRow>}</TableBody></Table></div></div>
    <Pagination page={pageIndex} pageSize={pageSize} totalCount={data?.pagination?.totalRecords ?? 0} totalPages={data?.pagination?.totalPages ?? 0} onPageChange={setPageIndex} onPageSizeChange={setPageSize} onPageHover={(page) => prefetchPage(page, { MaxPageSize: 100, PageSize: pageSize, Keyword: keyword })} />
    <LicenseTypeModal isOpen={isModalOpen} onClose={closeModal} licenseType={licenseTypeId !== null ? detail?.data ?? null : null} isLoading={isLoadingDetail || isSubmitting} onSubmit={submit} />
  </>;
};

export default LicenseTypesPage;