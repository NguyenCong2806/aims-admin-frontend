import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { department } from "../../../models/Lookup/department/department";
import { position } from "../../../models/Lookup/position/position";
import { PositionFormData, positionSchema } from "../../../validations/position.schema";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

interface PositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: position | null;
  departments: department[];
  isLoading?: boolean;
  onSubmit?: (data: PositionFormData) => void | Promise<void>;
}

const PositionModal: React.FC<PositionModalProps> = ({
  isOpen,
  onClose,
  position: currentPosition,
  departments,
  isLoading = false,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof positionSchema>, unknown, PositionFormData>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      name: "",
      code: "",
      departmentId: undefined,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      currentPosition
        ? {
            name: currentPosition.name ?? "",
            code: currentPosition.code ?? "",
            departmentId: currentPosition.departmentId ?? undefined,
          }
        : {
            name: "",
            code: "",
            departmentId: undefined,
          }
    );
  }, [currentPosition, isOpen, reset]);

  const isEdit = !!currentPosition;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa chức vụ" : "Thêm mới chức vụ"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Tên chức vụ */}
            <div>
              <label htmlFor="position-name" className={FIELD_LABEL_CLASS}>
                Tên chức vụ <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="position-name"
                type="text"
                placeholder="VD: Trưởng phòng IT, Kỹ sư hệ thống, Chuyên viên hỗ trợ..."
                {...register("name")}
                className={getInputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mã chức vụ */}
            <div>
              <label htmlFor="position-code" className={FIELD_LABEL_CLASS}>
                Mã chức vụ <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="position-code"
                type="text"
                placeholder="VD: POS_IT_LEAD, POS_SYS_ADMIN, POS_HELP_DESK..."
                {...register("code")}
                className={getInputClass(!!errors.code, true)}
              />
              {errors.code && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Phòng ban trực thuộc */}
            <div>
              <label htmlFor="position-department" className={FIELD_LABEL_CLASS}>
                Phòng ban trực thuộc
              </label>
              <select
                id="position-department"
                {...register("departmentId", { valueAsNumber: true })}
                className={getInputClass(!!errors.departmentId)}
              >
                <option value="">-- Không phân bổ cố định --</option>
                {departments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.code})
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.departmentId.message}
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

export default PositionModal;