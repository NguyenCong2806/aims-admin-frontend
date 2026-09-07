import { z } from "zod";

export const assetstatusSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Tên trạng thái không được để trống.")
        .max(255, "Tên trạng thái tối đa 255 ký tự."),

    code: z
        .string()
        .trim()
        .min(1, "Mã trạng thái không được để trống.")
        .max(100, "Mã trạng thái tối đa 100 ký tự."),
    colorCode: z
        .string()
        .trim()
        .min(1, "Mã màu không được để trống.")
        .max(100, "Mã màu tối đa 100 ký tự."),
    allowAllocation: z
        .boolean()
        .default(false)
        .optional(),
});

export type AssetStatusFormData = z.infer<typeof assetstatusSchema>;