/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { useForm, Controller, UseFormRegister, Control, FieldErrors } from "react-hook-form";
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
  register?: UseFormRegister<any>;
  control?: Control<any, any>;
  errors?: FieldErrors<any>;
}

const DigitalSaaSAccountPage: React.FC<DigitalSaaSAccountProps> = ({
  digitalsaasaccount,
  onChange,
  register: parentRegister,
  control: parentControl,
  errors: parentErrors,
}) => {
  const localForm = useForm<DigitalSaaSAccountFormData>({
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

  const isControlledByParent = !!(parentRegister && parentControl);
  const control = (isControlledByParent ? parentControl : localForm.control) as Control<any>;
  const register = (isControlledByParent ? parentRegister : localForm.register) as UseFormRegister<any>;
  const errors = isControlledByParent ? ((parentErrors?.saasdetail as any) || {}) : localForm.formState.errors;
  const fieldPrefix = isControlledByParent ? "saasdetail." : "";

  // Đồng bộ form khi props truyền vào thay đổi (Edit/Reset mode)
  useEffect(() => {
    if (!isControlledByParent && digitalsaasaccount) {
      localForm.reset({
        saasaccountname: digitalsaasaccount.saasaccountname || "",
        servicebrand: digitalsaasaccount.servicebrand || "",
        plantier: digitalsaasaccount.plantier || "Standard",
        adminaccountemail: digitalsaasaccount.adminaccountemail || "",
        totallicensesbought: digitalsaasaccount.totallicensesbought ?? 1,
        storagequota: digitalsaasaccount.storagequota || "",
      });
    }
  }, [digitalsaasaccount, localForm, isControlledByParent]);

  // Lắng nghe thay đổi form và gửi ra trang cha
  useEffect(() => {
    if (!isControlledByParent && onChange) {
      const subscription = localForm.watch((value) => {
        onChange(value as Partial<DigitalSaaSAccountFormData>, localForm.formState.isValid);
      });
      return () => subscription.unsubscribe();
    }
  }, [localForm, onChange, isControlledByParent]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tên tài khoản / Không gian SaaS */}
        <div className="col-span-1 md:col-span-2">
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Tên tài khoản / Workspace SaaS <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="VD: AUM Organization Workspace, TechTeam Slack..."
            {...register(`${fieldPrefix}saasaccountname`)}
            error={!!errors.saasaccountname}
            hint={errors.saasaccountname?.message}
          />
        </div>

        {/* Dịch vụ / Thương hiệu SaaS */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Dịch vụ / Nền tảng SaaS <span className="text-red-500">*</span>
          </Label>
          <Controller
            control={control}
            name={`${fieldPrefix}servicebrand`}
            render={({ field }) => (
              <Select
                options={serviceBrandList.map((item) => ({
                  value: item.value,
                  label: item.label,
                  title: item.title,
                }))}
                placeholder="Chọn thương hiệu SaaS (VD: GITHUB, ZOOM, M365...)"
                value={field.value}
                onChange={(val) => field.onChange(val)}
                className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
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
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Gói dịch vụ (Plan Tier)
          </Label>
          <Controller
            control={control}
            name={`${fieldPrefix}plantier`}
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
                className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              />
            )}
          />
          {errors.plantier && (
            <p className="text-red-500 text-xs mt-1">{errors.plantier.message}</p>
          )}
        </div>

        {/* Email tài khoản quản trị (Admin Email) */}
        <div className="col-span-1 md:col-span-2">
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Email tài khoản quản trị (Admin Account) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            placeholder="VD: it-admin@aum.edu.vn, superadmin@domain.com"
            {...register(`${fieldPrefix}adminaccountemail`)}
            error={!!errors.adminaccountemail}
            hint={errors.adminaccountemail?.message}
          />
        </div>

        {/* Tổng số license/user đã mua */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Số lượng license đã mua (Seats) <span className="text-red-500">*</span>
          </Label>
          <Controller
            control={control}
            name={`${fieldPrefix}totallicensesbought`}
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
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Dung lượng lưu trữ (Storage Quota)
          </Label>
          <Input
            type="text"
            placeholder="VD: 30 GB/User, 2 TB Pooled Cloud Storage..."
            {...register(`${fieldPrefix}storagequota`)}
            error={!!errors.storagequota}
            hint={errors.storagequota?.message}
          />
        </div>
      </div>
    </div>
  );
};

export default DigitalSaaSAccountPage;