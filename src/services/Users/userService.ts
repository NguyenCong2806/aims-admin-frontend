import {
  UserAccount,
  UserAccountFilter,
  UserRole,
  UserStatus,
} from "../../models/User/userAccount";
import { INITIAL_USER_ACCOUNTS } from "./userMockData";

class UserService {
  private users: UserAccount[] = [...INITIAL_USER_ACCOUNTS];

  /**
   * Lấy danh sách tài khoản theo bộ lọc và tìm kiếm
   */
  async getUsers(filter?: UserAccountFilter): Promise<UserAccount[]> {
    await new Promise((resolve) => setTimeout(resolve, 60));

    let result = [...this.users];

    if (!filter) return result;

    if (filter.keyword && filter.keyword.trim()) {
      const q = filter.keyword.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q)) ||
          (u.departmentName && u.departmentName.toLowerCase().includes(q)) ||
          (u.positionName && u.positionName.toLowerCase().includes(q))
      );
    }

    if (filter.role && filter.role !== "all") {
      result = result.filter((u) => u.roles.includes(filter.role as UserRole));
    }

    if (filter.status && filter.status !== "all") {
      result = result.filter((u) => u.status === filter.status);
    }

    if (filter.department && filter.department !== "all") {
      result = result.filter((u) => u.departmentName === filter.department);
    }

    if (filter.mfa && filter.mfa !== "all") {
      result = result.filter((u) =>
        filter.mfa === "enabled" ? u.mfaEnabled : !u.mfaEnabled
      );
    }

    return result;
  }

  /**
   * Lấy chi tiết tài khoản theo ID
   */
  async getById(id: number): Promise<UserAccount | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  /**
   * Tạo tài khoản mới
   */
  async create(user: Omit<UserAccount, "id" | "createdAt" | "updatedAt">): Promise<UserAccount> {
    const newId = this.users.length > 0 ? Math.max(...this.users.map((u) => u.id)) + 1 : 1;
    const newEntry: UserAccount = {
      ...user,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.unshift(newEntry);
    return newEntry;
  }

  /**
   * Cập nhật thông tin tài khoản
   */
  async update(id: number, updates: Partial<UserAccount>): Promise<UserAccount> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error("Không tìm thấy tài khoản người dùng");

    this.users[index] = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.users[index] };
  }

  /**
   * Khóa / Mở khóa tài khoản
   */
  async toggleLock(id: number): Promise<UserAccount> {
    const user = await this.getById(id);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const newStatus: UserStatus = user.status === "LOCKED" ? "ACTIVE" : "LOCKED";
    return this.update(id, { status: newStatus });
  }

  /**
   * Xóa tài khoản
   */
  async delete(id: number): Promise<boolean> {
    const prevLen = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length < prevLen;
  }

  /**
   * Đặt lại mật khẩu
   */
  async resetPassword(id: number): Promise<{ tempPassword: string }> {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let tempPassword = "";
    for (let i = 0; i < 10; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Cập nhật timestamp
    await this.update(id, { updatedAt: new Date().toISOString() });
    return { tempPassword };
  }

  /**
   * Xuất danh sách tài khoản ra CSV
   */
  exportToCsv(users: UserAccount[]) {
    const headers = [
      "User ID",
      "Tên đăng nhập",
      "Họ và tên",
      "Email",
      "Số điện thoại",
      "Phòng ban",
      "Chức vụ",
      "Vai trò (Roles)",
      "Trạng thái",
      "Bảo mật 2FA",
      "Số tài sản đang giữ",
      "Đăng nhập cuối",
      "IP Đăng nhập",
    ];

    const rows = users.map((u) => [
      `"${u.id}"`,
      `"${u.username}"`,
      `"${u.fullName}"`,
      `"${u.email}"`,
      `"${u.phone || ""}"`,
      `"${u.departmentName || ""}"`,
      `"${u.positionName || ""}"`,
      `"${u.roles.join(", ")}"`,
      `"${u.status}"`,
      `"${u.mfaEnabled ? "Bật" : "Tắt"}"`,
      `"${(u.assignedAssets || []).length}"`,
      `"${u.lastLoginAt || "Chưa đăng nhập"}"`,
      `"${u.lastLoginIp || ""}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Danh_sach_Tai_khoan_Nguoi_dung_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const userService = new UserService();
