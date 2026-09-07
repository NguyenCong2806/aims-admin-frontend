import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { unit } from "../../../models/Lookup/unit/unit";
import { UnitFormData, unitSchema } from "../../../validations/unit.schema";

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit?: unit | null;
  isLoading?: boolean;
  onSubmit?: (data: UnitFormData) => void | Promise<void>;
}

const UnitModal: React.FC<UnitModalProps> = ({ isOpen, onClose, unit: currentUnit, isLoading = false, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: "", code: "" },
  });
  const fieldClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  useEffect(() => {
    if (!isOpen) return;
    reset(currentUnit ? { name: currentUnit.name ?? "", code: currentUnit.code ?? "" } : { name: "", code: "" });
  }, [currentUnit, isOpen, reset]);

  const isEdit = !!currentUnit;
  return <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Chỉnh sửa đơn vị" : "Thêm đơn vị"} className="max-w-lg">
    <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
      {isLoading && isEdit ? <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">Đang tải thông tin...</div> : <div className="space-y-5">
        <div><label htmlFor="unit-name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tên đơn vị *</label><input id="unit-name" {...register("name")} className={fieldClass} placeholder="Nhập tên đơn vị" />{errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>}</div>
        <div><label htmlFor="unit-code" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Mã đơn vị *</label><input id="unit-code" {...register("code")} className={fieldClass} placeholder="Nhập mã đơn vị" />{errors.code && <p className="mt-1.5 text-sm text-red-500">{errors.code.message}</p>}</div>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}</Button></div>
      </div>}
    </form>
  </Modal>;
};

export default UnitModal;