// Interface phản chiếu thực thể C# HardwareAsset (Thiết bị phần cứng)

export interface HardwareAsset {
  id: string; // Guid
  assetCode: string; // Mã tài sản quản lý nội bộ (VD: HW-CAM-001, HW-PC-012)
  name: string; // Tên thiết bị
  model?: string | null; // Mã Model
  serialNumber?: string | null; // Số Serial / Service Tag
  barcode?: string | null; // Mã vạch / QR Code quản lý kho

  // Foreign Keys & Relations
  categoryId?: number | null;
  categoryName?: string | null;

  statusId?: number | null;
  statusName?: string | null;

  brandId?: number | null;
  brandName?: string | null;

  supplierId?: number | null;
  supplierName?: string | null;

  locationId?: number | null;
  locationName?: string | null;

  departmentId?: number | null;
  departmentName?: string | null;

  // Financial & Warranty
  purchasePrice?: number | null; // Giá vốn (VND)
  purchaseDate?: string | null; // Ngày mua
  effectiveDate?: string | null; // Ngày hiệu lực
  warrantyMonths?: number | null; // Thời gian bảo hành (tháng)

  // Description & Audit
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}
