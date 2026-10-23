import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";

import PageMeta from "../../../components/common/PageMeta";
import AimsModuleNav from "../../../components/aims/AimsModuleNav";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select, { SelectOption } from "../../../components/form/Select";

import {
  HardwareAsset,
  HardwareTechnicalSpecs,
  CustomAttributeItem,
} from "../models/hardwareAsset";
import {
  getHardwareAssetById,
  upsertHardwareAsset,
} from "./hardwareAssetStore";
import {
  ALL_CATEGORY_OPTIONS,
  BRAND_OPTIONS,
  STATUS_OPTIONS,
  DEPARTMENT_OPTIONS,
  LOCATION_OPTIONS,
  SUPPLIER_OPTIONS,
} from "../../../common/ObjectOptions";
import {
  HARDWARE_DEVICE_TYPES,
  HardwareDeviceType,
} from "../../../common/HardwareDivecetype";
import {
  useAssetCategorySelectList,
  useAssetStatusSelectList,
  useBrandSelectList,
  useDepartmentSelectList,
  useLocationSelectList,
  useSupplierSelectList,
} from "../../Lookups/queries";

export const CreateHardwareAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  // Lấy dữ liệu danh mục động từ Lookups Select-List API
  const { data: categorySelectList } = useAssetCategorySelectList();
  const { data: brandSelectList } = useBrandSelectList();
  const { data: statusSelectList } = useAssetStatusSelectList();
  const { data: departmentSelectList } = useDepartmentSelectList();
  const { data: locationSelectList } = useLocationSelectList();
  const { data: supplierSelectList } = useSupplierSelectList();

  // State biểu mẫu (hỗ trợ cả ID và Name để đồng bộ chuẩn thực thể C#)
  const [assetCode, setAssetCode] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState<string>("Máy chủ & Hạ tầng mạng (Server)");

  const [statusId, setStatusId] = useState<number | null>(null);
  const [statusName, setStatusName] = useState<string>("Sẵn sàng cấp phát");

  const [brandId, setBrandId] = useState<number | null>(null);
  const [brandName, setBrandName] = useState<string>("Dell Inc.");

  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState<string>("Công ty Cổ phần Tin học Phong Vũ");

  const [locationId, setLocationId] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>("Kho Tổng IT - Tầng hầm B1");

  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState<string>("Chưa phân bổ");

  const [assignedToUser, setAssignedToUser] = useState<string>("");
  const [purchasePrice, setPurchasePrice] = useState<number>(15000000);
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(new Date());
  const [warrantyMonths, setWarrantyMonths] = useState<number>(36);
  const [description, setDescription] = useState<string>("");

  // Cấu hình kỹ thuật chuyên sâu (Specs)
  const [specs, setSpecs] = useState<HardwareTechnicalSpecs>({
    cpu: "Dual Intel Xeon Silver 4314 (32 Cores)",
    ram: "128GB ECC Registered DDR4",
    storage: "8x 1.92TB SAS SSD (RAID-10)",
    rackLocation: "Rack R03 - U10-U12",
    powerSupply: "Dual 800W Redundant Platinum",
  });

  // Thuộc tính mở rộng không giới hạn (Custom Key-Value Attributes)
  const [customAttributes, setCustomAttributes] = useState<CustomAttributeItem[]>([]);
  const [newAttrName, setNewAttrName] = useState<string>("");
  const [newAttrValue, setNewAttrValue] = useState<string>("");

  // Tự động đồng bộ ID ban đầu từ Select-List API nếu tạo mới
  useEffect(() => {
    if (!isEdit && categorySelectList?.length && categoryId === null) {
      const match = categorySelectList.find((c) =>
        c.value.toLowerCase().includes("máy chủ") ||
        c.value.toLowerCase().includes("server") ||
        c.value.toLowerCase().includes("chuyển mạch")
      );
      if (match) {
        setCategoryId(Number(match.key));
        setCategoryName(match.value);
      }
    }
  }, [categorySelectList, categoryId, isEdit]);

  useEffect(() => {
    if (!isEdit && brandSelectList?.length && brandId === null) {
      const match = brandSelectList.find((b) => b.value.toLowerCase().includes("dell") || b.value.toLowerCase().includes("cisco"));
      if (match) {
        setBrandId(Number(match.key));
        setBrandName(match.value);
      } else if (brandSelectList[0]) {
        setBrandId(Number(brandSelectList[0].key));
        setBrandName(brandSelectList[0].value);
      }
    }
  }, [brandSelectList, brandId, isEdit]);

  useEffect(() => {
    if (!isEdit && statusSelectList?.length && statusId === null) {
      const match = statusSelectList.find((s) => s.value.toLowerCase().includes("sẵn sàng") || s.value.toLowerCase().includes("sử dụng"));
      if (match) {
        setStatusId(Number(match.key));
        setStatusName(match.value);
      } else if (statusSelectList[0]) {
        setStatusId(Number(statusSelectList[0].key));
        setStatusName(statusSelectList[0].value);
      }
    }
  }, [statusSelectList, statusId, isEdit]);

  useEffect(() => {
    if (!isEdit && departmentSelectList?.length && departmentId === null) {
      if (departmentSelectList[0]) {
        setDepartmentId(Number(departmentSelectList[0].key));
        setDepartmentName(departmentSelectList[0].value);
      }
    }
  }, [departmentSelectList, departmentId, isEdit]);

  useEffect(() => {
    if (!isEdit && locationSelectList?.length && locationId === null) {
      if (locationSelectList[0]) {
        setLocationId(Number(locationSelectList[0].key));
        setLocationName(locationSelectList[0].value);
      }
    }
  }, [locationSelectList, locationId, isEdit]);

  useEffect(() => {
    if (!isEdit && supplierSelectList?.length && supplierId === null) {
      if (supplierSelectList[0]) {
        setSupplierId(Number(supplierSelectList[0].key));
        setSupplierName(supplierSelectList[0].value);
      }
    }
  }, [supplierSelectList, supplierId, isEdit]);

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
        setCategoryId(existing.categoryId ?? null);
        setCategoryName(existing.categoryName || "Máy chủ & Hạ tầng mạng (Server)");
        setStatusId(existing.statusId ?? null);
        setStatusName(existing.statusName || "Sẵn sàng cấp phát");
        setBrandId(existing.brandId ?? null);
        setBrandName(existing.brandName || "Dell Inc.");
        setSupplierId(existing.supplierId ?? null);
        setSupplierName(existing.supplierName || "Công ty Cổ phần Tin học Phong Vũ");
        setLocationId(existing.locationId ?? null);
        setLocationName(existing.locationName || "Kho Tổng IT - Tầng hầm B1");
        setDepartmentId(existing.departmentId ?? null);
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
      setAssetCode(`HW-SRV-2026-${rand}`);
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

  // Chọn loại thiết bị nhanh từ 4 thẻ
  const handleSelectCategoryType = (typeItem: HardwareDeviceType) => {
    // Tìm trong categorySelectList xem có danh mục tương ứng không
    const matchedInApi = categorySelectList?.find(
      (c) =>
        c.value.toLowerCase().includes(typeItem.id) ||
        typeItem.categoryName.toLowerCase().includes(c.value.toLowerCase()) ||
        c.value.toLowerCase().includes(typeItem.label.toLowerCase())
    );
    if (matchedInApi) {
      setCategoryId(Number(matchedInApi.key));
      setCategoryName(matchedInApi.value);
      handleAutoGenerateCode(matchedInApi.value);
    } else {
      setCategoryId(null);
      setCategoryName(typeItem.categoryName);
      handleAutoGenerateCode(typeItem.categoryName);
    }

    // Gợi ý cấu hình mặc định tương ứng với loại
    if (typeItem.id === "server") {
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

  // ================= Danh sách Options từ Select-List API ({ key, value }) =================
  const categoryOptions = useMemo(() => {
    if (categorySelectList && categorySelectList.length > 0) return categorySelectList;
    return ALL_CATEGORY_OPTIONS.map((c, i) => ({ key: i + 1, value: c }));
  }, [categorySelectList]);

  const brandOptions = useMemo(() => {
    if (brandSelectList && brandSelectList.length > 0) return brandSelectList;
    return BRAND_OPTIONS.map((b, i) => ({ key: i + 1, value: b }));
  }, [brandSelectList]);

  const statusOptions = useMemo(() => {
    if (statusSelectList && statusSelectList.length > 0) return statusSelectList;
    return STATUS_OPTIONS.map((s, i) => ({ key: i + 1, value: s }));
  }, [statusSelectList]);

  const departmentOptions = useMemo(() => {
    if (departmentSelectList && departmentSelectList.length > 0) return departmentSelectList;
    return DEPARTMENT_OPTIONS.map((d, i) => ({ key: i + 1, value: d }));
  }, [departmentSelectList]);

  const locationOptions = useMemo(() => {
    if (locationSelectList && locationSelectList.length > 0) return locationSelectList;
    return LOCATION_OPTIONS.map((l, i) => ({ key: i + 1, value: l }));
  }, [locationSelectList]);

  const supplierOptions = useMemo(() => {
    if (supplierSelectList && supplierSelectList.length > 0) return supplierSelectList;
    return SUPPLIER_OPTIONS.map((s, i) => ({ key: i + 1, value: s }));
  }, [supplierSelectList]);

  // Handlers nhận trực tiếp key (ID) và value (Tên) từ Select
  const handleCategoryChange = (val: string, opt?: SelectOption) => {
    const key = opt?.key !== undefined ? Number(opt.key) : Number(val) || null;
    const value = opt?.value ? String(opt.value) : (opt?.label || val);
    setCategoryId(key);
    setCategoryName(value);
    handleAutoGenerateCode(value);
  };

  const handleBrandChange = (val: string, opt?: SelectOption) => {
    const key = opt?.key !== undefined ? Number(opt.key) : Number(val) || null;
    const value = opt?.value ? String(opt.value) : (opt?.label || val);
    setBrandId(key);
    setBrandName(value);
  };

  const handleStatusChange = (val: string, opt?: SelectOption) => {
    const key = opt?.key !== undefined ? Number(opt.key) : Number(val) || null;
    const value = opt?.value ? String(opt.value) : (opt?.label || val);
    setStatusId(key);
    setStatusName(value);
  };

  const handleDeptChange = (val: string, opt?: SelectOption) => {
    const key = opt?.key !== undefined ? Number(opt.key) : Number(val) || null;
    const value = opt?.value ? String(opt.value) : (opt?.label || val);
    setDepartmentId(key);
    setDepartmentName(value);
  };

  const handleLocationChange = (val: string, opt?: SelectOption) => {
    const key = opt?.key !== undefined ? Number(opt.key) : Number(val) || null;
    const value = opt?.value ? String(opt.value) : (opt?.label || val);
    setLocationId(key);
    setLocationName(value);
  };

  const handleSupplierChange = (val: string, opt?: SelectOption) => {
    const key = opt?.key !== undefined ? Number(opt.key) : Number(val) || null;
    const value = opt?.value ? String(opt.value) : (opt?.label || val);
    setSupplierId(key);
    setSupplierName(value);
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
      categoryId,
      categoryName,
      statusId,
      statusName,
      brandId,
      brandName,
      supplierId,
      supplierName,
      locationId,
      locationName,
      departmentId,
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
    categoryId,
    categoryName,
    statusId,
    statusName,
    brandId,
    brandName,
    supplierId,
    supplierName,
    locationId,
    locationName,
    departmentId,
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

      <div className="p-3.5 sm:p-5 max-w-7xl mx-auto space-y-4">
        {/* HERO HEADER BAR */}
        <div className="rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 shadow-xs backdrop-blur-sm p-3.5 sm:p-4 transition-all">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
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

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/thiet-bi-phan-cung")}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                title="Quay lại danh sách"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {isEdit ? `Cập nhật: ${name || assetCode}` : "Thêm mới thiết bị phần cứng"}
                  </h1>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {isEdit ? `Mã: ${assetCode}` : "Giao diện tinh gọn"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Định cấu hình phần cứng chi tiết, thuộc tính mở rộng và đồng bộ tài sản IT doanh nghiệp.
                </p>
              </div>
            </div>

            {/* Top Action buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleAutoGenerateCode(categoryName);
                  toast.info("Đã làm mới thông tin");
                }}
                className="text-xs font-medium h-8.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới mã
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate("/thiet-bi-phan-cung")}
                className="text-xs font-medium h-8.5 cursor-pointer"
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                className="text-xs font-semibold shadow-xs h-8.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {isEdit ? "Lưu cập nhật" : "Lưu thiết bị"}
                <kbd className="hidden lg:inline-block ml-1.5 px-1 py-0.2 text-[9px] bg-white/20 rounded font-mono">Ctrl+S</kbd>
              </Button>
            </div>
          </div>
        </div>

        {/* 1. CHỌN LOẠI THIẾT BỊ PHẦN CỨNG (HERO SELECTOR - COMPACT) */}
        <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-3 sm:p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                Chọn loại thiết bị phần cứng
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Mỗi loại thiết bị sẽ tự động tải các trường thông số kỹ thuật chuyên biệt tương ứng.
              </p>
            </div>

            {/* Dropdown danh mục đầy đủ */}
            <div className="w-full sm:w-64">
              <Select
                size="sm"
                options={categoryOptions}
                value={categoryId ?? categoryName}
                onChange={handleCategoryChange}
              />
            </div>
          </div>

          {/* 4 Thẻ chọn nhanh - Bố cục thẻ ngang tinh gọn */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {HARDWARE_DEVICE_TYPES.map((type) => {
              const isSelected = categoryName === type.categoryName;
              return (
                <button
                  type="button"
                  key={type.id}
                  onClick={() => handleSelectCategoryType(type)}
                  className={`relative text-left p-2.5 rounded-lg border transition-all duration-200 flex items-center gap-2.5 group cursor-pointer ${
                    isSelected
                      ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-2xs"
                      : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 ${type.color}`}>
                    {type.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold truncate ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`}>
                      {type.label}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                      {type.sublabel}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 text-white shrink-0 flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TWO-COLUMN BALANCED LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* CỘT TRÁI (8 COLS): FORM NHẬP LIỆU GỌN GÀNG */}
          <div className="xl:col-span-8 space-y-4">
            {/* CARD: THÔNG TIN ĐỊNH DANH & KHO */}
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
                  Định danh thiết bị & Quản lý kho
                </h3>
                <span className="text-[11px] text-gray-400 font-medium">
                  <span className="text-red-500">*</span> Bắt buộc
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Mã tài sản */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Mã tài sản quản lý *
                    </Label>
                    <button
                      type="button"
                      onClick={() => handleAutoGenerateCode(categoryName)}
                      className="text-[11px] text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      ⚡ Tạo mã
                    </button>
                  </div>
                  <Input
                    size="sm"
                    type="text"
                    value={assetCode}
                    onChange={(e) => setAssetCode(e.target.value)}
                    placeholder="VD: HW-SRV-2026-001"
                    className="font-mono font-semibold"
                  />
                </div>

                {/* Tên thiết bị */}
                <div className="sm:col-span-1 lg:col-span-2">
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên thiết bị *
                  </Label>
                  <Input
                    size="sm"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Máy chủ ảo hóa ProLiant DL380 Gen10"
                  />
                </div>

                {/* Hãng sản xuất */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hãng sản xuất (Brand)
                  </Label>
                  <Select
                    size="sm"
                    options={brandOptions}
                    value={brandId ?? brandName}
                    onChange={handleBrandChange}
                  />
                </div>

                {/* Model máy */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mã Model máy
                  </Label>
                  <Input
                    size="sm"
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="VD: ProLiant DL380 Gen10 Plus"
                  />
                </div>

                {/* Trạng thái vận hành */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái vận hành
                  </Label>
                  <Select
                    size="sm"
                    options={statusOptions}
                    value={statusId ?? statusName}
                    onChange={handleStatusChange}
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Số Serial / Service Tag *
                  </Label>
                  <Input
                    size="sm"
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="VD: 9FC4KL3 hoặc SGH219V47K"
                    className="font-mono"
                  />
                </div>

                {/* Mã vạch / QR Code */}
                <div className="sm:col-span-1 lg:col-span-2">
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mã vạch / QR Code quản lý kho
                  </Label>
                  <Input
                    size="sm"
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="VD: 893850100787"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {/* CARD: CẤU HÌNH KỸ THUẬT THÍCH ỨNG THEO DANH MỤC */}
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center text-xs">⚙️</span>
                    Cấu hình kỹ thuật chuyên sâu ({categoryName})
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Thông số tự động thích ứng theo chuẩn thiết bị đã chọn
                  </p>
                </div>
              </div>

              {/* Form specs cho Máy chủ (Server) */}
              {categoryName.includes("Server") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bộ vi xử lý (Server CPU)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.cpu || ""}
                      onChange={(e) => setSpecs({ ...specs, cpu: e.target.value })}
                      placeholder="VD: Dual Intel Xeon Silver 4314"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bộ nhớ RAM ECC
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.ram || ""}
                      onChange={(e) => setSpecs({ ...specs, ram: e.target.value })}
                      placeholder="VD: 128GB ECC Registered DDR4"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ổ cứng SAS / RAID
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.storage || ""}
                      onChange={(e) => setSpecs({ ...specs, storage: e.target.value })}
                      placeholder="VD: 8x 1.92TB SAS SSD RAID-10"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vị trí tủ Rack (U)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.rackLocation || ""}
                      onChange={(e) => setSpecs({ ...specs, rackLocation: e.target.value })}
                      placeholder="VD: Rack R03 - U10-U12"
                    />
                  </div>
                  <div className="sm:col-span-1 lg:col-span-2">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nguồn điện & Quản trị từ xa (iLO / iDRAC)
                    </Label>
                    <Input
                      size="sm"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kích thước đường chéo
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.screenSize || ""}
                      onChange={(e) => setSpecs({ ...specs, screenSize: e.target.value })}
                      placeholder="VD: 27 inch, 32 inch"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Độ phân giải & Tấm nền
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.resolution || ""}
                      onChange={(e) => setSpecs({ ...specs, resolution: e.target.value })}
                      placeholder="VD: 4K UHD (3840 x 2160) IPS"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tần số quét & Cổng kết nối
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.refreshRate || ""}
                      onChange={(e) => setSpecs({ ...specs, refreshRate: e.target.value })}
                      placeholder="VD: 144Hz, Type-C 90W PD, HDMI, DP"
                    />
                  </div>
                </div>
              )}

              {/* Form specs cho Máy in (Printer) */}
              {categoryName.includes("Printer") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Công nghệ in
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.printTechnology || ""}
                      onChange={(e) => setSpecs({ ...specs, printTechnology: e.target.value })}
                      placeholder="VD: Laser đa chức năng"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Khổ giấy hỗ trợ
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.paperSizes || ""}
                      onChange={(e) => setSpecs({ ...specs, paperSizes: e.target.value })}
                      placeholder="VD: A4, A3, Letter"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tính năng (Duplex / WiFi)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.duplex ? "In 2 mặt tự động (Duplex), WiFi" : "In 1 mặt, LAN"}
                      onChange={(e) => setSpecs({ ...specs, duplex: e.target.value.includes("2 mặt") })}
                      placeholder="VD: In 2 mặt tự động, WiFi, LAN"
                    />
                  </div>
                </div>
              )}

              {/* Form specs cho Thiết bị mạng (Network) */}
              {(categoryName.includes("Network") || categoryName.includes("mạng")) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số lượng cổng (Port Count)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.portCount || ""}
                      onChange={(e) => setSpecs({ ...specs, portCount: e.target.value })}
                      placeholder="VD: 24 Port Gigabit PoE+ & 4 SFP+"
                    />
                  </div>
                  <div className="sm:col-span-1 lg:col-span-2">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tốc độ & Chuẩn quản trị mạng
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={specs.networkSpeed || ""}
                      onChange={(e) => setSpecs({ ...specs, networkSpeed: e.target.value })}
                      placeholder="VD: Layer 3 Managed Gigabit Switch, 128Gbps Throughput"
                    />
                  </div>
                </div>
              )}

              {/* Fallback cho các loại thiết bị khác */}
              {!categoryName.includes("Server") &&
                !categoryName.includes("Monitor") &&
                !categoryName.includes("Printer") &&
                !categoryName.includes("Network") &&
                !categoryName.includes("mạng") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bộ vi xử lý / Chip
                      </Label>
                      <Input
                        size="sm"
                        type="text"
                        value={specs.cpu || ""}
                        onChange={(e) => setSpecs({ ...specs, cpu: e.target.value })}
                        placeholder="VD: Intel Core i7 / Apple M3"
                      />
                    </div>
                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bộ nhớ RAM
                      </Label>
                      <Input
                        size="sm"
                        type="text"
                        value={specs.ram || ""}
                        onChange={(e) => setSpecs({ ...specs, ram: e.target.value })}
                        placeholder="VD: 16GB / 32GB"
                      />
                    </div>
                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bộ nhớ lưu trữ
                      </Label>
                      <Input
                        size="sm"
                        type="text"
                        value={specs.storage || ""}
                        onChange={(e) => setSpecs({ ...specs, storage: e.target.value })}
                        placeholder="VD: 512GB NVMe SSD"
                      />
                    </div>
                  </div>
                )}
            </div>

            {/* CARD: THUỘC TÍNH MỞ RỘNG TÙY CHỈNH KHÔNG GIỚI HẠN */}
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center text-xs">✨</span>
                    Thuộc tính mở rộng linh hoạt (Custom Attributes)
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Thêm bất kỳ thông số đặc thù nào (Địa chỉ MAC, IP tĩnh, tem kiểm định...)
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {customAttributes.length} thuộc tính
                </span>
              </div>

              {/* Danh sách thuộc tính đã thêm - 2 cột tinh gọn */}
              {customAttributes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {customAttributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-xs gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-gray-700 dark:text-gray-300 block truncate text-[11px]">
                          {attr.name}
                        </span>
                        <span className="text-gray-900 dark:text-white font-mono truncate block text-xs">
                          {attr.value}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomAttribute(attr.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 p-1 rounded transition shrink-0 cursor-pointer"
                        title="Xóa thuộc tính"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400 italic">
                  Chưa có thuộc tính mở rộng nào. Bạn có thể thêm địa chỉ MAC, IP tĩnh, phụ kiện đi kèm...
                </p>
              )}

              {/* Thanh nhập thêm thuộc tính mới */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  placeholder="Tên thuộc tính (VD: MAC, IP tĩnh...)"
                  className="flex-1 h-8.5 px-2.5 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white border-gray-300"
                />
                <input
                  type="text"
                  value={newAttrValue}
                  onChange={(e) => setNewAttrValue(e.target.value)}
                  placeholder="Giá trị (VD: 00:1A:2B:3C:4D:5E)"
                  className="flex-1 h-8.5 px-2.5 text-xs border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAttribute}
                  className="h-8.5 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 transition cursor-pointer"
                >
                  + Thêm mục
                </button>
              </div>
            </div>

            {/* CARD: PHÂN BỔ, VỊ TRÍ & TÀI CHÍNH */}
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 sm:p-5 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
                Phân bổ sử dụng & Vị trí vật lý
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phòng ban sử dụng
                  </Label>
                  <Select
                    size="sm"
                    options={departmentOptions}
                    value={departmentId ?? departmentName}
                    onChange={handleDeptChange}
                  />
                </div>

                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Người phụ trách / Bàn giao
                  </Label>
                  <Input
                    size="sm"
                    type="text"
                    value={assignedToUser}
                    onChange={(e) => setAssignedToUser(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>

                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vị trí / Chi nhánh kho
                  </Label>
                  <Select
                    size="sm"
                    options={locationOptions}
                    value={locationId ?? locationName}
                    onChange={handleLocationChange}
                  />
                </div>
              </div>

              {/* Tài chính & Bảo hành */}
              <div className="pt-2.5 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Giá vốn mua vào (VNĐ)
                  </Label>
                  <Input
                    size="sm"
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Bảo hành (tháng)
                    </Label>
                    <div className="flex gap-1">
                      {[12, 24, 36, 60].map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setWarrantyMonths(m)}
                          className={`text-[10px] px-1.5 py-0.5 rounded border cursor-pointer ${
                            warrantyMonths === m
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          {m}T
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    size="sm"
                    type="number"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nhà cung cấp
                  </Label>
                  <Select
                    size="sm"
                    options={supplierOptions}
                    value={supplierId ?? supplierName}
                    onChange={handleSupplierChange}
                  />
                </div>
              </div>

              {/* Ghi chú */}
              <div className="pt-1">
                <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả / Ghi chú bàn giao
                </Label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ghi chú tình trạng thiết bị, lịch sử sửa chữa, các lưu ý khi kiểm kê kho định kỳ..."
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-xs resize-none dark:bg-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (4 COLS): LIVE ASSET CARD & PRE-FLIGHT CHECKLIST */}
          <div className="xl:col-span-4 space-y-4 sticky top-4">
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center text-xs">🖥️</span>
                  Xem trước trực quan
                </h3>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  Live Preview
                </span>
              </div>

              {/* Mock Asset Card */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/80 dark:to-gray-900 p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white shrink-0 flex items-center justify-center font-bold text-xs shadow-xs">
                      HW
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {name || "Chưa nhập tên thiết bị"}
                      </h4>
                      <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate">
                        {assetCode || "MÃ-CHƯA-CÓ"} • {model || "Model N/A"}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                    {statusName}
                  </span>
                </div>

                {/* Serial & Barcode Mock */}
                <div className="p-2 rounded-lg bg-gray-100/70 dark:bg-gray-800/60 border border-dashed border-gray-300 dark:border-gray-700 font-mono text-[11px] flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase font-sans">Serial Tag</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{serialNumber || "—"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 block uppercase font-sans">Barcode</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{barcode || "—"}</span>
                  </div>
                </div>

                {/* Metadata tags */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-semibold">Thương hiệu</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {brandName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-semibold">Danh mục</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {categoryName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-semibold">Phòng ban</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {departmentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-semibold">Vị trí</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {locationName}
                    </span>
                  </div>
                </div>

                {/* Tóm tắt Specs */}
                {specs && (specs.cpu || specs.ram || specs.screenSize || specs.portCount) && (
                  <div className="p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-indigo-700 dark:text-indigo-400 block">
                      Thông số chính:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                      {[specs.cpu, specs.ram, specs.storage, specs.screenSize, specs.portCount].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                )}

                {/* Tài chính & BH */}
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-semibold block">Giá vốn</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(purchasePrice)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 uppercase font-semibold block">Bảo hành</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {warrantyMonths} Tháng
                    </span>
                  </div>
                </div>
              </div>

              {/* PRE-FLIGHT VALIDATION CHECKLIST */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
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

                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  {checklist.items.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition ${
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
              <div className="pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSave}
                  className="w-full justify-center text-xs font-semibold shadow-xs h-9 cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
