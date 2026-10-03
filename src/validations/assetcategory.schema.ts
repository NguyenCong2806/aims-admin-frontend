import { z } from "zod";

export const assetcategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên danh mục không được để trống.")
    .max(255, "Tên danh mục tối đa 255 ký tự."),

  code: z
    .string()
    .trim()
    .min(1, "Mã danh mục không được để trống.")
    .max(100, "Mã danh mục tối đa 100 ký tự."),
});

export type AssetCategoryFormData = z.infer<typeof assetcategorySchema>;