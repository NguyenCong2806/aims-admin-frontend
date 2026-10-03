import { z } from "zod";

export const maintenancetypeSchema = z.object({
  name: z.string().trim().min(1, "Tên loại bảo trì không được để trống.").max(255),
  code: z.string().trim().min(1, "Mã loại bảo trì không được để trống.").max(100),
  isPreventive: z.boolean(),
});

export type MaintenanceTypeFormData = z.infer<typeof maintenancetypeSchema>;