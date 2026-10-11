// Interface thực thể Hợp đồng & Bảo hành (Contracts) khớp chuẩn C# Entity [Table("contracts")]
import { FileUploadResult } from "../base/FileUploadResult";

export type ContractStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "DRAFT" | "TERMINATED";

export interface ContractAddendum {
  id?: number;
  contractId?: number;
  addendumNumber?: string;
  title?: string;
  signDate?: string;
  documentFileUrl?: string | null;
  notes?: string | null;
}

/**
 * Thực thể Hợp đồng từ Database Backend (Contract.cs)
 */
export interface contract {
  id: number;
  contractNumber: string; // [Required, MaxLength(100)]
  title: string; // [Required, MaxLength(250)]
  contractType: string; // [MaxLength(50)] default "SERVICE_MAINTENANCE"
  
  // Quan hệ Đối tác / Nhà cung cấp
  supplierId?: number | null;
  supplier?: {
    id: number;
    name?: string;
    code?: string;
    email?: string;
    phone?: string;
    taxCode?: string;
  } | null;

  // Thời hạn & Hiệu lực
  signedDate?: string | null; // DateTime?
  effectiveDate: string; // DateTime [Required]
  expiryDate: string; // DateTime [Required]

  // Tài chính & Tiền tệ
  totalValue: number; // decimal(18,2)
  currency: string; // [MaxLength(10)] default "VND"

  // Điều khoản thanh toán & File tài liệu
  paymentTerms?: string | null; // [MaxLength(250)]
  documentFileUrl?: string | null; // [MaxLength(500)]
  
  // Trạng thái & Ghi chú
  status: ContractStatus | string; // [MaxLength(50)] default "ACTIVE"
  notes?: string | null;

  // Metadata hệ thống
  createdAt?: string; // DateTime
  updatedAt?: string | null; // DateTime?

  // Navigation property
  addendums?: ContractAddendum[];

  // ============================================================
  // Các trường bí danh tương thích giao diện cũ (Compatibility Aliases)
  // ============================================================
  contractCode?: string; // bí danh cho contractNumber
  startDate?: string; // bí danh cho effectiveDate
  endDate?: string; // bí danh cho expiryDate
  fileUrl?: string | null; // bí danh cho documentFileUrl
  supplierName?: string | null; // bí danh cho supplier?.name
  fileName?: string | null;
  fileSize?: number | null;
  warrantyMonths?: number | null;
  warrantyEndDate?: string | null;
  slaTerms?: string | null;
  attachments?: (FileUploadResult)[];
}

/**
 * Dữ liệu JSON gửi lên Backend khi Thêm mới Hợp đồng (POST /contracts)
 */
export interface createcontract {
  id?: number;
  contractNumber: string; // [Required, MaxLength(100)]
  title: string; // [Required, MaxLength(250)]
  contractType: string; // [MaxLength(50)] default "SERVICE_MAINTENANCE"
  supplierId?: number | null;
  signedDate?: string | null; // DateTime?
  effectiveDate: string; // DateTime
  expiryDate: string; // DateTime
  totalValue: number; // decimal(18,2)
  currency?: string; // [MaxLength(10)] default "VND"
  paymentTerms?: string | null; // [MaxLength(250)]
  documentFileUrl?: string | null; // [MaxLength(500)]
  status?: string; // [MaxLength(50)] default "ACTIVE"
  notes?: string | null;

  // Tương thích nếu code cũ còn gửi
  contractCode?: string;
  startDate?: string;
  endDate?: string;
  fileUrl?: string | null;
}

/**
 * Dữ liệu JSON gửi lên Backend khi Cập nhật Hợp đồng (PUT /contracts/{id})
 */
export interface updatecontract extends Partial<createcontract> {
  id: number;
}
