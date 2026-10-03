import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { department } from "../../../models/Lookup/department/department";
import { DepartmentFormData, departmentSchema } from "../../../validations/department.schema";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: department | null;
  departments: department[];
  isLoading?: boolean;
  onSubmit?: (data: DepartmentFormData) => void | Promise<void>;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  department: currentDepartment,
  departments,
  isLoading = false,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof departmentSchema>, unknown, DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      code: "",
      parentId: undefined,
      managerName: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      currentDepartment
        ? {
            name: currentDepartment.name ?? "",
            code: currentDepartment.code ?? "",
            parentId: currentDepartment.parentId ?? undefined,
            managerName: currentDepartment.managerName ?? "",
          }
        : {
            name: "",
            code: "",
            parentId: undefined,
            managerName: "",
          }
    );
  }, [currentDepartment, isOpen, reset]);

  const isEdit = !!currentDepartment;
  const parentOptions = departments.filter((item) => item.id !== currentDepartment?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa phòng ban" : "Thêm mới phòng ban"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Tên phòng ban */}
            <div>
              <label htmlFor="department-name" className={FIELD_LABEL_CLASS}>
                Tên phòng ban <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="department-name"
                type="text"
                placeholder="VD: Phòng Công nghệ Thông tin, Phòng Kế toán..."
                {...register("name")}
                className={getInputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mã phòng ban */}
            <div>
              <label htmlFor="department-code" className={FIELD_LABEL_CLASS}>
                Mã phòng ban <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="department-code"
                type="text"
                placeholder="VD: DEPT_IT, DEPT_ACC, DEPT_HR..."
                {...register("code")}
                className={getInputClass(!!errors.code, true)}
              />
              {errors.code && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Phòng ban cha */}
            <div>
              <label htmlFor="department-parent" className={FIELD_LABEL_CLASS}>
                Phòng ban trực thuộc (Cấp trên)
              </label>
              <select
                id="department-parent"
                {...register("parentId", { valueAsNumber: true })}
                className={getInputClass(!!errors.parentId)}
              >
                <option value="">-- Không có (Phòng ban gốc) --</option>
                {parentOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
              {errors.parentId && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.parentId.message}
                </p>
              )}
            </div>

            {/* Người quản lý */}
            <div>
              <label htmlFor="department-manager" className={FIELD_LABEL_CLASS}>
                Người phụ trách / Trưởng phòng
              </label>
              <input
                id="department-manager"
                type="text"
                placeholder="VD: Nguyễn Văn An, Trần Thị Bình..."
                {...register("managerName")}
                className={getInputClass(!!errors.managerName)}
              />
              {errors.managerName && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.managerName.message}
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

export default DepartmentModal;