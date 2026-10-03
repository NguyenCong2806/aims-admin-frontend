/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams, Link } from "react-router";
import { toast } from "sonner";

import Button from "../../../components/ui/button/Button";
import PageMeta from "../../../components/common/PageMeta";
import AimsModuleNav from "../../../components/aims/AimsModuleNav";
import Select from "../../../components/form/Select";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import DatePicker from "../../../components/form/date-picker";

import { useSupplierAll } from "../../../query/suppliers/suppliersQuery";
import { useAssetStatusAll } from "../../../query/assetstatus/assetstatusQuery";
import { useDepartmentAll } from "../../../query/departments/departmentsQuery";
import { useAssetCategoryAll } from "../../../query/assetcategories/assetcategoriesQuery";
import {
    useAddDigitalAsset,
    useCreateDigitalAsset,
    useUpdateDigitalAsset,
    useDigitalAssetById,
} from "../../../query/digitalasset/digitalassetQuery";

import { currencyTypeList } from "../../../common/Currencytypelist";
import { billingCycleList } from "../../../common/BillingCycleList";
import { assetSubTypeList } from "../../../common/AssetSubTypeList";
import { checkDateValidity } from "../../../helpper/checkDateValidity";

import DigitalDomainSslPage from "../digitaldomainsssls/DigitalDomainSslPage";
import DigitalInternetLinePage from "../digitalinternetline/DigitalInternetLinePage";
import DigitalSoftwareLicensePage from "../digitalsoftwarelicense/DigitalSoftwareLicensePage";
import DigitalSaaSAccountPage from "../digitalsaasaccount/DigitalSaaSAccountPage";

// Schema Zod
import {
    digitalassetSchema,
    DigitalAssetFormData,
} from "../../../validations/digitalasset.schema";

// 6 loại tài nguyên số phổ biến nhất được hiển thị dạng thẻ chọn nhanh
const PRIMARY_SUBTYPES = [
    {
        value: "DOMAIN",
        label: "Tên miền (Domain)",
        sublabel: "DNS & FQDN Website",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a8.959 8.959 0 01-4.5-1.207M12 21a8.959 8.959 0 004.5-1.207M12 3a8.959 8.959 0 014.5 1.207M12 3a8.959 8.959 0 00-4.5 1.207" />
            </svg>
        ),
        colorClasses: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/60",
    },
    {
        value: "SSL",
        label: "Chứng chỉ SSL/TLS",
        sublabel: "Bảo mật HTTPS / Wildcard",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        ),
        colorClasses: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/60",
    },
    {
        value: "CLOUD_SERVER",
        label: "Máy chủ Cloud / VPS",
        sublabel: "Hạ tầng ảo hóa & Server",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
        ),
        colorClasses: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/60",
    },
    {
        value: "SOFTWARE_LICENSE",
        label: "Bản quyền phần mềm",
        sublabel: "License Key & Thiết bị",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
        ),
        colorClasses: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/60",
    },
    {
        value: "SAAS_SUBSCRIPTION",
        label: "Thuê bao SaaS",
        sublabel: "M365, Google, Zoom...",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        ),
        colorClasses: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60",
    },
    {
        value: "INTERNET_LINE",
        label: "Đường truyền Internet",
        sublabel: "FTTH, Cáp quang & IP",
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        colorClasses: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-900/60",
    },
];

// Khởi tạo ngày hết hạn mặc định 1 năm sau ngày hiện tại
const defaultStartDate = new Date();
const defaultExpiryDate = new Date();
defaultExpiryDate.setFullYear(defaultExpiryDate.getFullYear() + 1);

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
    billingcycle: "Hàng năm",
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
};

const parseSelectedDate = (dates: any, dateStr: any): Date | undefined => {
    if (Array.isArray(dates) && dates[0] instanceof Date && !isNaN(dates[0].getTime())) {
        return dates[0];
    }
    if (dates instanceof Date && !isNaN(dates.getTime())) {
        return dates;
    }
    if (typeof dateStr === "string" && dateStr.trim()) {
        const parts = dateStr.trim().split(/[/.-]/);
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const d = new Date(year, month, day);
            if (!isNaN(d.getTime())) return d;
        }
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) return parsed;
    }
    return undefined;
};

const formatDateDisplay = (date?: Date | null): string => {
    if (!date || isNaN(date.getTime())) return "Chưa chọn";
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
};

