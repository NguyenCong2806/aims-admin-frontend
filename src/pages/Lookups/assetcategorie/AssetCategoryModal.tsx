import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import { assetcategorie } from "../../../models/Lookup/assetcategorie/assetcategorie";
import { AssetCategoryFormData, assetcategorySchema } from "../../../validations/assetcategory.schema";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

interface AssetCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetCategory?: assetcategorie | null;
  isLoading?: boolean;
  onSubmit?: (data: AssetCategoryFormData) => void | Promise<void>;
}

const AssetCategoryModal: React.FC<AssetCategoryModalProps> = ({
  isOpen,
  onClose,
  assetCategory,
  isLoading = false,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssetCategoryFormData>({
    resolver: zodResolver(assetcategorySchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      assetCategory
        ? {
            name: assetCategory.name ?? "",
            code: assetCategory.code ?? "",
          }
        : {
            name: "",
            code: "",
          }
    );
  }, [assetCategory, isOpen, reset]);

  const isEdit = !!assetCategory;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa danh mục tài sản" : "Thêm mới danh mục tài sản"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Tên danh mục */}
            <div>
              <label htmlFor="category-name" className={FIELD_LABEL_CLASS}>
                Tên danh mục <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="category-name"
                type="text"
                placeholder="VD: Máy tính & Thiết bị văn phòng, Máy chủ..."
                {...register("name")}
                className={getInputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mã danh mục */}
            <div>
              <label htmlFor="category-code" className={FIELD_LABEL_CLASS}>
                Mã danh mục <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="category-code"
                type="text"
                placeholder="VD: CAT_PC, CAT_SERVER, CAT_NETWORK..."
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

export default AssetCategoryModal;