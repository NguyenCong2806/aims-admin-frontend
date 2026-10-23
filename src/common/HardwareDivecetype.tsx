import React from "react";

export type HardwareDeviceId =
  | "pc"
  | "laptop"
  | "server"
  | "monitor"
  | "printer"
  | "network"
  | string;

export interface HardwareDeviceType {
  id: HardwareDeviceId;
  categoryName: string;
  label: string;
  sublabel: string;
  prefix: string;
  icon: React.ReactNode;
  color: string;
}

// Alias for typo compatibility
export type HardwareDiveceType = HardwareDeviceType;

// Danh sách 4 loại thiết bị phần cứng phổ biến nhất
export const HARDWARE_DEVICE_TYPES: HardwareDeviceType[] = [

  {
    id: "server",
    categoryName: "Máy chủ & Hạ tầng mạng (Server)",
    label: "Máy chủ (Server)",
    sublabel: "HPE, Dell PowerEdge, Rack",
    prefix: "HW-SRV",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/60",
  },
  {
    id: "monitor",
    categoryName: "Màn hình hiển thị (Monitor)",
    label: "Màn hình hiển thị",
    sublabel: "UltraSharp, 4K, 2K IPS",
    prefix: "HW-MON",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/60",
  },
  {
    id: "printer",
    categoryName: "Máy in & Thiết bị số hóa (Printer)",
    label: "Máy in & Scan",
    sublabel: "Laser đa chức năng",
    prefix: "HW-PRN",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    ),
    color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/60",
  },
  {
    id: "network",
    categoryName: "Thiết bị mạng & An ninh",
    label: "Thiết bị mạng / An ninh",
    sublabel: "Switch, Router, Camera AI",
    prefix: "HW-NET",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-900/60",
  },
];
