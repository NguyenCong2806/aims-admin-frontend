import { z } from "zod";

/**
 * 2. Schema validation cho Thông số kỹ thuật Cloud Server / VPS / Máy chủ ảo
 * Tương ứng với DigitalCloudServerDto
 */
export const digitalCloudServerSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  digitalassetid: z.string().trim().optional().or(z.literal("")),
  clustername: z.string().trim().max(255, "Tên cụm không được vượt quá 255 ký tự.").optional().or(z.literal("")),
  purpose: z.string().trim().max(500, "Mục đích sử dụng không được vượt quá 500 ký tự.").optional().or(z.literal("")),
  vcpucount: z.number({ message: "Số lượng vCPU phải là số." }).int("vCPU phải là số nguyên.").min(0, "vCPU không được là số âm.").optional(),
  ramgb: z.number({ message: "Dung lượng RAM (GB) phải là số." }).min(0, "RAM không được là số âm.").optional(),
  storagespec: z.string().trim().max(255, "Thông số lưu trữ không được vượt quá 255 ký tự.").optional().or(z.literal("")),
  operatingsystem: z.string().trim().max(100, "Hệ điều hành không được vượt quá 100 ký tự.").optional().or(z.literal("")),
  ipprivate: z.string().trim().max(100, "Địa chỉ IP Private không được vượt quá 100 ký tự.").optional().or(z.literal("")),
  ippublic: z.string().trim().max(100, "Địa chỉ IP Public không được vượt quá 100 ký tự.").optional().or(z.literal("")),
  allocatedipcount: z.number({ message: "Số lượng IP cấp phát phải là số." }).int("Số lượng IP phải là số nguyên.").min(0, "Số lượng IP không được là số âm.").optional(),
  costpermonth: z.number({ message: "Chi phí hàng tháng phải là số." }).min(0, "Chi phí không được là số âm.").optional(),
});
export const digitalcloudserverSchema = digitalCloudServerSchema;

/**
 * 3. Schema validation cho Thông số kỹ thuật Tên miền & Chứng chỉ SSL/TLS
 * Tương ứng với DigitalDomainSslDto
 */
export const digitalDomainSslSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  digitalassetid: z.string().trim().optional().or(z.literal("")),
  recordtype: z.string().trim().max(50).optional().or(z.literal("")),
  domainname: z.string().trim().max(255, "Tên Domain không được vượt quá 255 ký tự.").optional().or(z.literal("")),
  programtag: z.string().trim().max(100, "Tag chương trình không được vượt quá 100 ký tự.").optional().or(z.literal("")),
  functionalscope: z.string().trim().max(255, "Phạm vi chức năng không được vượt quá 255 ký tự.").optional().or(z.literal("")),
  marketingtarget: z.string().trim().max(255, "Mục tiêu marketing không được vượt quá 255 ký tự.").optional().or(z.literal("")),
  ssltype: z.string().trim().max(100, "Loại SSL không được vượt quá 100 ký tự.").optional().or(z.literal("")),
  bounddomainlist: z.string().trim().max(1000, "Danh sách domain liên kết không được vượt quá 1000 ký tự.").optional().or(z.literal("")),
  autorenew: z.boolean().optional(),
});
export const digitaldomainsslSchema = digitalDomainSslSchema;

/**
 * 4. Schema validation cho Thông số kỹ thuật Đường truyền Internet (FTTH / Leased line / IP Tĩnh)
 * Tương ứng với DigitalInternetLineDto
 */
export const digitalInternetLineSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  digitalassetid: z.string().trim().optional().or(z.literal("")),
  linetype: z.string().trim().max(100, "Loại đường truyền không được vượt quá 100 ký tự.").optional().or(z.literal("")),
  domesticbandwidthmbps: z.number({ message: "Băng thông trong nước phải là số." }).min(0, "Băng thông không được là số âm.").optional(),
  internationalminbandwidthmbps: z.string().trim().max(100, "Băng thông quốc tế tối đa 100 ký tự.").optional().or(z.literal("")),
  monthlyfee: z.number({ message: "Cước phí hàng tháng phải là số." }).min(0, "Cước phí không được là số âm.").optional(),
  annualfee: z.number({ message: "Tổng cước phí hàng năm phải là số." }).min(0, "Tổng cước phí không được là số âm.").optional(),
  iptype: z.string().trim().max(50, "Loại IP không được vượt quá 50 ký tự.").optional().or(z.literal("")),
  staticipaddress: z.string().trim().max(255, "Địa chỉ IP tĩnh không được vượt quá 255 ký tự.").optional().or(z.literal("")),
});
export const digitalinternetlineSchema = digitalInternetLineSchema;

