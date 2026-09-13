import { Controller, useForm } from "react-hook-form";
import { DigitalInternetLineFormData, digitalinternetlineSchema } from "../../../validations/digitalinternetline.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { internetLineTypeList, ipTypeList } from "../../../common/InternetLineTypeList";
import Input from "../../../components/form/input/InputField";

interface DigitalInternetLineProps {
  digitalinternetline?: DigitalInternetLineFormData | null;
  onChange?: (data: Partial<DigitalInternetLineFormData>, isValid: boolean) => void;
}

const DigitalInternetLinePage: React.FC<DigitalInternetLineProps> = ({
  digitalinternetline,
  onChange,
}) => {
  const {
    register,
    control,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<DigitalInternetLineFormData>({
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

  // Đồng bộ lại dữ liệu khi nhận props từ ngoài vào (chế độ Chỉnh sửa)
  useEffect(() => {
    if (digitalinternetline) {
      reset({
        linetype: digitalinternetline.linetype || "FTTH",
        domesticbandwidthmbps: digitalinternetline.domesticbandwidthmbps ?? 0,
        internationalminbandwidthmbps: digitalinternetline.internationalminbandwidthmbps || "",
        monthlyfee: digitalinternetline.monthlyfee ?? 0,
        annualfee: digitalinternetline.annualfee ?? 0,
        iptype: digitalinternetline.iptype || "STATIC_SINGLE",
        staticipaddress: digitalinternetline.staticipaddress || "",
      });
    }
  }, [digitalinternetline, reset]);

  // Lắng nghe thay đổi dữ liệu form và gửi ra ngoài cho trang cha
  useEffect(() => {
    const subscription = watch((value) => {
      onChange?.(value as Partial<DigitalInternetLineFormData>, isValid);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange, isValid]);

  return (
    <div className="space-y-4">
      {/* Loại đường truyền */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Loại đường truyền
        </Label>
        <Controller
          control={control}
          name="linetype"
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
              className="dark:bg-dark-900"
            />
          )}
        />
        {errors.linetype && (
          <p className="text-red-500 text-xs mt-1">{errors.linetype.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Băng thông trong nước */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Băng thông trong nước (Mbps)
          </Label>
          <Controller
            control={control}
            name="domesticbandwidthmbps"
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
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Băng thông quốc tế tối thiểu
          </Label>
          <Input
            type="text"
            placeholder="VD: 10 Mbps (Cam kết)"
            {...register("internationalminbandwidthmbps")}
            error={!!errors.internationalminbandwidthmbps}
            hint={errors.internationalminbandwidthmbps?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Cước phí hàng tháng */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Cước phí hàng tháng (VNĐ)
          </Label>
          <Controller
            control={control}
            name="monthlyfee"
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
          <Label className="block text-sm font-medium text-gray-700 mb-1">
            Cước phí hàng năm (VNĐ)
          </Label>
          <Controller
            control={control}
            name="annualfee"
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
      </div>

      {/* Loại IP cung cấp */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Loại IP
        </Label>
        <Controller
          control={control}
          name="iptype"
          render={({ field }) => (
            <Select
              options={ipTypeList.map((item) => ({
                value: item.value,
                label: item.label,
                title: item.title,
              }))}
              placeholder="Chọn loại địa chỉ IP"
              value={field.value}
              onChange={(val) => field.onChange(val)}
              className="dark:bg-dark-900"
            />
          )}
        />
        {errors.iptype && (
          <p className="text-red-500 text-xs mt-1">{errors.iptype.message}</p>
        )}
      </div>

      {/* Địa chỉ IP tĩnh / Dải IP được cấp */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ IP tĩnh / Dải IP cấp kèm
        </Label>
        <textarea
          rows={3}
          placeholder="VD: 118.70.124.25/29 (Gồm các IP khả dụng: 118.70.124.26 - 118.70.124.30)"
          {...register("staticipaddress")}
          className="w-full border border-gray-300 rounded px-3 py-2 resize-none text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
        />
        {errors.staticipaddress && (
          <p className="text-red-500 text-xs mt-1">{errors.staticipaddress.message}</p>
        )}
      </div>
    </div>
  );
};

export default DigitalInternetLinePage;