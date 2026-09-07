import { z } from "zod";

export const licensetypeSchema = z.object({
  name: z.string().trim().min(1, "Tên loại giấy phép không được để trống.").max(255),
  code: z.string().trim().min(1, "Mã loại giấy phép không được để trống.").max(100),
  isSubscription: z.boolean(),
});

export type LicenseTypeFormData = z.infer<typeof licensetypeSchema>;