import { z } from "zod";

export const costcenterSchema = z.object({
  name: z.string().trim().min(1, "Tên trung tâm chi phí không được để trống.").max(255),
  code: z.string().trim().min(1, "Mã trung tâm chi phí không được để trống.").max(100),
  budgetLimit: z.number().min(0, "Ngân sách không được âm.").optional(),
  fiscalYear: z.number().int("Năm tài chính phải là số nguyên.").min(1900).max(3000).optional(),
});

export type CostCenterFormData = z.infer<typeof costcenterSchema>;