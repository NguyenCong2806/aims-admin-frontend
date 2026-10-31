import { z } from "zod";

/**
 * 1. Schema validation cho thông tin chung Thiết bị phần cứng (Hardware Asset)
 * Tương ứng với hardwareassetdto
 */
export const hardwareassetSchema = z
  .object({
    id: z.string().trim().optional().or(z.literal("")),

    assetcode: z
      .string({ message: "Mã tài sản không được để trống." })
      .trim()
      .min(1, "Mã tài sản không được để trống.")
      .max(100, "Mã tài sản không được vượt quá 100 ký tự."),

    assetsubtype: z
      .string({ message: "Phân loại thiết bị không được để trống." })
      .trim()
      .min(1, "Phân loại thiết bị không được để trống.")
      .max(100, "Phân loại thiết bị tối đa 100 ký tự."),

    name: z
      .string({ message: "Tên thiết bị không được để trống." })
      .trim()
      .min(1, "Tên thiết bị không được để trống.")
      .max(255, "Tên thiết bị không được vượt quá 255 ký tự."),

    model: z
      .string()
      .trim()
      .max(255, "Model không được vượt quá 255 ký tự.")
      .optional()
      .or(z.literal(""))
      .default(""),

    serialnumber: z
      .string()
      .trim()
      .max(100, "Số serial không được vượt quá 100 ký tự.")
      .optional()
      .or(z.literal(""))
      .default(""),

    barcode: z
      .string()
      .trim()
      .max(100, "Mã vạch barcode không được vượt quá 100 ký tự.")
      .optional()
      .or(z.literal(""))
      .default(""),

    categoryid: z
      .coerce.string({ message: "Vui lòng chọn danh mục thiết bị." })
      .trim()
      .min(1, "Vui lòng chọn danh mục thiết bị."),

    statusid: z
      .coerce.string({ message: "Vui lòng chọn trạng thái thiết bị." })
      .trim()
      .min(1, "Vui lòng chọn trạng thái thiết bị."),

    brandid: z
      .coerce.string()
      .trim()
      .optional()
      .or(z.literal(""))
      .default(""),

    supplierid: z
      .coerce.string()
      .trim()
      .optional()
      .or(z.literal(""))
      .default(""),

    locationid: z
      .coerce.string()
      .trim()
      .optional()
      .or(z.literal(""))
      .default(""),

    departmentid: z
      .coerce.string()
      .trim()
      .optional()
      .or(z.literal(""))
      .default(""),

    purchaseprice: z
      .coerce.string()
      .trim()
      .refine(
        (val) => {
          if (!val || val === "0") return true;
          const clean = val.replace(/,/g, "");
          const num = Number(clean);
          return !isNaN(num) && num >= 0;
        },
        { message: "Giá mua phải là số hợp lệ lớn hơn hoặc bằng 0." }
      )
      .default("0"),

    purchasedate: z.coerce.date({
      message: "Vui lòng chọn ngày mua thiết bị hợp lệ.",
    }),

    effectivedate: z.coerce.date({
      message: "Vui lòng chọn ngày hiệu lực / đưa vào sử dụng hợp lệ.",
    }),

    warrantymonths: z.coerce
      .number({ message: "Thời gian bảo hành phải là số." })
      .int("Thời gian bảo hành phải là số nguyên (tháng).")
      .min(0, "Thời gian bảo hành không được là số âm.")
      .default(0),

    description: z
      .string()
      .trim()
      .max(2000, "Mô tả không được vượt quá 2000 ký tự.")
      .optional()
      .or(z.literal(""))
      .default(""),

    createdate: z.coerce.date().optional(),

    updatedate: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.purchasedate && data.effectivedate) {
      const pTime = data.purchasedate.getTime();
      const eTime = data.effectivedate.getTime();
      if (!isNaN(pTime) && !isNaN(eTime) && eTime < pTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ngày đưa vào sử dụng / hiệu lực không được trước ngày mua.",
          path: ["effectivedate"],
        });
      }
    }
  });

/**
 * 2. Schema validation cho Thông số kỹ thuật NAS Storage
 * Tương ứng với assetSpecnasstoragedto
 */
