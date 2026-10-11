import { z } from "zod";

export const digitaldomainsslSchema = z.object({
  recordtype: z.string().trim().max(255).optional(),
  domainname: z.string().trim().min(1, "Tên miền không được để trống.").max(256, "Tên miền không được vượt quá 256 ký tự."),
  programtag: z.string().trim().max(255).optional(),
  functionalscope: z.string().trim().max(255).optional(),
  marketingtarget: z.string().trim().max(255).optional(),
  ssltype: z.string().trim().max(255).optional(),
  bounddomainlist: z.string().trim().max(2000, "Danh sách miền đã liên kết không được vượt quá 2000 ký tự.").optional(),
  autorenew: z.boolean().optional(),
});

export type DigitalDomainSSLFormData = z.infer<typeof digitaldomainsslSchema>;