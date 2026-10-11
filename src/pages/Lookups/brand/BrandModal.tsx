import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import { brandSchema, type BrandFormData } from "../../../validations/brand.schema";
import type { brand } from "../../../models/Lookup/brand/brand";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    formState: { errors, isSubmitting },
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      brand
        ? {
            name: brand.name ?? "",
            code: brand.code ?? "",
          }
        : {
            name: "",
            code: "",
          }
    );
  }, [brand, isOpen, reset]);

  const isEdit = !!brand;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa hãng sản xuất" : "Thêm mới hãng sản xuất"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Tên hãng */}
            <div>
              <label htmlFor="brand-name" className={FIELD_LABEL_CLASS}>
                Tên hãng sản xuất <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="brand-name"
                type="text"
                placeholder="VD: Dell Technologies, HP, Apple, Cisco..."
                {...register("name")}
                className={getInputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mã hãng */}
            <div>
              <label htmlFor="brand-code" className={FIELD_LABEL_CLASS}>
                Mã hãng sản xuất <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="brand-code"
                type="text"
                placeholder="VD: DELL, HP, APPLE, CISCO..."
                {...register("code")}
                className={getInputClass(!!errors.code, true)}
              />
              {errors.code && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.code.message}
                </p>
              )}
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

export default BrandModal;