export const assetSpecNasStorageSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  hardwareassetid: z.string().trim().optional().or(z.literal("")),
  devicetype: z.string().trim().max(100).optional().or(z.literal("")).default("NAS_STORAGE"),
  cpuprocessor: z.string().trim().max(255).optional().or(z.literal("")).default(""),
  installedramgb: z.coerce.number({ message: "RAM đã lắp đặt phải là số." }).min(0, "RAM không được là số âm.").default(0),
  maxramsupportedgb: z.coerce.number({ message: "RAM tối đa hỗ trợ phải là số." }).min(0, "RAM tối đa không được là số âm.").default(0),
  drivebayscount: z.coerce.number({ message: "Số khay ổ đĩa phải là số." }).int("Số khay ổ đĩa phải là số nguyên.").min(0, "Số khay không được là số âm.").default(0),
  installedcapacitytb: z.coerce.number({ message: "Dung lượng đã lắp (TB) phải là số." }).min(0, "Dung lượng không được là số âm.").default(0),
  maxsinglevolumetb: z.coerce.number({ message: "Dung lượng volume tối đa (TB) phải là số." }).min(0, "Dung lượng không được là số âm.").default(0),
  cacheslots: z.string().trim().max(255).optional().or(z.literal("")).default(""),
  powerratingva: z.coerce.number({ message: "Công suất nguồn (VA) phải là số." }).min(0, "Công suất không được là số âm.").default(0),
});

/**
 * 3. Schema validation cho Thông số kỹ thuật Màn hình / Máy chiếu (Display / Projector)
 * Tương ứng với assetspecdisplayprojectordto
 */
export const assetSpecDisplayProjectorSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  hardwareassetid: z.string().trim().optional().or(z.literal("")),
  devicetype: z.string().trim().max(100).optional().or(z.literal("")).default("DISPLAY_PROJECTOR"),
  displaytype: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  screensizeinches: z.coerce.number({ message: "Kích thước màn hình (inch) phải là số." }).min(0, "Kích thước không được là số âm.").default(0),
  resolution: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  refreshratehz: z.coerce.number({ message: "Tần số quét (Hz) phải là số." }).min(0, "Tần số quét không được là số âm.").default(0),
  operatingsystem: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  brightnessansilumens: z.coerce.number({ message: "Độ sáng (ANSI Lumens) phải là số." }).min(0, "Độ sáng không được là số âm.").default(0),
  contrastratio: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  lampLifehours: z.coerce.number({ message: "Tuổi thọ bóng đèn (giờ) phải là số." }).min(0, "Tuổi thọ bóng đèn không được là số âm.").default(0),
  supportedports: z.string().trim().max(500).optional().or(z.literal("")).default(""),
});

/**
 * 4. Schema validation cho Thông số kỹ thuật Thiết bị mạng (Network Device: Switch, Router, Firewall, AP)
 * Tương ứng với assetspecnetworkdevicedto
 */
export const assetSpecNetworkDeviceSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  hardwareassetid: z.string().trim().optional().or(z.literal("")),
  devicetype: z.string().trim().max(100).optional().or(z.literal("")).default("NETWORK_DEVICE"),
  firewallthroughput: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  ipsthroughput: z.coerce.string().trim().max(100).optional().or(z.literal("")).default(""),
  vpnthroughput: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  concurrentsessions: z.coerce.number({ message: "Số phiên đồng thời phải là số." }).min(0, "Số phiên không được là số âm.").default(0),
  portcount: z.coerce.number({ message: "Số lượng cổng phải là số." }).int("Số lượng cổng phải là số nguyên.").min(0, "Số cổng không được là số âm.").default(0),
  portspeed: z.coerce.string().trim().max(100).optional().or(z.literal("")).default(""),
  uplinkports: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  antennaspec: z.coerce.string().trim().max(100).optional().or(z.literal("")).default(""),
  concurrentuserslimit: z.coerce.string().trim().max(100).optional().or(z.literal("")).default(""),
  maxvlans: z.coerce.number({ message: "Số VLAN tối đa phải là số." }).int("Số VLAN phải là số nguyên.").min(0, "Số VLAN không được là số âm.").default(0),
  ispoesupported: z.coerce.boolean().default(false),
  powerconsumptionw: z.coerce.number({ message: "Công suất tiêu thụ (W) phải là số." }).min(0, "Công suất không được là số âm.").default(0),
});

/**
 * 5. Schema validation cho Thông số kỹ thuật Camera & Đầu ghi (Camera / NVR)
 * Tương ứng với assetspeccameranvrdto
 */
