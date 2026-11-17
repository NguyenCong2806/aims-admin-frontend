import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../../components/aims";
import PageMeta from "../../../components/common/PageMeta";
import { PaginationFilter } from "../../base/models/PaginationFilter";
import { useDigitalAssetParams, useRemoveDigitalAsset } from "../queries/digitalassetQuery";
import { formatCurrency, getStatusBadge } from "../../../helpper";
import { DigitalAssetViewdDto } from "../models/digitalAsset";
import {
  useAssetCategorySelectList,
  useAssetStatusSelectList,
  useDepartmentSelectList,
  useSupplierSelectList,
} from "../../Lookups/queries";

/**
 * Cấu hình hiển thị theo phân loại tài nguyên số
 */
const SUBTYPE_CONFIG: Record<string, { label: string; icon: string; badgeClass: string }> = {
  DOMAIN: {
    label: "Tên miền (Domain)",
    icon: "🌐",
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60",
  },
  SSL: {
    label: "Chứng chỉ SSL/TLS",
    icon: "🔒",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60",
  },
  CLOUD_SERVER: {
    label: "Máy chủ Cloud / VPS",
    icon: "☁️",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60",
  },
  SOFTWARE_LICENSE: {
    label: "Bản quyền phần mềm",
    icon: "🔑",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60",
  },
  SAAS_SUBSCRIPTION: {
    label: "Thuê bao SaaS",
    icon: "💼",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60",
  },
  INTERNET_LINE: {
    label: "Đường truyền Internet",
    icon: "⚡",
    badgeClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/60 dark:border-cyan-800/60",
  },
};

const getSubTypeInfo = (subType?: string | null) => {
  const key = (subType || "").toUpperCase();
  return (
    SUBTYPE_CONFIG[key] || {
      label: subType || "Tài sản số",
      icon: "🌐",
      badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    }
  );
};

/**
 * Helper tính tình trạng gia hạn / hết hạn của tài sản số
 */
interface ExpirationInfo {
  text: string;
  isExpired: boolean;
  labelColor: string;
}

