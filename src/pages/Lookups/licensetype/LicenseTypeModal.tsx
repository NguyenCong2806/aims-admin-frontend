import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { licensetype } from "../../../models/Lookup/licensetype/licensetype";
import { LicenseTypeFormData, licensetypeSchema } from "../../../validations/licensetype.schema";

interface LicenseTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseType?: licensetype | null;
  isLoading?: boolean;
  onSubmit?: (data: LicenseTypeFormData) => void | Promise<void>;
}

const LicenseTypeModal: React.FC<LicenseTypeModalProps> = ({ isOpen, onClose, licenseType, isLoading = false, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LicenseTypeFormData>({
    resolver: zodResolver(licensetypeSchema),
    defaultValues: { name: "", code: "", isSubscription: false },
  });
  const fieldClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  useEffect(() => {
    if (!isOpen) return;
    reset(licenseType ? { name: licenseType.name ?? "", code: licenseType.code ?? "", isSubscription: licenseType.isSubscription ?? false } : { name: "", code: "", isSubscription: false });
  }, [isOpen, licenseType, reset]);

  const isEdit = !!licenseType;
  return <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Chỉnh sửa loại giấy phép" : "Thêm loại giấy phép"} className="max-w-lg">
    <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
      {isLoading && isEdit ? <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">Đang tải thông tin...</div> : <div className="space-y-5">
        <div><label htmlFor="license-type-name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tên loại giấy phép *</label><input id="license-type-name" {...register("name")} className={fieldClass} placeholder="Nhập tên loại giấy phép" />{errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>}</div>
        <div><label htmlFor="license-type-code" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Mã loại giấy phép *</label><input id="license-type-code" {...register("code")} className={fieldClass} placeholder="Nhập mã loại giấy phép" />{errors.code && <p className="mt-1.5 text-sm text-red-500">{errors.code.message}</p>}</div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><input type="checkbox" {...register("isSubscription")} className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" />Phải gia hạn định kỳ</label>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}</Button></div>
      </div>}
    </form>
  </Modal>;
};

export default LicenseTypeModal;