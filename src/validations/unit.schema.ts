import { z } from "zod";

export const unitSchema = z.object({
  name: z.string().trim().min(1, "Tên đơn vị không được để trống.").max(255),
  code: z.string().trim().min(1, "Mã đơn vị không được để trống.").max(100),
});

export type UnitFormData = z.infer<typeof unitSchema>;