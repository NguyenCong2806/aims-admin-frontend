import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";

import PageMeta from "../../../components/common/PageMeta";
import AimsModuleNav from "../../../components/aims/AimsModuleNav";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";

import {
  hardwareassetdto,
  assetSpecnasstoragedto,
  assetspecdisplayprojectordto,
  assetspecnetworkdevicedto,
  assetspeccameranvrdto,
  assetspecprintercopierdto,
  hardwareassetobject,
} from "../models/hardwareAsset";
import {
  hardwareassetSchema,
  assetSpecNasStorageSchema,
  assetSpecDisplayProjectorSchema,
  assetSpecNetworkDeviceSchema,
  assetSpecCameraNvrSchema,
  assetSpecPrinterCopierSchema,
} from "../../../validations/hardwareasset.schema";
import {
  useHardwareById,
  useAddHardware,
  useUpdateHardware,
} from "../queries/hardwareQuery";
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
import { formatCurrency, generateGuid } from "../../../helpper";

// Helper nhận diện nhanh loại thiết bị từ chuỗi danh mục hoặc assetSubType
const getDeviceTypeIdFromCategory = (catName: string): string => {
  const lower = (catName || "").toLowerCase();
  if (lower.includes("server") || lower.includes("máy chủ") || lower.includes("nas") || lower.includes("lưu trữ")) return "server";
  if (lower.includes("monitor") || lower.includes("màn hình") || lower.includes("chiếu") || lower.includes("projector") || lower.includes("display")) return "monitor";
  if (lower.includes("printer") || lower.includes("máy in") || lower.includes("photo") || lower.includes("scan") || lower.includes("hủy") || lower.includes("copier")) return "printer";
  if (lower.includes("camera") || lower.includes("nvr") || lower.includes("đầu ghi") || lower.includes("cam")) return "camera";
  if (lower.includes("network") || lower.includes("mạng") || lower.includes("an ninh") || lower.includes("switch") || lower.includes("router") || lower.includes("firewall")) return "network";
  return "server";
};

// Helper chuẩn hóa mã phân loại con (assetSubType) gửi lên backend tương ứng với loại đang chọn
const getAssetSubType = (deviceTypeId: string): string => {
  switch (deviceTypeId) {
    case "server":
      return "NAS";
    case "monitor":
      return "PC_MONITOR";
    case "network":
      return "FIREWALL";
    case "camera":
      return "CAMERA";
    case "printer":
      return "PRINTER";
    default:
      return deviceTypeId.toUpperCase();
  }
};

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
  const addMutation = useAddHardware();
  const updateMutation = useUpdateHardware();
  const { data: detailResult, isLoading: isLoadingDetail } = useHardwareById(isEdit && id ? id : null);

  // 1. State biểu mẫu chính (hardwareassetdto) - Tất cả các ID khóa ngoại là string
  const [assetCode, setAssetCode] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [serialNumber, setSerialNumber] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");

  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedDeviceTypeId, setSelectedDeviceTypeId] = useState<string>("server");

  const [statusId, setStatusId] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");

  const [purchasePrice, setPurchasePrice] = useState<number>(15000000);
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(new Date());
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(new Date());
  const [warrantyMonths, setWarrantyMonths] = useState<number>(36);
  const [description, setDescription] = useState<string>("");

  // State lưu trữ lỗi validate từng trường (hiển thị chữ đỏ dưới ô nhập)
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Tên hiển thị động tra cứu từ select-list của Lookups (không lưu trong DTO)
  const categoryName = useMemo(() => {
    return categorySelectList?.find((c) => String(c.key) === categoryId)?.value || "";
  }, [categorySelectList, categoryId]);

  const brandName = useMemo(() => {
    return brandSelectList?.find((b) => String(b.key) === brandId)?.value || "—";
  }, [brandSelectList, brandId]);

  const statusName = useMemo(() => {
    return statusSelectList?.find((s) => String(s.key) === statusId)?.value || "—";
  }, [statusSelectList, statusId]);

  const departmentName = useMemo(() => {
    return departmentSelectList?.find((d) => String(d.key) === departmentId)?.value || "Chưa phân bổ";
  }, [departmentSelectList, departmentId]);

  const locationName = useMemo(() => {
    return locationSelectList?.find((l) => String(l.key) === locationId)?.value || "—";
  }, [locationSelectList, locationId]);

  const supplierName = useMemo(() => {
    return supplierSelectList?.find((s) => String(s.key) === supplierId)?.value || "—";
  }, [supplierSelectList, supplierId]);

  // 2. State các thông số kỹ thuật con (Child DTOs)
  // 2.1 NAS Storage / Server (assetSpecnasstoragedto)
  const [nasStorageSpec, setNasStorageSpec] = useState<assetSpecnasstoragedto>({
    id: "",
    hardwareassetid: "",
    devicetype: "NAS_STORAGE",
    cpuprocessor: "Dual Intel Xeon Silver 4314 (32 Cores)",
    installedramgb: 128,
    maxramsupportedgb: 512,
    drivebayscount: 8,
    installedcapacitytb: 16,
    maxsinglevolumetb: 108,
    cacheslots: "2x M.2 NVMe SSD 800GB",
    powerratingva: 800,
  });

  // 2.2 Màn hình & Máy chiếu (assetspecdisplayprojectordto)
  const [displaySpec, setDisplaySpec] = useState<assetspecdisplayprojectordto>({
    id: "",
    hardwareassetid: "",
    devicetype: "DISPLAY_PROJECTOR",
    displaytype: "IPS Black Anti-Glare",
    screensizeinches: 27,
    resolution: "3840 x 2160 (4K UHD)",
    refreshratehz: 60,
    operatingsystem: "None",
    brightnessansilumens: 400,
    contrastratio: "2000:1",
    lampLifehours: 30000,
    supportedports: "HDMI 2.1, DisplayPort 1.4, USB-C 90W PD, RJ45",
  });

  // 2.3 Thiết bị mạng & An ninh (assetspecnetworkdevicedto)
  const [networkSpec, setNetworkSpec] = useState<assetspecnetworkdevicedto>({
    id: "",
    hardwareassetid: "",
    devicetype: "NETWORK_DEVICE",
    firewallthroughput: "10 Gbps",
    ipsthroughput: "2.5 Gbps",
    vpnthroughput: "3.5 Gbps",
    concurrentsessions: 1000000,
    portcount: 24,
    portspeed: "10/100/1000Mbps",
    uplinkports: "4x 10G SFP+",
    antennaspec: "MIMO 3x3",
    concurrentuserslimit: "500",
    maxvlans: 4094,
    ispoesupported: true,
    powerconsumptionw: 370,
  });

  // 2.4 Camera giám sát & Đầu ghi NVR (assetspeccameranvrdto)
  const [cameraSpec, setCameraSpec] = useState<assetspeccameranvrdto>({
    id: "",
    hardwareassetid: "",
    devicetype: "CAMERA_NVR",
    resolution: "4K (3840 x 2160) - 8MP",
    sensorsize: "1/2.8 inch CMOS",
    lenssize: "4mm Fixed Lens",
    irdistancemeters: 50,
    compressionstandard: "H.265+ / H.264",
    hastwowayaudio: true,
    haswdr: true,
    channelcount: 16,
    maxstoragetb: 20,
    inputbandwidthmbps: 160,
    outputbandwidthmbps: 160,
  });

  // 2.5 Máy in / Photocopy / Máy hủy tài liệu (assetspecprintercopierdto)
  const [printerSpec, setPrinterSpec] = useState<assetspecprintercopierdto>({
    id: "",
    hardwareassetid: "",
    devicetype: "Laser Printer",
    ipsetup: "192.168.1.150",
    maxpapersize: "A4",
    printspeedppm: 38,
    printresolution: "1200",
    inkcartridgetype: "HP 76A",
    drumlifepages: 30000,
    lastinkrefilldate: new Date(),
    lastcleaningdate: new Date(),
    shredstyle: "N/A",
    shredcapacitysheets: 0,
    bincapacityliters: 0,
  });

  // Tự động đồng bộ ID ban đầu từ Select-List API của Lookups nếu tạo mới
  useEffect(() => {
    if (!isEdit && categorySelectList?.length && !categoryId) {
      const match = categorySelectList.find((c) =>
        c.value.toLowerCase().includes("máy chủ") ||
        c.value.toLowerCase().includes("server") ||
        c.value.toLowerCase().includes("chuyển mạch")
      );
      if (match) {
        setCategoryId(String(match.key));
        setSelectedDeviceTypeId("server");
      } else if (categorySelectList[0]) {
        setCategoryId(String(categorySelectList[0].key));
      }
    }
  }, [categorySelectList, categoryId, isEdit]);

  useEffect(() => {
    if (!isEdit && brandSelectList?.length && !brandId) {
      const match = brandSelectList.find((b) => b.value.toLowerCase().includes("dell") || b.value.toLowerCase().includes("cisco"));
      if (match) {
        setBrandId(String(match.key));
      } else if (brandSelectList[0]) {
        setBrandId(String(brandSelectList[0].key));
      }
    }
  }, [brandSelectList, brandId, isEdit]);

  useEffect(() => {
    if (!isEdit && statusSelectList?.length && !statusId) {
      const match = statusSelectList.find((s) => s.value.toLowerCase().includes("sẵn sàng") || s.value.toLowerCase().includes("sử dụng"));
      if (match) {
        setStatusId(String(match.key));
      } else if (statusSelectList[0]) {
        setStatusId(String(statusSelectList[0].key));
      }
    }
  }, [statusSelectList, statusId, isEdit]);

  useEffect(() => {
    if (!isEdit && departmentSelectList?.length && !departmentId) {
      if (departmentSelectList[0]) {
        setDepartmentId(String(departmentSelectList[0].key));
      }
    }
  }, [departmentSelectList, departmentId, isEdit]);

  useEffect(() => {
    if (!isEdit && locationSelectList?.length && !locationId) {
      if (locationSelectList[0]) {
        setLocationId(String(locationSelectList[0].key));
      }
    }
  }, [locationSelectList, locationId, isEdit]);

  useEffect(() => {
    if (!isEdit && supplierSelectList?.length && !supplierId) {
      if (supplierSelectList[0]) {
        setSupplierId(String(supplierSelectList[0].key));
      }
    }
  }, [supplierSelectList, supplierId, isEdit]);

  // Load chi tiết nếu ở chế độ Chỉnh sửa
  useEffect(() => {
    if (isEdit && detailResult) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = detailResult as any;
      const root = raw?.data?.data || raw?.data || raw;
      const main = root?.hardwareAssetDto || root?.hardwareassetdto || root;

      if (!main) return;

      setAssetCode(main.assetCode || main.assetcode || "");
      setName(main.name || "");
      setModel(main.model || "");
      setSerialNumber(main.serialNumber || main.serialnumber || "");
      setBarcode(main.barcode || "");
      setCategoryId(String(main.categoryId ?? main.categoryid ?? ""));
      setStatusId(String(main.statusId ?? main.statusid ?? ""));
      setBrandId(String(main.brandId ?? main.brandid ?? ""));
      setSupplierId(String(main.supplierId ?? main.supplierid ?? ""));
      setLocationId(String(main.locationId ?? main.locationid ?? ""));
      setDepartmentId(String(main.departmentId ?? main.departmentid ?? ""));
      setPurchasePrice(main.purchasePrice !== undefined ? Number(main.purchasePrice) : (main.purchaseprice ? Number(main.purchaseprice) : 0));
      setPurchaseDate(main.purchaseDate ? new Date(main.purchaseDate) : (main.purchasedate ? new Date(main.purchasedate) : new Date()));
      setEffectiveDate(main.effectiveDate ? new Date(main.effectiveDate) : (main.effectivedate ? new Date(main.effectivedate) : new Date()));
      setWarrantyMonths(main.warrantyMonths ?? main.warrantymonths ?? 36);
      setDescription(main.description || "");

      const subTypeStr = main.assetSubType || main.assetsubtype || "";
      const catText = categorySelectList?.find((c) => String(c.key) === String(main.categoryId ?? main.categoryid))?.value || "";
      const detectedType = getDeviceTypeIdFromCategory(subTypeStr || catText);
      setSelectedDeviceTypeId(detectedType);

      // Load child specs: hỗ trợ cả camelCase từ backend C# lẫn lowercase
      const printerData = root?.assetSpecPrinterCopierDto || root?.assetspecprintercopierdto;
      if (printerData) {
        setPrinterSpec({
          id: printerData.id || "",
          hardwareassetid: printerData.hardwareAssetId || printerData.hardwareassetid || "",
          devicetype: printerData.deviceType || printerData.devicetype || "Laser Printer",
          ipsetup: printerData.ipSetup || printerData.ipsetup || "",
          maxpapersize: printerData.maxPaperSize || printerData.maxpapersize || "A4",
          printspeedppm: Number(printerData.printSpeedPpm ?? printerData.printspeedppm ?? 0),
          printresolution: String(printerData.printResolution ?? printerData.printresolution ?? "1200"),
          inkcartridgetype: printerData.inkCartridgeType || printerData.inkcartridgetype || "",
          drumlifepages: Number(printerData.drumLifePages ?? printerData.drumlifepages ?? 0),
          lastinkrefilldate: printerData.lastInkRefillDate ? new Date(printerData.lastInkRefillDate) : (printerData.lastinkrefilldate ? new Date(printerData.lastinkrefilldate) : new Date()),
          lastcleaningdate: printerData.lastCleaningDate ? new Date(printerData.lastCleaningDate) : (printerData.lastcleaningdate ? new Date(printerData.lastcleaningdate) : new Date()),
          shredstyle: printerData.shredStyle || printerData.shredstyle || "N/A",
          shredcapacitysheets: Number(printerData.shredCapacitySheets ?? printerData.shredcapacitysheets ?? 0),
          bincapacityliters: Number(printerData.binCapacityLiters ?? printerData.bincapacityliters ?? 0),
        });
      }

      const nasData = root?.assetSpecNasStorageDto || root?.assetSpecnasstoragedto || root?.assetspecnasstoragedto;
      if (nasData) {
        setNasStorageSpec({
          id: nasData.id || "",
          hardwareassetid: nasData.hardwareAssetId || nasData.hardwareassetid || "",
          devicetype: nasData.deviceType || nasData.devicetype || "NAS_STORAGE",
          cpuprocessor: nasData.cpuProcessor || nasData.cpuprocessor || "",
          installedramgb: Number(nasData.installedRamGb ?? nasData.installedramgb ?? 0),
          maxramsupportedgb: Number(nasData.maxRamSupportedGb ?? nasData.maxramsupportedgb ?? 0),
          drivebayscount: Number(nasData.driveBaysCount ?? nasData.drivebayscount ?? 0),
          installedcapacitytb: Number(nasData.installedCapacityTb ?? nasData.installedcapacitytb ?? 0),
          maxsinglevolumetb: Number(nasData.maxSingleVolumeSizeTb ?? nasData.maxsinglevolumetb ?? 0),
          cacheslots: nasData.cacheSlots || nasData.cacheslots || "",
          powerratingva: Number(nasData.powerRatingVa ?? nasData.powerratingva ?? 0),
        });
      }

      const displayData = root?.assetSpecDisplayProjectorDto || root?.assetspecdisplayprojectordto;
      if (displayData) {
        setDisplaySpec({
          id: displayData.id || "",
          hardwareassetid: displayData.hardwareAssetId || displayData.hardwareassetid || "",
          devicetype: displayData.deviceType || displayData.devicetype || "DISPLAY_PROJECTOR",
          displaytype: displayData.displayType || displayData.displaytype || "",
          screensizeinches: Number(displayData.screenSizeInches ?? displayData.screensizeinches ?? 0),
          resolution: displayData.resolution || "",
          refreshratehz: Number(displayData.refreshRateHz ?? displayData.refreshratehz ?? 0),
          operatingsystem: displayData.operatingSystem || displayData.operatingsystem || "",
          brightnessansilumens: Number(displayData.brightnessAnsiLumens ?? displayData.brightnessansilumens ?? 0),
          contrastratio: displayData.contrastRatio || displayData.contrastratio || "",
          lampLifehours: Number(displayData.lampLifeHours ?? displayData.lampLifehours ?? 0),
          supportedports: displayData.supportedPorts || displayData.supportedports || "",
        });
      }

      const netData = root?.assetSpecNetworkDeviceDto || root?.assetspecnetworkdevicedto;
      if (netData) {
        setNetworkSpec({
          id: netData.id || "",
          hardwareassetid: netData.hardwareAssetId || netData.hardwareassetid || "",
          devicetype: netData.deviceType || netData.devicetype || "NETWORK_DEVICE",
          firewallthroughput: String(netData.firewallThroughput ?? netData.firewallthroughput ?? ""),
          ipsthroughput: String(netData.ipsThroughput ?? netData.ipsthroughput ?? ""),
          vpnthroughput: String(netData.vpnThroughput ?? netData.vpnthroughput ?? ""),
          concurrentsessions: Number(netData.concurrentSessions ?? netData.concurrentsessions ?? 0),
          portcount: Number(netData.portCount ?? netData.portcount ?? 0),
          portspeed: String(netData.portSpeed ?? netData.portspeed ?? ""),
          uplinkports: netData.uplinkPorts || netData.uplinkports || "",
          antennaspec: String(netData.antennaSpec ?? netData.antennaspec ?? ""),
          concurrentuserslimit: String(netData.concurrentUsersLimit ?? netData.concurrentuserslimit ?? ""),
          maxvlans: Number(netData.maxVlans ?? netData.maxvlans ?? 0),
          ispoesupported: Boolean(netData.isPoeSupported ?? netData.ispoesupported),
          powerconsumptionw: Number(netData.powerConsumptionW ?? netData.powerconsumptionw ?? 0),
        });
      }

      const camData = root?.assetSpecCameraNvrDto || root?.assetspeccameranvrdto;
      if (camData) {
        setCameraSpec({
          id: camData.id || "",
          hardwareassetid: camData.hardwareAssetId || camData.hardwareassetid || "",
          devicetype: camData.deviceType || camData.devicetype || "CAMERA_NVR",
          resolution: camData.resolution || "",
          sensorsize: String(camData.sensorSize ?? camData.sensorsize ?? ""),
          lenssize: camData.lensSize || camData.lenssize || "",
          irdistancemeters: Number(camData.irDistanceMeters ?? camData.irdistancemeters ?? 0),
          compressionstandard: camData.compressionStandard || camData.compressionstandard || "",
          hastwowayaudio: Boolean(camData.hasTwoWayAudio ?? camData.hastwowayaudio),
          haswdr: Boolean(camData.hasWdr ?? camData.haswdr),
          channelcount: Number(camData.channelCount ?? camData.channelcount ?? 0),
          maxstoragetb: Number(camData.maxStorageTb ?? camData.maxstoragetb ?? 0),
          inputbandwidthmbps: Number(camData.inputBandwidthMbps ?? camData.inputbandwidthmbps ?? 0),
          outputbandwidthmbps: Number(camData.outputBandwidthMbps ?? camData.outputbandwidthmbps ?? 0),
        });
      }
    } else if (!isEdit) {
      // Khởi tạo mã tự động khi vào trang tạo mới
      const rand = Math.floor(100 + Math.random() * 900);
      setAssetCode(`HW-SRV-2026-${rand}`);
      setBarcode(`893850100${rand}`);
    }
  }, [id, isEdit, detailResult, categorySelectList]);

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

  // Tự sinh mã tài sản theo chuẩn danh mục
  const handleAutoGenerateCode = (cat?: string, deviceId?: string) => {
    const targetId = deviceId || (cat ? getDeviceTypeIdFromCategory(cat) : selectedDeviceTypeId);
    const matched =
      HARDWARE_DEVICE_TYPES.find((d) => d.id === targetId) ||
      HARDWARE_DEVICE_TYPES.find((d) => d.categoryName === cat);
    const prefix = matched ? matched.prefix : "HW-GEN";
    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    const newCode = `${prefix}-${year}-${rand}`;
    setAssetCode(newCode);
    setBarcode(`893850100${rand}`);
    return newCode;
  };

  const handleSelectCategoryType = (typeItem: HardwareDeviceType) => {
    if (isEdit) return; // Guard edit mode
    setSelectedDeviceTypeId(typeItem.id);

    // Tìm trong categorySelectList của Lookups xem có danh mục tương ứng không
    if (categorySelectList?.length) {
      const matchedInApi = categorySelectList.find(
        (c) =>
          c.value.toLowerCase() === typeItem.categoryName.toLowerCase() ||
          c.value.toLowerCase().includes(typeItem.id) ||
          c.value.toLowerCase().includes(typeItem.label.toLowerCase()) ||
          (typeItem.id === "server" && (c.value.toLowerCase().includes("server") || c.value.toLowerCase().includes("máy chủ"))) ||
          (typeItem.id === "monitor" && (c.value.toLowerCase().includes("monitor") || c.value.toLowerCase().includes("màn hình") || c.value.toLowerCase().includes("display"))) ||
          (typeItem.id === "printer" && (c.value.toLowerCase().includes("printer") || c.value.toLowerCase().includes("máy in"))) ||
          (typeItem.id === "camera" && (c.value.toLowerCase().includes("camera") || c.value.toLowerCase().includes("đầu ghi"))) ||
          (typeItem.id === "network" && (c.value.toLowerCase().includes("network") || c.value.toLowerCase().includes("mạng")))
      );
      if (matchedInApi) {
        setCategoryId(String(matchedInApi.key));
      }
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    const newCode = `${typeItem.prefix}-${year}-${rand}`;
    setAssetCode(newCode);
    setBarcode(`893850100${rand}`);

    toast.success(`Đã chọn: ${typeItem.label}`, {
      description: `Đã áp dụng mẫu thông số kỹ thuật & tạo mã mới: ${newCode}`,
    });
  };

  const handleCategoryChange = (val: string) => {
    if (isEdit) return; // Guard edit mode category
    setCategoryId(val);

    const matched = categorySelectList?.find((c) => String(c.key) === String(val));
    const catText = matched ? matched.value : "";
    const matchedType = getDeviceTypeIdFromCategory(catText);
    setSelectedDeviceTypeId(matchedType);
    const newCode = handleAutoGenerateCode(catText, matchedType);

    const typeObj = HARDWARE_DEVICE_TYPES.find((t) => t.id === matchedType);
    if (typeObj) {
      toast.info(`Đã đổi danh mục: ${typeObj.label}`, {
        description: `Mã tài sản được cập nhật: ${newCode}`,
      });
    }
  };

  // Pre-flight validation checklist
  const checklist = useMemo(() => {
    const items = [
      { label: "Mã tài sản", valid: !!assetCode.trim() },
      { label: "Tên thiết bị", valid: !!name.trim() },
      { label: "Hãng sản xuất", valid: !!brandId.trim() },
      { label: "Số serial (S/N)", valid: !!serialNumber.trim() },
      { label: "Danh mục", valid: !!categoryId.trim() },
      { label: "Trạng thái", valid: !!statusId.trim() },
      { label: "Giá vốn", valid: purchasePrice > 0 },
      { label: "Thời hạn bảo hành", valid: warrantyMonths > 0 },
    ];
    const completed = items.filter((i) => i.valid).length;
    const percent = Math.round((completed / items.length) * 100);
    return { items, completed, total: items.length, percent };
  }, [assetCode, name, brandId, serialNumber, categoryId, statusId, purchasePrice, warrantyMonths]);

  // Lưu thông tin với Validation Schemas
  const handleSave = useCallback(() => {
    // Xác định ID chính của HardwareAsset: nếu update thì giữ nguyên id, nếu tạo mới thì tự sinh GUID
    const mainId = isEdit && id ? id : generateGuid();

    // 1. Chuẩn bị DTO chính
    const rawMainDto: Partial<hardwareassetdto> = {
      id: mainId,
      assetcode: assetCode.trim(),
      assetsubtype: getAssetSubType(selectedDeviceTypeId),
      name: name.trim(),
      model: model.trim(),
      serialnumber: serialNumber.trim(),
      barcode: barcode.trim(),
      categoryid: categoryId.trim(),
      statusid: statusId.trim(),
      brandid: brandId.trim(),
      supplierid: supplierId.trim(),
      locationid: locationId.trim(),
      departmentid: departmentId.trim(),
      purchaseprice: String(purchasePrice || 0),
      purchasedate: purchaseDate || new Date(),
      effectivedate: effectiveDate || new Date(),
      warrantymonths: warrantyMonths,
      description: description.trim(),
    };

    const newErrors: Record<string, string> = {};

    // Validate DTO chính bằng hardwareassetSchema
    const mainValidation = hardwareassetSchema.safeParse(rawMainDto);
    if (!mainValidation.success) {
      mainValidation.error.issues.forEach((issue) => {
        const fieldName = String(issue.path[0] || "");
        if (fieldName && !newErrors[fieldName]) {
          newErrors[fieldName] = issue.message;
        }
      });
    }

    // 2. CHỈ VALIDATE DUY NHẤT THÔNG SỐ KỸ THUẬT CỦA LOẠI ĐANG CHỌN (selectedDeviceTypeId)
    let activeNasStorage: assetSpecnasstoragedto | null = null;
    let activeDisplay: assetspecdisplayprojectordto | null = null;
    let activeNetwork: assetspecnetworkdevicedto | null = null;
    let activeCamera: assetspeccameranvrdto | null = null;
    let activePrinter: assetspecprintercopierdto | null = null;

    if (selectedDeviceTypeId === "server") {
      const childId = isEdit && nasStorageSpec.id ? nasStorageSpec.id : generateGuid();
      const specToValidate: assetSpecnasstoragedto = {
        ...nasStorageSpec,
        id: childId,
        hardwareassetid: mainId,
      };
      const specValidation = assetSpecNasStorageSchema.safeParse(specToValidate);
      if (!specValidation.success) {
        specValidation.error.issues.forEach((issue) => {
          const fieldName = String(issue.path[0] || "");
          if (fieldName && !newErrors[fieldName]) {
            newErrors[fieldName] = issue.message;
          }
        });
      } else {
        activeNasStorage = specValidation.data as assetSpecnasstoragedto;
      }
    } else if (selectedDeviceTypeId === "monitor") {
      const childId = isEdit && displaySpec.id ? displaySpec.id : generateGuid();
      const specToValidate: assetspecdisplayprojectordto = {
        ...displaySpec,
        id: childId,
        hardwareassetid: mainId,
      };
      const specValidation = assetSpecDisplayProjectorSchema.safeParse(specToValidate);
      if (!specValidation.success) {
        specValidation.error.issues.forEach((issue) => {
          const fieldName = String(issue.path[0] || "");
          if (fieldName && !newErrors[fieldName]) {
            newErrors[fieldName] = issue.message;
          }
        });
      } else {
        activeDisplay = specValidation.data as assetspecdisplayprojectordto;
      }
    } else if (selectedDeviceTypeId === "network") {
      const childId = isEdit && networkSpec.id ? networkSpec.id : generateGuid();
      const specToValidate: assetspecnetworkdevicedto = {
        ...networkSpec,
        id: childId,
        hardwareassetid: mainId,
      };
      const specValidation = assetSpecNetworkDeviceSchema.safeParse(specToValidate);
      if (!specValidation.success) {
        specValidation.error.issues.forEach((issue) => {
          const fieldName = String(issue.path[0] || "");
          if (fieldName && !newErrors[fieldName]) {
            newErrors[fieldName] = issue.message;
          }
        });
      } else {
        activeNetwork = specValidation.data as assetspecnetworkdevicedto;
      }
    } else if (selectedDeviceTypeId === "camera") {
      const childId = isEdit && cameraSpec.id ? cameraSpec.id : generateGuid();
      const specToValidate: assetspeccameranvrdto = {
        ...cameraSpec,
        id: childId,
        hardwareassetid: mainId,
      };
      const specValidation = assetSpecCameraNvrSchema.safeParse(specToValidate);
      if (!specValidation.success) {
        specValidation.error.issues.forEach((issue) => {
          const fieldName = String(issue.path[0] || "");
          if (fieldName && !newErrors[fieldName]) {
            newErrors[fieldName] = issue.message;
          }
        });
      } else {
        activeCamera = specValidation.data as assetspeccameranvrdto;
      }
    } else if (selectedDeviceTypeId === "printer") {
      const childId = isEdit && printerSpec.id ? printerSpec.id : generateGuid();
      const specToValidate: assetspecprintercopierdto = {
        ...printerSpec,
        id: childId,
        hardwareassetid: mainId,
      };
      const specValidation = assetSpecPrinterCopierSchema.safeParse(specToValidate);
      if (!specValidation.success) {
        specValidation.error.issues.forEach((issue) => {
          const fieldName = String(issue.path[0] || "");
          if (fieldName && !newErrors[fieldName]) {
            newErrors[fieldName] = issue.message;
          }
        });
      } else {
        activePrinter = specValidation.data as assetspecprintercopierdto;
      }
    }

    // Nếu có lỗi ở bất kỳ trường nào -> setErrors hiển thị chữ đỏ dưới từng ô và dừng submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstMsg = Object.values(newErrors)[0];
      toast.error(firstMsg || "Vui lòng kiểm tra lại các trường còn thiếu");
      setTimeout(() => {
        const firstErrorEl = document.querySelector(".border-error-500");
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }

    setErrors({});

    // 3. Đóng gói payload chuẩn hardwareassetobject: chỉ chứa DTO chính và duy nhất 1 DTO thông số kỹ thuật con
    const hardwarePayload: hardwareassetobject = {
      hardwareassetdto: mainValidation.data as unknown as hardwareassetdto,
      assetSpecnasstoragedto: activeNasStorage,
      assetspecdisplayprojectordto: activeDisplay,
      assetspecnetworkdevicedto: activeNetwork,
      assetspeccameranvrdto: activeCamera,
      assetspecprintercopierdto: activePrinter,
    };
    console.log(hardwarePayload);
    if (isEdit && id) {
      updateMutation.mutate(
        { id, params: hardwarePayload },
        {
          onSuccess: () => {
            toast.success("Cập nhật thiết bị thành công");
            navigate("/thiet-bi-phan-cung");
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (err: any) => {
            toast.error(err?.message || "Không thể cập nhật thiết bị");
          },
        }
      );
    } else {
      addMutation.mutate(hardwarePayload, {
        onSuccess: () => {
          toast.success("Tạo mới thiết bị phần cứng thành công");
          navigate("/thiet-bi-phan-cung");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (err: any) => {
          toast.error(err?.message || "Không thể tạo mới thiết bị");
        },
      });
    }
  }, [
    isEdit,
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
    selectedDeviceTypeId,
    nasStorageSpec,
    displaySpec,
    networkSpec,
    cameraSpec,
    printerSpec,
    updateMutation,
    addMutation,
    navigate,
  ]);

  return (
    <>
      <PageMeta
        title={isEdit ? "Chỉnh sửa thiết bị phần cứng | AIMS Enterprise" : "Thêm mới thiết bị phần cứng | AIMS Enterprise"}
        description="Thêm mới hồ sơ thiết bị phần cứng, máy chủ, máy trạm, linh kiện và phụ kiện"
      />

      <div className="space-y-4">
        {/* SUB-NAV DÀNH CHO MODULE HARDWARE */}
        <AimsModuleNav
          moduleName="Quản lý Tài sản IT"
          moduleIcon={
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          tabs={[
            { name: "Thiết bị phần cứng", path: "/thiet-bi-phan-cung" },
            { name: isEdit ? "Chỉnh sửa thiết bị" : "Thêm mới thiết bị", path: isEdit ? `/thiet-bi-phan-cung/${id}/chinh-sua` : "/thiet-bi-phan-cung/tao-moi" },
            { name: "Giám sát máy trạm", path: "/giam-sat-may-tram" },
            { name: "Tài nguyên số", path: "/tai-nguyen-so" },
          ]}
        />

        {/* HEADER CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <Link
                to="/thiet-bi-phan-cung"
                className="text-xs text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 font-medium"
              >
                &larr; Quay lại danh sách
              </Link>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
              {isEdit ? "Chỉnh sửa hồ sơ thiết bị phần cứng" : "Thêm mới thiết bị phần cứng"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Điền đầy đủ thông tin định danh, cấu hình thông số kỹ thuật và chế độ bảo hành.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/thiet-bi-phan-cung")}
              className="text-xs font-semibold h-8.5 cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={addMutation.isPending || updateMutation.isPending || isLoadingDetail}
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

                {/* 1. CHỌN LOẠI THIẾT BỊ PHẦN CỨNG (HERO SELECTOR - COMPACT) */}
        <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-3 sm:p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                Chọn loại thiết bị phần cứng
                {isEdit && (
                  <span className="text-[10px] font-medium normal-case px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80 flex items-center gap-1">
                    <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Chế độ sửa: Cố định loại thiết bị
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {isEdit
                  ? "Đang cố định loại thiết bị và thông số kỹ thuật của hồ sơ này để tránh chọn nhầm và làm thay đổi cấu trúc dữ liệu."
                  : "Mỗi loại thiết bị sẽ tự động liên kết với cấu trúc DTO và Schema kiểm tra chuyên biệt."}
              </p>
            </div>

            {/* Dropdown danh mục đầy đủ từ Lookups */}
            <div className="w-full sm:w-64" title={isEdit ? "Không thể thay đổi danh mục khi đang chỉnh sửa" : undefined}>
              <Select
                size="sm"
                options={categorySelectList || []}
                value={categoryId}
                onChange={(val) => {
                  handleCategoryChange(val);
                  clearError("categoryid");
                }}
                placeholder="Chọn danh mục thiết bị..."
                disabled={isEdit}
                error={!!errors.categoryid}
                hint={errors.categoryid}
              />
            </div>
          </div>

          {/* Các Thẻ chọn nhanh */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {HARDWARE_DEVICE_TYPES.map((type) => {
              const isSelected = selectedDeviceTypeId === type.id;
              const isDisabled = isEdit && !isSelected;
              return (
                <button
                  type="button"
                  key={type.id}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && handleSelectCategoryType(type)}
                  title={isDisabled ? "Không thể chọn loại thiết bị khác khi đang chỉnh sửa" : undefined}
                  className={`relative text-left p-2.5 rounded-lg border transition-all duration-200 flex items-center gap-2.5 group ${
                    isSelected
                      ? "border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/70 dark:bg-brand-950/50 shadow-xs cursor-default"
                      : isDisabled
                      ? "border-gray-200/50 dark:border-gray-800/40 bg-gray-100/60 dark:bg-gray-800/20 opacity-40 cursor-not-allowed select-none"
                      : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-transform ${
                      !isDisabled ? "group-hover:scale-105" : "grayscale opacity-75"
                    } ${type.color}`}
                  >
                    {type.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-bold truncate ${
                        isSelected
                          ? "text-brand-600 dark:text-brand-400"
                          : isDisabled
                          ? "text-gray-400 dark:text-gray-500"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {type.label}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                      {isDisabled ? "Đã khóa" : type.sublabel}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-brand-600 dark:bg-brand-500 text-white text-[10px] font-semibold shrink-0 shadow-2xs">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                      Đang chọn
                    </span>
                  )}
                  {isDisabled && (
                    <span className="text-gray-400 dark:text-gray-500 shrink-0" title="Đã khóa">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
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
            {/* CARD: THÔNG TIN ĐỊNH DANH & KHO (hardwareassetdto) */}
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
                  Định danh thiết bị & Quản lý kho (hardwareassetdto)
                </h3>
                <span className="text-[11px] text-gray-400 font-medium">
                  <span className="text-red-500">*</span> Bắt buộc
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Mã tài sản */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
                      Mã tài sản quản lý *
                    </Label>
                    <button
                      type="button"
                      disabled={isEdit}
                      onClick={() => {
                        if (isEdit) return;
                        const code = handleAutoGenerateCode(categoryName, selectedDeviceTypeId);
                        toast.success(`Đã tự động tạo mã: ${code}`);
                      }}
                      className="text-[11px] leading-none text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                      title={isEdit ? "Không thể tự tạo lại mã khi đang chỉnh sửa" : undefined}
                    >
                      ⚡ Tạo mã
                    </button>
                  </div>
                  <Input
                    size="sm"
                    type="text"
                    value={assetCode}
                    onChange={(e) => {
                      setAssetCode(e.target.value);
                      clearError("assetcode");
                    }}
                    error={!!errors.assetcode}
                    hint={errors.assetcode}
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
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError("name");
                    }}
                    error={!!errors.name}
                    hint={errors.name}
                    placeholder="VD: Máy chủ ảo hóa Synology DS923+ / Cisco C1300"
                  />
                </div>

                {/* Hãng sản xuất */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hãng sản xuất (Brand)
                  </Label>
                  <Select
                    size="sm"
                    options={brandSelectList || []}
                    value={brandId}
                    onChange={(val) => {
                      setBrandId(val);
                      clearError("brandid");
                    }}
                    error={!!errors.brandid}
                    hint={errors.brandid}
                    placeholder="Chọn hãng sản xuất..."
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
                    onChange={(e) => {
                      setModel(e.target.value);
                      clearError("model");
                    }}
                    error={!!errors.model}
                    hint={errors.model}
                    placeholder="VD: DS923+ / C1300-24T-4G"
                  />
                </div>

                {/* Trạng thái vận hành */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái vận hành
                  </Label>
                  <Select
                    size="sm"
                    options={statusSelectList || []}
                    value={statusId}
                    onChange={(val) => {
                      setStatusId(val);
                      clearError("statusid");
                    }}
                    error={!!errors.statusid}
                    hint={errors.statusid}
                    placeholder="Chọn trạng thái..."
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
                    onChange={(e) => {
                      setSerialNumber(e.target.value);
                      clearError("serialnumber");
                    }}
                    error={!!errors.serialnumber}
                    hint={errors.serialnumber}
                    placeholder="VD: SN9232026001 hoặc C1300456312"
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
                    onChange={(e) => {
                      setBarcode(e.target.value);
                      clearError("barcode");
                    }}
                    error={!!errors.barcode}
                    hint={errors.barcode}
                    placeholder="VD: 893850100512"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {/* CARD: CẤU HÌNH THÔNG SỐ KỸ THUẬT DTO CHUẨN */}
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center text-xs">⚙️</span>
                    Thông số kỹ thuật chuẩn DTO ({categoryName})
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Các trường dữ liệu khớp chuẩn thực thể C# và validate bằng Schema tương ứng
                  </p>
                </div>
              </div>

              {/* 1. NAS Storage / Server Specs (assetSpecnasstoragedto) */}
              {selectedDeviceTypeId === "server" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bộ vi xử lý (cpuprocessor)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={nasStorageSpec.cpuprocessor}
                      onChange={(e) => {
                        setNasStorageSpec({ ...nasStorageSpec, cpuprocessor: e.target.value });
                        clearError("cpuprocessor");
                      }}
                      error={!!errors.cpuprocessor}
                      hint={errors.cpuprocessor}
                      placeholder="VD: AMD Ryzen R1600 / Intel Xeon Silver"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      RAM đã lắp (installedramgb)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={nasStorageSpec.installedramgb}
                      onChange={(e) => {
                        setNasStorageSpec({ ...nasStorageSpec, installedramgb: Number(e.target.value) || 0 });
                        clearError("installedramgb");
                      }}
                      error={!!errors.installedramgb}
                      hint={errors.installedramgb}
                      placeholder="GB"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      RAM tối đa (maxramsupportedgb)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={nasStorageSpec.maxramsupportedgb}
                      onChange={(e) => {
                        setNasStorageSpec({ ...nasStorageSpec, maxramsupportedgb: Number(e.target.value) || 0 });
                        clearError("maxramsupportedgb");
                      }}
                      error={!!errors.maxramsupportedgb}
                      hint={errors.maxramsupportedgb}
                      placeholder="GB"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số khay ổ cứng (drivebayscount)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={nasStorageSpec.drivebayscount}
                      onChange={(e) => {
                        setNasStorageSpec({ ...nasStorageSpec, drivebayscount: Number(e.target.value) || 0 });
                        clearError("drivebayscount");
                      }}
                      error={!!errors.drivebayscount}
                      hint={errors.drivebayscount}
                      placeholder="Số khay"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dung lượng lắp đặt (installedcapacitytb)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={nasStorageSpec.installedcapacitytb}
                      onChange={(e) => {
                        setNasStorageSpec({ ...nasStorageSpec, installedcapacitytb: Number(e.target.value) || 0 });
                        clearError("installedcapacitytb");
                      }}
                      error={!!errors.installedcapacitytb}
                      hint={errors.installedcapacitytb}
                      placeholder="TB"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dung lượng Single Vol tối đa (maxsinglevolumetb)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={nasStorageSpec.maxsinglevolumetb}
                      onChange={(e) => {
                        setNasStorageSpec({ ...nasStorageSpec, maxsinglevolumetb: Number(e.target.value) || 0 });
                        clearError("maxsinglevolumetb");
                      }}
                      error={!!errors.maxsinglevolumetb}
                      hint={errors.maxsinglevolumetb}
                      placeholder="TB"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Công suất nguồn (powerratingva)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={nasStorageSpec.powerratingva}
                      onChange={(e) => {
                        setNasStorageSpec({ ...nasStorageSpec, powerratingva: Number(e.target.value) || 0 });
                        clearError("powerratingva");
                      }}
                      error={!!errors.powerratingva}
                      hint={errors.powerratingva}
                      placeholder="VA / W"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Khe cắm Cache / M.2 Slots (cacheslots)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={nasStorageSpec.cacheslots}
                      onChange={(e) => {
                        setNasStorageSpec({ ...nasStorageSpec, cacheslots: e.target.value });
                        clearError("cacheslots");
                      }}
                      error={!!errors.cacheslots}
                      hint={errors.cacheslots}
                      placeholder="VD: 2x M.2 NVMe SSD 2280"
                    />
                  </div>
                </div>
              )}

              {/* 2. Màn hình & Máy chiếu Specs (assetspecdisplayprojectordto) */}
              {selectedDeviceTypeId === "monitor" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Công nghệ hiển thị (displaytype)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={displaySpec.displaytype}
                      onChange={(e) => {
                        setDisplaySpec({ ...displaySpec, displaytype: e.target.value });
                        clearError("displaytype");
                      }}
                      error={!!errors.displaytype}
                      hint={errors.displaytype}
                      placeholder="VD: IPS Black, OLED, 3LCD"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kích thước (screensizeinches)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={displaySpec.screensizeinches}
                      onChange={(e) => {
                        setDisplaySpec({ ...displaySpec, screensizeinches: Number(e.target.value) || 0 });
                        clearError("screensizeinches");
                      }}
                      error={!!errors.screensizeinches}
                      hint={errors.screensizeinches}
                      placeholder="Inch"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Độ phân giải (resolution)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={displaySpec.resolution}
                      onChange={(e) => {
                        setDisplaySpec({ ...displaySpec, resolution: e.target.value });
                        clearError("resolution");
                      }}
                      error={!!errors.resolution}
                      hint={errors.resolution}
                      placeholder="VD: 3840 x 2160 (4K), 2560 x 1440"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tần số quét Hz (refreshratehz)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={displaySpec.refreshratehz}
                      onChange={(e) => setDisplaySpec({ ...displaySpec, refreshratehz: Number(e.target.value) || 0 })}
                      placeholder="60, 120, 144 Hz"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Độ sáng Lumens (brightnessansilumens)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={displaySpec.brightnessansilumens}
                      onChange={(e) => setDisplaySpec({ ...displaySpec, brightnessansilumens: Number(e.target.value) || 0 })}
                      placeholder="400 nits / 3600 ANSI"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Độ tương phản (contrastratio)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={displaySpec.contrastratio}
                      onChange={(e) => setDisplaySpec({ ...displaySpec, contrastratio: e.target.value })}
                      placeholder="VD: 2000:1, 16000:1"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tuổi thọ bóng đèn giờ (lampLifehours)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={displaySpec.lampLifehours}
                      onChange={(e) => setDisplaySpec({ ...displaySpec, lampLifehours: Number(e.target.value) || 0 })}
                      placeholder="Giờ"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cổng kết nối hỗ trợ (supportedports)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={displaySpec.supportedports}
                      onChange={(e) => setDisplaySpec({ ...displaySpec, supportedports: e.target.value })}
                      placeholder="VD: HDMI 2.1, DisplayPort 1.4, Type-C 90W PD, RJ45"
                    />
                  </div>
                </div>
              )}

              {/* 3. Thiết bị mạng & An ninh Specs (assetspecnetworkdevicedto) */}
              {selectedDeviceTypeId === "network" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số lượng cổng RJ45 (portcount)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={networkSpec.portcount}
                      onChange={(e) => setNetworkSpec({ ...networkSpec, portcount: Number(e.target.value) || 0 })}
                      placeholder="VD: 24, 48"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tốc độ cổng (portspeed)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={networkSpec.portspeed}
                      onChange={(e) => setNetworkSpec({ ...networkSpec, portspeed: e.target.value })}
                      placeholder="VD: 10/100/1000Mbps"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cổng Uplink (uplinkports)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={networkSpec.uplinkports}
                      onChange={(e) => setNetworkSpec({ ...networkSpec, uplinkports: e.target.value })}
                      placeholder="VD: 4x 10G SFP+"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Throughput tường lửa (firewallthroughput)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={networkSpec.firewallthroughput}
                      onChange={(e) => setNetworkSpec({ ...networkSpec, firewallthroughput: e.target.value })}
                      placeholder="VD: 10 Gbps"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thông lượng IPS (ipsthroughput)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={networkSpec.ipsthroughput}
                      onChange={(e) => setNetworkSpec({ ...networkSpec, ipsthroughput: e.target.value })}
                      placeholder="VD: 2.5 Gbps"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số VLAN tối đa (maxvlans)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={networkSpec.maxvlans}
                      onChange={(e) => setNetworkSpec({ ...networkSpec, maxvlans: Number(e.target.value) || 0 })}
                      placeholder="4094"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Công suất tiêu thụ W (powerconsumptionw)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={networkSpec.powerconsumptionw}
                      onChange={(e) => setNetworkSpec({ ...networkSpec, powerconsumptionw: Number(e.target.value) || 0 })}
                      placeholder="Watt"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="ispoesupported"
                      checked={networkSpec.ispoesupported}
                      onChange={(e) => setNetworkSpec({ ...networkSpec, ispoesupported: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 cursor-pointer"
                    />
                    <label htmlFor="ispoesupported" className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      Hỗ trợ cấp nguồn PoE (ispoesupported)
                    </label>
                  </div>
                </div>
              )}

              {/* 4. Camera & Đầu ghi NVR Specs (assetspeccameranvrdto) */}
              {selectedDeviceTypeId === "camera" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Độ phân giải (resolution)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={cameraSpec.resolution}
                      onChange={(e) => setCameraSpec({ ...cameraSpec, resolution: e.target.value })}
                      placeholder="VD: 4K 8MP (3840 x 2160)"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Kích thước cảm biến (sensorsize)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={cameraSpec.sensorsize}
                      onChange={(e) => setCameraSpec({ ...cameraSpec, sensorsize: e.target.value })}
                      placeholder="VD: 1/2.8 inch CMOS"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tiêu cự ống kính (lenssize)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={cameraSpec.lenssize}
                      onChange={(e) => setCameraSpec({ ...cameraSpec, lenssize: e.target.value })}
                      placeholder="VD: 2.8mm / 4mm"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hồng ngoại ban đêm mét (irdistancemeters)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={cameraSpec.irdistancemeters}
                      onChange={(e) => setCameraSpec({ ...cameraSpec, irdistancemeters: Number(e.target.value) || 0 })}
                      placeholder="Mét"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Chuẩn nén video (compressionstandard)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={cameraSpec.compressionstandard}
                      onChange={(e) => setCameraSpec({ ...cameraSpec, compressionstandard: e.target.value })}
                      placeholder="VD: H.265+ / H.264"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số kênh đầu ghi (channelcount)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={cameraSpec.channelcount}
                      onChange={(e) => setCameraSpec({ ...cameraSpec, channelcount: Number(e.target.value) || 0 })}
                      placeholder="8, 16, 32"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lưu trữ tối đa TB (maxstoragetb)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={cameraSpec.maxstoragetb}
                      onChange={(e) => setCameraSpec({ ...cameraSpec, maxstoragetb: Number(e.target.value) || 0 })}
                      placeholder="TB"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-6 sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cameraSpec.hastwowayaudio}
                        onChange={(e) => setCameraSpec({ ...cameraSpec, hastwowayaudio: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 cursor-pointer"
                      />
                      Đàm thoại 2 chiều (hastwowayaudio)
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cameraSpec.haswdr}
                        onChange={(e) => setCameraSpec({ ...cameraSpec, haswdr: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300 cursor-pointer"
                      />
                      Chống ngược sáng WDR (haswdr)
                    </label>
                  </div>
                </div>
              )}

              {/* 5. Máy in & Photocopy Specs (assetspecprintercopierdto) */}
              {selectedDeviceTypeId === "printer" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Khổ giấy tối đa (maxpapersize)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={printerSpec.maxpapersize}
                      onChange={(e) => {
                        setPrinterSpec({ ...printerSpec, maxpapersize: e.target.value });
                        clearError("maxpapersize");
                      }}
                      error={!!errors.maxpapersize}
                      hint={errors.maxpapersize}
                      placeholder="A4, A3, Letter"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tốc độ in trang/phút (printspeedppm)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={printerSpec.printspeedppm}
                      onChange={(e) => {
                        setPrinterSpec({ ...printerSpec, printspeedppm: Number(e.target.value) || 0 });
                        clearError("printspeedppm");
                      }}
                      error={!!errors.printspeedppm}
                      hint={errors.printspeedppm}
                      placeholder="VD: 38, 40"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Độ phân giải DPI (printresolution)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={printerSpec.printresolution}
                      onChange={(e) => {
                        setPrinterSpec({ ...printerSpec, printresolution: e.target.value });
                        clearError("printresolution");
                      }}
                      error={!!errors.printresolution}
                      hint={errors.printresolution}
                      placeholder="1200, 2400"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hộp mực sử dụng (inkcartridgetype)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={printerSpec.inkcartridgetype}
                      onChange={(e) => {
                        setPrinterSpec({ ...printerSpec, inkcartridgetype: e.target.value });
                        clearError("inkcartridgetype");
                      }}
                      error={!!errors.inkcartridgetype}
                      hint={errors.inkcartridgetype}
                      placeholder="VD: HP 58A Toner Cartridge"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tuổi thọ Drum trang (drumlifepages)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      value={printerSpec.drumlifepages}
                      onChange={(e) => {
                        setPrinterSpec({ ...printerSpec, drumlifepages: Number(e.target.value) || 0 });
                        clearError("drumlifepages");
                      }}
                      error={!!errors.drumlifepages}
                      hint={errors.drumlifepages}
                      placeholder="Trang"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cấu hình IP / Kết nối (ipsetup)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      value={printerSpec.ipsetup}
                      onChange={(e) => {
                        setPrinterSpec({ ...printerSpec, ipsetup: e.target.value });
                        clearError("ipsetup");
                      }}
                      error={!!errors.ipsetup}
                      hint={errors.ipsetup}
                      placeholder="VD: Static IP, DHCP, USB 2.0"
                    />
                  </div>
                </div>
              )}
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
                    options={departmentSelectList || []}
                    value={departmentId}
                    onChange={(val) => {
                      setDepartmentId(val);
                      clearError("departmentid");
                    }}
                    error={!!errors.departmentid}
                    hint={errors.departmentid}
                    placeholder="Chọn phòng ban..."
                  />
                </div>

                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vị trí / Chi nhánh kho
                  </Label>
                  <Select
                    size="sm"
                    options={locationSelectList || []}
                    value={locationId}
                    onChange={(val) => {
                      setLocationId(val);
                      clearError("locationid");
                    }}
                    error={!!errors.locationid}
                    hint={errors.locationid}
                    placeholder="Chọn vị trí kho..."
                  />
                </div>

                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nhà cung cấp
                  </Label>
                  <Select
                    size="sm"
                    options={supplierSelectList || []}
                    value={supplierId}
                    onChange={(val) => {
                      setSupplierId(val);
                      clearError("supplierid");
                    }}
                    error={!!errors.supplierid}
                    hint={errors.supplierid}
                    placeholder="Chọn nhà cung cấp..."
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
                    onChange={(e) => {
                      setPurchasePrice(Number(e.target.value) || 0);
                      clearError("purchaseprice");
                    }}
                    error={!!errors.purchaseprice}
                    hint={errors.purchaseprice}
                    placeholder="0"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0">
                      Bảo hành (tháng)
                    </Label>
                    <div className="flex gap-1">
                      {[12, 24, 36, 60].map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setWarrantyMonths(m)}
                          className={`text-[10px] px-1.5 py-0.5 leading-none rounded border cursor-pointer ${warrantyMonths === m
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
                    onChange={(e) => {
                      setWarrantyMonths(Number(e.target.value) || 0);
                      clearError("warrantymonths");
                    }}
                    error={!!errors.warrantymonths}
                    hint={errors.warrantymonths}
                  />
                </div>

                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày mua *
                  </Label>
                  <Input
                    size="sm"
                    type="date"
                    value={purchaseDate ? purchaseDate.toISOString().split("T")[0] : ""}
                    onChange={(e) => {
                      setPurchaseDate(e.target.value ? new Date(e.target.value) : undefined);
                      clearError("purchasedate");
                    }}
                    error={!!errors.purchasedate}
                    hint={errors.purchasedate}
                  />
                </div>

                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày đưa vào sử dụng *
                  </Label>
                  <Input
                    size="sm"
                    type="date"
                    value={effectiveDate ? effectiveDate.toISOString().split("T")[0] : ""}
                    onChange={(e) => {
                      setEffectiveDate(e.target.value ? new Date(e.target.value) : undefined);
                      clearError("effectivedate");
                    }}
                    error={!!errors.effectivedate}
                    hint={errors.effectivedate}
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
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearError("description");
                  }}
                  placeholder="Ghi chú tình trạng thiết bị, lịch sử sửa chữa, các lưu ý khi kiểm kê kho định kỳ..."
                  className={`w-full border rounded-lg p-2.5 text-xs resize-none dark:bg-gray-900 dark:text-white focus:outline-hidden focus:ring-2 ${
                    errors.description
                      ? "border-error-500 focus:border-error-300 focus:ring-error-500/20"
                      : "border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-error-500 font-medium">{errors.description}</p>
                )}
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
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-semibold">Nhà cung cấp</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {supplierName}
                    </span>
                  </div>
                </div>

                {/* Tóm tắt Specs thực tế theo Subtype */}
                <div className="p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-indigo-700 dark:text-indigo-400 block">
                    Thông số DTO chuẩn ({selectedDeviceTypeId}):
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                    {selectedDeviceTypeId === "server" && `${nasStorageSpec.cpuprocessor || "CPU"} • RAM ${nasStorageSpec.installedramgb}GB • ${nasStorageSpec.drivebayscount} Bays`}
                    {selectedDeviceTypeId === "monitor" && `${displaySpec.screensizeinches} inch • ${displaySpec.resolution} • ${displaySpec.displaytype}`}
                    {selectedDeviceTypeId === "network" && `${networkSpec.portcount} • ${networkSpec.portspeed}Mbps • ${networkSpec.uplinkports}`}
                    {selectedDeviceTypeId === "camera" && `${cameraSpec.resolution} • ${cameraSpec.channelcount} Kênh • ${cameraSpec.irdistancemeters}m IR`}
                    {selectedDeviceTypeId === "printer" && `Khổ ${printerSpec.maxpapersize} • ${printerSpec.printspeedppm} • ${printerSpec.printresolution} DPI`}
                  </p>
                </div>

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
                    className={`h-full transition-all duration-300 ${checklist.percent === 100 ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                    style={{ width: `${checklist.percent}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-1 pt-0.5">
                  {checklist.items.map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition ${item.valid
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
                  disabled={addMutation.isPending || updateMutation.isPending || isLoadingDetail}
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