const getExpirationInfo = (expiryDateStr?: string | Date | null): ExpirationInfo => {
  if (!expiryDateStr) {
    return { text: "Vĩnh viễn / Không hết hạn", isExpired: false, labelColor: "text-gray-400" };
  }
  const expDate = new Date(expiryDateStr);
  if (isNaN(expDate.getTime())) {
    return { text: "Không xác định", isExpired: false, labelColor: "text-gray-400" };
  }
  const now = new Date();
  const diffTime = expDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Đã hết hạn (${expDate.toLocaleDateString("vi-VN")})`,
      isExpired: true,
      labelColor: "text-rose-600 dark:text-rose-400 font-semibold",
    };
  }
  if (diffDays <= 30) {
    return {
      text: `Còn ${diffDays} ngày (${expDate.toLocaleDateString("vi-VN")})`,
      isExpired: false,
      labelColor: "text-amber-600 dark:text-amber-400 font-bold",
    };
  }
  return {
    text: `Còn ${diffDays} ngày (${expDate.toLocaleDateString("vi-VN")})`,
    isExpired: false,
    labelColor: "text-emerald-600 dark:text-emerald-400 font-medium",
  };
};

export const DigitalAssetsPages: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState<string>("");
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<DigitalAssetViewdDto | null>(null);

  const filter: PaginationFilter = {
    MaxPageSize: 100,
    PageIndex: pageIndex,
    PageSize: pageSize,
    Keyword: keyword,
  };

  const { data, isPending, isFetching, isError, error } = useDigitalAssetParams(filter);
  const deleteMutation = useRemoveDigitalAsset();

  // Load danh mục lookups để hiển thị tên nếu API chỉ trả ID số
  const { data: categorySelectList } = useAssetCategorySelectList();
  const { data: statusSelectList } = useAssetStatusSelectList();
  const { data: departmentSelectList } = useDepartmentSelectList();
  const { data: supplierSelectList } = useSupplierSelectList();

  const categoryMap = useMemo(() => new Map(categorySelectList?.map((i) => [String(i.key), i.value])), [categorySelectList]);
  const statusMap = useMemo(() => new Map(statusSelectList?.map((i) => [String(i.key), i.value])), [statusSelectList]);
  const departmentMap = useMemo(() => new Map(departmentSelectList?.map((i) => [String(i.key), i.value])), [departmentSelectList]);
  const supplierMap = useMemo(() => new Map(supplierSelectList?.map((i) => [String(i.key), i.value])), [supplierSelectList]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawItems = (data?.items ?? []) as Array<any>;
  const totalRecords = data?.pagination?.totalRecords ?? rawItems.length;

  const items: DigitalAssetViewdDto[] = useMemo(() => {
    return rawItems.map((it) => {
      const catId = it.categoryId !== undefined && it.categoryId !== null ? String(it.categoryId) : (it.categoryid !== undefined && it.categoryid !== null ? String(it.categoryid) : "");
      const stId = it.statusId !== undefined && it.statusId !== null ? String(it.statusId) : (it.statusid !== undefined && it.statusid !== null ? String(it.statusid) : "");
      const depId = it.departmentId !== undefined && it.departmentId !== null ? String(it.departmentId) : (it.departmentid !== undefined && it.departmentid !== null ? String(it.departmentid) : "");
      const supId = it.supplierId !== undefined && it.supplierId !== null ? String(it.supplierId) : (it.supplierid !== undefined && it.supplierid !== null ? String(it.supplierid) : "");

      return {
        id: String(it.id),
        assetCode: it.assetCode || it.assetcode || "",
        assetSubType: it.assetSubType || it.assetsubtype || "",
        name: it.name || "",
        contractNumber: it.contractNumber || it.contractnumber || "",
        categoryId: it.categoryId ?? it.categoryid,
        categoryName: it.categoryName || it.categoryname || categoryMap.get(catId) || "Khác",
        statusId: it.statusId ?? it.statusid,
        statusName: it.statusName || it.statusname || statusMap.get(stId) || "Đang sử dụng",
        supplierId: it.supplierId ?? it.supplierid,
        supplierName: it.supplierName || it.suppliername || supplierMap.get(supId) || "Chưa cập nhật",
        departmentId: it.departmentId ?? it.departmentid,
        departmentName: it.departmentName || it.departmentname || departmentMap.get(depId) || "Chưa phân bổ",
        costAmount: it.costAmount !== undefined && it.costAmount !== null ? Number(it.costAmount) : (it.costamount !== undefined && it.costamount !== null ? Number(it.costamount) : 0),
        currency: it.currency || "VND",
        billingCycle: it.billingCycle || it.billingcycle || "Hàng năm",
        startDate: it.startDate || it.startdate,
        expiryDate: it.expiryDate || it.expirydate,
        renewalAlertDate: it.renewalAlertDate || it.renewalalertdate,
        description: it.description || "",
        notes: it.notes,
        specs: it.specs,
        customAttributes: it.customAttributes,
      };
    });
  }, [rawItems, categoryMap, statusMap, departmentMap, supplierMap]);

  // Cấu hình Cây phân cấp bộ lọc (AimsTreeFilter)
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    // 1. Nhóm theo phân loại tài nguyên (Subtype)
    const subtypeCounts: Record<string, number> = {};
    items.forEach((it) => {
      const typeKey = it.assetSubType || "Khác";
      subtypeCounts[typeKey] = (subtypeCounts[typeKey] || 0) + 1;
    });

    // 2. Nhóm theo trạng thái hoạt động
    const statusCounts: Record<string, number> = {};
    items.forEach((it) => {
      const s = it.statusName || "Khác";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // 3. Nhóm theo phòng ban quản lý
    const deptCounts: Record<string, number> = {};
    items.forEach((it) => {
      const d = it.departmentName || "Chưa phân bổ";
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    });

    // 4. Nhóm theo chu kỳ thanh toán
    const cycleCounts: Record<string, number> = {};
    items.forEach((it) => {
      const c = it.billingCycle || "Chưa xác định";
      cycleCounts[c] = (cycleCounts[c] || 0) + 1;
    });

    return [
      {
        id: "subtype_group",
        title: "PHÂN LOẠI TÀI NGUYÊN",
        items: [
          { id: "all", label: "Tất cả tài nguyên số", count: items.length },
          ...Object.entries(subtypeCounts).map(([typeKey, count]) => {
            const info = getSubTypeInfo(typeKey);
            return {
              id: `subtype_${typeKey}`,
              label: `${info.icon} ${info.label}`,
              count,
            };
          }),
        ],
      },
      {
        id: "status_group",
        title: "TRẠNG THÁI HOẠT ĐỘNG",
        items: Object.entries(statusCounts).map(([status, count]) => ({
          id: `status_${status}`,
          label: status,
          count,
        })),
      },
      {
        id: "department_group",
        title: "PHÒNG BAN QUẢN LÝ",
        items: Object.entries(deptCounts).map(([dept, count]) => ({
          id: `dept_${dept}`,
          label: dept,
          count,
        })),
      },
      {
        id: "cycle_group",
        title: "CHU KỲ THANH TOÁN",
        items: Object.entries(cycleCounts).map(([cycle, count]) => ({
          id: `cycle_${cycle}`,
          label: cycle,
          count,
        })),
      },
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!selectedFilter || selectedFilter === "all") return items;

    const filterStr = String(selectedFilter);
    if (filterStr.startsWith("subtype_")) {
      const target = filterStr.replace("subtype_", "");
      return items.filter((it) => (it.assetSubType || "Khác") === target);
    }
    if (filterStr.startsWith("status_")) {
      const target = filterStr.replace("status_", "");
      return items.filter((it) => (it.statusName || "Khác") === target);
    }
    if (filterStr.startsWith("dept_")) {
      const target = filterStr.replace("dept_", "");
      return items.filter((it) => (it.departmentName || "Chưa phân bổ") === target);
    }
    if (filterStr.startsWith("cycle_")) {
      const target = filterStr.replace("cycle_", "");
      return items.filter((it) => (it.billingCycle || "Chưa xác định") === target);
    }
    return items;
  }, [items, selectedFilter]);

  // Thao tác điều hướng và CRUD
  const handleAddNew = () => {
    navigate("/tai-nguyen-so/tao-moi");
  };

  const handleEdit = (item: DigitalAssetViewdDto) => {
    navigate(`/tai-nguyen-so/${item.id}/chinh-sua`);
  };

  const handleDelete = (id: string, code?: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.success(`Đã xóa tài nguyên số [${code || id}] thành công`);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        toast.error(err?.message || "Không thể xóa tài nguyên số");
      },
    });
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      for (const id of Array.from(selectedIds)) {
        await deleteMutation.mutateAsync(id);
      }
      setSelectedIds(new Set());
      toast.success("Đã hoàn tất xử lý xóa các tài nguyên số đã chọn!");
    } catch {
      toast.error("Xảy ra lỗi trong quá trình xóa hàng loạt.");
    }
  };

  return (
    <>
      <PageMeta
        title="Tài nguyên số | AIMS Enterprise"
        description="Quản lý hồ sơ hạ tầng số: Tên miền Domain, SSL, Cloud Server, SaaS, Bản quyền phần mềm & Đường truyền Internet"
      />

      <AimsBasePageLayout
        moduleName="Quản lý Tài sản IT"
        moduleIcon={
          <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        }
        moduleTabs={[
          { name: "Thiết bị phần cứng", path: "/thiet-bi-phan-cung" },
          { name: "Tài nguyên số", path: "/tai-nguyen-so", badge: totalRecords },
          { name: "Thêm mới tài nguyên", path: "/tai-nguyen-so/tao-moi" },
          { name: "Giám sát máy trạm", path: "/giam-sat-may-tram" },
        ]}
        title="Tài nguyên số"
        subtitle="Hạ tầng & Tài sản số: Tên miền, Chứng chỉ SSL, Cloud VPS, Bản quyền phần mềm & Thuê bao SaaS"
        totalRecords={totalRecords}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onAddNew={handleAddNew}
        addNewLabel="Thêm tài nguyên"
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBatchDelete={handleBatchDelete}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFilter}
        onSelectTreeFilter={setSelectedFilter}
        isFetching={isFetching}
      >
        {(currentViewMode) => {
          if (isError) {
            const is403 =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (error as any)?.response?.status === 403 ||
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (error as any)?.status === 403 ||
              (error instanceof Error && (error.message.includes("403") || error.message.toLowerCase().includes("quyền")));

            return (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-900">
                <span className="text-4xl mb-2">{is403 ? "🚫" : "⚠️"}</span>
                <p className="text-base font-bold text-rose-600 dark:text-rose-400">
                  {is403 ? "Bạn không có quyền thực hiện chức năng này (403 Forbidden)" : "Không thể tải danh sách tài nguyên số"}
                </p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  {is403
                    ? "Tài khoản của bạn chưa được cấp quyền xem dữ liệu tài nguyên số. Vui lòng liên hệ Quản trị viên để được phân quyền."
                    : (error as any)?.message || "Vui lòng kiểm tra lại kết nối"}
                </p>
              </div>
            );
          }

          if (isPending) {
            return (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-900">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Đang tải dữ liệu tài nguyên số...</p>
              </div>
            );
          }

          return currentViewMode === "list" ? (
            /* ==================== 1. LIST VIEW (DATA TABLE) ==================== */
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-xs z-10 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 select-none">
                  <tr>
                    <th className="w-10 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.size > 0 && selectedIds.size === filteredItems.length}
                        onChange={() => {
                          if (selectedIds.size === filteredItems.length) setSelectedIds(new Set());
                          else setSelectedIds(new Set(filteredItems.map((r) => r.id)));
                        }}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                        title="Chọn tất cả"
                      />
                    </th>
                    <th className="px-4 py-3">Mã tài sản & Hợp đồng</th>
                    <th className="px-4 py-3">Tên tài nguyên & Phân loại</th>
                    <th className="px-4 py-3">Nhà cung cấp & Chu kỳ</th>
                    <th className="px-4 py-3">Phòng ban & Trạng thái</th>
                    <th className="px-4 py-3">Chi phí & Thời hạn</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs sm:text-sm">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      const expiration = getExpirationInfo(item.expiryDate);
                      const subTypeInfo = getSubTypeInfo(item.assetSubType);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedItemForDetail(item)}
                          className={`transition-colors group cursor-pointer ${
                            isSelected
                              ? "bg-brand-50/80 dark:bg-brand-950/40 font-medium text-brand-950 dark:text-brand-100"
                              : "hover:bg-gray-50/80 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const next = new Set(selectedIds);
                                if (next.has(item.id)) next.delete(item.id);
                                else next.add(item.id);
                                setSelectedIds(next);
                              }}
                              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                            />
                          </td>

                          {/* Mã tài sản & Hợp đồng */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                {item.assetCode || "N/A"}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-gray-400 mt-1 flex items-center gap-1">
                              <span>HĐ:</span>
                              <span>{item.contractNumber || "Chưa có hợp đồng"}</span>
                            </div>
                          </td>

                          {/* Tên tài nguyên & Phân loại */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <span>{subTypeInfo.icon}</span>
                              <span className="truncate max-w-[220px]" title={item.name}>{item.name}</span>
                            </div>
                            <div className="mt-1">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${subTypeInfo.badgeClass}`}>
                                {subTypeInfo.label}
                              </span>
                            </div>
                          </td>

                          {/* Nhà cung cấp & Chu kỳ */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]" title={item.supplierName || ""}>
                              {item.supplierName || "Chưa cập nhật"}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                              Chu kỳ: <span className="font-medium text-gray-700 dark:text-gray-300">{item.billingCycle || "N/A"}</span>
                            </div>
                          </td>

                          {/* Phòng ban & Trạng thái */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]" title={item.departmentName || ""}>
                              {item.departmentName || "Chưa phân bổ"}
                            </div>
                            <div className="mt-1">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(item.statusName)}`}>
                                {item.statusName || "Đang sử dụng"}
                              </span>
                            </div>
                          </td>

                          {/* Chi phí & Thời hạn */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                              {formatCurrency(item.costAmount || 0)} {item.currency || "₫"}
                            </div>
                            <div className={`text-[11px] mt-0.5 ${expiration.labelColor}`}>
                              {expiration.text}
                            </div>
                          </td>

                          {/* Thao tác */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedItemForDetail(item)}
                                className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                title="Xem chi tiết tài nguyên"
                              >
                                Chi tiết
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors cursor-pointer"
                                title="Chỉnh sửa thông tin"
                              >
                                ✏️
                              </button>
                              <button
                                disabled={deleteMutation.isPending}
                                onClick={() => handleDelete(item.id, item.assetCode)}
                                className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Xóa tài nguyên"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-3xl">☁️</span>
                          <span className="text-sm font-medium">Không tìm thấy tài nguyên số phù hợp</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* ==================== 2. KANBAN / CARD VIEW ==================== */
            <div className="flex-1 overflow-auto p-4 bg-gray-50/50 dark:bg-gray-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const expiration = getExpirationInfo(item.expiryDate);
                  const subTypeInfo = getSubTypeInfo(item.assetSubType);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemForDetail(item)}
                      className={`p-4 rounded-xl border bg-white dark:bg-gray-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected ? "border-brand-500 ring-2 ring-brand-500/20" : "border-gray-200 dark:border-gray-700/80"
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            {item.assetCode || "N/A"}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(item.statusName)}`}>
                            {item.statusName || "Đang sử dụng"}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="mt-3 flex items-start gap-2">
                          <span className="text-lg">{subTypeInfo.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1" title={item.name}>
                              {item.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {subTypeInfo.label}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5 mt-3 text-xs">
                          <div className="flex justify-between text-gray-500">
                            <span>Nhà cung cấp:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                              {item.supplierName || "Chưa cập nhật"}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Phòng ban:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                              {item.departmentName || "Chưa phân bổ"}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Chi phí / Kỳ:</span>
                            <span className="font-mono font-bold text-gray-900 dark:text-white">
                              {formatCurrency(item.costAmount || 0)} {item.currency || "₫"} / {item.billingCycle || "kỳ"}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Thời hạn:</span>
                            <span className={expiration.labelColor}>{expiration.text}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-gray-400 font-mono truncate max-w-[150px]">
                          {item.contractNumber ? `HĐ: ${item.contractNumber}` : "Không có số HĐ"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForDetail(item);
                          }}
                          className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                        >
                          Chi tiết &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }}
      </AimsBasePageLayout>

      {/* ==================== 3. MODAL CHI TIẾT TÀI NGUYÊN SỐ ==================== */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-xl">
                  {getSubTypeInfo(selectedItemForDetail.assetSubType).icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{selectedItemForDetail.name}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {selectedItemForDetail.assetCode}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Phân loại: {getSubTypeInfo(selectedItemForDetail.assetSubType).label} | HĐ: {selectedItemForDetail.contractNumber || "Chưa có"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Thông tin chính */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
              <div>
                <span className="text-gray-400 block">Phân loại tài nguyên</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {getSubTypeInfo(selectedItemForDetail.assetSubType).label}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Trạng thái vận hành</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {selectedItemForDetail.statusName}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Nhà cung cấp dịch vụ</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.supplierName || "Chưa cập nhật"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Số hợp đồng / Mã dịch vụ</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.contractNumber || "N/A"}
                </span>
              </div>
            </div>

            {/* Tài chính & Chu kỳ */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
              <div>
                <span className="text-gray-400 block">Chi phí định kỳ</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {formatCurrency(selectedItemForDetail.costAmount || 0)} {selectedItemForDetail.currency || "₫"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Chu kỳ thanh toán</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.billingCycle || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Tình trạng thời hạn</span>
                <span className={`font-semibold ${getExpirationInfo(selectedItemForDetail.expiryDate).labelColor}`}>
                  {getExpirationInfo(selectedItemForDetail.expiryDate).text}
                </span>
              </div>
            </div>

            {/* Ngày tháng & Hiệu lực */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
              <div>
                <span className="text-gray-400 block">Ngày bắt đầu hiệu lực</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.startDate ? new Date(selectedItemForDetail.startDate).toLocaleDateString("vi-VN") : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Ngày kết thúc / Hết hạn</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.expiryDate ? new Date(selectedItemForDetail.expiryDate).toLocaleDateString("vi-VN") : "Vĩnh viễn"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Ngày cảnh báo gia hạn</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {selectedItemForDetail.renewalAlertDate ? new Date(selectedItemForDetail.renewalAlertDate).toLocaleDateString("vi-VN") : "Không thiết lập"}
                </span>
              </div>
            </div>

            {/* Phân bổ & Quản lý */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
              <div>
                <span className="text-gray-400 block">Phòng ban quản lý</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.departmentName || "Chưa phân bổ"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Danh mục tài sản</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.categoryName || "Khác"}
                </span>
              </div>
              {selectedItemForDetail.description && (
                <div className="col-span-2">
                  <span className="text-gray-400 block">Ghi chú & Mô tả dịch vụ</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5 whitespace-pre-wrap">
                    {selectedItemForDetail.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-800">
              <button
                onClick={() => {
                  const it = selectedItemForDetail;
                  setSelectedItemForDetail(null);
                  handleEdit(it);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white cursor-pointer"
              >
                ✏️ Chỉnh sửa thông tin
              </button>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DigitalAssetsPages;
