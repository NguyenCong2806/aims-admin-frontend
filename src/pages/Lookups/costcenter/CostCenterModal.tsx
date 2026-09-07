import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { costcenter } from "../../../models/Lookup/costcenter/costcenter";
import { CostCenterFormData, costcenterSchema } from "../../../validations/costcenter.schema";

interface CostCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  costCenter?: costcenter | null;
  isLoading?: boolean;
  onSubmit?: (data: CostCenterFormData) => void | Promise<void>;
}

const CostCenterModal: React.FC<CostCenterModalProps> = ({ isOpen, onClose, costCenter, isLoading = false, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CostCenterFormData>({
    resolver: zodResolver(costcenterSchema),
    defaultValues: { name: "", code: "", budgetLimit: undefined, fiscalYear: undefined },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(costCenter ? {
      name: costCenter.name ?? "",
      code: costCenter.code ?? "",
      budgetLimit: costCenter.budgetLimit ?? undefined,
      fiscalYear: costCenter.fiscalYear ?? undefined,
    } : { name: "", code: "", budgetLimit: undefined, fiscalYear: undefined });
  }, [costCenter, isOpen, reset]);

  const isEdit = !!costCenter;
  const fieldClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Chỉnh sửa trung tâm chi phí" : "Thêm trung tâm chi phí"} className="max-w-lg">
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">Đang tải thông tin...</div>
        ) : (
          <div className="space-y-5">
            <div>
              <label htmlFor="cost-center-name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tên trung tâm chi phí *</label>
              <input id="cost-center-name" {...register("name")} className={fieldClass} placeholder="Nhập tên trung tâm chi phí" />
              {errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="cost-center-code" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Mã trung tâm chi phí *</label>
              <input id="cost-center-code" {...register("code")} className={fieldClass} placeholder="Nhập mã trung tâm chi phí" />
              {errors.code && <p className="mt-1.5 text-sm text-red-500">{errors.code.message}</p>}
            </div>
            <div>
              <label htmlFor="cost-center-budget" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Hạn mức ngân sách</label>
              <input id="cost-center-budget" type="number" min="0" step="0.01" {...register("budgetLimit", { valueAsNumber: true })} className={fieldClass} placeholder="Nhập hạn mức ngân sách" />
              {errors.budgetLimit && <p className="mt-1.5 text-sm text-red-500">{errors.budgetLimit.message}</p>}
            </div>
            <div>
              <label htmlFor="cost-center-year" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Năm tài chính</label>
              <input id="cost-center-year" type="number" {...register("fiscalYear", { valueAsNumber: true })} className={fieldClass} placeholder="Nhập năm tài chính" />
              {errors.fiscalYear && <p className="mt-1.5 text-sm text-red-500">{errors.fiscalYear.message}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}</Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CostCenterModal;