const formatCurrency = (amount?: number | null, curr = "VND") => {
    if (amount === undefined || amount === null || isNaN(amount)) return "0 " + curr;
    return new Intl.NumberFormat("vi-VN").format(amount) + " " + curr;
};

export const CreateDigitalAssetsPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;
    const numericId = id ? Number(id) : null;

    // Local key để force re-render flatpickr DatePicker khi gán preset +1/+2 năm
    const [expiryPickerKey, setExpiryPickerKey] = useState(0);

    // React Query Data & Mutations
    const { data: assetCategories } = useAssetCategoryAll();
    const { data: supplierData } = useSupplierAll();
    const { data: assetStatusData } = useAssetStatusAll();
    const { data: departmentData } = useDepartmentAll();

    const addMutation = useAddDigitalAsset();
    const createMutation = useCreateDigitalAsset();
    const updateMutation = useUpdateDigitalAsset();
    const { data: assetDetail } = useDigitalAssetById(numericId);

    // ================= React Hook Form + Zod =================
    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        setError,
        clearErrors,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<DigitalAssetFormData>({
        resolver: zodResolver(digitalassetSchema),
        mode: "onChange",
        defaultValues,
        shouldUnregister: false,
    });

    const isPendingSave = isSubmitting || addMutation.isPending || createMutation.isPending || updateMutation.isPending;

    // Watched values cho live preview & dynamic controls
    const watchedValues = watch();
    const currentSubtype = watchedValues.assetsubtype || "DOMAIN";

    // Tìm kiếm label của các ID đã chọn để hiển thị trên live preview
    const selectedCategoryName = useMemo(() => {
        if (!watchedValues.categoryid || !assetCategories) return null;
        return assetCategories.find((c) => c.id === watchedValues.categoryid)?.name;
    }, [watchedValues.categoryid, assetCategories]);

    const selectedStatusName = useMemo(() => {
        if (!watchedValues.statusid || !assetStatusData) return null;
        return assetStatusData.find((s) => s.id === watchedValues.statusid)?.name;
    }, [watchedValues.statusid, assetStatusData]);

    const selectedSupplierName = useMemo(() => {
        if (!watchedValues.supplierid || !supplierData) return null;
        return supplierData.find((s) => s.id === watchedValues.supplierid)?.name;
    }, [watchedValues.supplierid, supplierData]);

    const selectedDepartmentName = useMemo(() => {
        if (!watchedValues.departmentid || !departmentData) return null;
        return departmentData.find((d) => d.id === watchedValues.departmentid)?.name;
    }, [watchedValues.departmentid, departmentData]);

    // Tính số ngày còn lại đến hạn
    const remainingDays = useMemo(() => {
        if (!watchedValues.expirydate) return null;
        const now = new Date();
        const expiry = new Date(watchedValues.expirydate);
        const diffTime = expiry.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, [watchedValues.expirydate]);

    // Pre-flight checklist: kiểm tra tiến độ điền form
    const checklist = useMemo(() => {
        const items = [
            { label: "Mã tài sản", valid: !!watchedValues.assetcode?.trim() },
            { label: "Tên tài nguyên", valid: !!watchedValues.name?.trim() },
            { label: "Danh mục", valid: typeof watchedValues.categoryid === "number" && watchedValues.categoryid > 0 },
            { label: "Trạng thái", valid: typeof watchedValues.statusid === "number" && watchedValues.statusid > 0 },
            { label: "Nhà cung cấp", valid: typeof watchedValues.supplierid === "number" && watchedValues.supplierid > 0 },
            { label: "Phòng ban", valid: typeof watchedValues.departmentid === "number" && watchedValues.departmentid > 0 },
            { label: "Ngày bắt đầu", valid: !!watchedValues.startdate },
            { label: "Ngày hết hạn", valid: !!watchedValues.expirydate },
        ];
        const completed = items.filter((i) => i.valid).length;
        const percent = Math.round((completed / items.length) * 100);
        return { items, completed, total: items.length, percent };
    }, [watchedValues]);

    // Điền dữ liệu khi load chi tiết (Edit mode)
    useEffect(() => {
        if (assetDetail?.data) {
            const item = assetDetail.data;
            reset({
                assetcode: item.assetCode || "",
                name: item.name || "",
                assetsubtype: item.assetSubType || "DOMAIN",
                categoryid: item.categoryId ?? undefined,
                statusid: item.statusId ?? undefined,
                contractnumber: item.contractNumber ?? "",
                supplierid: item.supplierId ?? undefined,
                departmentid: item.departmentId ?? undefined,
                costamount: item.costAmount ?? 0,
                currency: item.currency ?? "VND",
                billingcycle: item.billingCycle ?? "Hàng năm",
                startdate: parseSelectedDate(undefined, item.startDate),
                expirydate: parseSelectedDate(undefined, item.expiryDate),
                description: item.description ?? "",
            });
            setExpiryPickerKey((k) => k + 1);
        }
    }, [assetDetail, reset]);

    // Submit Handler
    const onSubmit = React.useCallback(async (data: DigitalAssetFormData) => {
        const isDateValid = checkDateValidity(
            data.startdate,
            data.expirydate,
            setError,
            clearErrors
        );
        if (!isDateValid) {
            toast.error("Vui lòng kiểm tra lại ngày mua và ngày hết hạn");
            return;
        }

        try {
            const isDomainOrSsl = data.assetsubtype === "DOMAIN" || data.assetsubtype === "SSL";

            const payload: any = {
                digitalAssetDto: {
                    assetcode: data.assetcode?.trim(),
                    name: data.name?.trim(),
                    assetsubtype: data.assetsubtype,
                    categoryid: data.categoryid,
                    supplierid: data.supplierid,
                    statusid: data.statusid,
                    departmentid: data.departmentid,
                    contractnumber: data.contractnumber?.trim(),
                    costamount: data.costamount,
                    currency: data.currency,
                    billingcycle: data.billingcycle,
                    description: data.description?.trim(),
                    startdate: data.startdate ? new Date(data.startdate).toISOString() : null,
                    expirydate: data.expirydate ? new Date(data.expirydate).toISOString() : null,
                },
                digitalDomainSslDto: isDomainOrSsl
                    ? {
                          ...data.domaindetail,
                          recordtype:
                              data.domaindetail?.recordtype ||
                              (data.assetsubtype === "DOMAIN" ? "DOMAIN" : "SSL_CERTIFICATE"),
                          domainname: data.domaindetail?.domainname?.trim() || data.name?.trim(),
                      }
                    : null,
                digitalCloudServerDto:
                    data.assetsubtype === "CLOUD_SERVER" ? (data as any).cloudserverdetail || null : null,
                digitalInternetLineDto:
                    data.assetsubtype === "INTERNET_LINE" ? data.internetlinedetail || null : null,
                digitalSoftwareLicenseDto:
                    data.assetsubtype === "SOFTWARE_LICENSE" || data.assetsubtype === "SOFTWARE"
                        ? data.softwarelicensedetail || null
                        : null,
                digitalSaasAccountDto:
                    data.assetsubtype === "SAAS_SUBSCRIPTION" ? data.saasdetail || null : null,
                digitalSaasAllocationDto: null,
            };

            if (isEdit && numericId !== null) {
                await updateMutation.mutateAsync({
                    id: numericId,
                    params: payload,
                });
            } else {
                await addMutation.mutateAsync(payload);
            }

            toast.success(isEdit ? "Cập nhật tài nguyên số thành công" : "Tạo mới tài nguyên số thành công");
            navigate("/tai-nguyen-so");
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            toast.error(error.message || "Có lỗi xảy ra khi lưu tài sản số");
        }
    }, [setError, clearErrors, isEdit, numericId, updateMutation, addMutation, navigate]);

    // Phím tắt Ctrl+S / Cmd+S để lưu nhanh
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleSubmit(onSubmit)();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSubmit, onSubmit]);

    // Hàm tạo mã tài sản tự động theo loại tài nguyên số
    const handleGenerateCode = () => {
        const prefixMap: Record<string, string> = {
            DOMAIN: "DOM",
            SSL: "SSL",
            CLOUD_SERVER: "SRV",
            SOFTWARE_LICENSE: "LIC",
            SAAS_SUBSCRIPTION: "SAAS",
            INTERNET_LINE: "NET",
            DNS: "DNS",
            VPS: "VPS",
            DATABASE: "DB",
            STORAGE: "STR",
            HOSTING: "HST",
            VPN: "VPN",
            FIREWALL: "FW",
        };
        const prefix = prefixMap[currentSubtype] || "DIG";
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const newCode = `${prefix}-${year}-${rand}`;
        setValue("assetcode", newCode, { shouldValidate: true, shouldDirty: true });
        toast.success(`Đã tự động tạo mã: ${newCode}`);
    };

    // Hàm gắn nhanh ngày hết hạn (+1, +2, +3, +5 năm)
    const handlePresetExpiryYears = (years: number) => {
        const start = getValues("startdate") || new Date();
        const target = new Date(start);
        target.setFullYear(target.getFullYear() + years);
        setValue("expirydate", target, { shouldValidate: true, shouldDirty: true });
        clearErrors("expirydate");
        setExpiryPickerKey((k) => k + 1);
        toast.success(`Đã thiết lập thời hạn: +${years} năm (${formatDateDisplay(target)})`);
    };

    return (
        <>
            <PageMeta
                title={isEdit ? "Chỉnh sửa Tài nguyên số | AIMS" : "Tạo mới Tài nguyên số | AIMS"}
                description="Đăng ký, định cấu hình hạ tầng số và theo dõi chu kỳ gia hạn bản quyền, tên miền, cloud"
            />

            {/* Aims Module Navigation */}
            <AimsModuleNav
                moduleName="Tài nguyên số"
                moduleIcon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                }
                tabs={[
                    { name: "Tất cả tài nguyên", path: "/tai-nguyen-so" },
                    { name: isEdit ? "Chỉnh sửa" : "Thêm mới", path: isEdit ? `/tai-nguyen-so/${id}/chinh-sua` : "/tai-nguyen-so/tao-moi" },
                ]}
            />

            <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                {/* HERO HEADER BAR */}
                <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 shadow-xs backdrop-blur-sm p-5 sm:p-6 transition-all">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                            Trang chủ
                        </Link>
                        <span>/</span>
                        <Link to="/tai-nguyen-so" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                            Tài nguyên số
                        </Link>
                        <span>/</span>
                        <span className="text-gray-800 dark:text-gray-200 font-medium">
                            {isEdit ? "Chỉnh sửa" : "Tạo mới"}
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <button
                                type="button"
                                onClick={() => navigate("/tai-nguyen-so")}
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
                                        {isEdit ? "Chỉnh sửa Tài nguyên số" : "Thêm mới Tài nguyên số"}
                                    </h1>
                                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                                        {isEdit ? `ID: #${id}` : "Hạ tầng số Enterprise"}
                                    </span>
                                    {isEdit && (
                                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                            Chế độ cập nhật
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Quản lý vòng đời tài sản số, tự động hóa cảnh báo hạn gia hạn và phân bổ chi phí phòng ban.
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
                                    reset(defaultValues);
                                    clearErrors();
                                    setExpiryPickerKey((k) => k + 1);
                                    toast.info("Đã đặt lại thông tin biểu mẫu");
                                }}
                                disabled={isPendingSave}
                                className="text-xs font-medium"
                            >
                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Đặt lại
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/tai-nguyen-so")}
                                disabled={isPendingSave}
                                className="text-xs font-medium"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSubmit(onSubmit)}
                                disabled={isPendingSave}
                                className="text-xs font-semibold shadow-xs"
                            >
                                {isPendingSave ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {isEdit ? "Cập nhật tài sản" : "Lưu tài sản số"}
                                        <kbd className="hidden lg:inline-block ml-2 px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono">Ctrl+S</kbd>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* SECTION 1: HERO SUBTYPE SELECTOR */}
                    <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-brand-500 text-white flex items-center justify-center text-xs font-bold">1</span>
                                    Chọn loại tài nguyên số
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Chọn loại tài nguyên để kích hoạt đúng biểu mẫu kỹ thuật và logic giám sát tương ứng.
                                </p>
                            </div>

                            {/* Dropdown loại khác */}
                            <div className="w-full sm:w-64">
                                <Controller
                                    control={control}
                                    name="assetsubtype"
                                    render={({ field }) => (
                                        <Select
                                            options={
                                                assetSubTypeList?.map((t) => ({
                                                    value: t.value,
                                                    label: t.label,
                                                })) || []
                                            }
                                            placeholder="Chọn loại khác..."
                                            value={field.value}
                                            onChange={(val) => field.onChange(val)}
                                            className="dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-xs h-9"
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* Thẻ chọn nhanh 6 loại phổ biến */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {PRIMARY_SUBTYPES.map((type) => {
                                const isSelected = currentSubtype === type.value;
                                return (
                                    <button
                                        type="button"
                                        key={type.value}
                                        onClick={() => setValue("assetsubtype", type.value, { shouldValidate: true })}
                                        className={`relative text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between group ${
                                            isSelected
                                                ? "border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/50 dark:bg-brand-950/40 shadow-xs"
                                                : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                                        }`}
                                    >
                                        {/* Checkmark icon khi được chọn */}
                                        {isSelected && (
                                            <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px]">
                                                ✓
                                            </span>
                                        )}
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${type.colorClasses}`}>
                                            {type.icon}
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold truncate ${isSelected ? "text-brand-600 dark:text-brand-400" : "text-gray-900 dark:text-white"}`}>
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
                        {errors.assetsubtype && (
                            <p className="text-red-500 text-xs mt-2 font-medium">{errors.assetsubtype.message}</p>
                        )}
                    </div>

                    {/* TWO-COLUMN WORKFLOW LAYOUT */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* CỘT TRÁI (7 COLS): THÔNG TIN CHUNG, TỔ CHỨC & CHI PHÍ */}
                        <div className="xl:col-span-7 space-y-6">
                            {/* CARD: THÔNG TIN ĐỊNH DANH */}
                            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
                                        Thông tin định danh & Phân loại
                                    </h3>
                                    <span className="text-[11px] font-medium text-gray-400">
                                        <span className="text-red-500">*</span> Trường bắt buộc
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Mã tài sản */}
                                    <div className="col-span-1 md:col-span-2">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                Mã tài sản <span className="text-red-500">*</span>
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={handleGenerateCode}
                                                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-semibold flex items-center gap-1 transition"
                                                title="Tạo mã ngẫu nhiên theo chuẩn danh mục"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Tạo mã nhanh
                                            </button>
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder="VD: DOM-2026-0012, SSL-AUM-01"
                                            {...register("assetcode")}
                                            error={!!errors.assetcode}
                                            hint={errors.assetcode?.message}
                                        />
                                    </div>

                                    {/* Tên tài sản */}
                                    <div className="col-span-1 md:col-span-2">
                                        <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                            Tên tài sản / Dịch vụ số <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder={
                                                currentSubtype === "DOMAIN"
                                                    ? "VD: aum.edu.vn, tuyensinh.aum.edu.vn"
                                                    : currentSubtype === "SSL"
                                                    ? "VD: Sectigo Wildcard SSL (*.aum.edu.vn)"
                                                    : currentSubtype === "SAAS_SUBSCRIPTION"
                                                    ? "VD: Microsoft 365 E5 Enterprise (Khối Văn Phòng)"
                                                    : currentSubtype === "CLOUD_SERVER"
                                                    ? "VD: Cụm máy chủ Database Master (Viettel IDC)"
                                                    : "VD: Nhập tên tài sản hoặc dịch vụ số..."
                                            }
                                            {...register("name")}
                                            error={!!errors.name}
                                            hint={errors.name?.message}
                                        />
                                    </div>

                                    {/* Danh mục tài sản */}
                                    <div>
                                        <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                            Danh mục tài sản <span className="text-red-500">*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="categoryid"
                                            render={({ field }) => (
                                                <Select
                                                    options={
                                                        assetCategories?.map((c) => ({
                                                            value: c.id ?? 0,
                                                            label: c.name ?? "",
                                                        })) || []
                                                    }
                                                    placeholder="Chọn danh mục"
                                                    value={field.value ?? undefined}
                                                    onChange={(val) => field.onChange(val ? Number(val) : null)}
                                                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                                />
                                            )}
                                        />
                                        {errors.categoryid && (
                                            <p className="text-red-500 text-xs mt-1">{errors.categoryid.message}</p>
                                        )}
                                    </div>

                                    {/* Trạng thái tài sản */}
                                    <div>
                                        <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                            Trạng thái hoạt động <span className="text-red-500">*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="statusid"
                                            render={({ field }) => (
                                                <Select
                                                    options={
                                                        assetStatusData?.map((st) => ({
                                                            value: st.id ?? 0,
                                                            label: st.name || "",
                                                        })) || []
                                                    }
                                                    placeholder="Chọn trạng thái"
                                                    value={field.value ?? undefined}
                                                    onChange={(val) => field.onChange(val ? Number(val) : null)}
                                                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                                />
                                            )}
                                        />
                                        {errors.statusid && (
                                            <p className="text-red-500 text-xs mt-1">{errors.statusid.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CARD: ĐƠN VỊ QUẢN LÝ & ĐỐI TÁC */}
                            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400 flex items-center justify-center text-xs font-bold">3</span>
                                        Đơn vị quản lý & Đối tác
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nhà cung cấp */}
                                    <div>
                                        <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                            Nhà cung cấp / Đối tác <span className="text-red-500">*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="supplierid"
                                            render={({ field }) => (
                                                <Select
                                                    options={
                                                        supplierData?.map((s) => ({
                                                            value: s.id ?? 0,
                                                            label: s.name || "",
                                                        })) || []
                                                    }
                                                    placeholder="Chọn nhà cung cấp"
                                                    value={field.value ?? undefined}
                                                    onChange={(val) => field.onChange(val ? Number(val) : null)}
                                                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                                />
                                            )}
                                        />
                                        {errors.supplierid && (
                                            <p className="text-red-500 text-xs mt-1">{errors.supplierid.message}</p>
                                        )}
                                    </div>

                                    {/* Phòng ban sử dụng */}
                                    <div>
                                        <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                            Phòng ban thụ hưởng / Quản lý <span className="text-red-500">*</span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="departmentid"
                                            render={({ field }) => (
                                                <Select
                                                    options={
                                                        departmentData?.map((d) => ({
                                                            value: d.id ?? 0,
                                                            label: d.name || "",
                                                        })) || []
                                                    }
                                                    placeholder="Chọn phòng ban"
                                                    value={field.value ?? undefined}
                                                    onChange={(val) => field.onChange(val ? Number(val) : null)}
                                                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                                />
                                            )}
                                        />
                                        {errors.departmentid && (
                                            <p className="text-red-500 text-xs mt-1">{errors.departmentid.message}</p>
                                        )}
                                    </div>

                                    {/* Số hợp đồng */}
                                    <div className="col-span-1 md:col-span-2">
                                        <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                            Số hợp đồng / Đơn hàng PO
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder="VD: HĐ-2026/AUM-PAVIETNAM-001"
                                            {...register("contractnumber")}
                                            error={!!errors.contractnumber}
                                            hint={errors.contractnumber?.message}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* CARD: CHI PHÍ & CHU KỲ GIA HẠN */}
                            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">4</span>
                                        Chi phí & Chu kỳ thanh toán
                                    </h3>
                                    {watchedValues.costamount ? (
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                            {formatCurrency(watchedValues.costamount, watchedValues.currency)}
                                        </span>
                                    ) : null}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Giá mua */}
                                    <div>
                                        <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                            Giá mua / Chi phí định kỳ
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="costamount"
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={field.value ?? 0}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                    error={!!errors.costamount}
                                                    hint={errors.costamount?.message}
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Tiền tệ */}
                                    <div>
                                        <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                            Loại tiền tệ
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="currency"
                                            render={({ field }) => (
                                                <Select
                                                    options={currencyTypeList}
                                                    placeholder="Chọn tiền tệ"
                                                    value={field.value}
                                                    onChange={(val) => field.onChange(val)}
                                                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Chu kỳ thanh toán */}
                                    <div>
                                        <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                            Chu kỳ thanh toán
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="billingcycle"
                                            render={({ field }) => (
                                                <Select
                                                    options={billingCycleList}
                                                    placeholder="Chọn chu kỳ"
                                                    value={field.value}
                                                    onChange={(val) => field.onChange(val)}
                                                    className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                                />
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Hiệu lực thời gian & DatePicker */}
                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            Thời gian hiệu lực & Gia hạn
                                        </Label>
                                        {/* Nút bấm nhanh hạn sử dụng */}
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] text-gray-400 hidden sm:inline">Thêm hạn:</span>
                                            {[1, 2, 3, 5].map((y) => (
                                                <button
                                                    type="button"
                                                    key={y}
                                                    onClick={() => handlePresetExpiryYears(y)}
                                                    className="px-2 py-0.5 text-[11px] font-semibold rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/60 dark:hover:text-brand-400 transition"
                                                >
                                                    +{y} Năm
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Ngày mua / bắt đầu */}
                                        <div>
                                            <Label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Ngày mua / Kích hoạt <span className="text-red-500">*</span>
                                            </Label>
                                            <Controller
                                                control={control}
                                                name="startdate"
                                                render={({ field }) => (
                                                    <DatePicker
                                                        id="start-date-picker"
                                                        placeholder="Chọn ngày bắt đầu"
                                                        defaultDate={field.value}
                                                        onChange={(dates: any, dateStr: any) => {
                                                            const selected = parseSelectedDate(dates, dateStr);
                                                            field.onChange(selected);
                                                            const currentExpiry = getValues("expirydate");
                                                            checkDateValidity(selected, currentExpiry, setError, clearErrors);
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.startdate && (
                                                <p className="text-red-500 text-xs mt-1">{errors.startdate.message}</p>
                                            )}
                                        </div>

                                        {/* Ngày hết hạn */}
                                        <div>
                                            <Label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Ngày hết hạn / Cần gia hạn <span className="text-red-500">*</span>
                                            </Label>
                                            <Controller
                                                control={control}
                                                name="expirydate"
                                                render={({ field }) => (
                                                    <DatePicker
                                                        key={`expiry-${expiryPickerKey}`}
                                                        id="expiry-date-picker"
                                                        placeholder="Chọn ngày hết hạn"
                                                        defaultDate={field.value}
                                                        onChange={(dates: any, dateStr: any) => {
                                                            const selected = parseSelectedDate(dates, dateStr);
                                                            field.onChange(selected);
                                                            const currentStart = getValues("startdate");
                                                            checkDateValidity(currentStart, selected, setError, clearErrors);
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.expirydate && (
                                                <p className="text-red-500 text-xs mt-1">{errors.expirydate.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Duration summary pill */}
                                    {watchedValues.startdate && watchedValues.expirydate && (
                                        <div className="mt-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                <span className="text-gray-600 dark:text-gray-300">
                                                    Từ <strong>{formatDateDisplay(watchedValues.startdate)}</strong> đến <strong>{formatDateDisplay(watchedValues.expirydate)}</strong>
                                                </span>
                                            </div>
                                            {remainingDays !== null && (
                                                <span className={`font-semibold ${remainingDays > 30 ? "text-emerald-600 dark:text-emerald-400" : remainingDays > 0 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                                                    {remainingDays > 0 ? `Còn ${remainingDays} ngày hiệu lực` : "Đã hết hạn"}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CARD: MÔ TẢ & GHI CHÚ */}
                            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 flex items-center justify-center text-xs font-bold">5</span>
                                    Ghi chú & Tài liệu liên quan
                                </h3>
                                <textarea
                                    rows={3}
                                    placeholder="Ghi chú chi tiết mục đích sử dụng, hướng dẫn cấu hình DNS, đầu mối kỹ thuật phụ trách hoặc các yêu cầu bảo mật đặc biệt..."
                                    {...register("description")}
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-sm resize-none dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
                                />
                            </div>
                        </div>

                        {/* CỘT PHẢI (5 COLS): CẤU HÌNH KỸ THUẬT CHUYÊN BIỆT & LIVE PREVIEW CARD */}
                        <div className="xl:col-span-5 space-y-6">
                            {/* CARD: THÔNG SỐ KỸ THUẬT CHUYÊN BIỆT THEO LOẠI TÀI SẢN */}
                            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs">
                                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">⚙️</span>
                                            Cấu hình kỹ thuật chuyên biệt
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            Dành riêng cho loại: <strong>{currentSubtype}</strong>
                                        </p>
                                    </div>
                                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                        Chuyên sâu
                                    </span>
                                </div>

                                {/* Form con tương ứng theo subtype */}
                                {(currentSubtype === "DOMAIN" || currentSubtype === "SSL") && (
                                    <DigitalDomainSslPage
                                        register={register as any}
                                        control={control as any}
                                        errors={errors as any}
                                    />
                                )}

                                {currentSubtype === "INTERNET_LINE" && (
                                    <DigitalInternetLinePage
                                        register={register as any}
                                        control={control as any}
                                        errors={errors as any}
                                    />
                                )}

                                {(currentSubtype === "SOFTWARE_LICENSE" || currentSubtype === "SOFTWARE") && (
                                    <DigitalSoftwareLicensePage
                                        register={register as any}
                                        control={control as any}
                                        errors={errors as any}
                                    />
                                )}

                                {currentSubtype === "SAAS_SUBSCRIPTION" && (
                                    <DigitalSaaSAccountPage
                                        register={register as any}
                                        control={control as any}
                                        errors={errors as any}
                                    />
                                )}

                                {currentSubtype === "CLOUD_SERVER" && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                            <div>
                                                <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                                    Địa chỉ IP Public / DNS Server
                                                </Label>
                                                <Input
                                                    type="text"
                                                    placeholder="VD: 103.142.109.25"
                                                    {...register("cloudserverdetail.serverip" as any)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                                    Hệ điều hành (OS)
                                                </Label>
                                                <Input
                                                    type="text"
                                                    placeholder="VD: Ubuntu 24.04 LTS, Windows Server"
                                                    {...register("cloudserverdetail.osname" as any)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                                    Số vCPU Cores & RAM
                                                </Label>
                                                <Input
                                                    type="text"
                                                    placeholder="VD: 8 vCPU - 32 GB RAM"
                                                    {...register("cloudserverdetail.cpucores" as any)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                                    Dung lượng ổ đĩa (Storage)
                                                </Label>
                                                <Input
                                                    type="text"
                                                    placeholder="VD: 500 GB NVMe SSD"
                                                    {...register("cloudserverdetail.storagegb" as any)}
                                                />
                                            </div>
                                            <div className="col-span-1 md:col-span-2">
                                                <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                                    Vị trí Data Center / Region Cloud
                                                </Label>
                                                <Input
                                                    type="text"
                                                    placeholder="VD: Viettel IDC Hòa Lạc / AWS ap-southeast-1 (Singapore)"
                                                    {...register("cloudserverdetail.provider" as any)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Fallback cho các loại tài nguyên khác */}
                                {["DOMAIN", "SSL", "INTERNET_LINE", "SOFTWARE_LICENSE", "SOFTWARE", "SAAS_SUBSCRIPTION", "CLOUD_SERVER"].indexOf(currentSubtype) === -1 && (
                                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-center py-6">
                                        <span className="text-2xl mb-2 block">🧩</span>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                            Tài nguyên số dạng: {currentSubtype}
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                                            Loại tài nguyên này sử dụng cấu hình chung. Bạn có thể bổ sung thông tin chi tiết vào phần ghi chú & tài liệu liên quan.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* CARD: LIVE ASSET PREVIEW & PRE-FLIGHT CHECKLIST */}
                            <div className="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900/90 p-5 sm:p-6 shadow-xs space-y-4 sticky top-6">
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center text-xs font-bold">👁️</span>
                                        Thẻ xem trước trực quan
                                    </h3>
                                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                                        Live Preview
                                    </span>
                                </div>

                                {/* Preview Card Widget */}
                                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/80 dark:to-gray-900 p-4 space-y-3.5 shadow-2xs">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                                {currentSubtype.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                                                    {watchedValues.name?.trim() || "Chưa nhập tên tài sản"}
                                                </h4>
                                                <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                    {watchedValues.assetcode?.trim() || "MÃ-CHƯA-CÓ"}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                            {selectedStatusName || "Chưa có TT"}
                                        </span>
                                    </div>

                                    {/* Metadata tags */}
                                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-gray-100 dark:border-gray-800">
                                        <div>
                                            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Phân loại</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                                                {currentSubtype}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Danh mục</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                                                {selectedCategoryName || "—"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Phòng ban</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                                                {selectedDepartmentName || "—"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block text-[10px] uppercase font-semibold">Nhà cung cấp</span>
                                            <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                                                {selectedSupplierName || "—"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Cost & Expiration */}
                                    <div className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 flex items-center justify-between text-xs">
                                        <div>
                                            <span className="text-[10px] text-gray-400 uppercase font-semibold block">Chi phí</span>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(watchedValues.costamount, watchedValues.currency)}
                                            </span>
                                            <span className="text-[10px] text-gray-400 ml-1">/{watchedValues.billingcycle}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-gray-400 uppercase font-semibold block">Hết hạn</span>
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                {formatDateDisplay(watchedValues.expirydate)}
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

                                    {/* Progress bar */}
                                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${
                                                checklist.percent === 100 ? "bg-emerald-500" : "bg-brand-500"
                                            }`}
                                            style={{ width: `${checklist.percent}%` }}
                                        />
                                    </div>

                                    {/* Checklist items pills */}
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
                                        type="submit"
                                        size="md"
                                        disabled={isPendingSave}
                                        className="w-full justify-center text-sm font-semibold shadow-xs"
                                    >
                                        {isPendingSave ? (
                                            "Đang lưu tài sản..."
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                {isEdit ? "Cập nhật tài nguyên" : "Lưu tài nguyên số"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateDigitalAssetsPage;