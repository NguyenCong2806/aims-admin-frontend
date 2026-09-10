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
  DownloadIcon,
} from "../../../icons";

import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";

import { toast } from "sonner";
import { PaginationFilter } from "../../../models/base/PaginationFilter";
import Pagination from "../../../components/ui/pagination";
import SearchInput from "../../../components/ui/search/SearchInput";

// Queries
import {
  useDigitalAssetParams,
  useRemoveDigitalAsset,
  usePrefetchDigitalAssetPage,
} from "../../../query/digitalasset/digitalassetQuery";

// Types
import type { DigitalAsset } from "../../../models/DigitalAsset/digitalasset/digitalasset";

const DigitalAssetsPage: React.FC = () => {
  // =====================================================
  // STATE
  // =====================================================
  const [maxPageSize] = useState<number>(100);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [keyword, setKeyword] = useState<string>("");

  // =====================================================
  // PAGINATION FILTER
  // =====================================================
  const filter: PaginationFilter = {
    MaxPageSize: maxPageSize,
    PageIndex: pageIndex,
    PageSize: pageSize,
    Keyword: keyword,
  };

  // =====================================================
  // QUERIES
  // =====================================================
  const { data, isPending, isFetching, isError } = useDigitalAssetParams(filter);
  const deleteAsset = useRemoveDigitalAsset();
  const prefetchPage = usePrefetchDigitalAssetPage();

  // =====================================================
  // HANDLERS
  // =====================================================
  const handleSearch = (val: string) => {
    setKeyword(val);
    setPageIndex(1);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAsset.mutateAsync(id);
      if (items.length === 1 && pageIndex > 1) {
        setPageIndex((prev) => prev - 1);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể xóa tài sản.";
      toast.error(`Xóa thất bại: ${message}`);
    }
  };

  const handlePageHover = (targetPage: number) => {
    prefetchPage(targetPage, {
      MaxPageSize: maxPageSize,
      PageSize: pageSize,
      Keyword: keyword,
    });
  };

  // =====================================================
  // DATA
  // =====================================================
  const items = (data?.items ?? []) as unknown as DigitalAsset[];
  const totalPages = data?.pagination?.totalPages ?? 0;
  const totalCount = data?.pagination?.totalRecords ?? 0;

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <>
      <PageMeta
        title="Tài nguyên số"
        description="Quản lý tài sản số, domain, máy chủ cloud, bản quyền phần mềm và đường truyền internet"
      />
      <PageBreadcrumb pageTitle="Tài nguyên số" />

      <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950 sm:p-6">
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <SearchInput
              placeholder="Tìm kiếm mã TS, tên tài sản..."
              onSearch={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              startIcon={<DownloadIcon />}
              onClick={() => toast.info("Tải mẫu")}
            >
              Tải mẫu
            </Button>
            <Button startIcon={<PlusIcon />} onClick={() => toast.info("Thêm mới")}>
              Thêm mới
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {(isPending || isFetching) && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="py-8 text-center">
            <p className="text-red-500">Có lỗi xảy ra khi tải dữ liệu</p>
          </div>
        )}

        {/* Table */}
        {!isPending && !isError && items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      <input type="checkbox" />
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      Mã TS
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      Tên tài sản
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      Phân loại
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      Nhà cung cấp
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      Chi phí/Chu kỳ
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      Ngày hết hạn
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start">
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-3">
                        <input type="checkbox" />
                      </TableCell>
                      <TableCell className="px-5 py-3 font-medium">
                        {item.assetCode || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {item.name || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {item.assetSubType || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {item.supplierName || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {item.costAmount
                          ? `${item.costAmount.toLocaleString("vi-VN")} ${item.currency || "VNĐ"} / ${item.billingCycle || "N/A"}`
                          : "-"}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        {item.expiryDate
                          ? new Date(item.expiryDate).toLocaleDateString("vi-VN")
                          : "-"}
                      </TableCell>
                      <TableCell className="px-5 py-3">
                        <div className="flex gap-2">
                          <button
                            className="rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 transition-colors"
                            title="Chỉnh sửa"
                            onClick={() => toast.info("Chính sửa chưa được implement")}
                          >
                            <PencilIcon />
                          </button>
                          <button
                            className="rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 transition-colors"
                            title="Xóa"
                            onClick={() => item.id && handleDelete(item.id)}
                          >
                            <TrashBinIcon />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="mt-4">
                <Pagination
                  page={pageIndex}
                  pageSize={pageSize}
                  totalCount={totalCount}
                  totalPages={totalPages}
                  onPageChange={setPageIndex}
                  onPageSizeChange={setPageSize}
                  onPageHover={handlePageHover}
                />
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!isPending && !isError && items.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Không có dữ liệu để hiển thị
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DigitalAssetsPage;
