import { useQuery } from "@tanstack/react-query";
import { services } from "../../di/ServiceContainer";

/**
 * Định dạng phần tử trả về từ endpoint /select-list của Backend
 * Khớp chuẩn câu lệnh SQL: SELECT id AS Key, name AS Value FROM ...
 */
export interface SelectListItemDto {
  // Cặp Key/Value từ Backend: Key = ID, Value = Tên hiển thị
  key?: number | string;
  Key?: number | string;
  value?: string | number;
  Value?: string | number;

  // Hỗ trợ dự phòng các trường gốc
  id?: number | string;
  name?: string;
  text?: string;
  label?: string;
  code?: string;
  description?: string;
  [extra: string]: unknown;
}

export interface StandardOption {
  value: number; // ID khóa chính / khóa ngoại (từ Key)
  label: string; // Tên hiển thị (từ Value)
  code?: string;
}

/**
 * Helper chuẩn hóa mảng kết quả từ API /select-list thành danh sách options { value: number, label: string }
 * Hỗ trợ chính xác cấu trúc: SELECT id AS Key, name AS Value
 */
export function normalizeSelectList(items?: SelectListItemDto[] | null): StandardOption[] {
  if (!items || !Array.isArray(items)) return [];
  return items
    .map((item) => {
      // 1. Trích xuất ID (từ Key / key hoặc id)
      let rawKey: unknown;
      if (item.Key !== undefined && item.Key !== null) {
        rawKey = item.Key;
      } else if (item.key !== undefined && item.key !== null) {
        rawKey = item.key;
      } else if (item.id !== undefined && item.id !== null) {
        rawKey = item.id;
      } else if (typeof item.value === "number") {
        rawKey = item.value;
      }

      const numVal = typeof rawKey === "number" ? rawKey : Number(rawKey) || 0;

      // 2. Trích xuất Tên hiển thị (từ Value / value hoặc name / text / label)
      let rawLabel: unknown;
      if (item.Value !== undefined && item.Value !== null) {
        rawLabel = item.Value;
      } else if (
        (item.Key !== undefined || item.key !== undefined) &&
        item.value !== undefined &&
        item.value !== null
      ) {
        rawLabel = item.value;
      } else if (item.name) {
        rawLabel = item.name;
      } else if (item.text) {
        rawLabel = item.text;
      } else if (item.label) {
        rawLabel = item.label;
      } else if (typeof item.value === "string") {
        rawLabel = item.value;
      } else {
        rawLabel = item.code ? `[${item.code}]` : `Mục #${numVal}`;
      }

      return {
        value: numVal,
        label: String(rawLabel).trim(),
        code: item.code ? String(item.code) : undefined,
      };
    })
    .filter((opt) => opt.value > 0 || opt.label.length > 0);
}

// =========================================================================
// 6 HOOKS LẤY SELECT-LIST CHO 6 KHÓA NGOẠI CỦA THIẾT BỊ PHẦN CỨNG
// =========================================================================

/**
 * 1. Danh sách Loại tài sản (Category): /asset-categories/select-list
 */
export function useAssetCategorySelectList() {
  return useQuery({
    queryKey: ["asset-categories", "select-list"],
    queryFn: () => services.assetCategory.getSelectList<SelectListItemDto>(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 2. Danh sách Trạng thái tài sản (Status): /asset-status/select-list
 */
export function useAssetStatusSelectList() {
  return useQuery({
    queryKey: ["asset-statuses", "select-list"],
    queryFn: () => services.assetStatus.getSelectList<SelectListItemDto>(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 3. Danh sách Thương hiệu / Hãng (Brand): /brands/select-list
 */
export function useBrandSelectList() {
  return useQuery({
    queryKey: ["brands", "select-list"],
    queryFn: () => services.brand.getSelectList<SelectListItemDto>(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 4. Danh sách Nhà cung cấp (Supplier): /suppliers/select-list
 */
export function useSupplierSelectList() {
  return useQuery({
    queryKey: ["suppliers", "select-list"],
    queryFn: () => services.supplier.getSelectList<SelectListItemDto>(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 5. Danh sách Vị trí vật lý (Location): /location/select-list
 */
export function useLocationSelectList() {
  return useQuery({
    queryKey: ["locations", "select-list"],
    queryFn: () => services.location.getSelectList<SelectListItemDto>(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * 6. Danh sách Phòng ban sử dụng (Department): /department/select-list
 */
export function useDepartmentSelectList() {
  return useQuery({
    queryKey: ["departments", "select-list"],
    queryFn: () => services.department.getSelectList<SelectListItemDto>(),
    staleTime: 1000 * 60 * 5,
  });
}
