import {
  InstalledSoftware,
  SoftwareComplianceStatus,
  SoftwareInventoryFilter,
} from "../../models/Monitoring/installedSoftware";
import { WorkstationMonitoring } from "../../models/Monitoring/workstationMonitoring";
import { INITIAL_INSTALLED_SOFTWARE } from "./installedSoftwareMockData";

class InstalledSoftwareService {
  private softwareList: InstalledSoftware[] = [...INITIAL_INSTALLED_SOFTWARE];

  /**
   * Lấy danh sách phần mềm theo bộ lọc (hoặc theo máy trạm)
   */
  async getSoftware(filter?: SoftwareInventoryFilter): Promise<InstalledSoftware[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));

    let result = [...this.softwareList];

    if (!filter) return result;

    if (filter.workstationId && filter.workstationId !== "all") {
      result = result.filter((s) => s.workstationId === filter.workstationId);
    }

    if (filter.keyword && filter.keyword.trim()) {
      const q = filter.keyword.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.displayName.toLowerCase().includes(q) ||
          s.publisher.toLowerCase().includes(q) ||
          s.displayVersion.toLowerCase().includes(q) ||
          (s.installLocation && s.installLocation.toLowerCase().includes(q))
      );
    }

    if (filter.category && filter.category !== "all") {
      result = result.filter((s) => s.category === filter.category);
    }

    if (filter.complianceStatus && filter.complianceStatus !== "all") {
      result = result.filter((s) => s.complianceStatus === filter.complianceStatus);
    }

    if (filter.licenseType && filter.licenseType !== "all") {
      result = result.filter((s) => s.licenseType === filter.licenseType);
    }

    if (filter.publisher && filter.publisher !== "all") {
      result = result.filter((s) => s.publisher.toLowerCase() === filter.publisher!.toLowerCase());
    }

    return result;
  }

  /**
   * Lấy danh sách phần mềm của một máy trạm cụ thể
   */
  async getByWorkstationId(workstationId: string): Promise<InstalledSoftware[]> {
    return this.getSoftware({ workstationId });
  }

  /**
   * Cập nhật trạng thái tuân thủ bảo mật của phần mềm (Approved, UnderReview, Prohibited, Unlicensed)
   */
  async updateComplianceStatus(
    id: string,
    status: SoftwareComplianceStatus
  ): Promise<InstalledSoftware | null> {
    const item = this.softwareList.find((s) => s.id === id);
    if (!item) return null;
    item.complianceStatus = status;
    return { ...item };
  }

  /**
   * Xuất danh mục kiểm kê phần mềm của máy trạm ra CSV
   */
  exportCsv(workstation: WorkstationMonitoring, items: InstalledSoftware[]): void {
    const headers = [
      "Mã phần mềm",
      "Tên phần mềm",
      "Phiên bản",
      "Nhà phát hành",
      "Phân nhóm",
      "Loại bản quyền",
      "Trạng thái tuân thủ",
      "Kiến trúc",
      "Dung lượng (MB)",
      "Ngày cài đặt",
      "Đường dẫn cài đặt",
      "Lệnh gỡ cài đặt",
    ];

    const rows = items.map((s) => [
      `"${s.id}"`,
      `"${s.displayName.replace(/"/g, '""')}"`,
      `"${s.displayVersion}"`,
      `"${s.publisher.replace(/"/g, '""')}"`,
      `"${s.category}"`,
      `"${s.licenseType}"`,
      `"${s.complianceStatus}"`,
      `"${s.architecture}"`,
      `"${s.estimatedSizeMB}"`,
      `"${s.installDate}"`,
      `"${(s.installLocation || "").replace(/"/g, '""')}"`,
      `"${(s.uninstallString || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" +
      `"DANH MỤC PHẦN MỀM CÀI ĐẶT TRÊN MÁY TRẠM: ${workstation.hostName} (Asset: ${workstation.assetId || "Chưa map"})"\n` +
      `"Thời điểm thu thập: ${new Date(workstation.collectedAt).toLocaleString()}"\n\n` +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `software_inventory_${workstation.hostName}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const installedSoftwareService = new InstalledSoftwareService();
