import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import { assettype } from "../../../models/Lookup/assettype/assettype";
import { AssetTypeFormData, assettypeSchema } from "../../../validations/assettype.schema";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

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
    formState: { errors, isSubmitting },
  } = useForm<AssetTypeFormData>({
    resolver: zodResolver(assettypeSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      assetType
        ? {
            name: assetType.name ?? "",
            code: assetType.code ?? "",
          }
        : {
            name: "",
            code: "",
          }
    );
  }, [assetType, isOpen, reset]);

  const isEdit = !!assetType;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa loại tài sản" : "Thêm mới loại tài sản"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Tên loại tài sản */}
            <div>
              <label htmlFor="asset-type-name" className={FIELD_LABEL_CLASS}>
                Tên loại tài sản <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="asset-type-name"
                type="text"
                placeholder="VD: Máy tính xách tay (Laptop), Máy trạm (Workstation)..."
                {...register("name")}
                className={getInputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mã loại tài sản */}
            <div>
              <label htmlFor="asset-type-code" className={FIELD_LABEL_CLASS}>
                Mã loại tài sản <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="asset-type-code"
                type="text"
                placeholder="VD: TYPE_LAPTOP, TYPE_PC, TYPE_SERVER..."
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

export default AssetTypeModal;