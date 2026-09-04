/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

import Button from "../../components/ui/button/Button";
import {
  PencilIcon,
  PlusIcon,
  TrashBinIcon,
} from "../../icons";

import BrandModal from "./BrandModal";

import type { brand, creatbrand, updatebrand } from "../../models/Lookup/brand/brand";

import {
  usecreateBrand,
  usequeryByIdBrand,
  useupdateBrand,
  useremoveBrand,
  usequeryBrandParams,
} from "../../query/brand/brandQuery";
import { toast } from "sonner";
import { PaginationFilter } from "../../models/base/PaginationFilter";
import Pagination from "../../components/ui/pagination";
import SearchInput from "../../components/ui/search/SearchInput";

const BrandsPage: React.FC = () => {
  // =====================================================
  // STATE
  // =====================================================

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maxPageSize, setmaxPageSize] = useState<number>(100);
  const [pageIndex, setpageIndex] = useState<number>(1);
  const [pageSize, setpageSize] = useState<number>(10);
  const [keyword, setkeyword] = useState<string>("");
  // null = thêm mới
  // number = chỉnh sửa
  const [brandId, setBrandId] = useState<number | null>(null);

  // =====================================================
  // QUERY
  // =====================================================

  const filter: PaginationFilter = {
    MaxPageSize: maxPageSize,
    PageIndex: pageIndex,
    PageSize: pageSize,
    Keyword: keyword
  }

  const {
    data,
    isLoading,
    isError,
    error,
  } = usequeryBrandParams(filter);

  const {
    data: brandDetail,
    isLoading: isLoadingDetail,
  } = usequeryByIdBrand(brandId);

  // =====================================================
  // MUTATION
  // =====================================================

  const createBrand = usecreateBrand();
  const updateBrand = useupdateBrand();
  const deleteBrand = useremoveBrand();

  // =====================================================
  // DATA
  // =====================================================
  const items = (data?.items ?? []) as Array<brand>;
  // =====================================================
  // ADD
  // =====================================================

  const handleAdd = () => {
    // Quan trọng: reset ID trước
    setBrandId(null);

    // Sau đó mở modal
    setIsModalOpen(true);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = (id: number) => {
    setBrandId(id);
    setIsModalOpen(true);
  };

  // =====================================================
  // CLOSE
  // =====================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);

    // Reset ID để lần sau bấm thêm mới
    // form không lấy lại dữ liệu cũ
    setBrandId(null);
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (formData: {
    name: string;
    code: string;
  }) => {
    try {
      // ADD
      if (brandId === null) {
        const brand: creatbrand = {
          name: formData.name,
          code: formData.code,
          id: 0
        };
        await createBrand.mutateAsync(brand);
      }

      // UPDATE
      else {
        const brand: updatebrand = {
          name: formData.name,
          code: formData.code,
          id: brandId
        };
        await updateBrand.mutateAsync({
          id: brandId,
          params: brand,
        });
      }

      handleCloseModal();
    } catch (error) {
      console.error("Save brand error:", error);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id: number) => {
    try {
      await deleteBrand.mutateAsync(id);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể xóa hãng sản xuất.";

      toast.error(`Xóa hãng sản xuất thất bại: ${message}`);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />

          <span className="text-sm text-gray-500 dark:text-gray-400">
            Đang tải dữ liệu...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (isError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="rounded-lg bg-red-50 px-5 py-4 text-center dark:bg-red-500/10">
          <p className="text-sm font-medium text-red-500">
            Không thể tải danh sách hãng sản xuất.
          </p>

          <p className="mt-1 text-xs text-red-400">
            {error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi không xác định."}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
   <SearchInput
      initialValue={keyword}
      onSearch={setkeyword}
      placeholder="Tìm hãng sản xuất..."
      className="mb-4"
    />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.05]">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Hãng sản xuất
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Quản lý danh sách hãng sản xuất
            </p>
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
                  Tên hãng sản xuất
                </TableCell>

                <TableCell
                  isHeader
                  className="px-5 py-3 text-start font-medium text-gray-500 text-theme-xs dark:text-gray-400"
                >
                  Mã hãng
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
                        Chưa có hãng sản xuất
                      </p>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Hãy thêm hãng sản xuất đầu tiên.
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
        totalCount={data?.pagination.totalRecords ?? 0}
        totalPages={data?.pagination.totalPages ?? 0}
        onPageChange={setpageIndex}
        onPageSizeChange={setpageSize}
      />
      {/* =====================================================
          MODAL
      ===================================================== */}

      <BrandModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        brand={
          brandId !== null
            ? brandDetail?.data ?? null
            : null
        }
        isLoading={isLoadingDetail}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default BrandsPage;