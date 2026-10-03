import {
  MaintenanceTask,
  MaintenanceFilter,
  MaintenanceStatus,
} from "../../models/Maintenance/maintenancePlan";
import { INITIAL_MAINTENANCE_TASKS } from "./maintenanceMockData";

class MaintenanceService {
  private tasks: MaintenanceTask[] = [...INITIAL_MAINTENANCE_TASKS];

  /**
   * Lấy danh sách nhiệm vụ bảo trì theo bộ lọc
   */
  async getTasks(filter?: MaintenanceFilter): Promise<MaintenanceTask[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));

    let result = [...this.tasks];

    if (!filter) return result;

    if (filter.keyword && filter.keyword.trim()) {
      const q = filter.keyword.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.planCode.toLowerCase().includes(q) ||
          (t.assetCode && t.assetCode.toLowerCase().includes(q)) ||
          (t.assetName && t.assetName.toLowerCase().includes(q)) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q)) ||
          (t.vendorName && t.vendorName.toLowerCase().includes(q)) ||
          (t.locationName && t.locationName.toLowerCase().includes(q))
      );
    }

    if (filter.type && filter.type !== "all") {
      result = result.filter((t) => t.type === filter.type);
    }

    if (filter.status && filter.status !== "all") {
      result = result.filter((t) => t.status === filter.status);
    }

    if (filter.priority && filter.priority !== "all") {
      result = result.filter((t) => t.priority === filter.priority);
    }

    if (filter.location && filter.location !== "all") {
      result = result.filter((t) => t.locationName?.includes(filter.location || ""));
    }

    // Sắp xếp ngày bắt đầu gần nhất
    result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return result;
  }

  /**
   * Lấy chi tiết công việc theo ID
   */
  async getById(id: string): Promise<MaintenanceTask | null> {
    const item = this.tasks.find((t) => t.id === id);
    return item ? { ...item } : null;
  }

  /**
   * Thêm mới công việc bảo trì
   */
  async create(task: Omit<MaintenanceTask, "id" | "createdAt" | "updatedAt">): Promise<MaintenanceTask> {
    const newEntry: MaintenanceTask = {
      ...task,
      id: `mnt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.unshift(newEntry);
    return newEntry;
  }

  /**
   * Cập nhật công việc bảo trì
   */
  async update(id: string, updates: Partial<MaintenanceTask>): Promise<MaintenanceTask> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Không tìm thấy công việc bảo trì");

    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.tasks[index] };
  }

  /**
   * Cập nhật nhanh trạng thái
   */
  async updateStatus(id: string, newStatus: MaintenanceStatus): Promise<MaintenanceTask> {
    return this.update(id, { status: newStatus });
  }

  /**
   * Đánh dấu hoàn thành / chưa hoàn thành 1 mục checklist
   */
  async toggleChecklist(taskId: string, checklistId: string): Promise<MaintenanceTask> {
    const task = await this.getById(taskId);
    if (!task) throw new Error("Không tìm thấy nhiệm vụ");

    const updatedChecklist = (task.checklist || []).map((item) =>
      item.id === checklistId ? { ...item, completed: !item.completed } : item
    );

    return this.update(taskId, { checklist: updatedChecklist });
  }

  /**
   * Xóa công việc bảo trì
   */
  async delete(id: string): Promise<boolean> {
    const prevLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    return this.tasks.length < prevLen;
  }

  /**
   * Xuất danh sách ra CSV
   */
  exportToCsv(tasks: MaintenanceTask[]) {
    const headers = [
      "Mã kế hoạch",
      "Tiêu đề công việc",
      "Loại bảo trì",
      "Trạng thái",
      "Độ ưu tiên",
      "Mã thiết bị",
      "Tên thiết bị",
      "Vị trí",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Người phụ trách",
      "Đơn vị thực hiện",
      "Chi phí dự toán (VNĐ)",
      "Chi phí thực tế (VNĐ)",
    ];

    const rows = tasks.map((t) => [
      `"${t.planCode}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.type}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.assetCode || ""}"`,
      `"${(t.assetName || "").replace(/"/g, '""')}"`,
      `"${(t.locationName || "").replace(/"/g, '""')}"`,
      `"${t.startDate}"`,
      `"${t.endDate}"`,
      `"${t.assignedTo || ""}"`,
      `"${t.vendorName || ""}"`,
      `"${t.estimatedCost || 0}"`,
      `"${t.actualCost || 0}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Ke_hoach_Lich_bao_tri_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const maintenanceService = new MaintenanceService();
