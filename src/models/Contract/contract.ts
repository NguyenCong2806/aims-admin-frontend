// Interface thực thể Hợp đồng & Bảo hành (Contracts & Warranties)
import { FileUploadResult } from "../base/FileUploadResult";

export type ContractStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "DRAFT" | "TERMINATED";

export type ContractType =
  | "IT_HARDWARE"
  | "SOFTWARE_LICENSE"
  | "MAINTENANCE_SLA"
  | "INTERNET_TELECOM"
  | "CLOUD_HOSTING"
  | "CONSULTING_OUTSOURCE"
  | "OTHER";

export interface ContractAttachment {
  id?: string | number;
  fileName: string;
  fileUrl: string;
  fileSizeBytes?: number;
  contentType?: string;
  uploadedAt?: string;
}

export interface contract {
  id: number;
  contractCode: string; // Số hiệu / Mã hợp đồng (VD: HD-2026-FPT-01)
  title: string; // Tên / Tiêu đề hợp đồng
  contractType: ContractType | string; // Loại hợp đồng
  
  // Quan hệ Đối tác / Nhà cung cấp
  supplierId?: number | null;
  supplierName?: string | null;

  // Tài chính & Tiền tệ
  totalValue: number; // Giá trị hợp đồng (VND)
  currency?: string; // Mặc định "VND"

  // Thời hạn & Hiệu lực
  signedDate?: string | null; // Ngày ký kết (YYYY-MM-DD)
  startDate: string; // Ngày bắt đầu có hiệu lực
  endDate: string; // Ngày kết thúc / hết hạn hợp đồng
  
  // Bảo hành & Cam kết SLA
  warrantyMonths?: number | null; // Thời hạn bảo hành tính theo tháng
  warrantyEndDate?: string | null; // Ngày kết thúc bảo hành
  slaTerms?: string | null; // Cam kết thời gian phản hồi & chất lượng SLA (VD: 24/7 4h Onsite)
  paymentTerms?: string | null; // Tiến độ / Điều khoản thanh toán

  // Trạng thái hợp đồng
  status: ContractStatus | string;

  // File đính kèm chính & Tài liệu hợp đồng
  fileUrl?: string | null; // Đường dẫn file hợp đồng chính
  fileName?: string | null; // Tên file tài liệu (VD: HopDong_FPT_Signed.pdf)
  fileSize?: number | null; // Kích thước file (bytes)
  attachments?: (ContractAttachment | FileUploadResult)[];

  // Ghi chú & Quản trị
  notes?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface createcontract {
  id?: number;
  contractCode: string;
  title: string;
  contractType: string;
  supplierId?: number | null;
  supplierName?: string | null;
  totalValue: number;
  currency?: string;
  signedDate?: string | null;
  startDate: string;
  endDate: string;
  warrantyMonths?: number | null;
  warrantyEndDate?: string | null;
  slaTerms?: string | null;
  paymentTerms?: string | null;
  status: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  notes?: string | null;
  departmentId?: number | null;
}

export interface updatecontract extends Partial<createcontract> {
  id: number;
}
