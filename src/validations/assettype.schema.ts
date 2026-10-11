import { z } from "zod";

export const assettypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên loại tài sản không được để trống.")
    .max(255, "Tên loại tài sản  tối đa 255 ký tự."),

  code: z
    .string()
    .trim()
    .min(1, "Mã loại tài sản không được để trống.")
    .max(100, "Mã loại tài sản tối đa 100 ký tự."),
});

export type AssetTypeFormData = z.infer<typeof assettypeSchema>;