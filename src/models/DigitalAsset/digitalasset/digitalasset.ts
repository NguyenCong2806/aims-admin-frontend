// Định nghĩa enum cho loại tài sản số để tránh gõ sai chính tả
export type DigitalAssetSubType = 
  | 'DOMAIN' 
  | 'SSL' 
  | 'CLOUD_SERVER' 
  | 'SOFTWARE_LICENSE' 
  | 'SAAS_SUBSCRIPTION' 
  | 'INTERNET_LINE';

// Interface dữ liệu đầy đủ trả về từ Backend (GET)
export interface DigitalAsset {
  id: number;
  assetCode: string;
  name: string;
  assetSubType: DigitalAssetSubType | string;
  contractNumber?: string | null;

  // Foreign Key IDs
  categoryId?: number | null;
  statusId?: number | null;
  supplierId?: number | null;
  departmentId?: number | null;

  // Tên hiển thị từ các bảng quan hệ (nếu backend có Include / Map DTO)
  categoryName?: string | null;
  statusName?: string | null;
  supplierName?: string | null;
  departmentName?: string | null;

  // Chi phí & Thanh toán
  costAmount?: number | null;
  currency?: string | null;       // 'VND', 'USD'...
  billingCycle?: string | null;   // 'Hàng tháng', 'Hàng năm', 'Vĩnh viễn'...

  // Thời gian & Cảnh báo (string định dạng ISO 8601 từ JSON API)
  startDate?: string | null;
  expiryDate?: string | null;
  renewalAlertDate?: string | null;

  // Ghi chú & Audit
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Payload khi tạo mới (POST)
export interface CreateDigitalAsset {
  assetCode: string;
  name: string;
  assetSubType: DigitalAssetSubType | string;
  contractNumber?: string | null;

  categoryId?: number | null;
  statusId?: number | null;
  supplierId?: number | null;
  departmentId?: number | null;

  costAmount?: number | null;
  currency?: string | null;
  billingCycle?: string | null;

  startDate?: string | null;
  expiryDate?: string | null;
  renewalAlertDate?: string | null;
  description?: string | null;
}

// Payload khi cập nhật (PUT / PATCH)
export interface UpdateDigitalAsset extends Partial<CreateDigitalAsset> {
  id: number;
}