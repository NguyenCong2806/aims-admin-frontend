import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import {
  DigitalSaaSAccountFormData,
  digitalsaasaccountSchema,
} from "../../../validations/digitalsaasaccount.schema";
import {
  defaultPlanTierList,
  serviceBrandList,
} from "../../../common/DefaultSaasList";

interface DigitalSaaSAccountProps {
  digitalsaasaccount?: DigitalSaaSAccountFormData | null;
  onChange?: (data: Partial<DigitalSaaSAccountFormData>, isValid: boolean) => void;
}

const DigitalSaaSAccountPage: React.FC<DigitalSaaSAccountProps> = ({
  digitalsaasaccount,
  onChange,
}) => {
  const {
    register,
    control,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<DigitalSaaSAccountFormData>({
    resolver: zodResolver(digitalsaasaccountSchema),
    mode: "onChange",
    defaultValues: {
      saasaccountname: digitalsaasaccount?.saasaccountname || "",
      servicebrand: digitalsaasaccount?.servicebrand || "",
      plantier: digitalsaasaccount?.plantier || "Standard",
      adminaccountemail: digitalsaasaccount?.adminaccountemail || "",
      totallicensesbought: digitalsaasaccount?.totallicensesbought ?? 1,
      storagequota: digitalsaasaccount?.storagequota || "",
    },
  });

  // Đồng bộ form khi props truyền vào thay đổi (Edit/Reset mode)
  useEffect(() => {
    if (digitalsaasaccount) {
      reset({
        saasaccountname: digitalsaasaccount.saasaccountname || "",
        servicebrand: digitalsaasaccount.servicebrand || "",
        plantier: digitalsaasaccount.plantier || "Standard",
        adminaccountemail: digitalsaasaccount.adminaccountemail || "",
        totallicensesbought: digitalsaasaccount.totallicensesbought ?? 1,
        storagequota: digitalsaasaccount.storagequota || "",
      });
    }
  }, [digitalsaasaccount, reset]);

  // Lắng nghe thay đổi form và gửi ra trang cha
  useEffect(() => {
    const subscription = watch((value) => {
      onChange?.(value as Partial<DigitalSaaSAccountFormData>, isValid);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange, isValid]);

  return (
    <div className="space-y-4">
      {/* Tên tài khoản / Không gian SaaS */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Tên tài khoản / Workspace SaaS <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          placeholder="VD: AUM Organization Workspace, TechTeam Slack..."
          {...register("saasaccountname")}
          error={!!errors.saasaccountname}
          hint={errors.saasaccountname?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Dịch vụ / Thương hiệu SaaS */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Dịch vụ / Thương hiệu SaaS <span className="text-red-500">*</span>
          </Label>
          <Controller
            control={control}
            name="servicebrand"
            render={({ field }) => (
              <Select
                options={serviceBrandList.map((item) => ({
                  value: item.value,
                  label: item.label,
                  title: item.title,
                }))}
                placeholder="Chọn thương hiệu SaaS (VD: GITHUB, ZOOM...)"
                value={field.value}
                onChange={(val) => field.onChange(val)}
                className="dark:bg-dark-900"
              />
            )}
          />
          {errors.servicebrand && (
            <p className="text-red-500 text-xs mt-1">
              {errors.servicebrand.message}
            </p>
          )}
        </div>

        {/* Gói dịch vụ (Plan Tier) */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Gói dịch vụ (Plan Tier)
          </Label>
          <Controller
            control={control}
            name="plantier"
            render={({ field }) => (
              <Select
                options={defaultPlanTierList.map((item) => ({
                  value: item.value,
                  label: item.label,
                  title: item.title,
                }))}
                placeholder="Chọn gói dịch vụ"
                value={field.value}
                onChange={(val) => field.onChange(val)}
                className="dark:bg-dark-900"
              />
            )}
          />
          {errors.plantier && (
            <p className="text-red-500 text-xs mt-1">{errors.plantier.message}</p>
          )}
        </div>
      </div>

      {/* Email tài khoản quản trị (Admin Email) */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Email tài khoản quản trị (Admin Account){" "}
          <span className="text-red-500">*</span>
        </Label>
        <Input
          type="email"
          placeholder="VD: admin@aum.edu.vn, root-saas@domain.com"
          {...register("adminaccountemail")}
          error={!!errors.adminaccountemail}
          hint={errors.adminaccountemail?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Tổng số license/user đã mua */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng license đã mua (Seats) <span className="text-red-500">*</span>
          </Label>
          <Controller
            control={control}
            name="totallicensesbought"
            render={({ field }) => (
              <Input
                type="number"
                placeholder="VD: 50"
                value={field.value === undefined || field.value === null ? "" : field.value}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === "" ? undefined : Number(val));
                }}
                error={!!errors.totallicensesbought}
                hint={errors.totallicensesbought?.message}
              />
            )}
          />
        </div>

        {/* Dung lượng lưu trữ cấp kèm */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Dung lượng lưu trữ (Storage Quota)
          </Label>
          <Input
            type="text"
            placeholder="VD: 30 GB/User, 2 TB Pooled Cloud Storage..."
            {...register("storagequota")}
            error={!!errors.storagequota}
            hint={errors.storagequota?.message}
          />
        </div>
      </div>
    </div>
  );
};

export default DigitalSaaSAccountPage;