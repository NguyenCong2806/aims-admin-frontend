import { z } from "zod";

export const digitalsoftwarelicenseSchema = z.object({
    licensekey: z.string().trim().max(255).optional(),
    softwarename: z.string().trim().min(1,"Không được bỏ trống").max(255, "Tên phần mền vượt quá 255 ký tự").optional(),
    boundhardwareserial: z.string().trim().max(255).optional(),
    totalseats: z.number().min(0, "Số lượng user/key không được nhỏ hơn 0").optional(),
    allocatedseats: z.number().min(0, "Số lượng user/key không được nhỏ hơn 0").optional(),
    isperpetual: z.boolean().optional(),
});

export type DigitalSoftwareLicenseFormData = z.infer<typeof digitalsoftwarelicenseSchema>;