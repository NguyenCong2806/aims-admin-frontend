/**
 * Danh sách toàn bộ Endpoint API của hệ thống AIMS Enterprise
 * Quản lý tập trung (Single Source of Truth) để tránh magic strings và dễ bảo trì.
 */
export const API_ENDPOINTS = {
  // Xác thực & Phiên làm việc
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },

  // Danh mục dùng chung (Lookups)
  LOOKUPS: {
    ASSET_CATEGORIES: "/asset-categories",
    ASSET_STATUSES: "/asset-status",
    ASSET_TYPES: "/asset-types",
    BRANDS: "/brands",
    COST_CENTERS: "/cost-center",
    DEPARTMENTS: "/department",
    LICENSE_TYPES: "/license-type",
    LOCATIONS: "/location",
    MAINTENANCE_TYPES: "/maintenance-type",
    POSITIONS: "/positions",
    SUPPLIERS: "/suppliers",
    UNITS: "/units",
  },
  DEVICE: {
    BASE: "/computer-audit",
    COMPUTER_AUDIT: "/computer-audits",
  },
  // Quản lý Tài nguyên số (Digital Assets)
  DIGITAL_ASSETS: {
    BASE: "/digital-assets",
    ADD: "/digital-assets/add-digital-assets",
    CLOUD_SERVERS: "/digitalcloudservers",
    DOMAINS_SSL: "/digitaldomainsssls",
    INTERNET_LINES: "/digitalinternetlines",
    SOFTWARE_LICENSES: "/digitalsoftwarelicenses",
  },

  // Quản lý Thiết bị phần cứng (Hardware Assets)
  HARDWARE: {
    BASE: "/hardware-assets",
  },

  // Giám sát máy trạm & Phần mềm cài đặt (Monitoring)
  MONITORING: {
    WORKSTATIONS: "/workstations",
    INSTALLED_SOFTWARE: "/installed-software",
  },

  // Kế hoạch & Lịch bảo trì (Maintenance)
  MAINTENANCE: {
    PLANS: "/maintenance-plans",
    SCHEDULES: "/maintenance-schedules",
  },

  // Quản trị người dùng & Phân quyền (Users & RBAC)
  USERS: {
    BASE: "/users",
    ROLES: "/roles",
    PERMISSIONS: "/permissions",
  },

  // Hệ thống & Cấu hình (System Logs & Configs)
  SYSTEM: {
    LOGS: "/system-logs",
    CONFIG: "/system-configs",
    SETTINGS: "/system-settings",
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
