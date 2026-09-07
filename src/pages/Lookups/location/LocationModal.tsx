import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../../../components/ui/button/Button";
import { Modal } from "../../../components/ui/modal";
import { location } from "../../../models/Lookup/location/location";
import { LocationFormData, locationSchema } from "../../../validations/location.schema";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: location | null;
  locations: location[];
  isLoading?: boolean;
  onSubmit?: (data: LocationFormData) => void | Promise<void>;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, location: currentLocation, locations, isLoading = false, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.input<typeof locationSchema>, unknown, LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: "", code: "", address: "", parentId: undefined },
  });
  const fieldClass = "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  useEffect(() => {
    if (!isOpen) return;
    reset(currentLocation ? { name: currentLocation.name ?? "", code: currentLocation.code ?? "", address: currentLocation.address ?? "", parentId: currentLocation.parentId ?? undefined } : { name: "", code: "", address: "", parentId: undefined });
  }, [currentLocation, isOpen, reset]);

  const parentOptions = locations.filter((item) => item.id !== currentLocation?.id);
  const isEdit = !!currentLocation;
  return <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? "Chỉnh sửa địa điểm" : "Thêm địa điểm"} className="max-w-lg"><form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>{isLoading && isEdit ? <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-500">Đang tải thông tin...</div> : <div className="space-y-5">
    <div><label htmlFor="location-name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tên địa điểm *</label><input id="location-name" {...register("name")} className={fieldClass} placeholder="Nhập tên địa điểm" />{errors.name && <p className="mt-1.5 text-sm text-red-500">{errors.name.message}</p>}</div>
    <div><label htmlFor="location-code" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Mã địa điểm *</label><input id="location-code" {...register("code")} className={fieldClass} placeholder="Nhập mã địa điểm" />{errors.code && <p className="mt-1.5 text-sm text-red-500">{errors.code.message}</p>}</div>
    <div><label htmlFor="location-parent" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Địa điểm cha</label><select id="location-parent" {...register("parentId", { valueAsNumber: true })} className={fieldClass}><option value="">Không có</option>{parentOptions.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.code})</option>)}</select>{errors.parentId && <p className="mt-1.5 text-sm text-red-500">{errors.parentId.message}</p>}</div>
    <div><label htmlFor="location-address" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ</label><textarea id="location-address" {...register("address")} className={fieldClass} rows={3} placeholder="Nhập địa chỉ" />{errors.address && <p className="mt-1.5 text-sm text-red-500">{errors.address.message}</p>}</div>
    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800"><Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}</Button></div>
  </div>}</form></Modal>;
};

export default LocationModal;