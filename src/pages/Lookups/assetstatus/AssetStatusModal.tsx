import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { assetstatus } from "../../../models/Lookup/assetstatus/assetstatus";
import { AssetStatusFormData, assetstatusSchema } from "../../../validations/assetstatuse.schema";

interface AssetStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetStatus?: assetstatus | null;
  isLoading?: boolean;
  onSubmit?: (data: AssetStatusFormData) => void | Promise<void>;
}

const DEFAULT_COLOR = "#3B82F6";

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

  // Lấy giá trị màu hiện tại để hiển thị
  const currentColor = watch("colorCode") || DEFAULT_COLOR;

  // =====================================================
  // LOAD DATA / RESET FORM
  // =====================================================

  useEffect(() => {
    if (!isOpen) return;

    if (assetStatus) {
      reset({
        name: assetStatus.name ?? "",
        code: assetStatus.code ?? "",
        colorCode: assetStatus.colorCode || DEFAULT_COLOR,
        allowAllocation: assetStatus.allowAllocation ?? false,
      });
      return;
    }

    reset({
      name: "",
      code: "",
      colorCode: DEFAULT_COLOR,
      allowAllocation: false,
    });
  }, [assetStatus, isOpen, reset]);

  // =====================================================
  // SUBMIT
  // =====================================================

  const submitForm = async (data: AssetStatusFormData) => {
    await onSubmit?.(data);
  };

  const isEdit = !!assetStatus;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-5">
          {isLoading && isEdit ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-7 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
                <span className="text-sm text-gray-500">Đang tải thông tin...</span>
              </div>
            </div>
          ) : (
            <>
              {/* NAME */}
              <div>
                <label htmlFor="brand-name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  id="brand-name"
                  type="text"
                  placeholder="Nhập tên danh mục"
                  {...register("name")}
                  className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
                    errors.name ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
                  }`}
                />
                {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>}
              </div>

              {/* CODE */}
              <div>
                <label htmlFor="brand-code" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mã danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  id="brand-code"
                  type="text"
                  placeholder="Nhập mã danh mục"
                  {...register("code")}
                  className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition dark:bg-gray-800 dark:text-white ${
                    errors.code ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
                  }`}
                />
                {errors.code && <p className="mt-1.5 text-sm text-red-500">{errors.code.message}</p>}
              </div>

              {/* COLOR CODE */}
              <div>
                <label htmlFor="brand-color" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mã màu <span className="text-red-500">*</span>
                </label>

                <div
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition dark:bg-gray-800 ${
                    errors.colorCode
                      ? "border-red-500 focus-within:border-red-500"
                      : "border-gray-300 focus-within:border-brand-500 dark:border-gray-700"
                  }`}
                >
                  {/* Picker: Khi chọn màu, dùng setValue cập nhật form */}
                  <input
                    type="color"
                    value={currentColor.startsWith("#") && currentColor.length === 7 ? currentColor : DEFAULT_COLOR}
                    onChange={(e) => {
                      setValue("colorCode", e.target.value.toUpperCase(), {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                  />

                  {/* Text Input: Đăng ký chính thức bằng register */}
                  <input
                    id="brand-color"
                    type="text"
                    placeholder="#3B82F6"
                    {...register("colorCode")}
                    className="w-full bg-transparent text-sm uppercase outline-none dark:text-white"
                  />
                </div>

                {errors.colorCode && (
                  <p className="mt-1.5 text-sm text-red-500">
                    {errors.colorCode.message}
                  </p>
                )}
              </div>

              {/* ALLOW ALLOCATION */}
              <div className="flex items-center gap-2">
                <input
                  id="allow-allocation"
                  type="checkbox"
                  {...register("allowAllocation")}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="allow-allocation" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cho phép phân bổ
                </label>
              </div>

              {/* BUTTON */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
                </Button>
              </div>
            </>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default AssetStatusModal;