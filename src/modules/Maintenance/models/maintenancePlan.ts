// Model dữ liệu Kế hoạch & Lịch bảo trì tài sản (Maintenance Schedule & Plan)

export type MaintenanceType =
  | "PREVENTIVE"   // Bảo trì định kỳ / Phòng ngừa
  | "CORRECTIVE"   // Sửa chữa khắc phục sự cố
  | "UPGRADE"      // Nâng cấp phần cứng / phần mềm
  | "WARRANTY"     // Bảo hành chính hãng (RMA / Vendor)
  | "INSPECTION";   // Kiểm định kỹ thuật & Kiểm kê

export type MaintenanceStatus =
  | "SCHEDULED"    // Đã lên lịch / Chờ thực hiện
  | "IN_PROGRESS"  // Đang tiến hành
  | "COMPLETED"    // Đã hoàn thành
  | "OVERDUE"      // Quá hạn
  | "CANCELLED";   // Đã hủy / Hoãn

export type MaintenancePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface MaintenanceChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface MaintenanceTask {
  id: string; // Unique ID (Guid)
  planCode: string; // VD: MNT-2024-001
  title: string; // Tiêu đề công việc
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;

  // Thiết bị / Tài sản liên quan
  assetId?: string | null;
  assetCode?: string | null; // VD: HW-PC-0021, HW-SRV-0001
  assetName?: string | null;
  assetCategory?: string | null;
  locationName?: string | null;
  departmentName?: string | null;

  // Thời gian thực hiện
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string | null; // HH:mm
  endTime?: string | null; // HH:mm
  estimatedDurationHours?: number;

  // Nhân sự & Chi phí
  assignedTo?: string | null; // Kỹ thuật viên / Người phụ trách
  vendorName?: string | null; // Đơn vị thực hiện (Nội bộ / Bên thứ 3 / Hãng)
  estimatedCost?: number | null; // Chi phí dự toán (VNĐ)
  actualCost?: number | null; // Chi phí thực tế (VNĐ)

  // Chi tiết công việc
  description?: string | null;
  checklist?: MaintenanceChecklistItem[];
  notes?: string | null;
  completionReport?: string | null; // Biên bản nghiệm thu / Kết quả

  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceFilter {
  keyword?: string;
  type?: string;
  status?: string;
  priority?: string;
  location?: string;
  month?: number; // 0 - 11
  year?: number;
}
