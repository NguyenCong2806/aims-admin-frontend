import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { AimsBasePageLayout, ViewMode, TreeFilterGroup } from "../../components/aims";
import PageMeta from "../../components/common/PageMeta";
import { HardwareAsset } from "../../models/Hardware/hardwareAsset";

// Mock dữ liệu ban đầu thiết bị phần cứng thực tế
const INITIAL_HARDWARE_ASSETS: HardwareAsset[] = [
  {
    id: "h1-0001-4444-9999-111111111111",
    assetCode: "HW-PC-0021",
    name: "Máy trạm thiết kế đồ họa & phát triển",
    model: "TUF Gaming Station B660M",
    serialNumber: "220501838400192",
    barcode: "893850100210",
    categoryId: 1,
    categoryName: "Máy trạm để bàn (Workstation)",
    statusId: 1,
    statusName: "Đang sử dụng",
    brandId: 1,
    brandName: "ASUS",
    supplierId: 1,
    supplierName: "Công ty Cổ phần Tin học Phong Vũ",
    locationId: 1,
    locationName: "Tòa nhà A - Tầng 4 (Phòng Dev)",
    departmentId: 1,
    departmentName: "Phòng Công nghệ & IT",
    purchasePrice: 28500000,
    purchaseDate: "2023-08-15T00:00:00Z",
    effectiveDate: "2023-08-18T00:00:00Z",
    warrantyMonths: 36,
    description: "Cấu hình Intel Core i7-12700, 32GB RAM, 1TB NVMe, RTX 3060 12GB phục vụ dự án AIMS.",
    createdAt: "2023-08-15T08:30:00Z",
    updatedAt: "2024-01-10T14:20:00Z",
  },
  {
    id: "h1-0002-4444-9999-222222222222",
    assetCode: "HW-PC-0088",
    name: "Máy vi tính văn phòng nhân sự",
    model: "OptiPlex 7000 Micro Form",
    serialNumber: "9FC4KL3",
    barcode: "893850100880",
    categoryId: 1,
    categoryName: "Máy trạm để bàn (Workstation)",
    statusId: 1,
    statusName: "Đang sử dụng",
    brandId: 2,
    brandName: "Dell Inc.",
    supplierId: 2,
    supplierName: "Công ty TNHH Thiết bị Sao Mai",
    locationId: 1,
    locationName: "Tòa nhà A - Tầng 2 (Phòng HCNS)",
    departmentId: 2,
    departmentName: "Phòng Hành chính - Nhân sự",
    purchasePrice: 16800000,
    purchaseDate: "2023-11-20T00:00:00Z",
    effectiveDate: "2023-11-22T00:00:00Z",
    warrantyMonths: 36,
    description: "Máy tính micro gọn nhẹ trang bị Core i5-12500, 16GB RAM cho bộ phận tuyển dụng và nhân sự.",
    createdAt: "2023-11-20T09:00:00Z",
    updatedAt: "2024-02-15T11:00:00Z",
  },
  {
    id: "h1-0003-4444-9999-333333333333",
    assetCode: "HW-LAP-0015",
    name: "Laptop doanh nhân ThinkPad T14",
    model: "ThinkPad T14 Gen 3 (21CF)",
    serialNumber: "PF3G9K12",
    barcode: "893850100155",
    categoryId: 2,
    categoryName: "Máy tính xách tay (Laptop)",
    statusId: 1,
    statusName: "Đang sử dụng",
    brandId: 3,
    brandName: "Lenovo",
    supplierId: 1,
    supplierName: "Công ty Cổ phần Tin học Phong Vũ",
    locationId: 1,
    locationName: "Tòa nhà A - Tầng 4",
    departmentId: 1,
    departmentName: "Phòng Công nghệ & IT",
    purchasePrice: 32000000,
    purchaseDate: "2023-05-10T00:00:00Z",
    effectiveDate: "2023-05-12T00:00:00Z",
    warrantyMonths: 36,
    description: "Cấp phát cho Trưởng nhóm phát triển phần mềm di động, AMD Ryzen 7 PRO 6850U, 32GB RAM.",
    createdAt: "2023-05-10T10:15:00Z",
    updatedAt: "2024-03-01T16:45:00Z",
  },
  {
    id: "h1-0004-4444-9999-444444444444",
    assetCode: "HW-MON-0042",
    name: "Màn hình đồ họa UltraSharp 27 inch 4K",
    model: "Dell UltraSharp U2723QE",
    serialNumber: "CN-0F142D-74445",
    barcode: "893850100421",
    categoryId: 3,
    categoryName: "Màn hình hiển thị (Monitor)",
    statusId: 2,
    statusName: "Sẵn sàng cấp phát",
    brandId: 2,
    brandName: "Dell Inc.",
    supplierId: 3,
    supplierName: "Hanoicomputer (HACOM)",
    locationId: 2,
    locationName: "Kho Tổng IT - Tầng hầm B1",
    departmentId: null,
    departmentName: "Chưa phân bổ",
    purchasePrice: 12500000,
    purchaseDate: "2024-01-05T00:00:00Z",
    effectiveDate: "2024-01-08T00:00:00Z",
    warrantyMonths: 36,
    description: "Màn hình IPS Black 4K USB-C Hub dự phòng cho khối thiết kế UI/UX.",
    createdAt: "2024-01-05T14:00:00Z",
    updatedAt: "2024-01-08T09:30:00Z",
  },
  {
    id: "h1-0005-4444-9999-555555555555",
    assetCode: "HW-SRV-0002",
    name: "Máy chủ lưu trữ & ảo hóa ProLiant",
    model: "HPE ProLiant DL380 Gen10 Plus",
    serialNumber: "SGH219V47K",
    barcode: "893850100029",
    categoryId: 4,
    categoryName: "Máy chủ & Hạ tầng mạng (Server)",
    statusId: 1,
    statusName: "Đang sử dụng",
    brandId: 4,
    brandName: "HP Inc. (HPE)",
    supplierId: 4,
    supplierName: "Tập đoàn Công nghệ CMC",
    locationId: 3,
    locationName: "Phòng Data Center (DC-RACK-03)",
    departmentId: 1,
    departmentName: "Phòng Công nghệ & IT",
    purchasePrice: 145000000,
    purchaseDate: "2022-10-12T00:00:00Z",
    effectiveDate: "2022-10-20T00:00:00Z",
    warrantyMonths: 60,
    description: "Dual Intel Xeon Silver 4314, 128GB ECC RAM, 8x 1.92TB SSD SAS RAID-10 chạy cụm ảo hóa Proxmox.",
    createdAt: "2022-10-12T08:00:00Z",
    updatedAt: "2023-12-20T17:00:00Z",
  },
  {
    id: "h1-0006-4444-9999-666666666666",
    assetCode: "HW-PRN-0005",
    name: "Máy in Laser đa năng đen trắng",
    model: "HP LaserJet Pro MFP M428fdw",
    serialNumber: "VNB3K19248",
    barcode: "893850100055",
    categoryId: 5,
    categoryName: "Máy in & Thiết bị số hóa (Printer)",
    statusId: 3,
    statusName: "Đang bảo trì / Sửa chữa",
    brandId: 4,
    brandName: "HP Inc.",
    supplierId: 2,
    supplierName: "Công ty TNHH Thiết bị Sao Mai",
    locationId: 1,
    locationName: "Tòa nhà A - Tầng 3 (Kế toán)",
    departmentId: 3,
    departmentName: "Phòng Kế toán - Tài chính",
    purchasePrice: 9800000,
    purchaseDate: "2021-04-10T00:00:00Z",
    effectiveDate: "2021-04-12T00:00:00Z",
    warrantyMonths: 24,
    description: "Máy in đa chức năng (In, Scan, Copy, Fax qua WiFi). Đang gửi hãng thay cụm sấy (Fuser).",
    createdAt: "2021-04-10T09:00:00Z",
    updatedAt: "2024-03-12T10:15:00Z",
  },
  {
    id: "h1-0007-4444-9999-777777777777",
    assetCode: "HW-CAM-0012",
    name: "Camera an ninh AI giám sát hành lang",
    model: "Hikvision DS-2CD2143G2-I",
    serialNumber: "D92847192",
    barcode: "893850100128",
    categoryId: 6,
    categoryName: "Thiết bị an ninh & Giám sát (Security)",
    statusId: 1,
    statusName: "Đang sử dụng",
    brandId: 5,
    brandName: "Hikvision",
    supplierId: 3,
    supplierName: "Hanoicomputer (HACOM)",
    locationId: 1,
    locationName: "Hành lang Tầng 2 & 3",
    departmentId: 2,
    departmentName: "Phòng Hành chính - Nhân sự",
    purchasePrice: 2450000,
    purchaseDate: "2023-02-18T00:00:00Z",
    effectiveDate: "2023-02-20T00:00:00Z",
    warrantyMonths: 24,
    description: "Camera IP hồng ngoại 4MP AcuSense nhận diện người & phương tiện kết nối NVR tập trung.",
    createdAt: "2023-02-18T15:30:00Z",
    updatedAt: "2023-06-05T09:00:00Z",
  },
];

