import { z } from "zod";

const optionalText = (max: number, message: string) => z.string().trim().max(max, message).optional();

export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Tên nhà cung cấp không được để trống.").max(255),
  code: z.string().trim().min(1, "Mã nhà cung cấp không được để trống.").max(100),
  taxCode: optionalText(50, "Mã số thuế tối đa 50 ký tự."),
  phone: optionalText(20, "Số điện thoại tối đa 20 ký tự."),
  email: z.string().trim().email("Email không hợp lệ.").max(100, "Email tối đa 100 ký tự.").optional().or(z.literal("")),
  address: optionalText(500, "Địa chỉ tối đa 500 ký tự."),
  contactPerson: optionalText(100, "Người liên hệ tối đa 100 ký tự."),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;