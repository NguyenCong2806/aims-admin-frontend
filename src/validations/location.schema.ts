import { z } from "zod";

const optionalParentId = z.preprocess(
  (value) => value === "" || Number.isNaN(value) ? undefined : value,
  z.number({ error: "Địa điểm cha không hợp lệ." }).int("Địa điểm cha không hợp lệ.").positive("Địa điểm cha không hợp lệ.").optional(),
);

export const locationSchema = z.object({
  name: z.string().trim().min(1, "Tên địa điểm không được để trống.").max(255),
  code: z.string().trim().min(1, "Mã địa điểm không được để trống.").max(100),
  address: z.string().trim().max(500, "Địa chỉ tối đa 500 ký tự.").optional(),
  parentId: optionalParentId,
});

export type LocationFormData = z.infer<typeof locationSchema>;