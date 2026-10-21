import { SystemLog, SystemLogFilter } from "../../models/SystemLog/systemLog";
import { INITIAL_SYSTEM_LOGS } from "./systemLogMockData";

class SystemLogService {
  private logs: SystemLog[] = [...INITIAL_SYSTEM_LOGS];

  /**
   * Lấy danh sách nhật ký theo điều kiện phân trang, lọc và tìm kiếm
   */
  async getByParams(filter: SystemLogFilter): Promise<{
    items: SystemLog[];
    totalRecords: number;
    totalPages: number;
    pageIndex: number;
    pageSize: number;
  }> {
    // Giả lập network latency nhẹ để hiệu ứng UI mượt mà
    await new Promise((resolve) => setTimeout(resolve, 80));

    let filtered = [...this.logs];

    // 1. Lọc theo từ khóa keyword
    if (filter.keyword && filter.keyword.trim()) {
      const q = filter.keyword.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const matchAction = item.action.toLowerCase().includes(q);
        const matchTable = item.tableName.toLowerCase().includes(q);
        const matchRecord = item.recordId ? item.recordId.toLowerCase().includes(q) : false;
        const matchUser = item.userName ? item.userName.toLowerCase().includes(q) : false;
        const matchIp = item.ipAddress ? item.ipAddress.toLowerCase().includes(q) : false;
        const matchOld = item.oldData ? item.oldData.toLowerCase().includes(q) : false;
        const matchNew = item.newData ? item.newData.toLowerCase().includes(q) : false;

        return (
          matchAction ||
          matchTable ||
          matchRecord ||
          matchUser ||
          matchIp ||
          matchOld ||
          matchNew
        );
      });
    }

    // 2. Lọc theo Action (INSERT / UPDATE / DELETE)
    if (filter.action && filter.action !== "all") {
      filtered = filtered.filter(
        (item) => item.action.toUpperCase() === filter.action?.toUpperCase()
      );
    }

    // 3. Lọc theo TableName
    if (filter.tableName && filter.tableName !== "all") {
      filtered = filtered.filter(
        (item) => item.tableName.toLowerCase() === filter.tableName?.toLowerCase()
      );
    }

    // 4. Lọc theo UserName
    if (filter.userName && filter.userName !== "all") {
      filtered = filtered.filter((item) => item.userName === filter.userName);
    }

    // 5. Lọc theo thời gian (Hôm nay, 7 ngày, 30 ngày)
    if (filter.dateRange && filter.dateRange !== "all") {
      const now = new Date().getTime();
      filtered = filtered.filter((item) => {
        const itemTime = new Date(item.createdAt).getTime();
        const diffDays = (now - itemTime) / (1000 * 60 * 60 * 24);

        if (filter.dateRange === "today") return diffDays <= 1;
        if (filter.dateRange === "week") return diffDays <= 7;
        if (filter.dateRange === "month") return diffDays <= 30;
        return true;
      });
    }

    // Sắp xếp thời gian mới nhất lên đầu
    filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalRecords = filtered.length;
    const pageIndex = Math.max(1, filter.pageIndex || 1);
    const pageSize = Math.max(1, filter.pageSize || 10);
    const totalPages = Math.ceil(totalRecords / pageSize) || 1;

    const start = (pageIndex - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      totalRecords,
      totalPages,
      pageIndex,
      pageSize,
    };
  }

  /**
   * Lấy chi tiết 1 bản ghi log theo ID (Guid)
   */
  async getById(id: string): Promise<SystemLog | null> {
    const item = this.logs.find((x) => x.id === id);
    return item ? { ...item } : null;
  }

  /**
   * Thêm log mới thủ công (nếu cần trigger kiểm toán)
   */
  async appendLog(log: Omit<SystemLog, "id" | "createdAt">): Promise<SystemLog> {
    const newEntry: SystemLog = {
      ...log,
      id: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.logs.unshift(newEntry);
    return newEntry;
  }

  /**
   * Xuất danh sách kiểm toán ra CSV / Excel
   */
  exportToCsv(items: SystemLog[]) {
    const headers = [
      "Thời gian (UTC)",
      "Hành động",
      "Bảng dữ liệu",
      "Mã bản ghi (RecordId)",
      "Người thực hiện",
      "User ID",
      "Địa chỉ IP",
      "Dữ liệu cũ (OldData)",
      "Dữ liệu mới (NewData)",
    ];

    const rows = items.map((it) => [
      `"${it.createdAt}"`,
      `"${it.action}"`,
      `"${it.tableName}"`,
      `"${it.recordId || ""}"`,
      `"${it.userName || ""}"`,
      `"${it.userId || ""}"`,
      `"${it.ipAddress || ""}"`,
      `"${(it.oldData || "").replace(/"/g, '""')}"`,
      `"${(it.newData || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Nhat_ky_he_thong_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const systemLogService = new SystemLogService();