/**
 * 5. Schema validation cho Thông số kỹ thuật Tài khoản SaaS (ChatGPT, Zoom, Google Workspace,...)
 * Tương ứng với DigitalSaasAccountDto
 */
export const digitalSaasAccountSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  digitalassetid: z.string().trim().optional().or(z.literal("")),
  saasaccountname: z.string().trim().max(255).optional().or(z.literal("")),
  servicebrand: z.string().trim().max(100, "Thương hiệu SaaS không được vượt quá 100 ký tự.").optional().or(z.literal("")),
  plantier: z.string().trim().max(100, "Gói dịch vụ không được vượt quá 100 ký tự.").optional().or(z.literal("")),
  adminaccountemail: z.string().trim().max(255, "Email quản trị không được vượt quá 255 ký tự.").optional().or(z.literal("")),
  totallicensesbought: z.number({ message: "Số seat/license đã mua phải là số." }).int("Số seat phải là số nguyên.").min(0, "Số lượng không được là số âm.").optional(),
  storagequota: z.string().trim().max(100, "Hạn mức lưu trữ không được vượt quá 100 ký tự.").optional().or(z.literal("")),
});
export const digitalsaasaccountSchema = digitalSaasAccountSchema;

/**
 * 6. Schema validation cho Thông số kỹ thuật Bản quyền phần mềm (Software License)
 * Tương ứng với DigitalSoftwareLicenseDto
 */
export const digitalSoftwareLicenseSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  digitalassetid: z.string().trim().optional().or(z.literal("")),
  softwarename: z.string().trim().max(255, "Tên phần mềm không được vượt quá 255 ký tự.").optional().or(z.literal("")),
  licensekey: z.string().trim().max(500, "Key bản quyền không được vượt quá 500 ký tự.").optional().or(z.literal("")),
  boundhardwareserial: z.string().trim().max(100, "Serial phần cứng không được vượt quá 100 ký tự.").optional().or(z.literal("")),
  totalseats: z.number({ message: "Tổng số seat phải là số." }).int("Số lượng phải là số nguyên.").min(0, "Số lượng không được là số âm.").optional(),
  allocatedseats: z.number({ message: "Số seat đã cấp phát phải là số." }).int("Số lượng phải là số nguyên.").min(0, "Số lượng không được là số âm.").optional(),
  isperpetual: z.boolean().optional(),
});
export const digitalsoftwarelicenseSchema = digitalSoftwareLicenseSchema;

/**
 * 7. Schema validation cho Phân bổ tài khoản SaaS (SaaS Allocation)
 * Tương ứng với DigitalSaasAllocationDto
 */
export const digitalSaasAllocationSchema = z.object({
  id: z.string().trim().optional().or(z.literal("")),
  digitalassetid: z.string().trim().optional().or(z.literal("")),
  assignedemail: z.string().trim().max(255, "Email người được cấp không được vượt quá 255 ký tự.").optional().or(z.literal("")),
  assignedemployeename: z.string().trim().max(255, "Tên nhân viên không được vượt quá 255 ký tự.").optional().or(z.literal("")),
  departmentid: z.number({ message: "Phòng ban phải là số." }).int("Phòng ban phải là số nguyên.").optional().nullable(),
  allocateddate: z.date({ message: "Ngày cấp phát không hợp lệ." }).optional().nullable(),
  notes: z.string().trim().max(1000, "Ghi chú không được vượt quá 1000 ký tự.").optional().or(z.literal("")),
});
export const digitalsaasallocationSchema = digitalSaasAllocationSchema;

/**
 * 1. Schema validation cho thông tin chung Tài sản số (Digital Asset)
 * Tương ứng với DigitalAssetDto
 */