export const HardwareAssetsPage: React.FC = () => {
  const [items, setItems] = useState<HardwareAsset[]>(INITIAL_HARDWARE_ASSETS);
  const [keyword, setKeyword] = useState<string>("");
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFilter, setSelectedFilter] = useState<string | number | null>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<HardwareAsset | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Partial<HardwareAsset>>({});

  // Helper định dạng tiền tệ VNĐ
  const formatCurrency = (amount?: number | null) => {
    if (amount === undefined || amount === null) return "Chưa cập nhật";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  // Helper tính thời hạn bảo hành
  const getWarrantyInfo = (purchaseDateStr?: string | null, warrantyMonths?: number | null) => {
    if (!purchaseDateStr || !warrantyMonths) return { text: "Không có BH", isExpired: true, labelColor: "text-gray-400" };
    const pDate = new Date(purchaseDateStr);
    const expDate = new Date(pDate.setMonth(pDate.getMonth() + warrantyMonths));
    const now = new Date();
    const diffMonths = Math.round((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));

    if (expDate < now) {
      return { text: "Đã hết hạn BH", isExpired: true, labelColor: "text-rose-600 dark:text-rose-400 font-semibold" };
    }
    return {
      text: `Còn ${diffMonths} tháng (${expDate.toLocaleDateString("vi-VN")})`,
      isExpired: false,
      labelColor: "text-emerald-600 dark:text-emerald-400 font-medium",
    };
  };

  // Helper màu sắc trạng thái
  const getStatusBadge = (statusName?: string | null) => {
    const s = statusName || "Chưa xác định";
    if (s.includes("Đang sử dụng")) {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60";
    }
    if (s.includes("Sẵn sàng")) {
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/60";
    }
    if (s.includes("bảo trì") || s.includes("Sửa chữa")) {
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60";
    }
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200/60";
  };

  // Cấu hình Cây phân cấp bộ lọc (AimsTreeFilter)
  const treeGroups: TreeFilterGroup[] = useMemo(() => {
    // 1. Nhóm theo trạng thái
    const statusCounts: Record<string, number> = {};
    items.forEach((it) => {
      const s = it.statusName || "Khác";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    // 2. Nhóm theo danh mục
    const catCounts: Record<string, number> = {};
    items.forEach((it) => {
      const c = it.categoryName || "Khác";
      catCounts[c] = (catCounts[c] || 0) + 1;
    });

    // 3. Nhóm theo phòng ban
    const deptCounts: Record<string, number> = {};
    items.forEach((it) => {
      const d = it.departmentName || "Chưa phân bổ";
      deptCounts[d] = (deptCounts[d] || 0) + 1;
    });

    return [
      {
        id: "status_group",
        title: "TRẠNG THÁI HOẠT ĐỘNG",
        items: [
          { id: "all", label: "Tất cả thiết bị phần cứng", count: items.length },
          ...Object.entries(statusCounts).map(([status, count]) => ({
            id: `status_${status}`,
            label: status,
            count,
          })),
        ],
      },
      {
        id: "category_group",
        title: "DANH MỤC PHẦN CỨNG",
        items: Object.entries(catCounts).map(([cat, count]) => ({
          id: `cat_${cat}`,
          label: cat,
          count,
        })),
      },
      {
        id: "department_group",
        title: "PHÒNG BAN SỬ DỤNG",
        items: Object.entries(deptCounts).map(([dept, count]) => ({
          id: `dept_${dept}`,
          label: dept,
          count,
        })),
      },
    ];
  }, [items]);

  // Lọc danh sách theo từ khóa và cây phân cấp
  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      // Tìm kiếm từ khóa
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        const matchCode = it.assetCode.toLowerCase().includes(q);
        const matchName = it.name.toLowerCase().includes(q);
        const matchModel = it.model ? it.model.toLowerCase().includes(q) : false;
        const matchSerial = it.serialNumber ? it.serialNumber.toLowerCase().includes(q) : false;
        const matchBarcode = it.barcode ? it.barcode.toLowerCase().includes(q) : false;
        const matchBrand = it.brandName ? it.brandName.toLowerCase().includes(q) : false;
        const matchDept = it.departmentName ? it.departmentName.toLowerCase().includes(q) : false;
        if (!matchCode && !matchName && !matchModel && !matchSerial && !matchBarcode && !matchBrand && !matchDept) {
          return false;
        }
      }

      // Lọc theo cây phân cấp
      if (selectedFilter && selectedFilter !== "all") {
        const filterStr = String(selectedFilter);
        if (filterStr.startsWith("status_")) {
          const targetStatus = filterStr.replace("status_", "");
          return it.statusName === targetStatus;
        }
        if (filterStr.startsWith("cat_")) {
          const targetCat = filterStr.replace("cat_", "");
          return it.categoryName === targetCat;
        }
        if (filterStr.startsWith("dept_")) {
          const targetDept = filterStr.replace("dept_", "");
          return (it.departmentName || "Chưa phân bổ") === targetDept;
        }
      }

      return true;
    });
  }, [items, keyword, selectedFilter]);

  // Phân trang
  const paginatedItems = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, pageIndex, pageSize]);

  // Thao tác CRUD
  const handleAddNew = () => {
    setEditingItem({
      id: `hw-${Date.now()}`,
      assetCode: `HW-PC-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      model: "",
      serialNumber: "",
      barcode: "",
      categoryName: "Máy trạm để bàn (Workstation)",
      statusName: "Sẵn sàng cấp phát",
      brandName: "Dell Inc.",
      locationName: "Kho Tổng IT",
      departmentName: "Chưa phân bổ",
      purchasePrice: 15000000,
      purchaseDate: new Date().toISOString().split("T")[0],
      effectiveDate: new Date().toISOString().split("T")[0],
      warrantyMonths: 36,
      description: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = (item: HardwareAsset) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!editingItem.assetCode || !editingItem.name) {
      toast.error("Vui lòng nhập đầy đủ Mã tài sản và Tên thiết bị!");
      return;
    }

    setItems((prev) => {
      const exists = prev.some((x) => x.id === editingItem.id);
      if (exists) {
        return prev.map((x) => (x.id === editingItem.id ? ({ ...x, ...editingItem, updatedAt: new Date().toISOString() } as HardwareAsset) : x));
      } else {
        return [{ ...editingItem, updatedAt: new Date().toISOString() } as HardwareAsset, ...prev];
      }
    });

    toast.success(`Đã lưu thông tin thiết bị [${editingItem.assetCode}] thành công!`);
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string, code: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thiết bị phần cứng [${code}]?`)) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast.success(`Đã xóa thiết bị [${code}] thành công`);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} thiết bị phần cứng đã chọn?`)) return;
    setItems((prev) => prev.filter((x) => !selectedIds.has(x.id)));
    setSelectedIds(new Set());
    toast.success("Đã xóa các thiết bị đã chọn thành công!");
  };

  return (
    <>
      <PageMeta
        title="Thiết bị phần cứng | AIMS Enterprise"
        description="Quản lý hồ sơ thiết bị phần cứng, máy tính, laptop, máy chủ, serial tag, bảo hành & kiểm kê kho"
      />

      <AimsBasePageLayout
        moduleName="Quản lý Tài sản IT"
        moduleIcon={
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        moduleTabs={[
          { name: "Thiết bị phần cứng", path: "/thiet-bi-phan-cung", badge: items.length },
          { name: "Giám sát máy trạm", path: "/giam-sat-may-tram" },
          { name: "Tài nguyên số", path: "/tai-nguyen-so" },
        ]}
        title="Thiết bị phần cứng"
        subtitle="Hồ sơ thiết bị phần cứng: Máy tính, Laptop, Máy chủ, Màn hình, Serial, Barcode & Bảo hành"
        totalRecords={filteredItems.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        searchTerm={keyword}
        onSearchChange={(val) => {
          setKeyword(val);
          setPageIndex(1);
        }}
        onAddNew={handleAddNew}
        addNewLabel="Thêm thiết bị"
        onExportExcel={() => toast.success("Đang xuất danh sách thiết bị phần cứng ra file Excel...")}
        selectedCount={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBatchDelete={handleBatchDelete}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        treeGroups={treeGroups}
        selectedTreeFilter={selectedFilter}
        onSelectTreeFilter={setSelectedFilter}
      >
        {(currentViewMode) =>
          currentViewMode === "list" ? (
            /* ==================== 1. LIST VIEW (DATA TABLE) ==================== */
            <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-xs z-10 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 select-none">
                  <tr>
                    <th className="w-10 px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.size > 0 && selectedIds.size === paginatedItems.length}
                        onChange={() => {
                          if (selectedIds.size === paginatedItems.length) setSelectedIds(new Set());
                          else setSelectedIds(new Set(paginatedItems.map((r) => r.id)));
                        }}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                        title="Chọn tất cả"
                      />
                    </th>
                    <th className="px-4 py-3">Mã tài sản & Barcode</th>
                    <th className="px-4 py-3">Tên thiết bị & Model</th>
                    <th className="px-4 py-3">Hãng & Serial Tag</th>
                    <th className="px-4 py-3">Danh mục & Trạng thái</th>
                    <th className="px-4 py-3">Phòng ban & Vị trí</th>
                    <th className="px-4 py-3">Giá vốn & Bảo hành</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-xs sm:text-sm">
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((item) => {
                      const isSelected = selectedIds.has(item.id);
                      const warranty = getWarrantyInfo(item.purchaseDate, item.warrantyMonths);

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedItemForDetail(item)}
                          className={`transition-colors group cursor-pointer ${
                            isSelected
                              ? "bg-indigo-50/80 dark:bg-indigo-950/40 font-medium text-indigo-950 dark:text-indigo-100"
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

                          {/* Mã tài sản & Barcode */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                                {item.assetCode}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-gray-400 mt-1 flex items-center gap-1">
                              <span>|||</span>
                              <span>{item.barcode || "Chưa có barcode"}</span>
                            </div>
                          </td>

                          {/* Tên thiết bị & Model */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <span>{item.name}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              Model: <span className="font-medium text-gray-700 dark:text-gray-300">{item.model || "N/A"}</span>
                            </div>
                          </td>

                          {/* Hãng & Serial Tag */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                              {item.brandName || "N/A"}
                            </div>
                            <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                              S/N: <span className="text-gray-600 dark:text-gray-300 font-semibold">{item.serialNumber || "N/A"}</span>
                            </div>
                          </td>

                          {/* Danh mục & Trạng thái */}
                          <td className="px-4 py-3.5">
                            <div className="text-xs text-gray-800 dark:text-gray-200 font-medium">
                              {item.categoryName || "Khác"}
                            </div>
                            <div className="mt-1">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(item.statusName)}`}>
                                {item.statusName}
                              </span>
                            </div>
                          </td>

                          {/* Phòng ban & Vị trí */}
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[170px]">
                              {item.departmentName || "Chưa phân bổ"}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate max-w-[170px] mt-0.5" title={item.locationName || ""}>
                              📍 {item.locationName || "Chưa xác định"}
                            </div>
                          </td>

                          {/* Giá vốn & Bảo hành */}
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                              {formatCurrency(item.purchasePrice)}
                            </div>
                            <div className={`text-[11px] mt-0.5 ${warranty.labelColor}`}>
                              {warranty.text}
                            </div>
                          </td>

                          {/* Thao tác */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedItemForDetail(item)}
                                className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
                                title="Xem chi tiết thiết bị"
                              >
                                Chi tiết
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                                title="Chỉnh sửa thông tin"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(item.id, item.assetCode)}
                                className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Xóa thiết bị"
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
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-3xl">📦</span>
                          <span className="text-sm font-medium">Không tìm thấy thiết bị phần cứng phù hợp</span>
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
                {paginatedItems.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const warranty = getWarrantyInfo(item.purchaseDate, item.warrantyMonths);

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemForDetail(item)}
                      className={`p-4 rounded-xl border bg-white dark:bg-gray-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-gray-200 dark:border-gray-700/80"
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {item.assetCode}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(item.statusName)}`}>
                            {item.statusName}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-gray-900 dark:text-white mt-3 text-sm line-clamp-1" title={item.name}>
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.brandName} • {item.model || "N/A"}
                        </p>

                        {/* Details */}
                        <div className="space-y-1.5 mt-3 text-xs">
                          <div className="flex justify-between text-gray-500">
                            <span>Serial Tag:</span>
                            <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">{item.serialNumber || "N/A"}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Phòng ban:</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]">{item.departmentName || "Chưa phân bổ"}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Giá vốn:</span>
                            <span className="font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(item.purchasePrice)}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Bảo hành:</span>
                            <span className={warranty.labelColor}>{warranty.text}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">📍 {item.locationName || "Chưa có vị trí"}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForDetail(item);
                          }}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                        >
                          Chi tiết &rarr;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        }
      </AimsBasePageLayout>

      {/* ==================== 3. MODAL CHI TIẾT THIẾT BỊ PHẦN CỨNG ==================== */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-xl">
                  🖥️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{selectedItemForDetail.name}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {selectedItemForDetail.assetCode}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Model: {selectedItemForDetail.model || "N/A"} | S/N: {selectedItemForDetail.serialNumber || "N/A"}
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
                <span className="text-gray-400 block">Danh mục thiết bị</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.categoryName}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Trạng thái vận hành</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedItemForDetail.statusName}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Hãng sản xuất (Brand)</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.brandName}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Mã vạch / QR Barcode</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.barcode || "Chưa dán barcode"}</span>
              </div>
            </div>

            {/* Tài chính & Bảo hành */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
              <div>
                <span className="text-gray-400 block">Giá vốn thiết bị</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(selectedItemForDetail.purchasePrice)}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Ngày mua / Ngày hiệu lực</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedItemForDetail.purchaseDate ? new Date(selectedItemForDetail.purchaseDate).toLocaleDateString("vi-VN") : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">Thời gian bảo hành</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {selectedItemForDetail.warrantyMonths ? `${selectedItemForDetail.warrantyMonths} tháng` : "Không có"}
                </span>
              </div>
            </div>

            {/* Phân bổ & Vị trí */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl">
              <div>
                <span className="text-gray-400 block">Phòng ban sử dụng</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.departmentName || "Chưa phân bổ"}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Địa điểm đặt thiết bị</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.locationName || "Chưa xác định"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block">Nhà cung cấp</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedItemForDetail.supplierName || "Chưa cập nhật"}</span>
              </div>
              {selectedItemForDetail.description && (
                <div className="col-span-2">
                  <span className="text-gray-400 block">Ghi chú / Cấu hình bổ sung</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5">{selectedItemForDetail.description}</p>
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
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
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

      {/* ==================== 4. MODAL THÊM / SỬA THIẾT BỊ PHẦN CỨNG ==================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🖥️</span>
              <span>{editingItem.id ? "Cập nhật thiết bị phần cứng" : "Thêm mới thiết bị phần cứng"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Mã tài sản quản lý nội bộ *
                </label>
                <input
                  type="text"
                  value={editingItem.assetCode || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, assetCode: e.target.value })}
                  placeholder="VD: HW-PC-012"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Tên thiết bị *
                </label>
                <input
                  type="text"
                  value={editingItem.name || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="VD: Máy trạm thiết kế đồ họa"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Mã Model
                </label>
                <input
                  type="text"
                  value={editingItem.model || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, model: e.target.value })}
                  placeholder="VD: OptiPlex 7000 Micro"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Số Serial / Service Tag
                </label>
                <input
                  type="text"
                  value={editingItem.serialNumber || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, serialNumber: e.target.value })}
                  placeholder="VD: 9FC4KL3"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Mã vạch / QR Code quản lý kho
                </label>
                <input
                  type="text"
                  value={editingItem.barcode || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, barcode: e.target.value })}
                  placeholder="VD: 893850100880"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Danh mục tài sản
                </label>
                <select
                  value={editingItem.categoryName || "Máy trạm để bàn (Workstation)"}
                  onChange={(e) => setEditingItem({ ...editingItem, categoryName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option>Máy trạm để bàn (Workstation)</option>
                  <option>Máy tính xách tay (Laptop)</option>
                  <option>Màn hình hiển thị (Monitor)</option>
                  <option>Máy chủ & Hạ tầng mạng (Server)</option>
                  <option>Máy in & Thiết bị số hóa (Printer)</option>
                  <option>Thiết bị an ninh & Giám sát (Security)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Trạng thái vận hành
                </label>
                <select
                  value={editingItem.statusName || "Đang sử dụng"}
                  onChange={(e) => setEditingItem({ ...editingItem, statusName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <option>Đang sử dụng</option>
                  <option>Sẵn sàng cấp phát</option>
                  <option>Đang bảo trì / Sửa chữa</option>
                  <option>Đã thanh lý</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Hãng sản xuất (Brand)
                </label>
                <input
                  type="text"
                  value={editingItem.brandName || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, brandName: e.target.value })}
                  placeholder="VD: Dell Inc., HP, ASUS"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Giá vốn (VND)
                </label>
                <input
                  type="number"
                  value={editingItem.purchasePrice || 0}
                  onChange={(e) => setEditingItem({ ...editingItem, purchasePrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Thời gian bảo hành (tháng)
                </label>
                <input
                  type="number"
                  value={editingItem.warrantyMonths || 36}
                  onChange={(e) => setEditingItem({ ...editingItem, warrantyMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Phòng ban sử dụng
                </label>
                <input
                  type="text"
                  value={editingItem.departmentName || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, departmentName: e.target.value })}
                  placeholder="VD: Phòng Công nghệ & IT"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Vị trí / Chi nhánh
                </label>
                <input
                  type="text"
                  value={editingItem.locationName || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, locationName: e.target.value })}
                  placeholder="VD: Tòa nhà A - Tầng 4"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Mô tả / Ghi chú cấu hình
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Chi tiết cấu hình, thông số hoặc lưu ý kiểm kê..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t dark:border-gray-800">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HardwareAssetsPage;
