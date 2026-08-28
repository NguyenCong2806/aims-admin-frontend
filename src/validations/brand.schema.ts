import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên hãng sản xuất không được để trống.")
    .max(255, "Tên hãng sản xuất tối đa 255 ký tự."),

  code: z
    .string()
    .trim()
    .min(1, "Mã hãng không được để trống.")
    .max(100, "Mã hãng tối đa 100 ký tự."),
});

export type BrandFormData = z.infer<typeof brandSchema>;