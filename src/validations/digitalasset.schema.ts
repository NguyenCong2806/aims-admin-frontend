import { z } from "zod";

export const digitalassetSchema = z.object({
  assetcode: z.string().trim().min(1, "Mã tài sản không được để trống.").max(255),
  name: z.string().trim().min(1, "Tên tài sản không được để trống.").max(256),
  assetsubtype: z.string().trim().min(1, "Tên loại tài sản số không được để trống.").max(256),
});

export type DigitalAssetFormData = z.infer<typeof digitalassetSchema>;