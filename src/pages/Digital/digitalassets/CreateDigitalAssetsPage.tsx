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
};

// Helper chuẩn hóa dữ liệu ngày từ DatePicker (nhận cả Date, chuỗi DD/MM/YYYY hoặc chuỗi ISO)
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

    // React Query Data
    const { data: assetCategories } = useAssetCategoryAll();
    const { data: supplierData } = useSupplierAll();
    const { data: assetStatusData } = useAssetStatusAll();
    const { data: departmentData } = useDepartmentAll();

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
    });

    const assetSubType = watch("assetsubtype");

    // Load detail khi Edit
    useEffect(() => {
        if (id) {
            toast.info("Tính năng chỉnh sửa sẽ được thêm");
        }
    }, [id, reset]);

    // Submit Handler
    const onSubmit = async (data: DigitalAssetFormData) => {
        // Kiểm tra chéo lần cuối trước khi gửi request
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
            const payload = {
                ...data,
                startdate: data.startdate ? new Date(data.startdate).toISOString() : null,
                expirydate: data.expirydate ? new Date(data.expirydate).toISOString() : null,
            };

            const method = isEdit ? "PUT" : "POST";
            const url = isEdit ? `/api/digital-assets/${id}` : "/api/digital-assets";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `${isEdit ? "Cập nhật" : "Thêm mới"} thất bại`);
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
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">
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
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                onChange={(val) => field.onChange(val)}
                                                className="dark:bg-dark-900"
                                            />
                                        )}
                                    />
                                    {errors.assetsubtype && (
                                        <p className="text-red-500 text-xs mt-1">{errors.assetsubtype.message}</p>
                                    )}
                                </div>

                                {/* Danh mục tài sản */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                placeholder="Danh mục tài sản"
                                                onChange={(val) => field.onChange(Number(val))}
                                                className="dark:bg-dark-900"
                                            />
                                        )}
                                    />
                                    {errors.categoryid && (
                                        <p className="text-red-500 text-xs mt-1">{errors.categoryid.message}</p>
                                    )}
                                </div>

                                {/* Tên tài sản */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">
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

                                {/* Nhà cung cấp */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nhà cung cấp <span className="text-red-500">*</span>
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
                                                onChange={(val) => field.onChange(Number(val))}
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
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                                        Trạng thái tài sản <span className="text-red-500">*</span>
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
                                                onChange={(val) => field.onChange(Number(val))}
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
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phòng ban sử dụng <span className="text-red-500">*</span>
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
                                                onChange={(val) => field.onChange(Number(val))}
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
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">Tiền tệ</Label>
                                    <Controller
                                        control={control}
                                        name="currency"
                                        render={({ field }) => (
                                            <Select
                                                options={currencyTypeList}
                                                placeholder="Chọn loại tiền tệ"
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
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">Chu kỳ thanh toán</Label>
                                    <Controller
                                        control={control}
                                        name="billingcycle"
                                        render={({ field }) => (
                                            <Select
                                                options={billingCycleList}
                                                placeholder="Chọn chu kỳ"
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
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">Giá mua</Label>
                                    <Controller
                                        control={control}
                                        name="costamount"
                                        render={({ field }) => (
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={field.value ?? 0}
                                                onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                className={`w-full border rounded px-3 py-2 ${errors.costamount ? "border-red-500 bg-red-50" : "border-gray-300"
                                                    }`}
                                            />
                                        )}
                                    />
                                    {errors.costamount && (
                                        <p className="text-red-500 text-xs mt-1">{errors.costamount.message}</p>
                                    )}
                                </div>

                                {/* Ngày mua / bắt đầu */}
                                <div>
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">
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

                                                    // Lấy giá trị ngày hết hạn và đối soát ngay lập tức
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
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày hết hạn <span className="text-red-500">*</span>
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

                                                    // Lấy giá trị ngày bắt đầu và đối soát ngay lập tức
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
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">Số hợp đồng</Label>
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
                                    <Label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</Label>
                                    <textarea
                                        rows={3}
                                        placeholder="Nhập mô tả chi tiết..."
                                        {...register("description")}
                                        className="w-full border border-gray-300 rounded px-3 py-2 resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
                                    />
                                </div>
                            </div>
                        </div>
                        {(assetSubType === "DOMAIN" || assetSubType === "SSL") && (
                            <div className="space-y-6">
                                <h2 className="mb-4 text-lg font-semibold border-b pb-2">⚙️ Thông số kỹ thuật</h2>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-3 dark:bg-blue-900/10 dark:border-blue-800">
                                    <DigitalDomainSslPage />
                                </div>
                            </div>
                        )}
                        {(assetSubType === "INTERNET_LINE") && (
                            <div className="space-y-6">
                                <h2 className="mb-4 text-lg font-semibold border-b pb-2">⚙️ Thông số kỹ thuật</h2>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-3 dark:bg-blue-900/10 dark:border-blue-800">
                                    <DigitalInternetLinePage />
                                </div>
                            </div>
                        )}
                        {(assetSubType === "SOFTWARE_LICENSE" || assetSubType === "SOFTWARE") && (
                            <div className="space-y-6">
                                <h2 className="mb-4 text-lg font-semibold border-b pb-2">⚙️ Thông số kỹ thuật</h2>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-3 dark:bg-blue-900/10 dark:border-blue-800">
                                    <DigitalSoftwareLicensePage />
                                </div>
                            </div>
                        )}
                        {(assetSubType === "SAAS_SUBSCRIPTION") && (
                            <div className="space-y-6">
                                <h2 className="mb-4 text-lg font-semibold border-b pb-2">⚙️ Thông số kỹ thuật</h2>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-md space-y-3 dark:bg-blue-900/10 dark:border-blue-800">
                                    <DigitalSaaSAccountPage />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset(defaultValues);
                                clearErrors();
                            }}
                            disabled={isSubmitting}
                        >
                            Đặt lại
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/tai-nguyen-so")}
                            disabled={isSubmitting}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu tài sản"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateDigitalAssetsPage;