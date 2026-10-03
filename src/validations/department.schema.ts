import { z } from "zod";

const optionalNumber = (message: string) => z.preprocess(
  (value) => value === "" || Number.isNaN(value) ? undefined : value,
  z.number({ error: message }).int(message).positive(message).optional(),
);

export const departmentSchema = z.object({
  name: z.string().trim().min(1, "Tên phòng ban không được để trống.").max(255),
  code: z.string().trim().min(1, "Mã phòng ban không được để trống.").max(100),
  parentId: optionalNumber("Phòng ban cha không hợp lệ."),
  managerName: z.string().trim().max(100, "Tên người quản lý tối đa 100 ký tự.").optional(),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;