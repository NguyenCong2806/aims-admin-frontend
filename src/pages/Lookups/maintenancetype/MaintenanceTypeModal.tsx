import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "../../../components/ui/modal";
import { maintenancetype } from "../../../models/Lookup/maintenancetype/maintenancetype";
import { MaintenanceTypeFormData, maintenancetypeSchema } from "../../../validations/maintenancetype.schema";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

interface MaintenanceTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceType?: maintenancetype | null;
  isLoading?: boolean;
  onSubmit?: (data: MaintenanceTypeFormData) => void | Promise<void>;
}

const MaintenanceTypeModal: React.FC<MaintenanceTypeModalProps> = ({
  isOpen,
  onClose,
  maintenanceType,
  isLoading = false,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceTypeFormData>({
    resolver: zodResolver(maintenancetypeSchema),
    defaultValues: {
      name: "",
      code: "",
      isPreventive: false,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      maintenanceType
        ? {
            name: maintenanceType.name ?? "",
            code: maintenanceType.code ?? "",
            isPreventive: maintenanceType.isPreventive ?? false,
          }
        : {
            name: "",
            code: "",
            isPreventive: false,
          }
    );
  }, [isOpen, maintenanceType, reset]);

  const isEdit = !!maintenanceType;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa loại bảo trì" : "Thêm mới loại bảo trì"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Tên loại bảo trì */}
            <div>
              <label htmlFor="maintenance-type-name" className={FIELD_LABEL_CLASS}>
                Tên loại bảo trì <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="maintenance-type-name"
                type="text"
                placeholder="VD: Bảo dưỡng định kỳ, Sửa chữa sự cố, Thay thế linh kiện..."
                {...register("name")}
                className={getInputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mã loại bảo trì */}
            <div>
              <label htmlFor="maintenance-type-code" className={FIELD_LABEL_CLASS}>
                Mã loại bảo trì <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="maintenance-type-code"
                type="text"
                placeholder="VD: MAINT_PREVENTIVE, MAINT_CORRECTIVE, MAINT_UPGRADE..."
                {...register("code")}
                className={getInputClass(!!errors.code, true)}
              />
              {errors.code && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Bảo trì dự phòng/định kỳ */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Bảo trì dự phòng định kỳ (Preventive Maintenance)
                </span>
                <p className="text-[10px] text-gray-400">
                  Phân loại công việc theo lịch định kỳ thay vì sự cố đột xuất
                </p>
              </div>
              <input
                type="checkbox"
                {...register("isPreventive")}
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

export default MaintenanceTypeModal;