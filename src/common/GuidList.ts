export interface GuidItem {
    label: string;
    value: string;
}

export const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

// Hàm sinh GUID ngẫu nhiên chuẩn phiên bản 4 (nếu dự án chưa có sẵn helper)
export function generateGuid(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Danh sách mẫu (nếu bạn cần dùng cho các dropdown/select list giống các file bên cạnh)
export const DefaultGuidList: GuidItem[] = [
    { label: 'Mặc định (Empty)', value: EMPTY_GUID },
];