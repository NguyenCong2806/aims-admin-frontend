/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { Controller, useForm, UseFormRegister, Control, FieldErrors } from "react-hook-form";
import { DigitalInternetLineFormData, digitalinternetlineSchema } from "../../../validations/digitalinternetline.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { internetLineTypeList, ipTypeList } from "../../../common/InternetLineTypeList";
import Input from "../../../components/form/input/InputField";

interface DigitalInternetLineProps {
  digitalinternetline?: DigitalInternetLineFormData | null;
  onChange?: (data: Partial<DigitalInternetLineFormData>, isValid: boolean) => void;
  register?: UseFormRegister<any>;
  control?: Control<any, any>;
  errors?: FieldErrors<any>;
}

const DigitalInternetLinePage: React.FC<DigitalInternetLineProps> = ({
  digitalinternetline,
  onChange,
  register: parentRegister,
  control: parentControl,
  errors: parentErrors,
}) => {
  // Fallback internal form if not provided by parent
  const localForm = useForm<DigitalInternetLineFormData>({
    resolver: zodResolver(digitalinternetlineSchema),
    mode: "onChange",
    defaultValues: {
      linetype: digitalinternetline?.linetype || "FTTH",
      domesticbandwidthmbps: digitalinternetline?.domesticbandwidthmbps ?? 0,
      internationalminbandwidthmbps: digitalinternetline?.internationalminbandwidthmbps || "",
      monthlyfee: digitalinternetline?.monthlyfee ?? 0,
      annualfee: digitalinternetline?.annualfee ?? 0,
      iptype: digitalinternetline?.iptype || "STATIC_SINGLE",
      staticipaddress: digitalinternetline?.staticipaddress || "",
    },
  });

  const isControlledByParent = !!(parentRegister && parentControl);
  const control = (isControlledByParent ? parentControl : localForm.control) as Control<any>;
  const register = (isControlledByParent ? parentRegister : localForm.register) as UseFormRegister<any>;
  const errors = isControlledByParent ? ((parentErrors?.internetlinedetail as any) || {}) : localForm.formState.errors;
  const fieldPrefix = isControlledByParent ? "internetlinedetail." : "";

  // Synchronize when controlled by props in legacy mode
  useEffect(() => {
    if (!isControlledByParent && digitalinternetline) {
      localForm.reset({
        linetype: digitalinternetline.linetype || "FTTH",
        domesticbandwidthmbps: digitalinternetline.domesticbandwidthmbps ?? 0,
        internationalminbandwidthmbps: digitalinternetline.internationalminbandwidthmbps || "",
        monthlyfee: digitalinternetline.monthlyfee ?? 0,
        annualfee: digitalinternetline.annualfee ?? 0,
        iptype: digitalinternetline.iptype || "STATIC_SINGLE",
        staticipaddress: digitalinternetline.staticipaddress || "",
      });
    }
  }, [digitalinternetline, localForm, isControlledByParent]);

  useEffect(() => {
    if (!isControlledByParent && onChange) {
      const subscription = localForm.watch((value) => {
        onChange(value as Partial<DigitalInternetLineFormData>, localForm.formState.isValid);
      });
      return () => subscription.unsubscribe();
    }
  }, [localForm, onChange, isControlledByParent]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Loại đường truyền */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Loại đường truyền
          </Label>
          <Controller
            control={control}
            name={`${fieldPrefix}linetype`}
            render={({ field }) => (
              <Select
                options={internetLineTypeList.map((item) => ({
                  value: item.value,
                  label: item.label,
                  title: item.title,
                }))}
                placeholder="Chọn loại đường truyền"
                value={field.value}
                onChange={(val) => field.onChange(val)}
                className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              />
            )}
          />
          {errors.linetype && (
            <p className="text-red-500 text-xs mt-1">{errors.linetype.message}</p>
          )}
        </div>

        {/* Loại IP cung cấp */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Loại địa chỉ IP
          </Label>
          <Controller
            control={control}
            name={`${fieldPrefix}iptype`}
            render={({ field }) => (
              <Select
                options={ipTypeList.map((item) => ({
                  value: item.value,
                  label: item.label,
                  title: item.title,
                }))}
                placeholder="Chọn loại IP"
                value={field.value}
                onChange={(val) => field.onChange(val)}
                className="dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              />
            )}
          />
          {errors.iptype && (
            <p className="text-red-500 text-xs mt-1">{errors.iptype.message}</p>
          )}
        </div>

        {/* Băng thông trong nước */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Băng thông trong nước (Mbps)
          </Label>
          <Controller
            control={control}
            name={`${fieldPrefix}domesticbandwidthmbps`}
            render={({ field }) => (
              <Input
                type="number"
                placeholder="VD: 300"
                value={field.value ?? 0}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                }
                error={!!errors.domesticbandwidthmbps}
                hint={errors.domesticbandwidthmbps?.message}
              />
            )}
          />
        </div>

        {/* Băng thông quốc tế tối thiểu */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Băng thông quốc tế tối thiểu
          </Label>
          <Input
            type="text"
            placeholder="VD: 10 Mbps (Cam kết)"
            {...register(`${fieldPrefix}internationalminbandwidthmbps`)}
            error={!!errors.internationalminbandwidthmbps}
            hint={errors.internationalminbandwidthmbps?.message}
          />
        </div>

        {/* Cước phí hàng tháng */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Cước phí hàng tháng (VNĐ)
          </Label>
          <Controller
            control={control}
            name={`${fieldPrefix}monthlyfee`}
            render={({ field }) => (
              <Input
                type="number"
                placeholder="VD: 1500000"
                value={field.value ?? 0}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                }
                error={!!errors.monthlyfee}
                hint={errors.monthlyfee?.message}
              />
            )}
          />
        </div>

        {/* Cước phí hàng năm */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Cước phí hàng năm (VNĐ)
          </Label>
          <Controller
            control={control}
            name={`${fieldPrefix}annualfee`}
            render={({ field }) => (
              <Input
                type="number"
                placeholder="VD: 18000000"
                value={field.value ?? 0}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                }
                error={!!errors.annualfee}
                hint={errors.annualfee?.message}
              />
            )}
          />
        </div>

        {/* Địa chỉ IP tĩnh / Dải IP được cấp */}
        <div className="col-span-1 md:col-span-2">
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Địa chỉ IP tĩnh / Dải IP cấp kèm
          </Label>
          <textarea
            rows={2}
            placeholder="VD: 118.70.124.25/29 (Gồm các IP khả dụng: 118.70.124.26 - 118.70.124.30)"
            {...register(`${fieldPrefix}staticipaddress`)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm dark:bg-gray-900 dark:text-white/90 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          {errors.staticipaddress && (
            <p className="text-red-500 text-xs mt-1">{errors.staticipaddress.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalInternetLinePage;