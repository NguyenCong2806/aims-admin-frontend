import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";

import PageMeta from "../../components/common/PageMeta";
import AimsModuleNav from "../../components/aims/AimsModuleNav";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";

import {
  HardwareAsset,
  HardwareTechnicalSpecs,
  CustomAttributeItem,
} from "../../models/Hardware/hardwareAsset";
import {
  getHardwareAssetById,
  upsertHardwareAsset,
} from "./hardwareAssetStore";

// Danh sách 6 loại thiết bị phần cứng phổ biến nhất
const HARDWARE_DEVICE_TYPES = [
  {
    id: "pc",
    categoryName: "Máy trạm để bàn (Workstation)",
    label: "Máy trạm / PC",
    sublabel: "Workstation & Desktop",
    prefix: "HW-PC",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/60",
  },
  {
    id: "laptop",
    categoryName: "Máy tính xách tay (Laptop)",
    label: "Laptop xách tay",
    sublabel: "ThinkPad, Dell, MacBook",
    prefix: "HW-LAP",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900/60",
  },
  {
    id: "server",
    categoryName: "Máy chủ & Hạ tầng mạng (Server)",
    label: "Máy chủ (Server)",
    sublabel: "HPE, Dell PowerEdge, Rack",
    prefix: "HW-SRV",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/60",
  },
  {
    id: "monitor",
    categoryName: "Màn hình hiển thị (Monitor)",
    label: "Màn hình hiển thị",
    sublabel: "UltraSharp, 4K, 2K IPS",
    prefix: "HW-MON",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/60",
  },
  {
    id: "printer",
    categoryName: "Máy in & Thiết bị số hóa (Printer)",
    label: "Máy in & Scan",
    sublabel: "Laser đa chức năng",
    prefix: "HW-PRN",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    ),
    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/60",
  },
  {
    id: "network",
    categoryName: "Thiết bị mạng & An ninh",
    label: "Thiết bị mạng / An ninh",
    sublabel: "Switch, Router, Camera AI",
    prefix: "HW-NET",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-900/60",
  },
];

const ALL_CATEGORY_OPTIONS = [
  "Máy trạm để bàn (Workstation)",
  "Máy tính xách tay (Laptop)",
  "Máy chủ & Hạ tầng mạng (Server)",
  "Màn hình hiển thị (Monitor)",
  "Máy in & Thiết bị số hóa (Printer)",
  "Thiết bị an ninh & Giám sát (Security)",
  "Thiết bị mạng (Router / Switch / AP)",
  "Lưu điện UPS & Nguồn phụ trợ",
  "Thiết bị hội nghị & Âm thanh",
  "Khác",
];

const BRAND_OPTIONS = [
  "Dell Inc.",
  "HP Inc. (HPE)",
  "ASUS",
  "Lenovo",
  "Apple Inc.",
  "Cisco Systems",
  "Hikvision",
  "TP-Link",
  "Brother",
  "Canon",
  "Epson",
  "Khác",
];

const STATUS_OPTIONS = [
  "Đang sử dụng",
  "Sẵn sàng cấp phát",
  "Đang bảo trì / Sửa chữa",
  "Đã thanh lý",
  "Dự phòng kho IT",
];

const DEPARTMENT_OPTIONS = [
  "Phòng Công nghệ & IT",
  "Phòng Hành chính - Nhân sự",
  "Phòng Kế toán - Tài chính",
  "Khối Kinh doanh & Marketing",
  "Ban Giám đốc",
  "Chưa phân bổ",
];

const LOCATION_OPTIONS = [
  "Tòa nhà A - Tầng 4 (Phòng Dev)",
  "Tòa nhà A - Tầng 2 (Phòng HCNS)",
  "Tòa nhà A - Tầng 3 (Kế toán)",
  "Kho Tổng IT - Tầng hầm B1",
  "Phòng Data Center (DC-RACK-03)",
  "Chi nhánh TP. Hồ Chí Minh",
];

const SUPPLIER_OPTIONS = [
  "Công ty Cổ phần Tin học Phong Vũ",
  "Công ty TNHH Thiết bị Sao Mai",
  "Hanoicomputer (HACOM)",
  "Tập đoàn Công nghệ CMC",
  "FPT Information System",
  "Khác",
];

export const CreateHardwareAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  // State biểu mẫu
  const [assetCode, setAssetCode] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("Máy trạm để bàn (Workstation)");
  const [statusName, setStatusName] = useState<string>("Sẵn sàng cấp phát");
  const [brandName, setBrandName] = useState<string>("Dell Inc.");
  const [supplierName, setSupplierName] = useState<string>("Công ty Cổ phần Tin học Phong Vũ");
  const [locationName, setLocationName] = useState<string>("Kho Tổng IT - Tầng hầm B1");
  const [departmentName, setDepartmentName] = useState<string>("Chưa phân bổ");
  const [assignedToUser, setAssignedToUser] = useState<string>("");

  const [purchasePrice, setPurchasePrice] = useState<number>(15000000);
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(new Date());
  const [warrantyMonths, setWarrantyMonths] = useState<number>(36);
  const [description, setDescription] = useState<string>("");

  // Cấu hình kỹ thuật chuyên sâu (Specs)
  const [specs, setSpecs] = useState<HardwareTechnicalSpecs>({
    cpu: "Intel Core i7-13700",
    ram: "32GB DDR5",
    storage: "1TB NVMe SSD",
    gpu: "NVIDIA RTX 4060 8GB",
    os: "Windows 11 Pro 64-bit",
  });

  // Thuộc tính mở rộng không giới hạn (Custom Key-Value Attributes)
  const [customAttributes, setCustomAttributes] = useState<CustomAttributeItem[]>([]);
  const [newAttrName, setNewAttrName] = useState<string>("");
  const [newAttrValue, setNewAttrValue] = useState<string>("");

  // Load chi tiết nếu ở chế độ Chỉnh sửa
  useEffect(() => {
    if (isEdit && id) {
      const existing = getHardwareAssetById(id);
      if (existing) {
        setAssetCode(existing.assetCode || "");
        setName(existing.name || "");
        setModel(existing.model || "");
        setSerialNumber(existing.serialNumber || "");
        setBarcode(existing.barcode || "");
        setCategoryName(existing.categoryName || "Máy trạm để bàn (Workstation)");
        setStatusName(existing.statusName || "Sẵn sàng cấp phát");
        setBrandName(existing.brandName || "Dell Inc.");
        setSupplierName(existing.supplierName || "Công ty Cổ phần Tin học Phong Vũ");
        setLocationName(existing.locationName || "Kho Tổng IT - Tầng hầm B1");
        setDepartmentName(existing.departmentName || "Chưa phân bổ");
        setAssignedToUser(existing.assignedToUser || "");
        setPurchasePrice(existing.purchasePrice ?? 0);
        setPurchaseDate(existing.purchaseDate ? new Date(existing.purchaseDate) : new Date());
        setEffectiveDate(existing.effectiveDate ? new Date(existing.effectiveDate) : new Date());
        setWarrantyMonths(existing.warrantyMonths ?? 36);
        setDescription(existing.description || "");
        if (existing.specs) setSpecs(existing.specs);
        if (existing.customAttributes) setCustomAttributes(existing.customAttributes);
      } else {
        toast.error("Không tìm thấy thông tin thiết bị");
        navigate("/thiet-bi-phan-cung");
      }
    } else {
      // Khởi tạo mã tự động khi vào trang tạo mới
      const rand = Math.floor(100 + Math.random() * 900);
      setAssetCode(`HW-PC-2026-${rand}`);
      setBarcode(`893850100${rand}`);
    }
  }, [id, isEdit, navigate]);

  // Phím tắt Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Tự động tạo mã tài sản theo danh mục được chọn
  const handleAutoGenerateCode = (cat: string) => {
    const matched = HARDWARE_DEVICE_TYPES.find((d) => d.categoryName === cat);
    const prefix = matched ? matched.prefix : "HW-GEN";
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    const newCode = `${prefix}-${year}-${rand}`;
    setAssetCode(newCode);
    setBarcode(`893850100${rand}`);
    toast.success(`Đã tự động tạo mã: ${newCode}`);
  };

  // Chọn loại thiết bị nhanh từ 6 thẻ
  const handleSelectCategoryType = (typeItem: typeof HARDWARE_DEVICE_TYPES[0]) => {
    setCategoryName(typeItem.categoryName);
    handleAutoGenerateCode(typeItem.categoryName);

    // Gợi ý cấu hình mặc định tương ứng với loại
    if (typeItem.id === "pc" || typeItem.id === "laptop") {
      setSpecs({
        cpu: "Intel Core i7-13700",
        ram: "32GB DDR5",
        storage: "1TB NVMe SSD",
        gpu: "NVIDIA RTX 4060 8GB",
        os: "Windows 11 Pro 64-bit",
        screenSize: typeItem.id === "laptop" ? "14 inch FHD IPS" : undefined,
      });
    } else if (typeItem.id === "server") {
      setSpecs({
        cpu: "Dual Intel Xeon Silver 4314 (32 Cores)",
        ram: "128GB ECC Registered DDR4",
        storage: "8x 1.92TB SAS SSD (RAID-10)",
        rackLocation: "Rack R03 - U10-U12",
        powerSupply: "Dual 800W Redundant Platinum",
      });
    } else if (typeItem.id === "monitor") {
      setSpecs({
        screenSize: "27 inch",
        resolution: "4K UHD (3840 x 2160)",
        refreshRate: "60Hz IPS Black",
      });
    } else if (typeItem.id === "printer") {
      setSpecs({
        printTechnology: "Laser đơn sắc đa năng",
        paperSizes: "A4, A5, Letter",
        duplex: true,
      });
    } else if (typeItem.id === "network") {
      setSpecs({
        portCount: "24 Port Gigabit PoE+ & 4 Port 10G SFP+",
        networkSpeed: "Layer 3 Managed Gigabit Switch",
      });
    }
  };

  // Thêm thuộc tính mở rộng tùy chỉnh
  const handleAddCustomAttribute = () => {
    if (!newAttrName.trim()) {
      toast.warning("Vui lòng nhập tên thuộc tính");
      return;
    }
    const item: CustomAttributeItem = {
      id: `attr-${Date.now()}`,
      name: newAttrName.trim(),
      value: newAttrValue.trim() || "Chưa có giá trị",
    };
    setCustomAttributes([...customAttributes, item]);
    setNewAttrName("");
    setNewAttrValue("");
    toast.success(`Đã thêm thuộc tính: ${item.name}`);
  };

  // Xóa thuộc tính mở rộng
  const handleRemoveCustomAttribute = (attrId: string) => {
    setCustomAttributes(customAttributes.filter((a) => a.id !== attrId));
  };

  // Pre-flight checklist kiểm tra dữ liệu bắt buộc
  const checklist = useMemo(() => {
    const items = [
      { label: "Mã tài sản", valid: !!assetCode.trim() },
      { label: "Tên thiết bị", valid: !!name.trim() },
      { label: "Thương hiệu", valid: !!brandName.trim() },
      { label: "Serial/Service Tag", valid: !!serialNumber.trim() },
      { label: "Danh mục", valid: !!categoryName.trim() },
      { label: "Trạng thái", valid: !!statusName.trim() },
      { label: "Giá vốn", valid: purchasePrice > 0 },
      { label: "Thời hạn bảo hành", valid: warrantyMonths > 0 },
    ];
    const completed = items.filter((i) => i.valid).length;
    const percent = Math.round((completed / items.length) * 100);
    return { items, completed, total: items.length, percent };
  }, [assetCode, name, brandName, serialNumber, categoryName, statusName, purchasePrice, warrantyMonths]);

  // Lưu thông tin
  const handleSave = useCallback(() => {
    if (!assetCode.trim()) {
      toast.error("Vui lòng nhập mã tài sản");
      return;
    }
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên thiết bị");
      return;
    }

    const payload: Partial<HardwareAsset> = {
      id: isEdit ? id : undefined,
      assetCode: assetCode.trim(),
      name: name.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim(),
      barcode: barcode.trim(),
      categoryName,
      statusName,
      brandName,
      supplierName,
      locationName,
      departmentName,
      assignedToUser: assignedToUser.trim() || null,
      purchasePrice,
      purchaseDate: purchaseDate ? purchaseDate.toISOString() : new Date().toISOString(),
      effectiveDate: effectiveDate ? effectiveDate.toISOString() : new Date().toISOString(),
      warrantyMonths,
      description: description.trim(),
      specs,
      customAttributes,
    };

    upsertHardwareAsset(payload);
    toast.success(isEdit ? "Cập nhật thiết bị thành công" : "Tạo mới thiết bị phần cứng thành công");
    navigate("/thiet-bi-phan-cung");
  }, [
    isEdit,
    id,
    assetCode,
    name,
    model,
    serialNumber,
    barcode,
    categoryName,
    statusName,
    brandName,
    supplierName,
    locationName,
    departmentName,
    assignedToUser,
    purchasePrice,
    purchaseDate,
    effectiveDate,
    warrantyMonths,
    description,
    specs,
    customAttributes,
    navigate,
  ]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <>
      <PageMeta
        title={isEdit ? "Cập nhật thiết bị phần cứng | AIMS" : "Thêm mới thiết bị phần cứng | AIMS"}
        description="Quản lý chi tiết cấu hình phần cứng, serial number, barcode, phòng ban và thuộc tính mở rộng không giới hạn"
      />

      {/* Aims Module Navigation */}
      <AimsModuleNav
        moduleName="Thiết bị phần cứng"
        moduleIcon={
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        tabs={[
          { name: "Tất cả thiết bị", path: "/thiet-bi-phan-cung" },
          { name: isEdit ? "Chỉnh sửa" : "Thêm mới thiết bị", path: isEdit ? `/thiet-bi-phan-cung/${id}/chinh-sua` : "/thiet-bi-phan-cung/tao-moi" },
          { name: "Giám sát máy trạm", path: "/giam-sat-may-tram" },
          { name: "Tài nguyên số", path: "/tai-nguyen-so" },
        ]}
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* HERO HEADER BAR */}
        <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 shadow-xs backdrop-blur-sm p-5 sm:p-6 transition-all">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              Trang chủ
            </Link>
            <span>/</span>
            <Link to="/thiet-bi-phan-cung" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
              Thiết bị phần cứng
            </Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {isEdit ? "Cập nhật thiết bị" : "Tạo mới thiết bị"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => navigate("/thiet-bi-phan-cung")}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition shadow-2xs hover:scale-105 active:scale-95"
                title="Quay lại danh sách"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {isEdit ? `Cập nhật: ${name || assetCode}` : "Thêm mới thiết bị phần cứng"}
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {isEdit ? `Mã: ${assetCode}` : "Form 2 Cột Linh Hoạt"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Định cấu hình phần cứng chi tiết, thuộc tính mở rộng không giới hạn và đồng bộ tài sản IT toàn doanh nghiệp.
                </p>
              </div>
            </div>

            {/* Top Action buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleAutoGenerateCode(categoryName);
                  toast.info("Đã làm mới thông tin");
                }}
                className="text-xs font-medium"
              >
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới mã
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate("/thiet-bi-phan-cung")}
                className="text-xs font-medium"
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                className="text-xs font-semibold shadow-xs"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {isEdit ? "Lưu cập nhật" : "Lưu thiết bị phần cứng"}
                <kbd className="hidden lg:inline-block ml-2 px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono">Ctrl+S</kbd>
              </Button>
            </div>
          </div>
        </div>

        {/* 1. CHỌN LOẠI THIẾT BỊ PHẦN CỨNG (HERO SELECTOR) */}
        <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                Chọn loại thiết bị phần cứng
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Mỗi loại thiết bị sẽ tự động tải các trường thông số kỹ thuật chuyên biệt tương ứng.
              </p>
            </div>

            {/* Dropdown danh mục đầy đủ */}
            <div className="w-full sm:w-72">
              <Select
                options={ALL_CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
                value={categoryName}
                onChange={(val) => {
                  setCategoryName(val);
                  handleAutoGenerateCode(val);
                }}
                className="dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-xs h-9"
              />
            </div>
          </div>

          {/* 6 Thẻ chọn nhanh */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {HARDWARE_DEVICE_TYPES.map((type) => {
              const isSelected = categoryName === type.categoryName;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => handleSelectCategoryType(type)}
                  className={`relative text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between group ${
                    isSelected
                      ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs"
                      : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${type.color}`}>
                    {type.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-bold truncate ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`}>
                      {type.label}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {type.sublabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI (7 COLS): THÔNG TIN ĐỊNH DANH, CẤU HÌNH THÍCH ỨNG & THUỘC TÍNH MỞ RỘNG */}
          <div className="xl:col-span-7 space-y-6">
            {/* CARD: THÔNG TIN ĐỊNH DANH & KHO */}
            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
                  Định danh thiết bị & Quản lý kho
                </h3>
                <span className="text-[11px] text-gray-400 font-medium">
                  <span className="text-red-500">*</span> Bắt buộc
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mã tài sản */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Mã tài sản quản lý *
                    </Label>
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateCode(categoryName)}
                      className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      ⚡ Tạo mã nhanh
                    </button>
                  </div>
                  <Input
                    type="text"
                    value={assetCode}
                    onChange={(e) => setAssetCode(e.target.value)}
                    placeholder="VD: HW-PC-0088"
                    className="font-mono text-sm font-bold"
                  />
                </div>

                {/* Tên thiết bị */}
                <div>
                  <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Tên thiết bị *
                  </Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Máy vi tính văn phòng nhân sự"
                  />
                </div>

                {/* Model */}
                <div>
                  <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Mã Model máy
                  </Label>
                  <Input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="VD: OptiPlex 7000 Micro Form"
                  />
                </div>

                {/* Hãng sản xuất */}
                <div>
                  <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Hãng sản xuất (Brand)
                  </Label>
                  <Select
                    options={BRAND_OPTIONS.map((b) => ({ value: b, label: b }))}
                    value={brandName}
                    onChange={setBrandName}
                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Số Serial / Service Tag *
                  </Label>
                  <Input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="VD: 9FC4KL3 hoặc SGH219V47K"
                    className="font-mono"
                  />
                </div>

                {/* Mã vạch / QR Code */}
                <div>
                  <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Mã vạch / QR Code quản lý kho
                  </Label>
                  <Input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="VD: 893850100880"
                    className="font-mono"
                  />
                </div>

                {/* Trạng thái vận hành */}
                <div className="col-span-1 md:col-span-2">
                  <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Trạng thái vận hành
                  </Label>
                  <Select
                    options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
                    value={statusName}
                    onChange={setStatusName}
                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* CARD: CẤU HÌNH KỸ THUẬT THÍCH ỨNG THEO DANH MỤC */}
            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center text-xs font-bold">⚙️</span>
                    Cấu hình kỹ thuật chuyên sâu ({categoryName})
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Thông số tự động thích ứng theo chuẩn thiết bị đã chọn
                  </p>
                </div>
              </div>

              {/* Form specs cho Máy trạm / Laptop */}
              {(categoryName.includes("Workstation") || categoryName.includes("Laptop") || categoryName.includes("Máy tính")) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Vi xử lý (CPU)
                    </Label>
                    <Input
                      type="text"
                      value={specs.cpu || ""}
                      onChange={(e) => setSpecs({ ...specs, cpu: e.target.value })}
                      placeholder="VD: Intel Core i7-13700 / AMD Ryzen 7"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Bộ nhớ trong (RAM)
                    </Label>
                    <Input
                      type="text"
                      value={specs.ram || ""}
                      onChange={(e) => setSpecs({ ...specs, ram: e.target.value })}
                      placeholder="VD: 32GB DDR5 5600MHz"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Ổ cứng lưu trữ (Storage)
                    </Label>
                    <Input
                      type="text"
                      value={specs.storage || ""}
                      onChange={(e) => setSpecs({ ...specs, storage: e.target.value })}
                      placeholder="VD: 1TB NVMe PCIe 4.0 SSD"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Card đồ họa (GPU)
                    </Label>
                    <Input
                      type="text"
                      value={specs.gpu || ""}
                      onChange={(e) => setSpecs({ ...specs, gpu: e.target.value })}
                      placeholder="VD: NVIDIA RTX 4060 8GB / Intel Iris Xe"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Hệ điều hành bản quyền (OS)
                    </Label>
                    <Input
                      type="text"
                      value={specs.os || ""}
                      onChange={(e) => setSpecs({ ...specs, os: e.target.value })}
                      placeholder="VD: Windows 11 Pro 64-bit License OEM"
                    />
                  </div>
                </div>
              )}

              {/* Form specs cho Máy chủ (Server) */}
              {categoryName.includes("Server") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Bộ vi xử lý (Server CPU)
                    </Label>
                    <Input
                      type="text"
                      value={specs.cpu || ""}
                      onChange={(e) => setSpecs({ ...specs, cpu: e.target.value })}
                      placeholder="VD: Dual Intel Xeon Silver 4314 (32 Threads)"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Bộ nhớ RAM ECC
                    </Label>
                    <Input
                      type="text"
                      value={specs.ram || ""}
                      onChange={(e) => setSpecs({ ...specs, ram: e.target.value })}
                      placeholder="VD: 128GB ECC Registered DDR4"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Ổ cứng SAS / RAID
                    </Label>
                    <Input
                      type="text"
                      value={specs.storage || ""}
                      onChange={(e) => setSpecs({ ...specs, storage: e.target.value })}
                      placeholder="VD: 8x 1.92TB SSD SAS RAID-10"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Vị trí tủ Rack (U)
                    </Label>
                    <Input
                      type="text"
                      value={specs.rackLocation || ""}
                      onChange={(e) => setSpecs({ ...specs, rackLocation: e.target.value })}
                      placeholder="VD: Rack R03 - U10-U12 (Tầng 2 DC)"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Nguồn điện & Quản trị từ xa (iLO / iDRAC)
                    </Label>
                    <Input
                      type="text"
                      value={specs.powerSupply || ""}
                      onChange={(e) => setSpecs({ ...specs, powerSupply: e.target.value })}
                      placeholder="VD: Dual 800W Redundant Platinum / iDRAC9 Enterprise"
                    />
                  </div>
                </div>
              )}

              {/* Form specs cho Màn hình (Monitor) */}
              {categoryName.includes("Monitor") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Kích thước đường chéo
                    </Label>
                    <Input
                      type="text"
                      value={specs.screenSize || ""}
                      onChange={(e) => setSpecs({ ...specs, screenSize: e.target.value })}
                      placeholder="VD: 27 inch, 32 inch, 24 inch"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Độ phân giải & Tấm nền
                    </Label>
                    <Input
                      type="text"
                      value={specs.resolution || ""}
                      onChange={(e) => setSpecs({ ...specs, resolution: e.target.value })}
                      placeholder="VD: 4K UHD (3840 x 2160) IPS Black"
                    />
                  </div>
                </div>
              )}

              {/* Form specs cho Máy in (Printer) */}
              {categoryName.includes("Printer") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Công nghệ in
                    </Label>
                    <Input
                      type="text"
                      value={specs.printTechnology || ""}
                      onChange={(e) => setSpecs({ ...specs, printTechnology: e.target.value })}
                      placeholder="VD: Laser đa chức năng (In, Scan, Copy)"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                      Khổ giấy & Tính năng
                    </Label>
                    <Input
                      type="text"
                      value={specs.paperSizes || ""}
                      onChange={(e) => setSpecs({ ...specs, paperSizes: e.target.value })}
                      placeholder="VD: A4, A3, In 2 mặt tự động (Duplex), WiFi"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CARD: THUỘC TÍNH MỞ RỘNG TÙY CHỈNH KHÔNG GIỚI HẠN */}
            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">✨</span>
                    Thuộc tính mở rộng linh hoạt (Custom Attributes)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Thêm bất kỳ thông số hoặc thuộc tính đặc thù nào mà không bị gò bó bởi cấu trúc cố định
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {customAttributes.length} thuộc tính
                </span>
              </div>

              {/* Danh sách thuộc tính đã thêm */}
              {customAttributes.length > 0 ? (
                <div className="space-y-2">
                  {customAttributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-xs gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-700 dark:text-gray-300 block truncate">
                          {attr.name}
                        </span>
                        <span className="text-gray-900 dark:text-white font-mono truncate block mt-0.5">
                          {attr.value}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomAttribute(attr.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 p-1.5 rounded-lg transition"
                        title="Xóa thuộc tính"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Chưa có thuộc tính mở rộng nào. Bạn có thể thêm địa chỉ MAC, IP tĩnh, phụ kiện đi kèm...
                </p>
              )}

              {/* Thanh nhập thêm thuộc tính mới */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  placeholder="Tên thuộc tính (VD: Địa chỉ MAC, Phụ kiện sạc, IP Tĩnh...)"
                  className="flex-1 px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <input
                  type="text"
                  value={newAttrValue}
                  onChange={(e) => setNewAttrValue(e.target.value)}
                  placeholder="Giá trị tương ứng (VD: 00:1A:2B:3C:4D:5E)"
                  className="flex-1 px-3 py-2 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAttribute}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 transition"
                >
                  + Thêm mục
                </button>
              </div>
            </div>

            {/* CARD: PHÂN BỔ, VỊ TRÍ & TÀI CHÍNH */}
            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
                Phân bổ sử dụng & Vị trí vật lý
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Phòng ban sử dụng
                  </Label>
                  <Select
                    options={DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: d }))}
                    value={departmentName}
                    onChange={setDepartmentName}
                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>

                <div>
                  <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Người sử dụng / Phụ trách
                  </Label>
                  <Input
                    type="text"
                    value={assignedToUser}
                    onChange={(e) => setAssignedToUser(e.target.value)}
                    placeholder="VD: Nguyễn Văn A (Dev Lead)"
                  />
                </div>

                <div>
                  <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Vị trí / Chi nhánh kho
                  </Label>
                  <Select
                    options={LOCATION_OPTIONS.map((l) => ({ value: l, label: l }))}
                    value={locationName}
                    onChange={setLocationName}
                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>

              {/* Tài chính & Bảo hành */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Giá vốn mua vào (VNĐ)
                  </Label>
                  <Input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Bảo hành (tháng)
                    </Label>
                    <div className="flex gap-1">
                      {[12, 24, 36, 60].map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setWarrantyMonths(m)}
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${warrantyMonths === m ? "bg-indigo-600 text-white border-indigo-600" : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"}`}
                        >
                          {m}T
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    type="number"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                    Nhà cung cấp
                  </Label>
                  <Select
                    options={SUPPLIER_OPTIONS.map((s) => ({ value: s, label: s }))}
                    value={supplierName}
                    onChange={setSupplierName}
                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div className="pt-2">
                <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Mô tả / Ghi chú bàn giao
                </Label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi chú tình trạng thiết bị, lịch sử sửa chữa, các lưu ý khi kiểm kê kho định kỳ..."
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-sm resize-none dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (5 COLS): LIVE ASSET CARD & PRE-FLIGHT CHECKLIST */}
          <div className="xl:col-span-5 space-y-6 sticky top-6">
            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">🖥️</span>
                  Thẻ xem trước trực quan
                </h3>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Live Preview
                </span>
              </div>

              {/* Mock Asset Card */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/80 dark:to-gray-900 p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      HW
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                        {name || "Chưa nhập tên thiết bị"}
                      </h4>
                      <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {assetCode || "MÃ-CHƯA-CÓ"} • {model || "Model N/A"}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {statusName}
                  </span>
                </div>

                {/* Serial & Barcode Mock */}
                <div className="p-2.5 rounded-lg bg-gray-100/70 dark:bg-gray-800/60 border border-dashed border-gray-300 dark:border-gray-700 font-mono text-xs flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Serial Tag</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{serialNumber || "—"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block uppercase">Barcode</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{barcode || "—"}</span>
                  </div>
                </div>

                {/* Metadata tags */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Thương hiệu</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {brandName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Danh mục</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {categoryName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Phòng ban</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {departmentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Vị trí</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {locationName}
                    </span>
                  </div>
                </div>

                {/* Tóm tắt Specs */}
                {specs && (specs.cpu || specs.ram || specs.screenSize) && (
                  <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 block">
                      Thông số chính:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300">
                      {[specs.cpu, specs.ram, specs.storage, specs.screenSize].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                )}

                {/* Tài chính & BH */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Giá vốn</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(purchasePrice)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Bảo hành</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {warrantyMonths} Tháng
                    </span>
                  </div>
                </div>
              </div>

              {/* PRE-FLIGHT VALIDATION CHECKLIST */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Kiểm tra dữ liệu bắt buộc
                  </span>
                  <span className={`font-bold ${checklist.percent === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                    {checklist.completed}/{checklist.total} ({checklist.percent}%)
                  </span>
                </div>

                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      checklist.percent === 100 ? "bg-emerald-500" : "bg-indigo-600"
                    }`}
                    style={{ width: `${checklist.percent}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {checklist.items.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition ${
                        item.valid
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                          : "bg-gray-50 dark:bg-gray-800/60 text-gray-400"
                      }`}
                    >
                      <span>{item.valid ? "✓" : "○"}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-2">
                <Button
                  type="button"
                  size="md"
                  onClick={handleSave}
                  className="w-full justify-center text-sm font-semibold shadow-xs"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {isEdit ? "Lưu cập nhật thiết bị" : "Lưu thiết bị phần cứng"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateHardwareAssetPage;
