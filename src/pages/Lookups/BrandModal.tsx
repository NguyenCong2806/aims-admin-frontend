import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

import {
  brandSchema,
  type BrandFormData,
} from "../../validations/brand.schema";

import type { brand } from "../../models/Lookup/brand/brand";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;

  // null = thêm mới
  // brand = chỉnh sửa
  brand?: brand | null;

  isLoading?: boolean;

  onSubmit?: (data: BrandFormData) => void | Promise<void>;
}

const BrandModal: React.FC<BrandModalProps> = ({
  isOpen,
  onClose,
  brand,
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
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),

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
    if (brand) {
      reset({
        name: brand.name ?? "",
        code: brand.code ?? "",
      });

      return;
    }

    // ADD
    reset({
      name: "",
      code: "",
    });
  }, [brand, isOpen, reset]);

  // =====================================================
  // SUBMIT
  // =====================================================

  const submitForm = async (data: BrandFormData) => {
    await onSubmit?.(data);
  };

  const isEdit = !!brand;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? "Chỉnh sửa hãng sản xuất"
          : "Thêm hãng sản xuất"
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
                  Tên hãng sản xuất
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="brand-name"
                  type="text"
                  placeholder="Nhập tên hãng sản xuất"
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
                  Mã hãng
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="brand-code"
                  type="text"
                  placeholder="Nhập mã hãng"
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

export default BrandModal;