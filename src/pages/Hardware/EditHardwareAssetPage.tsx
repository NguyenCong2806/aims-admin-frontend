import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";

import PageMeta from "../../components/common/PageMeta";
import AimsModuleNav from "../../components/aims/AimsModuleNav";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";

import {
  HardwareAssetDto,
  HardwareAssetObject,
} from "../../models/Hardware/hardwareAsset";

import {
  HardwareFormSpecs,
  HARDWARE_CATEGORY_SUBTYPES,
  HARDWARE_DEVICE_TYPES,
  resolveValidSubType,
  inferHardwareType,
  FieldLabel,
  formatCurrency,
  ALL_CATEGORY_OPTIONS,
  BRAND_OPTIONS,
  STATUS_OPTIONS,
  DEPARTMENT_OPTIONS,
  LOCATION_OPTIONS,
  SUPPLIER_OPTIONS,
} from "./hardwareConstants";

import {
  useHardwareAssetById,
  useUpdateHardwareAsset,
} from "../../query/hardwareassets/hardwareAssetsQuery";

import {
  useAssetCategorySelectList,
  useAssetStatusSelectList,
  useBrandSelectList,
  useSupplierSelectList,
  useLocationSelectList,
  useDepartmentSelectList,
  normalizeSelectList,
} from "../../query/lookups/useLookupSelectLists";

export const EditHardwareAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Truy vấn chi tiết thiết bị phần cứng từ backend API
  const {
    data: assetDetailResult,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useHardwareAssetById(id || null);

  const updateMutation = useUpdateHardwareAsset();
  const isSaving = updateMutation.isPending;

  // SubType & Mẫu cấu hình Stored Procedure đang chọn
  const [assetSubType, setAssetSubType] = useState<string>("SWITCH");
  const [activeSpecType, setActiveSpecType] = useState<string>("network_device");

  // State biểu mẫu - Khớp 1:1 với HardwareAssetDto của Backend
  const [assetCode, setAssetCode] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");

  // Foreign Keys & Joined Names
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");

  const [statusId, setStatusId] = useState<number | null>(null);
  const [statusName, setStatusName] = useState<string>("");

  const [brandId, setBrandId] = useState<number | null>(null);
  const [brandName, setBrandName] = useState<string>("");

  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState<string>("");

  const [locationId, setLocationId] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [assignedToUser, setAssignedToUser] = useState<string>("");

  // Tài chính & Bảo hành
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(new Date());
  const [warrantyMonths, setWarrantyMonths] = useState<number>(36);
  const [description, setDescription] = useState<string>("");

  // Cấu hình kỹ thuật chuyên sâu (Specs)
  const [specs, setSpecs] = useState<HardwareFormSpecs>({});

  // Gọi trực tiếp các API /select-list của 6 bảng danh mục
  const { data: rawCategories } = useAssetCategorySelectList();
  const { data: rawStatuses } = useAssetStatusSelectList();
  const { data: rawBrands } = useBrandSelectList();
  const { data: rawSuppliers } = useSupplierSelectList();
  const { data: rawLocations } = useLocationSelectList();
  const { data: rawDepartments } = useDepartmentSelectList();

  const categoryOptions = useMemo(() => {
    const norm = normalizeSelectList(rawCategories);
    if (norm.length > 0) return norm;
    return ALL_CATEGORY_OPTIONS.map((c, i) => ({ value: i + 1, label: c }));
  }, [rawCategories]);

  const statusOptions = useMemo(() => {
    const norm = normalizeSelectList(rawStatuses);
    if (norm.length > 0) return norm;
    return STATUS_OPTIONS.map((s, i) => ({ value: i + 1, label: s }));
  }, [rawStatuses]);

  const brandOptions = useMemo(() => {
    const norm = normalizeSelectList(rawBrands);
    if (norm.length > 0) return norm;
    return BRAND_OPTIONS.map((b, i) => ({ value: i + 1, label: b }));
  }, [rawBrands]);

  const supplierOptions = useMemo(() => {
    const norm = normalizeSelectList(rawSuppliers);
    if (norm.length > 0) return norm;
    return SUPPLIER_OPTIONS.map((s, i) => ({ value: i + 1, label: s }));
  }, [rawSuppliers]);

  const locationOptions = useMemo(() => {
    const norm = normalizeSelectList(rawLocations);
    if (norm.length > 0) return norm;
    return LOCATION_OPTIONS.map((l, i) => ({ value: i + 1, label: l }));
  }, [rawLocations]);

  const departmentOptions = useMemo(() => {
    const norm = normalizeSelectList(rawDepartments);
    if (norm.length > 0) return norm;
    return DEPARTMENT_OPTIONS.map((d, i) => ({ value: i + 1, label: d }));
  }, [rawDepartments]);

  // Handlers đồng bộ cả ID và Display Name khi chọn từ Select List
  const handleCategoryChange = (val: string) => {
    const num = Number(val);
    const found = categoryOptions.find((o) => o.value === num);
    const foundLabel = found ? found.label : val;
    setCategoryId(num > 0 ? num : null);
    setCategoryName(foundLabel);

    const inferred = inferHardwareType(assetSubType, foundLabel);
    setActiveSpecType(inferred);
    const matched = HARDWARE_DEVICE_TYPES.find((d) => d.id === inferred);
    if (matched) {
      setAssetSubType(resolveValidSubType(inferred, matched.subType));
    }
  };

  const handleBrandChange = (val: string) => {
    const num = Number(val);
    const found = brandOptions.find((o) => o.value === num);
    setBrandId(num > 0 ? num : null);
    setBrandName(found ? found.label : val);
  };

  const handleStatusChange = (val: string) => {
    const num = Number(val);
    const found = statusOptions.find((o) => o.value === num);
    setStatusId(num > 0 ? num : null);
    setStatusName(found ? found.label : val);
  };

  const handleDepartmentChange = (val: string) => {
    const num = Number(val);
    const found = departmentOptions.find((o) => o.value === num);
    setDepartmentId(num > 0 ? num : null);
    setDepartmentName(found ? found.label : val);
  };

  const handleLocationChange = (val: string) => {
    const num = Number(val);
    const found = locationOptions.find((o) => o.value === num);
    setLocationId(num > 0 ? num : null);
    setLocationName(found ? found.label : val);
  };

  const handleSupplierChange = (val: string) => {
    const num = Number(val);
    const found = supplierOptions.find((o) => o.value === num);
    setSupplierId(num > 0 ? num : null);
    setSupplierName(found ? found.label : val);
  };

  // Đồng bộ lại tên hiển thị khi các danh sách lookup trả về
  useEffect(() => {
    if (categoryOptions.length > 0 && categoryId) {
      const found = categoryOptions.find((o) => o.value === categoryId);
      if (found && found.label !== categoryName) setCategoryName(found.label);
    }
  }, [categoryId, categoryOptions, categoryName]);

  useEffect(() => {
    if (statusOptions.length > 0 && statusId) {
      const found = statusOptions.find((o) => o.value === statusId);
      if (found && found.label !== statusName) setStatusName(found.label);
    }
  }, [statusId, statusOptions, statusName]);

  useEffect(() => {
    if (brandOptions.length > 0 && brandId) {
      const found = brandOptions.find((o) => o.value === brandId);
      if (found && found.label !== brandName) setBrandName(found.label);
    }
  }, [brandId, brandOptions, brandName]);

  useEffect(() => {
    if (departmentOptions.length > 0 && departmentId) {
      const found = departmentOptions.find((o) => o.value === departmentId);
      if (found && found.label !== departmentName) setDepartmentName(found.label);
    }
  }, [departmentId, departmentOptions, departmentName]);

  useEffect(() => {
    if (locationOptions.length > 0 && locationId) {
      const found = locationOptions.find((o) => o.value === locationId);
      if (found && found.label !== locationName) setLocationName(found.label);
    }
  }, [locationId, locationOptions, locationName]);

  useEffect(() => {
    if (supplierOptions.length > 0 && supplierId) {
      const found = supplierOptions.find((o) => o.value === supplierId);
      if (found && found.label !== supplierName) setSupplierName(found.label);
    }
  }, [supplierId, supplierOptions, supplierName]);

  // Load chi tiết từ backend vào các state của form
  useEffect(() => {
    if (!assetDetailResult) return;

    const rawData =
      (assetDetailResult as any)?.data?.data ||
      (assetDetailResult as any)?.data ||
      assetDetailResult;

    if (!rawData) return;

    const existing = rawData.hardwareAssetDto || rawData;

    setAssetCode(existing.assetCode || existing.asset_code || "");
    setName(existing.name || "");
    setModel(existing.model || "");
    setSerialNumber(existing.serialNumber || existing.serial_number || "");
    setBarcode(existing.barcode || "");

    const rawSubType = existing.assetSubType || existing.asset_sub_type || "";
    const rawCatName =
      existing.categoryName ||
      existing.category_name ||
      "Thiết bị mạng (Switch / Router / AP)";

    let inferredType = inferHardwareType(rawSubType, rawCatName);

    // Tìm kiếm các cấu hình spec tương ứng từ payload trả về
    const netSpec =
      rawData.assetSpecNetworkDeviceDto ||
      rawData.AssetSpecNetworkDeviceDto ||
      rawData.asset_spec_network_device_dto ||
      rawData.data?.assetSpecNetworkDeviceDto ||
      rawData.data?.AssetSpecNetworkDeviceDto ||
      existing?.assetSpecNetworkDeviceDto ||
      existing?.AssetSpecNetworkDeviceDto;

    const cameraSpec =
      rawData.assetSpecCameraNvrDto ||
      rawData.AssetSpecCameraNvrDto ||
      rawData.asset_spec_camera_nvr_dto ||
      rawData.data?.assetSpecCameraNvrDto ||
      rawData.data?.AssetSpecCameraNvrDto ||
      existing?.assetSpecCameraNvrDto ||
      existing?.AssetSpecCameraNvrDto;

    const nasSpec =
      rawData.assetSpecNasStorageDto ||
      rawData.AssetSpecNasStorageDto ||
      rawData.asset_spec_nas_storage_dto ||
      rawData.data?.assetSpecNasStorageDto ||
      rawData.data?.AssetSpecNasStorageDto ||
      existing?.assetSpecNasStorageDto ||
      existing?.AssetSpecNasStorageDto;

    const displaySpec =
      rawData.assetSpecDisplayProjectorDto ||
      rawData.AssetSpecDisplayProjectorDto ||
      rawData.asset_spec_display_projector_dto ||
      rawData.data?.assetSpecDisplayProjectorDto ||
      rawData.data?.AssetSpecDisplayProjectorDto ||
      existing?.assetSpecDisplayProjectorDto ||
      existing?.AssetSpecDisplayProjectorDto;

    const printerSpec =
      rawData.assetSpecPrinterCopierDto ||
      rawData.AssetSpecPrinterCopierDto ||
      rawData.asset_spec_printer_copier_dto ||
      rawData.data?.assetSpecPrinterCopierDto ||
      rawData.data?.AssetSpecPrinterCopierDto ||
      existing?.assetSpecPrinterCopierDto ||
      existing?.AssetSpecPrinterCopierDto;

    if (netSpec) {
      inferredType = "network_device";
      setSpecs({
        id: netSpec.id,
        hardwareAssetId: netSpec.hardwareAssetId || netSpec.hardwareassetid,
        deviceType:
          netSpec.deviceType ||
          netSpec.devicetype ||
          netSpec.DeviceType ||
          "Core Switch Layer 3",
        firewallThroughput:
          netSpec.firewallThroughput ||
          netSpec.firewallthroughput ||
          netSpec.FirewallThroughput ||
          "",
        ipsThroughput:
          netSpec.ipsThroughput ||
          netSpec.ipsthroughput ||
          netSpec.IpsThroughput ||
          "",
        vpnThroughput:
          netSpec.vpnThroughput ||
          netSpec.vpnthroughput ||
          netSpec.VpnThroughput ||
          "",
        concurrentSessions:
          netSpec.concurrentSessions ??
          netSpec.concurrentsessions ??
          netSpec.ConcurrentSessions ??
          0,
        portCount:
          netSpec.portCount ??
          netSpec.portcount ??
          netSpec.PortCount ??
          24,
        portSpeed:
          netSpec.portSpeed ||
          netSpec.portspeed ||
          netSpec.PortSpeed ||
          "480 Gbps Stacking",
        networkSpeed:
          netSpec.portSpeed ||
          netSpec.portspeed ||
          netSpec.PortSpeed ||
          "480 Gbps Stacking",
        uplinkPorts:
          netSpec.uplinkPorts ||
          netSpec.uplinkports ||
          netSpec.UplinkPorts ||
          "",
        antennaSpec:
          netSpec.antennaSpec ||
          netSpec.antennaspec ||
          netSpec.AntennaSpec ||
          "",
        concurrentUsersLimit:
          netSpec.concurrentUsersLimit ??
          netSpec.concurrentuserslimit ??
          netSpec.ConcurrentUsersLimit ??
          0,
        maxVlans:
          netSpec.maxVlans ?? netSpec.maxvlans ?? netSpec.MaxVlans ?? 0,
        isPoeSupported:
          netSpec.isPoeSupported ??
          netSpec.ispoesupported ??
          netSpec.IsPoeSupported ??
          true,
        powerConsumptionW:
          netSpec.powerConsumptionW ??
          netSpec.powerconsumptionw ??
          netSpec.PowerConsumptionW ??
          0,
      });
    } else if (cameraSpec) {
      inferredType = "camera_nvr";
      setSpecs({
        id: cameraSpec.id,
        hardwareAssetId: cameraSpec.hardwareAssetId || cameraSpec.hardwareassetid,
        deviceType: cameraSpec.deviceType || cameraSpec.devicetype || "CAMERA",
        resolution: cameraSpec.resolution || "",
        sensorSize: cameraSpec.sensorSize || cameraSpec.sensorsize || "",
        lensSize: cameraSpec.lensSize || cameraSpec.lenssize || "",
        irDistanceMeters:
          cameraSpec.irDistanceMeters ?? cameraSpec.irdistancemeters ?? 0,
        compressionStandard:
          cameraSpec.compressionStandard || cameraSpec.compressionstandard || "",
        hasTwoWayAudio:
          cameraSpec.hasTwoWayAudio ?? cameraSpec.hastwowaudaio ?? false,
        hasWdr: cameraSpec.hasWdr ?? cameraSpec.haswdr ?? false,
        channelCount:
          cameraSpec.channelCount ?? cameraSpec.channelcount ?? 0,
        maxStorageTb:
          cameraSpec.maxStorageTb ?? cameraSpec.maxstoragetb ?? 0,
        inputBandwidthMbps:
          cameraSpec.inputBandwidthMbps ?? cameraSpec.inputbandwidthmbps ?? 0,
        outputBandwidthMbps:
          cameraSpec.outputBandwidthMbps ?? cameraSpec.outputbandwidthmbps ?? 0,
      });
    } else if (nasSpec) {
      inferredType = "nas_storage";
      setSpecs({
        id: nasSpec.id,
        hardwareAssetId: nasSpec.hardwareAssetId || nasSpec.hardwareassetid,
        deviceType: nasSpec.deviceType || nasSpec.devicetype || "NAS",
        cpuRam: nasSpec.cpuProcessor || nasSpec.cpuprocessor || "",
        installedRamGb:
          nasSpec.installedRamGb ?? nasSpec.installedramgb ?? 0,
        maxRamSupportedGb:
          nasSpec.maxRamSupportedGb ?? nasSpec.maxramsupportedgb ?? 0,
        installedCapacity:
          nasSpec.installedCapacityTb ?? nasSpec.installedcapacitytb ?? 0,
        maxSingleVolumeSizeTb:
          nasSpec.maxSingleVolumeSizeTb ?? nasSpec.maxsinglevolumesizetb ?? 0,
        cacheSlots: nasSpec.cacheSlots || nasSpec.cacheslots || "",
        powerRatingVa:
          nasSpec.powerRatingVa ?? nasSpec.powerratingva ?? 0,
      });
    } else if (displaySpec) {
      inferredType = "display_projector";
      setSpecs({
        id: displaySpec.id,
        hardwareAssetId: displaySpec.hardwareAssetId || displaySpec.hardwareassetid,
        deviceType: displaySpec.deviceType || displaySpec.devicetype || "",
        panelType: displaySpec.displayType || displaySpec.displaytype || "",
        screenSize:
          displaySpec.screenSizeInches ?? displaySpec.screensizeinches ?? 0,
        resolution: displaySpec.resolution || "",
        refreshRate:
          displaySpec.refreshRateHz ?? displaySpec.refreshratehz ?? 0,
        operatingSystem:
          displaySpec.operatingSystem || displaySpec.operatingsystem || "",
        brightnessLumens:
          displaySpec.brightnessAnsiLumens ??
          displaySpec.brightnessansilumens ??
          0,
        contrastRatio: displaySpec.contrastRatio || displaySpec.contrastratio || "",
        lampLifeHours:
          displaySpec.lampLifeHours ?? displaySpec.lamplifehours ?? 0,
        ports: displaySpec.supportedPorts || displaySpec.supportedports || "",
      });
    } else if (printerSpec) {
      inferredType = "printer_copier";
      setSpecs({
        id: printerSpec.id,
        hardwareAssetId: printerSpec.hardwareAssetId || printerSpec.hardwareassetid,
        deviceType: printerSpec.deviceType || printerSpec.devicetype || "PRINTER",
        ipSetup: printerSpec.ipSetup || printerSpec.ipsetup || "",
        paperSizes: printerSpec.maxPaperSize || printerSpec.maxpapersize || "",
        printSpeed:
          printerSpec.printSpeedPpm ?? printerSpec.printspeedppm ?? 0,
        printResolution:
          printerSpec.printResolution || printerSpec.printresolution || "",
        inkCartridgeType:
          printerSpec.inkCartridgeType || printerSpec.inkcartridgetype || "",
        drumLifePages:
          printerSpec.drumLifePages ?? printerSpec.drumlifepages ?? 0,
        lastInkRefillDate:
          printerSpec.lastInkRefillDate || printerSpec.lastinkrefilldate || "",
        lastCleaningDate:
          printerSpec.lastCleaningDate || printerSpec.lastcleaningdate || "",
        shredStyle: printerSpec.shredStyle || printerSpec.shredstyle || "",
        shredCapacitySheets:
          printerSpec.shredCapacitySheets ??
          printerSpec.shredcapacitysheets ??
          0,
        binCapacityLiters:
          printerSpec.binCapacityLiters ?? printerSpec.bincapacityliters ?? 0,
      });
    } else if (rawData.specs) {
      setSpecs(rawData.specs);
    }

    setActiveSpecType(inferredType);
    const resolvedSubType =
      rawSubType ||
      (HARDWARE_DEVICE_TYPES.find((d) => d.id === inferredType)?.subType ??
        "SWITCH");
    setAssetSubType(resolvedSubType);

    setCategoryId(existing.categoryId ?? 1);
    setCategoryName(rawCatName);

    setStatusId(existing.statusId ?? 1);
    setStatusName(
      existing.statusName || existing.status_name || "Đang sử dụng"
    );

    setBrandId(existing.brandId ?? 6);
    setBrandName(
      existing.brandName || existing.brand_name || "Cisco Systems"
    );

    setSupplierId(existing.supplierId ?? 1);
    setSupplierName(
      existing.supplierName ||
      existing.supplier_name ||
      "Công ty Cổ phần Tin học Phong Vũ"
    );

    setLocationId(existing.locationId ?? 1);
    setLocationName(
      existing.locationName || existing.location_name || "Khu vực Hà Nội"
    );

    setDepartmentId(existing.departmentId ?? 1);
    setDepartmentName(
      existing.departmentName || existing.department_name || "ITS"
    );

    setAssignedToUser(existing.assignedToUser || "");
    setPurchasePrice(existing.purchasePrice ?? 0);
    setPurchaseDate(
      existing.purchaseDate ? new Date(existing.purchaseDate) : new Date()
    );
    setEffectiveDate(
      existing.effectiveDate ? new Date(existing.effectiveDate) : new Date()
    );
    setWarrantyMonths(existing.warrantyMonths ?? 36);
    setDescription(existing.description || "");
  }, [assetDetailResult]);

  // Chọn loại thiết bị từ các thẻ danh mục
  const handleSelectCategoryType = (
    typeItem: (typeof HARDWARE_DEVICE_TYPES)[0]
  ) => {
    setActiveSpecType(typeItem.id);
    setAssetSubType(typeItem.subType);

    const matchedOpt = categoryOptions.find(
      (o) =>
        o.label.toLowerCase().includes(typeItem.subType.toLowerCase()) ||
        o.label.toLowerCase().includes(typeItem.prefix.toLowerCase()) ||
        o.label.toLowerCase().includes(typeItem.label.toLowerCase()) ||
        o.label === typeItem.categoryName
    );
    if (matchedOpt) {
      setCategoryId(matchedOpt.value);
      setCategoryName(matchedOpt.label);
    }
  };

  // Pre-flight checklist kiểm tra tính hợp lệ của dữ liệu
  const checklist = useMemo(() => {
    const items = [
      { label: "Mã tài sản", valid: !!assetCode.trim() },
      { label: "Tên thiết bị", valid: !!name.trim() },
      { label: "Thương hiệu", valid: !!brandName.trim() },
      { label: "Serial/Service Tag", valid: !!serialNumber.trim() },
      { label: "Danh mục", valid: !!categoryName.trim() },
      { label: "Trạng thái", valid: !!statusName.trim() },
      { label: "Giá vốn", valid: purchasePrice >= 0 },
      { label: "Thời hạn bảo hành", valid: warrantyMonths > 0 },
    ];
    const completed = items.filter((i) => i.valid).length;
    const percent = Math.round((completed / items.length) * 100);
    return { items, completed, total: items.length, percent };
  }, [
    assetCode,
    name,
    brandName,
    serialNumber,
    categoryName,
    statusName,
    purchasePrice,
    warrantyMonths,
  ]);

  // Tóm tắt specs trực quan dựa theo loại thiết bị đang chọn
  const liveSpecSummary = useMemo(() => {
    if (activeSpecType === "network_device") {
      return [
        specs.deviceType,
        specs.portCount ? `${specs.portCount} Ports` : null,
        specs.portSpeed || specs.networkSpeed,
        specs.isPoeSupported ? "PoE Supported" : null,
      ]
        .filter(Boolean)
        .join(" • ");
    }
    if (activeSpecType === "camera_nvr") {
      return [
        specs.deviceType,
        specs.resolution,
        specs.compressionStandard,
        specs.channelCount ? `${specs.channelCount} Kênh` : null,
      ]
        .filter(Boolean)
        .join(" • ");
    }
    if (activeSpecType === "nas_storage") {
      return [
        specs.deviceType,
        specs.installedCapacity ? `${specs.installedCapacity}TB` : null,
        specs.raidType,
        specs.cpuRam,
      ]
        .filter(Boolean)
        .join(" • ");
    }
    if (activeSpecType === "display_projector") {
      return [
        specs.screenSize ? `${specs.screenSize} inch` : null,
        specs.resolution,
        specs.panelType,
        specs.refreshRate ? `${specs.refreshRate}Hz` : null,
      ]
        .filter(Boolean)
        .join(" • ");
    }
    if (activeSpecType === "printer_copier") {
      return [
        specs.deviceType,
        specs.printTechnology,
        specs.printSpeed ? `${specs.printSpeed} ppm` : null,
        specs.paperSizes,
      ]
        .filter(Boolean)
        .join(" • ");
    }
    return specs.deviceType || "";
  }, [activeSpecType, specs]);

  // Xử lý Lưu cập nhật
  const handleSave = useCallback(async () => {
    if (!id) {
      toast.error("Không tìm thấy mã định danh thiết bị (ID)");
      return;
    }
    if (!assetCode.trim()) {
      toast.error("Vui lòng nhập mã tài sản");
      return;
    }
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên thiết bị");
      return;
    }

    const resolvedSubType = resolveValidSubType(activeSpecType, assetSubType);

    const hardwareAssetDto: HardwareAssetDto = {
      id,
      assetCode: assetCode.trim(),
      assetSubType: resolvedSubType,
      name: name.trim(),
      model: model.trim() || null,
      serialNumber: serialNumber.trim() || null,
      barcode: barcode.trim() || null,

      categoryId,
      statusId,
      brandId,
      supplierId,
      locationId,
      departmentId,

      purchasePrice,
      purchaseDate: purchaseDate
        ? purchaseDate.toISOString()
        : new Date().toISOString(),
      effectiveDate: effectiveDate
        ? effectiveDate.toISOString()
        : new Date().toISOString(),
      warrantyMonths,
      description: description.trim() || null,
    };

    const payload: Partial<HardwareAssetObject> = {
      hardwareAssetDto,
      assetSpecCameraNvrDto: null,
      assetSpecDisplayProjectorDto: null,
      assetSpecNasStorageDto: null,
      assetSpecNetworkDeviceDto: null,
      assetSpecPrinterCopierDto: null,
    };

    if (activeSpecType === "network_device") {
      payload.assetSpecNetworkDeviceDto = {
        id: (specs.id as string) || undefined,
        hardwareAssetId: id,
        deviceType: specs.deviceType || "Core Switch Layer 3",
        firewallThroughput: specs.firewallThroughput || "",
        ipsThroughput: specs.ipsThroughput || "",
        vpnThroughput: specs.vpnThroughput || "",
        concurrentSessions: Number(specs.concurrentSessions) || 0,
        portCount: Number(specs.portCount) || 0,
        portSpeed: specs.portSpeed || specs.networkSpeed || "",
        uplinkPorts: specs.uplinkPorts || "",
        antennaSpec: specs.antennaSpec || "",
        concurrentUsersLimit: Number(specs.concurrentUsersLimit) || 0,
        maxVlans: Number(specs.maxVlans) || 0,
        isPoeSupported: Boolean(specs.isPoeSupported),
        powerConsumptionW: Number(specs.powerConsumptionW) || 0,

        // Lowercase compatibility
        hardwareassetid: id,
        devicetype: specs.deviceType || "Core Switch Layer 3",
        firewallthroughput: specs.firewallThroughput || "",
        ipsthroughput: specs.ipsThroughput || "",
        vpnthroughput: specs.vpnThroughput || "",
        concurrentsessions: Number(specs.concurrentSessions) || 0,
        portcount: Number(specs.portCount) || 0,
        portspeed: specs.portSpeed || specs.networkSpeed || "",
        uplinkports: specs.uplinkPorts || "",
        antennaspec: specs.antennaSpec || "",
        concurrentuserslimit: Number(specs.concurrentUsersLimit) || 0,
        maxvlans: Number(specs.maxVlans) || 0,
        ispoesupported: Boolean(specs.isPoeSupported),
        powerconsumptionw: Number(specs.powerConsumptionW) || 0,
      };
    } else if (activeSpecType === "camera_nvr") {
      payload.assetSpecCameraNvrDto = {
        id: (specs.id as string) || undefined,
        hardwareAssetId: id,
        deviceType: specs.deviceType || "CAMERA",
        resolution: specs.resolution || "",
        sensorSize: specs.sensorSize || "",
        lensSize: specs.lensSize || "",
        irDistanceMeters: Number(specs.irDistanceMeters) || 0,
        compressionStandard: specs.compressionStandard || "",
        hasTwoWayAudio: Boolean(specs.hasTwoWayAudio),
        hasWdr: Boolean(specs.hasWdr),
        channelCount: Number(specs.channelCount) || 0,
        maxStorageTb: Number(specs.maxStorageTb) || 0,
        inputBandwidthMbps: Number(specs.inputBandwidthMbps) || 0,
        outputBandwidthMbps: Number(specs.outputBandwidthMbps) || 0,

        // Lowercase compatibility
        hardwareassetid: id,
        devicetype: specs.deviceType || "CAMERA",
        sensorsize: specs.sensorSize || "",
        lenssize: specs.lensSize || "",
        irdistancemeters: Number(specs.irDistanceMeters) || 0,
        compressionstandard: specs.compressionStandard || "",
        hastwowaudaio: Boolean(specs.hasTwoWayAudio),
        haswdr: Boolean(specs.hasWdr),
        channelcount: Number(specs.channelCount) || 0,
        maxstoragetb: Number(specs.maxStorageTb) || 0,
        inputbandwidthmbps: Number(specs.inputBandwidthMbps) || 0,
        outputbandwidthmbps: Number(specs.outputBandwidthMbps) || 0,
      };
    } else if (activeSpecType === "nas_storage") {
      payload.assetSpecNasStorageDto = {
        id: (specs.id as string) || undefined,
        hardwareAssetId: id,
        deviceType: specs.deviceType || "NAS",
        cpuProcessor: specs.cpuRam || "",
        installedRamGb: Number(specs.installedRamGb) || 0,
        maxRamSupportedGb: Number(specs.maxRamSupportedGb) || 0,
        installedCapacityTb: Number(specs.installedCapacity) || 0,
        maxSingleVolumeSizeTb: Number(specs.maxSingleVolumeSizeTb) || 0,
        cacheSlots: specs.cacheSlots || "",
        powerRatingVa: Number(specs.powerRatingVa) || 0,

        // Lowercase compatibility
        hardwareassetid: id,
        devicetype: specs.deviceType || "NAS",
        cpuprocessor: specs.cpuRam || "",
        installedramgb: Number(specs.installedRamGb) || 0,
        maxramsupportedgb: Number(specs.maxRamSupportedGb) || 0,
        installedcapacitytb: Number(specs.installedCapacity) || 0,
        maxsinglevolumesizetb: Number(specs.maxSingleVolumeSizeTb) || 0,
        cacheslots: specs.cacheSlots || "",
        powerratingva: Number(specs.powerRatingVa) || 0,
      };
    } else if (activeSpecType === "display_projector") {
      payload.assetSpecDisplayProjectorDto = {
        id: (specs.id as string) || undefined,
        hardwareAssetId: id,
        deviceType: specs.deviceType || resolvedSubType,
        displayType: specs.panelType || "",
        screenSizeInches: Number(specs.screenSize) || 0,
        resolution: specs.resolution || "",
        refreshRateHz: Number(specs.refreshRate) || 0,
        operatingSystem: specs.operatingSystem || "",
        brightnessAnsiLumens: Number(specs.brightnessLumens) || 0,
        contrastRatio: specs.contrastRatio || "",
        lampLifeHours: Number(specs.lampLifeHours) || 0,
        supportedPorts: specs.ports || "",

        // Lowercase compatibility
        hardwareassetid: id,
        devicetype: specs.deviceType || resolvedSubType,
        displaytype: specs.panelType || "",
        screensizeinches: Number(specs.screenSize) || 0,
        refreshratehz: Number(specs.refreshRate) || 0,
        operatingsystem: specs.operatingSystem || "",
        brightnessansilumens: Number(specs.brightnessLumens) || 0,
        contrastratio: specs.contrastRatio || "",
        lamplifehours: Number(specs.lampLifeHours) || 0,
        supportedports: specs.ports || "",
      };
    } else if (activeSpecType === "printer_copier") {
      payload.assetSpecPrinterCopierDto = {
        id: (specs.id as string) || undefined,
        hardwareAssetId: id,
        deviceType: specs.deviceType || "PRINTER",
        ipSetup: specs.ipSetup || "",
        maxPaperSize: specs.paperSizes || "",
        printSpeedPpm: Number(specs.printSpeed) || 0,
        printResolution: specs.printResolution || "",
        inkCartridgeType: specs.inkCartridgeType || "",
        drumLifePages: Number(specs.drumLifePages) || 0,
        lastInkRefillDate: specs.lastInkRefillDate || null,
        lastCleaningDate: specs.lastCleaningDate || null,
        shredStyle: specs.shredStyle || "",
        shredCapacitySheets: Number(specs.shredCapacitySheets) || 0,
        binCapacityLiters: Number(specs.binCapacityLiters) || 0,

        // Lowercase compatibility
        hardwareassetid: id,
        devicetype: specs.deviceType || "PRINTER",
        ipsetup: specs.ipSetup || "",
        maxpapersize: specs.paperSizes || "",
        printspeedppm: Number(specs.printSpeed) || 0,
        printresolution: specs.printResolution || "",
        inkcartridgetype: specs.inkCartridgeType || "",
        drumlifepages: Number(specs.drumLifePages) || 0,
        lastinkrefilldate: specs.lastInkRefillDate || null,
        lastcleaningdate: specs.lastCleaningDate || null,
        shredstyle: specs.shredStyle || "",
        shredcapacitysheets: Number(specs.shredCapacitySheets) || 0,
        bincapacityliters: Number(specs.binCapacityLiters) || 0,
      };
    }

    try {
      await updateMutation.mutateAsync({ id, request: payload });
      toast.success("Cập nhật thiết bị phần cứng thành công!");
      navigate("/thiet-bi-phan-cung");
    } catch (err: any) {
      console.error("Lỗi cập nhật thiết bị phần cứng:", err);
      const backendError = err?.response?.data;
      if (backendError?.errors) {
        const errorMessages = Object.entries(backendError.errors)
          .map(
            ([field, msgs]: [string, any]) =>
              `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
          )
          .join(" | ");
        toast.error(`Lỗi validation: ${errorMessages}`);
      } else {
        toast.error(
          backendError?.message ||
          backendError?.title ||
          "Có lỗi xảy ra khi cập nhật thiết bị"
        );
      }
    }
  }, [
    id,
    assetCode,
    name,
    model,
    serialNumber,
    barcode,
    categoryId,
    statusId,
    brandId,
    supplierId,
    locationId,
    departmentId,
    purchasePrice,
    purchaseDate,
    effectiveDate,
    warrantyMonths,
    description,
    specs,
    assetSubType,
    activeSpecType,
    updateMutation,
    navigate,
  ]);

  // Phím tắt Ctrl+S / Cmd+S để lưu cập nhật nhanh chóng
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const copyIdToClipboard = () => {
    if (id) {
      navigator.clipboard.writeText(id);
      toast.success("Đã sao chép ID vào bộ nhớ tạm");
    }
  };

  // Trang thái Đang tải dữ liệu (Loading Skeleton)
  if (isLoading) {
    return (
      <>
        <PageMeta
          title="Đang tải dữ liệu thiết bị... | AIMS"
          description="Đang tải dữ liệu cấu hình phần cứng"
        />
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-44 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-7 space-y-6">
              <div className="h-80 rounded-2xl bg-gray-200 dark:bg-gray-800" />
              <div className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="xl:col-span-5 space-y-6">
              <div className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Trạng thái Lỗi hoặc Không tìm thấy thiết bị
  if (isError || (!isLoading && !assetDetailResult)) {
    return (
      <>
        <PageMeta
          title="Không tìm thấy thiết bị | AIMS"
          description="Thiết bị phần cứng không tồn tại hoặc đã bị xóa"
        />
        <div className="p-4 sm:p-6 max-w-3xl mx-auto py-16">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Không tìm thấy thiết bị phần cứng
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Thiết bị phần cứng với mã định danh{" "}
              <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-mono text-gray-800 dark:text-gray-200">
                {id || "N/A"}
              </code>{" "}
              không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="text-xs font-medium"
              >
                Thử tải lại
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/thiet-bi-phan-cung")}
                className="text-xs font-semibold"
              >
                Quay lại danh sách
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title={`Chỉnh sửa: ${name || assetCode || "Thiết bị phần cứng"} | AIMS`}
        description="Cập nhật chi tiết cấu hình phần cứng, thông số kỹ thuật, bảo hành và phân bổ phòng ban"
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
          { name: "Chỉnh sửa thiết bị", path: `/thiet-bi-phan-cung/${id}/chinh-sua` },
          { name: "Thêm mới thiết bị", path: "/thiet-bi-phan-cung/tao-moi" },
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
              Chỉnh sửa: {assetCode || name || id}
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
                    {name || "Chỉnh sửa thiết bị phần cứng"}
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-mono">
                    {assetCode || "Mã: N/A"}
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {statusName || "Đang sử dụng"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>ID: <code className="font-mono text-[11px] text-gray-700 dark:text-gray-300">{id}</code></span>
                  <button
                    type="button"
                    onClick={copyIdToClipboard}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 transition"
                    title="Sao chép ID"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  {isFetching && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Đang đồng bộ...
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  refetch();
                  toast.info("Đã làm mới dữ liệu từ máy chủ");
                }}
                disabled={isFetching}
                className="text-xs font-medium"
              >
                <svg className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Tải lại
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
                disabled={isSaving}
                className="text-xs font-semibold shadow-xs"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {isSaving ? "Đang lưu..." : "Lưu cập nhật"}
                <kbd className="hidden lg:inline-block ml-2 px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono">Ctrl+S</kbd>
              </Button>
            </div>
          </div>
        </div>

        {/* 1. CHỌN LOẠI THIẾT BỊ PHẦN CỨNG */}
        <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                Phân loại thiết bị & Thông số Stored Procedure
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Chuyển đổi phân loại sẽ cập nhật biểu mẫu nhập thông số kỹ thuật chuyên biệt tương ứng.
              </p>
            </div>

            {/* Dropdown danh mục đầy đủ từ /asset-categories/select-list */}
            <div className="w-full sm:w-72">
              <Select
                options={categoryOptions.map((c) => ({ value: String(c.value), label: c.label }))}
                value={categoryId ? String(categoryId) : ""}
                placeholder="Chọn loại thiết bị..."
                onChange={handleCategoryChange}
                className="dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-xs h-9"
              />
            </div>
          </div>

          {/* 5 Thẻ chọn nhanh theo 5 Stored Procedures */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {HARDWARE_DEVICE_TYPES.map((type) => {
              const isSelected = activeSpecType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectCategoryType(type)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all text-xs relative overflow-hidden group ${
                    isSelected
                      ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-500/20"
                      : "border-gray-200/80 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg border ${type.color}`}>
                      {type.icon}
                    </div>
                    {isSelected && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    {type.label}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {type.sublabel}
                  </span>
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
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">2</span>
                  Thông tin định danh & Quản lý kho
                </h3>
                <span className="text-xs text-gray-400">Trường dấu (*) là bắt buộc</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mã tài sản */}
                <div>
                  <FieldLabel htmlFor="assetCode">
                    Mã tài sản quản lý (Asset Code) *
                  </FieldLabel>
                  <Input
                    id="assetCode"
                    type="text"
                    value={assetCode}
                    onChange={(e) => setAssetCode(e.target.value)}
                    placeholder="VD: SW-CORE-2026-01"
                    className="font-mono text-xs"
                  />
                </div>

                {/* Tên thiết bị */}
                <div>
                  <FieldLabel htmlFor="assetName">
                    Tên thiết bị phần cứng *
                  </FieldLabel>
                  <Input
                    id="assetName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Cisco Catalyst 9300-48P Switch"
                  />
                </div>

                {/* Model */}
                <div>
                  <FieldLabel htmlFor="model">Model / Phiên bản</FieldLabel>
                  <Input
                    id="model"
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="VD: C9300-48P-A"
                  />
                </div>

                {/* Phân loại con (Asset Sub Type) khớp 1:1 với Stored Procedure */}
                <div>
                  <FieldLabel>Phân loại con (Asset Sub Type)</FieldLabel>
                  <Select
                    options={(HARDWARE_CATEGORY_SUBTYPES[activeSpecType] || []).map((t) => ({
                      value: t.value,
                      label: t.label,
                    }))}
                    value={assetSubType}
                    onChange={(val) => setAssetSubType(val)}
                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>

                {/* Hãng sản xuất (Brand) */}
                <div>
                  <FieldLabel
                    rightAction={brandId ? <span className="text-[10px] text-gray-400 font-mono font-normal">#{brandId}</span> : null}
                  >
                    Hãng sản xuất (Brand) *
                  </FieldLabel>
                  <Select
                    options={brandOptions.map((b) => ({ value: String(b.value), label: b.label }))}
                    value={brandId ? String(brandId) : ""}
                    placeholder="Chọn thương hiệu..."
                    onChange={handleBrandChange}
                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>

                {/* Serial Number */}
                <div>
                  <FieldLabel htmlFor="serialNumber">
                    Số Serial / Service Tag *
                  </FieldLabel>
                  <Input
                    id="serialNumber"
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="VD: FOC22340B2Z"
                    className="font-mono"
                  />
                </div>

                {/* Mã vạch / QR Code */}
                <div>
                  <FieldLabel htmlFor="barcode">Mã vạch / QR Code (Barcode)</FieldLabel>
                  <Input
                    id="barcode"
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="VD: 893850100234"
                    className="font-mono"
                  />
                </div>

                {/* Trạng thái vận hành (Status) */}
                <div>
                  <FieldLabel
                    rightAction={statusId ? <span className="text-[10px] text-gray-400 font-mono font-normal">#{statusId}</span> : null}
                  >
                    Trạng thái vận hành *
                  </FieldLabel>
                  <Select
                    options={statusOptions.map((s) => ({ value: String(s.value), label: s.label }))}
                    value={statusId ? String(statusId) : ""}
                    placeholder="Chọn trạng thái..."
                    onChange={handleStatusChange}
                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* CARD: CẤU HÌNH KỸ THUẬT THÍCH ỨNG THEO 5 STORED PROCEDURES */}
            {(() => {
              const isNetwork = activeSpecType === "network_device";
              const isCamera = activeSpecType === "camera_nvr";
              const isNas = activeSpecType === "nas_storage";
              const isDisplay = activeSpecType === "display_projector";
              const isPrinter = activeSpecType === "printer_copier";

              const currentMatchedType = HARDWARE_DEVICE_TYPES.find((d) => d.id === activeSpecType);
              const currentSpName = currentMatchedType ? currentMatchedType.spName : null;
              const currentTypeLabel = currentMatchedType ? currentMatchedType.label : categoryName;

              return (
                <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center text-xs font-bold">⚙️</span>
                        Cấu hình kỹ thuật chuyên sâu ({currentTypeLabel})
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Chuẩn hóa cấu hình theo phân loại thiết bị phần cứng {currentSpName ? `(${currentSpName})` : ""}
                      </p>
                    </div>
                  </div>

                  {/* 1. Form specs cho THIẾT BỊ MẠNG */}
                  {isNetwork && (
                    <div className="space-y-5">
                      {/* Nhóm 1: Định danh thiết bị & Cổng mạng */}
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-1.5">
                          <span>🔀</span>
                          <span>1. Định danh & Cổng giao tiếp mạng (Port Specifications)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <FieldLabel>Phân loại thiết bị mạng (Device Type) *</FieldLabel>
                            <Input
                              type="text"
                              value={specs.deviceType || ""}
                              onChange={(e) => setSpecs({ ...specs, deviceType: e.target.value })}
                              placeholder="VD: Core Switch Layer 3, Router Gateway, Next-Gen Firewall..."
                            />
                          </div>
                          <div>
                            <FieldLabel>Số lượng cổng mạng (Port Count)</FieldLabel>
                            <Input
                              type="number"
                              min={0}
                              value={specs.portCount ?? ""}
                              onChange={(e) => setSpecs({ ...specs, portCount: e.target.value ? Number(e.target.value) : 0 })}
                              placeholder="VD: 24, 48, 8"
                            />
                          </div>
                          <div>
                            <FieldLabel>Tốc độ cổng mạng (Port Speed)</FieldLabel>
                            <Input
                              type="text"
                              value={specs.portSpeed ?? specs.networkSpeed ?? ""}
                              onChange={(e) => setSpecs({ ...specs, portSpeed: e.target.value, networkSpeed: e.target.value })}
                              placeholder="VD: 480 Gbps Stacking / 10 Gbps SFP+"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <FieldLabel>Cổng Uplink kết nối quang/đồng (Uplink Ports)</FieldLabel>
                            <Input
                              type="text"
                              value={specs.uplinkPorts || ""}
                              onChange={(e) => setSpecs({ ...specs, uplinkPorts: e.target.value })}
                              placeholder="VD: 4x 10G SFP+ Uplink / 2x 40G QSFP+ / 4"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Nhóm 2: Cấp nguồn PoE & Điện năng */}
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-1.5">
                          <span>⚡</span>
                          <span>2. Cấp nguồn qua mạng (PoE) & Điện năng tiêu thụ</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <FieldLabel>Cấp nguồn qua mạng (PoE)</FieldLabel>
                            <label
                              htmlFor="isPoeSupported"
                              className="flex items-center gap-3 px-3.5 h-[42px] rounded-xl border border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/40 cursor-pointer hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition"
                            >
                              <input
                                id="isPoeSupported"
                                type="checkbox"
                                checked={Boolean(specs.isPoeSupported)}
                                onChange={(e) => setSpecs({ ...specs, isPoeSupported: e.target.checked })}
                                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                              />
                              <div className="text-xs">
                                <span className="font-medium text-gray-800 dark:text-gray-200">Hỗ trợ cấp nguồn PoE</span>
                                <span className="text-[11px] text-gray-400 font-normal ml-1.5">(Camera, AP, Phone IP)</span>
                              </div>
                            </label>
                          </div>
                          <div>
                            <FieldLabel>Công suất tiêu thụ (Power Consumption)</FieldLabel>
                            <div className="relative">
                              <Input
                                type="number"
                                min={0}
                                value={specs.powerConsumptionW ?? ""}
                                onChange={(e) => setSpecs({ ...specs, powerConsumptionW: e.target.value ? Number(e.target.value) : 0 })}
                                placeholder="VD: 18, 370, 740, 65"
                              />
                              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">Watts (W)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Nhóm 3: Băng thông & Hiệu năng bảo mật */}
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-1.5">
                          <span>🛡️</span>
                          <span>3. Băng thông xử lý & Bảo mật (Firewall, IPS, VPN)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <FieldLabel>Băng thông Tường lửa (Firewall Throughput)</FieldLabel>
                            <Input
                              type="text"
                              value={specs.firewallThroughput || ""}
                              onChange={(e) => setSpecs({ ...specs, firewallThroughput: e.target.value })}
                              placeholder="VD: 2 Gbps / 10 Gbps"
                            />
                          </div>
                          <div>
                            <FieldLabel>Băng thông IPS / IDS (IPS Throughput)</FieldLabel>
                            <Input
                              type="text"
                              value={specs.ipsThroughput || ""}
                              onChange={(e) => setSpecs({ ...specs, ipsThroughput: e.target.value })}
                              placeholder="VD: 1.5 Gbps / 4 Gbps"
                            />
                          </div>
                          <div>
                            <FieldLabel>Băng thông VPN (VPN Throughput)</FieldLabel>
                            <Input
                              type="text"
                              value={specs.vpnThroughput || ""}
                              onChange={(e) => setSpecs({ ...specs, vpnThroughput: e.target.value })}
                              placeholder="VD: 500 Mbps / 1.5 Gbps"
                            />
                          </div>
                          <div>
                            <FieldLabel>Số phiên đồng thời (Concurrent Sessions)</FieldLabel>
                            <Input
                              type="number"
                              min={0}
                              value={specs.concurrentSessions ?? ""}
                              onChange={(e) => setSpecs({ ...specs, concurrentSessions: e.target.value ? Number(e.target.value) : 0 })}
                              placeholder="VD: 100000, 500000"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Nhóm 4: Mở rộng VLAN & Wi-Fi Access Point */}
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-xs font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-1.5">
                          <span>📶</span>
                          <span>4. Cấu hình mạng mở rộng VLAN & Điểm phát sóng Wi-Fi (AP)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <FieldLabel>Số lượng VLAN tối đa (Max VLANs)</FieldLabel>
                            <Input
                              type="number"
                              min={0}
                              value={specs.maxVlans ?? ""}
                              onChange={(e) => setSpecs({ ...specs, maxVlans: e.target.value ? Number(e.target.value) : 0 })}
                              placeholder="VD: 4094, 256"
                            />
                          </div>
                          <div>
                            <FieldLabel>Người dùng đồng thời tối đa (User Limit)</FieldLabel>
                            <Input
                              type="number"
                              min={0}
                              value={specs.concurrentUsersLimit ?? ""}
                              onChange={(e) => setSpecs({ ...specs, concurrentUsersLimit: e.target.value ? Number(e.target.value) : 0 })}
                              placeholder="VD: 256, 512, 1024"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <FieldLabel>Thông số Anten Wi-Fi (Antenna Spec)</FieldLabel>
                            <Input
                              type="text"
                              value={specs.antennaSpec || ""}
                              onChange={(e) => setSpecs({ ...specs, antennaSpec: e.target.value })}
                              placeholder="VD: 4x4 MU-MIMO Internal Antennas 5dBi"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Form specs cho CAMERA & ĐẦU GHI */}
                  {isCamera && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Loại thiết bị (Device Type) *</FieldLabel>
                          <Select
                            options={[
                              { value: "DOME_CAM", label: "DOME_CAM - Camera Bán Cầu (Dome)" },
                              { value: "BULLET_CAM", label: "BULLET_CAM - Camera Thân Trụ (Bullet)" },
                              { value: "OMNI_CAM", label: "OMNI_CAM - Camera Toàn Cảnh 360° / PTZ" },
                              { value: "NVR", label: "NVR - Đầu Ghi Hình Mạng (Network Video Recorder)" },
                              { value: "DVR", label: "DVR - Đầu Ghi Hình Kỹ Thuật Số (Digital Video Recorder)" },
                            ]}
                            value={String(specs.deviceType || "DOME_CAM")}
                            onChange={(val) => setSpecs({ ...specs, deviceType: val })}
                            className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                          />
                        </div>
                        <div>
                          <FieldLabel>Độ phân giải (Resolution)</FieldLabel>
                          <Input
                            type="text"
                            value={specs.resolution || ""}
                            onChange={(e) => setSpecs({ ...specs, resolution: e.target.value })}
                            placeholder="VD: 2.0MP, 4MP, 4K (3840x2160)"
                          />
                        </div>
                        <div>
                          <FieldLabel>Kích thước cảm biến (Sensor Size)</FieldLabel>
                          <Input
                            type="text"
                            value={specs.sensorSize || ""}
                            onChange={(e) => setSpecs({ ...specs, sensorSize: e.target.value })}
                            placeholder="VD: 1/3 inch CMOS, 1/2.8 inch CMOS"
                          />
                        </div>
                        <div>
                          <FieldLabel>Kích thước ống kính (Lens Size)</FieldLabel>
                          <Input
                            type="text"
                            value={specs.lensSize || ""}
                            onChange={(e) => setSpecs({ ...specs, lensSize: e.target.value })}
                            placeholder="VD: 2.8mm, 4mm, 6mm"
                          />
                        </div>
                        <div>
                          <FieldLabel>Tầm xa hồng ngoại (IR Distance)</FieldLabel>
                          <div className="relative">
                            <Input
                              type="number"
                              value={specs.irDistanceMeters ?? ""}
                              onChange={(e) => setSpecs({ ...specs, irDistanceMeters: e.target.value ? Number(e.target.value) : null })}
                              placeholder="30"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">mét</span>
                          </div>
                        </div>
                        <div>
                          <FieldLabel>Chuẩn nén hình ảnh (Compression Standard)</FieldLabel>
                          <Input
                            type="text"
                            value={specs.compressionStandard || ""}
                            onChange={(e) => setSpecs({ ...specs, compressionStandard: e.target.value })}
                            placeholder="VD: H.265+, S+265, H.264"
                          />
                        </div>
                      </div>

                      {/* Nhóm 2: Thông số Đầu ghi NVR / DVR & Băng thông */}
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Số kênh đầu ghi (Channel Count)</FieldLabel>
                          <Input
                            type="number"
                            value={specs.channelCount ?? ""}
                            onChange={(e) => setSpecs({ ...specs, channelCount: e.target.value ? Number(e.target.value) : null })}
                            placeholder="VD: 16, 32, 40 kênh"
                          />
                        </div>
                        <div>
                          <FieldLabel>Lưu trữ tối đa (Max Storage)</FieldLabel>
                          <div className="relative">
                            <Input
                              type="number"
                              value={specs.maxStorageTb ?? ""}
                              onChange={(e) => setSpecs({ ...specs, maxStorageTb: e.target.value ? Number(e.target.value) : null })}
                              placeholder="VD: 16, 32, 64"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">TB</span>
                          </div>
                        </div>
                        <div>
                          <FieldLabel>Băng thông vào (Input Bandwidth)</FieldLabel>
                          <div className="relative">
                            <Input
                              type="number"
                              value={specs.inputBandwidthMbps ?? ""}
                              onChange={(e) => setSpecs({ ...specs, inputBandwidthMbps: e.target.value ? Number(e.target.value) : null })}
                              placeholder="VD: 160"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">Mbps</span>
                          </div>
                        </div>
                        <div>
                          <FieldLabel>Băng thông ra (Output Bandwidth)</FieldLabel>
                          <div className="relative">
                            <Input
                              type="number"
                              value={specs.outputBandwidthMbps ?? ""}
                              onChange={(e) => setSpecs({ ...specs, outputBandwidthMbps: e.target.value ? Number(e.target.value) : null })}
                              placeholder="VD: 160"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">Mbps</span>
                          </div>
                        </div>
                      </div>

                      {/* Nhóm 3: Tính năng bổ trợ */}
                      <div className="pt-2 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                          <input
                            id="hasTwoWayAudio"
                            type="checkbox"
                            checked={Boolean(specs.hasTwoWayAudio)}
                            onChange={(e) => setSpecs({ ...specs, hasTwoWayAudio: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                          />
                          <label htmlFor="hasTwoWayAudio" className="text-[11px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            Hỗ trợ đàm thoại 2 chiều / Tích hợp Micro (HasTwoWayAudio)
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id="hasWdr"
                            type="checkbox"
                            checked={Boolean(specs.hasWdr)}
                            onChange={(e) => setSpecs({ ...specs, hasWdr: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                          />
                          <label htmlFor="hasWdr" className="text-[11px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            Hỗ trợ chống ngược sáng BLC/WDR (HasWdr)
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Form specs cho LƯU TRỮ NAS & SAN */}
                  {isNas && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Số khay ổ cứng (Drive Bays)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.driveBays || ""}
                          onChange={(e) => setSpecs({ ...specs, driveBays: e.target.value })}
                          placeholder="VD: 4-Bay / 8-Bay / 12-Bay Hot-swap SAS/SATA"
                        />
                      </div>
                      <div>
                        <FieldLabel>Cấu hình RAID dữ liệu (RAID Type)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.raidType || ""}
                          onChange={(e) => setSpecs({ ...specs, raidType: e.target.value })}
                          placeholder="VD: RAID 5 / RAID 6 / RAID 10 / Synology SHR"
                        />
                      </div>
                      <div>
                        <FieldLabel>Dung lượng đã lắp đặt (Installed Capacity)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.installedCapacity || ""}
                          onChange={(e) => setSpecs({ ...specs, installedCapacity: e.target.value })}
                          placeholder="VD: 32TB (4x 8TB Seagate IronWolf Pro)"
                        />
                      </div>
                      <div>
                        <FieldLabel>Dung lượng tối đa hỗ trợ (Max Capacity)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.maxCapacity || ""}
                          onChange={(e) => setSpecs({ ...specs, maxCapacity: e.target.value })}
                          placeholder="VD: 128TB Raw Storage / Mở rộng qua DX517"
                        />
                      </div>
                      <div>
                        <FieldLabel>Cấu hình CPU & RAM cache (CPU & RAM)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.cpuRam || ""}
                          onChange={(e) => setSpecs({ ...specs, cpuRam: e.target.value })}
                          placeholder="VD: AMD Ryzen V1500B Quad-Core, 16GB DDR4 ECC"
                        />
                      </div>
                      <div>
                        <FieldLabel>Cổng giao tiếp mạng (Network Ports)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.networkPorts || ""}
                          onChange={(e) => setSpecs({ ...specs, networkPorts: e.target.value })}
                          placeholder="VD: 2x 10GbE SFP+ & 2x 1GbE RJ-45"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 flex items-center gap-2 pt-1">
                        <input
                          id="redundantPower"
                          type="checkbox"
                          checked={Boolean(specs.redundantPower)}
                          onChange={(e) => setSpecs({ ...specs, redundantPower: e.target.checked })}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                        />
                        <label htmlFor="redundantPower" className="text-[11px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          Trang bị bộ nguồn dự phòng kép Redundant PSU (Hot-swappable)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 4. Form specs cho MÀN HÌNH & MÁY CHIẾU */}
                  {isDisplay && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Kích thước màn hình / Khung chiếu (Screen Size)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.screenSize || ""}
                          onChange={(e) => setSpecs({ ...specs, screenSize: e.target.value })}
                          placeholder="VD: 27 inch / 32 inch / 120 inch máy chiếu"
                        />
                      </div>
                      <div>
                        <FieldLabel>Độ phân giải hiển thị (Resolution)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.resolution || ""}
                          onChange={(e) => setSpecs({ ...specs, resolution: e.target.value })}
                          placeholder="VD: 4K UHD (3840 x 2160) / 2K QHD / Full HD"
                        />
                      </div>
                      <div>
                        <FieldLabel>Tần số quét màn hình (Refresh Rate)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.refreshRate || ""}
                          onChange={(e) => setSpecs({ ...specs, refreshRate: e.target.value })}
                          placeholder="VD: 60Hz / 75Hz / 120Hz / 144Hz"
                        />
                      </div>
                      <div>
                        <FieldLabel>Tấm nền / Công nghệ chiếu (Panel Type)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.panelType || ""}
                          onChange={(e) => setSpecs({ ...specs, panelType: e.target.value })}
                          placeholder="VD: IPS Black 100% sRGB / OLED / DLP Laser 3LCD"
                        />
                      </div>
                      <div>
                        <FieldLabel>Độ sáng hiển thị (Brightness / Lumens)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.brightnessLumens || ""}
                          onChange={(e) => setSpecs({ ...specs, brightnessLumens: e.target.value })}
                          placeholder="VD: 350 cd/m2 / 4000 ANSI Lumens máy chiếu"
                        />
                      </div>
                      <div>
                        <FieldLabel>Tỷ lệ khung hình / Tỷ lệ chiếu (Projection Ratio)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.projectionRatio || ""}
                          onChange={(e) => setSpecs({ ...specs, projectionRatio: e.target.value })}
                          placeholder="VD: 16:9 tiêu chuẩn / Tỷ lệ chiếu gần 1.2:1"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <FieldLabel>Cổng kết nối tín hiệu (Ports)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.ports || ""}
                          onChange={(e) => setSpecs({ ...specs, ports: e.target.value })}
                          placeholder="VD: HDMI 2.1, DisplayPort 1.4, USB-C 90W PD, Thunderbolt 4"
                        />
                      </div>
                    </div>
                  )}

                  {/* 5. Form specs cho MÁY IN & PHOTOCOPY */}
                  {isPrinter && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Công nghệ in ấn (Print Technology)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.printTechnology || ""}
                          onChange={(e) => setSpecs({ ...specs, printTechnology: e.target.value })}
                          placeholder="VD: Laser đen trắng đa năng (MFP) / Laser màu / In phun liên tục"
                        />
                      </div>
                      <div>
                        <FieldLabel>Chức năng vận hành (Functions)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.functions || ""}
                          onChange={(e) => setSpecs({ ...specs, functions: e.target.value })}
                          placeholder="VD: Đa chức năng: In - Quét (Scan) - Sao chụp (Copy) - Fax"
                        />
                      </div>
                      <div>
                        <FieldLabel>Khổ giấy hỗ trợ (Paper Sizes)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.paperSizes || ""}
                          onChange={(e) => setSpecs({ ...specs, paperSizes: e.target.value })}
                          placeholder="VD: A4, A3, Legal, Letter, Envelopes"
                        />
                      </div>
                      <div>
                        <FieldLabel>Tốc độ in / copy (Print Speed)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.printSpeed || ""}
                          onChange={(e) => setSpecs({ ...specs, printSpeed: e.target.value })}
                          placeholder="VD: 35 trang/phút (ppm) / 45 ppm"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <FieldLabel>Cổng kết nối & Giao tiếp (Connectivity)</FieldLabel>
                        <Input
                          type="text"
                          value={specs.connectivity || ""}
                          onChange={(e) => setSpecs({ ...specs, connectivity: e.target.value })}
                          placeholder="VD: LAN Gigabit RJ-45, WiFi 802.11ac, USB 3.0, Apple AirPrint"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2 flex flex-wrap items-center gap-6 pt-1">
                        <div className="flex items-center gap-2">
                          <input
                            id="duplex"
                            type="checkbox"
                            checked={Boolean(specs.duplex)}
                            onChange={(e) => setSpecs({ ...specs, duplex: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                          />
                          <label htmlFor="duplex" className="text-[11px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            In 2 mặt tự động (Auto Duplex)
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id="colorPrinting"
                            type="checkbox"
                            checked={Boolean(specs.colorPrinting)}
                            onChange={(e) => setSpecs({ ...specs, colorPrinting: e.target.checked })}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 cursor-pointer"
                          />
                          <label htmlFor="colorPrinting" className="text-[11px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            Hỗ trợ in màu (Color Printing)
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback khi không thuộc 5 danh mục chuyên biệt */}
                  {!isNetwork && !isCamera && !isNas && !isDisplay && !isPrinter && (
                    <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 text-center py-6">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Danh mục này không nằm trong 5 danh mục phần cứng chuyên biệt (Mạng, Camera/NVR, NAS, Màn hình/Máy chiếu, Máy in/Photo).
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* CARD: PHÂN BỔ, VỊ TRÍ & TÀI CHÍNH */}
            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
                Phân bổ sử dụng & Vị trí vật lý
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FieldLabel
                    rightAction={departmentId ? <span className="text-[10px] text-gray-400 font-mono font-normal">#{departmentId}</span> : null}
                  >
                    Phòng ban sử dụng
                  </FieldLabel>
                  <Select
                    options={departmentOptions.map((d) => ({ value: String(d.value), label: d.label }))}
                    value={departmentId ? String(departmentId) : ""}
                    placeholder="Chọn phòng ban..."
                    onChange={handleDepartmentChange}
                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>

                <div>
                  <FieldLabel>Người sử dụng / Phụ trách</FieldLabel>
                  <Input
                    type="text"
                    value={assignedToUser}
                    onChange={(e) => setAssignedToUser(e.target.value)}
                    placeholder="VD: Nguyễn Văn A (Dev Lead)"
                  />
                </div>

                <div>
                  <FieldLabel
                    rightAction={locationId ? <span className="text-[10px] text-gray-400 font-mono font-normal">#{locationId}</span> : null}
                  >
                    Vị trí / Chi nhánh kho
                  </FieldLabel>
                  <Select
                    options={locationOptions.map((l) => ({ value: String(l.value), label: l.label }))}
                    value={locationId ? String(locationId) : ""}
                    placeholder="Chọn vị trí kho..."
                    onChange={handleLocationChange}
                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>

              {/* Tài chính & Bảo hành */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <FieldLabel>Giá vốn mua vào (VNĐ)</FieldLabel>
                  <Input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <FieldLabel
                    rightAction={
                      <div className="flex gap-1 shrink-0">
                        {[12, 24, 36, 60].map((m) => (
                          <button
                            type="button"
                            key={m}
                            onClick={() => setWarrantyMonths(m)}
                            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                              warrantyMonths === m
                                ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                                : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {m}T
                          </button>
                        ))}
                      </div>
                    }
                  >
                    Bảo hành (tháng)
                  </FieldLabel>
                  <Input
                    type="number"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(Number(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <FieldLabel
                    rightAction={supplierId ? <span className="text-[10px] text-gray-400 font-mono font-normal">#{supplierId}</span> : null}
                  >
                    Nhà cung cấp
                  </FieldLabel>
                  <Select
                    options={supplierOptions.map((s) => ({ value: String(s.value), label: s.label }))}
                    value={supplierId ? String(supplierId) : ""}
                    placeholder="Chọn nhà cung cấp..."
                    onChange={handleSupplierChange}
                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div className="pt-2">
                <FieldLabel>Mô tả / Ghi chú bàn giao</FieldLabel>
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
                    {statusName || "Đang sử dụng"}
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
                      {brandName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Danh mục</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {categoryName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Phòng ban</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {departmentName || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Vị trí</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {locationName || "—"}
                    </span>
                  </div>
                </div>

                {/* Tóm tắt Specs thực tế theo loại thiết bị */}
                {liveSpecSummary && (
                  <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 block">
                      Thông số kỹ thuật chính:
                    </span>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {liveSpecSummary}
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

              {/* CARD THÔNG TIN HỆ THỐNG / AUDIT */}
              <div className="p-3.5 rounded-xl border border-gray-200/70 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-xs space-y-2">
                <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                  <span>Thông tin bản ghi</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-mono">
                    ONLINE
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Mã định danh ID:</span>
                    <span className="font-mono text-gray-800 dark:text-gray-200 truncate max-w-[170px]" title={id}>
                      {id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phân loại cấu hình:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 uppercase">
                      {activeSpecType}
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
                  disabled={isSaving}
                  className="w-full justify-center text-sm font-semibold shadow-xs"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {isSaving ? "Đang lưu cập nhật..." : "Lưu cập nhật thiết bị"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditHardwareAssetPage;
