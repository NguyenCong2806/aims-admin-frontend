import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";

import { assettype } from "../../../models/Lookup/assettype/assettype";
import { AssetTypeFormData, assettypeSchema } from "../../../validations/assettype.schema";


interface AssetTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetType?: assettype | null;

  isLoading?: boolean;

  onSubmit?: (data: AssetTypeFormData) => void | Promise<void>;
}

const AssetTypeModal: React.FC<AssetTypeModalProps> = ({
  isOpen,
  onClose,
  assetType,
  isLoading = false,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<AssetTypeFormData>({
    resolver: zodResolver(assettypeSchema),

    defaultValues: {
      name: "",
      code: "",
    },
  });

  // =====================================================
  // LOAD DATA / RESET FORM
  // =====================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // EDIT
    if (assetType) {
      reset({
        name: assetType.name ?? "",
        code: assetType.code ?? "",
      });

      return;
    }

    // ADD
    reset({
      name: "",
      code: "",
    });
  }, [assetType, isOpen, reset]);

  // =====================================================
  // SUBMIT
  // =====================================================

  const submitForm = async (data: AssetTypeFormData) => {
    await onSubmit?.(data);
  };

  const isEdit = !!assetType;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? "Chỉnh sửa loại tài sản"
          : "Thêm loại tài sản"
      }
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="space-y-5">

          {/* LOADING DETAIL */}
          {isLoading && isEdit ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-7 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />

                <span className="text-sm text-gray-500">
                  Đang tải thông tin...
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* NAME */}
              <div>
                <label
                  htmlFor="brand-name"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Tên loại tài sản
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="brand-name"
                  type="text"
                  placeholder="Nhập tên danh mục"
                  {...register("name")}
                  className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition
                    dark:bg-gray-800 dark:text-white
                    ${
                      errors.name
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
                    }
                  `}
                />

                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* CODE */}
              <div>
                <label
                  htmlFor="brand-code"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Mã loại tài sản
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="brand-code"
                  type="text"
                  placeholder="Nhập mã loại tài sản"
                  {...register("code")}
                  className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition
                    dark:bg-gray-800 dark:text-white
                    ${
                      errors.code
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-brand-500 dark:border-gray-700"
                    }
                  `}
                />

                {errors.code && (
                  <p className="mt-1.5 text-sm text-red-500">
                    {errors.code.message}
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">

                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Đang lưu..."
                    : isEdit
                      ? "Cập nhật"
                      : "Thêm mới"}
                </Button>

              </div>
            </>
          )}

        </div>
      </form>
    </Modal>
  );
};

export default AssetTypeModal;