import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import { licensetype } from "../../../models/Lookup/licensetype/licensetype";
import { LicenseTypeFormData, licensetypeSchema } from "../../../validations/licensetype.schema";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

interface LicenseTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseType?: licensetype | null;
  isLoading?: boolean;
  onSubmit?: (data: LicenseTypeFormData) => void | Promise<void>;
}

const LicenseTypeModal: React.FC<LicenseTypeModalProps> = ({
  isOpen,
  onClose,
  licenseType,
  isLoading = false,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LicenseTypeFormData>({
    resolver: zodResolver(licensetypeSchema),
    defaultValues: {
      name: "",
      code: "",
      isSubscription: false,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      licenseType
        ? {
            name: licenseType.name ?? "",
            code: licenseType.code ?? "",
            isSubscription: licenseType.isSubscription ?? false,
          }
        : {
            name: "",
            code: "",
            isSubscription: false,
          }
    );
  }, [isOpen, licenseType, reset]);

  const isEdit = !!licenseType;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa loại giấy phép" : "Thêm mới loại giấy phép"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Tên loại giấy phép */}
            <div>
              <label htmlFor="license-type-name" className={FIELD_LABEL_CLASS}>
                Tên loại giấy phép / Bản quyền <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="license-type-name"
                type="text"
                placeholder="VD: Bản quyền vĩnh viễn (Perpetual), Thuê bao hàng năm (SaaS)..."
                {...register("name")}
                className={getInputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mã loại giấy phép */}
            <div>
              <label htmlFor="license-type-code" className={FIELD_LABEL_CLASS}>
                Mã loại giấy phép <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="license-type-code"
                type="text"
                placeholder="VD: LIC_PERPETUAL, LIC_SUBSCRIPTION, LIC_OEM..."
                {...register("code")}
                className={getInputClass(!!errors.code, true)}
              />
              {errors.code && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Thuê bao định kỳ */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Phải gia hạn định kỳ (Subscription)
                </span>
                <p className="text-[10px] text-gray-400">
                  Hệ thống sẽ kích hoạt cảnh báo trước ngày hết hạn
                </p>
              </div>
              <input
                type="checkbox"
                {...register("isSubscription")}
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

export default LicenseTypeModal;