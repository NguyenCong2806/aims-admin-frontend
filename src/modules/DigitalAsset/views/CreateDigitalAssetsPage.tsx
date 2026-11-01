/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import Button from "../../../components/ui/button/Button";
import PageMeta from "../../../components/common/PageMeta";
import AimsModuleNav from "../../../components/aims/AimsModuleNav";
import Select from "../../../components/form/Select";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Checkbox from "../../../components/form/input/Checkbox";

import { useSupplierAll } from "../../Lookups/queries/suppliersQuery";
import { useAssetStatusAll } from "../../Lookups/queries/assetstatusQuery";
import { useDepartmentAll } from "../../Lookups/queries/departmentsQuery";
import { useAssetCategoryAll } from "../../Lookups/queries/assetcategoriesQuery";
import {
  useAddDigitalAsset,
  useCreateDigitalAsset,
  useUpdateDigitalAsset,
  useDigitalAssetById,
} from "../queries/digitalassetQuery";
import { digitalAssetService } from "../services";

import { currencyTypeList } from "../../../common/Currencytypelist";
import { billingCycleList } from "../../../common/BillingCycleList";
import { checkDateValidity } from "../../../helpper/checkDateValidity";
import { formatCurrency, generateGuid } from "../../../helpper";

import {
  domainsslList,
  domainSslPurposeList,
  domainsslTypeList,
  functionalScopeList,
  relatedProgramList,
} from "../../../common/DomainSSLTypeList";
import { internetLineTypeList, ipTypeList } from "../../../common/InternetLineTypeList";
import { defaultPlanTierList, serviceBrandList } from "../../../common/DefaultSaasList";

// Schema Zod
import {
  digitalassetSchema,
  DigitalAssetFormData,
} from "../../../validations/digitalasset.schema";

// 6 loại tài nguyên số phổ biến nhất được hiển thị dạng thẻ chọn nhanh
const DIGITAL_ASSET_SUBTYPES = [
  {
    value: "DOMAIN",
    label: "Tên miền (Domain)",
    sublabel: "DNS & FQDN Website",
    acronym: "DOM",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a8.959 8.959 0 01-4.5-1.207M12 21a8.959 8.959 0 004.5-1.207M12 3a8.959 8.959 0 014.5 1.207M12 3a8.959 8.959 0 00-4.5 1.207" />
      </svg>
    ),
    color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/40",
  },
  {
    value: "SSL",
    label: "Chứng chỉ SSL/TLS",
    sublabel: "Bảo mật HTTPS / Wildcard",
    acronym: "SSL",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/40",
  },
  {
    value: "CLOUD_SERVER",
    label: "Máy chủ Cloud / VPS",
    sublabel: "Hạ tầng ảo hóa & Server",
    acronym: "SRV",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-900/40",
  },
  {
    value: "SOFTWARE_LICENSE",
    label: "Bản quyền phần mềm",
    sublabel: "License Key & Thiết bị",
    acronym: "LIC",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-900/40",
  },
  {
    value: "SAAS_SUBSCRIPTION",
    label: "Thuê bao SaaS",
    sublabel: "M365, Google, Zoom...",
    acronym: "SAAS",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/40",
  },
  {
    value: "INTERNET_LINE",
    label: "Đường truyền Internet",
    sublabel: "FTTH, Cáp quang & IP",
    acronym: "NET",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/60 dark:border-cyan-900/40",
  },
];

// Khởi tạo ngày mặc định
const defaultStartDate = new Date();
const defaultExpiryDate = new Date();
defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);

const normalizeSubType = (val?: string): string => {
  if (!val) return "DOMAIN";
  const upper = val.toUpperCase().trim();
  if (upper === "INTERNETLINE" || upper === "INTERNET_LINE" || upper === "INTERNET") return "INTERNET_LINE";
  if (upper === "SOFTWARELICENSE" || upper === "SOFTWARE_LICENSE" || upper === "SOFTWARE") return "SOFTWARE_LICENSE";
  if (upper === "SAASSUBSCRIPTION" || upper === "SAAS_SUBSCRIPTION" || upper === "SAAS") return "SAAS_SUBSCRIPTION";
  if (upper === "CLOUDSERVER" || upper === "CLOUD_SERVER" || upper === "SERVER" || upper === "VPS") return "CLOUD_SERVER";
  if (upper === "SSL" || upper === "SSLCERTIFICATE" || upper === "SSL_CERTIFICATE") return "SSL";
  if (upper === "DOMAIN") return "DOMAIN";
  return upper;
};

const defaultValues: Partial<DigitalAssetFormData> = {
  assetcode: "",
  name: "",
  assetsubtype: "DOMAIN",
  categoryid: undefined,
  statusid: undefined,
  contractnumber: "",
  supplierid: undefined,
  departmentid: undefined,
  costamount: 0,
  currency: "VND",
  billingcycle: "YEARLY",
  startdate: defaultStartDate,
  expirydate: defaultExpiryDate,
  description: "",
  domaindetail: {
    recordtype: "DOMAIN",
    domainname: "",
    programtag: "",
    functionalscope: "",
    marketingtarget: "",
    ssltype: "",
    bounddomainlist: "",
    autorenew: false,
  },
  cloudserverdetail: {
    clustername: "",
    purpose: "",
    vcpucount: undefined,
    ramgb: undefined,
    storagespec: "",
    operatingsystem: "",
    ipprivate: "",
    ippublic: "",
    allocatedipcount: undefined,
    costpermonth: undefined,
  },
  internetlinedetail: {
    linetype: "",
    domesticbandwidthmbps: undefined,
    internationalminbandwidthmbps: undefined,
    monthlyfee: undefined,
    annualfee: undefined,
    iptype: "",
    staticipaddress: "",
  },
  softwarelicensedetail: {
    softwarename: "",
    licensekey: "",
    boundhardwareserial: "",
    totalseats: 1,
    allocatedseats: 0,
    isperpetual: false,
  },
  saasdetail: {
    servicebrand: "",
    plantier: "",
    adminaccountemail: "",
    totallicensesbought: undefined,
    storagequota: "",
  },
};

const formatDateInputValue = (date?: Date | string | null): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

export const CreateDigitalAssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const assetId = id || null;

  // React Query Lookups
  const { data: assetCategories } = useAssetCategoryAll();
  const { data: assetStatusData } = useAssetStatusAll();
  const { data: supplierData } = useSupplierAll();
  const { data: departmentData } = useDepartmentAll();

  const addMutation = useAddDigitalAsset();
  const createMutation = useCreateDigitalAsset();
  const updateMutation = useUpdateDigitalAsset();
  const { data: assetDetail, isLoading: isLoadingDetail } = useDigitalAssetById(assetId);

  // React Hook Form + Zod
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<DigitalAssetFormData>({
    resolver: zodResolver(digitalassetSchema) as any,
    mode: "onChange",
    defaultValues,
    shouldUnregister: false,
  });

  const isPendingSave = isSubmitting || addMutation.isPending || createMutation.isPending || updateMutation.isPending || isLoadingDetail;

  // Watched values cho live preview & checklist
  const watchedValues = watch();
  const currentSubtype = watchedValues.assetsubtype || "DOMAIN";

  // Label lookups cho Preview Card
  const selectedCategoryName = useMemo(() => {
    if (!watchedValues.categoryid || !assetCategories) return "Chưa chọn danh mục";
    return assetCategories.find((c) => c.id === watchedValues.categoryid)?.name || "N/A";
  }, [watchedValues.categoryid, assetCategories]);

  const selectedStatusName = useMemo(() => {
    if (!watchedValues.statusid || !assetStatusData) return "Chưa chọn trạng thái";
    return assetStatusData.find((s) => s.id === watchedValues.statusid)?.name || "Sẵn sàng";
  }, [watchedValues.statusid, assetStatusData]);

  const selectedSupplierName = useMemo(() => {
    if (!watchedValues.supplierid || !supplierData) return "Chưa cập nhật";
    return supplierData.find((s) => s.id === watchedValues.supplierid)?.name || "N/A";
  }, [watchedValues.supplierid, supplierData]);

  const selectedDepartmentName = useMemo(() => {
    if (!watchedValues.departmentid || !departmentData) return "Chưa phân bổ";
    return departmentData.find((d) => d.id === watchedValues.departmentid)?.name || "N/A";
  }, [watchedValues.departmentid, departmentData]);

  const remainingDays = useMemo(() => {
    if (!watchedValues.expirydate) return null;
    const now = new Date();
    const expiry = new Date(watchedValues.expirydate);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [watchedValues.expirydate]);

  // Thông báo lỗi các trường con
  const domainErrors = (errors?.domaindetail as any) || {};
  const internetErrors = (errors?.internetlinedetail as any) || {};
  const licenseErrors = (errors?.softwarelicensedetail as any) || {};
  const saasErrors = (errors?.saasdetail as any) || {};

  // Pre-flight validation checklist
  const checklist = useMemo(() => {
    const items = [
      { label: "Mã tài sản", valid: !!watchedValues.assetcode?.trim() },
      { label: "Tên tài nguyên", valid: !!watchedValues.name?.trim() },
      { label: "Phân loại", valid: !!watchedValues.assetsubtype?.trim() },
      { label: "Danh mục", valid: typeof watchedValues.categoryid === "number" && watchedValues.categoryid > 0 },
      { label: "Trạng thái", valid: typeof watchedValues.statusid === "number" && watchedValues.statusid > 0 },
      { label: "Nhà cung cấp", valid: typeof watchedValues.supplierid === "number" && watchedValues.supplierid > 0 },
      { label: "Ngày bắt đầu", valid: !!watchedValues.startdate },
      { label: "Ngày hết hạn", valid: !!watchedValues.expirydate },
    ];
    const completed = items.filter((i) => i.valid).length;
    const total = items.length;
    const percent = Math.round((completed / total) * 100);
    return { items, completed, total, percent };
  }, [watchedValues]);

  // Load data khi ở chế độ Edit
  useEffect(() => {
    if (isEdit && assetDetail) {
      const root = (assetDetail as any)?.data?.data || (assetDetail as any)?.data || assetDetail;
      if (!root) return;

      // 1. DTO chính: Tài sản số (digitalAssetDto)
      const main = root.digitalAssetDto || root.digitalassetdto || root;

      // 2. Chuẩn hóa mapping các DTO thông số con từ Backend (hỗ trợ cả snake_case [JsonPropertyName], camelCase và lowercase)
      const rawDomain = root.digitalDomainSslDto || root.digitaldomainssldto || main.domaindetail || main.digitalDomainSslDto;
      const domainDetail = rawDomain
        ? {
            id: rawDomain.id || "",
            digitalassetid: rawDomain.digital_asset_id || rawDomain.digitalAssetId || rawDomain.digitalassetid || "",
            recordtype: rawDomain.record_type || rawDomain.recordType || rawDomain.recordtype || "DOMAIN",
            domainname: rawDomain.domain_name || rawDomain.domainName || rawDomain.domainname || "",
            programtag: rawDomain.program_tag || rawDomain.programTag || rawDomain.programtag || "",
            functionalscope: rawDomain.functional_scope || rawDomain.functionalScope || rawDomain.functionalscope || "",
            marketingtarget: rawDomain.marketing_target || rawDomain.marketingTarget || rawDomain.marketingtarget || "",
            ssltype: rawDomain.ssl_type || rawDomain.sslType || rawDomain.ssltype || "",
            bounddomainlist: rawDomain.bound_domain_list || rawDomain.boundDomainList || rawDomain.bounddomainlist || "",
            autorenew: Boolean(rawDomain.auto_renew ?? rawDomain.autoRenew ?? rawDomain.autorenew ?? false),
          }
        : undefined;

      const rawCloud = root.digitalCloudServerDto || root.digitalcloudserverdto || main.cloudserverdetail || main.digitalCloudServerDto;
      const cloudDetail = rawCloud
        ? {
            id: rawCloud.id || "",
            digitalassetid: rawCloud.digital_asset_id || rawCloud.digitalAssetId || rawCloud.digitalassetid || "",
            clustername: rawCloud.cluster_name || rawCloud.clusterName || rawCloud.clustername || "",
            purpose: rawCloud.purpose || "",
            vcpucount: rawCloud.vcpu_count ?? rawCloud.vCpuCount ?? rawCloud.vcpuCount ?? rawCloud.vcpucount ?? undefined,
            ramgb: rawCloud.ram_gb ?? rawCloud.ramGb ?? rawCloud.ramgb ?? undefined,
            storagespec: rawCloud.storage_spec || rawCloud.storageSpec || rawCloud.storagespec || "",
            operatingsystem: rawCloud.operating_system || rawCloud.operatingSystem || rawCloud.operatingsystem || "",
            ipprivate: rawCloud.ip_private || rawCloud.ipPrivate || rawCloud.ipprivate || "",
            ippublic: rawCloud.ip_public || rawCloud.ipPublic || rawCloud.ippublic || "",
            allocatedipcount: rawCloud.allocated_ip_count ?? rawCloud.allocatedIpCount ?? rawCloud.allocatedipcount ?? undefined,
            costpermonth: rawCloud.cost_per_month ?? rawCloud.costPerMonth ?? rawCloud.costpermonth ?? undefined,
          }
        : undefined;

      const rawInternet = root.digitalInternetLineDto || root.digitalinternetlinedto || main.internetlinedetail || main.digitalInternetLineDto;
      const internetDetail = rawInternet
        ? {
            id: rawInternet.id || "",
            digitalassetid: rawInternet.digital_asset_id || rawInternet.digitalAssetId || rawInternet.digitalassetid || "",
            linetype: rawInternet.line_type || rawInternet.lineType || rawInternet.linetype || "",
            domesticbandwidthmbps: rawInternet.domestic_bandwidth_mbps ?? rawInternet.domesticBandwidthMbps ?? rawInternet.domesticbandwidthmbps ?? undefined,
            internationalminbandwidthmbps: rawInternet.international_min_bandwidth_mbps ?? rawInternet.internationalMinBandwidthMbps ?? rawInternet.internationalminbandwidthmbps ?? undefined,
            monthlyfee: rawInternet.monthly_fee ?? rawInternet.monthlyFee ?? rawInternet.monthlyfee ?? undefined,
            annualfee: rawInternet.annual_fee ?? rawInternet.annualFee ?? rawInternet.annualfee ?? undefined,
            iptype: rawInternet.ip_type || rawInternet.ipType || rawInternet.iptype || "",
            staticipaddress: rawInternet.static_ip_address || rawInternet.staticIpAddress || rawInternet.staticipaddress || "",
          }
        : undefined;

      const rawLicense = root.digitalSoftwareLicenseDto || root.digitalsoftwarelicensedto || main.softwarelicensedetail || main.digitalSoftwareLicenseDto;
      const licenseDetail = rawLicense
        ? {
            id: rawLicense.id || "",
            digitalassetid: rawLicense.digital_asset_id || rawLicense.digitalAssetId || rawLicense.digitalassetid || "",
            softwarename: rawLicense.software_name || rawLicense.softwareName || rawLicense.softwarename || "",
            licensekey: rawLicense.license_key || rawLicense.licenseKey || rawLicense.licensekey || "",
            boundhardwareserial: rawLicense.bound_hardware_serial || rawLicense.boundHardwareSerial || rawLicense.boundhardwareserial || "",
            totalseats: rawLicense.total_seats ?? rawLicense.totalSeats ?? rawLicense.totalseats ?? undefined,
            allocatedseats: rawLicense.allocated_seats ?? rawLicense.allocatedSeats ?? rawLicense.allocatedseats ?? undefined,
            isperpetual: Boolean(rawLicense.is_perpetual ?? rawLicense.isPerpetual ?? rawLicense.isperpetual ?? false),
          }
        : undefined;

      const rawSaas = root.digitalSaasAccountDto || root.digitalsaasaccountdto || main.saasdetail || main.digitalSaasAccountDto;
      const saasDetail = rawSaas
        ? {
            id: rawSaas.id || "",
            digitalassetid: rawSaas.digital_asset_id || rawSaas.digitalAssetId || rawSaas.digitalassetid || "",
            servicebrand: rawSaas.service_brand || rawSaas.serviceBrand || rawSaas.servicebrand || "",
            plantier: rawSaas.plan_tier || rawSaas.planTier || rawSaas.plantier || "",
            adminaccountemail: rawSaas.admin_account_email || rawSaas.adminAccountEmail || rawSaas.adminaccountemail || "",
            totallicensesbought: rawSaas.total_licenses_bought ?? rawSaas.totalLicensesBought ?? rawSaas.totallicensesbought ?? undefined,
            storagequota: rawSaas.storage_quota || rawSaas.storageQuota || rawSaas.storagequota || "",
          }
        : undefined;

      reset({
        id: String(main.id || assetId),
        assetcode: main.assetCode || main.assetcode || "",
        name: main.name || "",
        assetsubtype: normalizeSubType(main.assetSubType || main.assetsubtype || "DOMAIN"),
        contractnumber: main.contractNumber || main.contractnumber || "",
        categoryid: main.categoryId ?? main.categoryid ?? undefined,
        statusid: main.statusId ?? main.statusid ?? undefined,
        supplierid: main.supplierId ?? main.supplierid ?? undefined,
        departmentid: main.departmentId ?? main.departmentid ?? undefined,
        costamount: Number(main.costAmount ?? main.costamount ?? 0),
        currency: main.currency || "VND",
        billingcycle: main.billingCycle || main.billingcycle || "YEARLY",
        startdate: main.startDate ? new Date(main.startDate) : (main.startdate ? new Date(main.startdate) : defaultStartDate),
        expirydate: main.expiryDate ? new Date(main.expiryDate) : (main.expirydate ? new Date(main.expirydate) : defaultExpiryDate),
        renewalalertdate: main.renewalAlertDate ? new Date(main.renewalAlertDate) : (main.renewalalertdate ? new Date(main.renewalalertdate) : null),
        description: main.description || "",
        domaindetail: domainDetail,
        cloudserverdetail: cloudDetail,
        internetlinedetail: internetDetail,
        softwarelicensedetail: licenseDetail,
        saasdetail: saasDetail,
      });
    }
  }, [isEdit, assetDetail, assetId, reset]);

  // Khởi tạo GUID cho bản ghi cha và các giá trị mặc định khi vào trang tạo mới
  useEffect(() => {
    if (!isEdit) {
      if (!watch("id")) {
        setValue("id", generateGuid());
      }
      if (!watch("assetcode")) {
        const code = digitalAssetService.generateAssetCode(currentSubtype);
        setValue("assetcode", code, { shouldValidate: true });
        clearErrors("assetcode");
      }
      if (!watch("categoryid") && assetCategories?.length) {
        const matchedCat = assetCategories.find((c) => {
          const cName = c.name?.toLowerCase() || "";
          const tVal = currentSubtype.toLowerCase();
          return (
            cName.includes(tVal) ||
            (currentSubtype === "DOMAIN" && (cName.includes("tên miền") || cName.includes("domain"))) ||
            (currentSubtype === "SSL" && (cName.includes("ssl") || cName.includes("chứng chỉ"))) ||
            (currentSubtype === "CLOUD_SERVER" && (cName.includes("máy chủ") || cName.includes("cloud") || cName.includes("vps") || cName.includes("server"))) ||
            (currentSubtype === "SOFTWARE_LICENSE" && (cName.includes("phần mềm") || cName.includes("bản quyền") || cName.includes("license"))) ||
            (currentSubtype === "SAAS_SUBSCRIPTION" && (cName.includes("saas") || cName.includes("dịch vụ"))) ||
            (currentSubtype === "INTERNET_LINE" && (cName.includes("đường truyền") || cName.includes("internet") || cName.includes("mạng")))
          );
        });
        if (matchedCat && typeof matchedCat.id === "number") {
          setValue("categoryid", matchedCat.id, { shouldValidate: true });
          clearErrors("categoryid");
        }
      }
      if (!watch("statusid") && assetStatusData?.length) {
        const defaultStatus =
          assetStatusData.find(
            (s) =>
              s.name?.toLowerCase().includes("sử dụng") ||
              s.name?.toLowerCase().includes("hoạt động") ||
              s.name?.toLowerCase().includes("sẵn sàng")
          ) || assetStatusData[0];
        if (defaultStatus && typeof defaultStatus.id === "number") {
          setValue("statusid", defaultStatus.id, { shouldValidate: true });
          clearErrors("statusid");
        }
      }
    }
  }, [isEdit, setValue, watch, currentSubtype, assetCategories, assetStatusData, clearErrors]);

  // Tự động tạo mã tài sản số
  const handleGenerateCode = () => {
    if (isEdit) return;
    const code = digitalAssetService.generateAssetCode(currentSubtype);
    setValue("assetcode", code, { shouldValidate: true });
    clearErrors("assetcode");
    toast.success(`Đã tự động tạo mã: ${code}`);
  };

  // Callback khi form có lỗi validation từ Zod/react-hook-form
  const onInvalid = (fieldErrors: any) => {
    console.warn("Validation failed on fields:", fieldErrors);

    const getMessages = (errObj: any): string[] => {
      let msgs: string[] = [];
      if (!errObj || typeof errObj !== "object") return msgs;
      for (const key of Object.keys(errObj)) {
        const item = errObj[key];
        if (!item) continue;
        if (item.message && typeof item.message === "string") {
          msgs.push(item.message);
        } else if (typeof item === "object") {
          msgs = msgs.concat(getMessages(item));
        }
      }
      return msgs;
    };

    const messages = getMessages(fieldErrors);
    if (messages.length > 0) {
      toast.error(`Chưa thể lưu: ${messages[0]}`);
    } else {
      toast.error("Vui lòng kiểm tra lại các trường thông tin bắt buộc.");
    }
  };

  // Submit Handler
  const onSubmit = async (data: DigitalAssetFormData) => {
    // Validate ngày bắt đầu & hết hạn
    if (data.startdate && data.expirydate) {
      const isValid = checkDateValidity(data.startdate, data.expirydate, setError, clearErrors);
      if (!isValid) return;
    }

    try {
      // Helper đảm bảo GUID luôn hợp lệ (không rỗng, không phải all-zeros)
      const ensureValidGuid = (val?: string | null): string => {
        if (val && val.trim() && val !== "00000000-0000-0000-0000-000000000000") {
          return val.trim();
        }
        return generateGuid();
      };

      // 1. Xác định id của bản ghi cha (digitalAssetDto)
      const mainId = isEdit && assetId ? String(assetId) : ensureValidGuid(data.id);

      const isDomainOrSsl = data.assetsubtype === "DOMAIN" || data.assetsubtype === "SSL";

      // 2. Chuẩn bị DTO chi tiết kỹ thuật con:
      // Tự sinh GUID cho id con nếu thêm mới (hoặc giữ id cũ khi edit)
      // Và gán digitalassetid = mainId (lấy id của thằng cha)
      let digitalDomainSslDto = null;
      let digitalCloudServerDto = null;
      let digitalInternetLineDto = null;
      let digitalSoftwareLicenseDto = null;
      let digitalSaasAccountDto = null;

      if (isDomainOrSsl) {
        const rawDomain = (data.domaindetail as any) || {};
        const childId = isEdit ? ensureValidGuid(rawDomain.id) : generateGuid();
        digitalDomainSslDto = {
          id: childId,
          digitalassetid: mainId,
          recordtype: rawDomain.recordtype || (data.assetsubtype === "DOMAIN" ? "DOMAIN" : "SSL_CERTIFICATE"),
          domainname: rawDomain.domainname?.trim() || data.name?.trim(),
          programtag: rawDomain.programtag?.trim() || null,
          functionalscope: rawDomain.functionalscope?.trim() || null,
          marketingtarget: rawDomain.marketingtarget?.trim() || null,
          ssltype: rawDomain.ssltype?.trim() || null,
          bounddomainlist: rawDomain.bounddomainlist?.trim() || null,
          autorenew: Boolean(rawDomain.autorenew ?? false),
        };
      } else if (data.assetsubtype === "CLOUD_SERVER") {
        const rawCloud = ((data as any).cloudserverdetail as any) || {};
        const childId = isEdit ? ensureValidGuid(rawCloud.id) : generateGuid();
        digitalCloudServerDto = {
          id: childId,
          digitalassetid: mainId,
          clustername: rawCloud.clustername?.trim() || null,
          purpose: rawCloud.purpose?.trim() || null,
          vcpucount: Number(rawCloud.vcpucount || 0),
          ramgb: Number(rawCloud.ramgb || 0),
          storagespec: rawCloud.storagespec?.trim() || null,
          operatingsystem: rawCloud.operatingsystem?.trim() || null,
          ipprivate: rawCloud.ipprivate?.trim() || null,
          ippublic: rawCloud.ippublic?.trim() || null,
          allocatedipcount: Number(rawCloud.allocatedipcount || 0),
          costpermonth: Number(rawCloud.costpermonth || 0),
        };
      } else if (data.assetsubtype === "INTERNET_LINE") {
        const rawLine = (data.internetlinedetail as any) || {};
        const childId = isEdit ? ensureValidGuid(rawLine.id) : generateGuid();
        digitalInternetLineDto = {
          id: childId,
          digitalassetid: mainId,
          linetype: rawLine.linetype?.trim() || null,
          domesticbandwidthmbps: Number(rawLine.domesticbandwidthmbps || 0),
          internationalminbandwidthmbps: Number(rawLine.internationalminbandwidthmbps || 0),
          monthlyfee: Number(rawLine.monthlyfee || 0),
          annualfee: Number(rawLine.annualfee || 0),
          iptype: rawLine.iptype?.trim() || null,
          staticipaddress: rawLine.staticipaddress?.trim() || null,
        };
      } else if (data.assetsubtype === "SOFTWARE_LICENSE" || data.assetsubtype === "SOFTWARE") {
        const rawLic = (data.softwarelicensedetail as any) || {};
        const childId = isEdit ? ensureValidGuid(rawLic.id) : generateGuid();
        digitalSoftwareLicenseDto = {
          id: childId,
          digitalassetid: mainId,
          softwarename: rawLic.softwarename?.trim() || data.name?.trim() || "Bản quyền phần mềm",
          licensekey: rawLic.licensekey?.trim() || null,
          boundhardwareserial: rawLic.boundhardwareserial?.trim() || null,
          totalseats: Number(rawLic.totalseats || 0),
          allocatedseats: Number(rawLic.allocatedseats || 0),
          isperpetual: Boolean(rawLic.isperpetual ?? false),
        };
      } else if (data.assetsubtype === "SAAS_SUBSCRIPTION") {
        const rawSaas = (data.saasdetail as any) || {};
        const childId = isEdit ? ensureValidGuid(rawSaas.id) : generateGuid();
        digitalSaasAccountDto = {
          id: childId,
          digitalassetid: mainId,
          servicebrand: rawSaas.servicebrand?.trim() || null,
          plantier: rawSaas.plantier?.trim() || null,
          adminaccountemail: rawSaas.adminaccountemail?.trim() || null,
          totallicensesbought: Number(rawSaas.totallicensesbought || 0),
          storagequota: rawSaas.storagequota?.trim() || null,
        };
      }

      const payload: any = {
        digitalAssetDto: {
          id: mainId,
          assetcode: data.assetcode?.trim(),
          name: data.name?.trim(),
          assetsubtype: data.assetsubtype,
          contractnumber: data.contractnumber?.trim() || null,
          categoryid: data.categoryid || null,
          statusid: data.statusid || null,
          supplierid: data.supplierid || null,
          departmentid: data.departmentid || null,
          costamount: Number(data.costamount || 0),
          currency: data.currency || "VND",
          billingcycle: data.billingcycle || "Hàng năm",
          startdate: data.startdate,
          expirydate: data.expirydate,
          renewalalertdate: data.renewalalertdate || null,
          description: data.description?.trim() || null,
        },
        digitalDomainSslDto,
        digitalCloudServerDto,
        digitalInternetLineDto,
        digitalSoftwareLicenseDto,
        digitalSaasAccountDto,
      };

      if (isEdit && assetId) {
        await updateMutation.mutateAsync({
          id: assetId,
          params: payload,
        });
        toast.success("Cập nhật tài nguyên số thành công!");
      } else {
        await addMutation.mutateAsync(payload);
        toast.success("Thêm mới tài nguyên số thành công!");
      }
      navigate("/tai-nguyen-so");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Có lỗi xảy ra khi lưu tài nguyên số");
    }
  };

  // Phím tắt Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSubmit(onSubmit, onInvalid)();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit, onSubmit, onInvalid]);

  const currentTypeConfig = DIGITAL_ASSET_SUBTYPES.find((t) => t.value === currentSubtype) || DIGITAL_ASSET_SUBTYPES[0];

  return (
    <>
      <PageMeta
        title={isEdit ? "Chỉnh sửa tài nguyên số | AIMS Enterprise" : "Thêm mới tài nguyên số | AIMS Enterprise"}
        description="Khởi tạo hoặc cập nhật hồ sơ hạ tầng số: Domain, SSL, Cloud, SaaS, License & Đường truyền Internet"
      />

      <div className="space-y-4">
        {/* Module Sub-Navbar */}
        <AimsModuleNav
          moduleName="Quản lý Tài sản IT"
          moduleIcon={
            <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          }
          tabs={[
            { name: "Thiết bị phần cứng", path: "/thiet-bi-phan-cung" },
            { name: "Tài nguyên số", path: "/tai-nguyen-so" },
            {
              name: isEdit ? "Chỉnh sửa tài nguyên" : "Thêm mới tài nguyên",
              path: isEdit ? `/tai-nguyen-so/${id}/chinh-sua` : "/tai-nguyen-so/tao-moi",
            },
            { name: "Giám sát máy trạm", path: "/giam-sat-may-tram" },
          ]}
        />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-gray-200/80 dark:border-gray-800">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <span>{isEdit ? "Chỉnh sửa tài nguyên số" : "Thêm mới tài nguyên số"}</span>
              {isEdit && (
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  ID: #{id}
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Điền đầy đủ thông tin định danh, cấu hình thông số kỹ thuật và chu kỳ thanh toán.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate("/tai-nguyen-so")}
              className="text-xs font-semibold h-8.5 cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại danh sách
            </Button>
          </div>
        </div>

        {/* 1. CHỌN LOẠI TÀI NGUYÊN SỐ (HERO SELECTOR - COMPACT) */}
        <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-3 sm:p-4 shadow-xs">
          <div className="pb-2.5 mb-2.5 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-brand-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              Chọn loại tài nguyên số
              {isEdit && (
                <span className="text-[10px] font-medium normal-case px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/80 flex items-center gap-1">
                  <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Chế độ sửa: Cố định loại tài nguyên
                </span>
              )}
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {isEdit
                ? "Đang cố định loại tài nguyên của hồ sơ này để đảm bảo toàn vẹn cấu trúc dữ liệu."
                : "Mỗi loại tài nguyên sẽ tự động liên kết với cấu trúc DTO và Schema kiểm tra chuyên biệt."}
            </p>
          </div>

          {/* Các Thẻ chọn nhanh 6 loại */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {DIGITAL_ASSET_SUBTYPES.map((type) => {
              const isSelected = currentSubtype === type.value;
              const isDisabled = isEdit && !isSelected;
              return (
                <button
                  type="button"
                  key={type.value}
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return;
                    setValue("assetsubtype", type.value, { shouldValidate: true });
                    clearErrors("assetsubtype");

                    // Tự động liên kết danh mục tài sản tương ứng nếu chưa chọn hoặc khớp
                    if (assetCategories?.length) {
                      const matchedCat = assetCategories.find((c) => {
                        const cName = c.name?.toLowerCase() || "";
                        const tVal = type.value.toLowerCase();
                        const tLabel = type.label.toLowerCase();
                        return (
                          cName.includes(tLabel) ||
                          cName.includes(tVal) ||
                          (type.value === "DOMAIN" && (cName.includes("tên miền") || cName.includes("domain"))) ||
                          (type.value === "SSL" && (cName.includes("ssl") || cName.includes("chứng chỉ"))) ||
                          (type.value === "CLOUD_SERVER" && (cName.includes("máy chủ") || cName.includes("cloud") || cName.includes("vps") || cName.includes("server"))) ||
                          (type.value === "SOFTWARE_LICENSE" && (cName.includes("phần mềm") || cName.includes("bản quyền") || cName.includes("license"))) ||
                          (type.value === "SAAS_SUBSCRIPTION" && (cName.includes("saas") || cName.includes("dịch vụ"))) ||
                          (type.value === "INTERNET_LINE" && (cName.includes("đường truyền") || cName.includes("internet") || cName.includes("mạng")))
                        );
                      });
                      if (matchedCat && typeof matchedCat.id === "number") {
                        setValue("categoryid", matchedCat.id, { shouldValidate: true });
                        clearErrors("categoryid");
                      }
                    }

                    if (!isEdit && !watchedValues.assetcode) {
                      const code = digitalAssetService.generateAssetCode(type.value);
                      setValue("assetcode", code, { shouldValidate: true });
                    }
                  }}
                  title={isDisabled ? "Không thể chọn loại tài nguyên khác khi đang chỉnh sửa" : undefined}
                  className={`relative text-left p-2.5 rounded-lg border transition-all duration-200 flex items-center gap-2.5 group ${isSelected
                      ? "border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/70 dark:bg-brand-950/50 shadow-xs cursor-default"
                      : isDisabled
                        ? "border-gray-200/50 dark:border-gray-800/40 bg-gray-100/60 dark:bg-gray-800/20 opacity-40 cursor-not-allowed select-none"
                        : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer"
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-transform ${!isDisabled ? "group-hover:scale-105" : "grayscale opacity-75"
                      } ${type.color}`}
                  >
                    {type.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-bold truncate ${isSelected
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

        {/* TWO-COLUMN BALANCED LAYOUT (8 COLS / 4 COLS) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          {/* CỘT TRÁI (8 COLS): FORM NHẬP LIỆU GỌN GÀNG */}
          <div className="xl:col-span-8 space-y-4">
            {/* 2. ĐỊNH DANH TÀI NGUYÊN SỐ & QUẢN LÝ (DIGITALASSETDTO) */}
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
                  Định danh tài nguyên số & Quản lý (digitalassetdto)
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
                      onClick={handleGenerateCode}
                      className="text-[11px] leading-none text-brand-600 dark:text-brand-400 font-medium hover:underline flex items-center gap-0.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                      title={isEdit ? "Không thể tự tạo lại mã khi đang chỉnh sửa" : undefined}
                    >
                      ⚡ Tạo mã
                    </button>
                  </div>
                  <Input
                    size="sm"
                    type="text"
                    {...register("assetcode")}
                    error={!!errors.assetcode}
                    hint={errors.assetcode?.message}
                    placeholder="VD: DOM-2026-001"
                    className="font-mono font-semibold"
                  />
                </div>

                {/* Tên tài nguyên số */}
                <div className="sm:col-span-1 lg:col-span-2">
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên tài nguyên / Dịch vụ số *
                  </Label>
                  <Input
                    size="sm"
                    type="text"
                    {...register("name")}
                    error={!!errors.name}
                    hint={errors.name?.message}
                    placeholder={
                      currentSubtype === "DOMAIN"
                        ? "VD: aum.edu.vn, portal.aum.edu.vn"
                        : currentSubtype === "SSL"
                          ? "VD: Sectigo Wildcard SSL (*.aum.edu.vn)"
                          : currentSubtype === "SAAS_SUBSCRIPTION"
                            ? "VD: Microsoft 365 E5 Enterprise (Khối Đào tạo)"
                            : currentSubtype === "CLOUD_SERVER"
                              ? "VD: Cụm máy chủ Database Master (Viettel IDC)"
                              : "VD: Nhập tên tài sản hoặc dịch vụ số..."
                    }
                  />
                </div>

                {/* Danh mục tài sản số */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Danh mục tài sản số *
                  </Label>
                  <Controller
                    control={control}
                    name="categoryid"
                    render={({ field }) => (
                      <Select
                        size="sm"
                        options={(assetCategories || []).map((c) => ({ value: c.id, label: c.name }))}
                        value={field.value ?? undefined}
                        onChange={(val) => {
                          const num = val ? Number(val) : undefined;
                          field.onChange(num);
                          clearErrors("categoryid");
                          if (!isEdit && !watchedValues.assetcode) {
                            const foundCat = assetCategories?.find((c) => c.id === num);
                            const code = digitalAssetService.generateAssetCode(foundCat?.name || currentSubtype);
                            setValue("assetcode", code, { shouldValidate: true });
                          }
                        }}
                        placeholder="Chọn danh mục..."
                        disabled={isEdit}
                        error={!!errors.categoryid}
                        hint={errors.categoryid?.message}
                      />
                    )}
                  />
                </div>

                {/* Trạng thái vận hành */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái vận hành *
                  </Label>
                  <Controller
                    control={control}
                    name="statusid"
                    render={({ field }) => (
                      <Select
                        size="sm"
                        options={(assetStatusData || []).map((s) => ({ value: s.id, label: s.name }))}
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val ? Number(val) : undefined);
                          clearErrors("statusid");
                        }}
                        placeholder="Chọn trạng thái..."
                        error={!!errors.statusid}
                        hint={errors.statusid?.message}
                      />
                    )}
                  />
                </div>

                {/* Số hợp đồng / Mã dịch vụ */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Số hợp đồng / Mã dịch vụ
                  </Label>
                  <Input
                    size="sm"
                    type="text"
                    {...register("contractnumber")}
                    error={!!errors.contractnumber}
                    hint={errors.contractnumber?.message}
                    placeholder="VD: HD-IT-2026-09"
                    className="font-mono"
                  />
                </div>

                {/* Nhà cung cấp dịch vụ */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nhà cung cấp dịch vụ
                  </Label>
                  <Controller
                    control={control}
                    name="supplierid"
                    render={({ field }) => (
                      <Select
                        size="sm"
                        options={(supplierData || []).map((s) => ({ value: s.id, label: s.name }))}
                        value={field.value ?? undefined}
                        onChange={(val) => {
                          field.onChange(val ? Number(val) : undefined);
                          clearErrors("supplierid");
                        }}
                        placeholder="Chọn nhà cung cấp..."
                        error={!!errors.supplierid}
                        hint={errors.supplierid?.message}
                      />
                    )}
                  />
                </div>

                {/* Phòng ban quản lý / sử dụng */}
                <div className="sm:col-span-1 lg:col-span-2">
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phòng ban quản lý / thụ hưởng
                  </Label>
                  <Controller
                    control={control}
                    name="departmentid"
                    render={({ field }) => (
                      <Select
                        size="sm"
                        options={(departmentData || []).map((d) => ({ value: d.id, label: d.name }))}
                        value={field.value ?? undefined}
                        onChange={(val) => {
                          field.onChange(val ? Number(val) : undefined);
                          clearErrors("departmentid");
                        }}
                        placeholder="Chọn phòng ban..."
                        error={!!errors.departmentid}
                        hint={errors.departmentid?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 3. THÔNG SỐ KỸ THUẬT CHUẨN DTO ([LOẠI]) */}
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center text-xs">⚙️</span>
                    Thông số kỹ thuật chuẩn DTO ({currentTypeConfig.label})
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Các trường dữ liệu khớp chuẩn thực thể DTO và validate bằng Schema tương ứng.
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {currentTypeConfig.acronym}
                </span>
              </div>

              {/* DOMAIN & SSL */}
              {(currentSubtype === "DOMAIN" || currentSubtype === "SSL") && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Loại bản ghi
                      </Label>
                      <Controller
                        control={control}
                        name="domaindetail.recordtype"
                        defaultValue="DOMAIN"
                        render={({ field }) => (
                          <Select
                            size="sm"
                            options={domainsslList.map((i) => ({ value: i.value, label: i.label }))}
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            placeholder="Chọn loại bản ghi..."
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tên miền kỹ thuật (FQDN)
                      </Label>
                      <Input
                        size="sm"
                        type="text"
                        placeholder="VD: aum.edu.vn"
                        {...register("domaindetail.domainname")}
                        error={!!domainErrors?.domainname}
                        hint={domainErrors?.domainname?.message}
                      />
                    </div>

                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Hệ thống / Chương trình phục vụ
                      </Label>
                      <Controller
                        control={control}
                        name="domaindetail.programtag"
                        render={({ field }) => (
                          <Select
                            size="sm"
                            options={relatedProgramList.map((i) => ({ value: i.value, label: i.label }))}
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            placeholder="Chọn hệ thống..."
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phạm vi chức năng
                      </Label>
                      <Controller
                        control={control}
                        name="domaindetail.functionalscope"
                        render={({ field }) => (
                          <Select
                            size="sm"
                            options={functionalScopeList.map((i) => ({ value: i.value, label: i.label }))}
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            placeholder="Chọn phạm vi..."
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mục tiêu Marketing / SEO
                      </Label>
                      <Controller
                        control={control}
                        name="domaindetail.marketingtarget"
                        render={({ field }) => (
                          <Select
                            size="sm"
                            options={domainSslPurposeList.map((i) => ({ value: i.value, label: i.label }))}
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            placeholder="Chọn mục tiêu..."
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Loại chứng thư SSL
                      </Label>
                      <Controller
                        control={control}
                        name="domaindetail.ssltype"
                        render={({ field }) => (
                          <Select
                            size="sm"
                            options={domainsslTypeList.map((i) => ({ value: i.value, label: i.label }))}
                            value={field.value}
                            onChange={(val) => field.onChange(val)}
                            placeholder="Chọn loại SSL..."
                          />
                        )}
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Danh sách SAN Domains (Subject Alternative Names)
                      </Label>
                      <Input
                        size="sm"
                        type="text"
                        placeholder="VD: *.aum.edu.vn, aum.edu.vn, portal.aum.edu.vn"
                        {...register("domaindetail.bounddomainlist")}
                        error={!!domainErrors?.bounddomainlist}
                        hint={domainErrors?.bounddomainlist?.message}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-gray-200/90 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 flex items-center gap-2.5">
                    <Controller
                      control={control}
                      name="domaindetail.autorenew"
                      defaultValue={false}
                      render={({ field }) => (
                        <Checkbox
                          checked={Boolean(field.value)}
                          onChange={(checked: boolean) => field.onChange(checked)}
                        />
                      )}
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Tự động gia hạn khi đến kỳ thanh toán
                      </span>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Hệ thống sẽ gửi cảnh báo trước 30 ngày cho quản trị viên và chuẩn bị đề xuất thanh toán.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* CLOUD SERVER / VPS */}
              {currentSubtype === "CLOUD_SERVER" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Địa chỉ IP Public
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      placeholder="VD: 103.142.109.25"
                      {...register("cloudserverdetail.ippublic" as any)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Địa chỉ IP Private
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      placeholder="VD: 10.0.1.15"
                      {...register("cloudserverdetail.ipprivate" as any)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hệ điều hành (OS)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      placeholder="VD: Ubuntu 24.04 LTS, Windows Server"
                      {...register("cloudserverdetail.operatingsystem" as any)}
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số vCPU Cores
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      placeholder="VD: 8"
                      {...register("cloudserverdetail.vcpucount" as any, { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dung lượng RAM (GB)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      placeholder="VD: 32"
                      {...register("cloudserverdetail.ramgb" as any, { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thông số Storage
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      placeholder="VD: 500GB NVMe SSD"
                      {...register("cloudserverdetail.storagespec" as any)}
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cụm Cluster / Mục đích sử dụng
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      placeholder="VD: Cụm LMS Production - Viettel IDC Hòa Lạc"
                      {...register("cloudserverdetail.clustername" as any)}
                    />
                  </div>
                </div>
              )}

              {/* INTERNET LINE */}
              {currentSubtype === "INTERNET_LINE" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loại đường truyền
                    </Label>
                    <Controller
                      control={control}
                      name="internetlinedetail.linetype"
                      render={({ field }) => (
                        <Select
                          size="sm"
                          options={internetLineTypeList.map((i) => ({ value: i.value, label: i.label }))}
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Chọn loại đường truyền..."
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loại địa chỉ IP
                    </Label>
                    <Controller
                      control={control}
                      name="internetlinedetail.iptype"
                      render={({ field }) => (
                        <Select
                          size="sm"
                          options={ipTypeList.map((i) => ({ value: i.value, label: i.label }))}
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Chọn loại IP..."
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Băng thông trong nước (Mbps)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      placeholder="VD: 300"
                      {...register("internetlinedetail.domesticbandwidthmbps", { valueAsNumber: true })}
                      error={!!internetErrors?.domesticbandwidthmbps}
                    />
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Băng thông quốc tế tối thiểu (Mbps)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      placeholder="VD: 10"
                      {...register("internetlinedetail.internationalminbandwidthmbps", { valueAsNumber: true })}
                      error={!!internetErrors?.internationalminbandwidthmbps}
                      hint={internetErrors?.internationalminbandwidthmbps?.message}
                    />
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cước phí tháng (VNĐ)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      placeholder="VD: 1500000"
                      {...register("internetlinedetail.monthlyfee", { valueAsNumber: true })}
                    />
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cước phí năm (VNĐ)
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      placeholder="VD: 18000000"
                      {...register("internetlinedetail.annualfee", { valueAsNumber: true })}
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-3">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dải IP tĩnh cấp kèm
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      placeholder="VD: 118.70.124.25/29 (Gồm 5 IP khả dụng)"
                      {...register("internetlinedetail.staticipaddress")}
                      className="font-mono"
                    />
                  </div>
                </div>
              )}

              {/* SOFTWARE LICENSE */}
              {(currentSubtype === "SOFTWARE_LICENSE" || currentSubtype === "SOFTWARE") && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tên phần mềm
                      </Label>
                      <Input
                        size="sm"
                        type="text"
                        placeholder="VD: Microsoft Office 365, Adobe CC"
                        {...register("softwarelicensedetail.softwarename")}
                        error={!!licenseErrors?.softwarename}
                        hint={licenseErrors?.softwarename?.message}
                      />
                    </div>

                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Khóa bản quyền (License Key)
                      </Label>
                      <Input
                        size="sm"
                        type="text"
                        placeholder="VD: XXXXX-XXXXX-XXXXX-XXXXX"
                        {...register("softwarelicensedetail.licensekey")}
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Serial phần cứng gắn kèm
                      </Label>
                      <Input
                        size="sm"
                        type="text"
                        placeholder="VD: DELL-SN-998811 hoặc để trống"
                        {...register("softwarelicensedetail.boundhardwareserial")}
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tổng số lượng (Total Seats)
                      </Label>
                      <Input
                        size="sm"
                        type="number"
                        placeholder="VD: 5"
                        {...register("softwarelicensedetail.totalseats", { valueAsNumber: true })}
                        error={!!licenseErrors?.totalseats}
                        hint={licenseErrors?.totalseats?.message}
                      />
                    </div>

                    <div>
                      <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Đã cấp phát (Allocated Seats)
                      </Label>
                      <Input
                        size="sm"
                        type="number"
                        placeholder="VD: 2"
                        {...register("softwarelicensedetail.allocatedseats", { valueAsNumber: true })}
                        error={!!licenseErrors?.allocatedseats}
                        hint={licenseErrors?.allocatedseats?.message}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg border border-gray-200/90 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 flex items-center gap-2.5">
                    <Controller
                      control={control}
                      name="softwarelicensedetail.isperpetual"
                      defaultValue={false}
                      render={({ field }) => (
                        <Checkbox
                          checked={Boolean(field.value)}
                          onChange={(checked: boolean) => field.onChange(checked)}
                        />
                      )}
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Bản quyền vĩnh viễn (Perpetual License)
                      </span>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        Tích chọn nếu giấy phép sử dụng trọn đời, không phụ thuộc vào chu kỳ gia hạn.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SAAS ACCOUNT */}
              {currentSubtype === "SAAS_SUBSCRIPTION" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nền tảng / Thương hiệu *
                    </Label>
                    <Controller
                      control={control}
                      name="saasdetail.servicebrand"
                      render={({ field }) => (
                        <Select
                          size="sm"
                          options={serviceBrandList.map((i) => ({ value: i.value, label: i.label }))}
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Chọn thương hiệu..."
                          error={!!saasErrors?.servicebrand}
                          hint={saasErrors?.servicebrand?.message}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gói dịch vụ (Plan Tier)
                    </Label>
                    <Controller
                      control={control}
                      name="saasdetail.plantier"
                      render={({ field }) => (
                        <Select
                          size="sm"
                          options={defaultPlanTierList.map((i) => ({ value: i.value, label: i.label }))}
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          placeholder="Chọn gói..."
                          error={!!saasErrors?.plantier}
                          hint={saasErrors?.plantier?.message}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hạn mức lưu trữ (Storage Quota)
                    </Label>
                    <Input
                      size="sm"
                      type="text"
                      placeholder="VD: 50GB, 1TB hoặc Không giới hạn"
                      {...register("saasdetail.storagequota")}
                      error={!!saasErrors?.storagequota}
                      hint={saasErrors?.storagequota?.message}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email quản trị (Admin Account) *
                    </Label>
                    <Input
                      size="sm"
                      type="email"
                      placeholder="VD: it-admin@aum.edu.vn"
                      {...register("saasdetail.adminaccountemail")}
                      error={!!saasErrors?.adminaccountemail}
                      hint={saasErrors?.adminaccountemail?.message}
                    />
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số lượng tài khoản (Seats) *
                    </Label>
                    <Input
                      size="sm"
                      type="number"
                      placeholder="VD: 50"
                      {...register("saasdetail.totallicensesbought", { valueAsNumber: true })}
                      error={!!saasErrors?.totallicensesbought}
                      hint={saasErrors?.totallicensesbought?.message}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. CHẾ ĐỘ THANH TOÁN & THỜI HẠN DỊCH VỤ */}
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                  Chi phí, Chu kỳ & Thời hạn dịch vụ (digitalassetdto)
                </h3>
                <span className="text-[11px] text-gray-400 font-medium">
                  Tài chính & Hiệu lực
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Chi phí định kỳ */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chi phí / Giá mua
                  </Label>
                  <Controller
                    control={control}
                    name="costamount"
                    render={({ field }) => (
                      <Input
                        size="sm"
                        type="number"
                        placeholder="VD: 15000000"
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                        error={!!errors.costamount}
                        hint={errors.costamount?.message}
                      />
                    )}
                  />
                </div>

                {/* Loại tiền tệ */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loại tiền tệ
                  </Label>
                  <Controller
                    control={control}
                    name="currency"
                    render={({ field }) => (
                      <Select
                        size="sm"
                        options={currencyTypeList.map((c) => ({ value: c.value, label: c.label }))}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        placeholder="Chọn tiền tệ..."
                      />
                    )}
                  />
                </div>

                {/* Chu kỳ thanh toán */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Chu kỳ thanh toán
                  </Label>
                  <Controller
                    control={control}
                    name="billingcycle"
                    render={({ field }) => (
                      <Select
                        size="sm"
                        options={billingCycleList.map((b) => ({ value: b.value, label: b.label }))}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        placeholder="Chọn chu kỳ..."
                      />
                    )}
                  />
                </div>

                {/* Ngày bắt đầu */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày bắt đầu hiệu lực *
                  </Label>
                  <Controller
                    control={control}
                    name="startdate"
                    render={({ field }) => (
                      <Input
                        size="sm"
                        type="date"
                        value={formatDateInputValue(field.value)}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? new Date(val) : undefined);
                          clearErrors("startdate");
                        }}
                        error={!!errors.startdate}
                        hint={errors.startdate?.message}
                      />
                    )}
                  />
                </div>

                {/* Ngày hết hạn */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày kết thúc / Hết hạn *
                  </Label>
                  <Controller
                    control={control}
                    name="expirydate"
                    render={({ field }) => (
                      <Input
                        size="sm"
                        type="date"
                        value={formatDateInputValue(field.value)}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? new Date(val) : undefined);
                          clearErrors("expirydate");
                        }}
                        error={!!errors.expirydate}
                        hint={errors.expirydate?.message}
                      />
                    )}
                  />
                </div>

                {/* Ngày cảnh báo gia hạn */}
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ngày cảnh báo trước hạn
                  </Label>
                  <Controller
                    control={control}
                    name="renewalalertdate"
                    render={({ field }) => (
                      <Input
                        size="sm"
                        type="date"
                        value={formatDateInputValue(field.value)}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? new Date(val) : null);
                          clearErrors("renewalalertdate");
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 5. GHI CHÚ BỔ SUNG */}
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center text-xs font-bold">5</span>
                  Mô tả & Ghi chú quản trị dịch vụ
                </h3>
              </div>

              <div>
                <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả / Ghi chú bàn giao, cấu hình DNS hoặc tài liệu liên quan
                </Label>
                <textarea
                  rows={2}
                  {...register("description")}
                  placeholder="Ghi chú chi tiết về quyền sở hữu tên miền, tài khoản gốc, hướng dẫn cấu hình hoặc các lưu ý bảo mật..."
                  className="w-full border rounded-lg p-2.5 text-xs resize-none dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (4 COLS): LIVE ASSET CARD & PRE-FLIGHT CHECKLIST */}
          <div className="xl:col-span-4 space-y-4 sticky top-4">
            <div className="rounded-xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-4 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center text-xs font-bold">☁️</span>
                  Xem trước trực quan
                </h3>
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                  Live Preview
                </span>
              </div>

              {/* Mock Asset Card */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/80 dark:to-gray-900 p-3.5 space-y-3 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-brand-600 text-white shrink-0 flex items-center justify-center font-bold text-xs shadow-xs">
                      {currentTypeConfig.acronym}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {watchedValues.name?.trim() || "Chưa nhập tên tài nguyên"}
                      </h4>
                      <p className="text-[11px] font-mono text-gray-500 dark:text-gray-400 truncate">
                        {watchedValues.assetcode?.trim() || "MÃ-CHƯA-CÓ"} • {currentTypeConfig.label}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                    {selectedStatusName}
                  </span>
                </div>

                {/* Contract Mock Strip */}
                <div className="p-2 rounded-lg bg-gray-100/70 dark:bg-gray-800/60 border border-dashed border-gray-300 dark:border-gray-700 font-mono text-[11px] flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-gray-400 block uppercase font-sans">Mã Hợp đồng</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {watchedValues.contractnumber?.trim() || "—"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 block uppercase font-sans">Chu kỳ</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {watchedValues.billingcycle || "Hàng năm"}
                    </span>
                  </div>
                </div>

                {/* Metadata tags */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-semibold">Phân loại</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {currentTypeConfig.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-semibold">Danh mục</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {selectedCategoryName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-semibold">Phòng ban</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {selectedDepartmentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px] uppercase font-semibold">Nhà cung cấp</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                      {selectedSupplierName}
                    </span>
                  </div>
                </div>

                {/* Tóm tắt Specs thực tế theo Subtype */}
                <div className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] space-y-0.5">
                  <span className="text-[9px] uppercase font-bold text-blue-700 dark:text-blue-400 block">
                    Thông số DTO chuẩn ({currentTypeConfig.acronym}):
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                    {currentSubtype === "DOMAIN" &&
                      `${watchedValues.domaindetail?.domainname || "Tên miền"} • ${watchedValues.domaindetail?.recordtype || "DOMAIN"}`}
                    {currentSubtype === "SSL" &&
                      `${watchedValues.domaindetail?.ssltype || "SSL"} • ${watchedValues.domaindetail?.domainname || "Wildcard SAN"}`}
                    {currentSubtype === "CLOUD_SERVER" &&
                      `IP: ${(watchedValues as any).cloudserverdetail?.ippublic || "Public IP"} • ${(watchedValues as any).cloudserverdetail?.operatingsystem || "OS"}`}
                    {currentSubtype === "INTERNET_LINE" &&
                      `FTTH ${watchedValues.internetlinedetail?.domesticbandwidthmbps || 0}Mbps • IP: ${watchedValues.internetlinedetail?.iptype || "Static"}`}
                    {currentSubtype === "SOFTWARE_LICENSE" &&
                      `${watchedValues.softwarelicensedetail?.softwarename || "Phần mềm"} • ${watchedValues.softwarelicensedetail?.totalseats || 1} Seats`}
                    {currentSubtype === "SAAS_SUBSCRIPTION" &&
                      `${watchedValues.saasdetail?.servicebrand || "SaaS"} • ${watchedValues.saasdetail?.totallicensesbought || 1} Users`}
                  </p>
                </div>

                {/* Tài chính & Hiệu lực */}
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-semibold block">Chi phí định kỳ</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(Number(watchedValues.costamount || 0))} {watchedValues.currency || "₫"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 uppercase font-semibold block">Hết hạn</span>
                    <span
                      className={`font-semibold ${remainingDays !== null && remainingDays <= 30
                          ? "text-amber-600 dark:text-amber-400"
                          : remainingDays !== null && remainingDays < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                    >
                      {remainingDays !== null ? (remainingDays < 0 ? "Đã hết hạn" : `Còn ${remainingDays} ngày`) : "Vĩnh viễn"}
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
                  <span
                    className={`font-bold ${checklist.percent === 100
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                      }`}
                  >
                    {checklist.completed}/{checklist.total} ({checklist.percent}%)
                  </span>
                </div>

                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${checklist.percent === 100 ? "bg-emerald-500" : "bg-brand-600"
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
                  disabled={isPendingSave}
                  onClick={handleSubmit(onSubmit, onInvalid)}
                  className="w-full justify-center text-xs font-semibold shadow-xs h-9 cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {isEdit ? "Lưu cập nhật tài nguyên" : "Lưu tài nguyên số"}
                  <kbd className="hidden lg:inline-block ml-1.5 px-1 py-0.2 text-[9px] bg-white/20 rounded font-mono">Ctrl+S</kbd>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateDigitalAssetsPage;
