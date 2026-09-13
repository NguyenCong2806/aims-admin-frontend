import { z } from "zod";

export const digitalassetSchema = z
  .object({
    assetcode: z
      .string({ message: "Mã tài sản không được để trống." })
      .trim()
      .min(1, "Mã tài sản không được để trống.")
      .max(255, "Mã tài sản không được vượt quá 255 ký tự."),
    name: z
      .string({ message: "Tên tài sản không được để trống." })
      .trim()
      .min(1, "Tên tài sản không được để trống.")
      .max(256, "Tên tài sản không được vượt quá 256 ký tự."),
    assetsubtype: z
      .string({ message: "Loại tài sản số không được để trống." })
      .trim()
      .min(1, "Loại tài sản số không được để trống."),
    categoryid: z
      .number({ message: "Danh mục tài sản số không được để trống." })
      .int()
      .min(1, "Danh mục tài sản số không được để trống."),
    statusid: z
      .number({ message: "Trạng thái không được để trống." })
      .int()
      .min(1, "Trạng thái không được để trống."),
    contractnumber: z.string().optional().or(z.literal("")),
    supplierid: z
      .number({ message: "Nhà cung cấp không được để trống." })
      .int()
      .min(1, "Nhà cung cấp không được để trống."),
    departmentid: z
      .number({ message: "Phòng ban không được để trống." })
      .int()
      .min(1, "Phòng ban không được để trống."),
    costamount: z
      .number({ message: "Giá mua không hợp lệ." })
      .min(0, "Giá mua phải lớn hơn hoặc bằng 0."),
    currency: z.string().min(1, "Loại tiền tệ không được để trống."),
    billingcycle: z.string().min(1, "Chu kỳ thanh toán không được để trống."),
    description: z.string().optional().or(z.literal("")),
    // Dùng z.date() thay cho z.coerce.date()
    startdate: z.date({ message: "Vui lòng chọn ngày mua / bắt đầu." }),
    expirydate: z.date({ message: "Vui lòng chọn ngày hết hạn." }),
  })
  .superRefine((data, ctx) => {
    if (data.startdate && data.expirydate) {
      if (data.expirydate.getTime() <= data.startdate.getTime()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ngày hết hạn phải sau ngày mua / bắt đầu.",
          path: ["expirydate"],
        });
      }
    }
  });

export type DigitalAssetFormData = z.infer<typeof digitalassetSchema>;