export const assetSpecCameraNvrSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  hardwareassetid: z.string().trim().optional().or(z.literal("")),
  devicetype: z.string().trim().max(100).optional().or(z.literal("")).default("CAMERA_NVR"),
  resolution: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  sensorsize: z.coerce.string().trim().max(100).optional().or(z.literal("")).default(""),
  lenssize: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  irdistancemeters: z.coerce.number({ message: "Khoảng cách hồng ngoại (m) phải là số." }).min(0, "Khoảng cách không được là số âm.").default(0),
  compressionstandard: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  hastwowayaudio: z.coerce.boolean().default(false),
  haswdr: z.coerce.boolean().default(false),
  channelcount: z.coerce.number({ message: "Số kênh đầu ghi phải là số." }).int("Số kênh phải là số nguyên.").min(0, "Số kênh không được là số âm.").default(0),
  maxstoragetb: z.coerce.number({ message: "Dung lượng lưu trữ tối đa (TB) phải là số." }).min(0, "Dung lượng không được là số âm.").default(0),
  inputbandwidthmbps: z.coerce.number({ message: "Băng thông đầu vào (Mbps) phải là số." }).min(0, "Băng thông không được là số âm.").default(0),
  outputbandwidthmbps: z.coerce.number({ message: "Băng thông đầu ra (Mbps) phải là số." }).min(0, "Băng thông không được là số âm.").default(0),
});

/**
 * 6. Schema validation cho Thông số kỹ thuật Máy in / Photocopy / Máy hủy tài liệu
 * Tương ứng với assetspecprintercopierdto
 */
export const assetSpecPrinterCopierSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  hardwareassetid: z.string().trim().optional().or(z.literal("")),
  devicetype: z.string().trim().max(100).optional().or(z.literal("")).default("PRINTER_COPIER"),
  ipsetup: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  maxpapersize: z.string().trim().max(50).optional().or(z.literal("")).default("A4"),
  printspeedppm: z.coerce.number({ message: "Tốc độ in phải là số." }).int("Tốc độ in phải là số nguyên.").min(0, "Tốc độ in không được là số âm.").default(0),
  printresolution: z.coerce.string().trim().max(100).optional().or(z.literal("")).default(""),
  inkcartridgetype: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  drumlifepages: z.coerce.number({ message: "Tuổi thọ Drum (trang) phải là số." }).int("Tuổi thọ Drum phải là số nguyên.").min(0, "Tuổi thọ không được là số âm.").default(0),
  lastinkrefilldate: z.coerce.date({ message: "Ngày nạp mực không hợp lệ." }).optional().nullable(),
  lastcleaningdate: z.coerce.date({ message: "Ngày vệ sinh/bảo dưỡng không hợp lệ." }).optional().nullable(),
  shredstyle: z.string().trim().max(100).optional().or(z.literal("")).default(""),
  shredcapacitysheets: z.coerce.number({ message: "Công suất hủy (tờ) phải là số." }).int("Công suất hủy phải là số nguyên.").min(0, "Công suất không được là số âm.").default(0),
  bincapacityliters: z.coerce.number({ message: "Dung tích thùng chứa (lít) phải là số." }).min(0, "Dung tích không được là số âm.").default(0),
});

/**
 * 7. Composite Schema gộp thông tin chung và toàn bộ thông số kỹ thuật con
 * Tương ứng với hardwareassetobject để submit lên API tạo mới / cập nhật
 */
export const hardwareassetObjectSchema = z.object({
  hardwareassetdto: hardwareassetSchema,
  assetSpecnasstoragedto: assetSpecNasStorageSchema.optional().nullable(),
  assetspecdisplayprojectordto: assetSpecDisplayProjectorSchema.optional().nullable(),
  assetspecnetworkdevicedto: assetSpecNetworkDeviceSchema.optional().nullable(),
  assetspeccameranvrdto: assetSpecCameraNvrSchema.optional().nullable(),
  assetspecprintercopierdto: assetSpecPrinterCopierSchema.optional().nullable(),
});

// Export các kiểu dữ liệu suy diễn (Inferred Types)
export type HardwareassetInput = z.input<typeof hardwareassetSchema>;
export type HardwareassetFormData = z.infer<typeof hardwareassetSchema>;

export type AssetSpecNasStorageFormData = z.infer<typeof assetSpecNasStorageSchema>;
export type AssetSpecDisplayProjectorFormData = z.infer<typeof assetSpecDisplayProjectorSchema>;
export type AssetSpecNetworkDeviceFormData = z.infer<typeof assetSpecNetworkDeviceSchema>;
export type AssetSpecCameraNvrFormData = z.infer<typeof assetSpecCameraNvrSchema>;
export type AssetSpecPrinterCopierFormData = z.infer<typeof assetSpecPrinterCopierSchema>;

export type HardwareassetObjectInput = z.input<typeof hardwareassetObjectSchema>;
export type HardwareassetObjectFormData = z.infer<typeof hardwareassetObjectSchema>;
