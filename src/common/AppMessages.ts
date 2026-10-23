/**
 * Quản lý tập trung toàn bộ thông báo hệ thống, validation và phản hồi người dùng (Single Source of Truth)
 * Tránh magic strings rải rác trong các form, service và views.
 */
export const APP_MESSAGES = {
  // Xác thực & Tài khoản
  AUTH: {
    USERNAME_REQUIRED: "Vui lòng nhập email hoặc tên đăng nhập.",
    PASSWORD_REQUIRED: "Vui lòng nhập mật khẩu.",
    INVALID_CREDENTIALS: "Tên đăng nhập hoặc mật khẩu không chính xác.",
    LOGIN_SUCCESS: "Đăng nhập thành công!",
    LOGOUT_SUCCESS: "Đăng xuất thành công!",
    SESSION_EXPIRED: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
    CHANGE_PASSWORD_SUCCESS: "Đổi mật khẩu thành công!",
    RESET_PASSWORD_SUCCESS: "Đặt lại mật khẩu thành công!",
  },

  // Thao tác CRUD & Hệ thống dùng chung
  COMMON: {
    SUCCESS: "Thực hiện thành công!",
    CREATE_SUCCESS: "Thêm mới dữ liệu thành công!",
    UPDATE_SUCCESS: "Cập nhật dữ liệu thành công!",
    DELETE_SUCCESS: "Đã loại bỏ dữ liệu thành công.",
    ACTION_SUCCESS: "Thực hiện thao tác thành công!",
    DELETE_CONFIRM_TITLE: "Bạn có chắc muốn xóa?",
    DELETE_CONFIRM_TEXT: "Dữ liệu này sẽ bị xóa.",
    CONFIRM_DELETE_BTN: "Xóa",
    CANCEL_BTN: "Hủy",
    DELETE_HEADER: "Xóa bỏ!",
    ERROR_OCCURRED: "Đã xảy ra lỗi, vui lòng thử lại sau.",
    NETWORK_ERROR: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền.",
    NO_DATA: "Không có dữ liệu hiển thị.",
    LOAD_DATA_FAILED: "Tải dữ liệu thất bại.",
  },

  // Xác thực Form (Validation)
  VALIDATION: {
    REQUIRED: (fieldName: string) => `Vui lòng nhập ${fieldName}.`,
    INVALID_EMAIL: "Email không đúng định dạng.",
    INVALID_PHONE: "Số điện thoại không đúng định dạng.",
    MIN_LENGTH: (fieldName: string, min: number) => `${fieldName} phải có tối thiểu ${min} ký tự.`,
    MAX_LENGTH: (fieldName: string, max: number) => `${fieldName} không được vượt quá ${max} ký tự.`,
  },

  // Tệp tin & Đính kèm
  FILES: {
    UPLOAD_SUCCESS: "Tải lên tệp tin thành công!",
    UPLOAD_FAILED: "Tải lên tệp tin thất bại.",
    DOWNLOAD_SUCCESS: "Tải về tệp tin thành công!",
    DELETE_SUCCESS: "Xóa tệp tin thành công!",
    SIZE_LIMIT: "Kích thước tệp tin vượt quá dung lượng cho phép.",
  },

  // Module Thiết bị & Tài sản
  HARDWARE: {
    CREATE_SUCCESS: "Thêm mới thiết bị phần cứng thành công!",
    UPDATE_SUCCESS: "Cập nhật thiết bị phần cứng thành công!",
    DELETE_SUCCESS: "Xóa thiết bị thành công!",
  },

  DIGITAL_ASSET: {
    CREATE_SUCCESS: "Thêm mới tài nguyên số thành công!",
    UPDATE_SUCCESS: "Cập nhật tài nguyên số thành công!",
    DELETE_SUCCESS: "Xóa tài nguyên số thành công!",
  },
} as const;

export type AppMessagesType = typeof APP_MESSAGES;
