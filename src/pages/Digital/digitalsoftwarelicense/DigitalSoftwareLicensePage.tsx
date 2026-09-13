import { DigitalSoftwareLicenseFormData, digitalsoftwarelicenseSchema } from "../../../validations/digitalsoftwarelicense.schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";

interface DigitalSoftwareLicenseProps {
  digitalsoftwarelicense?: DigitalSoftwareLicenseFormData | null;
  onChange?: (data: Partial<DigitalSoftwareLicenseFormData>, isValid: boolean) => void;
}

const DigitalSoftwareLicensePage: React.FC<DigitalSoftwareLicenseProps> = ({
  digitalsoftwarelicense,
  onChange,
}) => {
  const {
    register,
    control,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<DigitalSoftwareLicenseFormData>({
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

  // Đồng bộ lại dữ liệu khi component nhận prop thay đổi (khi edit hoặc reset)
  useEffect(() => {
    if (digitalsoftwarelicense) {
      reset({
        licensekey: digitalsoftwarelicense.licensekey || "",
        softwarename: digitalsoftwarelicense.softwarename || "",
        boundhardwareserial: digitalsoftwarelicense.boundhardwareserial || "",
        totalseats: digitalsoftwarelicense.totalseats ?? 1,
        allocatedseats: digitalsoftwarelicense.allocatedseats ?? 0,
        isperpetual: digitalsoftwarelicense.isperpetual ?? false,
      });
    }
  }, [digitalsoftwarelicense, reset]);

  // Lắng nghe thay đổi giá trị và truyền ra trang cha
  useEffect(() => {
    const subscription = watch((value) => {
      onChange?.(value as Partial<DigitalSoftwareLicenseFormData>, isValid);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange, isValid]);

  return (
    <div className="space-y-4">
      {/* Tên phần mềm */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Tên phần mềm <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          placeholder="VD: Microsoft Office 365, Adobe Photoshop, JetBrains..."
          {...register("softwarename")}
          error={!!errors.softwarename}
          hint={errors.softwarename?.message}
        />
      </div>

      {/* License Key / Khóa kích hoạt */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Khóa kích hoạt (License Key / Product Key)
        </Label>
        <Input
          type="text"
          placeholder="VD: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
          {...register("licensekey")}
          error={!!errors.licensekey}
          hint={errors.licensekey?.message}
        />
      </div>

      {/* Serial phần cứng gán kèm */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Serial phần cứng gán kèm (Hardware Serial / MAC)
        </Label>
        <Input
          type="text"
          placeholder="VD: Gán cho máy có Serial/Service Tag: DELL-SN-998811"
          {...register("boundhardwareserial")}
          error={!!errors.boundhardwareserial}
          hint={errors.boundhardwareserial?.message}
        />
      </div>

      {/* Số lượng chỗ / License */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Tổng số seat/user */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Tổng số lượng (Total Seats / Devices)
          </Label>
          <Controller
            control={control}
            name="totalseats"
            render={({ field }) => (
              <Input
                type="number"
                placeholder="VD: 5"
                value={field.value ?? 0}
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
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Đã cấp phát (Allocated Seats)
          </Label>
          <Controller
            control={control}
            name="allocatedseats"
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
      <div className="flex items-center gap-3 pt-2">
        <Controller
          control={control}
          name="isperpetual"
          render={({ field }) => (
            <Checkbox
              checked={Boolean(field.value)}
              onChange={(checked: boolean) => field.onChange(checked)}
            />
          )}
        />
        <div>
          <span className="block text-sm font-medium text-gray-800 dark:text-white/90">
            Bản quyền vĩnh viễn (Perpetual License)
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            Tích chọn nếu giấy phép sử dụng trọn đời, không phụ thuộc chu kỳ gia hạn định kỳ.
          </span>
        </div>
      </div>
    </div>
  );
};

export default DigitalSoftwareLicensePage;