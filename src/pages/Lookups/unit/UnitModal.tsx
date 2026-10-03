import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import { unit } from "../../../models/Lookup/unit/unit";
import { UnitFormData, unitSchema } from "../../../validations/unit.schema";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: unit | null;
  isLoading?: boolean;
  onSubmit?: (data: UnitFormData) => void | Promise<void>;
}

const UnitModal: React.FC<UnitModalProps> = ({
  isOpen,
  onClose,
  unit: currentUnit,
  isLoading = false,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: "", code: "" },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      currentUnit
        ? {
            name: currentUnit.name ?? "",
            code: currentUnit.code ?? "",
          }
        : { name: "", code: "" }
    );
  }, [currentUnit, isOpen, reset]);

  const isEdit = !!currentUnit;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa đơn vị tính" : "Thêm mới đơn vị tính"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Tên đơn vị */}
            <div>
              <label htmlFor="unit-name" className={FIELD_LABEL_CLASS}>
                Tên đơn vị tính <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="unit-name"
                type="text"
                {...register("name")}
                className={getInputClass(!!errors.name)}
                placeholder="VD: Chiếc, Bộ, Thùng, Giấy phép..."
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mã đơn vị */}
            <div>
              <label htmlFor="unit-code" className={FIELD_LABEL_CLASS}>
                Mã đơn vị <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="unit-code"
                type="text"
                {...register("code")}
                className={getInputClass(!!errors.code, true)}
                placeholder="VD: CAI, BO, THUNG, LIC..."
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

export default UnitModal;