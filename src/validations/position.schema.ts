import { z } from "zod";

const optionalDepartmentId = z.preprocess(
  (value) => value === "" || Number.isNaN(value) ? undefined : value,
  z.number({ error: "Phòng ban không hợp lệ." }).int("Phòng ban không hợp lệ.").positive("Phòng ban không hợp lệ.").optional(),
);

export const positionSchema = z.object({
  name: z.string().trim().min(1, "Tên chức vụ không được để trống.").max(255),
  code: z.string().trim().min(1, "Mã chức vụ không được để trống.").max(100),
  departmentId: optionalDepartmentId,
});

export type PositionFormData = z.infer<typeof positionSchema>;