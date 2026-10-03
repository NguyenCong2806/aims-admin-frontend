import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import { assetstatus } from "../../../models/Lookup/assetstatus/assetstatus";
import { AssetStatusFormData, assetstatusSchema } from "../../../validations/assetstatuse.schema";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

interface AssetStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetStatus?: assetstatus | null;
  isLoading?: boolean;
  onSubmit?: (data: AssetStatusFormData) => void | Promise<void>;
}

const DEFAULT_COLOR = "#3B82F6";

const COLOR_PRESETS = [
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#6B7280", // Gray
  "#06B6D4", // Cyan
  "#EC4899", // Pink
];

const AssetStatusModal: React.FC<AssetStatusModalProps> = ({
  isOpen,
  onClose,
  assetStatus,
  isLoading = false,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AssetStatusFormData>({
    resolver: zodResolver(assetstatusSchema),
    defaultValues: {
      name: "",
      code: "",
      colorCode: DEFAULT_COLOR,
      allowAllocation: false,
    },
  });

  const currentColor = watch("colorCode") || DEFAULT_COLOR;

  useEffect(() => {
    if (!isOpen) return;
    if (assetStatus) {
      reset({
        name: assetStatus.name ?? "",
        code: assetStatus.code ?? "",
        colorCode: assetStatus.colorCode ?? DEFAULT_COLOR,
        allowAllocation: assetStatus.allowAllocation ?? false,
      });
    } else {
      reset({
        name: "",
        code: "",
        colorCode: DEFAULT_COLOR,
        allowAllocation: false,
      });
    }
  }, [assetStatus, isOpen, reset]);

  const isEdit = !!assetStatus;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa trạng thái tài sản" : "Thêm mới trạng thái tài sản"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Tên trạng thái */}
            <div>
              <label htmlFor="status-name" className={FIELD_LABEL_CLASS}>
                Tên trạng thái <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="status-name"
                type="text"
                placeholder="VD: Sẵn sàng sử dụng, Đang sử dụng, Đang sửa chữa..."
                {...register("name")}
                className={getInputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mã trạng thái */}
            <div>
              <label htmlFor="status-code" className={FIELD_LABEL_CLASS}>
                Mã trạng thái <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="status-code"
                type="text"
                placeholder="VD: READY, IN_USE, MAINTENANCE, BROKEN..."
                {...register("code")}
                className={getInputClass(!!errors.code, true)}
              />
              {errors.code && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Màu nhận diện */}
            <div>
              <label className={FIELD_LABEL_CLASS}>Màu sắc nhận diện (Badge Color)</label>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: currentColor }}
                />
                <input
                  type="text"
                  {...register("colorCode")}
                  placeholder="#3B82F6"
                  className="w-28 px-3 py-1.5 text-xs font-mono uppercase rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => setValue("colorCode", e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
              </div>

              {/* Color Presets */}
              <div className="flex items-center gap-1.5">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue("colorCode", color)}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      currentColor.toLowerCase() === color.toLowerCase()
                        ? "scale-125 ring-2 ring-indigo-500 ring-offset-1"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Cho phép cấp phát */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Cho phép cấp phát cho nhân viên
                </span>
                <p className="text-[10px] text-gray-400">
                  Chỉ những tài sản ở trạng thái này mới được chọn trong phiếu bàn giao
                </p>
              </div>
              <input
                type="checkbox"
                {...register("allowAllocation")}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </div>

            {/* Modal Actions */}
            <LookupModalFooter
              onClose={onClose}
              isSubmitting={isSubmitting}
              isEdit={isEdit}
            />
          </div>
        )}
      </form>
    </Modal>
  );
};

export default AssetStatusModal;