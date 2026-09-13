import { z } from "zod";

export const digitalinternetlineSchema = z.object({
  linetype: z.string().trim().max(255).optional(),
  domesticbandwidthmbps: z.number().optional(),
  internationalminbandwidthmbps: z.string().trim().max(255).optional(),
  monthlyfee: z.number().optional(),
  annualfee: z.number().optional(),
  iptype: z.string().trim().max(255).optional(),
  staticipaddress: z.string().trim().max(2000, "Địa chỉ và dải ip cấp cùng quá dài").optional(),
});

export type DigitalInternetLineFormData = z.infer<typeof digitalinternetlineSchema>;