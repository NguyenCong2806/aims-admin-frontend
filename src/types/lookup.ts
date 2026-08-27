// Định dạng cơ bản của mọi bảng Lookup
export interface BaseLookupItem {
  id: number | string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
}

// Cấu hình linh hoạt: T kế thừa từ BaseLookupItem
export interface ColumnConfig<T extends BaseLookupItem> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

export interface LookupConfig<T extends BaseLookupItem> {
  title: string;
  endpoint: string;
  columns?: ColumnConfig<T>[];
}