export const digitalassetSchema = z
  .object({
    id: z.string().trim().optional().or(z.literal("")),

    assetcode: z
      .string({ message: "Mã tài sản không được để trống." })
      .trim()
      .min(1, "Mã tài sản không được để trống.")
      .max(100, "Mã tài sản không được vượt quá 100 ký tự."),

    assetsubtype: z
      .string({ message: "Phân loại tài sản số không được để trống." })
      .trim()
      .min(1, "Phân loại tài sản số không được để trống.")
      .max(100, "Phân loại tài sản số tối đa 100 ký tự."),

    name: z
      .string({ message: "Tên tài sản không được để trống." })
      .trim()
      .min(1, "Tên tài sản không được để trống.")
      .max(255, "Tên tài sản không được vượt quá 255 ký tự."),

    contractnumber: z
      .string()
      .trim()
      .max(100, "Số hợp đồng không được vượt quá 100 ký tự.")
      .optional()
      .or(z.literal("")),

    categoryid: z
      .number({ message: "Vui lòng chọn danh mục tài sản số." })
      .int("Danh mục tài sản số phải là số nguyên.")
      .min(1, "Vui lòng chọn danh mục tài sản số."),

    statusid: z
      .number({ message: "Vui lòng chọn trạng thái tài sản số." })
      .int("Trạng thái phải là số nguyên.")
      .min(1, "Vui lòng chọn trạng thái tài sản số."),

    supplierid: z
      .number({ message: "Nhà cung cấp phải là số." })
      .int("Nhà cung cấp phải là số nguyên.")
      .optional()
      .nullable(),

    departmentid: z
      .number({ message: "Phòng ban phải là số." })
      .int("Phòng ban phải là số nguyên.")
      .optional()
      .nullable(),

    costamount: z
      .number({ message: "Chi phí / Giá mua phải là số hợp lệ." })
      .min(0, "Chi phí phải lớn hơn hoặc bằng 0."),

    currency: z
      .string()
      .trim()
      .max(20, "Loại tiền tệ tối đa 20 ký tự.")
      .optional()
      .or(z.literal("")),

    billingcycle: z
      .string()
      .trim()
      .max(50, "Chu kỳ thanh toán tối đa 50 ký tự.")
      .optional()
      .or(z.literal("")),

    startdate: z.date({
      message: "Vui lòng chọn ngày mua / bắt đầu hợp lệ.",
    }),

    expirydate: z.date({
      message: "Vui lòng chọn ngày hết hạn hợp lệ.",
    }),

    renewalalertdate: z.date({
      message: "Ngày cảnh báo gia hạn không hợp lệ.",
    }).optional().nullable(),

    description: z
      .string()
      .trim()
      .max(2000, "Mô tả không được vượt quá 2000 ký tự.")
      .optional()
      .or(z.literal("")),

    suppliername: z.string().trim().optional().or(z.literal("")),
    createdat: z.date().optional(),
    updatedat: z.date().optional(),

    // Nhóm chi tiết con tùy chọn (phục vụ form giao diện phẳng)
    domaindetail: digitalDomainSslSchema.optional().nullable(),
    internetlinedetail: digitalInternetLineSchema.optional().nullable(),
    softwarelicensedetail: digitalSoftwareLicenseSchema.optional().nullable(),
    saasdetail: digitalSaasAccountSchema.optional().nullable(),
    cloudserverdetail: digitalCloudServerSchema.optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.startdate && data.expirydate) {
      const sTime = data.startdate.getTime();
      const eTime = data.expirydate.getTime();
      if (!isNaN(sTime) && !isNaN(eTime) && eTime <= sTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ngày hết hạn phải sau ngày bắt đầu / ngày mua.",
          path: ["expirydate"],
        });
      }
    }
  });

/**
 * 8. Composite Schema gộp thông tin chung và toàn bộ thông số kỹ thuật con
 * Tương ứng với DigitalAssetObject để submit lên API tạo mới / cập nhật
 */
export const digitalAssetObjectSchema = z.object({
  digitalAssetDto: digitalassetSchema,
  digitalCloudServerDto: digitalCloudServerSchema.optional().nullable(),
  digitalDomainSslDto: digitalDomainSslSchema.optional().nullable(),
  digitalInternetLineDto: digitalInternetLineSchema.optional().nullable(),
  digitalSaasAccountDto: digitalSaasAccountSchema.optional().nullable(),
  digitalSoftwareLicenseDto: digitalSoftwareLicenseSchema.optional().nullable(),
  digitalSaasAllocationDto: digitalSaasAllocationSchema.optional().nullable(),
});
export const digitalassetObjectSchema = digitalAssetObjectSchema;

// Export các kiểu dữ liệu suy diễn (Inferred Types)
export type DigitalassetInput = z.input<typeof digitalassetSchema>;
export type DigitalassetFormData = z.infer<typeof digitalassetSchema>;
export type DigitalAssetFormData = DigitalassetFormData;

export type DigitalCloudServerFormData = z.infer<typeof digitalCloudServerSchema>;
export type DigitalDomainSslFormData = z.infer<typeof digitalDomainSslSchema>;
export type DigitalDomainSSLFormData = DigitalDomainSslFormData;

export type DigitalInternetLineFormData = z.infer<typeof digitalInternetLineSchema>;
export type DigitalSaasAccountFormData = z.infer<typeof digitalSaasAccountSchema>;
export type DigitalSaaSAccountFormData = DigitalSaasAccountFormData;

export type DigitalSoftwareLicenseFormData = z.infer<typeof digitalSoftwareLicenseSchema>;
export type DigitalSaasAllocationFormData = z.infer<typeof digitalSaasAllocationSchema>;

export type DigitalAssetObjectInput = z.input<typeof digitalAssetObjectSchema>;
export type DigitalAssetObjectFormData = z.infer<typeof digitalAssetObjectSchema>;
