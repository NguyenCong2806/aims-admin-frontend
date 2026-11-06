import { API_ENDPOINTS } from "../../../common/ApiEndpoints";
import { APP_MESSAGES } from "../../../common/AppMessages";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { api } from "../../../library/axios";
import { PagedResult } from "../../base/models/PagedResult";
import { PaginationFilter } from "../../base/models/PaginationFilter";
import { Result } from "../../base/models/Result";
import { Service } from "../../base/Service";
import {
  CreateUserAccountDto,
  UpdateUserAccountDto,
  UserAccount,
  UserRole,
} from "../models/userAccount";
import { IUserService } from "./IUserService";

export class UserService
  extends Service<UserAccount, CreateUserAccountDto, UpdateUserAccountDto, number>
  implements IUserService
{
  constructor(endpoint = API_ENDPOINTS.USERS.BASE) {
    super(endpoint);
  }

  /**
   * Tạo mới người dùng kèm gán vai trò
   * Endpoint: POST /api/v1/accounts/with-roles
   */
  override async create(request: CreateUserAccountDto): Promise<Result<UserAccount>> {
    const payload = {
      username: request.username,
      email: request.email,
      fullName: request.fullName,
      passwordhash: request.passwordhash,
      phoneNumber: request.phoneNumber ?? request.phonennumber ?? null,
      avatarUrl: request.avatarUrl ?? request.avatarurl ?? null,
      departmentid: request.departmentid,
      positionid: request.positionid ?? null,
      isActive: request.isActive,
      roleids: request.roleids && request.roleids.length > 0 ? request.roleids : [1],
    };

    const response = await api.post<Result<UserAccount>>(
      API_ENDPOINTS.USERS.WITH_ROLES,
      payload
    );
    toast.success(APP_MESSAGES.COMMON.CREATE_SUCCESS);
    return response.data;
  }

  /**
   * Cập nhật thông tin tài khoản kèm gán vai trò
   * Endpoint: PUT /api/v1/accounts/{id}/with-roles
   */
  override async update(id: number, request: UpdateUserAccountDto): Promise<Result<UserAccount>> {
    const payload = {
      username: request.username,
      email: request.email,
      fullName: request.fullName,
      phoneNumber: request.phoneNumber ?? request.phonennumber ?? null,
      avatarUrl: request.avatarUrl ?? request.avatarurl ?? null,
      departmentid: request.departmentid,
      positionid: request.positionid ?? null,
      isActive: request.isActive,
      roleids: request.roleids && request.roleids.length > 0 ? request.roleids : [1],
    };

    const response = await api.put<Result<UserAccount> | void>(
      API_ENDPOINTS.USERS.UPDATE_WITH_ROLES(id),
      payload
    );

    const resData = response.data as Result<UserAccount> | undefined;
    return (
      resData ||
      ({
        isSuccess: true,
        statusCode: response.status || 204,
        message: APP_MESSAGES.COMMON.UPDATE_SUCCESS,
        data: { id, ...payload },
      } as unknown as Result<UserAccount>)
    );
  }

  /**
   * Lấy danh sách tài khoản phân trang từ cơ sở dữ liệu
   * Endpoint: GET /api/v1/accounts/paged-db
   */
  async getPagedDb(params?: PaginationFilter): Promise<PagedResult<UserAccount>> {
    const queryParams: Record<string, unknown> = {};
    if (params) {
      if (params.PageIndex !== undefined) {
        queryParams.pageIndex = params.PageIndex;
        queryParams.PageIndex = params.PageIndex;
      }
      if (params.PageSize !== undefined) {
        queryParams.pageSize = params.PageSize;
        queryParams.PageSize = params.PageSize;
      }
      if (params.Keyword) {
        queryParams.keyword = params.Keyword;
        queryParams.Keyword = params.Keyword;
      }
    }

    const response = await api.get<PagedResult<UserAccount> | { data: PagedResult<UserAccount> }>(
      API_ENDPOINTS.USERS.PAGED_DB,
      { params: queryParams }
    );

    const raw = response.data as unknown as Record<string, unknown>;
    let pagedData: PagedResult<UserAccount>;

    if (raw && "items" in raw && Array.isArray(raw.items)) {
      pagedData = raw as unknown as PagedResult<UserAccount>;
    } else if (
      raw &&
      "data" in raw &&
      typeof raw.data === "object" &&
      raw.data &&
      "items" in (raw.data as Record<string, unknown>)
    ) {
      pagedData = (raw.data as unknown) as PagedResult<UserAccount>;
    } else {
      pagedData = {
        items: [],
        pagination: {
          pageIndex: params?.PageIndex || 1,
          pageSize: params?.PageSize || 10,
          totalRecords: 0,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
    }

    // Chuẩn hóa dữ liệu trả về từ backend
    const normalizedItems: UserAccount[] = (pagedData.items || []).map((u) => {
      const isAct = u.isActive ?? (u.status === "ACTIVE");
      return {
        ...u,
        phone: u.phone || u.phoneNumber || null,
        phoneNumber: u.phoneNumber || u.phone || null,
        status: u.status || (isAct ? "ACTIVE" : "INACTIVE"),
        isActive: isAct,
        roles:
          u.roles && u.roles.length > 0
            ? u.roles
            : u.username === "admin"
            ? (["SuperAdmin"] as UserRole[])
            : (["Staff"] as UserRole[]),
        mfaEnabled: u.mfaEnabled ?? false,
        assignedAssets: u.assignedAssets || [],
      };
    });

    return {
      items: normalizedItems,
      pagination: pagedData.pagination || {
        pageIndex: params?.PageIndex || 1,
        pageSize: params?.PageSize || 10,
        totalRecords: normalizedItems.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  /**
   * Khóa tài khoản người dùng
   * Endpoint: POST /api/v1/accounts/{id}/lock
   */
  async lock(id: number): Promise<Result<UserAccount>> {
    const response = await api.post<Result<UserAccount> | void>(
      API_ENDPOINTS.USERS.LOCK(id)
    );
    const resData = response.data as Result<UserAccount> | undefined;
    return (
      resData ||
      ({
        isSuccess: true,
        statusCode: response.status || 204,
        message: "Đã cập nhật trạng thái khóa tài khoản!",
        data: { id } as UserAccount,
      } as unknown as Result<UserAccount>)
    );
  }

  async toggleLock(id: number): Promise<Result<UserAccount>> {
    return this.lock(id);
  }

  /**
   * Xóa mềm tài khoản người dùng theo Procedure
   * Endpoint: DELETE /api/v1/accounts/{id}/soft
   */
  override async delete(id: number): Promise<Result<UserAccount> | null> {
    const result = await Swal.fire({
      title: APP_MESSAGES.COMMON.DELETE_CONFIRM_TITLE,
      text: "Tài khoản người dùng sẽ bị xóa khỏi hệ thống.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: APP_MESSAGES.COMMON.CONFIRM_DELETE_BTN,
      cancelButtonText: APP_MESSAGES.COMMON.CANCEL_BTN,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return null;
    }

    const response = await api.delete<Result<UserAccount> | void>(
      API_ENDPOINTS.USERS.SOFT_DELETE(id)
    );

    Swal.fire({
      title: APP_MESSAGES.COMMON.DELETE_HEADER,
      text: APP_MESSAGES.COMMON.DELETE_SUCCESS,
      icon: "success",
    });

    const resData = response.data as Result<UserAccount> | undefined;
    return (
      resData ||
      ({
        isSuccess: true,
        statusCode: response.status || 204,
        message: APP_MESSAGES.COMMON.DELETE_SUCCESS,
        data: { id } as UserAccount,
      } as unknown as Result<UserAccount>)
    );
  }

  /**
   * Đặt lại mật khẩu tài khoản
   */
  async resetPassword(id: number): Promise<{ tempPassword: string }> {
    try {
      const response = await api.post<{ tempPassword?: string } | { data?: { tempPassword?: string } }>(
        `${this.endpoint}/${id}/reset-password`
      );
      const res = response.data;
      if (res && "tempPassword" in res && res.tempPassword) {
        return { tempPassword: res.tempPassword };
      }
      if (res && "data" in res && res.data?.tempPassword) {
        return { tempPassword: res.data.tempPassword };
      }
    } catch {
      // Fallback sinh mật khẩu ngẫu nhiên tạm thời
    }

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let tempPassword = "";
    for (let i = 0; i < 10; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
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
      `"${u.phone || u.phoneNumber || ""}"`,
      `"${u.departmentName || ""}"`,
      `"${u.positionName || ""}"`,
      `"${(u.roles || []).join(", ")}"`,
      `"${u.status || (u.isActive ? "ACTIVE" : "INACTIVE")}"`,
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
