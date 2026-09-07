import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { supplier } from "../../../models/Lookup/supplier/supplier";
import { SupplierFormData, supplierSchema } from "../../../validations/supplier.schema";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: supplier | null;
  isLoading?: boolean;
  onSubmit?: (data: SupplierFormData) => void | Promise<void>;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, supplier: currentSupplier, isLoading = false, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: "", code: "", taxCode: "", phone: "", email: "", address: "", contactPerson: "" },
  });
  const fieldClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  useEffect(() => {
    if (!isOpen) return;
    reset(currentSupplier ? {
      name: currentSupplier.name ?? "",
      code: currentSupplier.code ?? "",
      taxCode: currentSupplier.taxCode ?? "",
      phone: currentSupplier.phone ?? "",
      email: currentSupplier.email ?? "",
      address: currentSupplier.address ?? "",
      contactPerson: currentSupplier.contactPerson ?? "",
    } : { name: "", code: "", taxCode: "", phone: "", email: "", address: "", contactPerson: "" });
  }, [currentSupplier, isOpen, reset]);

  const isEdit = !!currentSupplier;
  const input = (id: keyof SupplierFormData, label: string, placeholder: string, type = "text") => <div><label htmlFor={`supplier-${id}`} className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label><input id={`supplier-${id}`} type={type} {...register(id)} className={fieldClass} placeholder={placeholder} />{errors[id] && <p className="mt-1.5 text-sm text-red-500">{errors[id]?.message}</p>}</div>;

  return <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp"} className="max-w-2xl">
    <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
      {isLoading && isEdit ? <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">Đang tải thông tin...</div> : <div className="space-y-5">
        {input("name", "Tên nhà cung cấp *", "Nhập tên nhà cung cấp")}
        {input("code", "Mã nhà cung cấp *", "Nhập mã nhà cung cấp")}
        <div className="grid gap-5 sm:grid-cols-2">{input("taxCode", "Mã số thuế", "Nhập mã số thuế")}{input("phone", "Số điện thoại", "Nhập số điện thoại", "tel")}</div>
        <div className="grid gap-5 sm:grid-cols-2">{input("contactPerson", "Người liên hệ", "Nhập tên người liên hệ")}{input("email", "Email", "Nhập email", "email")}</div>
        <div><label htmlFor="supplier-address" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ</label><textarea id="supplier-address" {...register("address")} className={fieldClass} rows={3} placeholder="Nhập địa chỉ" />{errors.address && <p className="mt-1.5 text-sm text-red-500">{errors.address.message}</p>}</div>
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}</Button></div>
      </div>}
    </form>
  </Modal>;
};

export default SupplierModal;