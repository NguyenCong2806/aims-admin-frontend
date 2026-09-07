import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import {
  PencilIcon,
  PlusIcon,
  TrashBinIcon,
} from "../../../icons";

import { toast } from "sonner";
import { PaginationFilter } from "../../../models/base/PaginationFilter";
import Pagination from "../../../components/ui/pagination";
import SearchInput from "../../../components/ui/search/SearchInput";

import { useAssetStatusById, useAssetStatusParams, useCreateAssetStatus, usePrefetchAssetStatusPage, useRemoveAssetStatus, useUpdateAssetStatus } from "../../../query/assetstatus/assetstatusQuery";
import AssetStatusModal from "./AssetStatusModal";
import { assetstatus, createassetstatus, updateassetstatus } from "../../../models/Lookup/assetstatus/assetstatus";
import { AssetStatusFormData } from "../../../validations/assetstatuse.schema";

const AssetStatusPage: React.FC = () => {
  // =====================================================
  // STATE
  // =====================================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maxPageSize] = useState<number>(100);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [keyword, setKeyword] = useState<string>("");
  const [assetStatusId, setAssetStatusId] = useState<number | null>(null);

  // =====================================================
  // QUERY
  // =====================================================
  const filter: PaginationFilter = {
    MaxPageSize: maxPageSize,
    PageIndex: pageIndex,
    PageSize: pageSize,
    Keyword: keyword,
  };

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
  } = useAssetStatusParams(filter);

  const {
    data: assetStatusDetail,
    isLoading: isLoadingDetail,
  } = useAssetStatusById(assetStatusId);

  // =====================================================
  // MUTATION
  // =====================================================
  const createAssetStatus = useCreateAssetStatus();
  const updateAssetStatus = useUpdateAssetStatus();
  const deleteAssetStatus = useRemoveAssetStatus();

  const isSubmitting = createAssetStatus.isPending || updateAssetStatus.isPending;

  // =====================================================
  // HANDLERS
  // =====================================================
  const handleSearch = (val: string) => {
    setKeyword(val);
    setPageIndex(1); // Luôn đưa về trang 1 khi người dùng gõ từ khóa mới
  };

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
        id: 0,
        name: formData.name,
        code: formData.code,
        colorCode: formData.colorCode,
        allowAllocation: formData.allowAllocation,
      };
      await createAssetStatus.mutateAsync(payload);
    } else {
      const payload: updateassetstatus = {
        id: assetStatusId,
        name: formData.name,
        code: formData.code,
        colorCode: formData.colorCode,
        allowAllocation: formData.allowAllocation,
      };
      await updateAssetStatus.mutateAsync({
        id: assetStatusId,
        params: payload,
      });
    }

    handleCloseModal();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra.";
    toast.error(`Lưu thông tin thất bại: ${message}`);
  }
};
  // Bên trong component BrandsPage:
  const prefetchPage = usePrefetchAssetStatusPage();

  const handlePageHover = (targetPage: number) => {
    prefetchPage(targetPage, {
      MaxPageSize: maxPageSize,
      PageSize: pageSize,
      Keyword: keyword,
    });
  };
  const handleDelete = async (id: number) => {
  
    try {
      await deleteAssetStatus.mutateAsync(id);
      
      // Nếu xóa phần tử duy nhất ở trang hiện tại, lùi về trang trước
      if (items.length === 1 && pageIndex > 1) {
        setPageIndex((prev) => prev - 1);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể xóa danh mục.";
      toast.error(`Xóa thất bại: ${message}`);
    }
  };

  // =====================================================
  // DATA
  // =====================================================
  const items = (data?.items ?? []) as Array<assetstatus>;

  // Chỉ loading toàn màn hình ở lần nạp đầu tiên (chưa có cache)
  if (isPending) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Đang tải dữ liệu...
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="rounded-lg bg-red-50 px-5 py-4 text-center dark:bg-red-500/10">
          <p className="text-sm font-medium text-red-500">
            Không thể tải danh sách trạng thái tài sản.
          </p>
          <p className="mt-1 text-xs text-red-400">
            {error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SearchInput
        initialValue={keyword}
        onSearch={handleSearch}
        placeholder="Tìm trạng thái..."
        className="mb-4"
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Trạng thái tài sản
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Quản lý danh sách trạng thái tài sản
              </p>
            </div>
            {/* Hiển thị ngầm chỉ báo đang cập nhật dữ liệu */}
            {isFetching && (
              <span className="size-2 animate-ping rounded-full bg-brand-500" title="Đang đồng bộ..." />
            )}
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={handleAdd}
          >
            <PlusIcon fontSize={18} />
            Thêm mới
          </Button>
        </div>

        {/* TABLE */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  Tên trạng thái
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  Mã trạng thái
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-center font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  Chức năng
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.id}>
                    {/* NAME */}
                    <TableCell className="px-5 py-4 text-start">
                      <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {item.name}
                      </span>
                    </TableCell>

                    {/* CODE */}
                    <TableCell className="px-5 py-4 text-start">
                      <span className="text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.code}
                      </span>
                    </TableCell>

                    {/* ACTION */}
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* EDIT */}
                        <Button
                          type="button"
                          size="sm"
                          variant="primary"
                          className="!size-9 !rounded-full !p-0"
                          onClick={() => handleEdit(item.id!)}
                        >
                          <PencilIcon fontSize={18} />
                        </Button>

                        {/* DELETE */}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={deleteAssetStatus.isPending}
                          className="!size-9 !rounded-full !border-red-500 !p-0 !text-red-500 hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-500/10"
                          onClick={() => handleDelete(item.id!)}
                        >
                          <TrashBinIcon fontSize={18} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="bg-gray-50 dark:bg-white/5">
                  <TableCell className="px-5 py-12 text-center justify-center" colSpan={3}>
                    <div className="flex flex-col items-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Chưa có trạng thái tài sản nào.
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"> 
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Hãy thêm trạng thái đầu tiên.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        page={pageIndex}
        pageSize={pageSize}
        totalCount={data?.pagination?.totalRecords ?? 0}
        totalPages={data?.pagination?.totalPages ?? 0}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onPageHover={handlePageHover}
      />

      {/* MODAL */}
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