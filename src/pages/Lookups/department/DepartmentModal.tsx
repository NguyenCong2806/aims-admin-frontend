import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { department } from "../../../models/Lookup/department/department";
import { DepartmentFormData, departmentSchema } from "../../../validations/department.schema";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: department | null;
  departments: department[];
  isLoading?: boolean;
  onSubmit?: (data: DepartmentFormData) => void | Promise<void>;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, department: currentDepartment, departments, isLoading = false, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.input<typeof departmentSchema>, unknown, DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", code: "", parentId: undefined, managerName: "" },
  });
  const fieldClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  useEffect(() => {
    if (!isOpen) return;
    reset(currentDepartment ? {
      name: currentDepartment.name ?? "",
      code: currentDepartment.code ?? "",
      parentId: currentDepartment.parentId ?? undefined,
      managerName: currentDepartment.managerName ?? "",
    } : { name: "", code: "", parentId: undefined, managerName: "" });
  }, [currentDepartment, isOpen, reset]);

  const isEdit = !!currentDepartment;
  const parentOptions = departments.filter((item) => item.id !== currentDepartment?.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Chỉnh sửa phòng ban" : "Thêm phòng ban"} className="max-w-lg">
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">Đang tải thông tin...</div> : <div className="space-y-5">
          <div><label htmlFor="department-name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tên phòng ban *</label><input id="department-name" {...register("name")} className={fieldClass} placeholder="Nhập tên phòng ban" />{errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>}</div>
          <div><label htmlFor="department-code" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Mã phòng ban *</label><input id="department-code" {...register("code")} className={fieldClass} placeholder="Nhập mã phòng ban" />{errors.code && <p className="mt-1.5 text-sm text-red-500">{errors.code.message}</p>}</div>
          <div><label htmlFor="department-parent" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Phòng ban cha</label><select id="department-parent" {...register("parentId", { valueAsNumber: true })} className={fieldClass}><option value="">Không có</option>{parentOptions.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select>{errors.parentId && <p className="mt-1.5 text-sm text-red-500">{errors.parentId.message}</p>}</div>
          <div><label htmlFor="department-manager" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Người quản lý</label><input id="department-manager" {...register("managerName")} className={fieldClass} placeholder="Nhập tên người quản lý" />{errors.managerName && <p className="mt-1.5 text-sm text-red-500">{errors.managerName.message}</p>}</div>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}</Button></div>
        </div>}
      </form>
    </Modal>
  );
};

export default DepartmentModal;