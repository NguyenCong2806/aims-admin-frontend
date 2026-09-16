/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import Button from "../../../components/ui/button/Button";
import { ChevronLeftIcon } from "../../../icons";
import DigitalDomainSslPage from "../digitaldomainsssls/DigitalDomainSslPage";
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

// Schema Zod
import {
    digitalassetSchema,
    DigitalAssetFormData,
} from "../../../validations/digitalasset.schema";
import { assetSubTypeList } from "../../../common/AssetSubTypeList";
import { checkDateValidity } from "../../../helpper/checkDateValidity";
import DigitalInternetLinePage from "../digitalinternetline/DigitalInternetLinePage";
import DigitalSoftwareLicensePage from "../digitalsoftwarelicense/DigitalSoftwareLicensePage";
import DigitalSaaSAccountPage from "../digitalsaasaccount/DigitalSaaSAccountPage";

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
    startdate: new Date(),
    expirydate: undefined,
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

export const CreateDigitalAssetsPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;
    const numericId = id ? Number(id) : null;

    // React Query Data & Mutations
    const { data: assetCategories } = useAssetCategoryAll();
    const { data: supplierData } = useSupplierAll();
    const { data: assetStatusData } = useAssetStatusAll();
    const { data: departmentData } = useDepartmentAll();

    const addMutation = useAddDigitalAsset();
    const createMutation = useCreateDigitalAsset();
    const updateMutation = useUpdateDigitalAsset();
    const { data: assetDetail, isLoading: isLoadingDetail } = useDigitalAssetById(numericId);

    // ================= React Hook Form + Zod =================
    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setError,
        clearErrors,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<DigitalAssetFormData>({
        resolver: zodResolver(digitalassetSchema),
        mode: "onChange",
        defaultValues,
        shouldUnregister: true,
    });

    const isPendingSave = isSubmitting || addMutation.isPending || createMutation.isPending || updateMutation.isPending;

    const assetSubType = watch("assetsubtype");

    useEffect(() => {
        if (assetDetail?.data) {
            const item = assetDetail.data;
            reset({
                assetcode: item.assetCode,
                name: item.name,
                assetsubtype: item.assetSubType,
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
        }
    }, [assetDetail, reset]);

    // Submit Handler
    const onSubmit = async (data: DigitalAssetFormData) => {
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
                digitalDomainSslDto: isDomainOrSsl ? {
                    ...data.domaindetail,
                    recordtype: data.domaindetail?.recordtype || (data.assetsubtype === "DOMAIN" ? "DOMAIN" : "SSL_CERTIFICATE"),
                    domainname: data.domaindetail?.domainname?.trim() || data.name?.trim(),
                } : null,
                digitalCloudServerDto: data.assetsubtype === "CLOUD_SERVER" ? (data as any).cloudserverdetail || null : null,
                digitalInternetLineDto: data.assetsubtype === "INTERNET_LINE" ? data.internetlinedetail || null : null,
                digitalSoftwareLicenseDto: (data.assetsubtype === "SOFTWARE_LICENSE" || data.assetsubtype === "SOFTWARE") ? data.softwarelicensedetail || null : null,
                digitalSaasAccountDto: data.assetsubtype === "SAAS_SUBSCRIPTION" ? data.saasdetail || null : null,
                digitalSaasAllocationDto: null,
            };

            // Gửi API qua React Query Mutation
            if (isEdit && numericId !== null) {
                await updateMutation.mutateAsync({
                    id: numericId,
                    params: payload,
                });
            } else {
                await addMutation.mutateAsync(payload);
            }

            toast.success(isEdit ? "Cập nhật tài sản thành công" : "Thêm mới tài sản thành công");
            navigate("/tai-nguyen-so");
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            toast.error(error.message || "Có lỗi xảy ra khi lưu tài sản");
        }
    };

    return (
        <div className="max-w-full">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/tai-nguyen-so")}
                        className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                        title="Quay lại"
                    >
                        <ChevronLeftIcon />
                    </button>
                    <h1 className="text-2xl font-bold">
                        {isEdit ? "Chỉnh sửa Tài sản số" : "Thêm mới Tài sản số"}
                    </h1>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                        {/* THÔNG TIN CHUNG */}
                        <div className="space-y-6">
                            <h2 className="mb-4 text-lg font-semibold border-b pb-2">📋 Thông tin chung</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Mã tài sản */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mã tài sản <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="VD: DOM-AUM-01"
                                        {...register("assetcode")}
                                        error={!!errors.assetcode}
                                        hint={errors.assetcode?.message}
                                    />
                                </div>

                                {/* Loại tài sản */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Loại tài sản <span className="text-red-500">*</span>
                                    </Label>
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
                                                placeholder="Chọn loại tài sản"
                                                value={field.value}
                                                onChange={(val) => field.onChange(val)}
                                                className="dark:bg-dark-900"
                                            />
                                        )}
                                    />
                                    {errors.assetsubtype && (
                                        <p className="text-red-500 text-xs mt-1">{errors.assetsubtype.message}</p>
                                    )}
                                </div>

                                {/* Tên tài sản */}
                                <div className="col-span-2">
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Tên tài sản <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="VD: aum.edu.vn"
                                        {...register("name")}
                                        error={!!errors.name}
                                        hint={errors.name?.message}
                                    />
                                </div>

                                {/* Danh mục tài sản */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Danh mục tài sản
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
                                                placeholder="Danh mục tài sản"
                                                value={field.value ?? undefined}
                                                onChange={(val) => field.onChange(val ? Number(val) : null)}
                                                className="dark:bg-dark-900"
                                            />
                                        )}
                                    />
                                    {errors.categoryid && (
                                        <p className="text-red-500 text-xs mt-1">{errors.categoryid.message}</p>
                                    )}
                                </div>

                                {/* Nhà cung cấp */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nhà cung cấp
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
                                                className="dark:bg-dark-900"
                                            />
                                        )}
                                    />
                                    {errors.supplierid && (
                                        <p className="text-red-500 text-xs mt-1">{errors.supplierid.message}</p>
                                    )}
                                </div>

                                {/* Trạng thái tài sản */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Trạng thái tài sản
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
                                                className="dark:bg-dark-900"
                                            />
                                        )}
                                    />
                                    {errors.statusid && (
                                        <p className="text-red-500 text-xs mt-1">{errors.statusid.message}</p>
                                    )}
                                </div>

                                {/* Phòng ban sử dụng */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phòng ban sử dụng
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
                                                className="dark:bg-dark-900"
                                            />
                                        )}
                                    />
                                    {errors.departmentid && (
                                        <p className="text-red-500 text-xs mt-1">{errors.departmentid.message}</p>
                                    )}
                                </div>

                                {/* Tiền tệ */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiền tệ</Label>
                                    <Controller
                                        control={control}
                                        name="currency"
                                        render={({ field }) => (
                                            <Select
                                                options={currencyTypeList}
                                                placeholder="Chọn loại tiền tệ"
                                                value={field.value}
                                                onChange={(val) => field.onChange(val)}
                                                className="dark:bg-dark-900"
                                            />
                                        )}
                                    />
                                    {errors.currency && (
                                        <p className="text-red-500 text-xs mt-1">{errors.currency.message}</p>
                                    )}
                                </div>

                                {/* Chu kỳ thanh toán */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Chu kỳ thanh toán</Label>
                                    <Controller
                                        control={control}
                                        name="billingcycle"
                                        render={({ field }) => (
                                            <Select
                                                options={billingCycleList}
                                                placeholder="Chọn chu kỳ"
                                                value={field.value}
                                                onChange={(val) => field.onChange(val)}
                                                className="dark:bg-dark-900"
                                            />
                                        )}
                                    />
                                    {errors.billingcycle && (
                                        <p className="text-red-500 text-xs mt-1">{errors.billingcycle.message}</p>
                                    )}
                                </div>

                                {/* Giá mua */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giá mua</Label>
                                    <Controller
                                        control={control}
                                        name="costamount"
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={field.value ?? 0}
                                                onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                className={`w-full border rounded px-3 py-2 ${errors.costamount ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                            />
                                        )}
                                    />
                                    {errors.costamount && (
                                        <p className="text-red-500 text-xs mt-1">{errors.costamount.message}</p>
                                    )}
                                </div>

                                {/* Ngày mua / bắt đầu */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Ngày mua / bắt đầu <span className="text-red-500">*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="startdate"
                                        render={({ field }) => (
                                            <DatePicker
                                                id="start-date-picker"
                                                placeholder="Chọn ngày bắt đầu"
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
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Ngày hết hạn
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="expirydate"
                                        render={({ field }) => (
                                            <DatePicker
                                                id="expiry-date-picker"
                                                placeholder="Chọn ngày hết hạn"
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

                                {/* Số hợp đồng */}
                                <div className="col-span-2">
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số hợp đồng</Label>
                                    <Input
                                        type="text"
                                        placeholder="Nhập số hợp đồng"
                                        {...register("contractnumber")}
                                        error={!!errors.contractnumber}
                                        hint={errors.contractnumber?.message}
                                    />
                                </div>

                                {/* Mô tả */}
                                <div className="col-span-2">
                                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</Label>
                                    <textarea
                                        rows={3}
                                        placeholder="Nhập mô tả chi tiết..."
                                        {...register("description")}
                                        className="w-full border border-gray-300 rounded px-3 py-2 resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CỘT PHẢI: THÔNG SỐ KỸ THUẬT */}
                        {(assetSubType === "DOMAIN" || assetSubType === "SSL") && (
                            <div className="space-y-6">
                                <h2 className="mb-4 text-lg font-semibold border-b pb-2">⚙️ Thông số kỹ thuật Domain/SSL</h2>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-3 dark:bg-blue-900/10 dark:border-blue-800">
                                    <DigitalDomainSslPage
                                        register={register as any}
                                        control={control as any}
                                        errors={errors as any}
                                    />
                                </div>
                            </div>
                        )}

                        {/* {assetSubType === "INTERNET_LINE" && (
                            <div className="space-y-6">
                                <h2 className="mb-4 text-lg font-semibold border-b pb-2">⚙️ Thông số kỹ thuật Đường truyền</h2>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-3 dark:bg-blue-900/10 dark:border-blue-800">
                                    <DigitalInternetLinePage 
                                        register={register as any} 
                                        control={control as any} 
                                        errors={errors as any} 
                                    />
                                </div>
                            </div>
                        )}

                        {(assetSubType === "SOFTWARE_LICENSE" || assetSubType === "SOFTWARE") && (
                            <div className="space-y-6">
                                <h2 className="mb-4 text-lg font-semibold border-b pb-2">⚙️ Thông số kỹ thuật Bản quyền</h2>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-3 dark:bg-blue-900/10 dark:border-blue-800">
                                    <DigitalSoftwareLicensePage 
                                        register={register as any} 
                                        control={control as any} 
                                        errors={errors as any} 
                                    />
                                </div>
                            </div>
                        )}

                        {assetSubType === "SAAS_SUBSCRIPTION" && (
                            <div className="space-y-6">
                                <h2 className="mb-4 text-lg font-semibold border-b pb-2">⚙️ Thông số kỹ thuật Tài khoản SaaS</h2>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-3 dark:bg-blue-900/10 dark:border-blue-800">
                                    <DigitalSaaSAccountPage 
                                        register={register as any} 
                                        control={control as any} 
                                        errors={errors as any} 
                                    />
                                </div>
                            </div>
                        )} */}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-6 border-t dark:border-gray-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset(defaultValues);
                                clearErrors();
                            }}
                            disabled={isPendingSave}
                        >
                            Đặt lại
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/tai-nguyen-so")}
                            disabled={isPendingSave}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isPendingSave}>
                            {isPendingSave ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu tài sản"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDigitalAssetsPage;