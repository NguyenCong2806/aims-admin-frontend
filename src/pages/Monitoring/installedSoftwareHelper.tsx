/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { usecomputerauditsofware } from "../../query/computeraudits/computerauditsQuery";
import type { SoftwareDto } from "../../models/ComputerAudit/SoftwareDto";

export type { SoftwareDto };

/**
 * Hook gọi API lấy danh sách phần mềm cài đặt theo id máy trạm
 * Endpoint: /api/computeraudits/detail_softwares/{id}
 */
export function useInstalledSoftware(id: string | null) {
  return usecomputerauditsofware(id);
}

/**
 * Phân loại thông tin và định dạng badge cho trường `installType` ("Admin" | "Non-Admin")
 */
export function getInstallTypeMeta(installType?: string): {
  label: string;
  shortLabel: string;
  badgeClass: string;
  icon: string;
  description: string;
} {
  const t = (installType || "").toLowerCase();
  const isAdmin = t.includes("admin") && !t.includes("non-admin");
  const isNonAdmin = t.includes("non-admin") || t.includes("user");

  if (isAdmin) {
    return {
      label: "Quản trị viên (Admin)",
      shortLabel: "Admin",
      badgeClass:
        "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60",
      icon: "🛡️",
      description: "Phần mềm cài đặt phạm vi toàn hệ thống (System-wide / Program Files)",
    };
  }

  if (isNonAdmin) {
    return {
      label: "Người dùng (Non-Admin)",
      shortLabel: "Non-Admin",
      badgeClass:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60",
      icon: "👤",
      description: "Phần mềm cài đặt cục bộ theo người dùng (Per-user / AppData)",
    };
  }

  return {
    label: installType || "Tiêu chuẩn",
    shortLabel: installType || "Standard",
    badgeClass:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
    icon: "📦",
    description: "Chưa phân loại phạm vi cài đặt",
  };
}

/**
 * Badge hiển thị quyền cài đặt (Admin / Non-Admin)
 */
export const InstallTypeBadge: React.FC<{ installType?: string }> = ({ installType }) => {
  const meta = getInstallTypeMeta(installType);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold font-mono border ${meta.badgeClass}`}
      title={meta.description}
    >
      <span>{meta.icon}</span>
      <span>{meta.shortLabel}</span>
    </span>
  );
};

/**
 * Tự động chọn icon trực quan dựa trên tên phần mềm (không bịa thêm metadata giả lập)
 */
export function detectSoftwareIcon(name: string): string {
  const n = (name || "").toLowerCase();
  if (
    n.includes("chrome") ||
    n.includes("firefox") ||
    n.includes("edge") ||
    n.includes("brave") ||
    n.includes("browser")
  ) {
    return "🌐";
  }
  if (
    n.includes("visual studio") ||
    n.includes("code") ||
    n.includes("git") ||
    n.includes("node") ||
    n.includes("docker") ||
    n.includes("python") ||
    n.includes("java") ||
    n.includes("postman") ||
    n.includes("antigravity") ||
    n.includes("termius")
  ) {
    return "💻";
  }
  if (
    n.includes("office") ||
    n.includes("word") ||
    n.includes("excel") ||
    n.includes("powerpoint") ||
    n.includes("pdf") ||
    n.includes("foxit")
  ) {
    return "📄";
  }
  if (
    n.includes("forti") ||
    n.includes("antivirus") ||
    n.includes("defender") ||
    n.includes("security") ||
    n.includes("kaspersky")
  ) {
    return "🛡️";
  }
  if (
    n.includes("teams") ||
    n.includes("slack") ||
    n.includes("telegram") ||
    n.includes("zalo") ||
    n.includes("discord") ||
    n.includes("zoom")
  ) {
    return "💬";
  }
  if (n.includes("figma") || n.includes("photoshop") || n.includes("canva") || n.includes("autocad")) {
    return "🎨";
  }
  if (n.includes("driver") || n.includes("nvidia") || n.includes("realtek") || n.includes("fresco")) {
    return "⚙️";
  }
  return "📦";
}

/**
 * Xuất danh mục kiểm kê phần mềm ra tệp CSV (UTF-8 có BOM)
 */
export function exportSoftwareToCsv(
  workstation: { hostName?: string; assetId?: string | null; userName?: string } | undefined,
  items: SoftwareDto[]
): void {
  const headers = ["STT", "Tên phần mềm", "Phiên bản", "Quyền cài đặt (Install Type)"];

  const rows = items.map((s, idx) => [
    `"${idx + 1}"`,
    `"${(s.name || "").replace(/"/g, '""')}"`,
    `"${(s.version || "N/A").replace(/"/g, '""')}"`,
    `"${(s.installType || "N/A").replace(/"/g, '""')}"`,
  ]);

  const host = workstation?.hostName || "Workstation";
  const asset = workstation?.assetId || "Chưa map";
  const user = workstation?.userName || "N/A";
  const csvContent =
    "\uFEFF" +
    `"DANH MỤC PHẦN MỀM CÀI ĐẶT TRÊN MÁY TRẠM: ${host} (Mã tài sản: ${asset} - Người dùng: ${user})"\n` +
    `"Thời điểm xuất file: ${new Date().toLocaleString("vi-VN")}"\n` +
    `"Tổng số lượng phần mềm: ${items.length}"\n\n` +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `danh_muc_phan_mem_${host}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
