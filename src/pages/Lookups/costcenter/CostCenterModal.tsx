import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import { costcenter } from "../../../models/Lookup/costcenter/costcenter";
import { CostCenterFormData, costcenterSchema } from "../../../validations/costcenter.schema";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

interface CostCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  costCenter?: costcenter | null;
  isLoading?: boolean;
  onSubmit?: (data: CostCenterFormData) => void | Promise<void>;
}

const CostCenterModal: React.FC<CostCenterModalProps> = ({
  isOpen,
  onClose,
  costCenter,
  isLoading = false,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CostCenterFormData>({
    resolver: zodResolver(costcenterSchema),
    defaultValues: {
      name: "",
      code: "",
      budgetLimit: undefined,
      fiscalYear: undefined,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      costCenter
        ? {
            name: costCenter.name ?? "",
            code: costCenter.code ?? "",
            budgetLimit: costCenter.budgetLimit ?? undefined,
            fiscalYear: costCenter.fiscalYear ?? undefined,
          }
        : {
            name: "",
            code: "",
            budgetLimit: undefined,
            fiscalYear: undefined,
          }
    );
  }, [costCenter, isOpen, reset]);

  const isEdit = !!costCenter;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa trung tâm chi phí" : "Thêm mới trung tâm chi phí"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Tên trung tâm chi phí */}
            <div>
              <label htmlFor="cost-center-name" className={FIELD_LABEL_CLASS}>
                Tên trung tâm chi phí <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="cost-center-name"
                type="text"
                placeholder="VD: Phòng IT - Dự án Chuyển đổi số, Khối Vận hành..."
                {...register("name")}
                className={getInputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mã trung tâm chi phí */}
            <div>
              <label htmlFor="cost-center-code" className={FIELD_LABEL_CLASS}>
                Mã trung tâm chi phí <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="cost-center-code"
                type="text"
                placeholder="VD: CC_IT_2026, CC_OPS_HN..."
                {...register("code")}
                className={getInputClass(!!errors.code, true)}
              />
              {errors.code && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Hạn mức ngân sách & Năm tài chính */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cost-center-budget" className={FIELD_LABEL_CLASS}>
                  Hạn mức ngân sách (VNĐ)
                </label>
                <input
                  id="cost-center-budget"
                  type="number"
                  min="0"
                  step="1000000"
                  placeholder="VD: 500000000"
                  {...register("budgetLimit", { valueAsNumber: true })}
                  className={getInputClass(!!errors.budgetLimit)}
                />
                {errors.budgetLimit && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">
                    {errors.budgetLimit.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="cost-center-year" className={FIELD_LABEL_CLASS}>
                  Năm tài chính
                </label>
                <input
                  id="cost-center-year"
                  type="number"
                  min="2020"
                  max="2035"
                  placeholder="VD: 2026"
                  {...register("fiscalYear", { valueAsNumber: true })}
                  className={getInputClass(!!errors.fiscalYear)}
                />
                {errors.fiscalYear && (
                  <p className="mt-1 text-[11px] text-red-500 font-medium">
                    {errors.fiscalYear.message}
                  </p>
                )}
              </div>
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

export default CostCenterModal;