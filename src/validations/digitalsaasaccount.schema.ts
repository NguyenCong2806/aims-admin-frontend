import { z } from "zod";

export const digitalsaasaccountSchema = z.object({
  saasaccountname: z
    .string()
    .trim()
    .min(1, "Tên tài khoản SaaS không được để trống.")
    .max(255, "Tên tài khoản SaaS không được vượt quá 255 ký tự."),
  servicebrand: z
    .string("Vui lòng chọn dịch vụ SaaS." )
    .min(1, "Vui lòng chọn dịch vụ SaaS."),
  plantier: z.string().trim().max(255).optional(),
  adminaccountemail: z
    .string()
    .trim()
    .min(1, "Email quản trị không được để trống.")
    .email("Email quản trị không đúng định dạng.")
    .max(255, "Email quản trị không được vượt quá 255 ký tự."),
  totallicensesbought: z
    .number("Vui lòng nhập số lượng license hợp lệ.")
    .min(1, "Số lượng license phải lớn hơn hoặc bằng 1."),
  storagequota: z
    .string()
    .trim()
    .max(255, "Dung lượng lưu trữ không được vượt quá 255 ký tự.")
    .optional(),
});
export type DigitalSaaSAccountFormData = z.infer<typeof digitalsaasaccountSchema>;