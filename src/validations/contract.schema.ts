import { z } from "zod";

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

export const contractSchema = z.object({
  // [Required, MaxLength(100)]
  contractNumber: z
    .string()
    .trim()
    .min(1, "Số hiệu hợp đồng (ContractNumber) không được để trống.")
    .max(100, "Số hợp đồng tối đa 100 ký tự."),

  // [Required, MaxLength(250)]
  title: z
    .string()
    .trim()
    .min(1, "Tên/Tiêu đề hợp đồng không được để trống.")
    .max(250, "Tên hợp đồng tối đa 250 ký tự."),

  // [MaxLength(50)] default "SERVICE_MAINTENANCE"
  contractType: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn loại hợp đồng.")
    .max(50, "Loại hợp đồng tối đa 50 ký tự."),

  supplierId: z.number().nullable().optional(),

  // DateTime?
  signedDate: optionalText(50, "Ngày ký không hợp lệ."),

  // DateTime [Required]
  effectiveDate: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn ngày bắt đầu có hiệu lực (EffectiveDate)."),

  // DateTime [Required]
  expiryDate: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn ngày kết thúc / hết hạn (ExpiryDate)."),

  // decimal(18,2)
  totalValue: z
    .number()
    .min(0, "Giá trị hợp đồng không thể là số âm."),

  // [MaxLength(10)] default "VND"
  currency: z
    .string()
    .trim()
    .max(10, "Tiền tệ tối đa 10 ký tự.")
    .default("VND"),

  // [MaxLength(250)]
  paymentTerms: optionalText(250, "Điều khoản thanh toán tối đa 250 ký tự."),

  // [MaxLength(500)] URL trả về từ API upload file
  documentFileUrl: optionalText(500, "Đường dẫn file tài liệu tối đa 500 ký tự."),

  // [MaxLength(50)] default "ACTIVE"
  status: z
    .string()
    .max(50, "Trạng thái tối đa 50 ký tự.")
    .default("ACTIVE"),

  notes: optionalText(2000, "Ghi chú tối đa 2000 ký tự."),

  // Trường bí danh tương thích
  contractCode: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  fileUrl: z.string().optional(),
});

export type ContractFormData = z.infer<typeof contractSchema>;
