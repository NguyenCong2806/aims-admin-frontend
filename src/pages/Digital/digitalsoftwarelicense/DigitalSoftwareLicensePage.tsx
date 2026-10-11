/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { DigitalSoftwareLicenseFormData, digitalsoftwarelicenseSchema } from "../../../validations/digitalsoftwarelicense.schema";
import { Controller, useForm, UseFormRegister, Control, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";

interface DigitalSoftwareLicenseProps {
  digitalsoftwarelicense?: DigitalSoftwareLicenseFormData | null;
  onChange?: (data: Partial<DigitalSoftwareLicenseFormData>, isValid: boolean) => void;
  register?: UseFormRegister<any>;
  control?: Control<any, any>;
  errors?: FieldErrors<any>;
}

const DigitalSoftwareLicensePage: React.FC<DigitalSoftwareLicenseProps> = ({
  digitalsoftwarelicense,
  onChange,
  register: parentRegister,
  control: parentControl,
  errors: parentErrors,
}) => {
  const localForm = useForm<DigitalSoftwareLicenseFormData>({
    resolver: zodResolver(digitalsoftwarelicenseSchema),
    mode: "onChange",
    defaultValues: {
      licensekey: digitalsoftwarelicense?.licensekey || "",
      softwarename: digitalsoftwarelicense?.softwarename || "",
      boundhardwareserial: digitalsoftwarelicense?.boundhardwareserial || "",
      totalseats: digitalsoftwarelicense?.totalseats ?? 1,
      allocatedseats: digitalsoftwarelicense?.allocatedseats ?? 0,
      isperpetual: digitalsoftwarelicense?.isperpetual ?? false,
    },
  });

  const isControlledByParent = !!(parentRegister && parentControl);
  const control = (isControlledByParent ? parentControl : localForm.control) as Control<any>;
  const register = (isControlledByParent ? parentRegister : localForm.register) as UseFormRegister<any>;
  const errors = isControlledByParent ? ((parentErrors?.softwarelicensedetail as any) || {}) : localForm.formState.errors;
  const fieldPrefix = isControlledByParent ? "softwarelicensedetail." : "";

  // Đồng bộ lại dữ liệu khi component nhận prop thay đổi (khi edit hoặc reset)
  useEffect(() => {
    if (!isControlledByParent && digitalsoftwarelicense) {
      localForm.reset({
        licensekey: digitalsoftwarelicense.licensekey || "",
        softwarename: digitalsoftwarelicense.softwarename || "",
        boundhardwareserial: digitalsoftwarelicense.boundhardwareserial || "",
        totalseats: digitalsoftwarelicense.totalseats ?? 1,
        allocatedseats: digitalsoftwarelicense.allocatedseats ?? 0,
        isperpetual: digitalsoftwarelicense.isperpetual ?? false,
      });
    }
  }, [digitalsoftwarelicense, localForm, isControlledByParent]);

  // Lắng nghe thay đổi giá trị và truyền ra trang cha
  useEffect(() => {
    if (!isControlledByParent && onChange) {
      const subscription = localForm.watch((value) => {
        onChange(value as Partial<DigitalSoftwareLicenseFormData>, localForm.formState.isValid);
      });
      return () => subscription.unsubscribe();
    }
  }, [localForm, onChange, isControlledByParent]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tên phần mềm */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Tên phần mềm <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            placeholder="VD: Microsoft Office 365, Adobe Creative Cloud..."
            {...register(`${fieldPrefix}softwarename`)}
            error={!!errors.softwarename}
            hint={errors.softwarename?.message}
          />
        </div>

        {/* License Key / Khóa kích hoạt */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Khóa kích hoạt (License / Product Key)
          </Label>
          <Input
            type="text"
            placeholder="VD: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
            {...register(`${fieldPrefix}licensekey`)}
            error={!!errors.licensekey}
            hint={errors.licensekey?.message}
          />
        </div>

        {/* Serial phần cứng gán kèm */}
        <div className="col-span-1 md:col-span-2">
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Serial phần cứng gán kèm (Hardware Serial / MAC)
          </Label>
          <Input
            type="text"
            placeholder="VD: DELL-SN-998811 hoặc để trống nếu dùng dạng Cloud Floating License"
            {...register(`${fieldPrefix}boundhardwareserial`)}
            error={!!errors.boundhardwareserial}
            hint={errors.boundhardwareserial?.message}
          />
        </div>

        {/* Tổng số seat/user */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Tổng số lượng (Total Seats / Devices)
          </Label>
          <Controller
            control={control}
            name={`${fieldPrefix}totalseats`}
            render={({ field }) => (
              <Input
                type="number"
                placeholder="VD: 5"
                value={field.value ?? 1}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                }
                error={!!errors.totalseats}
                hint={errors.totalseats?.message}
              />
            )}
          />
        </div>

        {/* Số lượng đã cấp phát */}
        <div>
          <Label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
            Đã cấp phát (Allocated Seats)
          </Label>
          <Controller
            control={control}
            name={`${fieldPrefix}allocatedseats`}
            render={({ field }) => (
              <Input
                type="number"
                placeholder="VD: 2"
                value={field.value ?? 0}
                onChange={(e) =>
                  field.onChange(e.target.value === "" ? 0 : Number(e.target.value))
                }
                error={!!errors.allocatedseats}
                hint={errors.allocatedseats?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Bản quyền vĩnh viễn */}
      <div className="mt-3 p-3.5 rounded-xl border border-gray-200/90 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 flex items-start gap-3 transition-colors">
        <Controller
          control={control}
          name={`${fieldPrefix}isperpetual`}
          defaultValue={false}
          render={({ field }) => (
            <div className="pt-0.5">
              <Checkbox
                checked={Boolean(field.value)}
                onChange={(checked: boolean) => field.onChange(checked)}
              />
            </div>
          )}
        />
        <div className="text-sm">
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            Bản quyền vĩnh viễn (Perpetual License)
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Tích chọn nếu giấy phép sử dụng trọn đời, không phụ thuộc vào chu kỳ gia hạn định kỳ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DigitalSoftwareLicensePage;