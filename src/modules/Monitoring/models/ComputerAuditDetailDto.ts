// 1. Phân vùng ổ đĩa
export interface DiskPartitionDto {
    drive_letter?: string;
    driveLetter?: string;
    label?: string;
    total_gb?: number;
    totalGB?: number;
    used_gb?: number;
    usedGB?: number;
    free_gb?: number;
    freeGB?: number;
}

// 2. Chi tiết ổ đĩa lưu trữ
export interface DiskDto {
    drive_letter?: string;
    driveLetter?: string;
    model?: string;
    total_gb?: number | null;
    totalGb?: number | null;
    totalGB?: number | null;
    disk_type?: string | null;
    rawDiskType?: string | null;
    partitions?: DiskPartitionDto[];
}

// 3. Chi tiết màn hình hiển thị
export interface DisplayDto {
    deviceName: string;
    physicalSizeInch: string;
    name?: string;
    resolution?: string;
}

// 4. Chi tiết card mạng
export interface NetworkDto {
    name: string;
    macAddress: string;
    ipAddress?: string;
}

// 5. Chi tiết phần mềm cài đặt (từ endpoint detail_softwares/{id})
export interface SoftwareDto {
    name: string;
    version: string;
    installType?: "Admin" | "Non-Admin" | string;
}

// 6. DTO chính chi tiết kết quả Audit máy trạm theo Asset ID
export interface ComputerAuditDetailDto {
    asset_id: string;
    assetId?: string;
    networks: NetworkDto[];
    displays: DisplayDto[];
    disks: DiskDto[];
}
