import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../../../components/ui/modal";
import { location } from "../../../models/Lookup/location/location";
import { LocationFormData, locationSchema } from "../../../validations/location.schema";
import {
  FIELD_LABEL_CLASS,
  getInputClass,
  LookupModalLoading,
  LookupModalFooter,
} from "../lookupModalHelper";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: location | null;
  locations: location[];
  isLoading?: boolean;
  onSubmit?: (data: LocationFormData) => void | Promise<void>;
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  location: currentLocation,
  locations,
  isLoading = false,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof locationSchema>, unknown, LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      parentId: undefined,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      currentLocation
        ? {
            name: currentLocation.name ?? "",
            code: currentLocation.code ?? "",
            address: currentLocation.address ?? "",
            parentId: currentLocation.parentId ?? undefined,
          }
        : {
            name: "",
            code: "",
            address: "",
            parentId: undefined,
          }
    );
  }, [currentLocation, isOpen, reset]);

  const parentOptions = locations.filter((item) => item.id !== currentLocation?.id);
  const isEdit = !!currentLocation;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa địa điểm" : "Thêm mới địa điểm"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(async (data) => onSubmit?.(data))}>
        {isLoading && isEdit ? (
          <LookupModalLoading />
        ) : (
          <div className="space-y-4">
            {/* Tên địa điểm */}
            <div>
              <label htmlFor="location-name" className={FIELD_LABEL_CLASS}>
                Tên địa điểm / Tòa nhà / Kho <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="location-name"
                type="text"
                placeholder="VD: Trụ sở Hà Nội - Tòa Keangnam, Chi nhánh HCM..."
                {...register("name")}
                className={getInputClass(!!errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mã địa điểm */}
            <div>
              <label htmlFor="location-code" className={FIELD_LABEL_CLASS}>
                Mã địa điểm <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="location-code"
                type="text"
                placeholder="VD: LOC_HN_HQ, LOC_HCM, LOC_WAREHOUSE..."
                {...register("code")}
                className={getInputClass(!!errors.code, true)}
              />
              {errors.code && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Địa điểm cha */}
            <div>
              <label htmlFor="location-parent" className={FIELD_LABEL_CLASS}>
                Địa điểm cha (Khu vực / Tòa nhà lớn hơn)
              </label>
              <select
                id="location-parent"
                {...register("parentId", { valueAsNumber: true })}
                className={getInputClass(!!errors.parentId)}
              >
                <option value="">-- Không có (Địa điểm cấp 1) --</option>
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

            {/* Địa chỉ chi tiết */}
            <div>
              <label htmlFor="location-address" className={FIELD_LABEL_CLASS}>
                Địa chỉ chi tiết
              </label>
              <textarea
                id="location-address"
                rows={3}
                placeholder="VD: Tầng 18, Tòa nhà Keangnam Landmark 72, Đường Phạm Hùng, Nam Từ Liêm, Hà Nội"
                {...register("address")}
                className={`${getInputClass(!!errors.address)} resize-none`}
              />
              {errors.address && (
                <p className="mt-1 text-[11px] text-red-500 font-medium">
                  {errors.address.message}
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

export default LocationModal;