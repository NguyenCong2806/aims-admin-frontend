import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import { supplier } from "../../../models/Lookup/supplier/supplier";
import {
  SupplierFormData,
  supplierSchema,
} from "../../../validations/supplier.schema";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: supplier | null;
  isLoading?: boolean;
  onSubmit?: (data: SupplierFormData) => void | Promise<void>;
}

const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  supplier: currentSupplier,
  isLoading = false,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      code: "",
      taxCode: "",
      phone: "",
      email: "",
      address: "",
      contactPerson: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      currentSupplier
        ? {
            name: currentSupplier.name ?? "",
            code: currentSupplier.code ?? "",
            taxCode: currentSupplier.taxCode ?? "",
            phone: currentSupplier.phone ?? "",
            email: currentSupplier.email ?? "",
            address: currentSupplier.address ?? "",
            contactPerson: currentSupplier.contactPerson ?? "",
          }
        : {
            name: "",
            code: "",
            taxCode: "",
            phone: "",
            email: "",
            address: "",
            contactPerson: "",
          }
    );
  }, [currentSupplier, isOpen, reset]);

  const isEdit = !!currentSupplier;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa nhà cung cấp" : "Thêm mới nhà cung cấp"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Grid Tên và Mã */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="supplier-name" className={FIELD_LABEL_CLASS}>
                  Tên nhà cung cấp <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="supplier-name"
                  type="text"
                  {...register("name")}
                  className={getInputClass(!!errors.name)}
                  placeholder="VD: FPT Information System, Dell VN..."
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="supplier-code" className={FIELD_LABEL_CLASS}>
                  Mã nhà cung cấp <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="supplier-code"
                  type="text"
                  {...register("code")}
                  className={getInputClass(!!errors.code, true)}
                  placeholder="VD: NCC_FPT, NCC_DELL..."
                />
                {errors.code && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">
                    {errors.code.message}
                  </p>
                )}
              </div>
            </div>

            {/* Grid Mã số thuế & Điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="supplier-taxCode" className={FIELD_LABEL_CLASS}>
                  Mã số thuế
                </label>
                <input
                  id="supplier-taxCode"
                  type="text"
                  {...register("taxCode")}
                  className={getInputClass(!!errors.taxCode)}
                  placeholder="VD: 0101234567"
                />
                {errors.taxCode && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">
                    {errors.taxCode.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="supplier-phone" className={FIELD_LABEL_CLASS}>
                  Số điện thoại
                </label>
                <input
                  id="supplier-phone"
                  type="tel"
                  {...register("phone")}
                  className={getInputClass(!!errors.phone)}
                  placeholder="VD: 024 7300 7300 / 0912 345 678"
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Grid Người liên hệ & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="supplier-contactPerson"
                  className={FIELD_LABEL_CLASS}
                >
                  Người liên hệ
                </label>
                <input
                  id="supplier-contactPerson"
                  type="text"
                  {...register("contactPerson")}
                  className={getInputClass(!!errors.contactPerson)}
                  placeholder="VD: Nguyễn Văn A (Phụ trách KD)"
                />
                {errors.contactPerson && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">
                    {errors.contactPerson.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="supplier-email" className={FIELD_LABEL_CLASS}>
                  Email liên hệ
                </label>
                <input
                  id="supplier-email"
                  type="email"
                  {...register("email")}
                  className={getInputClass(!!errors.email)}
                  placeholder="VD: contact@fpt.com.vn"
                />
                {errors.email && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <label htmlFor="supplier-address" className={FIELD_LABEL_CLASS}>
                Địa chỉ trụ sở / văn phòng
              </label>
              <textarea
                id="supplier-address"
                rows={2}
                {...register("address")}
                className={getInputClass(!!errors.address)}
                placeholder="VD: Tòa nhà FPT, Phố Duy Tân, Cầu Giấy, Hà Nội"
              />
              {errors.address && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.address.message}
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

export default SupplierModal;