import { ENV } from "../config/env";

/**
 * Trả về đường dẫn API đầy đủ kết hợp các biến môi trường VITE_BACKEND_TARGET và VITE_API_URL
 * Ví dụ: getFullApiUrl("/units/batch-import") -> "https://localhost:8687/api/v1/units/batch-import"
 */
export const getFullApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${ENV.BACKEND_TARGET}${ENV.API_URL}${cleanEndpoint}`;
};

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
    ASSET_CATEGORIES_BATCH_IMPORT: "/asset-categories/batch-import",
    ASSET_STATUSES: "/asset-status",
    ASSET_STATUSES_BATCH_IMPORT: "/asset-status/batch-import",
    ASSET_TYPES: "/asset-types",
    ASSET_TYPES_BATCH_IMPORT: "/asset-types/batch-import",
    BRANDS: "/brands",
    BRANDS_BATCH_IMPORT: "/brands/batch-import",
    COST_CENTERS: "/cost-center",
    COST_CENTERS_BATCH_IMPORT: "/cost-center/batch-import",
    DEPARTMENTS: "/department",
    DEPARTMENTS_BATCH_IMPORT: "/department/batch-import",
    LICENSE_TYPES: "/license-type",
    LICENSE_TYPES_BATCH_IMPORT: "/license-type/batch-import",
    LOCATIONS: "/location",
    LOCATIONS_BATCH_IMPORT: "/location/batch-import",
    MAINTENANCE_TYPES: "/maintenance-type",
    MAINTENANCE_TYPES_BATCH_IMPORT: "/maintenance-type/batch-import",
    POSITIONS: "/positions",
    POSITIONS_BATCH_IMPORT: "/positions/batch-import",
    SUPPLIERS: "/suppliers",
    SUPPLIERS_BATCH_IMPORT: "/suppliers/batch-import",
    UNITS: "/units",
    UNITS_BATCH_IMPORT: "/units/batch-import",
  },

  // Quản lý Nhà cung cấp (Suppliers)
  SUPPLIERS: {
    BASE: "/suppliers",
    BATCH_IMPORT: "/suppliers/batch-import",
    FULL_BATCH_IMPORT_URL: getFullApiUrl("/suppliers/batch-import"),
  },

  // Quản lý Đơn vị tính (Units)
  UNITS: {
    BASE: "/units",
    BATCH_IMPORT: "/units/batch-import",
    FULL_BATCH_IMPORT_URL: getFullApiUrl("/units/batch-import"),
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

  // Quản lý Tập tin & Đính kèm (Files & Attachments)
  FILES: {
    BASE: "/files",
    UPLOAD: "/files/upload",
    UPLOAD_MULTIPLE: "/files/upload-multiple",
    DOWNLOAD: "/files/download",
    DELETE: "/files/delete",
  },

  // Quản lý Hợp đồng & Phụ lục (Contracts & Addendums)
  CONTRACTS: {
    BASE: "/contracts",
    ADDENDUMS: "/contract_addendums",
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
  ROLES: {
    BASE: "/roles",
    PERMISSIONS: (roleId: string) => `/roles/${roleId}/permissions`,
  },
  PERMISSIONS: {
    BASE: "/permissions",
    MODULES: "/permissions/modules",
  },

  // Hệ thống & Cấu hình (System Logs & Configs)
  SYSTEM: {
    LOGS: "/system-logs",
    CONFIG: "/system-configs",
    SETTINGS: "/system-settings",
  },
  AUDIT_LOGS: {
    BASE: "/audit-logs",
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
