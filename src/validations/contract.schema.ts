import { z } from "zod";

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

export const contractSchema = z.object({
  contractCode: z
    .string()
    .trim()
    .min(1, "Số/Mã hợp đồng không được để trống.")
    .max(100, "Mã hợp đồng tối đa 100 ký tự."),
  title: z
    .string()
    .trim()
    .min(1, "Tên/Tiêu đề hợp đồng không được để trống.")
    .max(255, "Tên hợp đồng tối đa 255 ký tự."),
  contractType: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn loại hợp đồng."),
  supplierId: z.number().nullable().optional(),
  totalValue: z
    .number()
    .min(0, "Giá trị hợp đồng không thể là số âm."),
  currency: z.string().trim(),
  signedDate: optionalText(50, "Ngày ký hợp lệ."),
  startDate: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn ngày bắt đầu hiệu lực."),
  endDate: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn ngày kết thúc / nghiệm thu."),
  warrantyMonths: z.number().min(0).nullable().optional(),
  warrantyEndDate: optionalText(50, "Ngày bảo hành hợp lệ."),
  status: z.string(),
  paymentTerms: optionalText(500, "Điều khoản thanh toán tối đa 500 ký tự."),
  slaTerms: optionalText(500, "Cam kết SLA tối đa 500 ký tự."),
  notes: optionalText(1000, "Ghi chú tối đa 1000 ký tự."),
  fileUrl: optionalText(1000, "URL file tối đa 1000 ký tự."),
  fileName: optionalText(255, "Tên file tối đa 255 ký tự."),
  fileSize: z.number().nullable().optional(),
});

export type ContractFormData = z.infer<typeof contractSchema>;
