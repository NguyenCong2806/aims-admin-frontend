import { z } from "zod";

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal("")).nullable();

const safeNullableNumber = () =>
  z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    });

export const contractAddendumSchema = z.object({
  // [Required, MaxLength(100)]
  addendumNumber: z
    .string()
    .trim()
    .min(1, "Số hiệu phụ lục (AddendumNumber) không được để trống.")
    .max(100, "Số hiệu phụ lục tối đa 100 ký tự."),

  // [Required, MaxLength(250)]
  title: z
    .string()
    .trim()
    .min(1, "Tiêu đề phụ lục (Title) không được để trống.")
    .max(250, "Tiêu đề phụ lục tối đa 250 ký tự."),

  // [MaxLength(50)] default "RENEWAL"
  addendumType: z
    .string()
    .trim()
    .max(50, "Loại phụ lục tối đa 50 ký tự.")
    .default("RENEWAL"),

  // DateTime [Required]
  startDate: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn ngày bắt đầu hiệu lực (StartDate)."),

  // DateTime [Required]
  endDate: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn ngày kết thúc hiệu lực (EndDate)."),

  // DateTime? (Cảnh báo gia hạn tiếp theo)
  renewalAlertDate: optionalText(50, "Ngày cảnh báo gia hạn không hợp lệ."),

  // Chu kỳ thanh toán (số tháng)
  cyclePeriodMonths: safeNullableNumber(),

  // Đơn giá mỗi tháng
  unitPricePerMonth: safeNullableNumber(),

  // Tổng tiền chu kỳ
  totalPeriodAmount: safeNullableNumber(),

  // Đường dẫn file văn bản phụ lục (DocumentFileUrl)
  documentFileUrl: optionalText(500, "Đường dẫn file tài liệu tối đa 500 ký tự."),

  // Trạng thái (Status)
  status: z
    .string()
    .trim()
    .max(50, "Trạng thái tối đa 50 ký tự.")
    .default("ACTIVE"),

  // Ghi chú (Notes)
  notes: optionalText(2000, "Ghi chú tối đa 2000 ký tự."),
});

export type ContractAddendumInput = z.input<typeof contractAddendumSchema>;
export type ContractAddendumFormData = z.output<typeof contractAddendumSchema>;
