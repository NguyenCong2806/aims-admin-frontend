import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { department } from "../../../models/Lookup/department/department";
import { position } from "../../../models/Lookup/position/position";
import { PositionFormData, positionSchema } from "../../../validations/position.schema";

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: position | null;
  departments: department[];
  isLoading?: boolean;
  onSubmit?: (data: PositionFormData) => void | Promise<void>;
}

const PositionModal: React.FC<PositionModalProps> = ({ isOpen, onClose, position: currentPosition, departments, isLoading = false, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.input<typeof positionSchema>, unknown, PositionFormData>({
    resolver: zodResolver(positionSchema),
    defaultValues: { name: "", code: "", departmentId: undefined },
  });
  const fieldClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  useEffect(() => {
    if (!isOpen) return;
    reset(currentPosition ? {
      name: currentPosition.name ?? "",
      code: currentPosition.code ?? "",
      departmentId: currentPosition.departmentId ?? undefined,
    } : { name: "", code: "", departmentId: undefined });
  }, [currentPosition, isOpen, reset]);

  const isEdit = !!currentPosition;
  return <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Chỉnh sửa chức vụ" : "Thêm chức vụ"} className="max-w-lg">
    <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
      {isLoading && isEdit ? <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">Đang tải thông tin...</div> : <div className="space-y-5">
        <div><label htmlFor="position-name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tên chức vụ *</label><input id="position-name" {...register("name")} className={fieldClass} placeholder="Nhập tên chức vụ" />{errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>}</div>
        <div><label htmlFor="position-code" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Mã chức vụ *</label><input id="position-code" {...register("code")} className={fieldClass} placeholder="Nhập mã chức vụ" />{errors.code && <p className="mt-1.5 text-sm text-red-500">{errors.code.message}</p>}</div>
        <div><label htmlFor="position-department" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Phòng ban</label><select id="position-department" {...register("departmentId", { valueAsNumber: true })} className={fieldClass}><option value="">Không có</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select>{errors.departmentId && <p className="mt-1.5 text-sm text-red-500">{errors.departmentId.message}</p>}</div>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}</Button></div>
      </div>}
    </form>
  </Modal>;
};

export default PositionModal;